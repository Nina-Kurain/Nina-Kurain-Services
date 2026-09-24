import { env } from "cloudflare:workers";
import { HttpError,row,run } from "./db";

type DriveConnection={id:string;account_email:string;display_name:string;root_folder_id:string;encrypted_refresh_token:string;active:number;updated_at:number};
type TokenReply={access_token?:string;refresh_token?:string;expires_in?:number;error?:string;error_description?:string};
type GoogleApiReply={id?:string;error?:{code?:number;message?:string;status?:string;errors?:Array<{reason?:string;message?:string}>}};
let cachedAccessToken:{connectionId:string;updatedAt:number;value:string;expiresAt:number}|null=null;

const encoder=new TextEncoder(),decoder=new TextDecoder();
const base64url=(bytes:Uint8Array)=>Buffer.from(bytes).toString("base64url");
const random=(size=32)=>{const bytes=new Uint8Array(size);crypto.getRandomValues(bytes);return base64url(bytes);};
const sha256=async(value:string)=>Buffer.from(await crypto.subtle.digest("SHA-256",encoder.encode(value))).toString("hex");
const redirectUri=()=>{if(!env.APP_URL)throw new HttpError(503,"Set APP_URL before connecting Google Drive.");return new URL("/api/integrations/google-drive/callback",env.APP_URL).toString();};
export function googleDriveConfigured(){return Boolean(env.GOOGLE_DRIVE_CLIENT_ID&&env.GOOGLE_DRIVE_CLIENT_SECRET&&env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY&&env.APP_URL);}
function requireConfiguration(){if(!googleDriveConfigured())throw new HttpError(503,"Google Drive connection is not configured yet. Add the OAuth credentials in the website environment first.");}
async function encryptionKey(){requireConfiguration();const raw=await crypto.subtle.digest("SHA-256",encoder.encode(env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY!));return crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);}
async function encrypt(value:string){const iv=new Uint8Array(12);crypto.getRandomValues(iv);const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},await encryptionKey(),encoder.encode(value));return `${base64url(iv)}.${base64url(new Uint8Array(encrypted))}`;}
async function decrypt(value:string){const [iv,data]=value.split(".");if(!iv||!data)throw new HttpError(503,"The Google Drive connection must be renewed.");try{return decoder.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:Buffer.from(iv,"base64url")},await encryptionKey(),Buffer.from(data,"base64url")));}catch{throw new HttpError(503,"The Google Drive connection cannot be decrypted. Reconnect the intended Google account.");}}
async function tokenRequest(values:Record<string,string>){requireConfiguration();const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(values)});const result=await response.json() as TokenReply;if(!response.ok||!result.access_token)throw new HttpError(502,result.error_description||"Google could not complete the Drive connection.");return result;}
export async function beginDriveConnection(adminId:string){requireConfiguration();const state=random(32),verifier=random(64),challenge=base64url(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(verifier)))),now=Date.now();await run("DELETE FROM oauth_states WHERE expires_at<=?",now);await run("INSERT INTO oauth_states(state_hash,provider,code_verifier,created_by,expires_at,created_at) VALUES(?,'google_drive',?,?,?,?)",await sha256(state),verifier,adminId,now+10*60000,now);const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");url.search=new URLSearchParams({client_id:env.GOOGLE_DRIVE_CLIENT_ID!,redirect_uri:redirectUri(),response_type:"code",access_type:"offline",prompt:"consent",include_granted_scopes:"true",scope:"https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",state,code_challenge:challenge,code_challenge_method:"S256"}).toString();return url.toString();}
function driveApiFailure(response:Response,result:GoogleApiReply){
  const reason=result.error?.errors?.[0]?.reason??"",message=result.error?.message??"";
  if(response.status===403&&(reason==="accessNotConfigured"||/not been used|disabled/i.test(message)))return new HttpError(503,"Google authorization succeeded, but the Google Drive API is disabled for this OAuth project. Enable Google Drive API in Google Cloud Console, wait a minute, then reconnect.");
  if(response.status===403&&(reason==="storageQuotaExceeded"||/storage quota/i.test(message)))return new HttpError(507,"The connected Google account has no available Drive storage. Free some space or connect another account.");
  if(response.status===403&&(reason==="insufficientFilePermissions"||/insufficient.*permission/i.test(message)))return new HttpError(403,"Google did not grant permission to create the private media folder. Remove Nina Kurain Club from Google account permissions, then reconnect and approve Drive access.");
  if(response.status===401)return new HttpError(401,"Google Drive authorization expired before setup completed. Reconnect the intended Google account.");
  console.error("Google Drive folder creation failed",{status:response.status,reason,statusText:result.error?.status,message});
  return new HttpError(502,`Google Drive authorized the account, but folder creation failed (Google ${response.status}). Enable the Drive API and reconnect; if it continues, check the server log for Google's reason.`);
}
async function createFolder(accessToken:string){const response=await fetch("https://www.googleapis.com/drive/v3/files?fields=id",{method:"POST",headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"},body:JSON.stringify({name:"Nina Kurain Private Media",mimeType:"application/vnd.google-apps.folder"})});let result:GoogleApiReply={};try{result=await response.json() as GoogleApiReply;}catch{}if(!response.ok||!result.id)throw driveApiFailure(response,result);return result.id;}
export async function finishDriveConnection(adminId:string,state:string,code:string){requireConfiguration();const stateHash=await sha256(state),saved=await row<{code_verifier:string;created_by:string}>("SELECT code_verifier,created_by FROM oauth_states WHERE state_hash=? AND provider='google_drive' AND expires_at>?",stateHash,Date.now());if(!saved||saved.created_by!==adminId)throw new HttpError(400,"This Google Drive connection link is invalid or expired.");await run("DELETE FROM oauth_states WHERE state_hash=?",stateHash);const token=await tokenRequest({client_id:env.GOOGLE_DRIVE_CLIENT_ID!,client_secret:env.GOOGLE_DRIVE_CLIENT_SECRET!,code,code_verifier:saved.code_verifier,grant_type:"authorization_code",redirect_uri:redirectUri()});if(!token.refresh_token)throw new HttpError(502,"Google did not provide long-term Drive access. Remove the app from your Google permissions and connect again.");const infoResponse=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${token.access_token}`}});const info=await infoResponse.json() as {email?:string;name?:string};if(!infoResponse.ok||!info.email)throw new HttpError(502,"The connected Google account could not be identified.");const existing=await row<{account_email:string;root_folder_id:string}>("SELECT account_email,root_folder_id FROM external_connections WHERE provider='google_drive'"),driveAssets=await row<{count:number}>("SELECT COUNT(*) AS count FROM media_assets WHERE storage_key LIKE 'gdrive:%'");if(existing&&driveAssets?.count&&existing.account_email.toLowerCase()!==info.email.toLowerCase())throw new HttpError(409,`Existing Drive media belongs to ${existing.account_email}. Reconnect that same account so private files do not become unavailable.`);const folder=existing&&existing.account_email.toLowerCase()===info.email.toLowerCase()?existing.root_folder_id:await createFolder(token.access_token!);const now=Date.now();await run("INSERT INTO external_connections(id,provider,account_email,display_name,root_folder_id,encrypted_refresh_token,active,created_by,created_at,updated_at) VALUES(?,'google_drive',?,?,?,?,1,?,?,?) ON CONFLICT(provider) DO UPDATE SET account_email=excluded.account_email,display_name=excluded.display_name,root_folder_id=excluded.root_folder_id,encrypted_refresh_token=excluded.encrypted_refresh_token,active=1,created_by=excluded.created_by,updated_at=excluded.updated_at",crypto.randomUUID(),info.email,info.name??"",folder,await encrypt(token.refresh_token),adminId,now,now);cachedAccessToken=null;return {email:info.email,name:info.name??""};}
export async function driveConnection(){return row<DriveConnection>("SELECT * FROM external_connections WHERE provider='google_drive' AND active=1");}
export async function driveAccessToken(){const connection=await driveConnection();if(!connection)throw new HttpError(503,"Connect the intended Google Drive account in Admin Settings first.");if(cachedAccessToken&&cachedAccessToken.connectionId===connection.id&&cachedAccessToken.updatedAt===connection.updated_at&&cachedAccessToken.expiresAt>Date.now()+30000)return {accessToken:cachedAccessToken.value,connection};const token=await tokenRequest({client_id:env.GOOGLE_DRIVE_CLIENT_ID!,client_secret:env.GOOGLE_DRIVE_CLIENT_SECRET!,refresh_token:await decrypt(connection.encrypted_refresh_token),grant_type:"refresh_token"});cachedAccessToken={connectionId:connection.id,updatedAt:connection.updated_at,value:token.access_token!,expiresAt:Date.now()+(token.expires_in??3600)*1000};return {accessToken:token.access_token!,connection};}
export type StudioFolderCategory =
  | "Originals"
  | "Edited"
  | "Covers"
  | "Stories"
  | "Reels"
  | "Post images"
  | "Temporary exports";

const folderCache = new Map<string, string>();

export async function ensureStudioFolder(accessToken: string, rootFolderId: string, folderName: string): Promise<string> {
  const cacheKey = `${rootFolderId}:${folderName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey)!;
  }

  try {
    const query = encodeURIComponent(`'${rootFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json() as { files?: Array<{ id: string; name: string }> };
      if (data.files && data.files.length > 0 && data.files[0].id) {
        folderCache.set(cacheKey, data.files[0].id);
        return data.files[0].id;
      }
    }

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [rootFolderId]
      })
    });

    const createData = await createRes.json() as GoogleApiReply;
    if (!createRes.ok || !createData.id) {
      console.warn(`[Google Drive] Could not create folder "${folderName}", falling back to root folder`, createData);
      return rootFolderId;
    }

    folderCache.set(cacheKey, createData.id);
    return createData.id;
  } catch (err) {
    console.warn(`[Google Drive] Failed folder lookup for "${folderName}", fallback to root:`, err);
    return rootFolderId;
  }
}

export async function uploadToDrive(file: File, category?: StudioFolderCategory | string) {
  const { accessToken, connection } = await driveAccessToken();
  let targetFolderId = connection.root_folder_id;
  if (category) {
    targetFolderId = await ensureStudioFolder(accessToken, connection.root_folder_id, category);
  }
  const boundary = `afterglow_${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name: file.name.slice(0, 160), parents: [targetFolderId] });
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`,
    file,
    `\r\n--${boundary}--`
  ]);
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body
  });
  const result = await response.json() as { id?: string };
  if (!response.ok || !result.id) throw new HttpError(502, "The file could not be uploaded to Google Drive.");
  return result.id;
}
export async function driveFileResponse(fileId:string,range:string|null){const {accessToken}=await driveAccessToken();return fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,{headers:{Authorization:`Bearer ${accessToken}`,...(range?{Range:range}:{})}});}
export async function deleteDriveFile(fileId:string){const {accessToken}=await driveAccessToken();const response=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,{method:"DELETE",headers:{Authorization:`Bearer ${accessToken}`}});if(!response.ok&&response.status!==404)throw new HttpError(502,"The file could not be removed from Google Drive.");}
export async function disconnectDrive(){cachedAccessToken=null;await run("UPDATE external_connections SET active=0,updated_at=? WHERE provider='google_drive'",Date.now());}

export interface DriveStorageQuota {
  limit?: number;
  usage: number;
  usageInDrive: number;
  usageInDriveTrash: number;
  available?: number;
  usagePercent?: number;
}

export async function getDriveStorageQuota(): Promise<DriveStorageQuota | null> {
  try {
    const connection = await driveConnection();
    if (!connection) return null;
    const { accessToken } = await driveAccessToken();
    const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=storageQuota,user", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) return null;
    const data = await response.json() as {
      storageQuota?: {
        limit?: string;
        usage?: string;
        usageInDrive?: string;
        usageInDriveTrash?: string;
      };
    };
    if (!data.storageQuota) return null;
    const limit = data.storageQuota.limit ? Number(data.storageQuota.limit) : undefined;
    const usage = Number(data.storageQuota.usage ?? 0);
    const usageInDrive = Number(data.storageQuota.usageInDrive ?? 0);
    const usageInDriveTrash = Number(data.storageQuota.usageInDriveTrash ?? 0);
    const available = limit !== undefined ? Math.max(0, limit - usage) : undefined;
    const usagePercent = limit ? Math.min(100, Math.round((usage / limit) * 1000) / 10) : undefined;

    return {
      limit,
      usage,
      usageInDrive,
      usageInDriveTrash,
      available,
      usagePercent
    };
  } catch (err) {
    console.error("Failed to query Google Drive storage quota:", err);
    return null;
  }
}

export async function emptyDriveTrash(): Promise<void> {
  const { accessToken } = await driveAccessToken();
  const response = await fetch("https://www.googleapis.com/drive/v3/files/trash", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok && response.status !== 204) {
    throw new HttpError(502, "Could not empty Google Drive trash.");
  }
}
