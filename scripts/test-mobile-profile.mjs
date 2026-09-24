// Isolated regression database; never reads production credentials or data.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import {scryptSync} from 'node:crypto';
import {createServer} from 'node:http';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const root=path.resolve(import.meta.dirname,'..');
const password='Local-regression-only-912!';
const salt='d46c92c6c54d3406a9cbe90ffbcd4ffe';
const hash=`scrypt$32768$8$3$${salt}$${scryptSync(password,salt,64,{N:32768,r:8,p:3,maxmem:67108864}).toString('hex')}`;
const modulePaths=(await readdir(path.join(root,'dist/server'),{recursive:true})).filter(x=>x.endsWith('.js')&&x!=='index.js');
const modules=['index.js',...modulePaths].map(p=>({type:'ESModule',path:path.join(root,'dist/server',p)}));
const mf=new Miniflare({modules,modulesRoot:path.join(root,'dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{APP_ENV:'local',APP_URL:'http://local',ADMIN_EMAIL:'admin@example.test',ADMIN_PASSWORD_HASH:hash,MEDIA_SIGNING_SECRET:'isolated-local-regression-secret-only'}});
const cookies=r=>r.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');
async function call(url,{data,cookie='',form}={}){
  const headers={Origin:'http://local',Cookie:cookie};let body;
  if(form){const req=new Request('http://local',{method:'POST',body:form});headers['Content-Type']=req.headers.get('content-type');body=await req.arrayBuffer();}
  if(data){headers['Content-Type']='application/json';body=JSON.stringify(data);}
  const r=await mf.dispatchFetch('http://local'+url,{method:body?'POST':'GET',headers,body});
  return {status:r.status,body:await r.json(),cookie:cookies(r)};
}
let checks=0;
function pass(label){checks++;console.log('PASS '+label);}
try{
  const db=await mf.getD1Database('DB');
  for(const name of (await readdir(path.join(root,'drizzle'))).filter(x=>x.endsWith('.sql')).sort()){
    for(const query of (await readFile(path.join(root,'drizzle',name),'utf8')).split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(query).run();
  }
  await call('/api/app/plans');
  const admin=await call('/api/auth/admin-login',{data:{email:'admin@example.test',password}});
  assert.equal(admin.status,200);const adminCookie=admin.cookie;
  const member=await call('/api/auth/signup',{data:{name:'QA Member',email:'member@example.test',password,confirmPassword:password}});
  assert.equal(member.status,201);const memberCookie=member.cookie;
  pass('real isolated admin and member sessions');
  const form=new FormData();form.set('file',new File([await readFile(path.join(root,'public/logo.png'))],'sample.png',{type:'image/png'}));
  const upload=await call('/api/studio/upload',{cookie:adminCookie,form});assert.equal(upload.status,201,JSON.stringify(upload.body));
  const asset=upload.body.id;
  const ids=[];
  for(let i=0;i<5;i++){
    const post=await call('/api/studio/post',{cookie:adminCookie,data:{title:`Mobile preview ${i+1}`,caption:i===0?'A long caption to test readable wrapping and scrolling. '.repeat(30):'A quiet moment from the private archive.',status:'published',published_at:Date.now()-1000,access_mode:i<2?'free':'level',minimum_level:i<2?0:i-1,comment_level:0,plan_ids:[],media_ids:[asset],cover_id:asset}});
    assert.equal(post.status,200,JSON.stringify(post.body));ids.push(post.body.id);
  }
  pass('image upload and published posts');
  const videoForm=new FormData();videoForm.set('file',new File([Buffer.from(await readFile(path.join(root,'scripts/video-fixture.base64'),'utf8'),'base64')],'sample.mp4',{type:'video/mp4'}));
  const video=await call('/api/studio/upload',{cookie:adminCookie,form:videoForm});assert.equal(video.status,201,JSON.stringify(video.body));
  const reel=await call('/api/studio/post',{cookie:adminCookie,data:{title:'Mobile reel',caption:'A reel caption for mobile preview. '.repeat(15),status:'published',published_at:Date.now()-1000,access_mode:'free',minimum_level:0,comment_level:0,plan_ids:[],media_ids:[video.body.id],cover_id:video.body.id}});assert.equal(reel.status,200);
  assert.equal(Boolean((await call('/api/studio/profile',{cookie:adminCookie})).body.posts.find(p=>p.id===reel.body.id).is_reel),true);
  pass('video upload automatically creates a reel');
  for(const cookie of ['',memberCookie])assert.equal((await call('/api/studio/save',{cookie,data:{postId:ids[0],selected:true}})).status,403);
  pass('admin save endpoint rejects anonymous and member sessions');
  for(let i=0;i<2;i++)assert.equal((await call('/api/studio/save',{cookie:adminCookie+'; '+memberCookie,data:{postId:ids[0],selected:true}})).status,200);
  let profile=await call('/api/studio/profile',{cookie:adminCookie});
  assert.equal(profile.body.posts.filter(p=>p.saved).length,1);
  assert.equal((await call('/api/app/feed?saved=1',{cookie:memberCookie})).body.posts.length,0);
  pass('admin bookmarks persist idempotently and remain separate with both cookies');
  await call('/api/app/save',{cookie:memberCookie,data:{postId:ids[1],selected:true}});
  await call('/api/studio/save',{cookie:adminCookie,data:{postId:ids[0],selected:false}});
  profile=await call('/api/studio/profile',{cookie:adminCookie});assert.equal(profile.body.posts.filter(p=>p.saved).length,0);
  assert.equal((await call('/api/app/feed?saved=1',{cookie:memberCookie})).body.posts[0].id,ids[1]);
  pass('admin unsave preserves member bookmarks and all profile posts');
  await call('/api/studio/like',{cookie:adminCookie,data:{postId:ids[0],selected:true}});
  profile=await call('/api/studio/profile',{cookie:adminCookie});assert.equal(profile.body.posts.find(p=>p.id===ids[0]).liked,1);
  pass('admin like state returned by profile API');
  const comment=await call('/api/studio/comment',{cookie:adminCookie,data:{postId:ids[0],body:'Creator comment for the mobile layout.'}});assert.equal(comment.status,200);
  const reply=await call('/api/app/comment',{cookie:memberCookie,data:{postId:ids[0],parentId:comment.body.id,body:'A member reply.'}});assert.equal(reply.status,200);
  const comments=await call('/api/studio/comments/'+ids[0],{cookie:adminCookie});assert.equal(comments.body.comments.length,2);assert.equal(comments.body.canComment,true);
  pass('creator comments and member replies persist');
  assert.equal((await call('/api/app/feed',{cookie:memberCookie})).body.posts.length,3);
  pass('free members receive only demos despite admin preview access');
  console.log(`${checks} mobile profile API checks passed.`);
  if(process.argv.includes('--serve')){
    // Local-only UI fixture proxy: attach an authentic test session, not a bypass.
    // No production credentials, external services, or persistent user data.
    const server=createServer(async(req,res)=>{
      try{
        const url=new URL(req.url,'http://127.0.0.1:4179');
        if(url.pathname==='/qa'){
          const width=[320,390,768,1024].includes(Number(url.searchParams.get('width')))?Number(url.searchParams.get('width')):390;
          res.setHeader('Content-Type','text/html');res.end(`<!doctype html><title>Mobile regression preview</title><style>body{margin:0;background:#ddd;font:14px system-ui}nav{padding:8px}iframe{display:block;border:0;background:white}</style><nav>Local test database · ${[320,390,768,1024].map(w=>`<a href="/qa?width=${w}">${w}px</a>`).join(' · ')}</nav><iframe title="Creator mobile preview" src="/admin/profile" style="width:${width}px;height:844px"></iframe>`);return;
        }
        const safePath=decodeURIComponent(url.pathname).replace(/^\/+/, '');
        if(!safePath.split('/').includes('..'))for(const dir of ['dist/client','public']){
          try{const file=await readFile(path.join(root,dir,safePath));const ext=path.extname(safePath);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'})[ext]||'application/octet-stream');res.end(file);return;}catch{}
        }
        const chunks=[];for await(const chunk of req)chunks.push(chunk);
        const headers=new Headers(req.headers);headers.set('Cookie',adminCookie);headers.set('Origin','http://local');headers.delete('host');headers.delete('accept-encoding');
        const response=await mf.dispatchFetch('http://local'+req.url,{method:req.method,headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})});
        res.statusCode=response.status;
        response.headers.forEach((v,k)=>{if(!['content-encoding','content-length','transfer-encoding','set-cookie'].includes(k))res.setHeader(k,v);});
        res.end(Buffer.from(await response.arrayBuffer()));
      }catch(err){res.statusCode=500;res.end(String(err));}
    });
    server.listen(4179,'127.0.0.1',()=>console.log('Local QA preview http://127.0.0.1:4179/qa'));
    await new Promise(resolve=>{process.once('SIGINT',()=>server.close(resolve));process.once('SIGTERM',()=>server.close(resolve));});
  }
}finally{await mf.dispose();}
