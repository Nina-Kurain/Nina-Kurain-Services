import { env } from "cloudflare:workers";
import { database,endpoint,HttpError,json,row,run,sql } from "@/lib/server/db";
import { provider,verifyWebhook } from "@/lib/server/billing";
import { digest } from "@/lib/server/password";
import { emailReady,membershipEmail,safelySendTransactionalEmail,type TransactionalEmailKind } from "@/lib/server/email";
import type { Subscription } from "@/lib/server/entitlements";
import { processReferralConversion } from "@/lib/server/referrals";
export async function POST(request:Request){return endpoint(async()=>{
 const raw=await request.text();if(raw.length>1048576)throw new HttpError(413,"Webhook too large");
 if(!env.RAZORPAY_WEBHOOK_SECRET||!await verifyWebhook(raw,request.headers.get("x-razorpay-signature")??"",env.RAZORPAY_WEBHOOK_SECRET))throw new HttpError(401,"Invalid webhook signature.");
 let event:any;try{event=JSON.parse(raw);}catch{throw new HttpError(400,"Invalid webhook payload.");}
 const eventId=request.headers.get("x-razorpay-event-id")??await digest(raw),now=Date.now();
 const processed=await row<{status:string}>("SELECT status FROM webhook_events WHERE provider='razorpay' AND event_id=?",eventId);
 if(processed?.status==="processed")return json({ok:true,duplicate:true});
 await run("INSERT OR IGNORE INTO webhook_events(id,provider,event_id,event_type,status,received_at) VALUES(?,'razorpay',?,?,'received',?)",crypto.randomUUID(),eventId,String(event.event),now);
 try{
 const entity=event.payload?.subscription?.entity;
 let remoteId=entity?.id??event.payload?.payment?.entity?.subscription_id;
 if(!remoteId){await run("UPDATE webhook_events SET status='processed',processed_at=? WHERE provider='razorpay' AND event_id=?",now,eventId);return json({ok:true,ignored:true});}
 const local=await row<Subscription&{pending_plan_id:string|null;created_at:number}>("SELECT * FROM subscriptions WHERE provider='razorpay' AND provider_subscription_id=?",remoteId);
 if(!local)throw new HttpError(409,"Unknown subscription. Retry after checkout registration.");
 const remote=await provider(`/subscriptions/${remoteId}`);
 if(remote.id!==local.provider_subscription_id)throw new HttpError(400,"Subscription mismatch.");
 const eventAt=Number(event.created_at??0)*1000;
 if(eventAt&&eventAt<local.last_event_at){await run("UPDATE webhook_events SET status='processed',processed_at=? WHERE provider='razorpay' AND event_id=?",now,eventId);return json({ok:true,stale:true});}
 const ops=[];let emailKind:TransactionalEmailKind|null=null,activatedPlanId=local.plan_id;
 if(event.event==="subscription.charged"){
  const payment=event.payload?.payment?.entity;
  if(!payment?.id)throw new HttpError(400,"Payment information missing.");
  const verified=await provider(`/payments/${payment.id}`);
  const providerPlan=await provider(`/plans/${remote.plan_id}`);
  if(verified.status!=="captured"||verified.currency!=="INR"||verified.amount!==providerPlan.item?.amount)throw new HttpError(400,"Payment verification mismatch.");
  if(verified.subscription_id&&verified.subscription_id!==remoteId)throw new HttpError(400,"Payment belongs to a different subscription.");
  let activatedPlan=local.plan_id;
  if(local.pending_plan_id){const target=await row<{provider_plan_id:string}>("SELECT provider_plan_id FROM membership_plans WHERE id=?",local.pending_plan_id);if(target?.provider_plan_id===remote.plan_id)activatedPlan=local.pending_plan_id;}
  const start=Number(remote.current_start)*1000,end=Number(remote.current_end)*1000;
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw new HttpError(400,"Invalid billing period.");
  if(!["active","authenticated","cancelled","completed"].includes(remote.status))throw new HttpError(409,"Provider subscription is not confirmed.");
  ops.push(sql("INSERT OR IGNORE INTO payments(id,user_id,subscription_id,provider_payment_id,amount,currency,status,paid_at,created_at) VALUES(?,?,?,?,?,'INR','paid',?,?)",crypto.randomUUID(),local.user_id,local.id,verified.id,verified.amount,Number(verified.created_at)*1000||now,now));
  ops.push(sql("UPDATE subscriptions SET status=?,current_period_start=?,current_period_end=?,next_billing_date=?,grace_started_at=NULL,grace_ends_at=NULL,last_payment_status='paid',last_payment_date=?,last_event_at=?,updated_at=? WHERE id=? AND last_event_at<=?",remote.status==="cancelled"?"cancelled":"active",start,end,end,now,eventAt,now,local.id,eventAt));
  ops.push(sql("UPDATE subscriptions SET plan_id=?,pending_plan_id=CASE WHEN pending_plan_id=? THEN NULL ELSE pending_plan_id END WHERE id=?",activatedPlan,activatedPlan,local.id));
  ops.push(sql("INSERT INTO memberships(user_id,subscription_id,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET subscription_id=excluded.subscription_id,updated_at=excluded.updated_at WHERE memberships.subscription_id=excluded.subscription_id OR memberships.subscription_id IS NULL OR EXISTS(SELECT 1 FROM subscriptions old WHERE old.id=memberships.subscription_id AND old.created_at<=?)",local.user_id,local.id,now,local.created_at));
  emailKind="membership_active";activatedPlanId=activatedPlan;
 }else if(["subscription.pending","subscription.halted","payment.failed"].includes(event.event)&&["pending","halted"].includes(remote.status)){
  if(local.current_period_end){const grace=local.current_period_end+48*3600000;ops.push(sql("UPDATE subscriptions SET status=?,grace_started_at=?,grace_ends_at=?,last_payment_status='failed',last_event_at=?,updated_at=? WHERE id=? AND last_event_at<=?",grace>now?"grace_period":"expired",local.current_period_end,grace,eventAt,now,local.id,eventAt));}
  const p=event.payload?.payment?.entity;
  if(p?.id)ops.push(sql("INSERT OR IGNORE INTO payments(id,user_id,subscription_id,provider_payment_id,amount,currency,status,created_at) VALUES(?,?,?,?,?,'INR','failed',?)",crypto.randomUUID(),local.user_id,local.id,p.id,Number(p.amount)||0,now));
  emailKind="payment_failed";
}else if(["subscription.cancelled","subscription.completed"].includes(event.event)&&["cancelled","completed"].includes(remote.status)){
  ops.push(sql("UPDATE subscriptions SET status=?,cancel_at_period_end=1,last_event_at=?,updated_at=? WHERE id=? AND last_event_at<=?",remote.status==="cancelled"?"cancelled":"expired",eventAt,now,local.id,eventAt));
  emailKind=remote.status==="cancelled"?"membership_cancelled":"membership_expired";
 }
 if(ops.length)ops.push(sql("INSERT INTO notifications(id,user_id,title,body,created_at) SELECT ?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM webhook_events WHERE provider='razorpay' AND event_id=? AND status='processed')",crypto.randomUUID(),local.user_id,"Membership update","Your payment provider updated your subscription. Review your account for current access and billing details.",now,eventId));
 ops.push(sql("UPDATE webhook_events SET status='processed',error=NULL,processed_at=? WHERE provider='razorpay' AND event_id=?",now,eventId));
 await database().batch(ops);
 if(event.event==="subscription.charged"){
  try{await processReferralConversion(local.user_id);}catch(refErr){console.error("Referral conversion error:",refErr);}
 }
 if(emailKind&&emailReady()){
  const recipient=await row<{email:string;display_name:string;plan_name:string}>("SELECT u.email,u.display_name,mp.name AS plan_name FROM users u JOIN membership_plans mp ON mp.id=? WHERE u.id=?",activatedPlanId,local.user_id);
  if(recipient){const content=membershipEmail(emailKind as "membership_active"|"payment_failed"|"membership_expired"|"membership_cancelled",recipient.display_name,recipient.plan_name);await safelySendTransactionalEmail({userId:local.user_id,email:recipient.email,kind:emailKind,idempotencyKey:`razorpay:${eventId}:${emailKind}`,subject:content.subject,text:content.text});}
 }
 return json({ok:true});
 }catch(e){await run("UPDATE webhook_events SET status='failed',error=?,processed_at=? WHERE provider='razorpay' AND event_id=?",e instanceof Error?e.message.slice(0,500):"Processing error",now,eventId);throw e;}
});}
