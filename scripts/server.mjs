import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist'),runtime=path.join(root,'.runtime');
fs.mkdirSync(runtime,{recursive:true});
if(!fs.existsSync(path.join(dist,'index.html')))throw new Error('Please run npm run build first.');
const token=randomBytes(24).toString('hex'),stateFile=path.join(runtime,'server.json');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname==='/__atlas/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({app:'gdut-campus-atlas',port:server.address().port}));}
 if(url.pathname==='/__atlas/stop'&&req.method==='POST'&&req.headers['x-atlas-token']===token){res.end('stopping');server.close(()=>process.exit(0));return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let decoded;try{decoded=decodeURIComponent(url.pathname);}catch{res.writeHead(400);return res.end();}
 let base=dist,file=path.resolve(dist,'.'+(decoded==='/'?'/index.html':decoded));
 // Research-only comparison: loopback server only; deliberately excluded from dist/.
 if(decoded.startsWith('/__review/')){
  const leaf=decoded.slice('/__review/'.length);
  if(leaf===''||leaf==='index.html'){base=path.join(root,'research');file=path.join(base,'photo-view-review.html');}
  else if(/^ref\/[a-z0-9_-]+\.(jpg|png)$/.test(leaf)){base=path.join(root,'research/cache');file=path.join(base,leaf.slice(4));}
  else if(/^render\/[a-z0-9_-]+\.jpg$/.test(leaf)){base=path.join(root,'output/photo-audit');file=path.join(base,leaf.slice(7));}
  else if(leaf==='map.svg'){base=path.join(root,'output/photo-audit');file=path.join(base,'map.svg');}
  else if(leaf==='ground.svg'){base=path.join(root,'output/pdf-audit');file=path.join(base,'ground-overlay.svg');}
  else{res.writeHead(404);return res.end('Not found');}
 }
 if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
 if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
let port=Number(process.env.ATLAS_PORT||4173);
server.on('error',err=>{if(err.code==='EADDRINUSE'&&port<4273){port++;server.listen(port,'127.0.0.1');}else{console.error(err);process.exit(1);}});
server.on('listening',()=>{
 const url=`http://127.0.0.1:${port}`;
 fs.writeFileSync(stateFile,JSON.stringify({pid:process.pid,port,url,token,started:new Date().toISOString()},null,2));
 console.log(`GDUT campus map: ${url}`);
 if(process.argv.includes('--open'))spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'}).unref();
});
process.on('exit',()=>{try{if(JSON.parse(fs.readFileSync(stateFile)).pid===process.pid)fs.unlinkSync(stateFile);}catch{}});
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
server.listen(port,'127.0.0.1');
