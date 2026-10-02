'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,'0');
const fmt=n=>'₹'+(+n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bizDay=t=>{const d=new Date(t-7200000);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3000)};

/* ---------- fixed Instagram QR (@rainbow_mobiles1) ---------- */
const FIXED_QR='data:image/png;base64,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';

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
function receipt(b) {
  const p = b.price, d = new Date(b.ts);
  return `
    <div class="c">
      <b style="font-size:1.3em">Sri Rainbow Mobiles</b><br>
      GST : 37AWRPJ3091PIZN<br>
      Vuyyuru, Main Center<br>
      Krishna, Andhra Pradesh, India<br>
      Pincode - 521165<br>
      Mobile - 9291906669
    </div>
    <hr>
    <div class="split">
      <div class="addr">
        <b>STORE ADDRESS</b><br>
        India<br>
        Andhra Pradesh<br>
        Krishna<br>
        Vuyyuru<br>
        Main Center<br>
        Pincode - 521165<br>
        Mobile - 9291906669<br>
        GST : 37AWRPJ3091PIZN
      </div>
    </div>
    <div class="r"><span>Bill: ${esc(b.id)}</span></div>
    <div>${d.toLocaleDateString('en-IN')} ${d.toLocaleTimeString('en-IN')}</div><hr>
    <div>Customer: ${esc(b.cust.name)}</div>
    <div>Mobile: ${esc(b.cust.mobile)}</div>
    ${b.cust.email ? `<div>Email: ${esc(b.cust.email)}</div>` : ''}<hr>
    <div>${esc(b.dev.brand)} ${esc(b.dev.model)}</div>
    <div>IMEI: ${esc(b.dev.imei)}</div>
    <div>Warranty: ${esc(b.warranty.duration) || '-'}</div>
    ${b.warranty.notes ? `<div>${esc(b.warranty.notes)}</div>` : ''}<hr>
    <div class="r"><span>Original Price</span><span>${fmt(p.original)}</span></div>
    <div class="r"><span>Discount</span><span>-${fmt(p.discount)}</span></div>
    <div class="r"><span>Price after disc.</span><span>${fmt(p.after)}</span></div>
    <div class="r"><span>GST ${p.gstPct}%</span><span>+${fmt(p.gst)}</span></div>
    <div class="r" style="font-size:1.2em"><b>FINAL PRICE</b><b>${fmt(b.final)}</b></div>
    <div class="r"><span>Total Saved</span><b>${fmt(b.saved)}</b></div><hr>
    <div>Paid by: ${esc(b.pay.mode)}</div>
    ${b.pay.txn ? `<div>Txn ID: ${esc(b.pay.txn)}</div>` : ''}
    ${b.pay.details ? `<div>${esc(b.pay.details)}</div>` : ''}<hr>
    <div class="c">Scan for Instagram<img src="${b.qr||FIXED_QR}" alt="QR" style="width:120px"></div>
    <div class="c">Thank you! Visit again.</div>
  `;
}
function printBill(b){const w=b.width==='58'?'58mm':'80mm';
 let s=$('#pstyle');if(!s){s=document.createElement('style');s.id='pstyle';document.head.appendChild(s)}
 s.textContent=`@media print{@page{size:${w} auto;margin:2mm}body>#receipt{width:${w==='58mm'?'54mm':'76mm'}}}`;
 const r=$('#receipt');r.innerHTML=receipt(b);const imgs=[...r.querySelectorAll('img')];
 Promise.all(imgs.map(i=>i.decode?i.decode().catch(()=>{}):0)).then(()=>setTimeout(()=>window.print(),150))}

/* ---------- QR ---------- */
async function loadQR(){const q=await DB.get('qr')||FIXED_QR;$('#qb').innerHTML=q?`<img src="${q}" alt="Instagram QR">`:'Paste QR here'}
const saveQR=file=>{if(!file||!file.type.startsWith('image/'))return toast('Not an image');const r=new FileReader();r.onload=async()=>{await DB.set('qr',r.result);loadQR();toast('QR saved')};r.readAsDataURL(file)};
$('#qu').onclick=()=>$('#qf').click();$('#qf').onchange=e=>{saveQR(e.target.files[0]);e.target.value=''};
$('#qx').onclick=async()=>{await DB.del2('qr');loadQR();toast('QR removed')};
document.addEventListener('paste',e=>{if($('#v-bill').hidden)return;const f=[...(e.clipboardData?.files||[])][0];if(f)saveQR(f)});
$('#qp').onclick=async()=>{try{for(const it of await navigator.clipboard.read()){const t=it.types.find(x=>x.startsWith('image/'));if(t)return saveQR(new File([await it.getType(t)],'qr',{type:t}))}toast('No image on clipboard')}catch{toast('Clipboard unavailable — long-press/Ctrl+V on the box, or Upload')}};
$('#qb').onclick=()=>$('#qb').focus();

/* ---------- scanner ---------- */
let stream,scanning=false,scanT;
function stopScan(){scanning=false;clearTimeout(scanT);stream&&stream.getTracks().forEach(t=>t.stop());stream=null;$('#vid').srcObject=null;$('#scm').hidden=true}
$('#scx').onclick=stopScan;
const loadZX=()=>window.ZXing?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)});
const imeiFrom=t=>{const m=String(t||'').match(/\d{15}/);return m?m[0]:null};
$('#sc').onclick=async()=>{
 if(!navigator.mediaDevices?.getUserMedia)return toast('Camera not supported in this browser. Enter IMEI manually.');
 $('#scm').hidden=false;$('#sm').textContent='Starting camera… (scanner v2)';
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
  const v=$('#vid');v.srcObject=stream;await v.play();
  try{const tr=stream.getVideoTracks()[0],caps=tr.getCapabilities?tr.getCapabilities():{};
   if(caps.focusMode&&caps.focusMode.includes('continuous'))await tr.applyConstraints({advanced:[{focusMode:'continuous'}]})}catch{}
  let det=null,zr=null;
  if('BarcodeDetector'in window){try{det=new BarcodeDetector()}catch{}}
  loadZX().then(()=>{const Z=window.ZXing,h=new Map();
   h.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.CODE_128,Z.BarcodeFormat.CODE_39,Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.ITF,Z.BarcodeFormat.CODABAR,Z.BarcodeFormat.UPC_A]);
   h.set(Z.DecodeHintType.TRY_HARDER,true);zr=new Z.MultiFormatReader();zr.setHints(h)}).catch(()=>{});
  $('#sm').textContent=det?'Scanner v2 · native detector ready':'Scanner v2 · loading decoder…';
  const cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});
  const found=m=>{$('#im').value=m;stopScan();toast('IMEI scanned: '+m)};
  scanning=true;
  const tick=async()=>{
   if(!scanning)return;
   try{
    if(v.readyState>=2&&v.videoWidth){
     if(det){const r=await det.detect(v);
      for(const c of r){const m=imeiFrom(c.rawValue);if(m)return found(m);$('#sm').textContent='Read "'+c.rawValue+'" - not a 15-digit IMEI'}}
     if(scanning&&zr){const sc=Math.min(1,1280/v.videoWidth);cv.width=Math.round(v.videoWidth*sc);cv.height=Math.round(v.videoHeight*sc);
      cx.drawImage(v,0,0,cv.width,cv.height);
      try{const Z=window.ZXing,res=zr.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(cv))));
       const m=imeiFrom(res.getText());if(m)return found(m);$('#sm').textContent='Read "'+res.getText()+'" - not a 15-digit IMEI'}catch{}}
     if(scanning&&/^Scanner v2/.test($('#sm').textContent))$('#sm').textContent='Scanner v2 · hold the IMEI barcode steady, 15-25 cm away, fill the frame';
    }
   }catch{}
   if(scanning)scanT=setTimeout(tick,150)};
  tick();
 }catch(e){stopScan();toast(e.name==='NotAllowedError'?'Camera permission denied. Enter IMEI manually.':'Camera unavailable. Enter IMEI manually.')}};
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
