"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { State, useData, api } from "@/app/live-client";
import { ShieldCheck, UserCheck, XCircle } from "lucide-react";

export function TrustSafety(){
  const data=useData<{media:any[];reports:any[]}>("/api/studio/moderation",30000); const [busy,setBusy]=useState("");
  async function moderate(id:string,decision:"approved"|"rejected"){setBusy(id);try{await api("/api/studio/moderate-media",{id,decision,reason:decision==="approved"?"Reviewed and approved by administrator.":"Rejected during safety review."});await data.refresh();}catch{}finally{setBusy("");}}
  if(data.loading&&!data.data)return <State loading={true} error="" retry={()=>void data.refresh()}/>; if(data.error)return <State loading={false} error={data.error} retry={()=>void data.refresh()}/>;const media=data.data?.media??[],reports=data.data?.reports??[];
  return <><div className="demo-page-title"><div><span className="section-kicker">TRUST &amp; SAFETY</span><h1>Moderation queue.</h1><p>Uploads stay private until reviewed. Urgent reports are shown first and every decision is recorded.</p></div></div><div className="live-grid two"><section className="live-panel"><h2><ShieldCheck size={18}/> Pending uploads</h2>{media.length?media.map(item=><article key={item.id} className="live-comment"><strong>{item.name}</strong><small>{item.mime} · {item.moderation_status}</small><p>{item.moderation_reason||"Awaiting review."}</p><div className="live-toolbar"><Button disabled={busy===item.id} onClick={()=>moderate(item.id,"approved")}><UserCheck size={14}/>Approve</Button><Button variant="outline" disabled={busy===item.id} onClick={()=>moderate(item.id,"rejected")}><XCircle size={14}/>Reject &amp; delete</Button></div></article>):<p>No pending uploads.</p>}</section><section className="live-panel"><h2>Reports</h2>{reports.length?reports.map(report=><article key={report.id} className="live-comment"><strong>{report.priority.toUpperCase()} · {report.category}</strong><small>{report.reference_code} · {report.email}</small><p>{report.description||report.content_urls}</p><small>Status: {report.status}</small></article>):<p>No open reports.</p>}</section></div></>;
}
