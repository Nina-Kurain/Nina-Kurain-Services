import { apiAccount,rateLimit } from "@/lib/server/auth";
import { body,database,endpoint,HttpError,json,row,run,sameOrigin,sql } from "@/lib/server/db";
import { type Plan,entitlement } from "@/lib/server/entitlements";
import { billingReady,provider,checkoutUrl } from "@/lib/server/billing";
import { env } from "cloudflare:workers";
export async function POST(request:Request){return endpoint(async()=>{
 sameOrigin(request);const u=await apiAccount();const v=await body(request);await rateLimit(`checkout:${u.id}`,5,300);
 if(!billingReady())throw new HttpError(503,"Provider test credentials are not configured. No payment has been taken.");
 const plan=await row<Plan>("SELECT * FROM membership_plans WHERE id=? AND active=1 AND level>0",String(v.plan));
 if(!plan)throw new HttpError(400,"Choose an available membership.");
 const current=await entitlement(u.id);
 const changing=current.subscription?.provider==="razorpay"&&current.level>0;
 if(changing&&current.subscription!.cancel_at_period_end)throw new HttpError(409,"Your current membership is ending. Choose a new plan after its paid period ends.");
 if(changing&&current.subscription!.plan_id===plan.id)throw new HttpError(409,"You already have this membership. Manage it from your account.");
 const now=Date.now();
 const pending=await row<{id:string;checkout_url:string|null;provider_subscription_id:string|null;created_at:number;plan_id:string}>("SELECT id,checkout_url,provider_subscription_id,created_at,plan_id FROM subscriptions WHERE user_id=? AND provider='razorpay' AND status='pending' ORDER BY created_at DESC LIMIT 1",u.id);
 if(pending){
   if(pending.plan_id===plan.id&&pending.checkout_url&&now-pending.created_at<3600000){
     return json({checkoutUrl:checkoutUrl(pending.checkout_url),subscriptionId:pending.provider_subscription_id,keyId:env.RAZORPAY_KEY_ID});
   }
   await run("UPDATE subscriptions SET status='cancelled',updated_at=? WHERE id=?",now,pending.id);
 }
 const lockKey=`checkout-lock:${u.id}`;
 const locked=await row<{key:string}>("INSERT INTO auth_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET expires_at=excluded.expires_at WHERE expires_at<? RETURNING key",lockKey,now+60000,now);
 if(!locked)throw new HttpError(409,"Checkout is already being prepared. Please wait.");
 try{
 let providerPlan=plan.provider_plan_id;
 if(!providerPlan){const created=await provider("/plans",{period:"monthly",interval:1,item:{name:plan.name,amount:plan.price*100,currency:"INR",description:plan.description}});if(!created.id)throw new HttpError(502,"Provider plan could not be created.");providerPlan=created.id;await run("UPDATE membership_plans SET provider_plan_id=? WHERE id=? AND price=?",providerPlan,plan.id,plan.price);}
 else{const remote=await provider(`/plans/${providerPlan}`);if(remote.item?.amount!==plan.price*100||remote.item?.currency!=="INR")throw new HttpError(409,"Provider plan pricing does not match. The creator must reconnect this membership.");}
 if(changing){await provider(`/subscriptions/${current.subscription!.provider_subscription_id}`,{plan_id:providerPlan,schedule_change_at:"cycle_end"},"PATCH");await run("UPDATE subscriptions SET pending_plan_id=?,updated_at=? WHERE id=?",plan.id,Date.now(),current.subscription!.id);return json({message:"Plan change scheduled for your next billing cycle. Your access changes after verified payment for the new plan.",pending:true});}
 const id=crypto.randomUUID();await run("INSERT INTO subscriptions(id,user_id,plan_id,provider,status,created_at,updated_at) VALUES(?,?,?,'razorpay','pending',?,?)",id,u.id,plan.id,now,now);
 let remote;try{remote=await provider("/subscriptions",{plan_id:providerPlan,total_count:120,quantity:1,customer_notify:1,notes:{user_id:u.id,local_subscription_id:id}});}catch(e){await run("UPDATE subscriptions SET status='creation_failed',updated_at=? WHERE id=?",Date.now(),id);throw e;}
 if(!remote.id)throw new HttpError(502,"Provider subscription could not be created.");
 const url=checkoutUrl(remote.short_url);
 await run("UPDATE subscriptions SET provider_subscription_id=?,checkout_url=?,updated_at=? WHERE id=?",remote.id,url,Date.now(),id);
 return json({checkoutUrl:url,subscriptionId:remote.id,keyId:env.RAZORPAY_KEY_ID});
 }finally{await run("DELETE FROM auth_limits WHERE key=?",lockKey);}
});}
