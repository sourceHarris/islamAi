const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const output=path.resolve('exports/live-preview');fs.mkdirSync(output,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9447','--user-data-dir='+path.join(output,'chrome-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;try{let tabs;for(let i=0;i<40;i++){try{tabs=await(await fetch('http://127.0.0.1:9447/json')).json();break;}catch{await delay(250);}}
if(!tabs)throw Error('Chrome did not start');ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Page.navigate',{url:'http://localhost:8081/'});
let state;
for(let i=0;i<120;i++){const r=await send('Runtime.evaluate',{expression:'({title:document.title,url:location.href,login:!!document.querySelector(\'[aria-label="Login"]\'),body:document.body?.innerText?.slice(0,500)})',returnByValue:true});state=r.result?.value;if(state?.login||errors.length)break;await delay(500);}
const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,'live-login.png'),Buffer.from(shot.data,'base64'));
fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({testedAt:new Date().toISOString(),state,errors},null,2));console.log(JSON.stringify({state,errors},null,2));if(!state?.login||errors.length)process.exitCode=1;
}finally{ws?.close();chrome.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
