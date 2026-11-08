/* ===== Chatlog Parser =====
   Reads a GTA:World chatlog in the browser: filters, forensics, mentions and export. Nothing is uploaded.
   The parsing rules, forensics and export logic are from Uglee Web by Younix; the page around it is this site's own.
   The tool lives in a shadow root so its styles and ids never mix with the rest of the site. */
(() => {
  "use strict";
  const HOST = document.getElementById("cl-host"), TPL = document.getElementById("cl-tpl");
  if (!HOST || !TPL) return;
  const R = HOST.attachShadow({ mode: "open" });
  R.innerHTML = '<link rel="stylesheet" href="css/chatlog.css">';
  R.append(TPL.content.cloneNode(true));
"use strict";
const RX = {"rules": [["Marker", "^\\[DATE:.*\\]$|^\\[--- .+ ---\\]$"], ["HqOoc", "^\\(\\(\\s*\\*+\\s*OOC\\s+HQ\\b|^\\*{2,}\\s*HQ\\b"], ["Emergency", "^911\\s*\\||^\\[911[^\\]]*\\]|^\\*{2,}.*\\b(emergency|landline)\\b|^\\*\\s*(log\\s*number|phone\\s*number|location|situation)\\b|^\\*\\s*(message|caller|subject|call\\s*type)\\s*:|^the (fire|police) department has (also )?been alerted\\b"], ["Pm", "^\\(\\(\\s*PM\\s+(to|from)\\b"], ["Radio", "^\\*{0,2}\\s*\\[S:\\s*[^\\]]*?CH:\\s*[^\\]]*\\]|^\\*{0,2}\\s*\\[CH:\\s*[^\\]]*\\]|^\\*{0,2}\\s*\\[[^\\]]*(->|=>|&gt;)[^\\]]*\\]"], ["Phone", "^\\[(phone|cellphone|call)[^\\]]*\\]|\\bsays \\(phone\\)|^!!.*ring.*!!|\\b(answers|declines|hangs up) (the|their|his|her) (phone|cellphone)\\b|^(\\([^)]*\\)\\s*)?Message\\s+(sent\\s+to|from)\\s+[^:]{1,80}:|^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?[\\*>]\\s*.*\\(phone\\)|^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?\\(phone\\)\\s*\\*"], ["Hq", "^\\[HQ[^\\]]*\\]"], ["Ads", "^\\[[^\\]]*Advertisement[^\\]]*\\]"], ["News", "^\\*{0,2}\\s*\\[news[^\\]]*\\]"], ["Admin", "^(\\[(admin|a|staff|report|punish|ban)(\\s[^\\]]*)?\\]|admcmd:|\\*\\*\\s*\\[admin)|\\bhas been\\b.*\\b(banned|kicked|jailed|muted|warned|unbanned|imprisoned)\\b|\\bhas (banned|kicked|jailed|muted|warned|unbanned)\\b|\\b(banned|kicked|jailed|muted|warned)\\b.*\\breason:|^(admin|staff|moderator)\\b.*\\b(ban|kick|jail|mute|warn)(s|ned|ked|ed)?\\b"], ["Action", "^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?\\*\\s*.*\\(\\(\\s*(?:Mask_[\\p{L}\\d]+(?:_[\\p{L}\\d]+)+|[\\p{L}][\\p{L}'\\-]*(?: [\\p{L}][\\p{L}'\\-]*){0,2})\\s*\\)\\)\\s*\\*?$|^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?\\(\\(\\s*\\[[^\\]]{1,40}\\]\\s*\\)\\)\\s*\\*+.*\\*\\s*$"], ["Ooc", "^\\(\\("], ["Local", "^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?(\\((Car|Radio)\\) )?[\\p{L}\\d][\\p{L}\\d'\\-_\\.]*(?: [\\p{L}\\d][\\p{L}\\d'\\-_\\.]*){0,4}?\\s+(says|shouts|whispers)\\b(?:\\s*(?:\\[[^\\]]{1,20}\\]|\\([^:()]{1,120}\\)|\\bto\\s+[^:]{1,120}))*\\s*:"], ["Emote", "^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?[\\*>]\\s+(?!(?:You|Your)\\b)\\S"], ["Money", "^\\*{0,2}\\s*you\\b.*\\b(picked up|paid|received|gave|given|lost|found|earned|charged|deposited|withdrew|withdrawn|transferred|spent|sold|bought|purchased|refunded|fined|billed)\\b.*(\\$\\s?\\d|\\d[\\d,\\.]*\\s?\\$|\\b\\d[\\d,\\.]*\\s?dollars?\\b)|^\\[(bank|atm|paycheck|payment|salary|invoice|money|transfer)[^\\]]*\\]|\\$\\s?\\d[\\d,]*"], ["Error", "^\\[(error|err|warning|failed|denied|invalid)[^\\]]*\\]|^(error|failed|denied)\\b|^you (are|were) not\\b|^you (have no|do not have|need|must|cannot|can not|may not)\\b|^you (don|can|aren|weren|haven)'?t\\b|^(invalid|unknown|unrecognised|unrecognized|no such)\\b|^usage:|^there (is|are) (no|not)\\b|^(nobody|no one|nothing) (is|was|found|nearby|here)\\b"], ["Server", "^\\[[^\\]]{1,40}\\]"]], "spk": {"LocalNames": ["^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?(\\((Car|Radio)\\) )?(?<name>[\\p{L}\\d][\\p{L}\\d'\\-_\\.]*(?: [\\p{L}\\d][\\p{L}\\d'\\-_\\.]*){0,4}?)\\s+(says|shouts|whispers)\\b"], "RadioNames": ["^\\*{0,2}\\s*\\[[^\\]]*\\]\\s*(?<name>[\\p{L}\\d][\\p{L}\\d'\\-_\\.]*(?: [\\p{L}\\d][\\p{L}\\d'\\-_\\.]*){0,4}?)(?:\\s+(says|shouts|whispers)\\b|\\s*:)"], "PhoneNames": ["^(?<name>(?:Mask_[\\p{L}\\d]+(?:_[\\p{L}\\d]+)+|[\\p{L}][\\p{L}'\\-]*(?: [\\p{L}][\\p{L}'\\-]*){0,2})) says \\(phone\\)", "^\\[(phone|cellphone|call)[^\\]]*\\]\\s*(?<name>[\\p{L}\\d][\\p{L}\\d'\\-_\\.]*(?: [\\p{L}\\d][\\p{L}\\d'\\-_\\.]*){0,4}?)(?:\\s+(says|shouts|whispers)\\b|\\s*:)", "^(\\([^)]*\\)\\s*)?Message\\s+(sent\\s+to|from)\\s+(?<name>[^:]{1,80}):"], "EmoteNames": ["^(?:\\[[^\\]\\p{L}]{1,8}\\]\\s*)?[\\*>]\\s+(?!(?:You|Your)\\b)(?<name>(?:Mask_[\\p{L}\\d]+(?:_[\\p{L}\\d]+)+|[\\p{L}][\\p{L}'\\-]*(?: [\\p{L}][\\p{L}'\\-]*)?))\\s"], "ActionNames": ["\\(\\(\\s*(?<name>(?:Mask_[\\p{L}\\d]+(?:_[\\p{L}\\d]+)+|[\\p{L}][\\p{L}'\\-]*(?: [\\p{L}][\\p{L}'\\-]*){0,2}))\\s*\\)\\)\\s*\\*?$"], "PmNames": ["^\\(\\(\\s*PM\\s+(to|from)\\s+\\(\\d*\\)\\s*(?<name>[^:]{1,80}):"], "OocNames": ["^\\(\\(\\s*(\\(\\d*\\)\\s*)?(?<name>[^:\\[\\]()]{1,60}?)\\s*(\\[\\s*ID\\s*:\\s*\\d+\\s*\\])?\\s*:"], "HqNames": ["^\\[HQ[^\\]]*\\]\\s*(?<name>[^:]{1,80}):", "^(?:\\(\\(\\s*)?\\*+\\s*(?:OOC\\s+)?HQ\\b[^:]*?(?:\\]\\s*)?(?<name>[\\p{L}][\\p{L}'\\-]*(?: [\\p{L}][\\p{L}'\\-]*){1,3})\\s*:"]}};

/* ------------------------------------------------------------ kinds */
const KINDS = [
  ["Local","Local","says / shouts / whispers","SAY"],["Emote","Emote","/me lines","ME"],["Action","Action","/do and /ame lines","DO"],
  ["Ooc","OOC","(( out of character ))","OOC"],["Pm","PM","private messages","PM"],["Radio","Radio","slot and channel traffic","RAD"],
  ["Phone","Phone","calls and phone speech","TEL"],["Emergency","911","emergency calls","911"],["Hq","HQ","[HQ] department traffic","HQ"],
  ["HqOoc","HQ OOC","** HQ and OOC HQ traffic","HQO"],["Ads","Ads","advertisements","AD"],["News","News","[NEWS] broadcasts","NEWS"],
  ["Money","Money","payments and bank lines","$"],["Admin","Admin","staff, bans and reports","ADM"],["Server","Server","[tagged] server notices","SRV"],
  ["Error","Err","refusals and server errors","ERR"],["Other","Other","anything unmatched","TXT"],["Marker","Marker","session headers","---"]
].map(([key,name,hint,badge])=>({key,name,hint,badge}));
const KIDX = Object.fromEntries(KINDS.map((k,i)=>[k.key,i]));
const RULES = RX.rules.map(([k,p])=>[k,new RegExp(p,"iu")]);
const SPK = {}; for (const n in RX.spk) SPK[n] = RX.spk[n].map(p=>new RegExp(p,"iu"));
const SPKMAP = {Local:"LocalNames",Radio:"RadioNames",Phone:"PhoneNames",Emote:"EmoteNames",Action:"ActionNames",Pm:"PmNames",Ooc:"OocNames",Hq:"HqNames",HqOoc:"HqNames"};
const RP = ["Local","Emote","Action","Radio","Phone","Emergency"];

function cleanName(n){
  if(!n) return null;
  n = n.replace(/\([^)]*\)|\[[^\]]*\]/g," ").replace(/\s{2,}/g," ").trim().replace(/^[*:\- ]+|[*:\- ]+$/g,"");
  n = n.replace(/ (says|said)$/,"").trim();
  if(n.length<2||n.length>40||!/\p{L}/u.test(n)) return null;
  if(["you","your","someone","unknown"].includes(n.toLowerCase())) return null;
  return n;
}
function classify(body){
  let kind="Other";
  for(const [k,r] of RULES){ if(r.test(body)){ kind=k; break; } }
  let speaker=null; const set=SPK[SPKMAP[kind]];
  if(set) for(const r of set){ const m=body.match(r); if(m&&m.groups){ speaker=cleanName(m.groups.name); if(speaker) break; } }
  return {kind,speaker};
}

/* ------------------------------------------------------------ parsing a log */
const CLOCK = /^\[(?:(\d{1,2}\/[A-Za-z]{3,}\/\d{4})\s*[-|]\s*)?(\d{1,2}:\d{2}(?::\d{2})?)\]\s*/;
const MON = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
function parseDay(s){ const m=/^(\d{1,2})\/([A-Za-z]{3})[A-Za-z]*\/(\d{4})/.exec(s.trim()); if(!m) return null; const mo=MON[m[2].toLowerCase()]; return mo==null?null:new Date(+m[3],mo,+m[1]); }
function normClock(c){ const p=c.split(":"); return p[0].padStart(2,"0")+":"+p[1]+":"+(p[2]||"00"); }
function secs(c){ const p=c.split(":"); return (+p[0])*3600+(+p[1])*60+(+(p[2]||0)); }

function textsFrom(raw, name){
  const ext=(name||"").toLowerCase().split(".").pop();
  if(ext==="html"||ext==="htm"||/^\s*<!doctype html|^\s*<html/i.test(raw)){
    const doc=new DOMParser().parseFromString(raw,"text/html");
    let els=[...doc.querySelectorAll("div.l")]; if(!els.length) els=[...doc.querySelectorAll("div")].filter(d=>!d.querySelector("div"));
    return els.map(d=>d.textContent);
  }
  const lines=raw.replace(/\r/g,"").split("\n");
  if(ext==="json"||/^\s*\{"/.test(lines[0]||"")){
    const out=[]; for(const s of lines){ try{ const o=JSON.parse(s); out.push(o.time?`[${o.time}] ${o.text}`:o.text); }catch(e){ if(s.trim()) out.push(s); } } return out;
  }
  return lines.filter(s=>!s.startsWith("```"));
}

function buildLines(raw, name){
  const texts=textsFrom(raw,name);
  let day=new Date(); day.setHours(0,0,0,0);
  const fm=/(\d{4})-(\d{2})-(\d{2})/.exec(name||""); if(fm) day=new Date(+fm[1],+fm[2]-1,+fm[3]);
  let last=-1; const lines=[];
  for(const t0 of texts){
    const t=t0.replace(/\s+$/,""); if(!t.trim()) continue;
    const L={i:lines.length,clock:null,date:null,body:t,pinned:false,mention:false};
    const m=CLOCK.exec(t);
    if(m){ L.clock=normClock(m[2]); L.date=m[1]||null; L.body=t.slice(m[0].length); }
    const hd=/^\[DATE:\s*([^|\]]+?)\s*\|/.exec(t); if(hd){ const d=parseDay(hd[1]); if(d){ day=d; last=-1; } }
    if(L.date){ const d=parseDay(L.date); if(d) day=d; }
    if(L.clock){ const s=secs(L.clock); if(!L.date&&last>=0&&s<last-3600) day=new Date(day.getTime()+86400000); last=s; L.stamp=new Date(day.getTime()+s*1000); }
    else L.stamp=new Date(day.getTime()+Math.max(0,last)*1000);
    const c=classify(L.body); L.kind=c.kind; L.speaker=c.speaker;
    lines.push(L);
  }
  return lines;
}

/* ------------------------------------------------------------ forensics (same rules as the Uglee app) */
const FX = {
  info:/^\[INFO\]\s*/i, evd:/\bEVD-\d+\b/gi,
  gh:/^\[-{2,}\s*Evidence\s+related\s+to\s*:?\s*(?<what>.+?)\s*-{2,}\]$/i, serialTitle:/^(?:serial\s*)?#\s*(?<s>[A-Za-z0-9\-]*\d[A-Za-z0-9\-]*)$/i, ge:/^\[-{5,}\]$/,
  bag:/^Bag\s*#\s*(?<n>\d+)\s*:?\s*(?<rest>.*)$/i, signed:/^Signed\s+by\s+(?<who>.+?)\s+at\s+(?<when>.+)$/i,
  field:/^-{2,}\s*(?<k>[A-Za-z][A-Za-z ]{0,24}?)\s*:\s*(?<v>.*)$/i,
  dnaStr:/\bDNA\s+String\s*:\s*(?<code>[0-9A-Fa-f]{6,})/i,
  sep:/^={5,}$/, labHead:/^Police\s+Lab(oratory)?\s+Analysis\s*:?\s*$/i, labField:/^(?<k>Drug\s+Name|Drug\s+Quality|Lab(oratory)?\s+Signature)\s*:\s*(?<v>.*)$/i,
  ph:/^(?<n>\d+)\s+fingerprint\(?s?\)?\s+found\s+on\s+item\s+(?<item>.+?)\.?$/i, pnone:/^no\s+fingerprints?\s+(were\s+)?found\s+on\s+item\s+(?<item>.+?)\.?$/i,
  pl:/^\[(?<code>AFIS-[0-9A-Fa-f]+)\]\s*-\s*(?<owner>.*?)\s*-\s*\[(?<age>[^\]]*)\]\s*$/i,
  corpse:/^_*\s*(the\s+)?(corpse|cropse)\s+of\s+(?<who>.+?)\s*_{2,}\s*$/i, dmg:/^_{2,}\s*(?<who>.*?)\s*(corpse|cropse)\s+damages?\s*(&|and)\s*injur\w*\s*:?\s*_{2,}\s*$/i,
  age:/\bAge\s+range\s*:\s*(?<from>\d+)\s*(to|[-–—])\s*(?<to>\d+)/i, noInj:/^\s*this\s+corpse\s+does\s+not\s+have\s+any\s+(other\s+)?visible\s+injur\w*\s*\.?\s*$/i,
  injHead:/^\s*injur\w*\s*:\s*$/i, stars:/^\s*\*{3,}\s*/,
  contact:/^\s*(?<who>.+?)\s*\((?<number>[\d\s\-()+]{3,})\)\s*[-–—]\s*(?<state>online|offline)\s*$/i
};
const SPEECH = new Set(["Local","Ooc","Pm","Radio","Phone","Ads","News","Hq","HqOoc","Admin","Emote","Action","Emergency"]);

function forensics(lines){
  const F={evd:[],evdIdx:{},groups:[],loose:[],dna:[],labs:[],scans:[],corpses:[],contacts:[],contactIdx:{}};
  let group=null,gMiss=0,bag=null,bMiss=0,lab=null,labSep=null,labAge=0,scan=null,sMiss=0,corpse=null,cSkip=0,cAge=0,inInj=false;
  const get=(b,k)=>{ const f=b.fields.find(x=>x[0].toLowerCase()===k.toLowerCase()); return f?f[1]:null; };
  for(const l of lines){
    if(l.kind==="Marker") continue;
    const b=l.body.replace(FX.info,"").trim();
    for(const m of b.matchAll(FX.evd)){ const c=m[0].toUpperCase(); let r=F.evdIdx[c]; if(!r){ r={code:c,lines:[]}; F.evdIdx[c]=r; F.evd.push(r); } if(r.lines[r.lines.length-1]!==l) r.lines.push(l); }
    if(SPEECH.has(l.kind)){
      if(bag&&++bMiss>4) bag=null; if(group&&++gMiss>6) group=null; if(scan&&++sMiss>4) scan=null;
      if(lab&&++labAge>12) lab=null; if(corpse&&++cSkip>6) corpse=null; continue;
    }
    let m;
    // narcotics lab
    if(FX.sep.test(b)){ if(lab&&!lab.closed&&(lab.drug||lab.quality||lab.sig)){ lab.lines.push(l); lab.closed=true; lab=null; } else labSep=l; continue; }
    if(FX.labHead.test(b)){ lab={at:l,lines:[],drug:null,quality:null,sig:null}; if(labSep&&l.i-labSep.i<=3) lab.lines.push(labSep); lab.lines.push(l); F.labs.push(lab); labSep=null; labAge=0; continue; }
    if((m=FX.labField.exec(b))){ if(!lab){ lab={at:l,lines:[]}; F.labs.push(lab); } lab.lines.push(l); labAge=0; const k=m.groups.k.toLowerCase(), v=m.groups.v.trim();
      if(k.startsWith("drug n")) lab.drug=v; else if(k.startsWith("drug q")) lab.quality=v; else lab.sig=v; continue; }
    lab=null;
    // fingerprints
    const ph=FX.ph.exec(b), pn=ph?null:FX.pnone.exec(b);
    if(ph||pn){ scan={item:(ph||pn).groups.item.trim(),count:ph?+ph.groups.n:0,at:l,prints:[],lines:[l]}; F.scans.push(scan); sMiss=0; if(!ph) scan=null; continue; }
    if((m=FX.pl.exec(b))){ if(!scan){ scan={item:"an unnamed item",count:0,at:l,prints:[],lines:[]}; F.scans.push(scan); }
      scan.prints.push({code:m.groups.code.toUpperCase(),owner:m.groups.owner.trim(),age:m.groups.age.trim()}); scan.lines.push(l); scan.count=Math.max(scan.count,scan.prints.length); sMiss=0; continue; }
    scan=null;
    // bags and groups
    if((m=FX.gh.exec(b))){ const what=m.groups.what.trim(); const st=FX.serialTitle.exec(what);
      group={title:what,serial:st?st.groups.s:null,weapon:!!st||/weapon|firearm|gun/i.test(what),at:l,bags:[],lines:[l],closed:false}; F.groups.push(group); bag=null; gMiss=0; continue; }
    if(group&&FX.ge.test(b)){ group.lines.push(l); group.closed=true; group=null; bag=null; continue; }
    if((m=FX.bag.exec(b))){ bag={n:m.groups.n,by:null,when:null,label:null,fields:[],lines:[l],group}; const s=FX.signed.exec(m.groups.rest.trim());
      if(s){ bag.by=s.groups.who.trim(); bag.when=s.groups.when.trim(); } else if(m.groups.rest.trim()) bag.fields.push(["Note",m.groups.rest.trim()]);
      if(group){ group.bags.push(bag); group.lines.push(l); gMiss=0; } else F.loose.push(bag); bMiss=0; continue; }
    if(bag&&(m=FX.field.exec(b))){ let k=m.groups.k.trim(); const v=m.groups.v.trim(); k=k[0].toUpperCase()+k.slice(1); if(/^dna$/i.test(k)) k="DNA";
      if(/^label$/i.test(k)) bag.label=v; else bag.fields.push([k,v]);
      bag.lines.push(l); if(bag.group) bag.group.lines.push(l); bMiss=0; gMiss=0;
      if(k==="DNA") F.dna.push({dna:v,owner:null,bag:bag.n,source:bag.label||("Bag #"+bag.n),at:bag.lines[0],lines:bag.lines.slice()});
      else { const r=[...F.dna].reverse().find(x=>x.bag===bag.n); if(r){ if(/^owner$/i.test(k)) r.owner=v; if(!r.lines.includes(l)) r.lines.push(l); } }
      continue; }
    bag=null; if(group&&++gMiss>3) group=null;
    // DNA strings
    if((m=FX.dnaStr.exec(b))) F.dna.push({dna:m.groups.code,owner:corpse?corpse.who:null,bag:null,source:corpse?"Corpse of "+corpse.who:"DNA string",at:l,lines:[l]});
    // corpses
    const ch=FX.corpse.exec(b), cd=ch?null:FX.dmg.exec(b);
    if(ch||cd){ let who=(ch||cd).groups.who.trim().replace(/^[_ ']+|[_ ']+$/g,""); if(who.endsWith("'s")) who=who.slice(0,-2);
      const same=corpse&&(!who||corpse.who.toLowerCase()===who.toLowerCase());
      if(!ch&&same) inInj=true; else { corpse={who:who||"Unknown",at:l,dna:null,age:null,none:false,inj:[],notes:[],lines:[]}; F.corpses.push(corpse); inInj=!ch; }
      corpse.lines.push(l); cSkip=0; cAge=0; }
    else if(corpse){
      // An examination prints all at once: a line from a later second ends it.
      if(++cAge>30||(l.clock&&corpse.at.clock&&Math.abs(secs(l.clock)-secs(corpse.at.clock))>2)) corpse=null;
      else { corpse.lines.push(l);
        let x;
        if((x=FX.dnaStr.exec(b))) corpse.dna=x.groups.code;
        else if((x=FX.age.exec(b))) corpse.age=x.groups.from+" to "+x.groups.to;
        else if(FX.noInj.test(b)) corpse.none=true;
        else if(FX.injHead.test(b)) inInj=true;
        else { const tx=b.replace(FX.stars,"").trim(); if(tx){ if(inInj||FX.stars.test(b)) corpse.inj.push(tx); else corpse.notes.push(tx); } }
      }
    }
    // contacts
    if((m=FX.contact.exec(b))){ const num=m.groups.number.replace(/[^\d+]/g,""); if(num.length>=3){ let c=F.contactIdx[num];
      if(!c){ c={number:num}; F.contactIdx[num]=c; F.contacts.push(c); } c.name=m.groups.who.trim(); c.state=m.groups.state.toLowerCase(); c.seen=l; } }
  }
  const isBal=b=>!!(get(b,"Serial")||get(b,"Type")||get(b,"Caliber")||get(b,"Calibre"));
  F.ballistics=[];
  for(const g of F.groups) if(g.weapon) F.ballistics.push({title:"Evidence related to "+g.title,serials:[g.serial,...g.bags.map(x=>get(x,"Serial"))].filter((v,i,a)=>v&&a.indexOf(v)===i),at:g.at,bags:g.bags,lines:g.lines});
  for(const x of F.loose) if(isBal(x)) F.ballistics.push({title:"Bag #"+x.n,serials:[get(x,"Serial")].filter(Boolean),at:x.lines[0],bags:[x],lines:x.lines});
  F.ballistics.sort((a,b)=>a.at.i-b.at.i);
  F.cases=F.groups.filter(g=>!g.weapon);
  return F;
}

/* ------------------------------------------------------------ state */
const $=s=>R.querySelector(s);
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=n=>n.toLocaleString("en-US");
const S={ lines:[], name:"", sample:false, counts:{}, words:0, chars:0, speakers:new Map(), F:null,
  view:[], hidden:new Set(), sift:[], find:"", sel:new Set(), anchor:-1, findAt:-1, tab:"log", fx:"",
  opt:{clocks:true,dates:false,tags:false,wrap:true,colour:true}, mentions:[], seenMentions:0 };
function store(k,v){ try{ localStorage.setItem("lssd-chatlog."+k,JSON.stringify(v)); }catch(e){} }
function recall(k,d){ try{ const v=localStorage.getItem("lssd-chatlog."+k); return v==null?d:JSON.parse(v); }catch(e){ return d; } }

function load(raw,name,sample){
  S.lines=buildLines(raw,name); S.name=name; S.sample=!!sample;
  S.counts={}; S.words=0; S.chars=0; S.speakers=new Map();
  for(const l of S.lines){ S.counts[l.kind]=(S.counts[l.kind]||0)+1;
    if(l.kind!=="Marker"){ S.words+=(l.body.match(/\S+/g)||[]).length; S.chars+=l.body.length; }
    if(l.speaker) S.speakers.set(l.speaker,(S.speakers.get(l.speaker)||0)+1); }
  S.F=forensics(S.lines); S.sel.clear(); S.findAt=-1; S.seenMentions=0;
  $("#cl-banner").hidden=!sample;
  $("#cl-bannerText").textContent="This is a sample log with made-up characters, so you can see what the Chatlog Parser does.";
  computeMentions(); refreshAll(true);
  note(sample?"Sample log loaded.":"Read "+fmt(S.lines.length)+" lines from "+name+".");
}

/* ------------------------------------------------------------ filtering */
function contains(body,term,whole){
  const b=body.toLowerCase(), t=term.toLowerCase(); let at=0;
  while((at=b.indexOf(t,at))>=0){ if(!whole) return true;
    const a=at===0||!/[\p{L}\d]/u.test(b[at-1]), e=at+t.length>=b.length||!/[\p{L}\d]/u.test(b[at+t.length]); if(a&&e) return true; at+=t.length; }
  return false;
}
function parseHM(s){ s=(s||"").trim(); const m=/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s); return m?(+m[1])*3600+(+m[2])*60+(+(m[3]||0)):null; }
function passes(l){
  if(l.kind!=="Marker"&&S.hidden.has(l.kind)) return false;
  if($("#cl-pinnedOnly").checked&&!l.pinned) return false;
  if(S.sift.length){ if(l.kind==="Marker") return false; const w=$("#cl-whole").checked; if(!S.sift.some(t=>contains(l.body,t,w))) return false; }
  const f=parseHM($("#cl-from").value), t=parseHM($("#cl-to").value);
  if((f!=null||t!=null)&&l.clock){ const a=secs(l.clock);
    if(f!=null&&t!=null&&f>t){ if(a<f&&a>t) return false; }
    else { if(f!=null&&a<f) return false; if(t!=null&&a>t) return false; } }
  return true;
}

/* ------------------------------------------------------------ rendering lines */
const CODES=/\bEVD-\d+\b|\bAFIS-[0-9A-Fa-f]+\b|(?<=\bDNA(?:\s+String)?\s*:\s*)[0-9A-Fa-f]{6,}|(?<=\bSerial\s*:\s*)\S+|(?<=\bLaboratory\s+Signature\s*:\s*)\S.*$|(?<=\bOwner\s*:\s*)\S.*$|(?<=^(?:\[INFO\]\s*)?\[AFIS-[0-9A-Fa-f]+\]\s*-\s*)[^\[]+?(?=\s*-\s*\[)/gi;
function bodyHtml(body){
  const n=body.length, hl=new Uint8Array(n), code=new Uint8Array(n);
  const terms=S.sift.concat(S.find?[S.find]:[]);
  const low=body.toLowerCase();
  for(const t0 of terms){ const t=t0.toLowerCase(); if(!t) continue; let at=0; while((at=low.indexOf(t,at))>=0){ hl.fill(1,at,at+t.length); at+=t.length; } }
  for(const m of body.matchAll(CODES)){ let s=m.index, e=s+m[0].length; while(s<e&&body[s]===" ") s++; code.fill(1,s,e); }
  let out="", start=0;
  for(let i=1;i<=n;i++){ if(i===n||hl[i]!==hl[start]||code[i]!==code[start]){ let seg=esc(body.slice(start,i));
      if(code[start]) seg='<span class="code">'+seg+"</span>"; if(hl[start]) seg="<mark>"+seg+"</mark>"; out+=seg; start=i; } }
  return out;
}
function stampText(l){
  if(!l.clock) return "";
  let s=l.clock;
  if(S.opt.dates){ const d=l.stamp; s=String(d.getDate()).padStart(2,"0")+"/"+["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][d.getMonth()]+"/"+d.getFullYear()+"|"+s; }
  return "["+s+"] ";
}
function lineHtml(l){
  const k=KINDS[KIDX[l.kind]];
  if(l.kind==="Marker") return `<div class="ln k-Marker" data-i="${l.i}">${esc(l.body)}</div>`;
  const col=S.opt.colour?` style="color:var(--k-${l.kind})"`:"";
  let h=`<div class="ln${l.pinned?" pinned":""}${l.mention?" mention":""}${S.sel.has(l.i)?" sel":""}" data-i="${l.i}"${col}>`;
  if(l.pinned) h+='<span class="pin">&#x25C6; </span>';
  if(S.opt.tags) h+=`<span class="bd">${esc(k.badge.padEnd(4," "))}</span>`;
  if(S.opt.clocks&&l.clock) h+=`<span class="t">${esc(stampText(l))}</span>`;
  return h+bodyHtml(l.body)+"</div>";
}
function renderLog(keepScroll){
  const pane=$("#cl-paneLog"), atBottom=pane.scrollTop+pane.clientHeight>=pane.scrollHeight-4, top=pane.scrollTop;
  S.view=S.lines.filter(passes);
  const log=$("#cl-log");
  log.classList.toggle("nowrap",!S.opt.wrap);
  log.innerHTML=S.view.map(lineHtml).join("");
  $("#cl-empty").hidden=S.view.length>0;
  $("#cl-emptyText").innerHTML=S.lines.length?"Nothing matches the current filters.":"<b style='font-size:15px;color:var(--cl-ink2)'>Drop a chatlog here</b><br><br>Or use <b>Open log</b> or <b>Paste log</b>. Your GTA:World chatlog (the .txt from the parser, or an Uglee archive) is read right here in your browser.";
  if(keepScroll) pane.scrollTop=top; else if(!atBottom) pane.scrollTop=0;
  updateFind(); footer();
}

/* ------------------------------------------------------------ sidebar */
function renderChips(){
  $("#cl-chips").innerHTML=KINDS.filter(k=>k.key!=="Marker").map(k=>{ const n=S.counts[k.key]||0;
    return `<button class="chip${n?"":" empty"}" data-k="${k.key}" aria-pressed="${!S.hidden.has(k.key)}" title="${esc(k.hint)} - ${fmt(n)} ${n===1?"line":"lines"}"><i style="background:var(--k-${k.key})"></i>${esc(k.name)}</button>`; }).join("");
}
function renderStats(){
  const real=S.lines.filter(l=>l.kind!=="Marker");
  $("#cl-sLines").textContent=fmt(real.length); $("#cl-sWords").textContent=fmt(S.words);
  const timed=real.filter(l=>l.clock);
  const sp=$("#cl-spark");
  if(timed.length<2){ $("#cl-sDur").textContent="-"; $("#cl-sRange").textContent=real.length?"No timestamps in this log":"Nothing loaded yet"; sp.innerHTML=""; return; }
  const a=timed[0].stamp, b=timed[timed.length-1].stamp, span=Math.max(1,(b-a)/1000);
  const h=Math.floor(span/3600), m=Math.floor(span%3600/60), s=Math.floor(span%60);
  $("#cl-sDur").textContent=h?`${h}h ${String(m).padStart(2,"0")}m`:`${m}m ${String(s).padStart(2,"0")}s`;
  const f=d=>d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]+" "+d.toTimeString().slice(0,8);
  $("#cl-sRange").textContent=f(a)+"  to  "+f(b);
  const N=48, c=new Array(N).fill(0); for(const l of timed){ c[Math.min(N-1,Math.floor((l.stamp-a)/1000/span*(N-1)))]++; }
  const max=Math.max(...c), w=240/N;
  sp.innerHTML=c.map((v,i)=>v?`<rect x="${(i*w+.5).toFixed(2)}" y="${(38-Math.max(2,38*v/max)).toFixed(2)}" width="${(w-1.4).toFixed(2)}" height="${Math.max(2,38*v/max).toFixed(2)}" rx="1"/>`:"").join("");
}
function renderPeople(){
  const list=[...S.speakers.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,200);
  $("#cl-peopleHead").textContent=list.length?`People  (${S.speakers.size})`:"People";
  const on=new Set(S.sift.map(s=>s.toLowerCase()));
  $("#cl-people").innerHTML=list.length?list.map(([n,c])=>`<button class="person${on.has(n.toLowerCase())?" on":""}" data-p="${esc(n)}" title="Click to add to Names and words"><span>${esc(n)}</span><em>${fmt(c)}</em></button>`).join(""):'<p class="note">Nobody spotted yet.</p>';
}

/* ------------------------------------------------------------ forensics view */
let copyBag=[];
const cc=(text,label)=>{ copyBag.push(text); return `<button class="cc" data-c="${copyBag.length-1}" title="Click to copy">${esc(label||text)}</button>`; };
const cbtn=(text,label,primary)=>{ copyBag.push(text); return `<button class="btn small${primary?" primary":""}" data-c="${copyBag.length-1}">${esc(label)}</button>`; };
const raw=ls=>ls.map(l=>l.body).join("\n");
const rawT=ls=>ls.map(l=>(l.clock?"["+l.clock+"] ":"")+l.body).join("\n");
const when=l=>l&&l.clock?`<span class="when">${l.clock}</span>`:"";
const row=(k,v)=>`<div class="row"><span>${esc(k)}</span><span>${v}</span></div>`;
const owner=o=>{ const none=!o||/^(not found|unknown)$/i.test(o); return `<span class="owner${none?" none":""}">${esc(o||"owner not given")}</span>`; };
const ctx=l=>`<div class="ctx" data-jump="${l.i}" title="Double click to find this line">${esc((l.clock?"["+l.clock+"] ":"")+l.body)}</div>`;
const FXT=[["","Everything"],["evd","Evidence bags"],["bal","Ballistic analysis"],["dna","DNA"],["lab","Laboratory signature"],["pr","Fingerprints"],["co","Corpses"],["ct","Contacts"]];
function fxCount(k){ const F=S.F; if(!F) return 0;
  const m={evd:F.evd.length,bal:F.ballistics.length,dna:F.dna.length,lab:F.labs.length,pr:F.scans.length,co:F.corpses.length,ct:F.contacts.length};
  return k?m[k]:Object.values(m).reduce((a,b)=>a+b,0); }
function renderFx(){
  $("#cl-fxCount").textContent=fxCount("")||"";
  if(S.tab!=="fx") return;
  copyBag=[]; const F=S.F, all=S.fx===""; let h="";
  $("#cl-fpills").innerHTML=FXT.map(([k,n])=>`<button class="fp" data-fx="${k}" aria-pressed="${S.fx===k}">${n}<b>${fxCount(k)}</b></button>`).join("")
    +`<span style="flex:1"></span>${cbtn(sectionCopy(),"Copy all")}`;
  const sect=(t,n)=>all?`<div class="sect">${t} &nbsp;${n}</div>`:"";
  const more=(n,k)=>all&&n>5?`<button class="btn ghost small" data-fx="${k}" style="justify-self:start">Show all ${n} &#x203A;</button>`:"";
  const lim=a=>all?a.slice(0,5):a;
  if((all||S.fx==="evd")&&F.evd.length){
    const r=[...F.evd].reverse();
    h+=sect("Evidence bags",r.length)+`<div class="fc"><div class="fh"><span class="badge b-ev">EVD</span><span class="ttl">${r.length} evidence bag ${r.length===1?"number":"numbers"}</span>${cbtn(r.map(x=>x.code).join("\n"),"Copy all")}</div><div>${r.map(x=>cc(x.code)).join("")}</div></div>`;
    if(!all) for(const x of r) h+=`<div class="fc"><div class="fh">${cc(x.code)}<span style="flex:1"></span>${when(x.lines[0])}</div>${x.lines.slice(0,4).map(ctx).join("")}</div>`;
    if(!all) for(const g of [...F.cases].reverse()) h+=`<div class="fc"><div class="fh"><span class="ttl">Evidence related to ${esc(g.title)}</span>${when(g.at)}${cbtn(rawT(g.lines),"Copy with timestamps",true)}</div>${g.bags.map(bagHtml).join("")}</div>`;
  }
  if((all||S.fx==="bal")&&F.ballistics.length){
    const r=[...F.ballistics].reverse(); h+=sect("Ballistic analysis",r.length);
    for(const x of lim(r)){
      h+=`<div class="fc"><div class="fh"><span class="badge b-ba">BALLISTICS</span><span class="ttl">${esc(x.title)} &nbsp;<span style="color:var(--cl-faint);font-weight:400">${x.bags.length} ${x.bags.length===1?"bag":"bags"}</span></span>${when(x.at)}${cbtn(raw(x.lines),"Copy")}${cbtn(rawT(x.lines),"Copy with timestamps",true)}</div>`;
      if(x.serials.length) h+=row(x.serials.length===1?"Serial number":"Serial numbers",x.serials.map(s=>cc(s)).join(""));
      const groups=new Map(); for(const b of x.bags){ const key=(b.label||"")+"\u0001"+(b.by||"")+"\u0001"+(b.when||""); if(!groups.has(key)) groups.set(key,[]); groups.get(key).push(b); }
      for(const bs of groups.values()){ const f=bs[0];
        h+=`<div class="group"><div class="lbl">${esc(f.label||"(no label)")}</div>${f.by?`<div class="sub">Signed by ${esc(f.by)}${f.when?" at "+esc(f.when):""} &nbsp;-&nbsp; ${bs.length} ${bs.length===1?"bag":"bags"}</div>`:""}<div style="margin-top:4px">${bs.map(b=>cc(b.n,"Bag #"+b.n)).join("")}</div>`;
        for(const b of bs) for(const [k,v] of b.fields) if(k!=="Note") h+=row("Bag #"+b.n+" "+k.toLowerCase(),k==="Serial"?cc(v):esc(v));
        h+="</div>"; }
      h+="</div>";
    }
    h+=more(r.length,"bal");
  }
  if((all||S.fx==="dna")&&F.dna.length){
    const r=[...F.dna].reverse(); h+=sect("DNA",r.length);
    for(const x of lim(r)) h+=`<div class="fc"><div class="fh"><span class="badge b-dna">DNA</span>${cc(x.dna)}${owner(x.owner)}<span style="flex:1"></span>${when(x.at)}${cbtn(rawT(x.lines),"Copy")}</div>${x.bag?row("Bag","#"+esc(x.bag)):""}${row(x.bag?"Label":"Source",esc(x.source||"-"))}</div>`;
    h+=more(r.length,"dna");
  }
  if((all||S.fx==="lab")&&F.labs.length){
    const r=[...F.labs].reverse(); h+=sect("Laboratory signature",r.length);
    for(const x of lim(r)){ const real=x.sig&&!/not be determined/i.test(x.sig);
      h+=`<div class="fc"><div class="fh"><span class="badge b-lab">NARCOTICS</span><span class="ttl">Police Lab Analysis${x.drug?" &nbsp;-&nbsp; "+esc(x.drug):""}</span>${when(x.at)}${cbtn(raw(x.lines),"Copy for report",true)}</div>${row("Drug Name",esc(x.drug||"-"))}${row("Drug Quality",esc(x.quality||"-"))}${row("Laboratory Signature",real?cc(x.sig):esc(x.sig||"-"))}</div>`; }
    h+=more(r.length,"lab");
  }
  if((all||S.fx==="pr")&&F.scans.length){
    const r=[...F.scans].reverse(); h+=sect("Fingerprints",r.length);
    for(const x of lim(r)){
      h+=`<div class="fc"><div class="fh"><span class="badge b-pr">PRINTS</span><span class="ttl">${x.count} ${x.count===1?"fingerprint":"fingerprints"} on ${esc(x.item)}</span>${when(x.at)}${cbtn(rawT(x.lines),"Copy")}</div>`;
      const g=new Map(); for(const p of x.prints){ if(!g.has(p.code)) g.set(p.code,[]); g.get(p.code).push(p); }
      for(const [code,ps] of g) h+=`<div class="fh" style="margin:2px 0">${cc(code)}${owner(ps[0].owner)}${ps.length>1?`<span class="when">x${ps.length}</span>`:""}<span style="flex:1"></span><span class="when">${esc([...new Set(ps.map(p=>p.age))].join(", "))}</span></div>`;
      if(!x.prints.length) h+='<div class="note">No fingerprints found.</div>';
      h+="</div>"; }
    h+=more(r.length,"pr");
  }
  if((all||S.fx==="co")&&F.corpses.length){
    const r=[...F.corpses].reverse(); h+=sect("Corpses",r.length);
    for(const c of lim(r)){ const rep=["The corpse of "+c.who+(c.at.clock?"  ("+c.at.clock+")":""),c.dna?"DNA string: "+c.dna:null,c.age?"Age range: "+c.age:null,"Injuries:",...(c.inj.length?c.inj.map(i=>"- "+i):[c.none?"- No visible injuries":"- None recorded"]),...c.notes].filter(Boolean).join("\n");
      h+=`<div class="fc"><div class="fh"><span class="badge b-co">CORPSE</span><span class="ttl">The corpse of ${esc(c.who)}</span>${when(c.at)}${cbtn(rep,"Copy report")}</div>${row("DNA string",c.dna?cc(c.dna):"-")}${row("Age range",esc(c.age||"-"))}${row("Injuries",c.inj.length?c.inj.map(esc).join("<br>"):(c.none?"No visible injuries":"None recorded"))}${c.notes.length?row("Notes",c.notes.map(esc).join("<br>")):""}</div>`; }
    h+=more(r.length,"co");
  }
  if((all||S.fx==="ct")&&F.contacts.length){
    const r=[...F.contacts].sort((a,b)=>a.name.localeCompare(b.name)); h+=sect("Contacts",r.length);
    h+=`<div class="fc"><div class="fh"><span class="ttl">${r.length} ${r.length===1?"contact":"contacts"} &nbsp;<span style="color:var(--cl-faint);font-weight:400">${r.filter(c=>c.state==="online").length} online</span></span>${cbtn(r.map(c=>`${c.name} (${c.number}) - ${c.state}`).join("\n"),"Copy all")}</div>`
      +r.map(c=>`<div class="fh" style="margin:2px 0"><span class="dot${c.state==="online"?" on":""}"></span><span style="min-width:180px">${esc(c.name)}</span>${cc(c.number)}<span style="flex:1"></span><span class="when">${c.seen&&c.seen.clock?"last seen "+c.seen.clock:""}</span></div>`).join("")+"</div>";
  }
  if(!h) h=`<div class="blank"><b>No ${all?"forensic traffic":FXT.find(x=>x[0]===S.fx)[1].toLowerCase()} in this log.</b>Evidence bags (EVD numbers), ballistic analysis results, DNA results, police lab analysis, fingerprint scans and corpse examinations are gathered here. Click any code to copy it.</div>`;
  $("#cl-flist").innerHTML=h;
}
function bagHtml(b){
  let h=`<div class="group"><div>${cc(b.n,"Bag #"+b.n)}${b.by?`<span class="sub">signed by ${esc(b.by)}${b.when?" - "+esc(b.when):""}</span>`:""}</div>`;
  if(b.label) h+=row("Label",esc(b.label));
  for(const [k,v] of b.fields) h+=row(k,k==="Serial"||k==="DNA"?cc(v):esc(v));
  return h+"</div>";
}
function sectionCopy(){
  const F=S.F; if(!F) return "";
  switch(S.fx){
    case "evd": return F.evd.map(x=>x.code).join("\n");
    case "bal": return F.ballistics.map(x=>rawT(x.lines)).join("\n\n");
    case "dna": return F.dna.map(x=>x.dna+(x.owner?" - "+x.owner:"")).join("\n");
    case "lab": return F.labs.map(x=>raw(x.lines)).join("\n\n");
    case "pr": return [...new Map(F.scans.flatMap(s=>s.prints).map(p=>[p.code,p])).values()].map(p=>p.code+" - "+p.owner).join("\n");
    case "co": return F.corpses.map(c=>"The corpse of "+c.who+(c.dna?"\nDNA string: "+c.dna:"")).join("\n\n");
    case "ct": return F.contacts.map(c=>`${c.name} (${c.number}) - ${c.state}`).join("\n");
    default: return [...F.evd.map(x=>x.code),...F.ballistics.flatMap(b=>b.serials).map(s=>"Serial "+s),...F.dna.map(d=>"DNA "+d.dna+(d.owner?" - "+d.owner:"")),
      ...[...new Map(F.scans.flatMap(s=>s.prints).map(p=>[p.code,p])).values()].map(p=>p.code+" - "+p.owner)].join("\n");
  }
}

/* ------------------------------------------------------------ mentions */
function computeMentions(){
  const words=$("#cl-me").value.split(",").map(s=>s.trim()).filter(Boolean);
  S.mentions=[];
  for(const l of S.lines){ l.mention=false; if(l.kind==="Marker") continue;
    const w=words.find(t=>contains(l.body,t,false));
    if(w){ l.mention=true; S.mentions.push({l,term:w}); continue; }
    if(l.kind==="Pm"&&/^\(\(\s*PM\s+from\b/i.test(l.body)){ l.mention=true; S.mentions.push({l,term:"PM"}); } }
}
function renderMentions(){
  const n=S.mentions.length; if(S.tab==="men") S.seenMentions=n;
  $("#cl-menCount").textContent=n?n:"";
  if(S.tab!=="men") return;
  copyBag=[];
  if(!n){ $("#cl-mlist").innerHTML=`<div class="blank"><b>No mentions.</b>${$("#cl-me").value.trim()?"Nobody said "+esc($("#cl-me").value.trim())+" and no PMs came in.":"Put your character name under Mentions on the left. Every line that says it, and every PM sent to you, shows up here."}</div>`; return; }
  $("#cl-mlist").innerHTML=[...S.mentions].reverse().slice(0,500).map(m=>{ const t=m.term==="PM"?(m.l.speaker?"Private message from "+m.l.speaker:"Private message"):`Somebody said "${m.term}"`;
    return `<div class="fc mcard" data-copyline="${m.l.i}" data-jump="${m.l.i}" title="Click to copy the line. Double click to find it in the transcript."><div class="fh"><span class="ttl">${esc(t)}</span>${when(m.l)}</div><div class="ln" style="padding:0;color:var(--k-${m.l.kind})">${esc(stampText(m.l))}${bodyHtml(m.l.body)}</div></div>`; }).join("")
    +'<p class="note" style="margin-top:6px">Click a mention to copy the line it was said in. Double click to find it in the transcript.</p>';
}

/* ------------------------------------------------------------ footer, find, notices */
let noteTimer=0;
function note(t){ $("#cl-footC").textContent=t; clearTimeout(noteTimer); noteTimer=setTimeout(()=>footer(true),6000); }
function footer(reset){
  const real=S.lines.length-(S.counts.Marker||0), pins=S.lines.filter(l=>l.pinned).length;
  let t=fmt(real)+" lines - "+fmt(S.chars)+" characters"; if(S.view.length!==S.lines.length) t+=` (${fmt(S.view.length)} shown)`;
  t+="   |   "+(pins===1?"1 pinned":pins+" pinned"); if(S.sel.size) t+="   |   "+S.sel.size+" picked";
  $("#cl-footL").textContent=t;
  if(reset) $("#cl-footC").textContent=S.lines.length?(S.sample?"Sample log":S.name):"No log loaded";
}
function hits(){ if(!S.find) return []; const f=S.find.toLowerCase(); const r=[]; S.view.forEach((l,i)=>{ if(l.body.toLowerCase().includes(f)) r.push(i); }); return r; }
function updateFind(){ const h=hits(); $("#cl-findInfo").textContent=!S.find?"":!h.length?"no match":S.findAt>=0&&h.includes(S.findAt)?`${h.indexOf(S.findAt)+1} of ${fmt(h.length)}`:`${fmt(h.length)} ${h.length===1?"match":"matches"}`; }
function findStep(d){
  const h=hits(); if(!h.length){ updateFind(); return; }
  let t; if(d>0){ t=h.find(i=>i>S.findAt); if(t==null) t=h[0]; } else { const b=h.filter(i=>i<S.findAt); t=b.length?b[b.length-1]:h[h.length-1]; }
  S.findAt=t; showTab("log"); const l=S.view[t]; S.sel=new Set([l.i]); S.anchor=l.i;
  R.querySelectorAll("#cl-log .ln.sel").forEach(e=>e.classList.remove("sel"));
  const el=R.querySelector(`#cl-log .ln[data-i="${l.i}"]`); if(el){ el.classList.add("sel"); el.scrollIntoView({block:"center"}); }
  updateFind(); footer();
}

/* ------------------------------------------------------------ copy + export */
async function copy(text,done){
  try{ await navigator.clipboard.writeText(text); note(done||"Copied."); return true; }
  catch(e){ const ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select();
    let ok=false; try{ ok=document.execCommand("copy"); }catch(_){}
    ta.remove(); note(ok?(done||"Copied."):"Your browser blocked copying. Select the text and press Ctrl+C."); return ok; }
}
function picked(){ return S.lines.filter(l=>S.sel.has(l.i)); }
function copyLines(){ const ls=S.sel.size?picked():S.view; if(!ls.length){ note("There is nothing to copy yet."); return; }
  copy(rawT(ls),ls.length===1?"Line copied.":"Copied "+fmt(ls.length)+" lines."); }

const EX={scope:"shown",fmt:0,redact:0,money:false,nums:false,clocks:true};
const FORMATS=[["Plain text","The classic parser output."],["Styled web page","A self contained, colour coded transcript (HTML)."],["Markdown","For Discord, GitHub and wikis."],["Forum BBCode","Drop straight into a GTA:World forum post."],["JSON","One object per line, for tooling."],["CSV","Paste into a spreadsheet."]];
const LIGHT={Local:"#1F2933",Emote:"#6B46C1",Action:"#2F7A4D",Ooc:"#5F6B7A",Pm:"#A86B00",Radio:"#1F6FB5",Phone:"#B83280",Emergency:"#C53030",Hq:"#13877A",HqOoc:"#0F6E63",Ads:"#2F855A",News:"#C05621",Money:"#4D7C0F",Admin:"#C53030",Server:"#4A5568",Error:"#9B2C2C",Other:"#2D3748",Marker:"#718096"};
const DARK={Local:"#E8EEF4",Emote:"#C9A0FF",Action:"#9AD0A8",Ooc:"#8A97A6",Pm:"#F2C14E",Radio:"#6FB7FF",Phone:"#F5A3C7",Emergency:"#FF6B6B",Hq:"#5ED3C3",HqOoc:"#4FB0A4",Ads:"#7BD389",News:"#FFB86B",Money:"#A3E635",Admin:"#FF8A8A",Server:"#B0B8C4",Error:"#E57373",Other:"#CBD5E1",Marker:"#5B6B7C"};
function initials(n){ if(/^Mask_/i.test(n)) return "Mask_***"; return n.replace(/_/g," ").split(/\s+/).filter(Boolean).map(p=>p[0].toUpperCase()+".").join(""); }
function exportLines(){ return EX.scope==="all"?S.lines:EX.scope==="picked"?picked():EX.scope==="pinned"?S.lines.filter(l=>l.pinned):S.view; }
function redactor(){
  const rules=[];
  if(EX.redact){ const names=[...S.speakers.keys()].sort((a,b)=>b.length-a.length), seen=new Set();
    for(const n of names) for(const v of [n,n.replace(/ /g,"_"),n.replace(/_/g," ")]){ if(v.length<3||seen.has(v.toLowerCase())) continue; seen.add(v.toLowerCase());
      rules.push([new RegExp("(?<![\\p{L}\\d_])"+v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?![\\p{L}\\d_])","giu"),EX.redact===1?initials(n):"[redacted]"]); } }
  return s=>{ for(const [r,w] of rules) s=s.replace(r,w); if(EX.money) s=s.replace(/\$\s?\d[\d,]*(?:\.\d+)?/g,"$***"); if(EX.nums) s=s.replace(/\b\d{6,10}\b/g,"######"); return s; };
}
function renderExport(){
  const ls=exportLines(), red=redactor(), ck=l=>EX.clocks&&l.clock?"["+l.clock+"] ":"";
  let out="";
  switch(EX.fmt){
    case 1: out='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(S.name||"Transcript")+'</title><style>body{background:#0F1720;color:#E6EDF3;font:14px/1.55 Consolas,Menlo,monospace;margin:0;padding:28px}div{white-space:pre-wrap;padding:1px 6px}span.t{color:#5B6B7C}</style></head><body>\n'
      +ls.map(l=>`<div style="color:${DARK[l.kind]}">${EX.clocks&&l.clock?`<span class="t">[${l.clock}]</span> `:""}${esc(red(l.body))}</div>`).join("\n")+"\n</body></html>"; break;
    case 2: out="```\n"+ls.map(l=>(ck(l)+red(l.body)).replace(/```/g,"'''")).join("\n")+"\n```"; break;
    case 3: out=ls.filter(l=>l.kind!=="Marker").map(l=>`[color=${LIGHT[l.kind]}]${ck(l)}${red(l.body)}[/color]`).join("\n"); break;
    case 4: out=ls.map(l=>JSON.stringify({time:EX.clocks?l.clock:null,kind:KINDS[KIDX[l.kind]].name,speaker:l.speaker?red(l.speaker):null,text:red(l.body)})).join("\n"); break;
    case 5: { const q=s=>/[",\n]/.test(s||"")?'"'+String(s).replace(/"/g,'""')+'"':(s||""); out="Time,Kind,Speaker,Text\n"+ls.map(l=>[EX.clocks?l.clock:"",KINDS[KIDX[l.kind]].name,l.speaker?red(l.speaker):"",red(l.body)].map(q).join(",")).join("\n"); break; }
    default: out=ls.map(l=>ck(l)+red(l.body)).join("\n");
  }
  $("#cl-exText").value=out;
  $("#cl-exSum").textContent=ls.length?`${fmt(ls.length)} ${ls.length===1?"line":"lines"} as ${FORMATS[EX.fmt][0]}. Copy it, then paste it wherever you need it.`:"There is nothing to export with these settings.";
}
function openExport(){
  if(S.sel.size>1) EX.scope="picked"; else if(EX.scope==="picked") EX.scope="shown";
  const r=(name,val,cur,label,small)=>`<label class="r"><input type="radio" name="${name}" value="${val}"${cur?" checked":""}><span>${label}${small?`<small>${small}</small>`:""}</span></label>`;
  $("#cl-exOpts").innerHTML="<h4>What to export</h4>"
    +r("scope","all",EX.scope==="all",`The whole log (${fmt(S.lines.length)})`)
    +r("scope","shown",EX.scope==="shown",`What is shown with the filters (${fmt(S.view.length)})`)
    +r("scope","picked",EX.scope==="picked",`The picked lines (${fmt(S.sel.size)})`)
    +r("scope","pinned",EX.scope==="pinned",`Pinned lines (${fmt(S.lines.filter(l=>l.pinned).length)})`)
    +"<h4>Shape</h4>"+FORMATS.map((f,i)=>r("fmt",i,EX.fmt===i,f[0],f[1])).join("")
    +"<h4>Names</h4>"+r("redact",0,EX.redact===0,"Leave names as they are")+r("redact",1,EX.redact===1,"Shorten to initials - J.D.")+r("redact",2,EX.redact===2,"Replace with [redacted]")
    +"<h4>Also</h4>"
    +`<label class="r"><input type="checkbox" id="exMoney"${EX.money?" checked":""}><span>Hide money amounts ($***)</span></label>`
    +`<label class="r"><input type="checkbox" id="exNums"${EX.nums?" checked":""}><span>Hide phone and account numbers (######)</span></label>`
    +`<label class="r"><input type="checkbox" id="exClocks"${EX.clocks?" checked":""}><span>Keep timestamps</span></label>`;
  renderExport(); $("#cl-exportModal").hidden=false;
}

/* ------------------------------------------------------------ wiring */
function refreshAll(fresh){ renderChips(); renderStats(); renderPeople(); renderLog(!fresh); renderFx(); renderMentions(); footer(true); }
function showTab(t){ S.tab=t; R.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===t));
  $("#cl-paneLog").hidden=t!=="log"; $("#cl-paneFx").hidden=t!=="fx"; $("#cl-paneMen").hidden=t!=="men"; renderFx(); renderMentions(); }
function jump(i){
  const l=S.lines[i]; if(!l) return;
  if(!passes(l)){ $("#cl-names").value=""; S.sift=[]; $("#cl-pinnedOnly").checked=false; $("#cl-from").value=$("#cl-to").value=""; S.hidden.clear(); renderChips(); renderPeople(); renderLog(true); }
  showTab("log"); S.sel=new Set([i]); S.anchor=i;
  R.querySelectorAll("#cl-log .ln.sel").forEach(e=>e.classList.remove("sel"));
  const el=R.querySelector(`#cl-log .ln[data-i="${i}"]`); if(el){ el.classList.add("sel"); el.scrollIntoView({block:"center"}); }
  footer();
}
function readFiles(files){
  const list=[...files]; if(!list.length) return;
  list.sort((a,b)=>a.name.localeCompare(b.name));
  Promise.all(list.map(f=>f.text())).then(texts=>{
    const raw=texts.map((t,i)=>list.length>1?`[--- ${list[i].name} ---]\n`+t:t).join("\n");
    load(raw,list.length===1?list[0].name:list.length+" files",false);
  }).catch(()=>note("That file could not be read."));
}

R.addEventListener("click",e=>{
  const t=e.target.closest("button,[data-copyline],.ln,[data-close]"); if(!t) return;
  if(t.matches("[data-close]")){ t.closest(".modal").hidden=true; return; }
  if(t.dataset.c!=null){ const v=copyBag[+t.dataset.c]; copy(v,"Copied "+(v.length>60?"to the clipboard.":v)); t.classList.add("done"); setTimeout(()=>t.classList.remove("done"),900); return; }
  if(t.dataset.fx!=null){ S.fx=t.dataset.fx; renderFx(); $("#cl-paneFx").scrollTop=0; return; }
  if(t.dataset.k){ const k=t.dataset.k; S.hidden.has(k)?S.hidden.delete(k):S.hidden.add(k); store("hidden",[...S.hidden]); renderChips(); renderLog(true); return; }
  if(t.dataset.p){ const n=t.dataset.p, cur=$("#cl-names").value.split("\n").map(s=>s.trim()).filter(Boolean), at=cur.findIndex(s=>s.toLowerCase()===n.toLowerCase());
    if(at>=0) cur.splice(at,1); else cur.push(n); $("#cl-names").value=cur.join("\n"); onSift(); return; }
  if(t.dataset.tab){ showTab(t.dataset.tab); return; }
  if(t.dataset.copyline!=null){ if(e.detail>1) return; const l=S.lines[+t.dataset.copyline]; copy((l.clock?"["+l.clock+"] ":"")+l.body,"Line copied."); return; }
  if(t.classList.contains("ln")&&t.closest("#cl-log")){
    const i=+t.dataset.i;
    if(e.shiftKey&&S.anchor>=0){ const a=S.view.findIndex(l=>l.i===S.anchor), b=S.view.findIndex(l=>l.i===i); if(a>=0&&b>=0){ const [x,y]=a<b?[a,b]:[b,a]; S.sel=new Set(S.view.slice(x,y+1).map(l=>l.i)); } }
    else if(e.ctrlKey||e.metaKey){ S.sel.has(i)?S.sel.delete(i):S.sel.add(i); S.anchor=i; }
    else { S.sel=S.sel.size===1&&S.sel.has(i)?new Set():new Set([i]); S.anchor=i; }
    R.querySelectorAll("#cl-log .ln").forEach(el=>el.classList.toggle("sel",S.sel.has(+el.dataset.i)));
    footer();
  }
});
R.addEventListener("dblclick",e=>{
  const j=e.target.closest("[data-jump]"); if(j){ jump(+j.dataset.jump); return; }
  const ln=e.target.closest("#cl-log .ln"); if(ln&&!ln.classList.contains("k-Marker")){ const l=S.lines[+ln.dataset.i]; l.pinned=!l.pinned; ln.outerHTML=lineHtml(l); footer(); note(l.pinned?"Pinned.":"Unpinned."); }
});
function onSift(){ S.sift=$("#cl-names").value.split(/[\n,]/).map(s=>s.trim()).filter(Boolean); renderPeople(); renderLog(true); }
$("#cl-names").addEventListener("input",onSift);
$("#cl-whole").addEventListener("change",()=>renderLog(true));
$("#cl-pinnedOnly").addEventListener("change",()=>renderLog(true));
$("#cl-from").addEventListener("input",()=>renderLog(true)); $("#cl-to").addEventListener("input",()=>renderLog(true));
$("#cl-sliceClear").addEventListener("click",()=>{ $("#cl-from").value=$("#cl-to").value=""; renderLog(true); });
$("#cl-me").addEventListener("input",()=>{ store("me",$("#cl-me").value); computeMentions(); renderLog(true); renderMentions(); });
$("#cl-kAll").addEventListener("click",()=>{ S.hidden.clear(); store("hidden",[]); renderChips(); renderLog(true); });
$("#cl-kNone").addEventListener("click",()=>{ S.hidden=new Set(KINDS.map(k=>k.key).filter(k=>k!=="Marker")); store("hidden",[...S.hidden]); renderChips(); renderLog(true); });
$("#cl-kRp").addEventListener("click",()=>{ S.hidden=new Set(KINDS.map(k=>k.key).filter(k=>k!=="Marker"&&!RP.includes(k))); store("hidden",[...S.hidden]); renderChips(); renderLog(true); });
R.querySelectorAll(".tg").forEach(b=>b.addEventListener("click",()=>{ const k=b.dataset.opt; S.opt[k]=!S.opt[k]; b.setAttribute("aria-pressed",S.opt[k]); store("opt",S.opt); renderLog(true); renderMentions(); }));
let findTimer=0;
$("#cl-find").addEventListener("input",()=>{ clearTimeout(findTimer); findTimer=setTimeout(()=>{ S.find=$("#cl-find").value.trim(); S.findAt=-1; renderLog(true); renderMentions(); },120); });
$("#cl-find").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); clearTimeout(findTimer); S.find=$("#cl-find").value.trim(); findStep(e.shiftKey?-1:1); } else if(e.key==="Escape"){ $("#cl-find").value=""; S.find=""; renderLog(true); } });
$("#cl-findPrev").addEventListener("click",e=>{ e.preventDefault(); findStep(-1); });
$("#cl-findNext").addEventListener("click",e=>{ e.preventDefault(); findStep(1); });
$("#cl-openBtn").addEventListener("click",()=>$("#cl-file").click());
$("#cl-file").addEventListener("change",e=>{ readFiles(e.target.files); e.target.value=""; });
$("#cl-pasteBtn").addEventListener("click",()=>{ $("#cl-pasteModal").hidden=false; setTimeout(()=>$("#cl-pasteText").focus(),30); });
$("#cl-pasteGo").addEventListener("click",()=>{ const t=$("#cl-pasteText").value; if(!t.trim()){ $("#cl-pasteText").focus(); return; } $("#cl-pasteModal").hidden=true; load(t,"Pasted log",false); $("#cl-pasteText").value=""; });
$("#cl-clearSample").addEventListener("click",()=>$("#cl-file").click());
$("#cl-copyBtn").addEventListener("click",copyLines);
$("#cl-clearPins").addEventListener("click",()=>{ let n=0; for(const l of S.lines) if(l.pinned){ l.pinned=false; n++; } renderLog(true); note(n?"Cleared "+n+" pins.":"There were no pins."); });
$("#cl-exportBtn").addEventListener("click",openExport);
$("#cl-exOpts").addEventListener("change",e=>{ const t=e.target;
  if(t.name==="scope") EX.scope=t.value; else if(t.name==="fmt") EX.fmt=+t.value; else if(t.name==="redact") EX.redact=+t.value;
  else if(t.id==="exMoney") EX.money=t.checked; else if(t.id==="exNums") EX.nums=t.checked; else if(t.id==="exClocks") EX.clocks=t.checked;
  renderExport(); });
$("#cl-exCopy").addEventListener("click",()=>{ const v=$("#cl-exText").value; if(!v) return; copy(v,"Export copied - paste it wherever you need it.").then(ok=>{ if(!ok){ $("#cl-exText").focus(); $("#cl-exText").select(); } }); });
$("#cl-filtersBtn").addEventListener("click",()=>$("#cl-side").classList.toggle("open"));
R.addEventListener("pointerdown",e=>{ const s=$("#cl-side"); if(s.classList.contains("open")&&!s.contains(e.target)&&e.target!==$("#cl-filtersBtn")) s.classList.remove("open"); });
const live=()=>!!HOST.offsetParent;
const typingNow=()=>/^(INPUT|TEXTAREA|SELECT)$/.test((R.activeElement||document.activeElement||{}).tagName||"")||/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||"");
document.addEventListener("keydown",e=>{
  if(!live()) return;
  const typing=typingNow();
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="f"){ e.preventDefault(); $("#cl-find").focus(); $("#cl-find").select(); }
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="c"&&!typing&&S.tab==="log"&&!(R.getSelection?R.getSelection():window.getSelection()).toString()){ e.preventDefault(); copyLines(); }
  else if(e.key==="Escape"){ R.querySelectorAll(".modal").forEach(m=>m.hidden=true); }
});
document.addEventListener("paste",e=>{
  if(!live()||typingNow()) return;
  const t=e.clipboardData&&e.clipboardData.getData("text"); if(t&&t.split(String.fromCharCode(10)).length>2){ e.preventDefault(); load(t,"Pasted log",false); }
});
let dragDepth=0;
window.addEventListener("dragenter",e=>{ if(live()&&[...(e.dataTransfer?.types||[])].includes("Files")){ dragDepth++; $("#cl-drop").classList.add("on"); } });
window.addEventListener("dragleave",()=>{ if(--dragDepth<=0){ dragDepth=0; $("#cl-drop").classList.remove("on"); } });
window.addEventListener("dragover",e=>{ if(live()) e.preventDefault(); });
window.addEventListener("drop",e=>{ if(!live()) return; e.preventDefault(); dragDepth=0; $("#cl-drop").classList.remove("on"); if(e.dataTransfer?.files?.length) readFiles(e.dataTransfer.files); });

/* ------------------------------------------------------------ start with a sample */
const SAMPLE = "[DATE: 07/Nov/2026 | TIME: 20:14:02]\n[20:14:02] [INFO] Welcome back to GTA World, Nora Castell.\n[20:14:31] Nora Castell says: Morning. Anything come back from the lab yet?\n[20:14:40] Teo Valdane says: Couple of things. Ballistics on the Vespucci casings just landed.\n[20:14:52] * Nora Castell pulls a chair over and sits down at the terminal.\n[20:15:03] ** [S: 1 | CH: DISP-5] Mara Quill says [low]: 280 X-ray 1, show me en route to Mission Row.\n[20:15:20] [INFO] [--------Evidence related to #37885443--------]\n[20:15:20] [INFO] Bag #199981: Signed by Iris Moreau at 2025-04-05 00:55\n[20:15:20] [INFO] ---label: 2x Capital Murder - Vespucci/Elgin - 05/APR/2025 @ 00:05\n[20:15:20] [INFO] Bag #199982: Signed by Iris Moreau at 2025-04-05 00:55\n[20:15:20] [INFO] ---label: 2x Capital Murder - Vespucci/Elgin - 05/APR/2025 @ 00:05\n[20:15:20] [INFO] Bag #199984: Signed by Iris Moreau at 2025-04-05 00:55\n[20:15:20] [INFO] ---label: 2x Capital Murder - Vespucci/Elgin - 05/APR/2025 @ 00:05\n[20:15:20] [INFO] Bag #200015: Signed by Dario Pell at 2025-04-05 03:48\n[20:15:20] [INFO] ---label: Strawberry Clothing Store - 04/APR/2025 - 10PM\n[20:15:20] [INFO] Bag #210470: Signed by Kai Brenner at 2025-06-03 23:30\n[20:15:20] [INFO] ---label: 03JUN2025 2300 HRS / LITTLE BIGHORN / X1 HOMICIDE\n[20:15:20] [INFO] [-------------------------------------------------]\n[20:15:44] Teo Valdane says: Same pistol on three scenes. That's our link.\n[20:15:58] [INFO] Bag #200000: Signed by Iris Moreau at 2025-04-05 00:55\n[20:15:58] [INFO] ---Label: 2x Capital Murder - Vespucci/Elgin - 05/APR/2025 @ 00:05\n[20:15:58] [INFO] ---Serial: 37885443\n[20:15:58] [INFO] ---Type: 9mm\n[20:16:20] (( PM from (156) Lev Ostrov: you around later for the debrief? ))\n[20:16:25] (( PM to (156) Lev Ostrov: yeah after shift ))\n[20:16:40] Nora Castell says: Run the swab from Little Seoul too.\n[20:17:02] Bag #17000: Signed by Hana Lowe at 25/OCT/2026 - 16:09:17\n[20:17:02] ---Label: 25/OCT/2026 15:30 - Little Seoul LTD - Triple Homicide\n[20:17:02] ---DNA: 4F506F734372797374616C3837363030\n[20:17:02] ---Owner: NOT FOUND\n[20:17:30] * Teo Valdane slides an evidence bag across the desk, tagged EVD-00418822.\n[20:17:41] Teo Valdane says: That's the hammer from the alley, EVD-00418823 is the jacket.\n[20:18:05] 2 fingerprint(s) found on item Hammer.\n[20:18:05] [AFIS-4A6F656C5F427279636520] - Joel Bryce - [Less than 24 hours ago]\n[20:18:05] [AFIS-4A6F656C5F427279636520] - Joel Bryce - [Less than 24 hours ago]\n[20:18:20] 3 fingerprint(s) found on item CarbineRifle.\n[20:18:20] [AFIS-5375655F4B6972726961] - Unknown - [Less than 3 days ago]\n[20:18:20] [AFIS-5375655F4B6972726961] - Unknown - [Less than 3 days ago]\n[20:18:20] [AFIS-5375655F4B6972726961] - Unknown - [Less than 24 hours ago]\n[20:18:44] Nora Castell says: Joel Bryce. Pull his file.\n[20:19:10] [INFO] =========================================================\n[20:19:10] [INFO] Police Lab Analysis:\n[20:19:10] [INFO] Drug Name: PCP\n[20:19:10] [INFO] Drug Quality: Medium\n[20:19:10] [INFO] Laboratory Signature: Could not be determined.\n[20:19:10] [INFO] =========================================================\n[20:19:35] * The terminal beeps and prints a second report. (( Teo Valdane ))*\n[20:20:02] _____ The corpse of Ruben Sayle _____\n[20:20:02] DNA String: 4F506F7344656D657472696F75733139303038\n[20:20:02] Age range: 30 to 35\n[20:20:02] Injuries:\n[20:20:02] *** Gunshot wound - Chest\n[20:20:02] *** Gunshot wound - Left arm\n[20:20:30] Mara Quill says (phone): Dispatch, I've got the scene photos for you.\n[20:20:48] [Advertisement] Selling a clean Enus Paragon, call 5552918.\n[20:21:05] (( Teo Valdane: brb grabbing food ))\n[20:21:20] You paid $250 to Hana Lowe.\n[20:21:44] Contacts:\n[20:21:44] Teo Valdane (5551204) - online\n[20:21:44] Mara Quill (5558830) - offline\n[20:21:44] Lev Ostrov (5550117) - online\n[20:22:10] Nora Castell shouts: Teo! Get the car, we're going to Vespucci.\n";
(function start(){
  const opt=recall("opt",null); if(opt&&typeof opt==="object") Object.assign(S.opt,opt);
  R.querySelectorAll(".tg").forEach(b=>b.setAttribute("aria-pressed",!!S.opt[b.dataset.opt]));
  const hid=recall("hidden",[]); if(Array.isArray(hid)) S.hidden=new Set(hid);
  $("#cl-me").value=recall("me","Nora Castell")||"";
  load(SAMPLE,"Sample log",true);
})();
})();
