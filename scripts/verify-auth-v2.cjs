const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
const root=path.resolve(process.env.EXPORT_ROOT || 'exports/hidayah-v2-web'),output=path.resolve(process.env.REVIEW_OUTPUT || 'exports/hidayah-v2-auth-review');
fs.mkdirSync(output,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms)),Q=JSON.stringify,results=[],errors=[],networkFailures=[];
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.ttf':'font/ttf','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--autoplay-policy=no-user-gesture-required','--remote-debugging-port=9445','--user-data-dir='+path.join(output,'chrome-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let ws,ev,capture;
 try{
  let tabs;for(let i=0;i<40;i++){try{tabs=await(await fetch('http://127.0.0.1:9445/json')).json();break;}catch{await delay(250);}}
  if(!tabs)throw Error('Chrome did not start');
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();
  const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(Q({id:key,method,params}));});
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);
   if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(Q(m.error))):p.resolve(m.result);}
   if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
   if(m.method==='Network.loadingFailed'&&!m.params.canceled)networkFailures.push(m.params.errorText);
   if(m.method==='Page.javascriptDialogOpening')void send('Page.handleJavaScriptDialog',{accept:true});
  });
  ev=async expression=>{const data=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(data.exceptionDetails)throw Error(data.exceptionDetails.exception?.description||data.exceptionDetails.text);return data.result?.value;};
  const text=p=>'document.body.innerText.includes('+Q(p)+')';
  const has=l=>'!!document.querySelector('+Q('[aria-label='+Q(l)+']')+')';
  const until=async(expr,timeout=20000)=>{const start=Date.now();while(Date.now()-start<timeout){if(await ev(expr))return;await delay(200);}throw Error('Timed out: '+expr);};
  const check=async(name,expr)=>{if(!await ev(expr))throw Error('FAILED: '+name);results.push({name,pass:true});console.log('PASS '+name);};
  capture=async name=>{const i=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(i.data,'base64'));};
  const go=async route=>{await send('Page.navigate',{url:base+route});await until("document.readyState==='complete' && !!document.querySelector('[role=\"button\"]')");await delay(400);};
  const tap=async label=>{const selector=Q('[aria-label='+Q(label)+']');if(!await ev('(function(){const e=document.querySelector('+selector+');if(!e)return false;e.click();return true})()'))throw Error('Missing control '+label);await delay(200);};
  const tapText=async(label,exact=false)=>{
   const expr='(function(){const e=[...document.querySelectorAll(\'[role="button"],[role="tab"],[role="checkbox"],a\')].find(e=>'+(exact?'e.textContent.trim()==='+Q(label):'e.textContent.includes('+Q(label)+')')+');if(!e)return false;e.click();return true})()';
   if(!await ev(expr))throw Error('Missing text control '+label);await delay(200);
  };
  const fill=async(selector,value)=>{const expr='(function(){const e=document.querySelector('+Q(selector)+');if(!e)return false;const p=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,"value").set.call(e,'+Q(value)+');e.dispatchEvent(new Event("input",{bubbles:true}));return true})()';if(!await ev(expr))throw Error('Missing input '+selector);await delay(150);};

  await send('Page.enable');await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.removeItem('hidayah_user');localStorage.setItem('hidayah_theme_preference','dark');window.__registerRequests=[];const original=window.fetch.bind(window);window.fetch=async(...args)=>{if(String(args[0]).endsWith('/register')){window.__registerRequests.push(JSON.parse(args[1].body));return new Response(JSON.stringify({detail:'Registration validation reached the API test fixture.'}),{status:400,headers:{'Content-Type':'application/json'}});}return original(...args);};"});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
  for(const width of [320,390,1280]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
    await go('/login');await until(has('Login'));
    await check('Login stays light under dark OS at '+width,"getComputedStyle(document.documentElement).colorScheme==='light'");
    await check('Login has no appearance mode controls at '+width,'!'+has('Dark theme')+'&&!'+has('System theme'));
    await check('Login has no horizontal overflow at '+width,'document.documentElement.scrollWidth<=innerWidth+1');
    await ev("document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight&&['auto','scroll'].includes(getComputedStyle(e).overflowY))e.scrollTop=0});window.scrollTo(0,0)");await delay(100);
    await check('Login brand remains reachable at '+width,"document.querySelector('svg[viewBox=\"0 0 64 64\"]').getBoundingClientRect().top>=0");
    await capture('login-'+width);
    await tap('Register tab');await until(has('Confirm password'));
    await check('Register has exactly four inputs at '+width,"document.querySelectorAll('input').length===4");
    await check('Register has no student metadata fields at '+width,"!document.body.innerText.includes('Registration Number')&&!document.body.innerText.includes('Class')");
    await check('Register has no horizontal overflow at '+width,'document.documentElement.scrollWidth<=innerWidth+1');
    await ev("document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight&&['auto','scroll'].includes(getComputedStyle(e).overflowY))e.scrollTop=0});window.scrollTo(0,0)");await delay(100);
    await check('Register brand remains reachable at '+width,"document.querySelector('svg[viewBox=\"0 0 64 64\"]').getBoundingClientRect().top>=0");
    await capture('register-'+width);
  }
  await check('Browser title is Hidayah 2.0',"document.title==='Hidayah 2.0'");
  await check('Versioned favicon link is present',"!!document.querySelector('link[rel=\"icon\"][href*=\"hidayah-favicon.svg?v=2.0\"]')");
  await check('Favicon SVG responds',"fetch('/hidayah-favicon.svg').then(r=>r.ok)");
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await go('/login');await tap('Register tab');await tap('Create account');await check('Register requires all fields',text('Please complete all four fields.'));
  await fill('[aria-label="Full name"]','Huzaifa');await fill('[aria-label="Email"]','invalid');await fill('[aria-label="Password"]','test-password');await fill('[aria-label="Confirm password"]','test-password');await tap('Create account');await check('Email validation is inline',text('Enter a valid email address.'));
  await fill('[aria-label="Email"]','auth-review@example.test');await fill('[aria-label="Password"]','123');await fill('[aria-label="Confirm password"]','123');await tap('Create account');await check('Existing minimum password length is preserved',text('Password must be at least 4 characters.'));
  await fill('[aria-label="Password"]','test-password');await fill('[aria-label="Confirm password"]','different-password');await tap('Create account');await check('Password mismatch blocks registration',text('Passwords do not match.'));
  await check('Invalid registration never sends API requests',"window.__registerRequests.length===0");
  await check('Registration passwords start masked',"document.querySelector('[aria-label=\"Password\"]').type==='password'&&document.querySelector('[aria-label=\"Confirm password\"]').type==='password'");
  await tap('Show password');await check('Show password works without clearing its value',"document.querySelector('[aria-label=\"Password\"]').type==='text'&&document.querySelector('[aria-label=\"Password\"]').value==='test-password'");
  await tap('Hide password');await tap('Show confirm password');await check('Confirmation visibility is independent',"document.querySelector('[aria-label=\"Password\"]').type==='password'&&document.querySelector('[aria-label=\"Confirm password\"]').type==='text'");
  await tap('Hide confirm password');await fill('[aria-label="Confirm password"]','test-password');await check('Matching confirmation is acknowledged',text('Passwords match'));await tap('Create account');await until(text('Registration validation reached the API test fixture.'));
  await check('Register sends name email password only',"Object.keys(window.__registerRequests[0]).sort().join(',')==='email,name,password'");
  await check('Register retains fields after server rejection',"document.querySelector('[aria-label=\"Full name\"]').value==='Huzaifa'&&document.querySelector('[aria-label=\"Confirm password\"]').value==='test-password'");
  await capture('register-validation-390');
  await tap('Login tab');await tap('Login');await check('Login required validation still works',text('Please enter your email and password.'));
  await fill('[aria-label="Email"]','audit-nonexistent@example.com');await fill('[aria-label="Password"]','connection-check-only');await tap('Login');await until(text('Invalid email or password'),25000);await check('Login reaches unchanged real backend',text('Invalid email or password'));
  await ev("window.__realFetch=window.fetch;window.fetch=async()=>{throw new TypeError('Failed to fetch')}");
  await tap('Login');await until(text('The login server could not be reached.'));await check('Network error is recoverable',text('The login server could not be reached.'));await check('Submit is enabled after a failed request',"document.querySelector('[aria-label=\"Login\"]').getAttribute('aria-disabled')!=='true'");
  await ev("window.fetch=async()=>new Response(JSON.stringify({id:999999,name:'Huzaifa',email:'auth-review@example.test',registration_number:'AUTH_REVIEW_ONLY',class_name:null}),{status:200,headers:{'Content-Type':'application/json'}})");
  await tap('Login');await until(text('Assalamu Alaikum, Huzaifa'));await check('Successful session response opens existing Home',text('Assalamu Alaikum, Huzaifa'));
  await check('Internal account IDs are retained in session',"JSON.parse(localStorage.getItem('hidayah_user')).registration_number==='AUTH_REVIEW_ONLY'");
  await check('Header displays version 2.0',text('2.0'));
  await check('Home stays light under dark OS',"getComputedStyle(document.documentElement).colorScheme==='light'");
  await capture('home-v2-light');
  await check('No unhandled authentication runtime errors',Q(errors.length===0));

 }catch(e){results.push({name:'Audit interrupted',pass:false,error:e.message});if(ev)try{fs.writeFileSync(path.join(output,'failure-text.txt'),await ev('document.body.innerText'));await capture('failure');}catch{}console.error(e);process.exitCode=1;
 }finally{fs.writeFileSync(path.join(output,'results.json'),Q({testedAt:new Date().toISOString(),results,errors,networkFailures},null,2));console.log(results.filter(r=>r.pass).length+' authentication checks passed');ws?.close();chrome.kill();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
