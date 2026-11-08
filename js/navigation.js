(() => {
  const G = [
    ["Patrol Reports", [
      ["arrest-report", "Arrest Report", "Document an arrest: charges, sentencing, bail and narrative."],
      ["incident", "Incident Report", "Fill in an incident report."],
      ["supp", "Supplemental Report", "Add a supplemental to an incident report."],
      ["task-list", "Task List", "Establish clear tasks and who handles them on an incident report."],
      ["subject", "Subject Information", "Document subjects."],
      ["tc", "Traffic Collision Report", "Document a traffic collision."],
      ["trespass", "Trespass Notice", "Issue a formal trespass notice for a property."],
      ["impound", "Impound Report", "Generate a vehicle impound report."],
      ["uof", "Use of Force Report", "Document a use of force."],
      ["uof-supp", "Supplemental Use of Force Report", "Add a supplemental to a use of force report."],
      ["king-patrol", "King Patrol Report", "Log a King Patrol report."],
      ["apb", "APB", "Build an APB bulletin."],
      ["sheriff", "Sheriff's Report", "Unofficial report. Use with caution."]]],
    ["Warrant Services", [
      ["arrest-warrant", "Arrest Warrant", "Draft an arrest warrant."],
      ["search-warrant", "Search Warrant", "Draft a search warrant."],
      ["electronic-surveillance-warrant", "Electronic Surveillance Warrant", "Draft a surveillance warrant."],
      ["financial-service-warrant", "Financial Service Warrant Request", "Draft a financial service warrant request."]]],
    ["Generators", [
      ["card", "Business Card Generator", "Design your business card and download it as a PNG."],
      ["depmail", "Email Template", "Departmental email in the official depmail BBCode format."],
      ["email", "Correspondence", "Departmental correspondence in the official BBCode format."]]],
    ["Bureaus", []],
    ["Administration", [
      ["notices", "Bonus Assignments, Bonus Removals", "Notices of bonus assignment and bonus removal."],
      ["notices-commendations", "Commendations", "Commendation report for awards and commendations."]]],
    ["Miscellaneous", [
      ["deputy", "Character Details", "Save your name, badge, rank and optional callsign to prefill forms."],
      ["updates", "Release Notes", "See what's new on this site."]]],
  ];
  // Bureaus: division > unit > forms.  form = [key, title, description, group label, short title]
  const BU = [
    { n: "Central Patrol Division", id: "central", u: [
      { id: "davis", n: "Davis Station", a: "", f: [["davis-k9-deployment", "Davis K9 Deployment Log", "Davis Station K9 Team.", "K9", "Deployment Log"], ["davis-citation", "TSD Citation", "Traffic Services Detail citation.", "TSD", "Citation"]] },
      { id: "senora", n: "Senora Station", a: "", f: [["senora-logbook", "Senora Station Logbook", "Log an incident for Senora Station.", "", "Logbook"], ["nccit", "NCCIT Personnel File", "North County Crime Impact Team.", "NCCIT", "Personnel File"], ["nccit-supp", "NCCIT Supplemental", "North County Crime Impact Team.", "NCCIT", "Supplemental"], ["senora-k9-deployment", "K9 Deployment Log", "Senora Station K9 Team.", "K9", "Deployment Log"], ["citation", "TSD Citation", "Traffic Services Detail citation.", "TSD", "Citation"]] },
    ] },
    { n: "Special Operations Division", id: "special-ops", u: [
      { id: "csd", n: "Canine Services Detail", a: "CSD", f: [["csd-k9-deployment", "CSD K9 Deployment Log", "Canine Services Detail K9 deployment report.", "K9", "Deployment Log"], ["csd-training-log", "CSD Training Log", "Canine Services Detail training schedule.", "", "Training Log"]] },
      { id: "esd", n: "Emergency Services Detail", a: "ESD", f: [] },
      { id: "sed", n: "Special Enforcement Detail", a: "SED", f: [] },
      { id: "aero", n: "Aero Bureau", a: "Aero Bureau", f: [] },
    ] },
    { n: "Detective Division", id: "detective", u: [
      { id: "mcb", n: "Major Crimes Bureau", a: "MCB", f: [["mcb-poi", "Person of Interest File", "Major Crimes Bureau person of interest file.", "", "Person of Interest"], ["mcb-case", "MCB Case Package", "Major Crimes Bureau case package.", "", "Case Package"], ["mcb-supplemental", "MCB Supplemental Report", "Major Crimes Bureau supplemental report.", "", "Supplemental"]] },
      { id: "nb", n: "Narcotics Bureau", a: "NB", f: [["nb-poi", "Person of Interest File", "Narcotics Bureau person of interest file.", "", "Person of Interest"]] },
      { id: "hb", n: "Homicide Bureau", a: "HB", f: [["hb-poi", "Person of Interest File", "Homicide Bureau person of interest file.", "", "Person of Interest"], ["hb-case", "HB Case Package", "Homicide Bureau case package.", "", "Case Package"], ["hb-supplemental", "HB Supplemental Report", "Homicide Bureau supplemental report.", "", "Supplemental"]] },
      { id: "ossb", n: "Operation Safe Streets Bureau", a: "OSSB", f: [["ossb-poi", "Person of Interest File", "Operation Safe Streets Bureau person of interest file.", "", "Person of Interest"], ["oss-incident", "OSS Case Package", "Operation Safe Streets Bureau case package.", "", "Case Package"], ["oss-supplemental", "OSS Supplemental", "Operation Safe Streets Bureau supplemental report.", "", "Supplemental"]] },
    ] },
    { n: "Personnel Command", id: "personnel", u: [
      { id: "peu", n: "Pre-Employment Unit", a: "PEU", f: [["peu-letters", "PEU Applicant Letters", "Deputy Sheriff Trainee hiring letters: application, written test and academy.", "", "Applicant Letters"], ["peu-admin", "PEU Administrative File", "Thread title with status tag and the applicant administrative file.", "", "Administrative File"]] },
      { id: "ftp", n: "Field Training Program", a: "FTP", f: [["ftp-phase1", "Phase 1 Patrol Summary", "Document a trainee's Phase 1 observations and delivered knowledge.", "", "Phase 1 Patrol Summary"], ["ftp-phase2", "Phase 2 Report", "Field Training Observational Report with ratings for Phase 2.", "", "Phase 2 Report"], ["ftp-phase3", "Phase 3 Evaluation", "Field Training Evaluation Report for Phase 3.", "", "Phase 3 Evaluation"], ["ftp-fto-eval", "FTO Evaluation Patrol Report", "Field Training Program FTO evaluation patrol report.", "", "FTO Evaluation Patrol Report"]] },
    ] },
    { n: "Professional Standards Bureaus", id: "standards", u: [
      { id: "sib", n: "Sheriff's Information Bureau", a: "SIB", f: [["sib-story", "SIB Story", "Write a news release story for SIB.", "", "Story"], ["sib-activity", "SIB Activity Tracker", "Log an SIB activity for the tracker.", "", "Activity Tracker"]] },
      { id: "iab", n: "Internal Affairs Bureau", a: "IAB", f: [["iab-prelim", "UOF - Preliminary Review", "Preliminary review of a use of force incident.", "", "UOF - Preliminary Review"]] },
      { id: "csb", n: "Court Services Bureau", a: "CSB", f: [] },
    ] },
    { n: "Technology & Support Division", id: "tech", u: [
      { id: "ssb", n: "Scientific Services Bureau", a: "SSB", f: [["forensic-lab", "Forensic Lab Workspace", "Sessions, evidence identifiers, evidence records and every SSB lab report.", "CSIU", "Forensic Lab Workspace"], ["lab", "Laboratory Services Request", "Request lab services for evidence.", "CSIU", "Laboratory Services Requests"], ["dforensics", "Digital Forensics Request", "Request digital forensics on evidence.", "DFU", "Digital Forensics Requests"]] },
      { id: "cfmb", n: "Communications & Fleet Management Bureau", a: "CFMB", f: [["fleet", "Fleet Maintenance Request", "Request service for a vehicle by plate.", "FMU", "Fleet Maintenance Requests"]] },
      { id: "psb", n: "Psychological Services Bureau", a: "PSB", f: [["cfid", "Crisis and Field Intervention Database", "Mental Evaluation Team crisis and field intervention record.", "", "CFID"], ["met-incident", "MET Incident Report", "Mental Evaluation Team incident report with request and victim details.", "", "MET Incident Report"]] },
      { id: "vst", n: "Veterinary Services Team", a: "VST", f: [["k9-checkup", "K9 Checkup Card", "First checkup, follow-up checkup or medical test card for a K9.", "", "K9 Checkup Card"], ["k9-emc", "K9 Emergency Medical Care Report", "Emergency medical care report for a K9.", "", "K9 Emergency Care"], ["vet-lab-report", "Laboratory Services Report", "Autopsy, biopsy and blood screening reports.", "", "Laboratory Services Report"], ["vst-request", "Veterinary Services Request", "Request veterinary services for a K9.", "", "Veterinary Services Requests"]] },
    ] },
  ];
  const buForms = BU.flatMap((d) => d.u.flatMap((u) => u.f.map((f) => ({ f, d, u }))));
  G.find((x) => x[0] === "Bureaus")[1] = buForms.map(({ f }) => [f[0], f[1], f[2]]);
  const info = {};
  G.forEach(([g, items]) => items.forEach(([k, t, d]) => (info[k] = { g, t, d })));
  buForms.forEach(({ f, d, u }) => (info[f[0]].g = d.n + " \u00b7 " + u.n));
  // Sidebar counters come from the same data as the home page, so they can never go stale.
  (() => {
    const set = (id, n) => { const b = document.getElementById(id); const c = b && b.querySelector(".bu-n"); if (c) c.textContent = n; };
    BU.forEach((d) => {
      set("nv-bu-" + d.id, d.u.reduce((t, u) => t + u.f.length, 0));
      d.u.forEach((u) => set("nv-bu-" + u.id, u.f.length));
    });
    const gc = document.querySelector(".nav-group.bureaus .grp-count");
    if (gc) gc.textContent = buForms.length;
  })();
  info.credits = { g: "About", t: "Credits", d: "Who made this site, and why." };
  let buSel = "central";
  const RK = "lssd-recent", base = window.show;
  const recents = () => { try { return JSON.parse(localStorage.getItem(RK)) || []; } catch (e) { return []; } };
  const remember = (k) => {
    try { localStorage.setItem(RK, JSON.stringify([k, ...recents().filter((x) => x !== k)].slice(0, 3))); }
    catch (e) { console.warn("Could not save recent forms:", e); }
  };
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; };
  const open = (k) => () => show(k);

  // form key -> sidebar unit id for seal image, or monogram text (home-menu style)
  const SEAL = {
    sheriff: { mono: "LSSD" },
    "arrest-report": { mono: "ARR" },
    incident: { mono: "IR" },
    supp: { mono: "SUP" },
    "uof-supp": { mono: "UOF" },
    notices: { mono: "NB" },
    "notices-commendations": { mono: "NB" },
    "iab-prelim": { unit: "iab", mono: "IAB" },
    "task-list": { mono: "TASK" },
    subject: { mono: "SUBJ" },
    tc: { mono: "TC" },
    trespass: { mono: "TRES" },
    impound: { mono: "IMP" },
    uof: { mono: "UOF" },
    "king-patrol": { mono: "KING" },
    apb: { mono: "APB" },
    "arrest-warrant": { mono: "A/W" },
    "search-warrant": { mono: "S/W" },
    "electronic-surveillance-warrant": { mono: "ESW" },
    "financial-service-warrant": { mono: "FSW" },
    card: { mono: "CARD" },
    depmail: { mono: "MAIL" },
    email: { mono: "CORR" },
    deputy: { mono: "ID" },
    updates: { mono: "NEW" },
    "mcb-poi": { unit: "mcb", mono: "MCB" },
    "mcb-case": { unit: "mcb", mono: "MCB" },
    "mcb-supplemental": { unit: "mcb", mono: "MCB" },
    "nb-poi": { unit: "nb", mono: "NB" },
    "hb-poi": { unit: "hb", mono: "HB" },
    "hb-case": { unit: "hb", mono: "HB" },
    "hb-supplemental": { unit: "hb", mono: "HB" },
    "ossb-poi": { unit: "ossb", mono: "OSSB" },
    "oss-incident": { unit: "ossb", mono: "OSSB" },
    "oss-supplemental": { unit: "ossb", mono: "OSSB" },
    "davis-k9-deployment": { unit: "davis-k9", mono: "K9" },
    "senora-logbook": { unit: "senora", mono: "SEN" },
    nccit: { unit: "senora-nccit", mono: "NCCIT" },
    "nccit-supp": { unit: "senora-nccit", mono: "NCCIT" },
    "senora-k9-deployment": { unit: "senora-k9", mono: "K9" },
    citation: { unit: "senora-tsd", mono: "TSD" },
    "davis-citation": { unit: "davis-tsd", mono: "TSD" },
    "csd-k9-deployment": { unit: "csd", mono: "CSD" },
    "csd-training-log": { unit: "csd", mono: "CSD" },
    "ftp-phase1": { unit: "ftp", mono: "FTP" },
    "ftp-phase2": { unit: "ftp", mono: "FTP" },
    "ftp-phase3": { unit: "ftp", mono: "FTP" },
    "ftp-fto-eval": { unit: "ftp", mono: "FTP" },
    "peu-letters": { unit: "peu", mono: "PEU" },
    "peu-admin": { unit: "peu", mono: "PEU" },
    "sib-story": { unit: "sib", mono: "SIB" },
    "sib-activity": { unit: "sib", mono: "SIB" },
    lab: { unit: "ssb", mono: "SSB" },
    dforensics: { unit: "ssb", mono: "SSB" },
    fleet: { unit: "cfmb", mono: "CFMB" },
    "vst-request": { unit: "vst", mono: "VST" },
    "k9-emc": { unit: "vst", mono: "VST" },
    "k9-checkup": { unit: "vst", mono: "VST" },
    "vet-lab-report": { unit: "vst", mono: "VST" },
    "forensic-lab": { unit: "ssb", mono: "SSB" },
    cfid: { unit: "psb", mono: "PSB" },
    "met-incident": { unit: "psb", mono: "PSB" },
  };
  function setFormSeal(k) {
    const seal = $("top-seal"), img = $("top-seal-img"), mono = $("top-seal-mono");
    if (!seal || !img || !mono) return;
    const conf = SEAL[k] || { mono: "LSSD" };
    let src = "";
    if (conf.unit) {
      const elImg = document.querySelector("#nv-bu-" + conf.unit + " img.bu-ico");
      if (elImg && elImg.getAttribute("src")) src = elImg.getAttribute("src");
    }
    if (!src && conf.src) src = conf.src;
    // department forms without a bureau seal reuse the LSSD badge
    if (!src && !conf.unit) {
      const logo = document.querySelector(".brand .logo");
      if (logo && logo.getAttribute("src")) src = logo.getAttribute("src");
    }
    mono.textContent = conf.mono || "LSSD";
    if (src) {
      img.onload = () => { seal.classList.add("has-img"); img.hidden = false; };
      img.onerror = () => { seal.classList.remove("has-img"); img.hidden = true; img.removeAttribute("src"); };
      if (img.getAttribute("src") !== src) img.src = src;
      else { seal.classList.add("has-img"); img.hidden = false; }
    } else {
      seal.classList.remove("has-img");
      img.hidden = true;
      img.removeAttribute("src");
    }
  }
  window.show = function (k) {
    base(k);
    document.body.dataset.view = k;
    const m = info[k];
    $("crumb").textContent = m ? m.g : "Paperwork";
    $("lede").textContent = m ? m.d : "";
    setFormSeal(k);
    if (k === "home") renderHome(); else if (k !== "credits") remember(k);
    window.scrollTo(0, 0);
  };

  function renderHome() {
    const d = typeof deputyDetails === "object" ? deputyDetails : {};
    const name = (d.fullName || "").trim(), last = name.split(/\s+/).pop();
    $("hello").textContent = name ? "Welcome back, " + ((d.rank || "").trim() ? d.rank.trim() + " " : "") + last + "." : "Welcome to the paperwork desk.";
    updateHomeBadge(name);
    $("setup").hidden = Object.values(d).some((v) => String(v).trim());
    const rc = recents().filter((k) => info[k]).slice(0, 3), rl = $("recent-list");
    rl.replaceChildren(...rc.map((k) => { const c = el("button", "chip", info[k].t); c.type = "button"; c.onclick = open(k); return c; }));
    $("recent").hidden = !rc.length;
    const box = $("home-groups");
    if (!box.children.length) {
      const AREA = { "Patrol Reports": "patrol", "Warrant Services": "warrant", "Bureaus": "bureaus", "Administration": "notice", "Generators": "gen", "Miscellaneous": "misc" };
      const tile = ([k, t, desc, path], g) => {
        const b = withIcon(el("button", "tile"), t, k); b.type = "button"; b.onclick = open(k);
        b.title = desc;
        b.dataset.title = [g, t, ...(path || [])].join(" ").toLowerCase();
        return b;
      };
      const tiles = (list, g) => { const grid = el("div", "tiles"); list.forEach((it) => grid.append(tile(it, g))); return grid; };
      G.forEach(([g, items]) => {
        if (g === "Bureaus") { box.append(bureauSection(items.length)); return; }
        const sec = el("section"); sec.dataset.g = g; if (AREA[g]) sec.dataset.a = AREA[g];
        const h = el("h3", "home-h", g); h.prepend(svgIc("hh-ic", PANEL_IC[g])); h.append(el("span", "", String(items.length)));
        sec.append(h);
        if (!items.some((it) => it[3])) { sec.append(tiles(items, g)); box.append(sec); return; }
        // Station panel > division columns > forms
        const dvs = new Map();
        items.forEach((it) => {
          const dv = it[3][0];
          if (!dvs.has(dv)) dvs.set(dv, []);
          dvs.get(dv).push(it);
        });
        const cols = el("div", "home-divs");
        dvs.forEach((list, dv) => {
          const col = el("div", "home-sub home-div");
          col.append(el("h5", "home-div-h" + (dv ? "" : " plain"), dv || "Station"));
          const grid = el("div", "tiles");
          list.forEach((it) => {
            const b = tile(it, g);
            b.textContent = it[3][1] || it[1];
            b.title = it[1] + " \u2014 " + it[2];
            grid.append(b);
          });
          col.append(grid); cols.append(col);
        });
        sec.append(cols); box.append(sec);
      });
    }
    $("hq").value = ""; filterHome("");
    fitHome();
  }
  // Bureaus panel: one tab per division, only the selected division is shown (all of them while searching)
  function selectBu(sec, id) {
    buSel = id;
    sec.querySelectorAll(".bu-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.d === id)));
    sec.querySelectorAll(".bu-pane").forEach((p) => p.classList.toggle("on", p.dataset.d === id));
  }
  // line icons for panels and forms (inline SVG, no external images)
  const IC = {
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    filePlus: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 12v6M9 15h6"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    car: '<path d="M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1.5"/><path d="M7 20v1M17 20v1"/>',
    alert: '<path d="M12 3l9.5 16.5h-19z"/><path d="M12 10v4M12 17h.01"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    mega: '<path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
    scales: '<path d="M12 3v18M6 21h12M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.5-4.5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2a2.6 2 0 0 0-2.5-1.4c-1.4 0-2.5.8-2.5 1.9s1 1.6 2.5 1.9 2.5.8 2.5 1.9-1.1 1.9-2.5 1.9a2.6 2 0 0 1-2.5-1.4M12 6v1.8M12 16.2V18"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h6M7 14h4M16 10h1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    send: '<path d="M21 3L3 11l7 3 3 7z"/><path d="M10 14l5-5"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c0-1.5 1.5-2 3-2s3 .5 3 2M15 10h3M15 14h3"/>',
    spark: '<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    bank: '<path d="M3 9l9-5 9 5M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',
  };
  const FORM_IC = { sheriff: "shield", "arrest-report": "shield", incident: "file", supp: "filePlus", "uof-supp": "filePlus", "task-list": "list", subject: "user", tc: "car", trespass: "ban", impound: "car", uof: "alert",
    "king-patrol": "crown", apb: "mega", "arrest-warrant": "scales", "search-warrant": "search", "electronic-surveillance-warrant": "eye",
    "financial-service-warrant": "coin", card: "card", notices: "crown", "notices-commendations": "spark", depmail: "mail", email: "send", deputy: "id", updates: "spark" };
  const PANEL_IC = { "Patrol Reports": "shield", "Warrant Services": "scales", Generators: "layers", Miscellaneous: "grid", Bureaus: "bank", Administration: "id" };
  const svgIc = (cls, name) => {
    const i = el("i", cls); i.setAttribute("aria-hidden", "true");
    i.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[name] || IC.file) + "</svg>";
    return i;
  };
  const withIcon = (b, text, k) => { b.textContent = ""; b.append(svgIc("tl-ic", FORM_IC[k]), el("span", "tl-t", text)); return b; };
  // icon for a unit / sub-group: reuses the image already used in the sidebar menu (#nv-bu-<id> .bu-ico)
  function buIco(id, text, size, mono) {
    const wrap = el("span", "bu-ic " + size), s = document.querySelector("#nv-bu-" + id + " img.bu-ico");
    const fb = () => {
      if (!mono) { wrap.remove(); return; }
      wrap.replaceChildren(el("b", "", text)); wrap.classList.add("mono");
    };
    if (s) {
      const i = new Image(); i.alt = ""; i.referrerPolicy = "no-referrer"; i.decoding = "async";
      i.onerror = fb; i.src = s.getAttribute("src"); wrap.append(i);
    } else if (mono) fb(); else return null;
    return wrap;
  }
  const buMono = (u) => (u.a && u.a.length <= 5 ? u.a : u.n.split(/[\s&]+/).filter(Boolean).map((w) => w[0]).join("")).slice(0, 4).toUpperCase();
  const SUB_FULL = { CSIU: "Crime Scene Investigation Unit", DFU: "Digital Forensics Unit", FMU: "Fleet Management Unit" }; // sub-categories shown with their full name
  function bureauSection(count) {
    const sec = el("section", "bu-home"); sec.dataset.g = "Bureaus"; sec.dataset.a = "bureaus";
    const h = el("h3", "home-h", "Bureaus"); h.prepend(svgIc("hh-ic", "bank")); h.append(el("span", "", String(count))); sec.append(h);
    const layout = el("div", "bu-layout");
    const tabs = el("div", "bu-tabs"); tabs.setAttribute("role", "tablist"); tabs.setAttribute("aria-label", "Divisions");
    const panes = el("div", "bu-panes");
    BU.forEach((d) => {
      const n = d.u.reduce((s, u) => s + u.f.length, 0);
      const tab = el("button", "bu-tab" + (n ? "" : " idle")); tab.type = "button"; tab.dataset.d = d.id;
      tab.setAttribute("role", "tab"); tab.append(el("span", "", d.n));
      tab.append(n ? el("em", "", String(n)) : el("span"));
      const stack = el("span", "bu-stack");
      d.u.forEach((u) => { const ic = buIco(u.id, "", "sm", false); if (ic && stack.children.length < 6) stack.append(ic); });
      if (stack.children.length) tab.append(stack);
      tab.onclick = () => selectBu(sec, d.id);
      tabs.append(tab);
      const pane = el("div", "bu-pane"); pane.dataset.d = d.id; pane.setAttribute("role", "tabpanel");
      const ph = el("h4", "bu-pane-h", d.n);
      ph.append(el("small", "", (n ? n + (n === 1 ? " form" : " forms") + " \u00b7 " : "No forms yet \u00b7 ") + d.u.length + (d.u.length === 1 ? " unit" : " units")));
      pane.append(ph);
      const grid = el("div", "bu-units"), idle = [];
      d.u.forEach((u) => {
        if (!u.f.length) { idle.push(u); return; }
        const card = el("div", "bu-unit"), uh = el("div", "bu-unit-h"), ut = el("div", "bu-unit-t");
        uh.append(buIco(u.id, buMono(u), "lg", true));
        ut.append(el("b", "", u.a || u.n)); if (u.a) ut.append(el("small", "", u.n));
        uh.append(ut, el("em", "", String(u.f.length)));
        card.append(uh);
        let last = null, grid2 = null;
        u.f.forEach(([k, t, desc, lab, short]) => {
          if (lab !== last || !grid2) {
            last = lab;
            if (lab) {
              const lb = el("div", "bu-lab"), li = buIco(u.id + "-" + lab.toLowerCase(), "", "sm", false);
              if (li) lb.append(li);
              lb.append(el("span", "", lab));
              if (SUB_FULL[lab]) lb.append(el("small", "", SUB_FULL[lab]));
              card.append(lb);
            }
            grid2 = el("div", "tiles"); card.append(grid2);
          }
          const b = withIcon(el("button", "tile"), lab ? short : t, k); b.type = "button"; b.onclick = open(k);
          b.title = t + " \u2014 " + desc;
          b.dataset.title = ["Bureaus", d.n, u.n, u.a, lab, t, short].join(" ").toLowerCase();
          grid2.append(b);
        });
        grid.append(card);
      });
      if (grid.children.length) pane.append(grid);
      if (idle.length) {
        const row = el("div", "bu-idle"), list = el("div", "bu-idle-list");
        row.append(el("b", "", grid.children.length ? "No forms yet" : "No forms in this division yet"));
        idle.forEach((u) => { const c = el("span"); c.append(buIco(u.id, buMono(u), "sm", true), u.a || u.n); c.title = u.n; list.append(c); });
        row.append(list); pane.append(row);
      }
      panes.append(pane);
    });
    layout.append(tabs, panes); sec.append(layout);
    selectBu(sec, buSel);
    return sec;
  }
  // vertically center the home content: equal space above and below
  function fitHome() {
    const f = $("f-home"), w = $("home-fit");
    if (!f || !w || f.hidden || !f.offsetParent && !document.body.classList.contains("homefit")) return;
    const on = innerWidth > 760;                       // phones keep the normal scrolling page
    document.body.classList.toggle("homefit", on);
    if (!on) { w.style.removeProperty("width"); w.style.removeProperty("transform"); return; }
    const searching = !!$("hq").value.trim();
    const padX = Math.round(Math.max(16, Math.min(44, innerWidth * 0.035))), padY = 14;
    const W = f.clientWidth - 2 * padX, H = f.clientHeight - 2 * padY;
    const panes = [...w.querySelectorAll(".bu-pane")], keep = buSel, sec = w.querySelector(".bu-home");
    // height of the content at scale s; with the Bureaus tabs, the tallest division decides so the scale never jumps
    const hAt = (s) => {
      w.style.width = W / s + "px";
      if (searching || !panes.length) return w.offsetHeight * s;
      let m = 0;
      panes.forEach((p) => { panes.forEach((q) => q.classList.toggle("on", q === p)); m = Math.max(m, w.offsetHeight); });
      return m * s;
    };
    const MIN = 0.55, MAX = 1.5;
    let s = 1;
    if (!searching) {
      if (hAt(MAX) <= H) s = MAX;
      else if (hAt(MIN) > H) s = MIN;
      else { let lo = MIN, hi = MAX; for (let i = 0; i < 11; i++) { const m = (lo + hi) / 2; if (hAt(m) <= H) lo = m; else hi = m; } s = lo; }
    }
    const h = hAt(s);
    if (sec) selectBu(sec, keep);
    const fits = !searching && h <= H + 1;
    f.style.overflowY = fits ? "hidden" : "auto";
    const y = fits ? Math.max(padY, Math.floor((f.clientHeight - h) / 2)) : padY;
    w.style.transform = "translate(" + padX + "px," + y + "px) scale(" + s + ")";
  }
  let fitRaf = 0;
  const fitSoon = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitHome); };
  addEventListener("resize", fitSoon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHome);
  function filterHome(v) {
    v = v.trim().toLowerCase();
    const words = v.split(/\s+/).filter(Boolean);
    let n = 0;
    document.querySelectorAll("#home-groups section").forEach((s) => {
      let c = 0;
      s.querySelectorAll(".tile").forEach((t) => {
        const title = t.dataset.title || "";
        const ok = !words.length || words.every((w) => title.includes(w));
        t.hidden = !ok;
        if (ok) c++;
      });
      s.querySelectorAll(".home-div").forEach((d) => (d.hidden = !d.querySelector(".tile:not([hidden])")));
      s.querySelectorAll(".bu-unit").forEach((u) => (u.hidden = !u.querySelector(".tile:not([hidden])")));
      s.querySelectorAll(".bu-pane").forEach((p) => (p.hidden = !!words.length && !p.querySelector(".tile:not([hidden])")));
      s.querySelectorAll(".home-divs").forEach((w) => {
        const vis = [...w.querySelectorAll(".home-div:not([hidden])")];
        w.style.setProperty("--n", vis.length || 1);
        w.style.setProperty("--rows", 1 + Math.max(1, ...vis.map((d) => d.querySelectorAll(".tile:not([hidden])").length)));
      });
      s.hidden = !c;
      const cnt = s.querySelector(".home-h span"); if (cnt) cnt.textContent = words.length ? c + " of " + s.querySelectorAll(".tile").length : String(s.querySelectorAll(".tile").length);
      n += c;
    });
    $("home-groups").classList.toggle("searching", !!v);
    $("home-empty").hidden = !!n || !v;
    $("home-empty").textContent = 'No form matches "' + v + '". Try the exact form name, e.g. "incident report" or "arrest warrant".';
    $("recent").hidden = !!v || !recents().filter((k) => info[k]).length;
    fitSoon();
  }
  $("hq").addEventListener("input", (e) => filterHome(e.target.value));
  $("hq").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const t = document.querySelector("#home-groups .tile:not([hidden])"); if (t) t.click(); }
    if (e.key === "Escape") { e.target.value = ""; filterHome(""); }
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "/" || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    e.preventDefault(); ($("hq").offsetParent ? $("hq") : $("q")).focus();
  });
  const sealSrc = document.querySelector(".logo").src;
  let homeBadgeTarget = "";
  $("home-badge").addEventListener("error", () => {
    if (homeBadgeTarget !== sealSrc) { homeBadgeTarget = sealSrc; $("home-badge").src = sealSrc; }
  });
  function updateHomeBadge(name) {
    const target = name ? personImageUrl(name) : sealSrc;
    if (homeBadgeTarget === target) return;
    homeBadgeTarget = target;
    $("home-badge").src = target;
  }
  updateHomeBadge("");

  // actions rail + section outline for every form
  const smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  document.querySelectorAll('main > [id^="f-"]:not(#f-home)').forEach((f) => {
    const act = f.querySelector(":scope > .actions, :scope > .report-actions");
    if (!act) { f.classList.add("norail"); return; }
    const rail = el("div", "rail"), heads = [...f.querySelectorAll(":scope > .card > h2")];
    if (heads.length > 1) {
      const nav = el("nav", "outline"); nav.setAttribute("aria-label", "Sections"); nav.append(el("b", "", "Sections"));
      heads.forEach((h) => {
        const t = [...h.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
        const a = el("a", "", t); a.href = "#";
        a.onclick = (e) => { e.preventDefault(); h.parentElement.scrollIntoView({ behavior: smooth, block: "start" }); };
        h._a = a; nav.append(a);
      });
      rail.append(nav);
      let tick = 0;
      addEventListener("scroll", () => {
        if (f.hidden || tick) return;
        tick = requestAnimationFrame(() => {
          tick = 0; let cur = heads[0];
          heads.forEach((h) => { if (h.parentElement.getBoundingClientRect().top < 140) cur = h; });
          heads.forEach((h) => h._a.setAttribute("aria-current", h === cur));
        });
      }, { passive: true });
    }
    rail.append(act); f.append(rail);
  });
  show("home");
})();
    
