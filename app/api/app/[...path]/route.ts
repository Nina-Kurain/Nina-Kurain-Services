import { env } from "cloudflare:workers";
import { z } from "zod";
import { apiAccount,clearSession,createSession,rateLimit,purgeUserData } from "@/lib/server/auth";
import { body,database,endpoint,HttpError,json,row,rows,run,sameOrigin,setting,sql } from "@/lib/server/db";
import { allowedPost,entitlement,feed,getPlans,storyFeed } from "@/lib/server/entitlements";
import { attachMedia,mediaUrl } from "@/lib/server/media";
import { hashPassword,verifyPassword } from "@/lib/server/password";
import { emailReady } from "@/lib/server/email";
import { billingReady, provider } from "@/lib/server/billing";
import { getUserReferralData } from "@/lib/server/referrals";
type Context={params:Promise<{path:string[]}>};
export async function GET(request:Request,ctx:Context){return endpoint(async()=>{const {path}=await ctx.params;const url=new URL(request.url);
  if(path[0]==="plans")return json({plans:await getPlans(),checkoutReady:billingReady(),testMode:env.PAYMENT_MODE!=="live"});
  const u=await apiAccount();
  if(path[0]==="me"){const {session_hash,...user}=u;return json({user,profile:await row("SELECT bio,username,avatar FROM profiles WHERE user_id=?",u.id),membership:await entitlement(u.id),emailReady:emailReady()});}
  if(path[0]==="referrals")return json(await getUserReferralData(u.id, env.APP_URL || url.origin));
  if(path[0]==="feed"){
    const started=performance.now(),offset=Math.min(100000,Math.max(0,Number(url.searchParams.get("offset"))||0)),kind=url.searchParams.get("kind")??"all";
    const [result,settings]=await Promise.all([
      feed(u,{offset:Math.floor(offset),search:(url.searchParams.get("q")??"").slice(0,160),kind:["image","video"].includes(kind)?kind:"all",saved:url.searchParams.get("saved")==="1",collection:["demo","exclusive"].includes(url.searchParams.get("collection")??"")?url.searchParams.get("collection") as "demo"|"exclusive":"all",planLevel:Math.min(3,Math.max(0,Number(url.searchParams.get("level"))||0))}),
      rows<{key:string;value:string}>("SELECT key,value FROM site_settings WHERE key IN ('creator_name','creator_bio','creator_avatar_asset_id','likes_enabled','creator_instagram','creator_youtube','creator_facebook','creator_x','creator_website','creator_phone','creator_whatsapp','ads_enabled','ads_adsense_client','ads_in_feed_slot','ads_banner_slot','ads_hide_for_paid','ads_custom_html')")
    ]);
    const config=Object.fromEntries(settings.map(s=>[s.key,s.value]));
    const [,avatar]=await Promise.all([attachMedia(u,result.posts),config.creator_avatar_asset_id?mediaUrl(u,config.creator_avatar_asset_id,"profile"):Promise.resolve("/seductive-1.jpeg")]);
    const response=json({
      ...result,
      plans:await getPlans(),
      creator:{
        name:config.creator_name??"Nina Kurain",
        bio:config.creator_bio??"A private collection of photographs, films and personal notes.",
        avatar,
        socials:{instagram:config.creator_instagram??"",youtube:config.creator_youtube??"",facebook:config.creator_facebook??"",x:config.creator_x??"",website:config.creator_website??""},
        contact:{phone:config.creator_phone??"",whatsapp:config.creator_whatsapp??""}
      },
      likesEnabled:config.likes_enabled!=="false",
      ads:{
        enabled:config.ads_enabled==="true",
        client:config.ads_adsense_client??"",
        inFeedSlot:config.ads_in_feed_slot??"",
        bannerSlot:config.ads_banner_slot??"",
        hideForPaid:config.ads_hide_for_paid!=="false",
        customHtml:config.ads_custom_html??""
      }
    });
    response.headers.set("Server-Timing",`feed;dur=${(performance.now()-started).toFixed(1)}`);
    return response;
  }
  if(path[0]==="stories"){
    const [result,settings]=await Promise.all([storyFeed(u),rows<{key:string;value:string}>("SELECT key,value FROM site_settings WHERE key IN ('creator_name','creator_avatar_asset_id')")]);
    const config=Object.fromEntries(settings.map(s=>[s.key,s.value]));await attachMedia(u,result.stories);const avatar=config.creator_avatar_asset_id?await mediaUrl(u,config.creator_avatar_asset_id,"profile"):"/seductive-1.jpeg";return json({...result,creator:{name:config.creator_name??"Nina Kurain",avatar}});
  }
  if(path[0]==="comments"){const p=await allowedPost(u,path[1]);if(!p)throw new HttpError(403,"Post unavailable for your membership.");const e=await entitlement(u.id);return json({comments:await rows("SELECT c.id,c.user_id,c.parent_id,c.body,c.pinned_at,c.created_at,u.display_name,u.role,(SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id=c.id) AS like_count,EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id=c.id AND cl.user_id=?) AS liked FROM comments c JOIN users u ON u.id=c.user_id WHERE c.post_id=? AND c.deleted_at IS NULL ORDER BY c.created_at LIMIT 150",u.id,p.id),viewerId:u.id,canComment:p.comment_level>=0&&e.level>=p.comment_level&&!u.comments_blocked});}
  if(path[0]==="notifications")return json({notifications:await rows("SELECT id,title,body,read_at,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100",u.id)});
  if(path[0]==="billing")return json({payments:await rows("SELECT id,amount,currency,status,paid_at,created_at,provider_payment_id FROM payments WHERE user_id=? ORDER BY created_at DESC LIMIT 200",u.id)});
  throw new HttpError(404,"Not found");
});}
export async function POST(request:Request,ctx:Context){return endpoint(async()=>{sameOrigin(request);const u=await apiAccount();const {path}=await ctx.params;const v=await body(request);await rateLimit(`writes:${u.id}`,120,60);
  if(path[0]==="profile"){const p=z.object({name:z.string().trim().min(2).max(100),phone:z.string().trim().max(25).optional().nullable().transform(v=>v?v.trim():null),bio:z.string().max(600),username:z.string().regex(/^[a-zA-Z0-9_]{0,30}$/)}).parse(v);await database().batch([sql("UPDATE users SET display_name=?,phone=?,updated_at=? WHERE id=?",p.name,p.phone??null,Date.now(),u.id),sql("INSERT INTO profiles(user_id,bio,username,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET bio=excluded.bio,username=excluded.username,updated_at=excluded.updated_at",u.id,p.bio,p.username,Date.now())]);return json({message:"Profile saved."});}
  if(path[0]==="password"){const p=z.object({currentPassword:z.string().max(128),password:z.string().min(12).max(128),confirmPassword:z.string()}).parse(v);if(p.password!==p.confirmPassword)throw new HttpError(400,"Passwords do not match.");await rateLimit(`change-password:${u.id}`,5,900);const stored=await row<{password_hash:string}>("SELECT password_hash FROM users WHERE id=?",u.id);if(!stored?.password_hash||!await verifyPassword(p.currentPassword,stored.password_hash))throw new HttpError(400,"Current password is incorrect.");await database().batch([sql("UPDATE users SET password_hash=?,updated_at=? WHERE id=?",await hashPassword(p.password),Date.now(),u.id),sql("DELETE FROM auth_sessions WHERE user_id=?",u.id)]);await createSession(u.id,false,false);return json({message:"Password changed. Other sessions have been signed out."});}
  if(path[0]==="delete-account"){
    const stored=await row<{password_hash:string|null}>("SELECT password_hash FROM users WHERE id=?",u.id);
    if(stored?.password_hash){
      const password=z.string().max(128).parse(v.password);
      if(!await verifyPassword(password,stored.password_hash))throw new HttpError(400,"Password is incorrect.");
    }
    const activeSubs=await rows<{id:string;provider:string;provider_subscription_id:string|null}>("SELECT id,provider,provider_subscription_id FROM subscriptions WHERE user_id=? AND provider='razorpay' AND status IN ('active','pending','grace_period','past_due')",u.id);
    for(const sub of activeSubs){
      if(sub.provider_subscription_id){
        try{
          await provider(`/subscriptions/${sub.provider_subscription_id}/cancel`,{cancel_at_cycle_end:0});
        }catch(e){
          try{
            await provider(`/subscriptions/${sub.provider_subscription_id}/cancel`,{cancel_at_cycle_end:1});
          }catch(err){
            console.warn("Could not cancel Razorpay subscription remotely on account deletion:",err);
          }
        }
      }
    }
    await purgeUserData(u.id);
    await clearSession();
    return json({redirect:"/"});
  }
  if(path[0]==="read-notifications"){await run("UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL",Date.now(),u.id);return json({ok:true});}
  if(path[0]==="feedback"){await rateLimit(`feedback:${u.id}`,5,3600);const input=z.object({category:z.enum(["experience","content","membership","technical","idea"]),rating:z.number().int().min(1).max(5),message:z.string().trim().min(10).max(2000),contactOkay:z.boolean().default(false)}).parse(v);const now=Date.now();await run("INSERT INTO feedback(id,user_id,category,rating,message,contact_okay,status,created_at,updated_at) VALUES(?,?,?,?,?,?,\'new\',?,?)",crypto.randomUUID(),u.id,input.category,input.rating,input.message,input.contactOkay?1:0,now,now);return json({message:"Thank you. Your feedback is now with the creator."});}
  if(["save","like","comment"].includes(path[0])){const postId=z.string().max(100).parse(v.postId);const p=await allowedPost(u,postId,u.role==="admin");if(!p)throw new HttpError(403,"Post unavailable for your membership.");
    if(path[0]==="comment"){const e=await entitlement(u.id);if(u.role!=="admin"&&(p.comment_level<0||e.level<p.comment_level||u.comments_blocked))throw new HttpError(403,"Comments are not enabled for this account on this post.");const text=z.string().trim().min(1).max(1500).parse(v.body),parentId=z.string().max(100).nullable().optional().parse(v.parentId??null);if(parentId){const parent=await row<{id:string;parent_id:string|null}>("SELECT id,parent_id FROM comments WHERE id=? AND post_id=? AND deleted_at IS NULL",parentId,p.id);if(!parent||parent.parent_id)throw new HttpError(400,"Reply to an available top-level comment.");}await run("INSERT INTO comments(id,user_id,post_id,parent_id,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",crypto.randomUUID(),u.id,p.id,parentId,text,Date.now(),Date.now());}
    else{const table=path[0]==="like"?"likes":"saved_posts";if(table==="likes"&&await setting("likes_enabled","true")!=="true")throw new HttpError(403,"Likes are disabled.");const selected=z.boolean().parse(v.selected);if(selected)await run(`INSERT OR IGNORE INTO ${table}(user_id,post_id,created_at) VALUES(?,?,?)`,u.id,p.id,Date.now());else await run(`DELETE FROM ${table} WHERE user_id=? AND post_id=?`,u.id,p.id);}
    return json({ok:true});
  }
  if(path[0]==="comment-like"){const id=z.string().max(100).parse(v.id),selected=z.boolean().parse(v.selected);const comment=await row<{post_id:string}>("SELECT post_id FROM comments WHERE id=? AND deleted_at IS NULL",id);if(!comment||!await allowedPost(u,comment.post_id,u.role==="admin"))throw new HttpError(403,"Comment unavailable.");if(selected)await run("INSERT OR IGNORE INTO comment_likes(user_id,comment_id,created_at) VALUES(?,?,?)",u.id,id,Date.now());else await run("DELETE FROM comment_likes WHERE user_id=? AND comment_id=?",u.id,id);return json({ok:true});}
  if(path[0]==="delete-comment"){const id=z.string().parse(v.id);if(!await row("SELECT id FROM comments WHERE id=? AND user_id=? AND deleted_at IS NULL",id,u.id))throw new HttpError(404,"Comment not found.");await run("UPDATE comments SET deleted_at=? WHERE id=? OR parent_id=?",Date.now(),id,id);return json({ok:true});}
  throw new HttpError(404,"Not found");
});}
