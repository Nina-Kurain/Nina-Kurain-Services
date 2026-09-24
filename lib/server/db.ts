import { env } from "cloudflare:workers";
export function database(){if(!env.DB)throw new Error("Database unavailable");return env.DB;}
export const sql=(query:string,...values:unknown[])=>database().prepare(query).bind(...values);
export const row=async<T=Record<string,unknown>>(query:string,...values:unknown[])=>sql(query,...values).first<T>();
export const rows=async<T=Record<string,unknown>>(query:string,...values:unknown[]) => (await sql(query,...values).all<T>()).results;
export const run=async(query:string,...values:unknown[])=>sql(query,...values).run();
export function audit(actor:string,action:string,id:string,detail:unknown){return sql("INSERT INTO admin_activity(id,actor_id,action,entity_id,detail,created_at) VALUES(?,?,?,?,?,?)",crypto.randomUUID(),actor,action,id,JSON.stringify(detail),Date.now());}
export async function setting(key:string,fallback:string){return (await row<{value:string}>("SELECT value FROM site_settings WHERE key=?",key))?.value??fallback;}
export class HttpError extends Error{constructor(public status:number,message:string){super(message);}}
export const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
export async function endpoint(fn:()=>Promise<Response>){try{return await fn();}catch(e){if(e instanceof HttpError)return json({message:e.message},e.status);if(e instanceof Error&&e.name==="ZodError")return json({message:"Check the form fields and try again."},400);console.error("Application request failed",e);return json({message:"The request could not be completed. Please try again."},503);}}
export async function body(request:Request){const text=await request.text();if(text.length>65536)throw new HttpError(413,"Request too large");try{return JSON.parse(text);}catch{throw new HttpError(400,"Invalid request");}}
export function sameOrigin(request:Request){const origin=request.headers.get("origin");if(!origin||origin!==new URL(request.url).origin)throw new HttpError(403,"Please submit this request from the website.");}
