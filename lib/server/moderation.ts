import { env } from "cloudflare:workers";

export type ModerationDecision = "quarantined" | "approved" | "rejected";

/** Uploads are quarantined by default so missing classifier configuration can never publish unsafe media. */
export async function screenUpload(input:{name:string; mime:string; bytes:number}):Promise<{status:ModerationDecision; reason:string; aiLabel:string|null}> {
  const endpoint = env.MODERATION_API_URL;
  if (!endpoint) return { status:"quarantined", reason:"Awaiting safety review before publication.", aiLabel:null };
  try {
    const response = await fetch(endpoint, {
      method:"POST",
      headers:{"content-type":"application/json", ...(env.MODERATION_API_KEY ? {authorization:`Bearer ${env.MODERATION_API_KEY}`} : {})},
      body:JSON.stringify({name:input.name, mime:input.mime, bytes:input.bytes}),
    });
    if (!response.ok) return { status:"quarantined", reason:"Automated safety screening is unavailable; manual review is required.", aiLabel:null };
    const result = await response.json() as {decision?:string; reason?:string; ai_label?:string|null};
    if (result.decision === "reject") return {status:"rejected", reason:result.reason || "Safety policy violation detected.", aiLabel:result.ai_label ?? null};
    if (result.decision === "approve") return {status:"approved", reason:result.reason || "Automated safety screening passed.", aiLabel:result.ai_label ?? null};
    return {status:"quarantined", reason:result.reason || "Manual safety review required.", aiLabel:result.ai_label ?? null};
  } catch {
    return { status:"quarantined", reason:"Automated safety screening failed safely closed; manual review is required.", aiLabel:null };
  }
}
