import { env } from "cloudflare:workers";
import { HttpError } from "./db";
export function billingStatus(){
 const mode=env.PAYMENT_MODE==="live"?"live":"test",keyMode=env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")?"live":env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")?"test":"unknown",issues:string[]=[];
 if(!env.RAZORPAY_KEY_ID)issues.push("Razorpay Key ID is missing.");
 if(!env.RAZORPAY_KEY_SECRET)issues.push("Razorpay Key Secret is missing.");
 if(!env.RAZORPAY_WEBHOOK_SECRET)issues.push("Razorpay Webhook Secret is missing.");
 if(env.RAZORPAY_KEY_ID&&keyMode!==mode)issues.push(`PAYMENT_MODE is ${mode}, but the configured Razorpay key is ${keyMode}.`);
 if(!env.APP_URL||(!env.APP_URL.startsWith("https://")&&!env.APP_URL.includes("localhost")&&!env.APP_URL.includes("127.0.0.1")))issues.push("APP_URL must be the production HTTPS origin.");
 return {ready:issues.length===0,mode,keyMode,issues,webhookUrl:env.APP_URL?`${env.APP_URL.replace(/\/$/,"")}/api/webhooks/razorpay`:null,keyId:env.RAZORPAY_KEY_ID||null};
}
export function billingReady(){return billingStatus().ready;}
export async function provider(path:string,payload?:unknown,method?:string){const status=billingStatus();if(!status.ready)throw new HttpError(503,`Payment setup is not complete. ${status.issues[0]??"No payment has been taken."}`);const r=await fetch(`https://api.razorpay.com/v1${path}`,{method:method??(payload?"POST":"GET"),headers:{Authorization:`Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,"Content-Type":"application/json"},...(payload?{body:JSON.stringify(payload)}:{})});const data=await r.json() as any;if(!r.ok){console.error("Razorpay API request failed",{path,status:r.status,reason:data?.error?.description??data?.error?.reason});throw new HttpError(502,data?.error?.description||"The payment provider could not complete this request. Please retry or contact the creator.");}return data;}
export function checkoutUrl(value:unknown){if(typeof value!=="string")throw new HttpError(502,"Checkout link unavailable.");const u=new URL(value);if(u.protocol!=="https:"||!(u.hostname==="rzp.io"||u.hostname.endsWith(".razorpay.com")||u.hostname==="razorpay.com"))throw new HttpError(502,"Invalid checkout destination.");return value;}
export async function verifyWebhook(body:string,signature:string,secret:string){if(!/^[a-fA-F0-9]{64}$/.test(signature))return false;const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);return crypto.subtle.verify("HMAC",key,Buffer.from(signature,"hex"),new TextEncoder().encode(body));}
