import { env } from "cloudflare:workers";
import { token,digest } from "./password";
import { row,run,HttpError } from "./db";

export type TransactionalEmailKind="welcome"|"verify"|"reset"|"membership_active"|"payment_failed"|"membership_expired"|"membership_cancelled"|"membership_updated"|"renewal_reminder"|"test";
type SendInput={userId?:string|null;email:string;kind:TransactionalEmailKind;subject:string;text:string;idempotencyKey:string};
type ResendReply={id?:string;message?:string;name?:string};

export function emailReady(){return Boolean(env.MAIL_API_KEY&&env.MAIL_FROM&&env.APP_URL);}
const appUrl=()=>env.APP_URL?.replace(/\/$/,"")??"";
const footer=()=>`\n\n— Nina Kurain\nYour private creator membership\n${appUrl()}`;

export async function sendTransactionalEmail(input:SendInput){
  if(!emailReady())throw new HttpError(503,"Email delivery is not configured yet. Add the Resend API key and verified sender first.");
  const now=Date.now(),deliveryId=crypto.randomUUID();
  const claimed=await row<{id:string}>("INSERT INTO email_deliveries(id,user_id,email,kind,idempotency_key,status,created_at,updated_at) VALUES(?,?,?,?,?,'pending',?,?) ON CONFLICT(idempotency_key) DO UPDATE SET status='pending',error=NULL,updated_at=excluded.updated_at WHERE email_deliveries.status='failed' RETURNING id",deliveryId,input.userId??null,input.email,input.kind,input.idempotencyKey,now,now);
  if(!claimed)return {skipped:true};
  try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.MAIL_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":input.idempotencyKey.slice(0,256)},body:JSON.stringify({from:env.MAIL_FROM,to:[input.email],subject:input.subject,text:input.text+footer()})});
    const result=await response.json() as ResendReply;
    if(!response.ok||!result.id)throw new Error(result.message||result.name||`Email provider returned ${response.status}`);
    await run("UPDATE email_deliveries SET status='sent',provider_id=?,updated_at=? WHERE id=?",result.id,Date.now(),claimed.id);
    return {sent:true,id:result.id};
  }catch(error){
    const message=error instanceof Error?error.message.slice(0,500):"Email delivery failed";
    await run("UPDATE email_deliveries SET status='failed',error=?,updated_at=? WHERE id=?",message,Date.now(),claimed.id);
    throw new HttpError(502,"Email could not be delivered. Please try again later.");
  }
}

export async function safelySendTransactionalEmail(input:SendInput){try{return await sendTransactionalEmail(input);}catch(error){console.error("Transactional email failed",{kind:input.kind,userId:input.userId,error});return {failed:true};}}

export async function sendAccountEmail(userId:string,email:string,kind:"reset"|"verify"){
  if(!emailReady())throw new HttpError(503,"Email delivery is not configured yet. Please contact the creator.");
  const value=token(),hashed=await digest(value),expiresAt=Date.now()+(kind==="reset"?3600000:86400000);
  await run("INSERT INTO auth_tokens(token_hash,user_id,kind,expires_at) VALUES(?,?,?,?)",hashed,userId,kind,expiresAt);
  const path=kind==="reset"?"reset-password":"verify-email",link=`${appUrl()}/${path}?token=${value}`;
  try{return await sendTransactionalEmail({userId,email,kind,idempotencyKey:`account:${kind}:${hashed}`,subject:kind==="reset"?"Reset your Nina Kurain Club password":"Verify your Nina Kurain Club email",text:`${kind==="reset"?"Reset your password":"Verify your email address"} using this secure one-time link:\n\n${link}\n\nThis link expires ${kind==="reset"?"in one hour":"in 24 hours"}. If you did not request this, you can ignore this email.`});}
  catch(error){await run("DELETE FROM auth_tokens WHERE token_hash=?",hashed);throw error;}
}

export function membershipEmail(kind:Exclude<TransactionalEmailKind,"verify"|"reset"|"welcome"|"test">,name:string,planName:string,details=""){
  const first=name.trim().split(/\s+/)[0]||"there",account=`${appUrl()}/account/membership`;
  const copy={
    membership_active:{subject:`Your ${planName} access is active`,text:`Hi ${first},\n\nYour verified payment is complete and ${planName} access is now active. Your eligible private posts and films are ready.\n\nOpen your membership: ${account}`},
    payment_failed:{subject:"Payment pending — your access is protected for 48 hours",text:`Hi ${first},\n\nYour latest membership payment was not completed. Your paid access remains available during the 48-hour grace period. Please renew before the grace period ends to avoid falling back to Free access.\n\nRenew securely: ${account}${details?`\n\n${details}`:""}`},
    membership_expired:{subject:"Your paid Nina Kurain Club access has ended",text:`Hi ${first},\n\nThe payment grace period has ended, so your account has returned to Free access. Your account and saved profile remain available, and you can rejoin whenever you are ready.\n\nView memberships: ${appUrl()}/memberships`},
    membership_cancelled:{subject:"Your membership cancellation is scheduled",text:`Hi ${first},\n\nYour recurring ${planName} membership has been cancelled. Access continues through the end of the paid period shown in your account.\n\nReview membership: ${account}`},
    membership_updated:{subject:"Your Nina Kurain Club membership was updated",text:`Hi ${first},\n\nNina updated your membership access to ${planName}. You can review the current status and access period in your account.\n\nOpen your account: ${account}${details?`\n\n${details}`:""}`},
    renewal_reminder:{subject:`Your ${planName} membership renews soon`,text:`Hi ${first},\n\nYour monthly ${planName} membership is approaching its renewal date. No action is needed if your payment method is current.\n\nManage membership: ${account}${details?`\n\n${details}`:""}`}
  } as const;
  return copy[kind];
}
