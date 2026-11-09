/* ===== SED: Squad Members (local roster + CSV, feeds the Deployment Log pickers) ===== */
(() => {
  const KEY = "lssd-sed-squad";
  // Order matters: SEB (the bureau above all three) first, then SED, ESD and CSD.
  const DIV = {
    SEB: ["Area Commander", "Unit Commander", "Operations Lieutenant", "Operations Sergeant"],
    SED: ["Probationary Team Member", "Team Member", "Team Scout", "Team Leader", "Detail Commander"],
    ESD: ["Probationary Tactical Medic", "Tactical Medic", "Crew Chief", "Team Leader", "Detail Commander"],
    CSD: ["Probationary Tactical Canine Handler", "Tactical Canine Handler", "Senior Tactical Canine Handler", "Team Leader", "Detail Commander"],
    TT: ["Team Leader", "Detail Commander"],
  };
  // Each assignment carries one departmental rank, so choosing the divisional rank fills in the Rank.
  // Keep in step with RANK_FOR in data/build-roster-csv.py.
  const DS = "Deputy Sheriff", B1 = "Deputy Sheriff (Bonus I)", B2 = "Deputy Sheriff (Bonus II)";
  const RANK_FOR = {
    SEB: { "Area Commander": "Commander", "Unit Commander": "Captain", "Operations Lieutenant": "Lieutenant", "Operations Sergeant": "Sergeant" },
    SED: { "Probationary Team Member": DS, "Team Member": B1, "Team Scout": B2, "Team Leader": "Sergeant", "Detail Commander": "Lieutenant" },
    ESD: { "Probationary Tactical Medic": DS, "Tactical Medic": B2, "Crew Chief": B2, "Team Leader": "Sergeant", "Detail Commander": "Lieutenant" },
    CSD: { "Probationary Tactical Canine Handler": DS, "Tactical Canine Handler": B1, "Senior Tactical Canine Handler": B2, "Team Leader": "Sergeant", "Detail Commander": "Lieutenant" },
    TT: { "Team Leader": "Sergeant", "Detail Commander": "Lieutenant" },
  };
  const rankFor = (div) => { const [u, ...r] = String(div || "").split(":"); return (RANK_FOR[u.trim()] || {})[r.join(":").trim()] || ""; };
  const NAMES = { TT: "Training Team" }; // shown instead of the short code (the code is what the CSV stores, e.g. "TT: Team Leader")
  const nameOfUnit = (u) => NAMES[u] || u;

  const HEAD = ["Name", "Rank", "Divisional Rank"];
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; };
  let members = [];
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) members = r.filter((m) => m && typeof m.name === "string"); } catch (e) { /* storage unavailable */ }
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(members)); } catch (e) { console.warn("Could not save squad:", e); }
    document.dispatchEvent(new CustomEvent("sed-squad-changed"));
  };
  window.__sedSquad = { get: () => members.map((m) => ({ ...m })), label: (m) => [m.rank, m.name].filter(Boolean).join(" ") };

  // "Other" choice: picking it shows a text box beside the list so anything can be typed.
  const OTHER = "__other";
  function otherBox(sel) {
    const box = el("div", "sq-other"), inp = el("input");
    inp.type = "text"; inp.hidden = true; inp.placeholder = "Type it here";
    inp.setAttribute("aria-label", (sel.getAttribute("aria-label") || "Value") + " (typed)");
    sel._inp = inp;
    if (sel.parentNode) sel.replaceWith(box);
    box.append(sel, inp);
    sel.addEventListener("change", () => { inp.hidden = sel.value !== OTHER; if (!inp.hidden) inp.focus(); });
    return box;
  }
  function getVal(sel) { return sel.value === OTHER ? (sel._inp ? sel._inp.value.trim() : "") : sel.value; }
  function setVal(sel, value) {
    const known = !value || [...sel.options].some((o) => o.value === value && o.value !== OTHER);
    sel.value = known ? value || "" : OTHER;
    if (sel._inp) { sel._inp.value = known ? "" : value; sel._inp.hidden = sel.value !== OTHER; }
  }

  function rankSelect(sel, value, blank) {
    sel.replaceChildren();
    if (blank) sel.append(new Option(blank, ""));
    const list = typeof deputyRanks !== "undefined" ? deputyRanks : ["Deputy Sheriff"];
    list.forEach((r) => sel.append(new Option(r, r)));
    sel.append(new Option("Other (type your own)", OTHER));
    setVal(sel, value);
  }
  function divSelect(sel, value, blank) {
    sel.replaceChildren();
    if (blank) sel.append(new Option(blank, ""));
    Object.entries(DIV).forEach(([u, rs]) => {
      const og = document.createElement("optgroup"); og.label = nameOfUnit(u);
      rs.forEach((r) => og.append(new Option(r, u + ": " + r)));
      sel.append(og);
    });
    sel.append(new Option("Other (type your own)", OTHER));
    setVal(sel, value);
  }

  const $n = (i) => document.getElementById(i);
  const PEN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  const MINUS = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
  const iconBtn = (html, label, cls) => { const b = el("button", "sq-ib" + (cls ? " " + cls : "")); b.type = "button"; b.innerHTML = html; b.title = label; b.setAttribute("aria-label", label); return b; };
  const photoOk = new Map(); // url -> true/false once probed
  // Same logic as Character Details: use the MDC picture when it loads, otherwise the blank default avatar.
  function avatar(name) {
    const wrap = el("span", "sq-av"), img = new Image();
    img.alt = ""; img.decoding = "async";
    img.src = typeof PERSON_DEFAULT_PREVIEW === "string" ? PERSON_DEFAULT_PREVIEW : "";
    wrap.append(img);
    if (name.trim() && typeof personImageUrl === "function") {
      const url = personImageUrl(name);
      if (photoOk.get(url) === true) img.src = url;
      else if (photoOk.get(url) !== false) {
        const probe = new Image();
        probe.onload = () => { photoOk.set(url, true); img.src = url; };
        probe.onerror = () => photoOk.set(url, false);
        probe.src = url;
      }
    }
    return wrap;
  }
  const unitOf = (m) => { const u = (m.div || "").split(":")[0]; return DIV[u] ? u : "Other"; };
  const shortDiv = (d) => (d || "").replace(/^\w+:\s*/, "");
  Object.assign(window.__sedSquad, { avatar, unit: unitOf, unitName: nameOfUnit });
  let editing = null;

  function viewRow(m) {
    const row = el("div", "sq-row");
    const info = el("div", "sq-info");
    info.append(el("b", "", m.name), el("small", "", [m.rank, shortDiv(m.div)].filter(Boolean).join(" · ") || "No rank set"));
    const edit = iconBtn(PEN, "Edit " + m.name), del = iconBtn(MINUS, "Remove " + m.name, "danger");
    edit.addEventListener("click", () => { editing = m; render(); });
    del.addEventListener("click", () => {
      if (m.src === "roster") hideRoster(m.name); // a removed roster member stays removed on later refreshes
      members.splice(members.indexOf(m), 1); if (editing === m) editing = null; save(); render();
    });
    row.append(avatar(m.name), info, edit, del);
    return row;
  }
  function editRow(m) {
    const row = el("div", "sq-row editing");
    const name = el("input"); name.type = "text"; name.value = m.name; name.placeholder = "Name Lastname"; name.setAttribute("aria-label", "Name");
    const rank = el("select"); rank.setAttribute("aria-label", "Rank"); const rankBox = otherBox(rank); rankSelect(rank, m.rank, "Select rank");
    const dv = el("select"); dv.setAttribute("aria-label", "Divisional rank"); const dvBox = otherBox(dv); divSelect(dv, m.div, "Select divisional rank");
    dv.addEventListener("change", () => { const r = rankFor(dv.value); if (r) setVal(rank, r); });
    const ok = el("button", "b p", "Save"), no = el("button", "b", "Cancel"); ok.type = no.type = "button";
    const commit = () => {
      if (!name.value.trim()) { toast("Name can't be empty"); return; }
      m.name = name.value.trim(); m.rank = getVal(rank); m.div = getVal(dv); delete m.src; // hand-edited: no longer overwritten by the roster
      editing = null; save(); render();
    };
    ok.addEventListener("click", commit);
    no.addEventListener("click", () => { editing = null; render(); });
    name.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") no.click(); });
    const fields = el("div", "sq-fields"), btns = el("div", "sq-btns");
    fields.append(name, rankBox, dvBox); btns.append(ok, no);
    row.append(avatar(m.name), fields, btns);
    return row;
  }
  function render() {
    const box = $n("sq-list"); if (!box) return;
    $n("sq-count").textContent = String(members.length);
    box.replaceChildren();
    if (!members.length) { box.append(el("p", "f", "No squad members yet. Add one above or import a CSV.")); return; }
    [...Object.keys(DIV), "Other"].forEach((u) => {
      const list = members.filter((m) => unitOf(m) === u);
      if (!list.length) return;
      const grp = el("section", "sq-group"), h = el("h4", "", u === "Other" ? "No division" : nameOfUnit(u));
      h.append(el("span", "", String(list.length)));
      grp.append(h);
      list.forEach((m) => grp.append(m === editing ? editRow(m) : viewRow(m)));
      box.append(grp);
    });
  }

  otherBox($n("sq-rank")); otherBox($n("sq-div"));
  rankSelect($n("sq-rank"), "", "Select rank");
  divSelect($n("sq-div"), "", "Select divisional rank");
  $n("sq-div").addEventListener("change", () => { const r = rankFor($n("sq-div").value); if (r) setVal($n("sq-rank"), r); });
  $n("sq-add").addEventListener("click", () => {
    const name = $n("sq-name").value.trim();
    if (!name) { toast("Enter a name first"); return; }
    members.push({ name, rank: getVal($n("sq-rank")), div: getVal($n("sq-div")) });
    save(); render();
    $n("sq-name").value = ""; setVal($n("sq-rank"), ""); setVal($n("sq-div"), "");
    $n("sq-name").focus();
  });
  $n("sq-name").addEventListener("keydown", (e) => { if (e.key === "Enter") $n("sq-add").click(); });

  const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const toCsv = () => [HEAD.map(q).join(","), ...members.map((m) => [m.name, m.rank, m.div].map(q).join(","))].join("\r\n") + "\r\n";
  function parseCsv(text) {
    const rows = []; let row = [], f = "", inQ = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else inQ = false; } else f += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); f = ""; rows.push(row); row = []; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }
  $n("sq-export").addEventListener("click", () => {
    if (!members.length) { toast("Nothing to export yet"); return; }
    const a = el("a"); a.href = URL.createObjectURL(new Blob([toCsv()], { type: "text/csv;charset=utf-8" }));
    a.download = "sed-squad-members.csv"; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $n("sq-import").addEventListener("click", () => $n("sq-file").click());
  $n("sq-file").addEventListener("change", async (e) => {
    const file = e.target.files[0]; e.target.value = "";
    if (!file) return;
    let rows;
    try { rows = parseCsv(await file.text()); } catch (err) { toast("Could not read that file"); return; }
    if (rows.length && /^name$/i.test((rows[0][0] || "").trim())) rows.shift();
    let added = 0;
    rows.forEach(([name = "", rank = "", div = ""]) => {
      name = name.trim(); rank = rank.trim(); div = div.trim();
      if (!name) return;
      if (members.some((m) => m.name === name && m.rank === rank && m.div === div)) return;
      members.push({ name, rank, div }); added++;
    });
    save(); render();
    toast(added ? "Imported " + added + (added === 1 ? " member" : " members") : "No new members found");
  });

  // ---- roster snapshot (data/sed-roster.csv) ----
  // A snapshot of the SOD roster (ESD, CSD and SED) shipped with the site. Each visit refreshes the entries that came
  // from it, leaves anything added or edited by hand alone, and keeps removed people removed.
  const HIDE_KEY = "lssd-sed-squad-hidden";
  const hiddenNames = () => { try { return new Set(JSON.parse(localStorage.getItem(HIDE_KEY)) || []); } catch (e) { return new Set(); } };
  function hideRoster(name) {
    const h = hiddenNames(); h.add(name.trim().toLowerCase());
    try { localStorage.setItem(HIDE_KEY, JSON.stringify([...h])); } catch (e) { /* storage unavailable */ }
  }
  let rosterBusy = false;
  async function syncRoster() {
    if (rosterBusy) return; rosterBusy = true;
    try {
      const res = await fetch("data/sed-roster.csv", { cache: "no-cache" });
      if (!res.ok) return;
      const rows = parseCsv(await res.text());
      if (rows.length && /^name$/i.test((rows[0][0] || "").trim())) rows.shift();
      // One-time catch-up per release: a person saved by hand (an imported CSV, or an old copy) with the same name AND the
      // same divisional rank as the roster is just a stale copy, so it goes back to following the roster. People whose
      // assignment was changed on purpose are left alone. Only this list is touched, never Character Details.
      const REV = "2.3.9", REV_KEY = "lssd-sed-squad-rev";
      let seen = ""; try { seen = localStorage.getItem(REV_KEY) || ""; } catch (e) { /* storage unavailable */ }
      if (seen !== REV) {
        const byName = new Map(rows.map(([n = "", , d = ""]) => [n.trim().toLowerCase(), d.trim()]));
        members.forEach((m) => { if (m.src !== "roster" && byName.get(m.name.trim().toLowerCase()) === (m.div || "").trim()) m.src = "roster"; });
        try { localStorage.setItem(REV_KEY, REV); } catch (e) { /* storage unavailable */ }
      }
      const hidden = hiddenNames(), mine = new Set(members.filter((m) => m.src !== "roster").map((m) => m.name.trim().toLowerCase()));
      const fresh = rows.map(([name = "", rank = "", div = ""]) => ({ name: name.trim(), rank: rankFor(div) || rank.trim(), div: div.trim(), src: "roster" }))
        .filter((m) => m.name && !hidden.has(m.name.toLowerCase()) && !mine.has(m.name.toLowerCase()));
      const before = JSON.stringify(members);
      members = members.filter((m) => m.src !== "roster").concat(fresh);
      if (JSON.stringify(members) !== before) { save(); render(); }
    } catch (e) { /* offline or opened from a file: keep whatever is saved */ }
    finally { rosterBusy = false; }
  }

  render();
  syncRoster();
  const baseShow = window.show;
  window.show = function (k) { baseShow.apply(this, arguments); if (k === "sed-squad") { render(); syncRoster(); } };
})();

/* ===== Deployment Log: one field per person; type anything, or open the list to pick a squad member ===== */
(() => {
  const TARGETS = [["sed-ic", false], ["sed-tc", false], ["sed-scout", false], ["sed-personnel", true]];
  const combos = TARGETS.map(([id, append]) => {
    const t = document.getElementById(id); if (!t) return null;
    const wrap = document.createElement("div"); wrap.className = "sed-combo";
    t.parentNode.insertBefore(wrap, t); wrap.append(t);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "sed-combo-btn";
    btn.setAttribute("aria-label", "Pick from Squad Members"); btn.title = "Pick from Squad Members";
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    const list = document.createElement("div"); list.className = "sed-combo-list"; list.hidden = true; list.setAttribute("role", "listbox");
    wrap.append(btn, list);
    if (append) {
      wrap.classList.add("multi");
      btn.className = "b sed-combo-add";
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Add from Squad Members</span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
      wrap.insertBefore(btn, t);
    }
    return { t, append, wrap, btn, list };
  }).filter(Boolean);

  const closeAll = (except) => combos.forEach((c) => { if (c !== except) c.list.hidden = true; });
  function open(c, filter) {
    const q = (filter || "").trim().toLowerCase();
    const items = window.__sedSquad.get().filter((m) => !q || window.__sedSquad.label(m).toLowerCase().includes(q));
    c.list.replaceChildren();
    if (!items.length) {
      const e = document.createElement("div"); e.className = "sed-combo-empty";
      e.textContent = window.__sedSquad.get().length ? "No match. Keep typing to use it as written." : "No squad members saved yet.";
      c.list.append(e);
    }
    const ORDER = ["SEB", "SED", "ESD", "CSD", "TT", "Other"];
    items.sort((a, b) => ORDER.indexOf(window.__sedSquad.unit(a)) - ORDER.indexOf(window.__sedSquad.unit(b)));
    let lastUnit = null;
    items.forEach((m) => {
      const u = window.__sedSquad.unit(m);
      if (u !== lastUnit) {
        lastUnit = u;
        const h = document.createElement("div"); h.className = "sed-combo-grp"; h.textContent = u === "Other" ? "No division" : window.__sedSquad.unitName(u);
        c.list.append(h);
      }
      const o = document.createElement("button"); o.type = "button"; o.className = "sed-combo-opt"; o.setAttribute("role", "option");
      const b = document.createElement("b"); b.textContent = window.__sedSquad.label(m);
      const sm = document.createElement("small"); sm.textContent = (m.div || "").replace(/^\w+:\s*/, "");
      o.dataset.text = window.__sedSquad.label(m);
      const tx = document.createElement("span"); tx.className = "sed-opt-t"; tx.append(b, sm);
      o.append(tx, window.__sedSquad.avatar(m.name));
      o.addEventListener("mousedown", (e) => e.preventDefault());
      o.addEventListener("click", () => {
        const text = o.dataset.text;
        if (c.append) {
          // multi-select: the list stays open; clicking an added person again takes them back out
          const ls = c.t.value.split(/\r?\n/);
          const at = ls.findIndex((l) => l.trim() === text);
          if (at >= 0) ls.splice(at, 1); else ls.push(text);
          c.t.value = ls.filter((l) => l.trim()).join("\n");
          marks(c);
        } else {
          c.t.value = text;
          c.list.hidden = true;
          c.t.focus();
        }
        c.t.dispatchEvent(new Event("input", { bubbles: true }));
      });
      c.list.append(o);
    });
    if (c.append) {
      const done = document.createElement("button"); done.type = "button"; done.className = "b p sed-combo-done"; done.textContent = "Done";
      done.addEventListener("click", () => { c.list.hidden = true; });
      c.list.append(done); marks(c);
    }
    closeAll(c); c.list.hidden = false;
  }
  function marks(c) {
    const have = new Set(c.t.value.split(/\r?\n/).map((l) => l.trim()));
    c.list.querySelectorAll(".sed-combo-opt").forEach((o) => o.classList.toggle("on", have.has(o.dataset.text)));
  }
  combos.forEach((c) => {
    c.btn.addEventListener("click", () => { if (c.list.hidden) open(c, ""); else c.list.hidden = true; });
    if (!c.append) {
      c.t.addEventListener("focus", () => open(c, ""));
      c.t.addEventListener("input", () => { if (document.activeElement === c.t) open(c, c.t.value); });
    }
    if (c.append) c.t.addEventListener("input", () => marks(c));
    c.t.addEventListener("keydown", (e) => { if (e.key === "Escape") c.list.hidden = true; });
  });
  document.addEventListener("mousedown", (e) => { if (!e.target.closest(".sed-combo")) closeAll(); });
})();
