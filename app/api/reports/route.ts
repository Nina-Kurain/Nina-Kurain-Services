import { currentUser, rateLimit } from "@/lib/server/auth";
import { body, endpoint, HttpError, json, run, sameOrigin } from "@/lib/server/db";
import { z } from "zod";

const reportSchema = z.object({
  category:z.enum(["minor_safety","deepfake","ncii","dmca","harassment","other"]),
  fullName:z.string().trim().min(2).max(120), email:z.string().email().max(254), relationship:z.string().trim().min(2).max(60),
  contentUrls:z.string().trim().min(3).max(5000), description:z.string().trim().max(5000).default(""), signature:z.string().trim().min(2).max(120), confirmed:z.boolean(),
});

export async function POST(request:Request){return endpoint(async()=>{sameOrigin(request);const ip=request.headers.get("cf-connecting-ip")||"unknown";await rateLimit(`public-report:${ip}`,5,3600);const input=reportSchema.parse(await body(request));if(!input.confirmed||input.signature.toLowerCase()!==input.fullName.toLowerCase())throw new HttpError(400,"Type your full legal name as the confirmation signature.");const user=await currentUser(false);const referenceCode=`NK-${crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase()}`;const now=Date.now();const priority=["minor_safety","ncii","deepfake"].includes(input.category)?"urgent":"normal";await run("INSERT INTO moderation_reports(id,reference_code,reporter_user_id,category,full_name,email,relationship,content_urls,description,signature,status,priority,confirmed,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",crypto.randomUUID(),referenceCode,user?.id??null,input.category,input.fullName,input.email,input.relationship,input.contentUrls,input.description,input.signature,"received",priority,1,now,now);return json({referenceCode,message:"Report received for safety review."},201);});}
