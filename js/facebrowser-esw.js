/* ===== DFU: Facebrowser ESW Parser =====
   Reads a Facebrowser message export (CSV / TSV) and shows it as a Facebook-style messenger:
   conversations in a sidebar, bubbles on the right. Nothing is uploaded; the file is read by this page only.

   The export format is fixed and maintained here, not by the user: everything format-specific lives in two places,
   COLUMNS (which header names map to which field) and parseTable() (how the raw text is split into rows).
   The rest of the tool only ever sees normalised message objects. */
(() => {
  "use strict";

  /* ------------------------------------------------------------ format definition */
  // logical field -> header names accepted for it (compared lowercase, spaces/dashes as underscores)
  const COLUMNS = {
    id: { label: "Message ID", names: ["message_id", "msg_id", "messageid", "id"] },
    conv: { label: "Conversation ID", names: ["conversation_id", "conv_id", "thread_id", "chat_id", "conversation", "thread"] },
    user: { label: "Sender ID", names: ["user_id", "sender_id", "from_id", "author_id", "sender", "author", "from", "user"] },
    text: { label: "Message", names: ["message", "text", "body", "content", "msg"] },
    image: { label: "Image", names: ["image", "images", "photo", "photos", "image_url", "attachment", "picture"] },
    time: { label: "Time", names: ["time", "timestamp", "datetime", "created_at", "sent_at", "date", "created"] },
    userName: { label: "Sender name (optional)", names: ["user_name", "sender_name", "from_name", "display_name", "username", "name"] },
    convName: { label: "Conversation name (optional)", names: ["conversation_name", "thread_name", "chat_name", "conversation_title", "title"] },
  };
  // Where Facebrowser serves attachments. The export only holds the file name (or a path ending in it), so the
  // preview address is this base plus the file name. Change it here if the storage address ever moves.
  const PREVIEW_BASE = "https://face.gta.world/storage/chat-attachments/";
  const REQUIRED = ["conv", "user", "text", "time"];

  /* ------------------------------------------------------------ parsing */
  const norm = (h) => String(h || "").replace(/^﻿/, "").trim().toLowerCase().replace(/[\s-]+/g, "_");

  function detectDelimiter(text) {
    const head = text.slice(0, text.search(/\r?\n/) < 0 ? text.length : text.search(/\r?\n/));
    const n = (c) => head.split(c).length - 1;
    const best = [["\t", n("\t")], [",", n(",")], [";", n(";")]].sort((a, b) => b[1] - a[1])[0];
    return best[1] ? best[0] : "\t";
  }

  // Splits text into rows of fields. Handles RFC 4180 quoting, and the backslash-newline escape this export
  // uses for multi-line messages (the record continues until it has as many fields as the header).
  function parseTable(text, delim) {
    const rows = [];
    const first = text.indexOf("\n");
    const header = text.slice(0, first < 0 ? text.length : first).replace(/\r$/, "").split(delim);
    const width = header.length;
    let row = [], field = "", inQ = false, atStart = true, i = 0;
    const N = text.length, startRx = /^\d+[\t,;]\d*[\t,;]/;
    const endField = () => { row.push(field); field = ""; atStart = true; };
    const endRow = () => { endField(); if (row.length > 1 || row[0] !== "") rows.push(row); row = []; };
    while (i < N) {
      const c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"' && atStart) { inQ = true; atStart = false; i++; continue; }
      if (c === delim) { endField(); i++; continue; }
      if (c === "\r" || c === "\n") {
        const nl = c === "\r" && text[i + 1] === "\n" ? 2 : 1;
        const escaped = field.endsWith("\\");
        // a newline belongs to the message when it was escaped, or when the record is still short and the next line
        // does not look like the start of a new record
        const short = row.length < width - 1 && !startRx.test(text.slice(i + nl, i + nl + 40));
        if (escaped || short) {
          if (escaped) field = field.slice(0, -1);
          field += "\n"; i += nl; atStart = false; continue;
        }
        endRow(); i += nl; continue;
      }
      field += c; atStart = false; i++;
    }
    if (field !== "" || row.length) endRow();
    return { header, rows, delim };
  }

  function autoMap(header) {
    const map = {}, hs = header.map(norm);
    for (const k in COLUMNS) {
      for (const name of COLUMNS[k].names) {
        const ix = hs.indexOf(name);
        if (ix >= 0) { map[k] = ix; break; }
      }
    }
    return map;
  }

  const decodeBox = document.createElement("textarea");
  function decode(s) {
    if (!s || s.indexOf("&") < 0) return s || "";
    decodeBox.innerHTML = s.replace(/</g, "&lt;");
    return decodeBox.value;
  }

  function parseTime(s) {
    s = String(s || "").trim();
    if (!s) return NaN;
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (m) return Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
    if (/^\d{9,13}$/.test(s)) return s.length > 11 ? +s : +s * 1000;
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return Date.UTC(+m[1], m[2] - 1, +m[3]);
    const t = Date.parse(s);
    return isNaN(t) ? NaN : t;
  }

  // table + column map -> normalised messages
  function buildMessages(table, map) {
    const get = (r, k) => (map[k] == null ? "" : (r[map[k]] || "").trim());
    const out = [];
    let seq = 0;
    const width = table.header.length;
    for (let r of table.rows) {
      // a stray delimiter inside the message makes the row too long: fold the extra pieces back into the message
      if (r.length > width && map.text != null) {
        const extra = r.length - width;
        r = r.slice(0, map.text).concat([r.slice(map.text, map.text + extra + 1).join(table.delim || "	")], r.slice(map.text + extra + 1));
      }
      const text = decode(map.text == null ? "" : (r[map.text] || "")).replace(/^\s+|\s+$/g, "");
      const image = get(r, "image");
      const t = parseTime(get(r, "time"));
      if (!text && !image && isNaN(t)) continue;
      out.push({
        seq: seq++, id: get(r, "id"), conv: get(r, "conv") || "(none)", user: get(r, "user") || "(unknown)",
        text, image, t, timeRaw: get(r, "time"),
        userName: decode(get(r, "userName")), convName: decode(get(r, "convName")),
      });
    }
    return out;
  }

  /* ------------------------------------------------------------ DOM helpers */
  const HOST = document.getElementById("fb-host");
  const TPL = document.getElementById("fb-tpl");
  const isNode = typeof module !== "undefined" && module.exports;
  if (isNode) module.exports = { parseTable, detectDelimiter, autoMap, buildMessages, decode, parseTime };
  if (!HOST || !TPL) return;

  HOST.append(TPL.content.cloneNode(true));
  const q = (s) => HOST.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (t) => { const d = new Date(t); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); };
  const hm = (t) => { const d = new Date(t); return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); };
  const full = (t) => dayKey(t) + " " + hm(t) + ":" + pad(new Date(t).getUTCSeconds());
  const dayLabel = (t) => new Date(t).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const shortDay = (t) => new Date(t).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
  const num = (n) => n.toLocaleString("en-GB");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const hue = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 360; };

  /* ------------------------------------------------------------ state */
  const S = {
    fileName: "", mode: "chat", pics: [], flags: [], flagMap: new Map(), flagSel: { cats: new Set(), term: "" }, flagShown: 150, lbItem: null, table: null, map: {}, delim: "\t", msgs: [], convs: new Map(), subject: null,
    cur: null, search: "", from: "", to: "", media: "all", sort: "recent", find: "", hits: [], hitAt: -1,
    aliases: store.get("lssd-fb-aliases", {}),
  };

  const nameOf = (u) => S.aliases[u] || S.names[u] || "User " + u;
  S.names = {};
  const isSubject = (u) => u === S.subject;
  const initials = (n) => {
    const w = n.replace(/^User\s+/i, "").trim().split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[w.length - 1][0] : (w[0] || "?").slice(0, 2)).toUpperCase();
  };
  function avatar(u, size) {
    const a = el("span", "fb-av " + (size || ""));
    const n = nameOf(u);
    a.style.setProperty("--h", hue(String(u)));
    a.textContent = S.aliases[u] || S.names[u] ? initials(n) : "";
    if (!a.textContent) a.classList.add("anon");
    return a;
  }

  /* ------------------------------------------------------------ dataset */
  function load(text, fileName) {
    text = String(text || "");
    if (!text.trim()) return toast("That file is empty");
    const delim = detectDelimiter(text);
    const table = parseTable(text, delim);
    if (table.header.length < 2 || !table.rows.length) return toast("No columns or rows found in that file");
    openMapping(table, delim, fileName || "pasted text");
  }

  // Column-mapping dialog: one dropdown per field, listing every column in the file, pre-selected where the name matched.
  let pending = null;
  function openMapping(table, delim, fileName) {
    pending = { table, delim, fileName };
    const auto = autoMap(table.header);
    const box = q("#fb-mapRows"); box.textContent = "";
    q("#fb-mapInfo").textContent = fileName + " · " + num(table.rows.length) + " rows · " + table.header.length + " columns. Choose which column holds each field.";
    for (const k of REQUIRED) {
      const req = true;
      const lab = el("label", "", COLUMNS[k].label); lab.htmlFor = "fb-map-" + k;
      if (req) lab.append(el("i", "", "*"));
      const sel = el("select"); sel.id = "fb-map-" + k; sel.dataset.k = k;
      sel.append(new Option(req ? "Select a column…" : "— none —", ""));
      table.header.forEach((h, i) => sel.append(new Option(h.trim() || "(column " + (i + 1) + ")", i)));
      if (auto[k] != null) sel.value = auto[k];
      const hint = el("small");
      const upd = () => {
        const i = sel.value;
        const sample = i === "" ? "" : (table.rows.slice(0, 40).map((r) => (r[+i] || "").trim()).find(Boolean) || "(empty)");
        hint.textContent = sample ? "e.g. " + sample.replace(/\s+/g, " ").slice(0, 80) : "";
        sel.classList.toggle("bad", req && i === "");
        q("#fb-mapOk").disabled = REQUIRED.some((r) => { const s = q("#fb-map-" + r); return !s || s.value === ""; });
      };
      sel.addEventListener("change", upd);
      box.append(lab, sel, hint); upd();
    }
    q("#fb-mapDlg").hidden = false;
    q("#fb-mapOk").disabled = REQUIRED.some((r) => q("#fb-map-" + r).value === "");
  }
  function confirmMapping() {
    if (!pending) return;
    // optional fields (id, image, names) are not asked for: they are filled by header name when the file has them
    const map = autoMap(pending.table.header);
    for (const k of REQUIRED) { const v = q("#fb-map-" + k).value; if (v !== "") map[k] = +v; }
    if (REQUIRED.some((k) => map[k] == null)) return toast("Map every required field (*)");
    S.fileName = pending.fileName; S.table = pending.table; S.delim = pending.delim; S.map = map;
    pending = null; q("#fb-mapDlg").hidden = true;
    applyData();
  }

  function applyData() {
    const msgs = S.table ? buildMessages(S.table, S.map) : [];
    S.msgs = msgs;
    S.names = {};
    for (const m of msgs) if (m.userName && !S.names[m.user]) S.names[m.user] = m.userName;
    const convs = new Map();
    for (const m of msgs) {
      let c = convs.get(m.conv);
      if (!c) convs.set(m.conv, (c = { id: m.conv, msgs: [], users: new Map(), name: "", img: 0 }));
      c.msgs.push(m);
      c.users.set(m.user, (c.users.get(m.user) || 0) + 1);
      if (m.convName && !c.name) c.name = m.convName;
      if (m.image) c.img++;
    }
    const idNum = (m) => (/^\d+$/.test(m.id) ? +m.id : m.seq);
    for (const c of convs.values()) {
      c.msgs.sort((a, b) => (isNaN(a.t) || isNaN(b.t) ? a.seq - b.seq : a.t - b.t || idNum(a) - idNum(b) || a.seq - b.seq));
      const ts = c.msgs.map((m) => m.t).filter((t) => !isNaN(t));
      c.first = ts.length ? Math.min(...ts) : NaN;
      c.last = ts.length ? Math.max(...ts) : NaN;
      c.low = c.msgs.map((m) => m.text.toLowerCase());
    }
    S.convs = convs;
    S.pics = [];
    for (const c of convs.values()) for (const m of c.msgs) if (m.image) S.pics.push({ m, c });
    computeFlags();
    // subject = the account that is in the most conversations (the device or account the export came from)
    const seen = new Map(), cnt = new Map();
    for (const c of convs.values()) for (const [u, n] of c.users) { seen.set(u, (seen.get(u) || 0) + 1); cnt.set(u, (cnt.get(u) || 0) + n); }
    const ranked = [...seen.keys()].sort((a, b) => seen.get(b) - seen.get(a) || cnt.get(b) - cnt.get(a));
    const saved = store.get("lssd-fb-subject", null);
    S.subject = saved && seen.has(saved) ? saved : ranked[0] || null;
    S.cur = null; S.find = ""; S.hits = []; S.hitAt = -1;
    $subject();
    fillPicFilters(); fillFlagFilters(true);
    renderAll();
    if (convs.size) {
      const first = visibleConvs()[0];
      if (first) openConv(first.id);
    }
  }

  /* ------------------------------------------------------------ conversation list */
  const others = (c) => [...c.users.keys()].filter((u) => !isSubject(u));
  const convTitle = (c) => {
    if (c.name) return c.name;
    const o = others(c);
    if (o.length) return o.map(nameOf).join(", ");
    return "Unknown recipient";
  };
  const convSub = (c) => (others(c).length ? "" : "Conversation " + c.id);

  function visibleConvs() {
    const term = S.search.trim().toLowerCase();
    const from = S.from ? Date.parse(S.from + "T00:00:00Z") : null;
    const to = S.to ? Date.parse(S.to + "T23:59:59Z") : null;
    const list = [];
    for (const c of S.convs.values()) {
      let msgs = c.msgs;
      if (from != null || to != null) msgs = msgs.filter((m) => !isNaN(m.t) && (from == null || m.t >= from) && (to == null || m.t <= to));
      if (S.media === "image") msgs = msgs.filter((m) => m.image);
      if (!msgs.length) continue;
      let hits = 0;
      if (term) {
        const head = (convTitle(c) + " " + c.id + " " + [...c.users.keys()].join(" ") + " " + [...c.users.keys()].map(nameOf).join(" ")).toLowerCase();
        for (const m of msgs) if (m.text.toLowerCase().includes(term)) hits++;
        if (!hits && !head.includes(term)) continue;
      }
      const last = msgs[msgs.length - 1];
      list.push({ id: c.id, c, count: msgs.length, last, hits });
    }
    if (S.sort === "size") list.sort((a, b) => b.count - a.count);
    else if (S.sort === "name") list.sort((a, b) => convTitle(a.c).localeCompare(convTitle(b.c)));
    else if (S.sort === "oldest") list.sort((a, b) => (a.c.first || 0) - (b.c.first || 0));
    else list.sort((a, b) => (b.last.t || 0) - (a.last.t || 0));
    return list;
  }

  function renderList() {
    const box = q("#fb-list");
    box.textContent = "";
    const list = visibleConvs();
    q("#fb-listCount").textContent = S.convs.size ? num(list.length) + " of " + num(S.convs.size) : "";
    if (!list.length) {
      box.append(el("div", "fb-none", S.convs.size ? "No conversation matches these filters." : "No file imported yet."));
      return;
    }
    const frag = document.createDocumentFragment();
    for (const it of list) {
      const c = it.c, o = others(c);
      const row = el("button", "fb-conv" + (S.cur === c.id ? " on" : ""));
      row.type = "button"; row.dataset.id = c.id;
      row.append(o.length ? avatar(o[0]) : avatar("?"));
      const mid = el("span", "fb-cm");
      mid.append(el("b", "", convTitle(c)));
      const m = it.last;
      mid.append(el("span", "fb-prev", (m.text || (m.image ? "Sent a photo" : ""))));
      row.append(mid);
      const right = el("span", "fb-cr");
      right.append(el("time", "", isNaN(m.t) ? "" : shortDay(m.t)));
      right.append(el("em", it.hits ? "hit" : "", it.hits ? it.hits + " match" + (it.hits === 1 ? "" : "es") : num(it.count)));
      row.append(right);
      row.title = "Conversation " + c.id + " · " + num(c.msgs.length) + " messages" + (convSub(c) ? "" : "");
      frag.append(row);
    }
    box.append(frag);
  }

  /* ------------------------------------------------------------ chat pane */
  function renderChat() {
    const c = S.cur && S.convs.get(S.cur);
    const pane = q("#fb-chat");
    q("#fb-app").dataset.has = c ? "1" : "";
    if (!c) { q("#fb-head").hidden = true; q("#fb-thread").textContent = ""; q("#fb-empty").hidden = !!S.convs.size; q("#fb-pick").hidden = !S.convs.size || !!c; q("#fb-info").hidden = true; return; }
    q("#fb-empty").hidden = true; q("#fb-pick").hidden = true; q("#fb-head").hidden = false;
    q("#fb-export").disabled = false;
    const o = others(c);
    const av = q("#fb-hav"); av.textContent = ""; av.append(o.length ? avatar(o[0], "lg") : avatar("?", "lg"));
    q("#fb-htitle").textContent = convTitle(c);
    const range = isNaN(c.first) ? "" : " · " + shortDay(c.first) + (dayKey(c.first) === dayKey(c.last) ? "" : " – " + shortDay(c.last));
    q("#fb-hsub").textContent = "Conversation " + c.id + " · " + num(c.msgs.length) + " messages" + range;

    const term = S.search.trim().toLowerCase();
    const from = S.from ? Date.parse(S.from + "T00:00:00Z") : null;
    const to = S.to ? Date.parse(S.to + "T23:59:59Z") : null;
    let msgs = c.msgs;
    const filtered = from != null || to != null || S.media !== "all";
    if (from != null || to != null) msgs = msgs.filter((m) => !isNaN(m.t) && (from == null || m.t >= from) && (to == null || m.t <= to));
    if (S.media === "image") msgs = msgs.filter((m) => m.image);
    q("#fb-note").hidden = !filtered;
    q("#fb-note").textContent = filtered ? "Filters are on: showing " + num(msgs.length) + " of " + num(c.msgs.length) + " messages." : "";

    const find = S.find.trim().toLowerCase();
    const thread = q("#fb-thread");
    thread.textContent = "";
    S.hits = [];
    const frag = document.createDocumentFragment();
    let prev = null, run = null;
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i], nx = msgs[i + 1];
      const newDay = !prev || isNaN(m.t) || isNaN(prev.t) ? !prev : dayKey(m.t) !== dayKey(prev.t);
      if (newDay && !isNaN(m.t)) {
        const d = el("div", "fb-day", dayLabel(m.t)); d.dataset.day = dayKey(m.t); frag.append(d);
      } else if (prev && !isNaN(m.t) && !isNaN(prev.t) && m.t - prev.t > 30 * 60 * 1000) {
        frag.append(el("div", "fb-gap", hm(m.t)));
      }
      const sameAsPrev = prev && prev.user === m.user && !newDay && !(m.t - prev.t > 5 * 60 * 1000);
      const sameAsNext = nx && nx.user === m.user && !isNaN(m.t) && !isNaN(nx.t) && dayKey(nx.t) === dayKey(m.t) && nx.t - m.t <= 5 * 60 * 1000;
      const mine = isSubject(m.user);
      const row = el("div", "fb-row " + (mine ? "out" : "in") + (sameAsPrev ? " cont" : "") + (sameAsNext ? " more" : ""));
      row.dataset.mid = m.id;
      if (!mine) {
        const slot = el("span", "fb-slot");
        if (!sameAsNext) slot.append(avatar(m.user, "sm"));
        row.append(slot);
      }
      const col = el("div", "fb-col");
      if (!mine && !sameAsPrev && (c.users.size > 2 || c.name)) col.append(el("span", "fb-who", nameOf(m.user)));
      if (m.image) col.append(imageNode(m.image, { m, c }));
      if (m.text) {
        const b = el("div", "fb-b");
        richText(b, m.text, find);
        b.title = (isNaN(m.t) ? m.timeRaw : full(m.t)) + (m.id ? " · message " + m.id : "") + " · " + nameOf(m.user);
        col.append(b);
        if (find && m.text.toLowerCase().includes(find)) S.hits.push(row);
      }
      row.append(col);
      const fi = S.flagMap.get(m);
      if (fi) {
        const fl = el("span", "fb-fl", "\u2691");
        fl.style.color = catOf(fi.hits[0].cat).color;
        fl.title = "Flagged: " + [...fi.terms].map((x) => x.split("|")[1]).join(", ");
        row.append(fl);
      }
      row.append(el("time", "fb-t", isNaN(m.t) ? m.timeRaw : hm(m.t)));
      frag.append(row);
      prev = m;
    }
    if (!msgs.length) frag.append(el("div", "fb-none", "Nothing in this conversation matches the filters."));
    thread.append(frag);
    renderInfo(c);
    updateFind(true);
    if (!find) thread.scrollTop = thread.scrollHeight;
    q("#fb-fab").hidden = true;
  }

  // text with links and search highlight, built from nodes so message content is never treated as HTML
  const URLRX = /\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)\]"']/gi;
  function richText(box, text, find) {
    let last = 0, m;
    URLRX.lastIndex = 0;
    const piece = (str, link) => {
      if (!str) return;
      const host = link ? el("a") : box;
      if (link) { host.href = str; host.target = "_blank"; host.rel = "noopener noreferrer"; box.append(host); }
      if (!find) { host.append(document.createTextNode(str)); return; }
      const low = str.toLowerCase();
      let at = 0, ix;
      while ((ix = low.indexOf(find, at)) >= 0) {
        if (ix > at) host.append(document.createTextNode(str.slice(at, ix)));
        host.append(el("mark", "", str.slice(ix, ix + find.length)));
        at = ix + find.length;
      }
      if (at < str.length) host.append(document.createTextNode(str.slice(at)));
    };
    while ((m = URLRX.exec(text))) { piece(text.slice(last, m.index)); piece(m[0], true); last = m.index + m[0].length; }
    piece(text.slice(last));
  }

  function fileName(p) { return String(p).split(/[?#]/)[0].split(/[\\/]/).pop(); }
  function mediaUrl(path) {
    if (/^(https?:|blob:|data:)/i.test(path)) return path;
    const name = fileName(path);
    return name ? PREVIEW_BASE + encodeURIComponent(name) : "";
  }
  function imageNode(path, item) {
    const url = mediaUrl(path);
    const box = el("div", "fb-img");
    const miss = () => { box.textContent = ""; box.classList.add("miss"); box.append(el("b", "", "Photo"), el("span", "", fileName(path)), el("small", "", "Preview could not be loaded.")); box.title = path; };
    if (!url) { miss(); return box; }
    const im = new Image();
    im.alt = "Photo " + fileName(path); im.loading = "lazy"; im.referrerPolicy = "no-referrer";
    im.onerror = miss; im.onclick = () => lightbox(url, path, item);
    im.src = url; box.append(im); box.title = path;
    return box;
  }
  function lightbox(url, path, item) {
    const lb = q("#fb-lb");
    S.lbItem = item || null;
    q("#fb-lbImg").src = url;
    q("#fb-lbCap").textContent = item ? nameOf(item.m.user) + " \u00b7 " + convTitle(item.c) + " \u00b7 " + (isNaN(item.m.t) ? item.m.timeRaw : full(item.m.t)) + " \u00b7 " + path : path;
    q("#fb-lbGo").hidden = !item;
    lb.hidden = false;
  }

  /* ------------------------------------------------------------ photos gallery */
  const picFilter = { conv: "", user: "", from: "", to: "", sort: "new" };
  function fillPicFilters() {
    const convSel = q("#fb-pConv"), userSel = q("#fb-pUser");
    const opt = (sel, v, label) => { const o = el("option", "", label); o.value = v; sel.append(o); };
    convSel.textContent = ""; userSel.textContent = "";
    opt(convSel, "", "All conversations"); opt(userSel, "", "Everyone");
    const convs = new Map(), users = new Map();
    for (const { m, c } of S.pics) { convs.set(c.id, (convs.get(c.id) || 0) + 1); users.set(m.user, (users.get(m.user) || 0) + 1); }
    for (const [id, n] of [...convs].sort((a, b) => b[1] - a[1])) opt(convSel, id, convTitle(S.convs.get(id)) + " (" + n + ")");
    for (const [u, n] of [...users].sort((a, b) => b[1] - a[1])) opt(userSel, u, nameOf(u) + (isSubject(u) ? " (subject)" : "") + " (" + n + ")");
    picFilter.conv = picFilter.user = "";
    q("#fb-picN").textContent = num(S.pics.length);
  }
  function renderPics() {
    const grid = q("#fb-pgrid");
    grid.textContent = "";
    const from = picFilter.from ? Date.parse(picFilter.from + "T00:00:00Z") : null, to = picFilter.to ? Date.parse(picFilter.to + "T23:59:59Z") : null;
    const list = S.pics.filter(({ m, c }) => (!picFilter.conv || c.id === picFilter.conv) && (!picFilter.user || m.user === picFilter.user) &&
      (from == null || (!isNaN(m.t) && m.t >= from)) && (to == null || (!isNaN(m.t) && m.t <= to)));
    list.sort((a, b) => (picFilter.sort === "old" ? 1 : -1) * ((a.m.t || 0) - (b.m.t || 0)));
    q("#fb-pStat").textContent = S.pics.length ? num(list.length) + " of " + num(S.pics.length) + " photos" : "";
    if (!S.pics.length) { grid.append(el("div", "fb-none", S.convs.size ? "No photos in this export." : "Import a file to see its photos.")); return; }
    if (!list.length) { grid.append(el("div", "fb-none", "No photo matches these filters.")); return; }
    const frag = document.createDocumentFragment();
    for (const it of list) {
      const { m, c } = it, url = mediaUrl(m.image);
      const card = el("div", "fb-pc");
      const th = el("button", "fb-pth" + (url ? "" : " miss")); th.type = "button"; th.title = m.image;
      if (url) {
        const im = new Image(); im.alt = "Photo posted by " + nameOf(m.user); im.loading = "lazy"; im.referrerPolicy = "no-referrer"; im.src = url;
        im.onerror = () => { th.classList.add("miss"); th.textContent = ""; th.append(el("b", "", "Preview unavailable"), el("span", "", fileName(m.image))); };
        th.append(im);
        th.onclick = () => lightbox(url, m.image, it);
      } else {
        th.append(el("b", "", "Photo"), el("span", "", fileName(m.image)));
        th.onclick = () => openInChat(it);
      }
      const meta = el("div", "fb-pm");
      meta.append(avatar(m.user, "sm"));
      const who = el("span", "fb-pw");
      who.append(el("b", "", nameOf(m.user) + (isSubject(m.user) ? " (subject)" : "")), el("small", "", "in " + convTitle(c)), el("small", "", isNaN(m.t) ? m.timeRaw : full(m.t)));
      meta.append(who);
      const go = el("button", "fb-btn g sm", "Chat"); go.type = "button"; go.title = "Open this photo in its conversation"; go.onclick = () => openInChat(it);
      meta.append(go);
      card.append(th, meta);
      frag.append(card);
    }
    grid.append(frag);
  }
  /* ------------------------------------------------------------ flagger */
  const CATS = window.FBTERMS || [];
  const catOf = (k) => CATS.find((c) => c.key === k) || { name: k, color: "#888" };
  const escRx = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // "ak 47" -> ak[\s-]*47, so spaced, hyphenated and joined spellings all match
  const termRx = (t) => t.trim().toLowerCase().split(/[\s-]+/).filter(Boolean).map(escRx).join("[\\s\\-]*");
  const COMPILED = CATS.map((cat) => {
    const terms = [...new Set(cat.terms.map((t) => t.trim().toLowerCase()))].sort((a, b) => b.length - a.length);
    const rx = new RegExp("(?<![\\p{L}\\p{N}])(?:" + terms.map((t) => "(" + termRx(t) + ")").join("|") + ")(?:e?s)?(?![\\p{L}\\p{N}])", "giu");
    return { cat, terms, rx };
  });
  const FL = { conv: "", user: "", from: "", to: "", sort: "new", ctx: false };

  function computeFlags() {
    S.flags = []; S.flagMap = new Map(); S.termCount = {}; S.catCount = {};
    for (const c of S.convs.values()) {
      c.msgs.forEach((m, i) => {
        if (!m.text) return;
        const hits = [];
        for (const { cat, terms, rx } of COMPILED) {
          rx.lastIndex = 0;
          let r;
          while ((r = rx.exec(m.text))) {
            if (!r[0]) { rx.lastIndex++; continue; }
            let g = -1;
            for (let k = 1; k < r.length; k++) if (r[k] !== undefined) { g = k - 1; break; }
            hits.push({ cat: cat.key, term: terms[g], s: r.index, e: r.index + r[0].length });
          }
        }
        if (!hits.length) return;
        hits.sort((a, b) => a.s - b.s || b.e - a.e);
        const it = { m, c, i, hits, cats: new Set(hits.map((h) => h.cat)), terms: new Set(hits.map((h) => h.cat + "|" + h.term)) };
        S.flags.push(it); S.flagMap.set(m, it);
        for (const k of it.cats) S.catCount[k] = (S.catCount[k] || 0) + 1;
        for (const k of it.terms) S.termCount[k] = (S.termCount[k] || 0) + 1;
      });
    }
  }

  function fillFlagFilters(reset) {
    const convSel = q("#fb-fConv"), userSel = q("#fb-fUser");
    const opt = (sel, v, label) => { const o = el("option", "", label); o.value = v; sel.append(o); };
    convSel.textContent = ""; userSel.textContent = "";
    opt(convSel, "", "All conversations"); opt(userSel, "", "Everyone");
    const convs = new Map(), users = new Map();
    for (const { m, c } of S.flags) { convs.set(c.id, (convs.get(c.id) || 0) + 1); users.set(m.user, (users.get(m.user) || 0) + 1); }
    for (const [id, n] of [...convs].sort((a, b) => b[1] - a[1])) opt(convSel, id, convTitle(S.convs.get(id)) + " (" + n + ")");
    for (const [u, n] of [...users].sort((a, b) => b[1] - a[1])) opt(userSel, u, nameOf(u) + (isSubject(u) ? " (subject)" : "") + " (" + n + ")");
    if (reset) { FL.conv = FL.user = ""; S.flagSel.cats = new Set(CATS.map((c) => c.key)); S.flagSel.term = ""; S.flagShown = 150; }
    convSel.value = FL.conv; userSel.value = FL.user;
    q("#fb-flagN").textContent = num(S.flags.length);
  }

  function visibleFlags() {
    const from = FL.from ? Date.parse(FL.from + "T00:00:00Z") : null, to = FL.to ? Date.parse(FL.to + "T23:59:59Z") : null;
    const on = S.flagSel.cats, tk = S.flagSel.term, out = [];
    for (const it of S.flags) {
      if (FL.conv && it.c.id !== FL.conv) continue;
      if (FL.user && it.m.user !== FL.user) continue;
      if (from != null && !(it.m.t >= from)) continue;
      if (to != null && !(it.m.t <= to)) continue;
      const hits = it.hits.filter((h) => on.has(h.cat) && (!tk || h.cat + "|" + h.term === tk));
      if (hits.length) out.push({ it, hits });
    }
    if (FL.sort === "most") out.sort((a, b) => b.hits.length - a.hits.length || (b.it.m.t || 0) - (a.it.m.t || 0));
    else out.sort((a, b) => (FL.sort === "old" ? 1 : -1) * ((a.it.m.t || 0) - (b.it.m.t || 0)));
    return out;
  }

  function renderFlagSide() {
    const box = q("#fb-fcats");
    box.textContent = "";
    for (const { cat, terms } of COMPILED) {
      const on = S.flagSel.cats.has(cat.key);
      const wrap = el("div", "fb-fcat" + (on ? "" : " off")); wrap.style.setProperty("--cc", cat.color);
      const lab = el("label", "fb-fch");
      const cb = el("input"); cb.type = "checkbox"; cb.checked = on; cb.dataset.cat = cat.key;
      lab.append(cb, el("b", "", cat.name), el("em", "", num(S.catCount[cat.key] || 0)));
      wrap.append(lab);
      const used = terms.filter((t) => S.termCount[cat.key + "|" + t]).sort((a, b) => S.termCount[cat.key + "|" + b] - S.termCount[cat.key + "|" + a]);
      const unused = terms.filter((t) => !S.termCount[cat.key + "|" + t]).sort();
      const list = el("div", "fb-fterms");
      for (const t of used) {
        const b = el("button", "fb-term" + (S.flagSel.term === cat.key + "|" + t ? " on" : ""), t);
        b.type = "button"; b.dataset.term = cat.key + "|" + t; b.append(el("small", "", String(S.termCount[cat.key + "|" + t])));
        list.append(b);
      }
      if (!used.length) list.append(el("span", "fb-fnote", "No hits in this export."));
      wrap.append(list);
      if (unused.length) {
        const d = el("details"); d.append(el("summary", "", unused.length + " term" + (unused.length === 1 ? "" : "s") + " with no hits"));
        const u = el("div", "fb-fterms dim"); for (const t of unused) u.append(el("span", "", t));
        d.append(u); wrap.append(d);
      }
      box.append(wrap);
    }
  }

  function flagText(box, text, hits) {
    let at = 0;
    for (const h of hits) {
      if (h.s < at) continue;
      if (h.s > at) box.append(document.createTextNode(text.slice(at, h.s)));
      const mk = el("mark", "fb-hit", text.slice(h.s, h.e));
      mk.style.setProperty("--cc", catOf(h.cat).color); mk.title = catOf(h.cat).name;
      box.append(mk); at = h.e;
    }
    if (at < text.length) box.append(document.createTextNode(text.slice(at)));
  }

  function renderFlags() {
    renderFlagSide();
    const list = q("#fb-flist");
    list.textContent = "";
    const all = visibleFlags();
    q("#fb-fStat").textContent = S.flags.length ? num(all.length) + " of " + num(S.flags.length) + " flagged messages" : "";
    q("#fb-fExport").disabled = !all.length;
    if (!S.flags.length) { list.append(el("div", "fb-none", S.convs.size ? "No message matched the flag lists." : "Import a file to flag its messages.")); return; }
    if (!all.length) { list.append(el("div", "fb-none", "No flagged message matches these filters.")); return; }
    const shown = all.slice(0, S.flagShown), frag = document.createDocumentFragment();
    for (const { it, hits } of shown) {
      const { m, c } = it, first = catOf(hits[0].cat);
      const card = el("div", "fb-fc"); card.style.setProperty("--cc", first.color);
      const head = el("div", "fb-fh");
      head.append(avatar(m.user, "sm"));
      const who = el("span", "fb-fw");
      who.append(el("b", "", nameOf(m.user) + (isSubject(m.user) ? " (subject)" : "")), el("small", "", "in " + convTitle(c)));
      head.append(who, el("span", "fb-ft", isNaN(m.t) ? m.timeRaw : full(m.t)));
      card.append(head);
      const ctx = (x) => { const d = el("div", "fb-fctx"); d.append(el("b", "", nameOf(x.user) + ": "), document.createTextNode(x.text || (x.image ? "[photo]" : ""))); return d; };
      if (FL.ctx && c.msgs[it.i - 1]) card.append(ctx(c.msgs[it.i - 1]));
      const body = el("div", "fb-fbody"); flagText(body, m.text, hits); card.append(body);
      if (FL.ctx && c.msgs[it.i + 1]) card.append(ctx(c.msgs[it.i + 1]));
      const foot = el("div", "fb-ff");
      const byCat = new Map();
      for (const h of hits) { if (!byCat.has(h.cat)) byCat.set(h.cat, new Set()); byCat.get(h.cat).add(h.term); }
      for (const [k, ts] of byCat) { const ch = el("span", "fb-chip", catOf(k).name + ": " + [...ts].join(", ")); ch.style.setProperty("--cc", catOf(k).color); foot.append(ch); }
      foot.append(el("span", "fb-grow"));
      const go = el("button", "fb-btn g sm", "Chat"); go.type = "button"; go.title = "Open this message in its conversation"; go.onclick = () => openInChat(it);
      foot.append(go);
      card.append(foot);
      frag.append(card);
    }
    list.append(frag);
    if (all.length > shown.length) {
      const more = el("button", "fb-btn fb-more", "Show " + Math.min(150, all.length - shown.length) + " more (" + num(all.length - shown.length) + " left)");
      more.type = "button"; more.onclick = () => { S.flagShown += 150; const top = list.scrollTop; renderFlags(); list.scrollTop = top; };
      list.append(more);
    }
  }
  function exportFlags() {
    const rows = [["message_id", "conversation_id", "user_id", "sender", "time", "categories", "terms", "message"]];
    for (const { it, hits } of visibleFlags()) {
      const m = it.m;
      rows.push([m.id, m.conv, m.user, nameOf(m.user), isNaN(m.t) ? m.timeRaw : full(m.t), [...new Set(hits.map((h) => catOf(h.cat).name))].join("; "), [...new Set(hits.map((h) => h.term))].join("; "), m.text]);
    }
    const esc = (v) => { v = String(v == null ? "" : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    download("facebrowser-flagged.csv", "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n") + "\r\n", "text/csv");
  }

  function setMode(mode) {
    S.mode = mode;
    q("#fb-app").dataset.mode = mode;
    q("#fb-tabChat").classList.toggle("on", mode === "chat"); q("#fb-tabChat").setAttribute("aria-selected", mode === "chat");
    q("#fb-tabPics").classList.toggle("on", mode === "pics"); q("#fb-tabPics").setAttribute("aria-selected", mode === "pics");
    q("#fb-tabFlags").classList.toggle("on", mode === "flags"); q("#fb-tabFlags").setAttribute("aria-selected", mode === "flags");
    if (mode === "pics") renderPics();
    if (mode === "flags") renderFlags();
  }
  function openInChat(it) {
    q("#fb-lb").hidden = true;
    S.from = S.to = ""; S.media = "all";
    q("#fb-from").value = ""; q("#fb-to").value = ""; q("#fb-media").value = "all";
    setMode("chat");
    openConv(it.c.id);
    const row = [...q("#fb-thread").querySelectorAll(".fb-row")].find((r) => it.m.id && r.dataset.mid === it.m.id);
    if (row) { row.scrollIntoView({ block: "center" }); row.classList.add("flash"); setTimeout(() => row.classList.remove("flash"), 2200); }
  }


  function renderInfo(c) {
    const box = q("#fb-infoBody");
    box.textContent = "";
    const stat = (k, v) => { const r = el("div", "fb-stat"); r.append(el("span", "", k), el("b", "", v)); box.append(r); };
    stat("Conversation ID", c.id);
    stat("Messages", num(c.msgs.length));
    if (!isNaN(c.first)) { stat("First message", full(c.first)); stat("Last message", full(c.last)); }
    stat("Photos", num(c.img));
    box.append(el("h4", "", "Participants"));
    for (const [u, n] of [...c.users].sort((a, b) => b[1] - a[1])) {
      const r = el("div", "fb-person");
      r.append(avatar(u));
      const f = el("span", "fb-pf");
      const input = el("input"); input.type = "text"; input.value = S.aliases[u] || S.names[u] || ""; input.placeholder = "User " + u;
      input.setAttribute("aria-label", "Display name for user " + u); input.dataset.u = u;
      f.append(input, el("small", "", "ID " + u + " · " + num(n) + " message" + (n === 1 ? "" : "s") + (isSubject(u) ? " · subject account" : "")));
      r.append(f);
      box.append(r);
    }
    box.append(el("p", "fb-hint", "Names are only labels shown on this page. They are kept in this browser and never change the file."));
  }

  /* ------------------------------------------------------------ in-conversation find */
  function updateFind(fresh) {
    const n = S.hits.length;
    q("#fb-findCount").textContent = S.find.trim() ? (n ? (S.hitAt + 1) + " / " + n : "0") : "";
    q("#fb-prev").disabled = q("#fb-next").disabled = !n;
    S.hits.forEach((r, i) => r.classList.toggle("hit", i === S.hitAt));
    if (fresh) {
      if (n) { S.hitAt = n - 1; stepFind(0); } else S.hitAt = -1;
      q("#fb-findCount").textContent = S.find.trim() ? (n ? (S.hitAt + 1) + " / " + n : "0") : "";
    }
  }
  function stepFind(d) {
    const n = S.hits.length;
    if (!n) return;
    S.hitAt = ((S.hitAt + d) % n + n) % n;
    S.hits.forEach((r, i) => r.classList.toggle("hit", i === S.hitAt));
    S.hits[S.hitAt].scrollIntoView({ block: "center" });
    q("#fb-findCount").textContent = (S.hitAt + 1) + " / " + n;
  }

  /* ------------------------------------------------------------ actions */
  function openConv(id) {
    S.cur = id;
    S.find = S.search.trim();
    q("#fb-find").value = S.find;
    q("#fb-app").dataset.view = "chat";
    renderList(); renderChat();
  }
  function renderAll() {
    const loaded = !!S.convs.size;
    q("#fb-app").dataset.loaded = loaded ? "1" : "";
    q("#fb-file").textContent = loaded ? S.fileName + " · " + num(S.msgs.length) + " messages · " + num(S.convs.size) + " conversations" : "No file imported";
    q("#fb-clear").disabled = !loaded;
    q("#fb-export").disabled = !S.cur;
    q("#fb-empty").hidden = loaded;
    q("#fb-app").dataset.view = loaded ? q("#fb-app").dataset.view || "list" : "list";
    q("#fb-picN").textContent = num(S.pics.length);
    q("#fb-tabPics").disabled = !loaded; q("#fb-tabFlags").disabled = !loaded;
    q("#fb-flagN").textContent = num(S.flags.length);
    if (!loaded && S.mode !== "chat") S.mode = "chat";
    renderList(); renderChat(); setMode(S.mode);
  }
  function $subject() {
    const sel = q("#fb-subject");
    sel.textContent = "";
    const users = new Map();
    for (const c of S.convs.values()) for (const [u, n] of c.users) users.set(u, (users.get(u) || 0) + n);
    for (const [u] of [...users].sort((a, b) => b[1] - a[1])) {
      const o = el("option", "", nameOf(u) + (S.aliases[u] || S.names[u] ? " (" + u + ")" : "")); o.value = u; sel.append(o);
    }
    sel.value = S.subject || "";
    q("#fb-subjectWrap").hidden = !users.size;
  }

  function toast(msg) {
    const t = q("#fb-toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 4200);
  }

  function clearAll() {
    S.table = null; S.msgs = []; S.pics = []; S.flags = []; S.flagMap = new Map(); S.convs = new Map(); S.cur = null; S.subject = null; S.fileName = ""; S.map = {};
    S.search = ""; S.from = S.to = ""; S.media = "all"; S.find = "";
    q("#fb-search").value = ""; q("#fb-from").value = ""; q("#fb-to").value = ""; q("#fb-media").value = "all"; q("#fb-find").value = "";
    $subject(); renderAll();
  }

  function readFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => load(String(r.result), file.name);
    r.onerror = () => toast("Could not read that file");
    r.readAsText(file, "utf-8");
  }

  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/plain" }));
    a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function currentMessages() {
    const c = S.convs.get(S.cur); if (!c) return [];
    const from = S.from ? Date.parse(S.from + "T00:00:00Z") : null, to = S.to ? Date.parse(S.to + "T23:59:59Z") : null;
    return c.msgs.filter((m) => (from == null || (!isNaN(m.t) && m.t >= from)) && (to == null || (!isNaN(m.t) && m.t <= to)) &&
      (S.media === "all" || m.image));
  }
  function exportTxt() {
    const c = S.convs.get(S.cur); if (!c) return;
    const lines = ["Facebrowser conversation " + c.id + " — " + convTitle(c), "Source: " + S.fileName, "Exported from the Facebrowser ESW Parser", ""];
    for (const m of currentMessages()) {
      const parts = [];
      if (m.text) parts.push(m.text.replace(/\n/g, "\n    "));
      if (m.image) parts.push("[photo: " + m.image + "]");
      lines.push("[" + (isNaN(m.t) ? m.timeRaw : full(m.t)) + "] " + nameOf(m.user) + (m.id ? " (msg " + m.id + ")" : "") + ": " + parts.join(" "));
    }
    download("facebrowser-" + c.id + ".txt", lines.join("\n") + "\n");
  }
  function exportCsv() {
    const c = S.convs.get(S.cur); if (!c) return;
    const esc = (v) => { v = String(v == null ? "" : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const rows = [["message_id", "conversation_id", "user_id", "sender", "message", "image", "time"]];
    for (const m of currentMessages()) rows.push([m.id, m.conv, m.user, nameOf(m.user), m.text, m.image, isNaN(m.t) ? m.timeRaw : full(m.t)]);
    download("facebrowser-" + c.id + ".csv", "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n") + "\r\n", "text/csv");
  }

  /* ------------------------------------------------------------ events */
  const on = (sel, ev, fn) => q(sel).addEventListener(ev, fn);
  on("#fb-open", "click", () => q("#fb-input").click());
  on("#fb-input", "change", (e) => { readFile(e.target.files[0]); e.target.value = ""; });
  on("#fb-emptyOpen", "click", () => q("#fb-input").click());
  on("#fb-clear", "click", clearAll);
  on("#fb-tabChat", "click", () => setMode("chat"));
  on("#fb-tabPics", "click", () => setMode("pics"));
  on("#fb-tabFlags", "click", () => setMode("flags"));
  on("#fb-fcats", "change", (e) => {
    const cb = e.target.closest("input[data-cat]"); if (!cb) return;
    if (cb.checked) S.flagSel.cats.add(cb.dataset.cat); else S.flagSel.cats.delete(cb.dataset.cat);
    S.flagShown = 150; renderFlags();
  });
  on("#fb-fcats", "click", (e) => {
    const b = e.target.closest("button[data-term]"); if (!b) return;
    S.flagSel.term = S.flagSel.term === b.dataset.term ? "" : b.dataset.term;
    if (S.flagSel.term) S.flagSel.cats.add(S.flagSel.term.split("|")[0]);
    S.flagShown = 150; renderFlags();
  });
  on("#fb-fAll", "click", () => { S.flagSel.cats = new Set(CATS.map((c) => c.key)); S.flagShown = 150; renderFlags(); });
  on("#fb-fNone", "click", () => { S.flagSel.cats = new Set(); S.flagSel.term = ""; renderFlags(); });
  on("#fb-fConv", "change", (e) => { FL.conv = e.target.value; S.flagShown = 150; renderFlags(); });
  on("#fb-fUser", "change", (e) => { FL.user = e.target.value; S.flagShown = 150; renderFlags(); });
  on("#fb-fFrom", "change", (e) => { FL.from = e.target.value; S.flagShown = 150; renderFlags(); });
  on("#fb-fTo", "change", (e) => { FL.to = e.target.value; S.flagShown = 150; renderFlags(); });
  on("#fb-fSort", "change", (e) => { FL.sort = e.target.value; renderFlags(); });
  on("#fb-fCtx", "change", (e) => { FL.ctx = e.target.checked; renderFlags(); });
  on("#fb-fExport", "click", exportFlags);
  on("#fb-pConv", "change", (e) => { picFilter.conv = e.target.value; renderPics(); });
  on("#fb-pUser", "change", (e) => { picFilter.user = e.target.value; renderPics(); });
  on("#fb-pFrom", "change", (e) => { picFilter.from = e.target.value; renderPics(); });
  on("#fb-pTo", "change", (e) => { picFilter.to = e.target.value; renderPics(); });
  on("#fb-pSort", "change", (e) => { picFilter.sort = e.target.value; renderPics(); });
  on("#fb-lbGo", "click", () => { if (S.lbItem) openInChat(S.lbItem); });
  on("#fb-lbX", "click", () => { q("#fb-lb").hidden = true; });
  on("#fb-fab", "click", () => q("#fb-thread").scrollTo({ top: q("#fb-thread").scrollHeight, behavior: "smooth" }));
  on("#fb-thread", "scroll", () => { const t = q("#fb-thread"); q("#fb-fab").hidden = t.scrollHeight - t.scrollTop - t.clientHeight < 400; });
  on("#fb-mapOk", "click", confirmMapping);
  on("#fb-mapCancel", "click", () => { pending = null; q("#fb-mapDlg").hidden = true; });
  on("#fb-paste", "click", () => { q("#fb-pasteDlg").hidden = false; q("#fb-pasteText").focus(); });
  on("#fb-pasteCancel", "click", () => { q("#fb-pasteDlg").hidden = true; });
  on("#fb-pasteOk", "click", () => { const t = q("#fb-pasteText").value; q("#fb-pasteDlg").hidden = true; load(t, "pasted text"); q("#fb-pasteText").value = ""; });
  on("#fb-list", "click", (e) => { const b = e.target.closest(".fb-conv"); if (b) openConv(b.dataset.id); });
  on("#fb-search", "input", (e) => { S.search = e.target.value; renderList(); });
  on("#fb-from", "change", (e) => { S.from = e.target.value; renderList(); renderChat(); });
  on("#fb-to", "change", (e) => { S.to = e.target.value; renderList(); renderChat(); });
  on("#fb-media", "change", (e) => { S.media = e.target.value; renderList(); renderChat(); });
  on("#fb-sort", "change", (e) => { S.sort = e.target.value; renderList(); });
  on("#fb-subject", "change", (e) => { S.subject = e.target.value; store.set("lssd-fb-subject", S.subject); $subject(); renderList(); renderChat(); });
  on("#fb-back", "click", () => { q("#fb-app").dataset.view = "list"; });
  on("#fb-infoBtn", "click", () => { const i = q("#fb-info"); i.hidden = !i.hidden; q("#fb-app").dataset.info = i.hidden ? "" : "1"; });
  on("#fb-infoClose", "click", () => { q("#fb-info").hidden = true; q("#fb-app").dataset.info = ""; });
  on("#fb-infoBody", "change", (e) => {
    const i = e.target.closest("input[data-u]"); if (!i) return;
    const v = i.value.trim();
    if (v) S.aliases[i.dataset.u] = v; else delete S.aliases[i.dataset.u];
    store.set("lssd-fb-aliases", S.aliases);
    $subject(); renderList(); fillPicFilters(); fillFlagFilters(false);
    const keep = S.cur; const th = q("#fb-thread").scrollTop; renderChat(); q("#fb-thread").scrollTop = th; S.cur = keep;
  });
  let ft;
  on("#fb-find", "input", (e) => { clearTimeout(ft); ft = setTimeout(() => { S.find = e.target.value; renderChat(); }, 180); });
  on("#fb-find", "keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); stepFind(e.shiftKey ? -1 : 1); } });
  on("#fb-prev", "click", () => stepFind(-1));
  on("#fb-next", "click", () => stepFind(1));
  on("#fb-jump", "change", (e) => {
    const v = e.target.value; if (!v) return;
    const days = [...q("#fb-thread").querySelectorAll(".fb-day")];
    const t = days.find((d) => d.dataset.day >= v) || days[days.length - 1];
    if (t) t.scrollIntoView({ block: "start" });
  });
  on("#fb-top", "click", () => { q("#fb-thread").scrollTop = 0; });
  on("#fb-bottom", "click", () => { const t = q("#fb-thread"); t.scrollTop = t.scrollHeight; });
  on("#fb-export", "click", (e) => { const m = q("#fb-exportMenu"); m.hidden = !m.hidden; e.stopPropagation(); });
  on("#fb-exTxt", "click", () => { q("#fb-exportMenu").hidden = true; exportTxt(); });
  on("#fb-exCsv", "click", () => { q("#fb-exportMenu").hidden = true; exportCsv(); });
  on("#fb-lb", "click", (e) => { if (e.target.id === "fb-lb" || e.target.id === "fb-lbImg") q("#fb-lb").hidden = true; });
  document.addEventListener("click", (e) => { if (!e.target.closest || !e.target.closest("#fb-exportWrap")) { const m = q("#fb-exportMenu"); if (m) m.hidden = true; } });
  HOST.addEventListener("keydown", (e) => { if (e.key === "Escape") { q("#fb-lb").hidden = true; q("#fb-pasteDlg").hidden = true; pending = null; q("#fb-mapDlg").hidden = true; } });

  // drag and drop a file anywhere on the tool
  let depth = 0;
  const drop = q("#fb-drop");
  HOST.addEventListener("dragenter", (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { depth++; drop.hidden = false; } });
  HOST.addEventListener("dragleave", () => { depth = Math.max(0, depth - 1); if (!depth) drop.hidden = true; });
  HOST.addEventListener("dragover", (e) => e.preventDefault());
  HOST.addEventListener("drop", (e) => { e.preventDefault(); depth = 0; drop.hidden = true; readFile(e.dataTransfer.files[0]); });

  window.FBESW = { load, state: S, confirmMapping };
  renderAll();
})();
