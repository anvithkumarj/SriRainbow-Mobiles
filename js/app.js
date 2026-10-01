'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,'0');
const fmt=n=>'₹'+(+n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bizDay=t=>{const d=new Date(t-7200000);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3000)};

/* ---------- storage ---------- */
let _db;
const open=()=>_db||(_db=new Promise((res,rej)=>{const r=indexedDB.open('srm',1);r.onupgradeneeded=()=>{r.result.createObjectStore('bills',{keyPath:'id'});r.result.createObjectStore('meta',{keyPath:'k'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
const run=async(st,mode,fn)=>{const db=await open();return new Promise((res,rej)=>{const t=db.transaction(st,mode);const r=fn(t.objectStore(st));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)})};
const DB={all:()=>run('bills','readonly',s=>s.getAll()),put:b=>run('bills','readwrite',s=>s.put(b)),del:id=>run('bills','readwrite',s=>s.delete(id)),
 get:k=>run('meta','readonly',s=>s.get(k)).then(r=>r&&r.v),set:(k,v)=>run('meta','readwrite',s=>s.put({k,v})),del2:k=>run('meta','readwrite',s=>s.delete(k)),
 async nextNo(){const n=((await DB.get('seq'))||0)+1;await DB.set('seq',n);return 'SRM'+String(n).padStart(6,'0')}};

/* ---------- auth / nav ---------- */
const authed=()=>sessionStorage.getItem('srm_auth')==='1';
let histFrom='login';
function go(v){if((v==='dash'||v==='bill')&&!authed())v='login';$$('.view').forEach(e=>e.hidden=e.id!=='v-'+v);window.scrollTo(0,0);
 if(v==='dash')sales();if(v==='hist')hist();if(v==='bill')loadQR()}
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$('#eye').onclick=()=>{const p=$('#lp');p.type=p.type==='password'?'text':'password'};
$('#lf').onsubmit=e=>{e.preventDefault();
 if($('#lu').value.trim()==='rainbow@9997'&&$('#lp').value==='9997'){sessionStorage.setItem('srm_auth','1');$('#le').textContent='';$('#lf').reset();go('dash');firstRun()}
 else $('#le').textContent='Invalid username or password.'};
$('#lo').onclick=()=>{sessionStorage.removeItem('srm_auth');go('login')};
$('#nb').onclick=()=>go('bill');
$('#vb').onclick=()=>{histFrom='dash';go('hist')};
$('#lb').onclick=()=>{histFrom='login';go('hist')};
$('#hb').onclick=()=>go(authed()?histFrom:'login');

/* ---------- sales ---------- */
async function sales(){const k=bizDay(Date.now()),b=(await DB.all()).filter(x=>x.bizDay===k);
 $('#ts').textContent=fmt(b.reduce((s,x)=>s+x.final,0));$('#tc').textContent=b.length+' bill(s) this business day';
 $('#td').textContent='Day runs 2:00 AM – 1:59 AM (started '+k+')'}
let lastKey=bizDay(Date.now());
setInterval(()=>{const k=bizDay(Date.now());if(k!==lastKey){lastKey=k;if(!$('#v-dash').hidden)sales()}},15000);

/* ---------- billing ---------- */
let pay='Cash';
$$('#pm button').forEach(b=>b.onclick=()=>{pay=b.dataset.p;$$('#pm button').forEach(x=>x.classList.toggle('on',x===b));$('#tx').hidden=pay!=='UPI';$('#po').hidden=pay!=='Other'});
const num=id=>Math.max(0,parseFloat($(id).value)||0);
function calc(){const o=num('#op'),d=Math.min(num('#dc'),o),g=Math.min(num('#gp'),100),a=o-d,ga=+(a*g/100).toFixed(2),f=+(a+ga).toFixed(2);
 $('#pa').textContent=fmt(a);$('#ga').textContent=fmt(ga);$('#fp').textContent=fmt(f);$('#sv').textContent=fmt(d);return{o,d,g,a,ga,f}}
['#op','#dc','#gp'].forEach(i=>$(i).addEventListener('input',calc));
$('#pw').value=localStorage.getItem('srm_pw')||'80';$('#pw').onchange=()=>localStorage.setItem('srm_pw',$('#pw').value);
const resetForm=()=>{$('#bf').reset();$('#gp').value=18;$('#pm button').click();calc();$('#be').textContent=''};
$('#rs').onclick=()=>{if(confirm('Clear the whole form?'))resetForm()};

$('#bf').onsubmit=async e=>{e.preventDefault();const c=calc(),er=$('#be'),v=id=>$(id).value.trim();
 let m='';
 if(!v('#cn'))m='Customer name is required.';
 else if(!/^[6-9]\d{9}$/.test(v('#cm')))m='Enter a valid 10-digit Indian mobile number.';
 else if(v('#ce')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('#ce')))m='Enter a valid email.';
 else if(!v('#br')||!v('#md'))m='Brand and model are required.';
 else if(!/^\d{15}$/.test(v('#im')))m='IMEI must be 15 digits.';
 else if(c.o<=0)m='Enter the original price.';
 else if(num('#dc')>c.o)m='Discount cannot exceed original price.';
 else if(pay==='UPI'&&!v('#tx'))m='UPI Transaction ID is required.';
 er.textContent=m;if(m)return;
 const now=Date.now(),b={id:await DB.nextNo(),ts:now,bizDay:bizDay(now),width:$('#pw').value,
  cust:{name:v('#cn'),mobile:v('#cm'),email:v('#ce')},dev:{brand:v('#br'),model:v('#md'),imei:v('#im')},
  warranty:{duration:v('#wd'),notes:v('#wn')},pay:{mode:pay,txn:pay==='UPI'?v('#tx'):'',details:pay==='Other'?v('#po'):''},
  price:{original:c.o,discount:c.d,gstPct:c.g,gst:c.ga,after:c.a},final:c.f,saved:c.d,qr:await DB.get('qr')||null};
 await DB.put(b);toast('Bill '+b.id+' saved');printBill(b);resetForm()};

/* ---------- receipt / print ---------- */
function receipt(b){const p=b.price,d=new Date(b.ts);
 return `<div class="c"><b style="font-size:1.3em">Sri Rainbow Mobiles</b><br>Vuyyuru, Main Center<br>Krishna, Andhra Pradesh, India<br>Pincode - 521165<br>Mobile - 9291906669</div><hr>
 <div class="r"><span>Bill: ${esc(b.id)}</span></div><div>${d.toLocaleDateString('en-IN')} ${d.toLocaleTimeString('en-IN')}</div><hr>
 <div>Customer: ${esc(b.cust.name)}</div><div>Mobile: ${esc(b.cust.mobile)}</div>${b.cust.email?`<div>Email: ${esc(b.cust.email)}</div>`:''}<hr>
 <div>${esc(b.dev.brand)} ${esc(b.dev.model)}</div><div>IMEI: ${esc(b.dev.imei)}</div>
 <div>Warranty: ${esc(b.warranty.duration)||'-'}</div>${b.warranty.notes?`<div>${esc(b.warranty.notes)}</div>`:''}<hr>
 <div class="r"><span>Original Price</span><span>${fmt(p.original)}</span></div><div class="r"><span>Discount</span><span>-${fmt(p.discount)}</span></div>
 <div class="r"><span>Price after disc.</span><span>${fmt(p.after)}</span></div><div class="r"><span>GST ${p.gstPct}%</span><span>+${fmt(p.gst)}</span></div>
 <div class="r" style="font-size:1.2em"><b>FINAL PRICE</b><b>${fmt(b.final)}</b></div><div class="r"><span>Total Saved</span><b>${fmt(b.saved)}</b></div><hr>
 <div>Paid by: ${esc(b.pay.mode)}</div>${b.pay.txn?`<div>Txn ID: ${esc(b.pay.txn)}</div>`:''}${b.pay.details?`<div>${esc(b.pay.details)}</div>`:''}<hr>
 ${b.qr?`<div class="c">Scan for Instagram<img src="${b.qr}" alt="QR"></div>`:''}<div class="c">Thank you! Visit again.</div>`}
function printBill(b){const w=b.width==='58'?'58mm':'80mm';
 let s=$('#pstyle');if(!s){s=document.createElement('style');s.id='pstyle';document.head.appendChild(s)}
 s.textContent=`@media print{@page{size:${w} auto;margin:2mm}body>#receipt{width:${w==='58mm'?'54mm':'76mm'}}}`;
 const r=$('#receipt');r.innerHTML=receipt(b);const imgs=[...r.querySelectorAll('img')];
 Promise.all(imgs.map(i=>i.decode?i.decode().catch(()=>{}):0)).then(()=>setTimeout(()=>window.print(),150))}

/* ---------- QR ---------- */
async function loadQR(){const q=await DB.get('qr');$('#qb').innerHTML=q?`<img src="${q}" alt="Instagram QR">`:'Paste QR here'}
const saveQR=file=>{if(!file||!file.type.startsWith('image/'))return toast('Not an image');const r=new FileReader();r.onload=async()=>{await DB.set('qr',r.result);loadQR();toast('QR saved')};r.readAsDataURL(file)};
$('#qu').onclick=()=>$('#qf').click();$('#qf').onchange=e=>{saveQR(e.target.files[0]);e.target.value=''};
$('#qx').onclick=async()=>{await DB.del2('qr');loadQR();toast('QR removed')};
document.addEventListener('paste',e=>{if($('#v-bill').hidden)return;const f=[...(e.clipboardData?.files||[])][0];if(f)saveQR(f)});
$('#qp').onclick=async()=>{try{for(const it of await navigator.clipboard.read()){const t=it.types.find(x=>x.startsWith('image/'));if(t)return saveQR(new File([await it.getType(t)],'qr',{type:t}))}toast('No image on clipboard')}catch{toast('Clipboard unavailable — long-press/Ctrl+V on the box, or Upload')}};
$('#qb').onclick=()=>$('#qb').focus();

/* ---------- scanner ---------- */
let stream,timer;
function stopScan(){clearInterval(timer);stream&&stream.getTracks().forEach(t=>t.stop());stream=null;$('#vid').srcObject=null;$('#scm').hidden=true}
$('#scx').onclick=stopScan;
$('#sc').onclick=async()=>{
 if(!('BarcodeDetector'in window)||!navigator.mediaDevices?.getUserMedia)return toast('Scanning not supported in this browser. Enter IMEI manually.');
 $('#scm').hidden=false;$('#sm').textContent='Starting camera…';
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const v=$('#vid');v.srcObject=stream;await v.play();
  const det=new BarcodeDetector({formats:['code_128','code_39','ean_13','itf','codabar','upc_a']});$('#sm').textContent='Point at the IMEI barcode';
  timer=setInterval(async()=>{try{for(const c of await det.detect(v)){const m=(c.rawValue.match(/\d{15}/)||[])[0];if(m){$('#im').value=m;stopScan();toast('IMEI scanned');return}$('#sm').textContent='Not a 15-digit IMEI, try again'}}catch{}},300)}
 catch(e){stopScan();toast(e.name==='NotAllowedError'?'Camera permission denied. Enter IMEI manually.':'Camera unavailable. Enter IMEI manually.')}};
$('#im').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'');
$('#cm').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'');

/* ---------- history ---------- */
let cur=null;
const yrs=()=>{const y=new Date().getFullYear(),s=$('#hy');if(s.options.length<2)for(let i=y;i>=y-6;i--)s.add(new Option(i,i))};
async function hist(){yrs();const q=$('#hs').value.trim().toLowerCase(),d=$('#hd').value,m=$('#hm').value,y=$('#hy').value;
 let l=(await DB.all()).sort((a,b)=>b.ts-a.ts);
 if(d)l=l.filter(b=>b.bizDay===d);if(m)l=l.filter(b=>b.bizDay.startsWith(m));if(y)l=l.filter(b=>b.bizDay.startsWith(y));
 if(q)l=l.filter(b=>[b.id,b.cust.name,b.cust.mobile,b.dev.imei].some(x=>String(x).toLowerCase().includes(q)));
 $('#sn').textContent=l.length;$('#st').textContent=fmt(l.reduce((s,b)=>s+b.final,0));
 $('#hl').innerHTML=l.length?l.map(b=>`<div class="hi" data-id="${esc(b.id)}"><div><b>${esc(b.id)}</b> · ${esc(b.cust.name)}<small>${esc(b.cust.mobile)} · ${esc(b.dev.brand)} ${esc(b.dev.model)}</small><small>${new Date(b.ts).toLocaleString('en-IN')} · ${esc(b.pay.mode)}</small></div><b>${fmt(b.final)}</b></div>`).join(''):'<p class="muted" style="color:#c9a47c">No bills found.</p>'}
['hs','hd','hm','hy'].forEach(i=>$('#'+i).addEventListener('input',hist));
$('#hd').addEventListener('change',()=>{if($('#hd').value){$('#hm').value='';$('#hy').value=''}hist()});
$('#hc').onclick=()=>{['#hs','#hd','#hm','#hy'].forEach(i=>$(i).value='');hist()};
$('#hl').onclick=async e=>{const el=e.target.closest('.hi');if(!el)return;cur=(await DB.all()).find(b=>b.id===el.dataset.id);if(!cur)return;$('#dr').innerHTML=receipt(cur);$('#dlg').hidden=false};
$('#dx').onclick=()=>$('#dlg').hidden=true;
$('#dp').onclick=()=>cur&&printBill(cur);
$('#dd').onclick=async()=>{if(cur&&confirm('Delete bill '+cur.id+'? This cannot be undone.')){await DB.del(cur.id);cur=null;$('#dlg').hidden=true;toast('Bill deleted');hist();sales()}};

/* ---------- permissions / PWA ---------- */
async function perms(){let m=[];
 try{if(navigator.storage?.persist)m.push(await navigator.storage.persist()?'Storage: persistent':'Storage: browser-managed')}catch{}
 try{const s=await navigator.mediaDevices.getUserMedia({video:true});s.getTracks().forEach(t=>t.stop());m.push('Camera: allowed')}catch{m.push('Camera: not granted')}
 localStorage.setItem('srm_perm','1');toast(m.join(' · '))}
function firstRun(){if(!localStorage.getItem('srm_perm')&&confirm('Allow camera (IMEI scanning) and persistent storage (saved bills)?'))perms();else localStorage.setItem('srm_perm','1')}
$('#perm').onclick=perms;
let ip;const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(!sa){$('#inst').hidden=$('#inst2').hidden=false;if(ios)[$('#inst'),$('#inst2')].forEach(b=>b.onclick=()=>toast('Tap Share → Add to Home Screen',6000))}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;$('#inst').hidden=$('#inst2').hidden=false});
window.addEventListener('appinstalled',()=>{$('#inst').hidden=$('#inst2').hidden=true;ip=null});
if(!ios)[$('#inst'),$('#inst2')].forEach(b=>b.onclick=async()=>{if(!ip)return toast('Use browser menu → Install app / Add to Home Screen');ip.prompt();await ip.userChoice;ip=null;b.hidden=true});
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
calc();go(authed()?'dash':'login');
