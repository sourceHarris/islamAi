// Render the authored SVG as a PNG for Expo's icon pipeline. No image dependency added.
const fs = require('node:fs'), path = require('node:path'), { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const output = path.resolve('exports/branding');
fs.mkdirSync(output, { recursive: true });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9443','--user-data-dir=' + path.join(output,'chrome-profile'),'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let ws;
  try {
    let tabs;
    for (let i=0;i<40;i++) { try { tabs = await (await fetch('http://127.0.0.1:9443/json')).json(); break; } catch { await delay(250); } }
    if (!tabs) throw Error('Chrome did not start');
    ws = new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
    await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
    let id=0; const pending=new Map();
    ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
    const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride',{width:256,height:256,deviceScaleFactor:1,mobile:false});
    await send('Emulation.setDefaultBackgroundColorOverride',{color:{r:0,g:0,b:0,a:0}});
    await send('Page.navigate',{url:pathToFileURL(path.resolve('public/hidayah-favicon.svg')).href});
    await delay(300);
    await send('Runtime.evaluate',{expression:"document.documentElement.setAttribute('width','256');document.documentElement.setAttribute('height','256')"});
    await delay(100);
    const shot=await send('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width:256,height:256,scale:1}});
    fs.writeFileSync('assets/images/hidayah-favicon.png',Buffer.from(shot.data,'base64'));
    console.log('Generated 256px Hidayah favicon from public/hidayah-favicon.svg');
  } finally { ws?.close();chrome.kill(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
