(function(){

let DATA='';
const $=id=>document.getElementById(id);
const rp=v=>(!v||isNaN(v))?'-':'Rp '+Math.round(v).toLocaleString('id-ID');
const pc=v=>(Math.round(v*100)/100)+'%';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let D,sel=null,manual=0,popP='',popD='';
const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
$('dt').value=today;
const st=p=>{const t=$('dt').value;return t<p[2]?'n':t>p[3]?'x':'a'};
const bd=p=>{const s=st(p);return `<span class="b ${s}">${{a:'Aktif',n:'Belum mulai',x:'Berakhir'}[s]}</span>`};
const per=p=>p[2].slice(8)+'/'+p[2].slice(5,7)+'/'+p[2].slice(2,4)+' – '+p[3].slice(8)+'/'+p[3].slice(5,7)+'/'+p[3].slice(2,4);
const pn=p=>`${esc(p[1])} <div class="muted">${p[0]} · ${per(p)}</div>`;
let LR=[],RLIM=100;
function listR(){const r=LR;$('out').innerHTML=`<div class="panel"><h2>Pilih barang<small>${r.length>5000?'5000+':r.length} hasil</small></h2><div class="tw"><table class="list"><thead><tr><th>No Item</th><th>Barcode</th><th>Description</th><th>Brand</th><th>Brand Code</th></tr></thead><tbody>${r.slice(0,RLIM).map(i=>`<tr tabindex="0" data-n="${i[0]}"><td>${i[0]}</td><td>${i[1]||'-'}</td><td>${esc(i[2])}</td><td>${esc(i[4])}</td><td>${i[3]||'-'}</td></tr>`).join('')}</tbody></table></div>${r.length>RLIM?`<div class="muted" style="margin-top:8px">Menampilkan ${RLIM} dari ${r.length}. <button class="btn fb" data-more="1">Tampilkan 200 lagi</button></div>`:''}</div>`}
function nf(n){const base='<div class="hint panel">Tidak ada barang yang cocok. Cek ejaan atau kurangi kata kunci.</div>';if(!n||!window.itemOf)return base;
 const it=window.itemOf(n),w=window.stockOf&&window.stockOf(n);if(!it&&!(w&&w.found))return base;
 const mb=it&&it.m?it.m:'',key=mb.toLowerCase(),codes=new Map();
 if(key)for(const i of D.items){if(i[3]&&(i[5].toLowerCase()===key||i[4].toLowerCase()===key))codes.set(i[3],(codes.get(i[3])||0)+1)}
 const all=$('all').checked,rows=[];
 codes.forEach((cnt,code)=>(D.bp[code]||[]).forEach(r=>{const p=D.promos[r[1]];if(all||st(p)==='a')rows.push(`<tr><td>${esc(code)}<div class="muted">${cnt} barang</div></td><td>${esc(p[1])}<div class="muted">${p[0]}</div></td><td>${per(p)}</td><td>${r[0]==='D'?'Promo Discount':'Total Offer'}</td><td class="num">${pc(r[2])}</td></tr>`)}));
 return `<div class="panel"><h2>Barang ada di data stok, tetapi tidak ada di master item promo</h2><div class="desc">${esc(it?it.n:n)}</div><div class="muted" style="margin:6px 0">${esc(n)}${it&&it.b?' · '+esc(it.b):''}${mb?' · '+esc(mb):''}${it&&it.s?' · '+esc(it.s):''} · Stok toko ${w?w.t:'-'} · DC ${w?w.d:'-'}</div>
 <div class="vd warn">Promo level barang tidak bisa terbaca karena kode ini tidak ada di master item promo. Import master item atau data promo terbaru bila barang ini baru, dan pastikan nomor itemnya sama di file promo.</div>
 ${rows.length?`<h2 style="margin-top:14px">Promo brand yang mungkin berlaku (perkiraan dari nama brand ${esc(mb)})</h2>${tbl(['Kode brand','Promo','Periode','Jenis','Disc'],rows,'',1)}<div class="muted">Berdasarkan kode brand ${[...codes.keys()].map(esc).join(', ')}. Pastikan brand code barang ini sesuai sebelum dipakai.</div>`:(key?'<div class="muted" style="margin-top:10px">Tidak ada promo brand untuk '+esc(mb)+' pada tanggal ini.</div>':'')}</div>`}
function search(){
 if(!D)return;
 const g=id=>$(id).value.trim().toLowerCase(),m=g('fm'),b=g('fb'),c=g('fc'),n=g('fn'),d=g('fd').split(/\s+/).filter(Boolean);
 if(!(m||b||c||n||d.length)){sel=null;$('out').innerHTML='<div class="hint panel">Isi salah satu kolom di atas, misalnya scan barcode atau ketik sebagian nama barang.</div>';return}
 const r=[];
 for(const i of D.items){
  if(n&&!(i[0].toLowerCase()===n||i[1]===n||(n.length>=4&&(i[0].toLowerCase().includes(n)||i[1].includes(n)))))continue;
  if(m&&!i[5].toLowerCase().includes(m))continue;
  if(b&&!i[4].toLowerCase().includes(b))continue;
  if(c&&i[3].toLowerCase()!==c)continue;
  if(d.length&&!d.every(t=>i.l.includes(t)))continue;
  r.push(i);if(r.length>5000)break;
 }
 const ex=n&&r.find(i=>i[0].toLowerCase()===n||i[1]===n);
 if(ex||r.length===1){show(ex||r[0]);return}
 sel=null;
 if(!r.length){$('out').innerHTML=nf(n);return}
 LR=r;RLIM=100;listR();
}
$('out').addEventListener('click',e=>{if(e.target.dataset.more){RLIM+=200;listR();return}const t=e.target.closest('tr[data-n]');if(t)show(D.items.find(i=>i[0]===t.dataset.n))});
$('out').addEventListener('keydown',e=>{if(e.key==='Enter'){const t=e.target.closest('tr[data-n]');if(t)show(D.items.find(i=>i[0]===t.dataset.n))}});
let tm;['fm','fb','fc','fn','fd'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(search,220)}));
$('fn').addEventListener('keydown',e=>{if(e.key==='Enter'){clearTimeout(tm);search()}});
$('dt').addEventListener('change',()=>sel&&show(sel,1));$('all').addEventListener('change',()=>sel&&show(sel,1));
function stkOf(no){const w=window.stockOf&&window.stockOf(no);return w?(w.found?w.t:null):(D.stock[no]==null?null:D.stock[no])}
function skH(no){const w=window.stockOf&&window.stockOf(no);if(w){const v=w.t;return `<div class="v"${v<0?' style="color:var(--bad)"':''}>${v}</div><div class="k">${w.found?'':'Tidak tercatat di laporan · '}Stok toko, data ${esc(w.date)}</div><div class="k">Stok DC: ${w.d}</div>`}const s=D.stock[no];if(D.si){const v=s==null?0:s;return `<div class="v"${v<0?' style="color:var(--bad)"':''}>${v}</div><div class="k">${s==null?'Tidak tercatat di IMR · ':''}IMR ${esc(D.si.date)}</div>`}return s!=null?`<div class="v">${s}</div>`:`<div class="v muted" style="font-size:15px">Belum ada data</div><div class="k">Import laporan stok (IMR)</div>`}
function tbl(h,rows,note,noF){if(!noF)h=[...h,'Temuan'];return `<div class="tw"><table><thead><tr>${h.map((x,i)=>`<th${/^(Disc|Harga|Min|Hemat|Stok)/.test(x)?' class="num"':''}>${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${h.length}" class="muted">${note||'Tidak ada promo.'}</td></tr>`}</tbody></table></div>`}
function sec(t,sub,body){return `<div class="panel"><h2>${t}<small>${sub}</small></h2>${body}</div>`}
function show(it,keep){
 if(!keep){manual=0;popP='';popD=''}
 sel=it;FR=[];const no=it[0],all=$('all').checked;
 const np=D.price[no]||manual,P=D.promos,ip=D.ip[no]||[],bp=(it[3]&&D.bp[it[3]])||[];
 const vis=p=>all||st(p)==='a';
 const F=(pt,ct,p,disc,qty)=>fb({popType:pt,codeType:ct,codeId:ct==='Brand'?it[3]:no,brand:it[4],desc:ct==='Brand'?it[4]:it[2],disc,promoName:p[1],promoNo:p[0],qty,start:p[2],end:p[3],stock:stkOf(no)||0,itemNo:no});
 const cand=[];const nm=np?[{k:'normal',label:'Harga normal',price:np,act:true}]:[];cand.push(...nm);
 const hid=[];const keepr=(p)=>{if(!vis(p)){hid.push(1);return false}return true};
 const dRows=[],bRows=[],mRows=[],mbRows=[],tRows=[];const bAct=[],iAct=[];
 for(const r of ip){const p=P[r[1]],a=st(p)==='a';
  if(r[0]==='D'){cand.push({k:'p',label:'Promo discount '+pc(r[2]),price:r[3],act:a,d:r[2]});if(a)iAct.push(r[3]);
   if(keepr(p))dRows.push(`<tr><td>${pn(p)}</td><td class="num">${pc(r[2])}</td><td class="num">${rp(np)}</td><td class="num"><b>${rp(r[3])}</b></td><td>${esc(r[4])||'-'}</td><td>${bd(p)}</td><td>${F('Add. Discount Offer','Item',p,r[2],1)}</td></tr>`)}
  if(r[0]==='M'){cand.push({k:'p',label:'Mix & Match grup '+r[4],price:r[5],act:a,d:r[2]});
   if(keepr(p))mRows.push(`<tr><td>${pn(p)}</td><td>${r[4]||'-'}</td><td class="num">${pc(r[2])}</td><td class="num">${r[3]}</td><td class="num"><b>${rp(r[5])}</b></td><td>${esc(r[6])||'-'}</td><td>${bd(p)}</td><td>${F('Mix And Match','Item',p,r[2],r[3])}</td></tr>`)}
  if(r[0]==='B'){const h=np?(1-r[4]/np)*100:0;cand.push({k:'p',label:`MultiBuy ${r[2]}–${r[3]>=9999?'∞':r[3]} pcs`,price:r[4],act:a,d:h});
   if(keepr(p))mbRows.push(`<tr><td>${pn(p)}</td><td class="num">${r[2]} – ${r[3]>=9999?'∞':r[3]}</td><td class="num"><b>${rp(r[4])}</b></td><td class="num">${np?pc(h):'-'}</td><td>${esc(r[5])||'-'}</td><td>${bd(p)}</td><td>${F('Multi-Buy','Item',p,h,r[2])}</td></tr>`)}
  if(r[0]==='T'){const pr=np*(1-r[2]/100);if(np)cand.push({k:'p',label:'Total Offer '+pc(r[2]),price:pr,act:a,d:r[2]});
   if(keepr(p))tRows.push(`<tr><td>${pn(p)}</td><td>Item</td><td class="num">+${pc(r[2])}</td><td class="num">${np?rp(pr):'-'}</td><td>${bd(p)}</td><td>${F('Total Offer','Item',p,r[2],1)}</td></tr>`)}}
 for(const r of bp){const p=P[r[1]],a=st(p)==='a',pr=np*(1-r[2]/100);
  if(np)cand.push({k:'p',label:`Disc brand ${pc(r[2])}`,price:pr,act:a,d:r[2]});if(a)bAct.push(r[2]);
  if(keepr(p)){const row=`<tr><td>${pn(p)}</td><td>${r[0]==='D'?'Promo Discount':'Total Offer'}</td><td>${it[3]}</td><td class="num">${pc(r[2])}</td><td class="num">${np?rp(pr):'-'}</td><td>${bd(p)}</td><td>${F(r[0]==='D'?'Add. Discount Offer':'Total Offer','Brand',p,r[2],1)}</td></tr>`;bRows.push(row)}}
 if(np)for(const r of ip.filter(x=>x[0]==='D'&&st(P[x[1]])==='a'))for(const q of bp.filter(x=>st(P[x[1]])==='a'))cand.push({k:'c',label:`Kombinasi: promo item ${pc(r[2])} lalu brand ${pc(q[2])}`,price:r[3]*(1-q[2]/100),act:true,d:r[2]});
 // tebus murah
 const cat=D.cats[it[6]],tb=[];
 for(const k in D.tab){const p=P[k];if(!vis(p))continue;const [step,rows]=D.tab[k];const ben=rows.filter(x=>!x[0]||x[0]===cat);
  if(ben.length)tb.push(`<tr><td>${pn(p)}</td><td class="num">${rp(step)}</td><td>${ben.slice(0,8).map(x=>`${esc(x[2])} <b>${rp(x[3])}</b>`).join('<br>')}${ben.length>8?`<br><span class="muted">+${ben.length-8} lainnya</span>`:''}</td><td>${bd(p)}</td></tr>`)}
 const nAct=cand.filter(c=>c.act&&c.k!=='normal').length;
 const hidN=(()=>{let n=0;for(const r of ip)if(st(P[r[1]])!=='a')n++;for(const r of bp)if(st(P[r[1]])!=='a')n++;return n})();
 const noA=(!nAct&&hidN&&!all)?`<div class="vd warn">Tidak ada promo aktif pada ${esc($('dt').value)}. Ada ${hidN} promo tidak aktif (sudah berakhir atau belum mulai) yang disembunyikan. Centang "Tampilkan promo tidak aktif" untuk melihatnya. Kalau seharusnya ada promo baru, import data promo terbaru dulu.</div>`:'';
 const noP=!np?`<div class="vd warn" style="margin:0 0 12px">Harga normal belum ada di file promo untuk item ini (item hanya kena promo brand / tidak ada di laporan promo). Isi harga normal manual: <input type="number" id="man" style="width:160px;margin-left:6px" value="${manual||''}" placeholder="Rp"></div>`:'';
 $('out').innerHTML=`<div class="panel"><div class="info">
 <div><div class="k">Master Brand</div><div class="v">${esc(it[5])||'-'}</div></div><div><div class="k">Brand</div><div class="v">${esc(it[4])||'-'}</div></div>
 <div><div class="k">Brand Code</div><div class="v">${it[3]||'-'}</div></div><div><div class="k">No Item</div><div class="v">${no}</div></div>
 <div><div class="k">Barcode</div><div class="v">${it[1]||'-'}</div></div><div><div class="k">Stok saat ini</div>${skH(no)}</div><div><div class="k">Harga normal (inc)</div><div class="v">${rp(np)}</div></div><div><div class="k">Sample pajangan</div><div class="v" style="font-size:15px">${sampleTxt(no)}</div></div><div><div class="k">Promo aktif</div><div class="v">${nAct}</div></div></div>
 <div class="k muted" style="margin-top:12px">Description</div><div class="desc">${esc(it[2])}</div>${it[3]?'':'<div class="muted" style="margin-top:6px">Item ini tidak ada di All Active Item, jadi promo brand tidak bisa dicocokkan.</div>'}</div>
 <div class="panel"><h2>Cek POP</h2><div class="bar" style="margin:0 0 10px"><label>Jenis temuan <select id="rs">${RSN.map(r=>`<option${r===rsel?' selected':''}>${r}</option>`).join('')}</select></label><label>Tugaskan ke <select id="as0">${asOpts(asel)}</select></label><button class="btn" id="xi">Export Excel</button><span>Jika POP belum terpasang atau salah, klik “+ Temuan” pada promo yang seharusnya terpasang.</span></div>${noA}${noP}<div class="pop"><div><label class="k" for="pp">Harga di POP (Rp)</label><input type="number" id="pp" value="${popP}" placeholder="mis. 129000"></div><div><label class="k" for="pd">Diskon di POP (%) – opsional</label><input type="number" id="pd" value="${popD}" step="any" placeholder="mis. 10"></div></div><div id="vd"></div></div>
 ${sec('Promo Discount','harga promo item',tbl(['Promo','Disc','Harga normal','Harga promo','POP/sign di sistem','Status'],dRows))}
 ${sec('Disc by Brand','dicocokkan lewat Brand Code '+(it[3]||'-'),tbl(['Promo','Sumber','Brand Code','Disc','Harga setelah disc','Status'],bRows,it[3]?'Tidak ada promo untuk brand code ini.':'Brand code tidak diketahui.'))}
 ${sec('Mix &amp; Match','',tbl(['Promo','Line Group','Disc','Item dibutuhkan','Harga promo','POP/sign di sistem','Status'],mRows))}
 ${sec('MultiBuy','harga turun sesuai jumlah beli',tbl(['Promo','Min – Max Qty','Harga per unit','Hemat','POP/sign di sistem','Status'],mbRows))}
 ${sec('Total Offer','',tbl(['Promo','Berlaku','Disc','Harga setelah disc','Status'],tRows))}
 ${sec('Tebus Murah','kategori '+esc(cat),tbl(['Promo','Min. belanja','Barang tebus','Status'],tb,'',1))}
 ${hidN&&!all?`<div class="muted" style="padding:0 4px">${hidN} promo tidak aktif pada ${$('dt').value} disembunyikan. Centang "Tampilkan promo tidak aktif" untuk melihatnya.</div>`:''}`;
 const run=()=>{popP=$('pp').value;popD=$('pd').value;verdict(cand,iAct,bAct)};
 $('pp').addEventListener('input',run);$('pd').addEventListener('input',run);
 if($('man'))$('man').addEventListener('change',e=>{manual=+e.target.value||0;show(it,1)});
 verdict(cand,iAct,bAct);
}
function verdict(cand,iAct,bAct){
 const v=+popP,dv=popD===''?null:+popD,box=$('vd'),L=[];
 if(!v&&dv==null){box.className='vd idle';box.textContent='Masukkan harga (dan/atau diskon) yang tertulis di POP untuk dibandingkan dengan sistem.';return}
 let cls='ok',head='';
 if(v){
  const tol=Math.max(1,v*.0005),hit=cand.filter(c=>Math.abs(c.price-v)<=tol),ha=hit.filter(c=>c.act),prom=cand.filter(c=>c.act&&c.k!=='normal');
  const low=prom.length?prom.reduce((a,c)=>c.price<a.price?c:a):null;
  if(ha.some(c=>c.k!=='normal')){head=`<b>Harga sesuai.</b> ${rp(v)} sama dengan ${[...new Set(ha.map(c=>c.label))].join(' / ')}.`;if(ha.every(c=>c.k==='c'))cls='warn',head+=' (hanya cocok dengan perhitungan kombinasi, pastikan memang boleh digabung)'}
  else if(ha.length){if(prom.length){cls='warn';head=`<b>POP masih harga normal</b>, padahal ada promo aktif. Harga promo terendah: <b>${rp(low.price)}</b> (${low.label}).`}else head='<b>Harga sesuai</b> dengan harga normal, dan tidak ada promo aktif.'}
  else if(hit.length){cls='warn';head=`<b>POP memakai promo yang tidak aktif</b> pada tanggal ini: ${hit.map(c=>c.label).join(' / ')}.`+(low?` Harga promo aktif terendah: <b>${rp(low.price)}</b>.`:'')}
  else{cls='bad';const pool=cand.filter(c=>c.act);const nr=pool.length?pool.reduce((a,c)=>Math.abs(c.price-v)<Math.abs(a.price-v)?c:a):null;head=`<b>Harga tidak sesuai.</b>`+(nr?` Terdekat: ${nr.label} = <b>${rp(nr.price)}</b> (selisih ${rp(v-nr.price)}).`:' Tidak ada harga acuan di sistem.')}
  L.push(head);
  if(cand.length>1)L.push('<span style="opacity:.85">Harga acuan aktif: '+cand.filter(c=>c.act).map(c=>`${c.label} ${rp(c.price)}`).join('; ')+'</span>')
 }
 if(dv!=null){
  const ds=cand.filter(c=>c.act&&c.d!=null&&c.k!=='normal').map(c=>c.d);const ok=ds.some(x=>Math.abs(x-dv)<.01);
  L.push(ok?`Diskon ${pc(dv)} ada di promo aktif.`:`<b>Diskon ${pc(dv)} tidak ditemukan</b> di promo aktif`+(ds.length?` (yang ada: ${[...new Set(ds.map(pc))].join(', ')})`:' (tidak ada promo aktif)')+'.');
  if(!ok&&cls==='ok')cls='bad'
 }
 box.className='vd '+cls;box.innerHTML=L.length>1?`${L[0]}<ul>${L.slice(1).map(x=>`<li>${x}</li>`).join('')}</ul>`:L[0];
}
/* ===== penyimpanan data (IndexedDB) ===== */
const srcTxt=()=>'Sumber: '+D.meta+(D.localAt?' · hanya di perangkat ini':D.built?' · data situs per '+new Date(D.built).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'')+(D.si?' · Stok IMR '+D.si.date+(D.si.loc?' ('+D.si.loc.replace(/^\d+ - /,'')+')':''):'');
const idb=(m,v)=>new Promise((ok,no)=>{try{const q=indexedDB.open('cekpromo',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onerror=()=>no(q.error);q.onsuccess=()=>{const t=q.result.transaction('k',m==='get'?'readonly':'readwrite'),s=t.objectStore('k'),r=m==='get'?s.get('data'):m==='put'?s.put(v,'data'):s.delete('data');t.oncomplete=()=>ok(r.result);t.onerror=()=>no(t.error)}}catch(e){no(e)}});
async function gunzipB64(b){const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);try{return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}catch(e){return pako.inflate(u,{to:'string'})}}
async function gzipB64(txt){let u;try{u=new Uint8Array(await new Response(new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer())}catch(e){u=pako.gzip(txt)}let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
async function pushServer(){const gz=await gzipB64(JSON.stringify(D));const r=await fetch('/api/promodata',{method:'POST',headers:{'content-type':'application/json','x-cp-user':USER,'x-cp-hash':CPH},body:JSON.stringify({gz})});if(!r.ok){let m='';try{m=(await r.json()).error}catch(e){}throw new Error(m||('Server error '+r.status))}return gz.length}
/* ===== deteksi promo yang hilang / berubah setelah import ===== */
function snap(){const m=new Map(),ok=pi=>{const p=D.promos[pi];return p&&p[3]>=today};
 for(const no in D.ip)for(const r of D.ip[no])if(ok(r[1]))m.set(no+'|'+D.promos[r[1]][0]+'|'+r[0],r[2]);
 for(const b in D.bp)for(const r of D.bp[b])if(ok(r[1]))m.set('B'+b+'|'+D.promos[r[1]][0]+'|'+r[0],r[2]);
 return m}
function diffRows(a,b){const pi=new Map(),im=new Map(),bn=new Map(),bc=new Map();
 D.promos.forEach(p=>{const o=pi.get(p[0]);if(!o||p[3]>o[3])pi.set(p[0],p)});
 D.items.forEach(i=>{im.set(i[0],i);if(i[3]){if(!bn.has(i[3]))bn.set(i[3],i[4]);bc.set(i[3],(bc.get(i[3])||0)+1)}});
 const L=[],C=[],A=[],mk=(t,k,o,n)=>{const q=k.split('|'),no=q[0],pn=q[1],ty=q[2],p=pi.get(pn)||[],br=no[0]==='B';let nm,cat,bd;
  if(br){const c=no.slice(1);nm=(bn.get(c)||'')+' ('+(bc.get(c)||0)+' barang)';cat='BRAND';bd=bn.get(c)||c}else{const it=im.get(no);nm=it?it[2]:'';cat=it?(D.cats[it[6]]||'LAINNYA'):'';bd=it?it[4]:''}
  return [t,br?'Brand '+no.slice(1):no,nm,cat,bd,pn,p[1]||'',p[3]||'',o,n,ty]};
 for(const [k,v] of a){if(!b.has(k))L.push(mk('L',k,v,null));else if(b.get(k)!==v)C.push(mk('C',k,v,b.get(k)))}
 for(const [k,v] of b)if(!a.has(k))A.push(mk('A',k,null,v));
 const cut=L.length+C.length>25000||A.length>3000,rows=L.slice(0,25000).concat(C.slice(0,Math.max(0,25000-L.length)),A.slice(0,3000));
 return{rows,sum:{l:L.length,c:C.length,a:A.length,cut}}}
async function pushChanges(CHG){const r=await fetch('/api/promochanges',{method:'POST',headers:{'content-type':'application/json','x-cp-user':USER,'x-cp-hash':CPH},body:JSON.stringify(CHG)});if(!r.ok){let m='';try{m=(await r.json()).error}catch(e){}throw new Error(m||('Server error '+r.status))}}
async function load(fresh){
 let sv=null;if(!fresh){try{sv=await idb('get')}catch(e){}}
 let ssv=null;if(USER&&CPH){try{const rr=await fetch('/api/promodata',{headers:{'x-cp-user':USER,'x-cp-hash':CPH},cache:'no-store'});if(rr.ok){const j=await rr.json(),d=JSON.parse(await gunzipB64(j.gz));if(d&&d.items&&d.v===3)ssv={at:j.at,D:d}}}catch(e){}}
 let srv=null;try{const rr=await fetch('data.json',{cache:'no-cache'});if(rr.ok){srv=await rr.json();if(!srv.items||srv.v!==3)srv=null}}catch(e){}
 if(sv&&sv.items&&sv.v===3&&sv.localAt&&(!srv||sv.localAt>(srv.built||''))&&(!ssv||sv.localAt>ssv.at))D=sv;else if(ssv){D=ssv.D;D.meta='Data server '+new Date(ssv.at).toLocaleString('id-ID')}else if(srv){D=srv;D.meta=D.meta||'Data situs'}else{
  if(!DATA)DATA=(await (await fetch('/data/promo-data.txt')).text()).trim();const b=atob(DATA),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  let tx;try{tx=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}catch(e){tx=pako.inflate(u,{to:'string'})}
  D=JSON.parse(tx);D.meta='Data bawaan';
 }
 normBrand();D.items.forEach(i=>{i.l=i[2].toLowerCase()});
 $('stat').textContent=D.items.length.toLocaleString('id-ID')+' item dimuat';$('src').textContent=srcTxt();
}
/* ===== import file Excel baru ===== */
/* promo discount yang item name-nya hanya nama brand: Item No = brand code, dipasang ke semua item dengan brand code itu */
function normBrand(){const BC=new Set();D.items.forEach(i=>{if(i[3])BC.add(i[3])});let n=0;
 for(const k of Object.keys(D.ip)){if(!BC.has(k))continue;const rows=D.ip[k].filter(r=>r[0]==='D');if(!rows.length)continue;
  const b=D.bp[k]||(D.bp[k]=[]);rows.forEach(r=>{if(!b.some(x=>x[0]==='D'&&x[1]===r[1]))b.push(['D',r[1],r[2]]);n++});
  D.ip[k]=D.ip[k].filter(r=>r[0]!=='D');if(!D.ip[k].length)delete D.ip[k]}
 D.items=D.items.filter(i=>!(BC.has(i[0])&&!i[1]&&!i[3]));return n}
function applyFile(k,rows){
 const hr=rows.findIndex((r,i)=>i<15&&r&&(r.includes('Starting Date')||r.includes('Item No')||r.includes('No Item')));const H={};
 rows[hr].forEach((h,i)=>{h=String(h==null?'':h).trim();if(h&&!(h in H))H[h]=i});
 const body=rows.slice(hr+1).filter(r=>r&&r.some(v=>v!=null));
 const g=(r,c)=>{const v=r[H[c]];let x=v==null?'':String(v).trim();if((c==='Item No'||c==='No Item')&&/^\d{9}$/.test(x))x='0'+x;return x},nv=(r,c)=>{const v=parseFloat(r[H[c]]);return isNaN(v)?0:v};
 const dt=(r,c)=>{const v=r[H[c]];if(typeof v==='number')return new Date(Math.round((v-25569)*864e5)).toISOString().slice(0,10);const s=String(v||'');return/^\d\d\/\d\d\/\d{4}/.test(s)?s.slice(6,10)+'-'+s.slice(3,5)+'-'+s.slice(0,2):s.slice(0,10)};
 const ci=c=>{let i=D.cats.indexOf(c);if(i<0){D.cats.push(c);i=D.cats.length-1}return i};
 if(k==='S'){const c=Object.keys(H).find(x=>/ending balance|current stok|^stok$|^stock$/i.test(x)),ic=H['No Item']!=null?'No Item':'Item No',m={};
  for(const r of body){const no=g(r,ic),v=parseFloat(r[H[c]]);if(no&&!isNaN(v))m[no]=(m[no]||0)+v}
  const inf=rows.slice(0,hr).map(r=>r&&r[0]).filter(x=>typeof x==='string').join(' ').match(/Location\s*:\s*([^,]+),\s*From\s+(.+?)\s+to\s+(.+?)\s*,/);
  D.stock=m;D.si={loc:inf?inf[1].trim():'',date:inf?inf[3]:'tanggal tidak terbaca'};return Object.keys(m).length}
 if(k==='I'){
  const m=new Map();for(const r of body){const no=g(r,'Item No');if(no&&!m.has(no))m.set(no,[no,g(r,'Barcode No'),g(r,'Item Name'),g(r,'Brand Code'),g(r,'Brand Name'),g(r,'Master Brand Name'),ci(g(r,'Category Name'))])}
  for(const i of D.items)if(!i[1]&&!i[3]&&!m.has(i[0]))m.set(i[0],i);D.items=[...m.values()];return body.length;
 }
 const X=new Map(D.items.map(i=>[i[0],i])),pm=new Map(D.promos.map((p,i)=>[p.join('\u0001'),i]));
 const P=(r)=>{const a=[g(r,'Promo No'),g(r,'Promo Name'),dt(r,'Starting Date'),dt(r,'Ending Date'),k],s=a.join('\u0001');if(!pm.has(s)){pm.set(s,D.promos.length);D.promos.push(a)}return pm.get(s)};
 const ens=(r,no)=>{if(!X.has(no)){const it=[no,'',g(r,'Item Name'),'',g(r,'Brand Name'),g(r,'Master Brand Name'),ci(g(r,'Category Name'))];D.items.push(it);X.set(no,it)}const p=nv(r,'Sales Price (inc)');if(p>0)D.price[no]=p;if(!D.si&&H['Current Stok']!=null&&r[H['Current Stok']]!=null)D.stock[no]=nv(r,'Current Stok')};
 for(const n in D.ip)D.ip[n]=D.ip[n].filter(x=>x[0]!==k);
 for(const n in D.bp)D.bp[n]=D.bp[n].filter(x=>x[0]!==k);
 const add=(o,n,v)=>(o[n]||(o[n]=[])).push(v);
 if(k==='T'){D.tab={};const dm=new Map();for(const r of body)if(g(r,'Disc Type')==='Disc'&&!dm.has(g(r,'Promo No')))dm.set(g(r,'Promo No'),nv(r,'Value'));
  for(const r of body){const t=g(r,'Type'),pi=P(r),d=dm.get(g(r,'Promo No'))||0;
   if(t==='Item'){ens(r,g(r,'Item No'));add(D.ip,g(r,'Item No'),['T',pi,d])}
   else if(t==='Brand'){const b=g(r,'Item No'),a=D.bp[b]||(D.bp[b]=[]);if(!a.some(x=>x[0]==='T'&&x[1]===pi))a.push(['T',pi,d])}
   else if(t==='All'){const x=D.tab[pi]||(D.tab[pi]=[nv(r,'Step Amount'),[]]);x[1].push([g(r,'Category Name'),g(r,'Item No Benefit'),g(r,'Description Benefit'),nv(r,'Value')])}}
  return body.length}
 const BCs=new Set(),BNs=new Set();for(const i of D.items){if(i[3])BCs.add(i[3]);if(i[4])BNs.add(String(i[4]).toLowerCase())}
 for(const r of body){const no=g(r,'Item No'),t=g(r,'Type'),pi=P(r),nm=g(r,'Item Name').toLowerCase();
  if(k==='D'&&no&&(t==='Brand'||(!X.has(no)&&(BCs.has(no)||(nm&&(nm===g(r,'Brand Name').toLowerCase()||BNs.has(nm))))))){const a=D.bp[no]||(D.bp[no]=[]);if(!a.some(x=>x[0]==='D'&&x[1]===pi))a.push(['D',pi,nv(r,'Disc')]);continue}
  if(!no)continue;ens(r,no);
  if(k==='D')add(D.ip,no,['D',pi,nv(r,'Disc'),nv(r,'Net Sales'),g(r,'Pop/sign')]);
  if(k==='M')add(D.ip,no,['M',pi,nv(r,'Deal Price/Disc'),nv(r,'No of Items Needed'),g(r,'Line Group'),nv(r,'Net Sales'),g(r,'Pop/sign')]);
  if(k==='B')add(D.ip,no,['B',pi,nv(r,'Min Qty'),nv(r,'Max Qty'),nv(r,'Net Sales'),g(r,'Pop/sign')]);}
 return body.length;
}
function detect(name,rows){
 const r=rows.find((r,i)=>i<15&&r&&(r.includes('Starting Date')||r.includes('Item No')||r.includes('No Item')))||[],h=r.map(x=>String(x||'').trim()),n=name.toLowerCase();
 if(!h.includes('Starting Date')&&!h.includes('Barcode No')&&(h.includes('Item No')||h.includes('No Item'))&&h.some(x=>/ending balance|current stok|^stok$|^stock$/i.test(x)))return'S';if(h.includes('Barcode No'))return'I';if(h.includes('Step Amount')||n.includes('total'))return'T';if(h.includes('No of Items Needed')||n.includes('mix'))return'M';
 if(h.includes('Min Qty')||n.includes('multi'))return'B';if(h.includes('Item Needed')||n.includes('discount'))return'D';return null;
}
const KN={S:'Laporan Stok',I:'All Active Item',D:'Promo Discount',M:'Mix & Match',B:'MultiBuy',T:'Total Offer'};
$('imp').addEventListener('change',async e=>{
 const fs=[...e.target.files];e.target.value='';if(!fs.length)return;
 if(!window.XLSX){alert('Library Excel gagal dimuat (cek koneksi).');return}
 const ok=[],bad=[],SB=snap();
 for(const f of fs){$('stat').textContent='Membaca '+f.name+'…';await new Promise(r=>setTimeout(r,30));
  try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array'}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:null}),k=detect(wb.SheetNames[0],rows);
   if(!k){bad.push(f.name);continue}ok.push(KN[k]+' ('+applyFile(k,rows).toLocaleString('id-ID')+' baris)')}catch(x){bad.push(f.name)}}
 if(ok.length){D.localAt=new Date().toISOString();D.meta='Import '+new Date().toLocaleString('id-ID')+' – '+ok.map(s=>s.split(' (')[0]).join(', ');try{await idb('put',D)}catch(x){}}
 normBrand();D.items.forEach(i=>{i.l=i[2].toLowerCase()});sel=null;let CHG=null;if(ok.length){try{CHG=diffRows(SB,snap())}catch(x){}}$('stat').textContent=D.items.length.toLocaleString('id-ID')+' item dimuat';$('src').textContent=srcTxt();search();
 alert((ok.length?'Berhasil diimpor:\n'+ok.join('\n'):'Tidak ada file yang berhasil diimpor.')+(bad.length?'\n\nTidak dikenali: '+bad.join(', '):'')+(CHG?'\n\nDibanding data sebelumnya: '+CHG.sum.l+' promo-barang hilang, '+CHG.sum.c+' berubah, '+CHG.sum.a+' baru.':''));
 if(ok.length&&confirm('Simpan data ini ke server supaya semua pengguna memakai data yang sama?')){try{const n=await pushServer();let cm='';if(CHG&&CHG.rows.length){try{await pushChanges(CHG)}catch(x){cm='\n\nDaftar perubahan gagal disimpan: '+x.message}}alert('Tersimpan di server ('+(n/1048576).toFixed(1)+' MB). Semua pengguna akan memakai data ini.'+(CHG&&CHG.rows.length&&!cm?'\nDaftar promo hilang/berubah ada di Monitor Perubahan (sumber: Promo hilang/berubah setelah import data).':'')+cm)}catch(x){alert('Gagal menyimpan ke server: '+x.message+'\nGunakan Export data.json sebagai cadangan.')}}
});
$('rst').addEventListener('click',async()=>{if(!confirm('Kembali ke data situs? Data hasil import di perangkat ini akan dihapus (daftar temuan tetap aman).'))return;try{await idb('del')}catch(x){}await load(true);sel=null;search()});
/* ===== simpan / export file ===== */
async function saveFile(n,d){
 let dl=null;try{dl=window.claude&&await claude.use('downloads')}catch(e){}
 if(dl){try{await dl.save({filename:n,data:d});return}catch(e){if(e.code==='declined')return}}
 const ty=/\.csv$/.test(n)?'text/csv;charset=utf-8':/\.json$/.test(n)?'application/json':/\.jpg$/.test(n)?'image/jpeg':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',blob=new Blob([d],{type:ty});
 try{const f=new File([blob],n,{type:ty});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:n});return}}catch(e){if(e.name==='AbortError')return}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);
}
const stamp=()=>new Date().toISOString().slice(0,10).replace(/-/g,'');
const ddmm=s=>s?s.slice(8)+'/'+s.slice(5,7)+'/'+s.slice(0,4)+' 00:00:00':'';
async function exItem(){
 if(!sel||!window.XLSX){alert('Library Excel belum siap.');return}
 const wb=XLSX.utils.book_new(),n=sel[0];
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['No Item',n],['Barcode',sel[1]],['Deskripsi',sel[2]],['Master Brand',sel[5]],['Brand',sel[4]],['Brand Code',sel[3]],['Harga normal',D.price[n]||''],['Stok',stkOf(n)==null?'':stkOf(n)],['Tanggal cek',$('dt').value],['Harga di POP',popP],['Diskon di POP',popD],['Hasil cek POP',$('vd')?$('vd').textContent:'']]),'Barang');
 document.querySelectorAll('#out .panel').forEach(p=>{const h=p.querySelector('h2'),t=p.querySelector('table');if(!h||!t||h.textContent.startsWith('Cek'))return;
  const c=t.cloneNode(true);if(c.querySelector('th:last-child').textContent==='Temuan')c.querySelectorAll('tr').forEach(r=>r.lastElementChild&&r.removeChild(r.lastElementChild));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.table_to_sheet(c),h.firstChild.textContent.replace(/[\/\\?*\[\]:]/g,'').slice(0,31))});
 await saveFile('Promo_'+n+'.xlsx',XLSX.write(wb,{type:'array',bookType:'xlsx'}));
}
async function exData(){if(!confirm('Buat file data.json dari data yang sedang tampil? Unggah file ini ke Netlify (bersama index.html) agar semua orang memakai data yang sama.'))return;const c=Object.assign({},D,{built:new Date().toISOString()});delete c.localAt;await saveFile('data.json',JSON.stringify(c))}
$('exd').addEventListener('click',exData);
$('svr').addEventListener('click',async()=>{if(!D){alert('Data belum termuat.');return}if(!confirm('Simpan data promo yang sedang tampil ke server untuk semua pengguna?'))return;try{const n=await pushServer();alert('Tersimpan di server ('+(n/1048576).toFixed(1)+' MB).')}catch(x){alert('Gagal: '+x.message)}});
/* ===== daftar temuan POP ===== */
const STS=['Belum diproses','Sedang dipasang','Sudah dipasang'],RSN=['Belum terpasang','Harga salah','Promo salah'];
let FIND=[],FR=[],rsel=RSN[0],ffl='open',afl='all',asel='';
let FE='';
const LEG=(()=>{try{return JSON.parse(localStorage.getItem('cp_find')||'[]')}catch(e){return[]}})();
const svF=()=>{};
async function fapi(method,q,body){const r=await fetch('/api/findings'+(q||''),{method,headers:{'content-type':'application/json','x-cp-user':USER,'x-cp-hash':CPH},body:body?JSON.stringify(body):undefined});if(!r.ok){let m='';try{m=(await r.json()).error}catch(e){}throw new Error(m||('Server error '+r.status))}return r.json()}
async function fLoad(){if(!USER)return;try{FIND=(await fapi('GET','')).items||[];FE=''}catch(e){FE=e.message}rf();if(typeof sel!=='undefined'&&sel&&D)show(sel,1)}
async function fOp(b){try{FIND=(await fapi('POST','',b)).items;FE=''}catch(e){alert('Gagal menyimpan: '+e.message);await fLoad();return null}rf();if(typeof sel!=='undefined'&&sel&&D)show(sel,1);return true}
async function fImport(){const L=LEG.filter(f=>f&&f.id);if(!L.length)return;if(!confirm('Impor '+L.length+' temuan lama dari perangkat ini ke server?'))return;
 if(!await fOp({op:'add',items:L.map(f=>Object.assign({},f,{fotos:[]}))}))return;let n=0,bad=0;
 for(const f of L)for(const p of (f.fotos||[])){try{const d=await ofget(p.k);if(d){await fapi('POST','',{op:'photoAdd',id:f.id,k:p.k,d,by:p.by,at:p.at,imp:1});n++}}catch(e){bad++}}
 try{localStorage.removeItem('cp_find')}catch(e){}LEG.length=0;await fLoad();alert('Impor selesai: '+L.length+' temuan, '+n+' foto'+(bad?' ('+bad+' foto gagal)':'')+'.')}
const fkey=f=>[f.itemNo,f.promoNo,f.codeType,f.codeId,f.popType,f.qty].join('|');
function fb(f){const i=FR.push(f)-1;return FIND.some(x=>fkey(x)===fkey(f)&&x.status!==STS[2])?'<span class="muted">✓ Dalam daftar</span>':`<button class="btn fb" data-fi="${i}">+ Temuan</button>`}
function listF(){return FIND.filter(f=>(isA()?(afl==='all'||(afl==='none'?!f.to:f.to===afl)):f.to===USER)&&(ffl==='all'||(ffl==='open'?f.status!==STS[2]:f.status===ffl)))}
const photoCell=f=>{const n=(f.fotos||[]).length,can=isA()||f.to===USER;return (f.fotos||[]).map(p=>`<img class="th" data-k="${p.k}" data-id="${f.id}" alt="Foto bukti" tabindex="0">`).join('')+(can&&n<3?`<label class="btn" style="padding:2px 8px;font-size:12px;white-space:nowrap">+ Foto<input type="file" accept="image/*" class="fi" data-id="${f.id}" hidden></label>`:'')+(f.status===STS[2]&&!n?'<div style="color:var(--bad);font-size:12px">Tanpa foto</div>':'')};
const isA=()=>ROLE==='admin',fmtT=s=>s?new Date(s).toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'}):'';
function rf(){
 const A=isA(),L=listF(),mine=A?FIND:FIND.filter(f=>f.to===USER),open=mine.filter(f=>f.status!==STS[2]).length;
 const cnt=A?STAFF.map(u=>[u.split('.')[0],FIND.filter(f=>f.to===u&&f.status!==STS[2]).length]).filter(x=>x[1]).map(x=>x[0]+': '+x[1]).join(' · '):'';
 const stSel=`<label>Status <select id="ff">${[['open','Belum selesai'],['all','Semua'],...STS.map(s=>[s,s])].map(([v,t])=>`<option value="${v}"${v===ffl?' selected':''}>${t}</option>`).join('')}</select></label>`;
 const row=f=>`<tr>${A?`<td><input type="checkbox" class="ck" data-id="${f.id}" aria-label="Pilih"></td>`:''}<td>${f.itemNo}<div class="muted">${esc(f.desc)}</div></td><td>${esc(f.promoName)}<div class="muted">${f.promoNo} · ${f.popType} · ${f.codeType}</div></td><td>${f.reason}</td>${A?`<td><select class="as" data-id="${f.id}">${asOpts(f.to)}</select>${f.toAt?`<div class="muted">${fmtT(f.toAt)}</div>`:''}</td>`:''}<td><select class="st" data-id="${f.id}">${STS.map(s=>`<option${s===f.status?' selected':''}>${s}</option>`).join('')}</select></td><td><input type="text" class="nt" data-id="${f.id}" value="${esc(f.note||'')}" placeholder="Catatan"></td><td>${photoCell(f)}</td><td>${esc(f.by||'-')}<div class="muted">${fmtT(f.at)}</div></td>${A?`<td><button class="btn dl" data-id="${f.id}" title="Hapus">✕</button></td>`:''}</tr>`;
 $('fp').innerHTML=`<div class="panel"><h2>${A?'Daftar Temuan POP':'Tugas saya'}<small>${A?`${FIND.length} temuan, ${open} belum selesai, ${FIND.filter(f=>!f.to).length} belum ditugaskan`:`${mine.length} tugas, ${open} belum selesai`}</small></h2>
 ${A?(cnt?`<div class="muted" style="margin-bottom:8px">Belum selesai per petugas: ${cnt}</div>`:''):'<div class="muted" style="margin-bottom:10px">Hanya temuan yang ditugaskan ke akun Anda yang tampil. Ubah status dan catatan progres pemasangan.</div>'}
 <div class="bar" style="margin:0 0 10px">${stSel}${A?`<label>Petugas <select id="fa"><option value="all"${afl==='all'?' selected':''}>Semua</option><option value="none"${afl==='none'?' selected':''}>Belum ditugaskan</option>${STAFF.map(u=>`<option${u===afl?' selected':''}>${u}</option>`).join('')}</select></label>
 <button class="btn" data-a="csv">Export CSV (format POP)</button><button class="btn" data-a="xl">Export Excel</button><button class="btn" data-a="clr">Hapus yang sudah dipasang</button><button class="btn" data-a="cancelshown">Batalkan yang tampil</button><button class="btn" data-a="cancelall" style="color:var(--bad)">Batalkan SEMUA temuan (${FIND.length})</button>${LEG.length?`<button class="btn" data-a="import">Impor temuan lama (${LEG.length})</button>`:''}<button class="btn" data-a="demo">Buat contoh temuan (demo)</button>`:''}</div>
 ${A?`<div class="bar" style="margin:0 0 10px"><label>Tugaskan yang dicentang ke <select id="bk">${asOpts('')}</select></label><button class="btn" data-a="bulk">Terapkan</button></div>`:''}
 ${tbl(A?['<input type="checkbox" id="ca" aria-label="Pilih semua">','Barang','Promo','Jenis temuan','Petugas','Status','Catatan','Foto bukti','Update terakhir','']:['Barang','Promo','Jenis temuan','Status','Catatan','Foto bukti','Update terakhir'],L.map(row),A?'Belum ada temuan.':'Belum ada tugas untuk akun Anda.',1)}</div>`;
 if(FE)$('fp').insertAdjacentHTML('afterbegin','<div class="vd bad">'+esc(FE)+(/server|404|500/i.test(FE)?'<br>Fitur ini butuh fungsi server Netlify (deploy folder lengkap).':'')+'</div>');hydrate();
}
$('fp').addEventListener('click',async e=>{
 const th=e.target.closest('.th');if(th){openLb(th.dataset.k,th.dataset.id);return}
 const d=isA()&&e.target.closest('.dl');if(d){await fOp({op:'del',ids:[d.dataset.id]});return}
 const a=isA()&&e.target.dataset.a;if(!a)return;
 if(a==='bulk'){const ids=[...document.querySelectorAll('#fp .ck:checked')].map(c=>c.dataset.id);if(!ids.length){alert('Centang dulu temuan yang akan ditugaskan.');return}const to=$('bk').value,now=new Date().toISOString();await fOp({op:'assign',ids,to});return}
 if(a==='demo'){const b=(n,d,no,r,to)=>({to:to||'',toAt:to?new Date().toISOString():'',id:Date.now().toString(36)+n,itemNo:no,desc:d,brand:'DEMO',promoName:'PROMO DEMO OKT26',promoNo:'PR2601'+n+'000',popType:'Add. Discount Offer',codeType:'Item',codeId:no,disc:10,qty:1,start:'2026-10-01',end:'2026-10-31',stock:0,reason:r,status:STS[0],note:'',added:new Date().toISOString().slice(0,10),by:USER,at:new Date().toISOString()});await fOp({op:'add',items:[b(1,'CONTOH BARANG A','0100000001',RSN[0],'sc1.mgsleman'),b(2,'CONTOH BARANG B','0100000002',RSN[1],'sc2.mgsleman'),b(3,'CONTOH BARANG C','0100000003',RSN[2])]});return}
 if(a==='clr'){if(confirm('Hapus semua temuan berstatus "Sudah dipasang"? Foto buktinya ikut terhapus. Export Excel dulu bila perlu.')){await fOp({op:'clearDone'})}return}
 if(a==='cancelshown'){const L=listF();if(!L.length){alert('Tidak ada temuan pada filter ini.');return}if(confirm('Batalkan '+L.length+' temuan yang tampil? Foto buktinya ikut terhapus dan tugas hilang dari akun petugas. Tindakan ini tidak bisa dibatalkan.'))await fOp({op:'del',ids:L.map(f=>f.id)});return}
 if(a==='cancelall'){if(!FIND.length){alert('Belum ada temuan.');return}if(confirm('Batalkan SEMUA '+FIND.length+' temuan (termasuk yang sedang dikerjakan dan yang sudah dipasang)? Foto bukti ikut terhapus. Tindakan ini tidak bisa dibatalkan.')&&confirm('Yakin? Semua temuan akan dihapus dari semua akun.'))await fOp({op:'delAll'});return}
 if(a==='import'){await fImport();return}
 const L=listF();if(!L.length){alert('Tidak ada temuan pada filter ini.');return}
 if(a==='csv'){const cl=v=>String(v==null?'':v).replace(/[|\r\n]+/g,' ').trim();
  const csv=['POPType|CodeType|CodeId|Brand|Description|DealDiscount|Promo Description|Quantity|StartDate|EndDate|StartTime|EndingTime|Stock|DiscNo|',...L.map(f=>[f.popType,f.codeType,f.codeId,f.brand,f.desc,+(+f.disc).toFixed(4),f.promoName,f.qty,ddmm(f.start),ddmm(f.end),'00:00:00.0000000','00:00:00.0000000',f.stock,f.promoNo].map(cl).join('|')+'|')].join('\r\n')+'\r\n';
  await saveFile('POP_Temuan_'+stamp()+'.csv',csv)}
 if(a==='xl'){if(!window.XLSX){alert('Library Excel belum siap.');return}
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Tanggal temuan','No Item','Deskripsi','Brand','Promo No','Promo','Jenis promo','Jenis temuan','Status','Catatan','Disc %','Qty','Mulai','Selesai','Stok','Petugas','Update terakhir','Jumlah foto'],...L.map(f=>[f.added,f.itemNo,f.desc,f.brand,f.promoNo,f.promoName,f.popType+' / '+f.codeType,f.reason,f.status,f.note||'',f.disc,f.qty,f.start,f.end,f.stock,f.to||'',f.at||'',(f.fotos||[]).length])]),'Temuan POP');
  await saveFile('Temuan_POP_'+stamp()+'.xlsx',XLSX.write(wb,{type:'array',bookType:'xlsx'}))}
});
$('fp').addEventListener('change',async e=>{const t=e.target;
 if(t.id==='ff'){ffl=t.value;rf();return}
 if(t.id==='fa'){afl=t.value;rf();return}
 if(t.id==='ca'){document.querySelectorAll('#fp .ck').forEach(c=>{c.checked=t.checked});return}
 const f=FIND.find(x=>x.id===t.dataset.id);if(!f)return;
 if(!isA()&&f.to!==USER)return;
 if(t.classList.contains('as')){if(!isA())return;await fOp({op:'assign',ids:[f.id],to:t.value});return}
 if(t.classList.contains('fi')){const file=t.files[0];t.value='';if(!file)return;if((f.fotos||[]).length>=3){alert('Maksimal 3 foto per temuan.');return}
  try{const now=new Date().toISOString(),d=await shrink(file,USER+' · '+fmtT(now)+' · '+f.itemNo),k=f.id+'_'+Date.now().toString(36);PH.set(k,d);if(!await fOp({op:'photoAdd',id:f.id,k,d}))PH.delete(k)}catch(x){alert('Foto gagal disimpan: '+(x.message||x))}return}
 if(t.classList.contains('st')){if(t.value===STS[2]&&!isA()&&!(f.fotos||[]).length){alert('Tambahkan minimal 1 foto bukti sebelum menandai "Sudah dipasang".');rf();return}await fOp({op:'update',id:f.id,status:t.value})}if(t.classList.contains('nt')){await fOp({op:'update',id:f.id,note:t.value})}});
$('out').addEventListener('change',e=>{if(e.target.id==='rs')rsel=e.target.value;if(e.target.id==='as0')asel=e.target.value});
$('out').addEventListener('click',async e=>{
 if(e.target.id==='xi'){exItem();return}
 const b=e.target.closest('.fb');if(!b)return;
 const f=Object.assign({},FR[+b.dataset.fi],{id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),to:asel,toAt:asel?new Date().toISOString():'',reason:rsel,status:STS[0],note:'',added:new Date().toISOString().slice(0,10),by:USER,at:new Date().toISOString()});
 b.outerHTML='<span class="muted">✓ Dalam daftar</span>';await fOp({op:'add',items:[f]});
});
function sha256(s){const b=new TextEncoder().encode(s),l=b.length,n=((l+9+63)>>6)<<4,W=new Uint32Array(n);
 for(let i=0;i<l;i++)W[i>>2]|=b[i]<<(24-(i&3)*8);W[l>>2]|=0x80<<(24-(l&3)*8);W[n-1]=l*8;
 const K=[],H=[];let pc=0;for(let c=2;pc<64;c++){let p=1;for(let d=2;d*d<=c;d++)if(c%d===0){p=0;break}if(p){if(pc<8)H[pc]=(Math.sqrt(c)%1*4294967296)|0;K[pc++]=(Math.cbrt(c)%1*4294967296)|0}}
 const R=(x,n)=>(x>>>n)|(x<<(32-n));
 for(let o=0;o<n;o+=16){const w=[];for(let i=0;i<16;i++)w[i]=W[o+i]|0;
  for(let i=16;i<64;i++){const a=w[i-15],c=w[i-2];w[i]=(w[i-16]+(R(a,7)^R(a,18)^(a>>>3))+w[i-7]+(R(c,17)^R(c,19)^(c>>>10)))|0}
  let [a,b2,c,d,e,f,g,h]=H;
  for(let i=0;i<64;i++){const t1=(h+(R(e,6)^R(e,11)^R(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0,t2=((R(a,2)^R(a,13)^R(a,22))+((a&b2)^(a&c)^(b2&c)))|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b2;b2=a;a=(t1+t2)|0}
  [a,b2,c,d,e,f,g,h].forEach((v,i)=>{H[i]=(H[i]+v)|0})}
 return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('')}
const USERS={"admin1.mgsleman":["449454cfd25a41ce4146865f525d57a0857479854a9853cfc2be2fbcdedfa661","admin"],"admin2.mgsleman":["71f1b64e07fd5b9a5c2624eecbf64b35f67db3e72e7cd5c8bde88fbbf3999f31","admin"],"admin3.mgsleman":["057b80e84af722d0981b42d69a04fac2bb42fb1be796be4d60ae6991d8e2daf3","admin"],"admin4.mgsleman":["39ffa0226c7b1e90a82f31975d19bf68ae82b147fb484e3093a96a64b1af81df","admin"],"sc1.mgsleman":["e47a64c6ed324bbd36127be9fd1a60343522ce62e7c5cb275ded7395fd51e1d1","staff"],"sc2.mgsleman":["3c560f21607aaddfbe8cd0667ada8a9b6d1be36b393fb3030b53f4c59bb9a42e","staff"],"sc3.mgsleman":["29777ec0e4db55a670cfe337cbc6443c73006c1401bcee5b25025d7e5f1e782d","staff"],"sc4.mgsleman":["5c09fe6a701d839ab73a6917f878c3411f7e6af5f8e20ef2f1f8b4517f125f75","staff"],"sc5.mgsleman":["5e82b18597a92b568eb6eea012ec7ec63ced0af7445e8272e49c07a3d18636fb","staff"],"sc6.mgsleman":["3fc498620256fd2c40527983f0128fd678310dcabb0bc4e6268e1347ad9b70f4","staff"],"sc7.mgsleman":["b0f098b358b5027480f5feaae62976d73c54daad0fed7139daa35201a6e0879f","staff"],"sc8.mgsleman":["37228ad38a139ef7647923a27a41da73ba9d186e73541c4e70639ed98a071650","staff"],"sc9.mgsleman":["1495f37736da2d0eb3033b29cf1e050bbc016508e3a1d554147d51131226f900","staff"],"sc10.mgsleman":["30e97cd3e35d4daddaae905fbd74040cd04558aaeed8f845d718ee07feeba7cf","staff"],"sc11.mgsleman":["d604855881d30b5991c1eb860ce3d942a70937a1309947aa9710880e06b6a150","staff"]},SALT='mgs-cp-1';let USER=null,ROLE=null,booted=false;
const PH=new Map(),pdb=()=>new Promise((ok,no)=>{const q=indexedDB.open('cekfoto',1);q.onupgradeneeded=()=>q.result.createObjectStore('f');q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)});
const fx=async(m,k,v)=>{const d=await pdb();return new Promise((ok,no)=>{const t=d.transaction('f',m==='get'?'readonly':'readwrite'),s=t.objectStore('f'),r=m==='get'?s.get(k):m==='put'?s.put(v,k):s.delete(k);t.oncomplete=()=>ok(r.result);t.onerror=()=>no(t.error)})},ofget=k=>fx('get',k);
const fget=async k=>{const r=await fapi('GET','?photo='+encodeURIComponent(k));return r.d||null},fdel=()=>Promise.resolve();
function shrink(file,label){return new Promise((ok,no)=>{const img=new Image(),u=URL.createObjectURL(file);img.onload=()=>{const s=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement('canvas'),w=c.width=Math.round(img.width*s),h=c.height=Math.round(img.height*s),x=c.getContext('2d');x.drawImage(img,0,0,w,h);const fs=Math.max(12,Math.round(w/45));x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,h-fs*1.8,w,fs*1.8);x.fillStyle='#fff';x.font=fs+'px sans-serif';x.textBaseline='middle';x.fillText(label,fs*.6,h-fs*.9);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.72))};img.onerror=()=>no(new Error('File bukan gambar yang valid'));img.src=u})}
async function hydrate(){for(const im of document.querySelectorAll('#fp img.th')){const k=im.dataset.k;try{if(!PH.has(k))PH.set(k,await fget(k));if(PH.get(k))im.src=PH.get(k);else im.alt='Foto tidak ada di perangkat ini'}catch(e){}}}
let LB=null;
async function openLb(k,id){const f=FIND.find(x=>x.id===id);if(!f)return;const p=(f.fotos||[]).find(x=>x.k===k);LB={k,id};$('lbi').src=PH.get(k)||await fget(k)||'';$('lbm').textContent=f.itemNo+(p?' · '+p.by+' · '+fmtT(p.at):'');$('lbd').hidden=!isA();$('lbr').hidden=!(isA()||(f.to===USER&&f.status!==STS[2]));$('lb').hidden=false}
$('lbx').onclick=()=>{$('lb').hidden=true};$('lb').addEventListener('click',e=>{if(e.target.id==='lb')$('lb').hidden=true});
$('lbr').onclick=async()=>{if(!LB||!confirm('Hapus foto ini?'))return;const f=FIND.find(x=>x.id===LB.id);PH.delete(LB.k);$('lb').hidden=true;if(f)await fOp({op:'photoDel',id:f.id,k:LB.k})};
$('lbd').onclick=async()=>{if(!LB)return;const d=PH.get(LB.k)||await fget(LB.k),b=atob(d.split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);const f=FIND.find(x=>x.id===LB.id);await saveFile('Bukti_'+(f?f.itemNo:'foto')+'_'+LB.k.slice(-4)+'.jpg',u)};
const STAFF=Object.keys(USERS).filter(u=>USERS[u][1]==='staff'),asOpts=(v)=>'<option value="">— Belum ditugaskan —</option>'+STAFF.map(u=>`<option${u===v?' selected':''}>${u}</option>`).join('');
function enter(u){USER=u;ROLE=USERS[u][1];const PR=document.getElementById('pr');PR.classList.add('in');PR.classList.toggle('staff',ROLE==='staff');psub(ROLE==='admin'?'adm':'ut');
 $('who').innerHTML='<b>'+esc(u)+'</b> · '+(ROLE==='admin'?'Admin':'Staff');try{sessionStorage.setItem('cp_user',u)}catch(e){}
 rf();fLoad();utInit();mInit();if(ROLE==='admin'&&!booted){booted=true;load().then(search).catch(e=>{$('stat').textContent='Gagal memuat data: '+e.message})}if(PENDING){const c=PENDING;PENDING='';setTimeout(()=>runFind(c),50)}}
function doLogin(){const u=$('lu').value.trim().toLowerCase(),p=$('lp').value,e=USERS[u];
 const hh=e?sha256(SALT+u+':'+p):'';if(e&&hh===e[0]){CPH=hh;try{sessionStorage.setItem('cp_h',hh)}catch(x){}$('le').hidden=true;$('lp').value='';enter(u)}else{$('le').hidden=false;$('le').textContent='Username atau password salah.'}}
$('lgb').addEventListener('click',doLogin);['lu','lp'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()}));
$('lo').addEventListener('click',()=>{try{sessionStorage.removeItem('cp_user')}catch(e){}location.reload()});
/* ===== Update Promo Harian: pilih promo yang ada update, tugaskan per kategori (tersimpan di server) ===== */
const UST=['Belum','Proses','Selesai','Kendala'],TBC='TEBUS MURAH (SEMUA KATEGORI)';
let UD=today,UT=[],UH=[],UF='all',UP='all',UK='all',UE='',CPH='',UOPEN=null,UPR=[],USEL=new Set(),UC={},UIX=null,ULIM=300;
const upct=(a,b)=>b?Math.round(a/b*100):0;
const ucnt=L=>{const c={Belum:0,Proses:0,Selesai:0,Kendala:0};L.forEach(t=>{c[t.status]=(c[t.status]||0)+1});return c};
const unum=L=>{let t=0,d=0;L.forEach(x=>{t+=x.n||0;if(x.status==='Selesai')d+=x.n||0});return{t,d}};
const ubar=p=>`<div style="background:var(--head);border-radius:4px;height:8px;display:inline-block;width:80px;vertical-align:middle"><div style="width:${p}%;height:8px;border-radius:4px;background:var(--ok)"></div></div> <span class="muted">${p}%</span>`;
const sn=u=>String(u||'').split('.')[0];
async function uapi(method,q,body){const r=await fetch('/api/promotasks'+(q||''),{method,headers:{'content-type':'application/json','x-cp-user':USER,'x-cp-hash':CPH},body:body?JSON.stringify(body):undefined});if(!r.ok){let m='';try{m=(await r.json()).error}catch(e){}throw new Error(m||('Server error '+r.status))}return r.json()}
async function ensureD(){if(!D)await load()}
function uidx(){if(UIX&&UIX.D===D)return UIX;const P=new Map(),add=(pi,cat,n)=>{let m=P.get(pi);if(!m){m=new Map();P.set(pi,m)}m.set(cat,(m.get(cat)||0)+n)};
 for(const it of D.items){const ps=new Set();(D.ip[it[0]]||[]).forEach(r=>ps.add(r[1]));if(it[3])(D.bp[it[3]]||[]).forEach(r=>ps.add(r[1]));if(ps.size){const cat=D.cats[it[6]]||'LAINNYA';ps.forEach(pi=>add(pi,cat,1))}}
 for(const k in D.tab)D.tab[k][1].forEach(x=>add(+k,x[0]||TBC,1));
 UIX={D,P,byNo:new Map(D.promos.map((p,i)=>[p[0],i]))};return UIX}
function uitems(no,cat){const pi=uidx().byNo.get(no);if(pi==null)return[];const out=[];
 for(const it of D.items){if((D.cats[it[6]]||'LAINNYA')!==cat)continue;if((D.ip[it[0]]||[]).some(r=>r[1]===pi)||(it[3]&&(D.bp[it[3]]||[]).some(r=>r[1]===pi)))out.push(it)}
 const t=D.tab[pi];if(t)t[1].forEach(x=>{if((x[0]||TBC)===cat)out.push([x[1],'',x[2],'','','',0])});return out}
function ucands(){const X=uidx(),d=UD,m=$('uam').checked,e=$('uae').checked,a=$('uaa').checked,q=$('uaq').value.trim().toLowerCase(),r=[];
 D.promos.forEach((p,i)=>{if(!X.P.has(i))return;const w=[];if(m&&p[2]===d)w.push('Mulai hari ini');if(e&&p[3]===d)w.push('Berakhir hari ini');if(a&&p[2]<=d&&d<=p[3]&&!w.length)w.push('Aktif');if(!w.length)return;if(q&&!(p[0]+' '+p[1]).toLowerCase().includes(q))return;r.push({i,no:p[0],name:p[1],s:p[2],e:p[3],w})});
 return r.sort((x,y)=>x.w[0].localeCompare(y.w[0])||x.no.localeCompare(y.no))}
const ucats=()=>{const X=uidx(),s=new Set();USEL.forEach(i=>{const m=X.P.get(i);if(m)m.forEach((n,c)=>s.add(c))});return[...s].sort((a,b)=>a.localeCompare(b))};
function utInit(){const A=isA();
 $('ut').innerHTML=`<div class="panel"><h2>${A?'Update Promo Harian':'Tugas Update Promo Saya'}<small id="ush"></small></h2>
 <div class="bar" style="margin:0 0 10px"><label>Tanggal <input type="date" id="ud" value="${UD}"></label><button class="btn" id="urf">Muat ulang</button>${A?'<button class="btn" id="ucsv">Export CSV</button>':''}</div>
 ${A?`<details id="uadd" style="border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin-bottom:14px"><summary style="cursor:pointer;font-weight:600">Buat penugasan update promo untuk tanggal ini</summary>
 <div class="muted" style="margin:8px 0">1) Tampilkan promo yang ada update pada tanggal di atas. 2) Pilih promo dan tentukan petugas per kategori. 3) Buat tugas.</div>
 <div class="bar" style="margin:0 0 8px"><label><input type="checkbox" id="uam" checked> Mulai berlaku hari itu</label><label><input type="checkbox" id="uae" checked> Berakhir hari itu</label><label><input type="checkbox" id="uaa"> Semua promo aktif</label><label>Cari <input type="text" id="uaq" placeholder="nama / no promo" style="width:170px"></label><button class="btn" data-ua="find">Tampilkan promo</button></div>
 <div id="upl"></div><div id="ucat"></div></details>`:''}
 <div id="ubody"><div class="muted">Memuat…</div></div></div>`;utLoad()}
async function utLoad(){try{UT=(await uapi('GET','?date='+UD)).tasks;UE='';if(isA())UH=(await uapi('GET','?summary=7&to='+UD)).days}catch(e){UE=e.message}utRender()}
function renderUpl(){const X=uidx();
 $('upl').innerHTML=UPR.length?`<div class="muted" style="margin:6px 0">${UPR.length} promo ditemukan · ${USEL.size} dipilih <button class="btn fb" data-ua="allp">Pilih semua</button> <button class="btn fb" data-ua="nonep">Kosongkan</button></div><div class="tw" style="max-height:320px;overflow:auto">`+tbl(['','Promo','Periode','Keterangan','Barang'],UPR.map(c=>{const m=X.P.get(c.i),n=m?[...m.values()].reduce((a,b)=>a+b,0):0;return `<tr><td><input type="checkbox" class="upk" data-i="${c.i}"${USEL.has(c.i)?' checked':''} aria-label="Pilih"></td><td>${esc(c.no)}<div class="muted">${esc(c.name)}</div></td><td>${per([0,0,c.s,c.e])}</td><td>${c.w.join(', ')}</td><td class="num">${n}</td></tr>`}),'',1)+'</div>':'<div class="muted">Tidak ada promo yang cocok pada tanggal ini. Coba centang "Semua promo aktif".</div>'}
function renderUcat(){if(!UPR.length||!USEL.size){$('ucat').innerHTML='';return}const X=uidx(),tot=new Map();USEL.forEach(i=>{const m=X.P.get(i);if(m)m.forEach((n,c)=>{const o=tot.get(c)||{p:0,n:0};o.p++;o.n+=n;tot.set(c,o)})});let nt=0;
 const rows=ucats().map(c=>{const s=UC[c]||(UC[c]={on:true,to:''}),o=tot.get(c);if(s.on)nt+=o.p;return `<tr><td><input type="checkbox" class="ucon" data-c="${esc(c)}"${s.on?' checked':''} aria-label="Sertakan"></td><td>${esc(c)}</td><td class="num">${o.p}</td><td class="num">${o.n}</td><td><select class="ucs" data-c="${esc(c)}">${asOpts(s.to)}</select></td></tr>`});
 $('ucat').innerHTML=`<h2 style="margin:12px 0 6px">Penugasan per kategori</h2><div class="bar" style="margin:0 0 8px"><label>Semua kategori ke <select id="ucall">${asOpts('')}</select></label><button class="btn" data-ua="catall">Terapkan</button><button class="btn" data-ua="catrr">Bagi rata kategori ke semua petugas</button></div>`+tbl(['','Kategori','Promo','Barang','Petugas'],rows,'',1)+`<div class="bar" style="margin-top:10px"><button class="btn" data-ua="create" style="background:var(--acc);color:#fff;border-color:var(--acc)">Buat ${nt} tugas</button><span>Satu tugas = satu promo pada satu kategori.</span></div>`}
async function ucreate(){const X=uidx(),items=[];USEL.forEach(i=>{const p=D.promos[i],m=X.P.get(i);if(m)m.forEach((n,c)=>{const s=UC[c];if(s&&s.on)items.push({no:p[0],name:p[1],cat:c,n,to:s.to})})});
 if(!items.length){alert('Belum ada tugas yang bisa dibuat. Pilih promo dan kategori dulu.');return}
 if(!confirm('Buat '+items.length+' tugas untuk tanggal '+UD+'?'))return;let add=0,skip=0;
 try{for(let k=0;k<items.length;k+=400){const r=await uapi('POST','',{op:'add',date:UD,items:items.slice(k,k+400)});add+=r.added;skip+=r.skipped}}catch(e){alert('Gagal sebagian: '+e.message)}
 await utLoad();alert(add+' tugas dibuat'+(skip?', '+skip+' dilewati karena sudah ada.':'.'))}
function utRender(){
 const A=isA(),c=ucnt(UT),tot=UT.length,nu=unum(UT),p=upct(nu.d,nu.t);if(!$('ubody'))return;
 $('ush').textContent=` ${tot} tugas · ${c.Selesai} selesai · ${nu.d}/${nu.t} barang (${p}%)`;
 if(UE){$('ubody').innerHTML=`<div class="vd bad">${esc(UE)}${/server|404|500/i.test(UE)?'<br>Fitur ini butuh fungsi server Netlify (deploy folder lengkap).':''}</div>`;return}
 const cats=[...new Set(UT.map(t=>t.cat||'-'))].sort();
 const L=UT.filter(t=>(UF==='all'||t.status===UF)&&(UK==='all'||(t.cat||'-')===UK)&&(!A||UP==='all'||(UP==='none'?!t.to:t.to===UP)));
 const grp=(keys,f)=>keys.map(k=>{const x=UT.filter(t=>f(t)===k);if(!x.length)return'';const q=ucnt(x),m=unum(x);return `<tr><td>${esc(k.includes('.mgsleman')?sn(k):(k||'-'))}</td><td class="num">${x.length}</td><td class="num">${q.Selesai}</td><td class="num">${q.Proses}</td><td class="num">${q.Belum}</td><td class="num">${q.Kendala}</td><td class="num">${m.d}/${m.t}</td><td>${ubar(upct(m.d,m.t))}</td></tr>`}).join('');
 const H=['Total','Selesai','Proses','Belum','Kendala','Barang'].map(x=>x),mk=(f,rows,e)=>tbl([f,'Tugas','Selesai','Proses','Belum','Kendala','Barang','Progress'],[rows].filter(Boolean),e,1).replace(/<th>(Tugas|Selesai|Proses|Belum|Kendala|Barang)</g,'<th class="num">$1<');
 const cols=A?8:6,row=t=>{const own=A||t.to===USER;return `<tr>${A?`<td><input type="checkbox" class="uck" data-id="${t.id}" aria-label="Pilih"></td>`:''}<td>${esc(t.no)}<div class="muted">${esc(t.name||'')}</div></td><td>${esc(t.cat||'-')}</td><td class="num">${t.n||0}<div><button class="btn fb" data-uv="${t.id}">${UOPEN===t.id?'Tutup':'Lihat'}</button></div></td>${A?`<td><select class="uas" data-id="${t.id}">${asOpts(t.to)}</select></td>`:''}<td>${own?`<select class="ust" data-id="${t.id}">${UST.map(s=>`<option${s===t.status?' selected':''}>${s}</option>`).join('')}</select>`:esc(t.status)}</td><td>${own?`<input type="text" class="unt" data-id="${t.id}" value="${esc(t.note||'')}" placeholder="Catatan" style="min-width:140px;padding:5px 7px">`:esc(t.note||'')}</td><td>${t.at?esc(sn(t.by))+'<div class="muted">'+fmtT(t.at)+'</div>':'<span class="muted">-</span>'}</td></tr>`+(UOPEN===t.id?itemsRow(t,cols+1):'')};
 const itemsRow=(t,n)=>{if(!D)return `<tr><td colspan="${n}" class="muted">Memuat data barang…</td></tr>`;const I=uitems(t.no,t.cat);return `<tr><td colspan="${n}" style="background:var(--head)"><div class="muted" style="margin-bottom:6px">${I.length} barang${I.length>200?' (200 pertama ditampilkan)':''} <button class="btn fb" data-ux="${t.id}">Export CSV</button></div>`+tbl(['No Item','Barcode','Deskripsi','Brand'],I.slice(0,200).map(i=>`<tr><td>${i[0]}</td><td>${i[1]||'-'}</td><td>${esc(i[2])}</td><td>${esc(i[4])}</td></tr>`),'Tidak ada barang.',1)+'</td></tr>'};
 const kp=(l,v,k)=>`<div><div class="k">${l}</div><div class="v"${k?` style="color:var(--${k})"`:''}>${v}</div></div>`,un=UT.filter(t=>!t.to).length;
 $('ubody').innerHTML=(A?`<div class="info" style="margin-bottom:14px">${kp('Total tugas',tot)}${kp('Selesai',c.Selesai,'ok')}${kp('Sedang diproses',c.Proses,'warn')}${kp('Belum dikerjakan',c.Belum,'bad')}${kp('Ada kendala',c.Kendala,'bad')}${kp('Belum ditugaskan',un)}${kp('Barang selesai',nu.d+' / '+nu.t)}${kp('Progress barang',p+'%')}</div>
 <h2>Progress per petugas</h2>${mk('Petugas',grp(STAFF,t=>t.to),'Belum ada tugas yang ditugaskan pada tanggal ini.')}
 <h2 style="margin-top:14px">Progress per kategori</h2>${mk('Kategori',grp(cats,t=>t.cat||'-'),'Belum ada tugas.')}
 <h2 style="margin-top:14px">7 hari terakhir</h2>${tbl(['Tanggal','Tugas','Selesai','Barang','Progress'],UH.map(d=>`<tr style="cursor:pointer" data-d="${d.date}"><td>${d.date.slice(8)}/${d.date.slice(5,7)}/${d.date.slice(2,4)}${d.date===UD?' ◀':''}</td><td class="num">${d.total}</td><td class="num">${d.Selesai}</td><td class="num">${d.bs||0}/${d.tb||0}</td><td>${d.tb?ubar(upct(d.bs,d.tb)):(d.total?ubar(upct(d.Selesai,d.total)):'<span class="muted">-</span>')}</td></tr>`),'',1).replace(/<th>(Tugas|Selesai|Barang)</g,'<th class="num">$1<')}
 <h2 style="margin:14px 0 8px">Daftar tugas</h2>`:`<div class="muted" style="margin-bottom:8px">Ubah status dan catatan progres tugas Anda. Selesai: ${c.Selesai} dari ${tot} tugas (${nu.d} dari ${nu.t} barang).</div>`)+
 `<div class="bar" style="margin:0 0 10px"><label>Status <select id="uf">${[['all','Semua'],...UST.map(s=>[s,s])].map(([v,t])=>`<option value="${v}"${v===UF?' selected':''}>${t}</option>`).join('')}</select></label><label>Kategori <select id="uk"><option value="all">Semua</option>${cats.map(k=>`<option${k===UK?' selected':''}>${esc(k)}</option>`).join('')}</select></label>${A?`<label>Petugas <select id="up"><option value="all">Semua</option><option value="none"${UP==='none'?' selected':''}>Belum ditugaskan</option>${STAFF.map(u=>`<option${u===UP?' selected':''}>${u}</option>`).join('')}</select></label>`:''}</div>`+
 (A?`<div class="bar" style="margin:0 0 10px"><label>Tugaskan ke <select id="ubk">${asOpts('')}</select></label><button class="btn" data-ua="bulk">Yang dicentang</button><button class="btn" data-ua="shown">Semua yang tampil (${L.length})</button><button class="btn" data-ua="del">Hapus yang dicentang</button></div>`:'')+
 tbl(A?['<input type="checkbox" id="uca" aria-label="Pilih semua">','Promo','Kategori','Barang','Petugas','Status','Catatan','Update terakhir']:['Promo','Kategori','Barang','Status','Catatan','Update terakhir'],L.slice(0,ULIM).map(row),A?'Belum ada tugas pada tanggal ini.':'Tidak ada tugas update promo untuk Anda pada tanggal ini.',1)+(L.length>ULIM?`<div class="muted" style="margin-top:8px">Menampilkan ${ULIM} dari ${L.length} tugas. <button class="btn fb" data-ua="more">Tampilkan 300 lagi</button></div>`:'');
}
async function uop(b){try{const r=await uapi('POST','',Object.assign({date:UD},b));UT=r.tasks;UE='';if(isA())UH=(await uapi('GET','?summary=7&to='+UD)).days;utRender();return r}catch(e){alert('Gagal menyimpan: '+e.message);utLoad()}}
$('ut').addEventListener('click',async e=>{const t=e.target;
 if(t.id==='urf'){utLoad();return}
 const dr=t.closest('tr[data-d]');if(dr){UD=dr.dataset.d;$('ud').value=UD;utLoad();return}
 if(t.dataset.uv){UOPEN=UOPEN===t.dataset.uv?null:t.dataset.uv;utRender();if(UOPEN&&!D){await ensureD();utRender()}return}
 if(t.dataset.ux){const k=UT.find(x=>x.id===t.dataset.ux);if(!k||!D)return;const cl=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';await saveFile('Barang_'+k.no+'_'+(k.cat||'').replace(/[^A-Za-z0-9]+/g,'_')+'.csv','\ufeff'+[['No Item','Barcode','Deskripsi','Brand','Master Brand','Kategori'],...uitems(k.no,k.cat).map(i=>[i[0],i[1],i[2],i[4],i[5],k.cat])].map(r=>r.map(cl).join(',')).join('\r\n'));return}
 if(t.dataset.ua==='more'){ULIM+=300;utRender();return}
 if(!isA())return;
 if(t.id==='ucsv'){if(!UT.length){alert('Tidak ada data.');return}const cl=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';await saveFile('Update_Promo_'+UD+'.csv','\ufeff'+[['Tanggal','No Promo','Nama Promo','Kategori','Jumlah barang','Petugas','Status','Catatan','Update terakhir','Oleh'].map(cl).join(','),...UT.map(x=>[x.date,x.no,x.name,x.cat,x.n,x.to,x.status,x.note,x.at,x.by].map(cl).join(','))].join('\r\n'));return}
 const a=t.dataset.ua;if(!a)return;
 if(a==='find'){await ensureD();if(!D){alert('Data promo belum termuat.');return}UPR=ucands();USEL=new Set(UPR.map(c=>c.i));UC={};renderUpl();renderUcat();return}
 if(a==='allp'){USEL=new Set(UPR.map(c=>c.i));renderUpl();renderUcat();return}
 if(a==='nonep'){USEL=new Set();renderUpl();renderUcat();return}
 if(a==='catall'){ucats().forEach(c=>{(UC[c]=UC[c]||{on:true}).to=$('ucall').value});renderUcat();return}
 if(a==='catrr'){ucats().forEach((c,i)=>{(UC[c]=UC[c]||{on:true}).to=STAFF[i%STAFF.length]});renderUcat();return}
 if(a==='create'){await ucreate();return}
 if(a==='shown'){const ids=UT.filter(x=>(UF==='all'||x.status===UF)&&(UK==='all'||(x.cat||'-')===UK)&&(UP==='all'||(UP==='none'?!x.to:x.to===UP))).map(x=>x.id);if(!ids.length)return;if(confirm('Tugaskan '+ids.length+' tugas yang tampil ke '+($('ubk').value||'(belum ditugaskan)')+'?'))await uop({op:'assign',ids,to:$('ubk').value});return}
 const ids=[...document.querySelectorAll('#ut .uck:checked')].map(c=>c.dataset.id);
 if(!ids.length){alert('Centang dulu tugas yang dipilih.');return}
 if(a==='bulk')await uop({op:'assign',ids,to:$('ubk').value});
 if(a==='del'&&confirm('Hapus '+ids.length+' tugas?'))await uop({op:'del',ids})});
$('ut').addEventListener('change',async e=>{const t=e.target;
 if(t.id==='ud'){if(t.value){UD=t.value;UOPEN=null;utLoad()}return}
 if(t.id==='uf'){UF=t.value;ULIM=300;utRender();return}
 if(t.id==='uk'){UK=t.value;ULIM=300;utRender();return}
 if(t.id==='up'){UP=t.value;ULIM=300;utRender();return}
 if(t.id==='uca'){document.querySelectorAll('#ut .uck').forEach(c=>{c.checked=t.checked});return}
 if(t.classList.contains('upk')){const i=+t.dataset.i;t.checked?USEL.add(i):USEL.delete(i);renderUcat();return}
 if(t.classList.contains('ucon')){(UC[t.dataset.c]=UC[t.dataset.c]||{to:''}).on=t.checked;renderUcat();return}
 if(t.classList.contains('ucs')){(UC[t.dataset.c]=UC[t.dataset.c]||{on:true}).to=t.value;return}
 const id=t.dataset.id;if(!id)return;
 if(t.classList.contains('ust'))await uop({op:'update',id,status:t.value});
 if(t.classList.contains('unt'))await uop({op:'update',id,note:t.value});
 if(t.classList.contains('uas')&&isA())await uop({op:'assign',ids:[id],to:t.value})});
setInterval(()=>{const a=document.activeElement;if(USER&&!document.hidden&&!(a&&a.closest&&a.closest('#ubody')&&/INPUT|SELECT/.test(a.tagName)))utLoad()},60000);
setInterval(()=>{const a=document.activeElement;if(USER&&!document.hidden&&!(a&&a.closest&&a.closest('#fp')&&/INPUT|SELECT/.test(a.tagName)))fLoad()},60000);


/* ===== integrasi dengan halaman utama ===== */
let PENDING='';
const sampleTxt=no=>{const l=window.sampleOf&&window.sampleOf(no);return l&&l.length?l.map(esc).join('<br>'):'<span class="muted">Belum ada sample</span>'};
function psub(v){if(v==='mp'&&typeof mLoadOnce==='function')mLoadOnce();document.querySelectorAll('#pr .pv').forEach(e=>e.classList.toggle('on',e.id===v));document.querySelectorAll('#psn .chip').forEach(b=>b.classList.toggle('on',b.dataset.p===v))}
$('psn').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b)psub(b.dataset.p)});
async function runFind(code){psub('adm');if(!D){try{await load()}catch(e){}}$('fn').value=code;search()}
window.PROMO={sub(v){psub(v)},find(code){if(!code)return;if(!USER){PENDING=code;return}if(ROLE!=='admin'){psub('ut');return}runFind(code)}};
let PSC=null;
function pscanStop(){if(PSC){PSC.stop().catch(()=>{});PSC=null}$('scm').hidden=true}
$('pscan').addEventListener('click',async()=>{$('scm').hidden=false;try{PSC=new Html5Qrcode('pread');await PSC.start({facingMode:'environment'},{fps:10,qrbox:{width:260,height:140}},t=>{$('fn').value=t;pscanStop();$('fn').dispatchEvent(new Event('input'));if(navigator.vibrate)navigator.vibrate(80)},()=>{})}catch(e){pscanStop();alert('Kamera tidak bisa dibuka. Izinkan akses kamera di browser.')}});
$('scx').addEventListener('click',pscanStop);

/* ===== Diagnosa data promo: promo / brand yang tidak terhubung ke barang ===== */
function diag(){if(!D){alert('Data promo belum termuat.');return}
 const P=D.promos,codes=new Set();let nob=0;D.items.forEach(i=>{if(i[3])codes.add(i[3]);else nob++});
 const ref=new Array(P.length).fill(0);
 for(const k in D.ip)D.ip[k].forEach(r=>{ref[r[1]]++});
 for(const k in D.bp)if(codes.has(k))D.bp[k].forEach(r=>{ref[r[1]]++});
 for(const k in D.tab)ref[+k]++;
 const orph=P.map((p,i)=>[p,i]).filter(x=>!ref[x[1]]),bk=Object.keys(D.bp).filter(k=>!codes.has(k));
 const act=P.filter(p=>st(p)==='a').length,ended=P.filter(p=>p[3]<$('dt').value).length,last=P.reduce((a,p)=>p[2]>a?p[2]:a,'');
 const IM=new Set(D.items.map(i=>i[0]));const kp=(l,v,c)=>`<div><div class="k">${l}</div><div class="v"${c?` style="color:var(--${c})"`:''}>${v}</div></div>`;
 $('out').innerHTML=`<div class="panel"><h2>Diagnosa data promo <small>${esc($('src').textContent||'')}</small></h2><div class="info">${kp('Total promo',P.length)}${kp('Aktif pada '+$('dt').value,act,'ok')}${kp('Sudah berakhir',ended)}${kp('Promo mulai terbaru',last?last.slice(8)+'/'+last.slice(5,7)+'/'+last.slice(2,4):'-')}${kp('Promo tanpa barang',orph.length,orph.length?'bad':'ok')}${kp('Brand promo tanpa barang',bk.length,bk.length?'warn':'ok')}${kp('Barang tanpa brand code',nob,nob?'warn':'ok')}${kp('Total barang',D.items.length)}${kp('Item stok tanpa master promo',(window.stockCodes?window.stockCodes().filter(c=>!IM.has(c)).length:'-'),'warn')}</div>
 <div class="muted" style="margin-top:10px">Promo tanpa barang = promo yang tidak menempel ke barang mana pun. Brand promo tanpa barang = kode brand di file promo yang tidak ada di daftar barang. Barang tanpa brand code tidak bisa menerima promo brand.</div></div>
 <div class="panel"><h2>Promo tanpa barang</h2>${tbl(['Promo','Periode','Jenis'],orph.slice(0,200).map(x=>`<tr><td>${pn(x[0])}</td><td>${per(x[0])}</td><td>${x[0][4]}</td></tr>`),'Semua promo terhubung ke barang.',1)}</div>
 <div class="panel"><h2>Kode brand di promo yang tidak ada barangnya</h2>${tbl(['Kode brand','Promo','Disc'],bk.slice(0,200).map(k=>`<tr><td>${esc(k)}</td><td>${D.bp[k].map(r=>esc(P[r[1]][1])).slice(0,3).join('<br>')}</td><td class="num">${D.bp[k].map(r=>pc(r[2])).slice(0,3).join('<br>')}</td></tr>`),'Semua kode brand punya barang.',1)}</div>`}
$('dgn').addEventListener('click',diag);

/* ===== Monitor Perubahan Promo: cek per tanggal apakah barang sudah diprogres promonya ===== */
let MM='date',MB=[],MBID='',MPD='',MCF='all',MD=today,MT={s:true,e:true},MR=[],MP={},MF='all',MC='all',MQ='',ML=100,ME='',MSEL=new Set(),MLOADED=false;
const MS={B:'Belum',P:'Proses',S:'Sudah',K:'Kendala'};
async function mapi(method,q,body,base){const r=await fetch((base||'/api/promoprogress')+(q||''),{method,headers:{'content-type':'application/json','x-cp-user':USER,'x-cp-hash':CPH},body:body?JSON.stringify(body):undefined});if(!r.ok){let m='';try{m=(await r.json()).error}catch(e){}throw new Error(m||('Server error '+r.status))}return r.json()}
const mst=r=>(MP[r.k]||['B'])[0];
const pdt=()=>MM==='chg'?MPD:MD;
const cv=w=>{const[t,no,n,cat,br,pn,pname,end,o,nw,ty]=w,f=v=>v==null?'-':String(v);return{k:t+'|'+no+'|'+pn+'|'+ty,no,n,cat,br,pn,pname,w:{L:'Hilang',C:'Diskon berubah',A:'Baru'}[t],t:ty,disc:0,dtxt:t==='L'?'sebelumnya '+f(o)+(end?' · berlaku s/d '+end.slice(8)+'/'+end.slice(5,7):''):t==='C'?f(o)+' → '+f(nw):'nilai '+f(nw)}};
function mRows(){const tg=new Map();D.promos.forEach((p,i)=>{const w=[];if(MT.s&&p[2]===MD)w.push('Mulai');if(MT.e&&p[3]===MD)w.push('Berakhir');if(w.length)tg.set(i,w.join(' & '))});
 const out=[];if(!tg.size)return out;
 for(const it of D.items){const cat=D.cats[it[6]]||'LAINNYA',seen=new Set();
  const add=r=>{if(!tg.has(r[1])||seen.has(r[1]))return;seen.add(r[1]);const p=D.promos[r[1]];out.push({k:it[0]+'|'+p[0],no:it[0],n:it[2],cat,br:it[4],pn:p[0],pname:p[1],w:tg.get(r[1]),t:r[0],disc:r[2]})};
  (D.ip[it[0]]||[]).forEach(add);if(it[3])(D.bp[it[3]]||[]).forEach(add)}
 for(const k in D.tab){if(!tg.has(+k))continue;const p=D.promos[+k];D.tab[k][1].forEach(x=>{out.push({k:x[1]+'|'+p[0],no:x[1],n:x[2],cat:x[0]||TBC,br:'',pn:p[0],pname:p[1],w:tg.get(+k),t:'T',disc:0})})}
 return out}
function mInit(){if(!$('mp'))return;
 $('mp').innerHTML=`<div class="panel"><h2>Monitor Perubahan Promo<small id="msh"></small></h2>
 <div class="muted" style="margin-bottom:8px">Pilih tanggal untuk melihat semua barang yang promonya berubah (mulai atau berakhir) pada tanggal itu, lalu tandai barang yang sudah diprogres.</div>
 <div class="bar" style="margin:0 0 10px"><label>Sumber <select id="mmode"><option value="date">Promo mulai/berakhir pada tanggal</option><option value="chg">Promo hilang/berubah setelah import data</option></select></label></div>
 <div class="bar" style="margin:0 0 10px"><span id="mdw" style="display:contents"><button class="btn" data-ma="prev" aria-label="Hari sebelumnya">◀</button><label>Tanggal <input type="date" id="md" value="${MD}"></label><button class="btn" data-ma="next" aria-label="Hari berikutnya">▶</button><button class="btn" data-ma="today">Hari ini</button><label><input type="checkbox" id="mts" checked> Mulai berlaku</label><label><input type="checkbox" id="mte" checked> Berakhir</label></span><span id="mcw" hidden style="display:contents"><label>Hasil import <select id="mbsel"></select></label></span><button class="btn" data-ma="refresh">Muat ulang</button><button class="btn" data-ma="csv">Export CSV</button></div>
 <div id="mbody"><div class="muted">Pilih tab ini untuk memuat data…</div></div></div>`}
function mLoadOnce(){if(!MLOADED){MLOADED=true;mLoad()}}
async function mLoad(){ME='';$('mbody')&&($('mbody').innerHTML='<div class="muted">Memuat…</div>');try{await ensureD();
  if(MM==='chg'){MB=(await mapi('GET','?list=1',null,'/api/promochanges')).list||[];if(!MBID||!MB.some(x=>x.id===MBID))MBID=MB[0]?MB[0].id:'';if(MBID){const b=await mapi('GET','?id='+encodeURIComponent(MBID),null,'/api/promochanges');MR=b.rows.map(cv);MPD=b.at.slice(0,10)}else{MR=[];MPD=today}}
  else MR=mRows();
  MP=(await mapi('GET','?date='+pdt())).p||{}}catch(e){ME=e.message}MSEL=new Set();mRender()}
function mRender(){if(!$('mbody'))return;
 if(ME){$('mbody').innerHTML=`<div class="vd bad">${esc(ME)}${/server|404|500/i.test(ME)?'<br>Fitur ini butuh fungsi server Netlify (deploy folder lengkap).':''}</div>`;return}
 const c={B:0,P:0,S:0,K:0};MR.forEach(r=>{c[mst(r)]++});const tot=MR.length,p=upct(c.S,tot);
 $('msh').textContent=` ${tot} barang-promo · ${c.S} sudah (${p}%)`;if($('mdw')){$('mdw').hidden=MM==='chg';$('mcw').hidden=MM!=='chg'}
 const cats=[...new Set(MR.map(r=>r.cat))].sort();
 const L=MR.filter(r=>(MF==='all'||mst(r)===MF)&&(MC==='all'||r.cat===MC)&&(MM!=='chg'||MCF==='all'||r.w===MCF)&&(!MQ||(r.no+' '+r.n+' '+r.pn+' '+r.pname+' '+r.br).toLowerCase().includes(MQ)));
 if($('mbsel')&&MM==='chg'){const h=MB.map(b=>`<option value="${b.id}"${b.id===MBID?' selected':''}>${new Date(b.at).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})} · ${sn(b.by)} · hilang ${b.l} / berubah ${b.c} / baru ${b.a}</option>`).join('')||'<option value="">Belum ada hasil import</option>';if($('mbsel').dataset.h!==h){$('mbsel').innerHTML=h;$('mbsel').dataset.h=h}}
 const kp=(l,v,k)=>`<div><div class="k">${l}</div><div class="v"${k?` style="color:var(--${k})"`:''}>${v}</div></div>`;
 const cr=cats.map(k=>{const x=MR.filter(r=>r.cat===k),s=x.filter(r=>mst(r)==='S').length;return `<tr><td>${esc(k)}</td><td class="num">${x.length}</td><td class="num">${s}</td><td class="num">${x.length-s}</td><td>${ubar(upct(s,x.length))}</td></tr>`});
 const row=r=>{const s=mst(r),e=MP[r.k];return `<tr><td><input type="checkbox" class="mck" data-k="${esc(r.k)}"${MSEL.has(r.k)?' checked':''} aria-label="Pilih"></td><td>${esc(r.no)}<div class="muted">${esc(r.n)}</div></td><td>${esc(r.cat)}<div class="muted">${esc(r.br||'')}</div></td><td>${esc(r.pn)}<div class="muted">${esc(r.pname)}</div></td><td>${esc(r.w)}${r.dtxt?'<div class="muted">'+esc(r.dtxt)+'</div>':(r.disc?'<div class="muted">'+pc(r.disc)+'</div>':'')}</td><td><select class="mst" data-k="${esc(r.k)}">${Object.entries(MS).map(([v,t])=>`<option value="${v}"${v===s?' selected':''}>${t}</option>`).join('')}</select></td><td>${e?esc(sn(e[1]))+'<div class="muted">'+fmtT(e[2])+'</div>':'<span class="muted">-</span>'}</td></tr>`};
 $('mbody').innerHTML=(tot?`<div class="info" style="margin-bottom:14px">${kp('Total barang-promo',tot)}${kp('Sudah diprogres',c.S,'ok')}${kp('Sedang diproses',c.P,'warn')}${kp('Kendala',c.K,'bad')}${kp('Belum diprogres',c.B,'bad')}${kp('Progress',p+'%')}</div>
 <h2>Progress per kategori</h2>${tbl(['Kategori','Barang','Sudah','Belum','Progress'],cr,'',1).replace(/<th>(Barang|Sudah|Belum)</g,'<th class="num">$1<')}<h2 style="margin:14px 0 8px">Daftar barang</h2>`:'')+
 `<div class="bar" style="margin:0 0 10px"><label>Status <select id="mf">${[['all','Semua'],...Object.entries(MS)].map(([v,t])=>`<option value="${v}"${v===MF?' selected':''}>${t}</option>`).join('')}</select></label><label>Kategori <select id="mc"><option value="all">Semua</option>${cats.map(k=>`<option${k===MC?' selected':''}>${esc(k)}</option>`).join('')}</select></label>${MM==='chg'?`<label>Jenis <select id="mtf">${[['all','Semua'],['Hilang','Hilang'],['Diskon berubah','Diskon berubah'],['Baru','Baru']].map(([v,t])=>`<option value="${v}"${v===MCF?' selected':''}>${t}</option>`).join('')}</select></label>`:''}<label>Cari <input type="text" id="mq" value="${esc(MQ)}" placeholder="item / promo / brand" style="width:170px"></label></div>`+
 (tot?`<div class="bar" style="margin:0 0 10px"><label>Tandai sebagai <select id="mbs">${Object.entries(MS).map(([v,t])=>`<option value="${v}"${v==='S'?' selected':''}>${t}</option>`).join('')}</select></label><button class="btn" data-ma="bulk">Yang dicentang</button><button class="btn" data-ma="shown">Semua yang tampil (${L.length})</button></div>`:'')+
 tbl(['<input type="checkbox" id="mca" aria-label="Pilih semua">','Barang','Kategori','Promo','Perubahan','Status progres','Update terakhir'],L.slice(0,ML).map(row),tot?'Tidak ada barang yang cocok dengan filter.':(MM==='chg'?'Belum ada hasil import yang tersimpan. Admin: import data promo baru lalu pilih simpan ke server.':'Tidak ada promo yang mulai atau berakhir pada tanggal ini.'),1)+(L.length>ML?`<div class="muted" style="margin-top:8px">Menampilkan ${ML} dari ${L.length}. <button class="btn fb" data-ma="more">Tampilkan 200 lagi</button></div>`:'')}
async function mSet(keys,status){if(!keys.length){alert('Tidak ada barang yang dipilih.');return}
 try{for(let i=0;i<keys.length;i+=5000)await mapi('POST','',{date:pdt(),keys:keys.slice(i,i+5000),status});const now=new Date().toISOString();keys.forEach(k=>{if(status==='B')delete MP[k];else MP[k]=[status,USER,now]});MSEL=new Set();mRender()}catch(e){alert('Gagal menyimpan: '+e.message);mLoad()}}
const mDay=n=>{const d=new Date(MD+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
$('mp').addEventListener('click',async e=>{const a=e.target.dataset.ma;if(!a)return;
 if(a==='prev'||a==='next'||a==='today'){MD=a==='prev'?mDay(-1):a==='next'?mDay(1):today;$('md').value=MD;ML=100;mLoad();return}
 if(a==='refresh'){mLoad();return}
 if(a==='more'){ML+=200;mRender();return}
 if(a==='csv'){if(!MR.length){alert('Tidak ada data.');return}const cl=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';await saveFile('Monitor_Promo_'+pdt()+(MM==='chg'?'_hilang_berubah':'')+'.csv','\ufeff'+[['Tanggal','No Item','Nama Barang','Kategori','Brand','No Promo','Nama Promo','Perubahan','Status progres','Oleh','Waktu'].map(cl).join(','),...MR.map(r=>{const x=MP[r.k]||[];return [pdt(),r.no,r.n,r.cat,r.br,r.pn,r.pname,r.w+(r.dtxt?' ('+r.dtxt+')':''),MS[mst(r)],x[1]||'',x[2]||''].map(cl).join(',')})].join('\r\n'));return}
 const st=$('mbs')&&$('mbs').value;
 if(a==='bulk')await mSet([...MSEL],st);
 if(a==='shown'){const L=MR.filter(r=>(MF==='all'||mst(r)===MF)&&(MC==='all'||r.cat===MC)&&(!MQ||(r.no+' '+r.n+' '+r.pn+' '+r.pname+' '+r.br).toLowerCase().includes(MQ)));if(L.length&&confirm('Tandai '+L.length+' barang sebagai '+MS[st]+'?'))await mSet(L.map(r=>r.k),st)}});
$('mp').addEventListener('change',async e=>{const t=e.target;
 if(t.id==='mmode'){MM=t.value;MF='all';MC='all';MCF='all';ML=100;mLoad();return}
 if(t.id==='mbsel'){MBID=t.value;ML=100;mLoad();return}
 if(t.id==='mtf'){MCF=t.value;ML=100;mRender();return}
 if(t.id==='md'){if(t.value){MD=t.value;ML=100;mLoad()}return}
 if(t.id==='mts'||t.id==='mte'){MT={s:$('mts').checked,e:$('mte').checked};ML=100;mLoad();return}
 if(t.id==='mf'){MF=t.value;ML=100;mRender();return}
 if(t.id==='mc'){MC=t.value;ML=100;mRender();return}
 if(t.id==='mca'){document.querySelectorAll('#mp .mck').forEach(c=>{c.checked=t.checked;t.checked?MSEL.add(c.dataset.k):MSEL.delete(c.dataset.k)});return}
 if(t.classList.contains('mck')){t.checked?MSEL.add(t.dataset.k):MSEL.delete(t.dataset.k);return}
 if(t.classList.contains('mst'))await mSet([t.dataset.k],t.value)});
let mtm;$('mp').addEventListener('input',e=>{if(e.target.id==='mq'){clearTimeout(mtm);mtm=setTimeout(()=>{MQ=e.target.value.trim().toLowerCase();ML=100;mRender();const q=$('mq');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}},250)}});

let su=null;try{su=sessionStorage.getItem('cp_user');CPH=sessionStorage.getItem('cp_h')||''}catch(e){}if(su&&USERS[su]&&CPH===USERS[su][0])enter(su);

// integrasi: terima kode item dari tab Monitoring (hash atau postMessage)
(function(){const go=(v,n)=>{n=n||0;if(typeof D!=='undefined'&&D){const f=document.getElementById('fn');f.value=v;f.dispatchEvent(new Event('input'))}else if(n<60)setTimeout(()=>go(v,n+1),300)};
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data&&e.data.cekItem)go(String(e.data.cekItem))});
if(location.hash.length>1)go(decodeURIComponent(location.hash.slice(1)))})();

})();
