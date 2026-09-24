import type { ContentPost } from "./server/entitlements";

export type FeedTab = "demo" | "exclusive" | "reels" | "saved";
export function tabFromLocation(pathname:string,search:string):FeedTab {
  const selected=new URLSearchParams(search).get("tab");
  return pathname==="/saved"?"saved":selected==="reels"?"reels":selected==="exclusive"?"exclusive":"demo";
}
export function feedPath(tab:FeedTab,offset=0,planLevel=0){
  return `/api/app/feed?offset=${offset}&kind=${tab==="reels"?"video":"all"}${tab==="saved"?"&saved=1":""}${tab==="demo"?"&collection=demo":""}${tab==="exclusive"?`&collection=exclusive${planLevel?`&level=${planLevel}`:""}`:""}`;
}
export function updatePost(post:ContentPost,type:"save"|"like",selected:boolean):ContentPost {
  if(type==="save")return {...post,saved:Number(selected)};
  return {...post,liked:Number(selected),like_count:Math.max(0,(post.like_count??0)+(Number(selected)-Number(Boolean(post.liked))))};
}
export function updateFeedPosts(posts:ContentPost[],tab:FeedTab,id:string,type:"save"|"like",selected:boolean){
  return posts.flatMap(post=>post.id!==id?[post]:tab==="saved"&&type==="save"&&!selected?[]:[updatePost(post,type,selected)]);
}
