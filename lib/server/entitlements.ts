import { row,rows,run,sql,database,setting,HttpError } from "./db";
import type { Account } from "./auth";
export type Plan={id:string;name:string;slug:string;price:number;currency:string;description:string;benefits:string;level:number;badge:string;active:number;display_order:number;provider_plan_id:string|null;discount_enabled:number;discount_amount:number;discount_label:string|null;discount_badge:string|null;discount_ends_at:number|null;created_at?:number;updated_at?:number};
export type Subscription={id:string;user_id:string;plan_id:string;status:string;provider:string;provider_subscription_id:string|null;current_period_start:number|null;current_period_end:number|null;grace_ends_at:number|null;cancel_at_period_end:number;checkout_url:string|null;last_event_at:number;updated_at:number};
export type Entitlement={plan:Plan;subscription:Subscription|null;status:string;level:number};
export type ContentPost={id:string;title:string;caption:string;status:string;access_mode:string;minimum_level:number;comment_level:number;published_at:number;created_at:number;updated_at:number;is_story?:number;is_highlight?:number;story_expires_at?:number|null;media?:ContentMedia[];is_reel?:boolean;saved?:number;liked?:number;like_count?:number;comment_count?:number;plan_ids?:string[];is_locked?:boolean;required_plan_name?:string;required_level?:number;required_plan_price?:number;required_plan_id?:string;};
export type ContentMedia={id:string;asset_id:string;name:string;mime:string;display_order:number;cover:number;url?:string;storage_key?:string};
export function effectiveSubscription(s:Subscription|null,now=Date.now()){if(!s)return false;if(s.status==="grace_period"||s.status==="past_due")return Boolean(s.grace_ends_at&&s.grace_ends_at>now);return ["active","cancel_at_period_end","cancelled"].includes(s.status)&&Boolean(s.current_period_end&&s.current_period_end>now);}
export async function initializePlans(){
  const now=Date.now();
  const defaults=[
    {id:"free",name:"Free",price:0,level:0,description:"Selected previews from the creator.",benefits:["Selected free photographs and films"],badge:"FREE"},
    {id:"tier_299",name:"Private Access",price:300,level:1,description:"A more personal side of the archive.",benefits:["Private creator posts","Personal photo drops","Member-only updates","Private archive access"],badge:""},
    {id:"tier_499",name:"Closer Access",price:500,level:2,description:"More exclusive moments, shared a little closer.",benefits:["Everything in Private Access","Exclusive photographs and films","Additional private drops"],badge:"MOST CHOSEN"},
    {id:"tier_649",name:"Inner Circle",price:650,level:3,description:"The closest level of access and selected interactions.",benefits:["Everything in Closer Access","Most exclusive archive","Priority releases","Selected comment interactions"],badge:"INNER CIRCLE"}
  ];
  const columns=[
    "ALTER TABLE membership_plans ADD COLUMN discount_enabled integer NOT NULL DEFAULT 0",
    "ALTER TABLE membership_plans ADD COLUMN discount_amount integer NOT NULL DEFAULT 0",
    "ALTER TABLE membership_plans ADD COLUMN discount_label text",
    "ALTER TABLE membership_plans ADD COLUMN discount_badge text",
    "ALTER TABLE membership_plans ADD COLUMN discount_ends_at integer"
  ];
  for(const colSql of columns){
    try{await run(colSql);}catch(_){/* column already exists */}
  }
  await database().batch([
    ...defaults.map(p=>sql("INSERT OR IGNORE INTO membership_plans(id,name,slug,price,currency,description,benefits,level,badge,active,display_order,created_at,updated_at) VALUES(?,?,?,?,'INR',?,?,?,?,1,?,?,?)",p.id,p.name,p.id,p.price,p.description,JSON.stringify(p.benefits),p.level,p.badge,p.level,now,now))
  ]);
}
export async function getPlans(all=false){await initializePlans();return rows<Plan>(`SELECT * FROM membership_plans ${all?"":"WHERE active=1"} ORDER BY display_order,level`);}
export async function entitlement(userId:string):Promise<Entitlement>{
  const userRole=await row<{role:string}>("SELECT role FROM users WHERE id=?",userId);
  if(userRole?.role==="admin"){
    await initializePlans();
    const topPlan=await row<Plan>("SELECT * FROM membership_plans ORDER BY level DESC LIMIT 1");
    if(topPlan){
      return {
        plan:{...topPlan,name:"Creator Studio (Admin)",badge:"CREATOR",level:999},
        subscription:null,
        status:"active",
        level:999
      };
    }
  }
  const subscription=await row<Subscription>("SELECT s.* FROM memberships m JOIN subscriptions s ON s.id=m.subscription_id WHERE m.user_id=?",userId);
  const valid=effectiveSubscription(subscription);
  if(subscription&&!valid&&!["pending","expired","free"].includes(subscription.status))await run("UPDATE subscriptions SET status='expired',updated_at=? WHERE id=? AND updated_at=?",Date.now(),subscription.id,subscription.updated_at);
  const plan=await row<Plan>("SELECT * FROM membership_plans WHERE id=?",valid?subscription!.plan_id:"free");
  if(!plan)throw new HttpError(503,"Membership plans are not ready yet. Please retry.");
  return {plan,subscription,status:valid?subscription!.status:subscription?"expired":"free",level:plan.level};
}
export function accessClause(e:Entitlement){
  if(e.level>=999){
    return {query:"(1=1)",params:[]};
  }
  return {query:"((p.visibility='custom' AND (p.access_mode='free' OR (p.access_mode='level' AND p.minimum_level<=? AND ?>0) OR (p.access_mode='specific' AND EXISTS(SELECT 1 FROM post_access pa WHERE pa.post_id=p.id AND pa.plan_id=?)))) OR (p.visibility='free' AND p.access_mode='free'))",params:[e.level,e.level,e.plan.id]};
}
export async function assertVerified(user:Account){if(!user.verified&&await setting("require_verification","false")==="true")throw new HttpError(403,"Please verify your email before viewing content.");}
export async function allowedPost(user:Account,id:string,admin=user.role==="admin"){if(admin||user.role==="admin")return row<ContentPost>("SELECT * FROM posts WHERE id=?",id);await assertVerified(user);const e=await entitlement(user.id);const a=accessClause(e),now=Date.now();return row<ContentPost>(`SELECT p.* FROM posts p WHERE p.id=? AND p.status IN ('published','scheduled') AND p.published_at<=? AND (p.is_story=0 OR p.is_highlight=1 OR p.story_expires_at>?) AND ${a.query}`,id,now,now,...a.params);}
export async function feed(user:Account,options:{offset:number;search:string;kind:string;saved:boolean;collection?:"all"|"demo"|"exclusive";planLevel?:number}){
  const [,e,plans]=await Promise.all([assertVerified(user),entitlement(user.id),getPlans()]);
  const a=accessClause(e);
  const filter=options.kind==="all"?"":" AND EXISTS(SELECT 1 FROM post_media pm JOIN media_assets ma ON ma.id=pm.asset_id WHERE pm.post_id=p.id AND ma.mime LIKE ?)";
  const saved=options.saved?" AND EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id=p.id AND sp.user_id=?)":"";
  
  // For exclusive tab, filter to paid posts (access_mode <> 'free'); for demo tab or default, show all published posts so teaser lock previews appear!
  const collection=options.collection==="exclusive"?" AND p.access_mode<>'free'":"";
  const planFilter=options.collection==="exclusive"&&options.planLevel?" AND ((p.access_mode='level' AND p.minimum_level=?) OR (p.access_mode='specific' AND EXISTS(SELECT 1 FROM post_access pfa JOIN membership_plans mfp ON mfp.id=pfa.plan_id WHERE pfa.post_id=p.id AND mfp.level=?)))":"";
  const accessFilter=options.saved?`AND ${a.query}`:"";

  const list=await rows<ContentPost>(`SELECT p.id,p.title,p.caption,p.status,p.access_mode,p.minimum_level,p.comment_level,p.published_at,p.created_at,p.updated_at,(SELECT COUNT(*) FROM likes WHERE post_id=p.id) AS like_count,(SELECT COUNT(*) FROM comments WHERE post_id=p.id AND deleted_at IS NULL) AS comment_count,EXISTS(SELECT 1 FROM saved_posts WHERE post_id=p.id AND user_id=?) AS saved,EXISTS(SELECT 1 FROM likes WHERE post_id=p.id AND user_id=?) AS liked FROM posts p WHERE p.is_story=0 AND p.status IN ('published','scheduled') AND p.published_at<=? ${accessFilter} AND (p.title LIKE ? OR p.caption LIKE ?)${collection}${planFilter}${filter}${saved} ORDER BY (CASE WHEN p.access_mode='free' OR p.visibility='free' THEN 0 WHEN p.access_mode='level' THEN p.minimum_level WHEN p.access_mode='specific' THEN COALESCE((SELECT MIN(mfp.level) FROM post_access pfa JOIN membership_plans mfp ON mfp.id=pfa.plan_id WHERE pfa.post_id=p.id), 1) ELSE p.minimum_level END) ASC, p.published_at DESC, p.id DESC LIMIT 13 OFFSET ?`,user.id,user.id,Date.now(),...(options.saved?a.params:[]),`%${options.search}%`,`%${options.search}%`,...(planFilter?[options.planLevel,options.planLevel]:[]),...(filter?[options.kind+"/%"]:[]),...(saved?[user.id]:[]),options.offset);

  // Batch query specific post_access for any specific access posts in the returned list
  const specificPostIds=list.filter(p=>p.access_mode==="specific").map(p=>p.id);
  const accessRows=specificPostIds.length
    ? await rows<{post_id:string;plan_id:string}>(`SELECT post_id,plan_id FROM post_access WHERE post_id IN (${specificPostIds.map(()=>"?").join(",")})`,...specificPostIds)
    : [];
  const accessMap=new Map<string,string[]>();
  for(const {post_id,plan_id} of accessRows){
    const arr=accessMap.get(post_id)??[];
    arr.push(plan_id);
    accessMap.set(post_id,arr);
  }

  const isAdmin=user.role==="admin"||e.level>=999;
  for(const p of list){
    if(p.access_mode==="specific"){
      p.plan_ids=accessMap.get(p.id)??[];
    }
    if(p.access_mode==="free"){
      p.is_locked=false;
      p.required_plan_name="Free Demo";
      p.required_level=0;
    }else if(p.access_mode==="level"){
      const isLocked=!isAdmin&&(e.level<p.minimum_level||e.level===0);
      const targetPlan=plans.find(pl=>pl.level===p.minimum_level)??plans.find(pl=>pl.level>0);
      p.is_locked=isLocked;
      p.required_plan_name=isAdmin?"Unlocked (Admin)":targetPlan?.name??`Level ${p.minimum_level} Membership`;
      p.required_level=p.minimum_level;
      p.required_plan_price=targetPlan?.price;
      p.required_plan_id=targetPlan?.id;
    }else if(p.access_mode==="specific"){
      const planIds=p.plan_ids??[];
      const hasAccess=isAdmin||planIds.includes(e.plan.id);
      const targetPlan=plans.find(pl=>planIds.includes(pl.id))??plans.find(pl=>pl.level>0);
      p.is_locked=!hasAccess;
      p.required_plan_name=isAdmin?"Unlocked (Admin)":targetPlan?.name??"Exclusive Membership";
      p.required_level=targetPlan?.level??1;
      p.required_plan_price=targetPlan?.price;
      p.required_plan_id=targetPlan?.id;
    }
    if(isAdmin){
      p.is_locked=false;
    }
  }

  // Explicitly sort: Demo (level 0) -> Tier 1 -> Tier 2 -> Tier 3, then newest first
  list.sort((a, b) => {
    const levelA = a.required_level ?? (a.access_mode === "free" ? 0 : a.minimum_level);
    const levelB = b.required_level ?? (b.access_mode === "free" ? 0 : b.minimum_level);
    if (levelA !== levelB) {
      return levelA - levelB;
    }
    return (b.published_at ?? 0) - (a.published_at ?? 0);
  });

  const more=list.length>12;
  return {posts:list.slice(0,12),more,entitlement:e};
}
export async function storyFeed(user:Account){const [,e]=await Promise.all([assertVerified(user),entitlement(user.id)]);const a=accessClause(e),now=Date.now();const stories=await rows<ContentPost>(`SELECT p.* FROM posts p WHERE p.is_story=1 AND p.status IN ('published','scheduled') AND p.published_at<=? AND (p.is_highlight=1 OR p.story_expires_at>?) AND ${a.query} ORDER BY p.is_highlight,p.published_at DESC LIMIT 60`,now,now,...a.params);return {stories,entitlement:e};}
