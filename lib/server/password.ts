import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024},(e,key)=>e?reject(e):resolve(key)));
export async function hashPassword(password:string){const salt=randomBytes(16).toString("hex");const key=await derive(password,salt);return `scrypt$32768$8$3$${salt}$${key.toString("hex")}`;}
export async function verifyPassword(password:string,encoded:string){const parts=encoded.split("$");if(parts.length!==6||parts.slice(0,4).join("$")!=="scrypt$32768$8$3")return false;const expected=Buffer.from(parts[5],"hex");if(expected.length!==64)return false;const actual=await derive(password,parts[4]);return timingSafeEqual(actual,expected);}
export const token=()=>randomBytes(32).toString("hex");
export async function digest(value:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Buffer.from(b).toString("hex");}
