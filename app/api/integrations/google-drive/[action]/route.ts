import { apiAccount,rateLimit } from "@/lib/server/auth";
import { audit,database,endpoint,HttpError,json,sameOrigin } from "@/lib/server/db";
import { beginDriveConnection,disconnectDrive,finishDriveConnection } from "@/lib/server/google-drive";

type Context={params:Promise<{action:string}>};
export async function GET(request:Request,ctx:Context){return endpoint(async()=>{const admin=await apiAccount(true),{action}=await ctx.params,url=new URL(request.url);await rateLimit(`drive-oauth:${admin.id}`,20,3600);
  if(action==="start")return Response.redirect(await beginDriveConnection(admin.id),302);
  if(action==="callback"){
    const error=url.searchParams.get("error");if(error)throw new HttpError(400,"Google Drive access was not approved.");const code=url.searchParams.get("code"),state=url.searchParams.get("state");if(!code||!state)throw new HttpError(400,"Google Drive did not return a valid connection response.");const connected=await finishDriveConnection(admin.id,state,code);await database().batch([audit(admin.id,"connect-google-drive","google_drive",{email:connected.email})]);return Response.redirect(new URL("/admin/settings?drive=connected",url.origin),303);
  }
  throw new HttpError(404,"Not found");
});}
export async function POST(request:Request,ctx:Context){return endpoint(async()=>{sameOrigin(request);const admin=await apiAccount(true),{action}=await ctx.params;if(action!=="disconnect")throw new HttpError(404,"Not found");await disconnectDrive();await database().batch([audit(admin.id,"disconnect-google-drive","google_drive",{})]);return json({message:"Google Drive disconnected. Existing Drive files remain in your account and can be reconnected later."});});}
