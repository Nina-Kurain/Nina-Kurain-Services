import { env } from "cloudflare:workers";
import { row,rows,HttpError,setting } from "./db";
import { accessClause,assertVerified,entitlement,type ContentPost,type ContentMedia } from "./entitlements";
import type { Account } from "./auth";
export async function mediaSignature(value:string){if(!env.MEDIA_SIGNING_SECRET)throw new HttpError(503,"Media access is not configured.");const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(env.MEDIA_SIGNING_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return Buffer.from(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value))).toString("hex");}
export async function mediaUrl(user:Account,asset:string,post:string,admin=false,preview=false){const expires=Math.floor(Date.now()/(4*60000))*4*60000+5*60000;const signature=await mediaSignature(`${user.id}:${user.session_hash}:${asset}:${post}:${expires}:${admin}:${preview}`);return `/api/content/media/${asset}?post=${encodeURIComponent(post)}&expires=${expires}&sig=${signature}${admin?"&admin=1":""}${preview?"&preview=1":""}`;}
export async function creatorAvatarUrl(user:Account){const asset=await setting("creator_avatar_asset_id","");return asset?mediaUrl(user,asset,"profile"):"/creator-portrait.png";}
export async function attachMedia(user:Account,posts:ContentPost[],admin=false){
  if(!posts.length)return posts;
  const grouped=new Map<string,ContentMedia[]>();
  // One query per bounded page, instead of a sequential query for every post.
  for(let start=0;start<posts.length;start+=80){
    const ids=posts.slice(start,start+80).map(p=>p.id);
    const assets=await rows<ContentMedia&{post_id:string}>(`SELECT pm.post_id,pm.id,pm.asset_id,pm.display_order,pm.cover,ma.name,ma.mime FROM post_media pm JOIN media_assets ma ON ma.id=pm.asset_id WHERE pm.post_id IN (${ids.map(()=>"?").join(",")}) ORDER BY pm.cover DESC,pm.display_order`,...ids);
    for(const {post_id,...asset} of assets){const list=grouped.get(post_id)??[];list.push(asset);grouped.set(post_id,list);}
  }
  await Promise.all(posts.map(async post=>{
    const assets=grouped.get(post.id)??[];
    post.is_reel=assets.some(m=>m.mime.startsWith("video/"));
    const isLocked=Boolean(post.is_locked&&!admin);
    if(isLocked){
      // For locked posts, attach only the cover media with preview=1 so browser can load blur thumbnail
      const coverAsset=assets.find(m=>m.cover)||assets[0];
      if(coverAsset){
        post.media=[{...coverAsset,url:await mediaUrl(user,coverAsset.asset_id,post.id,admin,true)}];
      }else{
        post.media=[];
      }
    }else{
      post.media=await Promise.all(assets.map(async m=>({...m,url:await mediaUrl(user,m.asset_id,post.id,admin,false)})));
    }
  }));
  return posts;
}
export async function verifyMedia(user:Account,assetId:string,url:URL,admin:boolean){
  const post=url.searchParams.get("post")??"",expires=Number(url.searchParams.get("expires"));
  const isPreview=url.searchParams.get("preview")==="1";
  if(!Number.isFinite(expires)||expires<Date.now()||expires>Date.now()+6*60000)throw new HttpError(403,"Media link expired. Refresh the feed.");
  const signature=await mediaSignature(`${user.id}:${user.session_hash}:${assetId}:${post}:${expires}:${admin}:${isPreview}`),supplied=url.searchParams.get("sig")??"";
  let diff=signature.length^supplied.length;for(let i=0;i<signature.length;i++)diff|=signature.charCodeAt(i)^(supplied.charCodeAt(i)||0);
  if(diff)throw new HttpError(403,"Media access denied.");
  type Asset={storage_key:string;mime:string;bytes:number};
  let asset:Asset|null;
  if(admin)asset=await row<Asset>("SELECT storage_key,mime,bytes FROM media_assets WHERE id=?",assetId);
  else if(post==="profile")asset=await row<Asset>("SELECT ma.storage_key,ma.mime,ma.bytes FROM media_assets ma JOIN site_settings s ON s.key='creator_avatar_asset_id' AND s.value=ma.id WHERE ma.id=?",assetId);
  else if(isPreview){
    // Verified preview thumbnail for published posts (allows CSS blur preview)
    const now=Date.now();
    asset=await row<Asset>(`SELECT ma.storage_key,ma.mime,ma.bytes FROM posts p JOIN post_media pm ON pm.post_id=p.id JOIN media_assets ma ON ma.id=pm.asset_id WHERE p.id=? AND ma.id=? AND p.status IN ('published','scheduled') AND p.published_at<=?`,post,assetId,now);
  }else{
    const [,e]=await Promise.all([assertVerified(user),entitlement(user.id)]),a=accessClause(e);
    // Resolve the post permission, attachment relationship and metadata together.
    // Membership is still checked on every media request, including old signed URLs.
    const now=Date.now();asset=await row<Asset>(`SELECT ma.storage_key,ma.mime,ma.bytes FROM posts p JOIN post_media pm ON pm.post_id=p.id JOIN media_assets ma ON ma.id=pm.asset_id WHERE p.id=? AND ma.id=? AND p.status IN ('published','scheduled') AND p.published_at<=? AND (p.is_story=0 OR p.is_highlight=1 OR p.story_expires_at>?) AND ${a.query}`,post,assetId,now,now,...a.params);
  }
  if(!asset)throw new HttpError(403,"Your account does not have access to this media.");
  return asset;
}
