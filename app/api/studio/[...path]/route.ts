import { env } from "cloudflare:workers";
import { z } from "zod";
import { apiAccount,rateLimit } from "@/lib/server/auth";
import { audit,body,database,endpoint,HttpError,json,row,rows,run,sameOrigin,sql } from "@/lib/server/db";
import { getPlans,initializePlans,type ContentPost } from "@/lib/server/entitlements";
import { attachMedia,mediaUrl } from "@/lib/server/media";
import { detectMedia,MAX_UPLOAD_BYTES } from "@/lib/media-files";
import { emailReady,membershipEmail,safelySendTransactionalEmail,sendTransactionalEmail } from "@/lib/server/email";
import { billingStatus, provider } from "@/lib/server/billing";
import { deleteDriveFile,disconnectDrive,driveConnection,googleDriveConfigured,uploadToDrive,getDriveStorageQuota,emptyDriveTrash } from "@/lib/server/google-drive";
import { getDatabaseStorageStats,cleanDatabaseStorage } from "@/lib/server/storage";
type Context={params:Promise<{path:string[]}>};
const postInput=z.object({id:z.string().max(100).optional(),title:z.string().trim().min(1).max(160),caption:z.string().max(5000),status:z.enum(["draft","published","scheduled","archived"]),published_at:z.number().finite(),access_mode:z.enum(["free","level","specific"]),minimum_level:z.number().int().min(0).max(3),comment_level:z.number().int().min(-1).max(3),plan_ids:z.array(z.string()).max(4),media_ids:z.array(z.string()).min(1).max(20),cover_id:z.string()});
const storyInput=z.object({title:z.string().trim().min(1).max(80),caption:z.string().max(1000),access_mode:z.enum(["free","level","specific"]),minimum_level:z.number().int().min(0).max(3),plan_ids:z.array(z.string()).max(4),media_id:z.string(),highlight:z.boolean()});
const optionalHttpsUrl=z.string().trim().max(300).refine(value=>{if(!value)return true;try{return new URL(value).protocol==="https:";}catch{return false;}},{message:"Use a complete https:// link."});
export async function GET(request:Request,ctx:Context){return endpoint(async()=>{const u=await apiAccount(true),{path}=await ctx.params,url=new URL(request.url);
  if(path[0]==="overview"){
    const users=await row("SELECT COUNT(*) AS total_users,SUM(verified=0) AS unverified_users FROM users WHERE role='member' AND active=1");
    const now=Date.now();const members=await rows("SELECT mp.id,mp.name,COUNT(u.id) AS count FROM users u LEFT JOIN memberships m ON m.user_id=u.id LEFT JOIN subscriptions s ON s.id=m.subscription_id JOIN membership_plans mp ON mp.id=CASE WHEN (s.status IN ('active','cancelled','cancel_at_period_end') AND s.current_period_end>?) OR (s.status IN ('grace_period','past_due') AND s.grace_ends_at>?) THEN s.plan_id ELSE 'free' END WHERE u.role='member' AND u.active=1 GROUP BY mp.id ORDER BY mp.level",now,now);
    const stats=await row("SELECT COUNT(*) AS total_posts,SUM(status='draft') AS draft_posts,SUM(status IN ('published','scheduled') AND published_at<=?) AS published_posts FROM posts WHERE is_story=0",now);
    const revenue=await row("SELECT COALESCE(SUM(amount),0) AS revenue FROM payments WHERE status='paid' AND paid_at>=?",new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime());
    const subscriptions=await row("SELECT SUM(status='active' AND current_period_end>?) AS active_memberships,SUM(status='grace_period' AND grace_ends_at>?) AS grace_memberships,SUM(status='expired' OR (current_period_end<=? AND (grace_ends_at IS NULL OR grace_ends_at<=?))) AS expired_memberships FROM subscriptions s JOIN memberships m ON m.subscription_id=s.id",now,now,now,now);
    return json({users,members,stats,revenue,subscriptions,activity:await rows("SELECT action,entity_id,created_at FROM admin_activity ORDER BY created_at DESC LIMIT 12"),emailReady:emailReady(),billing:billingStatus(),testAccounts:false});
  }
  if(path[0]==="posts"){const list=await rows<ContentPost>("SELECT * FROM posts WHERE is_story=0 ORDER BY created_at DESC LIMIT 500");for(const p of list)p.plan_ids=(await rows<{plan_id:string}>("SELECT plan_id FROM post_access WHERE post_id=?",p.id)).map(x=>x.plan_id);await attachMedia(u,list,true);return json({posts:list});}
  if(path[0]==="profile"){
    const config=Object.fromEntries((await rows<{key:string;value:string}>("SELECT key,value FROM site_settings WHERE key IN ('creator_name','creator_bio','creator_avatar_asset_id','creator_instagram','creator_youtube','creator_facebook','creator_x','creator_website')")).map(x=>[x.key,x.value]));
    const list=await rows<ContentPost>("SELECT p.*,EXISTS(SELECT 1 FROM likes WHERE post_id=p.id AND user_id=?) AS liked,EXISTS(SELECT 1 FROM saved_posts WHERE post_id=p.id AND user_id=?) AS saved,(SELECT COUNT(*) FROM likes WHERE post_id=p.id) AS like_count,(SELECT COUNT(*) FROM comments WHERE post_id=p.id AND deleted_at IS NULL) AS comment_count FROM posts p WHERE is_story=0 AND status IN ('published','scheduled') AND published_at<=? ORDER BY published_at DESC, id DESC LIMIT 500",u.id,u.id,Date.now());
    for(const p of list)p.plan_ids=(await rows<{plan_id:string}>("SELECT plan_id FROM post_access WHERE post_id=?",p.id)).map(x=>x.plan_id);
    const avatar=config.creator_avatar_asset_id?await mediaUrl(u,config.creator_avatar_asset_id,"profile",true):"/seductive-1.jpeg";
    await attachMedia(u,list,true);
    return json({creator:{name:config.creator_name??"Nina Kurain",bio:config.creator_bio??"A private collection of photographs, films and personal notes.",avatar,socials:{instagram:config.creator_instagram??"",youtube:config.creator_youtube??"",facebook:config.creator_facebook??"",x:config.creator_x??"",website:config.creator_website??""}},posts:list,plans:await getPlans(true)});
  }
  if(path[0]==="stories"){const list=await rows<ContentPost>("SELECT * FROM posts WHERE is_story=1 ORDER BY is_highlight DESC,created_at DESC LIMIT 500");for(const p of list)p.plan_ids=(await rows<{plan_id:string}>("SELECT plan_id FROM post_access WHERE post_id=?",p.id)).map(x=>x.plan_id);await attachMedia(u,list,true);return json({stories:list,plans:await getPlans(true)});}
  if(path[0]==="media"){const assets=await rows<{id:string;name:string;mime:string;bytes:number;created_at:number}>("SELECT id,name,mime,bytes,created_at FROM media_assets ORDER BY created_at DESC LIMIT 500");return json({media:await Promise.all(assets.map(async a=>({...a,url:await mediaUrl(u,a.id,"",true)})))});}
  if(path[0]==="plans")return json({plans:await getPlans(true)});
  if(path[0]==="members"){const list=await rows("SELECT u.id,u.email,u.display_name,u.phone,u.verified,u.active,u.comments_blocked,u.created_at,s.id AS subscription_id,s.plan_id,s.provider,s.status,s.current_period_end,s.grace_ends_at,s.cancel_at_period_end FROM users u LEFT JOIN memberships m ON m.user_id=u.id LEFT JOIN subscriptions s ON s.id=m.subscription_id WHERE u.role='member' ORDER BY u.created_at DESC LIMIT 1000");return json({members:list});}
  if(path[0]==="member"){const id=path[1];return json({user:await row("SELECT id,email,display_name,phone,verified,active,comments_blocked,created_at FROM users WHERE id=? AND role='member'",id),subscriptions:await rows("SELECT * FROM subscriptions WHERE user_id=? ORDER BY created_at DESC",id),payments:await rows("SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC",id),activity:await rows("SELECT action,detail,created_at FROM admin_activity WHERE entity_id=? ORDER BY created_at DESC LIMIT 100",id)});}
  if(path[0]==="payments")return json({payments:await rows("SELECT p.*,u.display_name,u.email FROM payments p LEFT JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC LIMIT 1000")});
  if(path[0]==="settings"){
    const drive=await driveConnection(),counts=await row<{drive_assets:number;legacy_assets:number}>("SELECT SUM(storage_key LIKE 'gdrive:%') AS drive_assets,SUM(storage_key NOT LIKE 'gdrive:%') AS legacy_assets FROM media_assets");
    const emailStats=await row("SELECT SUM(status='sent') AS sent,SUM(status='failed') AS failed FROM email_deliveries");
    const [driveQuota,dbStorage]=await Promise.all([
      getDriveStorageQuota().catch(()=>null),
      getDatabaseStorageStats().catch(()=>null)
    ]);
    return json({
      settings:await rows("SELECT key,value FROM site_settings"),
      emailReady:emailReady(),
      emailStats,
      billing:billingStatus(),
      storage:dbStorage,
      drive:{
        configured:googleDriveConfigured(),
        connected:Boolean(drive),
        accountEmail:drive?.account_email??null,
        displayName:drive?.display_name??null,
        driveAssets:counts?.drive_assets??0,
        legacyAssets:counts?.legacy_assets??0,
        quota:driveQuota
      }
    });
  }
  if(path[0]==="comments"){const postId=path[1];return json({viewerId:u.id,canComment:true,comments:postId?await rows("SELECT c.id,c.body,c.created_at,c.post_id,c.user_id,c.parent_id,c.pinned_at,u.display_name,u.role,p.title,(SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id=c.id) AS like_count,EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id=c.id AND cl.user_id=?) AS liked FROM comments c JOIN users u ON u.id=c.user_id JOIN posts p ON p.id=c.post_id WHERE c.post_id=? AND c.deleted_at IS NULL ORDER BY c.created_at LIMIT 150",u.id,postId):await rows("SELECT c.id,c.body,c.created_at,c.post_id,c.user_id,c.parent_id,c.pinned_at,u.display_name,u.role,p.title,(SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id=c.id) AS like_count,EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id=c.id AND cl.user_id=?) AS liked FROM comments c JOIN users u ON u.id=c.user_id JOIN posts p ON p.id=c.post_id WHERE c.deleted_at IS NULL ORDER BY c.created_at DESC LIMIT 500",u.id)});}
  if(path[0]==="test-payment"){
    const id=url.searchParams.get("id");
    if(!id){
      const list=await rows("SELECT * FROM payments WHERE amount=100 ORDER BY created_at DESC LIMIT 10");
      return json({payments:list});
    }
    let remote:any=null;
    if(id.startsWith("plink_"))remote=await provider(`/payment_links/${id}`);
    else if(id.startsWith("order_"))remote=await provider(`/orders/${id}`);
    else if(id.startsWith("pay_"))remote=await provider(`/payments/${id}`);
    else throw new HttpError(400,"Invalid payment reference.");
    const isPaid=remote.status==="paid"||Number(remote.amount_paid)>=100||remote.status==="captured";
    if(isPaid){
      await run("UPDATE payments SET status='paid',paid_at=COALESCE(paid_at,?) WHERE provider_payment_id=? OR id=?",Date.now(),id,id);
    }
    return json({
      id,
      status:isPaid?"paid":(remote.status||"pending"),
      amount:remote.amount?remote.amount/100:1,
      amountPaid:remote.amount_paid?remote.amount_paid/100:(isPaid?1:0),
      shortUrl:remote.short_url,
      payments:remote.payments||[],
      raw:remote
    });
  }
  if(path[0]==="custom-payment"){
    const id=url.searchParams.get("id");
    if(!id){
      const list=await rows("SELECT * FROM payments WHERE provider_payment_id LIKE 'plink_%' OR provider_payment_id LIKE 'custom_%' ORDER BY created_at DESC LIMIT 20");
      return json({payments:list});
    }
    let remote:any=null;
    if(id.startsWith("plink_"))remote=await provider(`/payment_links/${id}`);
    else if(id.startsWith("order_"))remote=await provider(`/orders/${id}`);
    else if(id.startsWith("pay_"))remote=await provider(`/payments/${id}`);
    const isPaid=Boolean(remote && (remote.status==="paid"||Number(remote.amount_paid)>=100||remote.status==="captured"));
    if(isPaid){
      await run("UPDATE payments SET status='paid',paid_at=COALESCE(paid_at,?) WHERE provider_payment_id=? OR id=?",Date.now(),id,id);
    }
    return json({
      id,
      status:isPaid?"paid":(remote?.status||"pending"),
      amount:remote?.amount?remote.amount/100:0,
      shortUrl:remote?.short_url,
      raw:remote
    });
  }
  if(path[0]==="projects"||path[0]==="editor"){
    try {
      const list=await rows<{id:string;owner_id:string;project_type:string;title:string;status:string;aspect_ratio:string;width:number;height:number;duration_ms:number;created_at:number;updated_at:number}>("SELECT * FROM media_projects WHERE owner_id=? ORDER BY updated_at DESC LIMIT 100",u.id);
      const items=await rows<{id:string;project_id:string;source_media_id:string|null;output_media_id:string|null;cover_media_id:string|null;position:number;edit_recipe_json:string;version:number;created_at:number;updated_at:number}>("SELECT * FROM media_project_items ORDER BY position ASC");
      const itemsByProject=new Map<string,any[]>();
      for(const item of items){
        const arr=itemsByProject.get(item.project_id)??[];
        arr.push(item);
        itemsByProject.set(item.project_id,arr);
      }
      const enriched=await Promise.all(list.map(async p=>{
        const pItems=itemsByProject.get(p.id)??[];
        const withUrls=await Promise.all(pItems.map(async it=>({
          ...it,
          source_url:it.source_media_id?await mediaUrl(u,it.source_media_id,"",true):null,
          output_url:it.output_media_id?await mediaUrl(u,it.output_media_id,"",true):null,
          cover_url:it.cover_media_id?await mediaUrl(u,it.cover_media_id,"",true):null,
        })));
        return {...p,items:withUrls};
      }));
      return json({projects:enriched});
    } catch (_) {
      return json({projects:[]});
    }
  }
  if(path[0]==="project"){
    const id=path[1];
    if(!id)throw new HttpError(400,"Project ID required.");
    const project=await row<{id:string;owner_id:string;project_type:string;title:string;status:string;aspect_ratio:string;width:number;height:number;duration_ms:number;created_at:number;updated_at:number}>("SELECT * FROM media_projects WHERE id=? AND owner_id=?",id,u.id);
    if(!project)throw new HttpError(404,"Project not found.");
    const items=await rows<{id:string;project_id:string;source_media_id:string|null;output_media_id:string|null;cover_media_id:string|null;position:number;edit_recipe_json:string;version:number;created_at:number;updated_at:number}>("SELECT * FROM media_project_items WHERE project_id=? ORDER BY position ASC",id);
    const withUrls=await Promise.all(items.map(async it=>({
      ...it,
      source_url:it.source_media_id?await mediaUrl(u,it.source_media_id,"",true):null,
      output_url:it.output_media_id?await mediaUrl(u,it.output_media_id,"",true):null,
      cover_url:it.cover_media_id?await mediaUrl(u,it.cover_media_id,"",true):null,
    })));
    return json({project:{...project,items:withUrls}});
  }
  void url;throw new HttpError(404,"Not found");
});}
export async function POST(request:Request,ctx:Context){return endpoint(async()=>{sameOrigin(request);const u=await apiAccount(true);await rateLimit(`admin:${u.id}`,200,60);const {path}=await ctx.params;
  if(path[0]==="upload"){
    if(Number(request.headers.get("content-length"))>MAX_UPLOAD_BYTES+65536)throw new HttpError(413,"Files must be 25 MB or smaller.");const data=await request.formData();const file=data.get("file");if(!(file instanceof File)||!file.size||file.size>MAX_UPLOAD_BYTES)throw new HttpError(400,"Choose an image or MP4 up to 25 MB.");const kind=detectMedia(new Uint8Array(await file.slice(0,16).arrayBuffer()));if(!kind)throw new HttpError(415,"Use JPEG, PNG, WebP or MP4.");const category=data.get("category");const id=crypto.randomUUID(),drive=await driveConnection();let key:string;if(drive){const driveId=await uploadToDrive(new File([file],file.name,{type:kind.mime}),typeof category==="string"?category:undefined);key=`gdrive:${driveId}`;}else{if(!env.BUCKET)throw new HttpError(503,"Media storage unavailable. Connect Google Drive or configure the existing private store.");key=`members/${id}`;await env.BUCKET.put(key,file.stream(),{httpMetadata:{contentType:kind.mime}});}try{await database().batch([sql("INSERT INTO media_assets(id,storage_key,name,mime,bytes,created_by,created_at) VALUES(?,?,?,?,?,?,?)",id,key,file.name.slice(0,160),kind.mime,file.size,u.id,Date.now()),audit(u.id,"upload-media",id,{name:file.name,size:file.size,provider:drive?"google_drive":"private_store",category:typeof category==="string"?category:null})]);}catch(e){if(key.startsWith("gdrive:"))await deleteDriveFile(key.slice(7));else await env.BUCKET?.delete(key);throw e;}return json({id,name:file.name,mime:kind.mime,url:await mediaUrl(u,id,"",true),provider:drive?"google_drive":"private_store"},201);
  }
  const v=await body(request),now=Date.now();
  if(path[0]==="save"||path[0]==="like"){
    const input=z.object({postId:z.string().max(100),selected:z.boolean()}).parse(v);
    if(!await row("SELECT id FROM posts WHERE id=? AND is_story=0",input.postId))throw new HttpError(404,"Post not found.");
    const table=path[0]==="save"?"saved_posts":"likes";
    if(input.selected)await run(`INSERT OR IGNORE INTO ${table}(user_id,post_id,created_at) VALUES(?,?,?)`,u.id,input.postId,now);
    else await run(`DELETE FROM ${table} WHERE user_id=? AND post_id=?`,u.id,input.postId);
    return json({ok:true});
  }
  if(path[0]==="story"){
    const p=storyInput.parse(v);if(p.access_mode==="level"&&p.minimum_level===0)throw new HttpError(400,"Choose a paid minimum tier or Free Demo.");if(p.access_mode==="specific"&&!p.plan_ids.length)throw new HttpError(400,"Select at least one plan.");if(!await row("SELECT id FROM media_assets WHERE id=?",p.media_id))throw new HttpError(400,"Choose an uploaded photo or video.");for(const plan of p.plan_ids)if(!await row("SELECT id FROM membership_plans WHERE id=?",plan))throw new HttpError(400,"Selected membership is missing.");
    const id=crypto.randomUUID(),expires=p.highlight?null:now+86400000;await database().batch([sql("INSERT INTO posts(id,title,caption,visibility,status,access_mode,minimum_level,comment_level,published_at,is_story,is_highlight,story_expires_at,created_by,created_at,updated_at) VALUES(?,?,?,'custom','published',?,?,-1,?,1,?,?,?,?,?)",id,p.title,p.caption,p.access_mode,p.minimum_level,now,p.highlight?1:0,expires,u.id,now,now),...p.plan_ids.map(plan=>sql("INSERT INTO post_access(post_id,plan_id) VALUES(?,?)",id,plan)),sql("INSERT INTO post_media(id,post_id,asset_id,display_order,cover) VALUES(?,?,?,0,1)",crypto.randomUUID(),id,p.media_id),audit(u.id,"publish-story",id,{access:p.access_mode,level:p.minimum_level,plans:p.plan_ids,highlight:p.highlight})]);return json({id,message:p.highlight?"Highlight published permanently.":"Story published for 24 hours."});
  }
  if(path[0]==="story-highlight"){
    const input=z.object({id:z.string(),selected:z.boolean()}).parse(v);const story=await row<{id:string;created_at:number}>("SELECT id,created_at FROM posts WHERE id=? AND is_story=1",input.id);if(!story)throw new HttpError(404,"Story not found.");await database().batch([sql("UPDATE posts SET is_highlight=?,story_expires_at=?,updated_at=? WHERE id=?",input.selected?1:0,input.selected?null:story.created_at+86400000,now,input.id),audit(u.id,input.selected?"add-highlight":"remove-highlight",input.id,{})]);return json({message:input.selected?"Story added to highlights.":"Highlight removed. The original 24-hour expiry applies."});
  }
  if(path[0]==="post"){
    const p=postInput.parse(v);if(p.status==="scheduled"&&p.published_at<=now)throw new HttpError(400,"Schedule a time in the future.");if(p.access_mode==="level"&&p.minimum_level===0)throw new HttpError(400,"Choose a paid minimum tier or Free Demo.");if(p.access_mode==="specific"&&!p.plan_ids.length)throw new HttpError(400,"Select at least one plan.");const mediaIds=[...new Set(p.media_ids)];for(const id of mediaIds)if(!await row("SELECT id FROM media_assets WHERE id=?",id))throw new HttpError(400,"Selected media is missing.");for(const id of p.plan_ids)if(!await row("SELECT id FROM membership_plans WHERE id=?",id))throw new HttpError(400,"Selected membership is missing.");if(!mediaIds.includes(p.cover_id))throw new HttpError(400,"Choose a cover from the attached media.");const id=p.id??crypto.randomUUID();if(p.id&&!await row("SELECT id FROM posts WHERE id=?",id))throw new HttpError(404,"Post not found.");const existing=await row<{updated_at:number}>("SELECT updated_at FROM posts WHERE id=?",id);if(existing&&v.expectedUpdatedAt!==existing.updated_at)throw new HttpError(409,"This post changed in another tab. Reload before editing.");
    const ops=[sql("INSERT INTO posts(id,title,caption,visibility,status,access_mode,minimum_level,comment_level,published_at,created_by,created_at,updated_at) VALUES(?,?,?,'custom',?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,caption=excluded.caption,status=excluded.status,access_mode=excluded.access_mode,minimum_level=excluded.minimum_level,comment_level=excluded.comment_level,published_at=excluded.published_at,updated_at=excluded.updated_at",id,p.title,p.caption,p.status,p.access_mode,p.minimum_level,p.comment_level,p.published_at,u.id,now,now),sql("DELETE FROM post_access WHERE post_id=?",id),sql("DELETE FROM post_media WHERE post_id=?",id),...p.plan_ids.map(plan=>sql("INSERT INTO post_access(post_id,plan_id) VALUES(?,?)",id,plan)),...mediaIds.map((asset,i)=>sql("INSERT INTO post_media(id,post_id,asset_id,display_order,cover) VALUES(?,?,?,?,?)",crypto.randomUUID(),id,asset,i,asset===p.cover_id?1:0)),audit(u.id,"save-post",id,{status:p.status,access:p.access_mode,level:p.minimum_level,plans:p.plan_ids})];await database().batch(ops);return json({id,message:p.status==="draft"?"Draft saved.":p.status==="scheduled"?"Post scheduled.":p.status==="archived"?"Post archived.":"Post published."});
  }
  if(path[0]==="delete-post"){const id=z.string().parse(v.id);await database().batch([sql("DELETE FROM saved_posts WHERE post_id=?",id),sql("DELETE FROM likes WHERE post_id=?",id),sql("DELETE FROM comments WHERE post_id=?",id),sql("DELETE FROM post_access WHERE post_id=?",id),sql("DELETE FROM post_media WHERE post_id=?",id),sql("DELETE FROM posts WHERE id=?",id),audit(u.id,"delete-post",id,{})]);return json({message:"Post deleted."});}
  if(path[0]==="delete-media"){
    const id=z.string().parse(v.id);
    const force = Boolean(v.force);
    const attachedPost = await row<{title: string}>("SELECT p.title FROM post_media pm JOIN posts p ON p.id = pm.post_id WHERE pm.asset_id=? LIMIT 1", id);
    if(attachedPost && !force) {
      throw new HttpError(409, `This media is attached to post "${attachedPost.title}". Delete the post or detach this media from the post first.`);
    }
    const asset=await row<{storage_key:string}>("SELECT storage_key FROM media_assets WHERE id=?",id);
    if(asset){
      try {
        if(asset.storage_key.startsWith("gdrive:")) await deleteDriveFile(asset.storage_key.slice(7));
        else if(env.BUCKET) await env.BUCKET.delete(asset.storage_key);
      } catch (storageErr) {
        console.warn("Storage deletion warning for asset", id, storageErr);
      }
      await database().batch([
        sql("DELETE FROM post_media WHERE asset_id=?", id),
        sql("DELETE FROM media_assets WHERE id=?", id),
        audit(u.id, "delete-media", id, {})
      ]);
    }
    return json({message:"Media deleted."});
  }
  if(path[0]==="migrate-google-drive"){
    if(!await driveConnection())throw new HttpError(409,"Connect the intended Google Drive account first.");if(!env.BUCKET)throw new HttpError(503,"The existing private store is unavailable for migration.");const assets=await rows<{id:string;storage_key:string;name:string;mime:string;bytes:number}>("SELECT id,storage_key,name,mime,bytes FROM media_assets WHERE storage_key NOT LIKE 'gdrive:%' ORDER BY created_at LIMIT 3");let migrated=0;for(const asset of assets){const object=await env.BUCKET.get(asset.storage_key);if(!object)continue;const driveId=await uploadToDrive(new File([await object.arrayBuffer()],asset.name,{type:asset.mime}));const result=await run("UPDATE media_assets SET storage_key=? WHERE id=? AND storage_key=?",`gdrive:${driveId}`,asset.id,asset.storage_key);if(result.meta.changes){await env.BUCKET.delete(asset.storage_key);migrated++;}else await deleteDriveFile(driveId);}const left=await row<{count:number}>("SELECT COUNT(*) AS count FROM media_assets WHERE storage_key NOT LIKE 'gdrive:%'");await database().batch([audit(u.id,"migrate-google-drive","media",{migrated,remaining:left?.count??0})]);return json({message:left?.count?`${migrated} file(s) moved to Google Drive. ${left.count} remain—run migration again.`:`${migrated} file(s) moved. All media is now stored in Google Drive.`});
  }
  if(path[0]==="disconnect-google-drive"){await disconnectDrive();await database().batch([audit(u.id,"disconnect-google-drive","google_drive",{})]);return json({message:"Google Drive disconnected. Existing Drive files remain private in that account; reconnect it before viewing or managing them."});}
  if(path[0]==="clean-database-storage"){
    const mode = (typeof v === "object" && v !== null && "mode" in v && typeof (v as any).mode === "string") ? (v as any).mode : "all";
    const res = await cleanDatabaseStorage(mode);
    await database().batch([audit(u.id, "clean-database-storage", "database", { mode, itemsCleared: res.itemsCleared })]);
    return json(res);
  }
  if(path[0]==="empty-drive-trash"){
    await emptyDriveTrash();
    await database().batch([audit(u.id, "empty-drive-trash", "google_drive", {})]);
    return json({ message: "Google Drive trash has been emptied successfully." });
  }
  if(path[0]==="plan"){
    await initializePlans();
    const p=z.object({id:z.string(),name:z.string().trim().min(1).max(80),price:z.number().int().min(0).max(100000),description:z.string().max(500).optional().default(""),benefits:z.array(z.string().trim().min(1).max(200)).min(1).max(15),badge:z.string().max(40).optional().default(""),active:z.boolean(),display_order:z.number().int().min(0).max(20),level:z.number().int().min(0).max(3),discount_enabled:z.boolean().optional().default(false),discount_amount:z.number().int().min(0).max(100000).optional().default(0),discount_label:z.string().max(100).optional().nullable().default(null),discount_badge:z.string().max(40).optional().nullable().default(null),discount_ends_at:z.number().int().nullable().optional().default(null)}).parse(v);const current=await row<{id:string;price:number}>("SELECT id,price FROM membership_plans WHERE id=?",p.id);if(!current)throw new HttpError(404,"Plan not found.");if(p.id==="free"&&(p.price!==0||p.level!==0||!p.active))throw new HttpError(400,"The Free plan must stay active at ₹0 and level 0.");if(p.id!=="free"&&(p.price<1||p.level<1))throw new HttpError(400,"Paid plans need a price and level above zero.");const discEnabled=p.id==="free"?0:p.discount_enabled?1:0;const discAmount=p.id==="free"?0:p.discount_amount;await database().batch([sql("UPDATE membership_plans SET name=?,price=?,description=?,benefits=?,badge=?,active=?,display_order=?,level=?,provider_plan_id=CASE WHEN price<>? THEN NULL ELSE provider_plan_id END,discount_enabled=?,discount_amount=?,discount_label=?,discount_badge=?,discount_ends_at=?,updated_at=? WHERE id=?",p.name,p.price,p.description,JSON.stringify(p.benefits),p.badge,p.active?1:0,p.display_order,p.level,p.price,discEnabled,discAmount,p.discount_label??null,p.discount_badge??null,p.discount_ends_at??null,now,p.id),audit(u.id,"edit-plan",p.id,p)]);return json({message:"Membership saved. Existing provider subscriptions retain their contracted price."});
  }
  if(path[0]==="member"){
    const m=z.object({id:z.string(),plan_id:z.string(),days:z.number().int().min(1).max(3650),action:z.enum(["grant","revoke","extend"]),comments_blocked:z.boolean(),phone:z.string().trim().max(25).optional().nullable().transform(v=>v?v.trim():null),reason:z.string().trim().min(3).max(500)}).parse(v);const target=await row<{id:string;email:string;display_name:string}>("SELECT id,email,display_name FROM users WHERE id=? AND role='member' AND active=1",m.id);if(!target)throw new HttpError(404,"Member not found.");const plan=await row<{id:string;level:number;name:string}>("SELECT id,level,name FROM membership_plans WHERE id=?",m.plan_id);if(!plan)throw new HttpError(400,"Choose a membership.");const existing=await row<{id:string;provider:string;cancel_at_period_end:number;current_period_end:number}>("SELECT s.* FROM subscriptions s JOIN memberships m ON m.subscription_id=s.id WHERE m.user_id=?",m.id);
    if(existing?.provider==="razorpay"&&!existing.cancel_at_period_end)throw new HttpError(409,"Cancel the recurring provider subscription before replacing access with a manual grant.");
    const sub=crypto.randomUUID();const end=(m.action==="extend"?Math.max(now,existing?.current_period_end??0):now)+m.days*86400000;const ops=[sql("UPDATE users SET comments_blocked=?,phone=COALESCE(?,phone),updated_at=? WHERE id=?",m.comments_blocked?1:0,m.phone??null,now,m.id)];if(m.action==="revoke"||plan.level===0){if(existing)ops.push(sql("UPDATE subscriptions SET status='expired',current_period_end=?,grace_ends_at=NULL,updated_at=? WHERE id=?",now,now,existing.id));ops.push(sql("UPDATE memberships SET subscription_id=NULL,updated_at=? WHERE user_id=?",now,m.id));}else{ops.push(sql("INSERT INTO subscriptions(id,user_id,plan_id,provider,status,current_period_start,current_period_end,created_at,updated_at) VALUES(?,?,?,'complimentary','active',?,?,?,?)",sub,m.id,m.plan_id,now,end,now,now));ops.push(sql("INSERT INTO memberships(user_id,subscription_id,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET subscription_id=excluded.subscription_id,updated_at=excluded.updated_at",m.id,sub,now));}ops.push(audit(u.id,`membership-${m.action}`,m.id,m));ops.push(sql("INSERT INTO notifications(id,user_id,title,body,created_at) VALUES(?,?,?,?,?)",crypto.randomUUID(),m.id,"Your membership was updated","Your creator has updated your account access. Check your membership details.",now));await database().batch(ops);if(emailReady()){const content=membershipEmail("membership_updated",target.display_name,m.action==="revoke"?"Free":plan.name,`Creator note: ${m.reason}`);await safelySendTransactionalEmail({userId:m.id,email:target.email,kind:"membership_updated",idempotencyKey:`admin-membership:${sub}:${m.action}`,subject:content.subject,text:content.text});}return json({message:"Member access updated, emailed, and recorded in the activity log."});
  }
  if(path[0]==="test-email"){if(!emailReady())throw new HttpError(409,"Add MAIL_API_KEY and a verified MAIL_FROM address first.");await sendTransactionalEmail({userId:u.id,email:u.email,kind:"test",idempotencyKey:`test-email:${u.id}:${crypto.randomUUID()}`,subject:"Nina Kurain email automation is working",text:`Hi ${u.display_name.split(/\s+/)[0]||"Creator"},\n\nThis is a live delivery test from Nina Kurain's creator studio. Verification, password recovery, membership activation, renewal, grace-period and expiry emails can now be delivered.`});return json({message:`Test email sent to ${u.email}.`});}
  if(path[0]==="settings"){
    const s=z.object({
      creator_name:z.string().trim().min(1).max(100),
      creator_bio:z.string().max(1000),
      creator_avatar_asset_id:z.string().max(100),
      creator_phone:z.string().trim().max(30).optional().default(""),
      creator_whatsapp:z.string().trim().max(30).optional().default(""),
      creator_instagram:optionalHttpsUrl,
      creator_youtube:optionalHttpsUrl,
      creator_facebook:optionalHttpsUrl,
      creator_x:optionalHttpsUrl,
      creator_website:optionalHttpsUrl,
      likes_enabled:z.boolean(),
      require_verification:z.boolean(),
      ads_enabled:z.boolean().optional().default(false),
      ads_adsense_client:z.string().trim().max(100).optional().default(""),
      ads_in_feed_slot:z.string().trim().max(100).optional().default(""),
      ads_banner_slot:z.string().trim().max(100).optional().default(""),
      ads_hide_for_paid:z.boolean().optional().default(true),
      ads_custom_html:z.string().max(5000).optional().default(""),
      ads_txt_content:z.string().max(5000).optional().default("")
    }).parse(v);
    if(s.require_verification&&!emailReady())throw new HttpError(409,"Configure email delivery before requiring verification.");
    if(s.creator_avatar_asset_id&&!await row("SELECT id FROM media_assets WHERE id=? AND created_by=?",s.creator_avatar_asset_id,u.id))throw new HttpError(400,"Choose an uploaded creator image.");
    await database().batch([
      ...Object.entries(s).map(([key,value])=>sql("INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",key,String(value))),
      audit(u.id,"settings","site",s)
    ]);
    return json({message:"Creator profile, settings and ads configuration saved."});
  }
  if(path[0]==="avatar"){const id=z.string().max(100).parse(v.creator_avatar_asset_id);const asset=await row<{id:string;mime:string}>("SELECT id,mime FROM media_assets WHERE id=? AND created_by=?",id,u.id);if(!asset?.mime.startsWith("image/"))throw new HttpError(400,"Choose an uploaded creator image.");await database().batch([sql("INSERT INTO site_settings(key,value) VALUES('creator_avatar_asset_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",id),audit(u.id,"creator-avatar","site",{asset_id:id})]);return json({message:"Profile photo updated everywhere."});}
  if(path[0]==="comment"){const input=z.object({postId:z.string().max(100),body:z.string().trim().min(1).max(1500),parentId:z.string().max(100).nullable().optional()}).parse(v);if(!await row("SELECT id FROM posts WHERE id=? AND status IN ('published','scheduled') AND published_at<=?",input.postId,now))throw new HttpError(404,"Published post not found.");if(input.parentId){const parent=await row<{id:string;parent_id:string|null}>("SELECT id,parent_id FROM comments WHERE id=? AND post_id=? AND deleted_at IS NULL",input.parentId,input.postId);if(!parent||parent.parent_id)throw new HttpError(400,"Reply to an available top-level comment.");}const id=crypto.randomUUID();await database().batch([sql("INSERT INTO comments(id,user_id,post_id,parent_id,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",id,u.id,input.postId,input.parentId??null,input.body,now,now),audit(u.id,input.parentId?"reply-comment":"add-comment",id,{post_id:input.postId,parent_id:input.parentId??null})]);return json({id,message:input.parentId?"Reply posted.":"Comment posted."});}
  if(path[0]==="comment-like"){const input=z.object({id:z.string().max(100),selected:z.boolean()}).parse(v);if(!await row("SELECT id FROM comments WHERE id=? AND deleted_at IS NULL",input.id))throw new HttpError(404,"Comment not found.");const action=input.selected?sql("INSERT OR IGNORE INTO comment_likes(user_id,comment_id,created_at) VALUES(?,?,?)",u.id,input.id,now):sql("DELETE FROM comment_likes WHERE user_id=? AND comment_id=?",u.id,input.id);await database().batch([action,audit(u.id,input.selected?"like-comment":"unlike-comment",input.id,{})]);return json({message:input.selected?"Comment liked.":"Comment unliked."});}
  if(path[0]==="pin-comment"){const input=z.object({id:z.string().max(100),selected:z.boolean()}).parse(v);const comment=await row<{id:string;post_id:string;parent_id:string|null;pinned_at:number|null}>("SELECT id,post_id,parent_id,pinned_at FROM comments WHERE id=? AND deleted_at IS NULL",input.id);if(!comment||comment.parent_id)throw new HttpError(400,"Only top-level comments can be pinned.");if(input.selected&&!comment.pinned_at){const count=await row<{count:number}>("SELECT COUNT(*) AS count FROM comments WHERE post_id=? AND parent_id IS NULL AND pinned_at IS NOT NULL AND deleted_at IS NULL",comment.post_id);if((count?.count??0)>=3)throw new HttpError(409,"Unpin another comment first. Up to three comments can be pinned.");}await database().batch([sql("UPDATE comments SET pinned_at=?,updated_at=? WHERE id=?",input.selected?now:null,now,input.id),audit(u.id,input.selected?"pin-comment":"unpin-comment",input.id,{post_id:comment.post_id})]);return json({message:input.selected?"Comment pinned.":"Comment unpinned."});}
  if(path[0]==="delete-comment"){const id=z.string().parse(v.id);const comment=await row<{id:string;post_id:string}>("SELECT id,post_id FROM comments WHERE id=? AND deleted_at IS NULL",id);if(!comment)throw new HttpError(404,"Comment not found.");await database().batch([sql("UPDATE comments SET deleted_at=? WHERE id=? OR parent_id=?",now,id,id),audit(u.id,"delete-comment",id,{post_id:comment.post_id})]);return json({message:"Comment removed."});}
  if(path[0]==="feedback-status"){const input=z.object({id:z.string().max(100),status:z.enum(["new","reviewed","resolved"])}).parse(v);if(!await row("SELECT id FROM feedback WHERE id=?",input.id))throw new HttpError(404,"Feedback not found.");await database().batch([sql("UPDATE feedback SET status=?,updated_at=? WHERE id=?",input.status,now,input.id),audit(u.id,"feedback-status",input.id,{status:input.status})]);return json({message:"Feedback status updated."});}
  if(path[0]==="test-payment"){
    const status=billingStatus();
    if(!status.ready)throw new HttpError(503,`Payment gateway is not ready. ${status.issues[0]??"Please configure Live Key ID and Secret first."}`);
    const receipt=`admin_test_${Date.now()}`;
    const localId=crypto.randomUUID();
    const order=await provider("/orders",{
      amount:100,
      currency:"INR",
      receipt,
      notes:{purpose:"admin_1rs_real_test",admin_email:u.email,admin_id:u.id}
    });
    const link=await provider("/payment_links",{
      amount:100,
      currency:"INR",
      accept_partial:false,
      description:"₹1 Gateway Live Verification Test",
      customer:{name:u.display_name||"Nina Kurain Admin",email:u.email},
      notify:{sms:false,email:false},
      reminder_enable:false,
      notes:{purpose:"admin_1rs_real_test",order_id:order.id,admin_id:u.id}
    });
    await database().batch([
      sql("INSERT INTO payments(id,user_id,provider_payment_id,amount,currency,status,created_at) VALUES(?,?,?,100,'INR','created',?)",localId,u.id,link.id||order.id,now),
      audit(u.id,"create-test-payment",link.id||order.id,{order_id:order.id,payment_link_id:link.id,url:link.short_url,amount:100})
    ]);
    return json({
      id:link.id,
      orderId:order.id,
      paymentLinkId:link.id,
      shortUrl:link.short_url,
      amount:100,
      amountDisplay:"₹1.00",
      keyId:env.RAZORPAY_KEY_ID,
      mode:status.mode,
      message:"Live ₹1 test payment created successfully."
    },201);
  }
  if(path[0]==="custom-payment"){
    const input=z.object({
      amount:z.number().min(1).max(1000000),
      description:z.string().trim().max(200).optional(),
      customerName:z.string().trim().max(100).optional(),
      customerEmail:z.string().trim().email().optional().or(z.literal("")),
      customerPhone:z.string().trim().max(25).optional().or(z.literal("")),
      upiId:z.string().trim().max(100).optional(),
    }).parse(v);
    const amountInPaise=Math.round(input.amount*100);
    const billing=billingStatus();
    const upiVpa=input.upiId||"ninakurain@upi";
    const note=input.description||"Nina Kurain VIP Payment";
    const upiUri=`upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=Nina%20Kurain&am=${input.amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    let link:any=null;
    let order:any=null;
    if(billing.ready){
      try{
        const receipt=`custom_${Date.now()}`;
        order=await provider("/orders",{
          amount:amountInPaise,
          currency:"INR",
          receipt,
          notes:{purpose:"custom_admin_payment",description:note,admin_id:u.id,customer_name:input.customerName||undefined},
        });
        link=await provider("/payment_links",{
          amount:amountInPaise,
          currency:"INR",
          accept_partial:false,
          description:note,
          customer:{name:input.customerName||"Member",email:input.customerEmail||undefined,contact:input.customerPhone||undefined},
          notify:{sms:Boolean(input.customerPhone),email:Boolean(input.customerEmail)},
          reminder_enable:true,
          notes:{purpose:"custom_admin_payment",order_id:order?.id,admin_id:u.id},
        });
        const localId=crypto.randomUUID();
        await database().batch([
          sql("INSERT INTO payments(id,user_id,provider_payment_id,amount,currency,status,created_at) VALUES(?,?,?,?,'INR','created',?)",localId,u.id,link.id||order.id,amountInPaise,now),
          audit(u.id,"create-custom-payment",link.id||order.id,{amount:input.amount,description:note,customerName:input.customerName})
        ]);
      }catch(err){console.error("Razorpay custom link error:",err);}
    }
    return json({
      id:link?.id||`upi_${Date.now()}`,
      orderId:order?.id||null,
      paymentLinkId:link?.id||null,
      shortUrl:link?.short_url||null,
      upiUri,
      amount:input.amount,
      amountDisplay:`₹${input.amount.toLocaleString("en-IN")}`,
      description:note,
      customerName:input.customerName||"",
      upiId:upiVpa,
      hasRazorpay:Boolean(link?.short_url),
      created_at:Date.now(),
      message:link?.short_url?`Payment link & QR generated successfully for ₹${input.amount.toLocaleString("en-IN")}.`:`Direct UPI Payment QR generated for ₹${input.amount.toLocaleString("en-IN")}.`
    },201);
  }
  if(path[0]==="project"){
    const input=z.object({
      id:z.string().optional(),
      project_type:z.enum(["photo","carousel","reel","story","video"]),
      title:z.string().trim().min(1).max(200),
      status:z.enum(["draft","rendering","ready","published","archived"]).default("draft"),
      aspect_ratio:z.string().default("4:5"),
      width:z.number().int().default(1080),
      height:z.number().int().default(1350),
      duration_ms:z.number().int().default(0),
      items:z.array(z.object({
        id:z.string().optional(),
        source_media_id:z.string().nullable().optional(),
        output_media_id:z.string().nullable().optional(),
        cover_media_id:z.string().nullable().optional(),
        position:z.number().int().default(0),
        edit_recipe_json:z.string().default("{}"),
        version:z.number().int().default(1),
      })).min(1),
    }).parse(v);
    const id=input.id??crypto.randomUUID();
    const ops=[
      sql("INSERT INTO media_projects(id,owner_id,project_type,title,status,aspect_ratio,width,height,duration_ms,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,status=excluded.status,aspect_ratio=excluded.aspect_ratio,width=excluded.width,height=excluded.height,duration_ms=excluded.duration_ms,updated_at=excluded.updated_at",id,u.id,input.project_type,input.title,input.status,input.aspect_ratio,input.width,input.height,input.duration_ms,now,now),
      sql("DELETE FROM media_project_items WHERE project_id=?",id),
      ...input.items.map((item,idx)=>{
        const itemId=item.id??crypto.randomUUID();
        return sql("INSERT INTO media_project_items(id,project_id,source_media_id,output_media_id,cover_media_id,position,edit_recipe_json,version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",itemId,id,item.source_media_id??null,item.output_media_id??null,item.cover_media_id??null,item.position??idx,item.edit_recipe_json,item.version??1,now,now);
      }),
      audit(u.id,"save-project",id,{project_type:input.project_type,title:input.title,status:input.status,items:input.items.length})
    ];
    await database().batch(ops);
    return json({id,message:"Project saved."});
  }
  if(path[0]==="delete-project"){
    const id=z.string().parse(v.id);
    await database().batch([
      sql("DELETE FROM media_exports WHERE project_id=?",id),
      sql("DELETE FROM media_project_items WHERE project_id=?",id),
      sql("DELETE FROM media_projects WHERE id=? AND owner_id=?",id,u.id),
      audit(u.id,"delete-project",id,{})
    ]);
    return json({message:"Project deleted."});
  }
  if(path[0]==="export"){
    const input=z.object({
      id:z.string().optional(),
      project_id:z.string(),
      media_id:z.string().nullable().optional(),
      format:z.string(),
      codec:z.string().nullable().optional(),
      width:z.number().int(),
      height:z.number().int(),
      duration_ms:z.number().int().default(0),
      size_bytes:z.number().int().default(0),
      status:z.enum(["pending","processing","completed","failed","cancelled"]).default("pending"),
      progress:z.number().int().min(0).max(100).default(0),
      error_code:z.string().nullable().optional(),
    }).parse(v);
    const id=input.id??crypto.randomUUID();
    const completedAt=(input.status==="completed"||input.status==="failed")?now:null;
    await database().batch([
      sql("INSERT INTO media_exports(id,project_id,media_id,format,codec,width,height,duration_ms,size_bytes,status,progress,error_code,created_at,completed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,progress=excluded.progress,error_code=excluded.error_code,media_id=COALESCE(excluded.media_id,media_exports.media_id),completed_at=COALESCE(excluded.completed_at,media_exports.completed_at)",id,input.project_id,input.media_id??null,input.format,input.codec??null,input.width,input.height,input.duration_ms,input.size_bytes,input.status,input.progress,input.error_code??null,now,completedAt),
      audit(u.id,"media-export",id,{project_id:input.project_id,status:input.status,progress:input.progress})
    ]);
    return json({id,status:input.status,progress:input.progress});
  }
  throw new HttpError(404,"Not found");
});}
