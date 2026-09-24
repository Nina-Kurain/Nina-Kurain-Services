import { env } from "cloudflare:workers";
import { database,json,rows,run,sql } from "@/lib/server/db";
import { emailReady,membershipEmail,safelySendTransactionalEmail } from "@/lib/server/email";
import { purgeAllDeletedAndExpiredUsers } from "@/lib/server/auth";

type MemberSubscription={id:string;user_id:string;email:string;display_name:string;plan_name:string;current_period_end:number|null;grace_ends_at:number|null};

export async function POST(request:Request){
  if(!env.CRON_SECRET||request.headers.get("authorization")!==`Bearer ${env.CRON_SECRET}`)return json({message:"Unauthorized."},401);
  const now=Date.now();
  const expiring=await rows<MemberSubscription>("SELECT s.id,s.user_id,s.current_period_end,s.grace_ends_at,u.email,u.display_name,mp.name AS plan_name FROM subscriptions s JOIN users u ON u.id=s.user_id JOIN membership_plans mp ON mp.id=s.plan_id WHERE s.status='grace_period' AND s.grace_ends_at<=?",now);
  if(expiring.length){await database().batch(expiring.flatMap(item=>[sql("UPDATE subscriptions SET status='expired',updated_at=? WHERE id=? AND status='grace_period' AND grace_ends_at<=?",now,item.id,now),sql("INSERT INTO notifications(id,user_id,title,body,created_at) VALUES(?,?,?,?,?)",crypto.randomUUID(),item.user_id,"Membership expired","Your payment grace period ended. Your account now has Free access and can be upgraded again at any time.",now)]));}
  const reminderEnd=now+72*3600000;
  const renewals=await rows<MemberSubscription>("SELECT s.id,s.user_id,s.current_period_end,s.grace_ends_at,u.email,u.display_name,mp.name AS plan_name FROM subscriptions s JOIN users u ON u.id=s.user_id JOIN membership_plans mp ON mp.id=s.plan_id WHERE s.provider='razorpay' AND s.status='active' AND s.cancel_at_period_end=0 AND s.current_period_end>? AND s.current_period_end<=?",now,reminderEnd);
  if(emailReady()){
    for(const item of expiring){const content=membershipEmail("membership_expired",item.display_name,item.plan_name);await safelySendTransactionalEmail({userId:item.user_id,email:item.email,kind:"membership_expired",idempotencyKey:`expired:${item.id}:${item.grace_ends_at}`,subject:content.subject,text:content.text});}
    for(const item of renewals){const renewalDate=item.current_period_end?new Date(item.current_period_end).toLocaleDateString("en-IN",{dateStyle:"medium"}):"soon",content=membershipEmail("renewal_reminder",item.display_name,item.plan_name,`Expected renewal: ${renewalDate}`);await safelySendTransactionalEmail({userId:item.user_id,email:item.email,kind:"renewal_reminder",idempotencyKey:`renewal:${item.id}:${item.current_period_end}`,subject:content.subject,text:content.text});}
  }
  const purgeResult = await purgeAllDeletedAndExpiredUsers();
  return json({ok:true,expired:expiring.length,renewalReminders:renewals.length,...purgeResult});
}
