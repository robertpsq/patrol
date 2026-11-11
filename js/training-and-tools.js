(() => {
  const P1 = [
    ["Classroom & Station Orientation", ["Classroom Orientation", "Station Orientation"]],
    ["Department Orientation & Professional Standards", ["Chain of Command", "Department Structure", "Conduct Standards & Professionalism", "Ethics & Accountability", "Community Engagement"]],
    ["Patrol Role & Equipment Familiarization", ["Patrol Responsibilities & Shift Duties", "Equipment & Patrol Vehicle Familiarization", "First Aid Essentials", "(( Department Garage & Vehicles ))"]],
    ["Legal Authority & Policy Foundations", ["Reasonable Suspicion vs. Probable Cause", "Elements of Offenses", "Detention vs. Arrest", "Use of Force Policy", "Critical Incident Response", "Pursuit Policy"]],
  ];
  const P2 = [
    ["Patrol Communications & Call Management", ["Radio Communication", "MDT/CAD", "Call Response Basics", 'Handling Unit ("The Handle")']],
    ["Paperwork, Reports & Documentation", ["Common Paperwork", "Report Writing Standards", "Documentation Expectations"]],
    ["Arrest, Charging & Case Processing", ["Crime Types & Classifications", "Sentencing Enhancements", "(( Pleas ))", "Miranda Rights", "Arrest Processing"]],
    ["Criminal Procedure & Field Application", ["Decision-Making", "Officer Discretion", "Case Law", "Frisk vs. Search", "Vehicle Searches", "Exigent Circumstances", "Warrants"]],
    ["Officer Safety & Critical Incidents", ["Situational Awareness", "Contact & Cover", "Scene Safety", "Barricaded Suspects", "Incident Perimeter Setup"]],
    ["Crime Scene Management & Evidence", ["Evidence Recognition, Preservation & Chain of Custody", "Evidence Collection & Logging", "Crime Scene Containment", "Preliminary Investigations"]],
    ["Traffic Enforcement", ["Traffic Stops", "License Requirements & Suspensions", "Citations", "Traffic Reports", "Vehicle Impounds"]],
    ["Vehicle Equipment & Operations", ["Pre-Trip Vehicle Inspection", "Emergency Driving", "Vehicle Pursuits", "Felony / High-Risk Vehicle Stops", "Pursuit Intervention Techniques"]],
  ];
  const RT = [
    ["ATTITUDE", ["Acceptance of Feedback/Criticism", "Attitude toward Police Work", "Integrity/Ethics", "Leadership"]],
    ["APPEARANCE", ["Uniform & Equipment"]],
    ["RELATIONSHIPS", ["With Citizens/Community", "With other Agencies' Members"]],
    ["PERFORMANCE", ["Driving Skill: All Conditions", "Report Writing: Grammar/Spelling/Neatness", "Field Performance: Self-Initiated Field Activity", "Field Performance: General Conditions", "Officer Safety: General Conditions", "Control of Conflict: General Conditions", "Problem-solving Techniques/Decision-making", "Radio Communications", "Mobile Computer Terminal", "Use of Map/GPS: Orientation/Response Time"]],
    ["THE HANDLE", ["Being the Handling Unit", "Liaising with Deputies as the Handle", "Liaising with the Incident Commander", "Liaising with the Tactical Commander", "Liaising with the Investigative Primary"]],
    ["KNOWLEDGE", ["Department Policies and Procedures", "Criminal Law", "Criminal Procedure"]],
    ["(( ROLEPLAY ))", ["Roleplay Quality", "Character Depth/Portrayal", "Out-of-Character Demeanor"]],
  ];
  const RV = ["S", "C", "N/I", "N/O", "NRT"];
  const mk = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
  const val = (id) => document.getElementById(id).value.trim();

  // ---- grouped checklist dropdown (multi-select, same look as the charge picker) ----
  function checklist(host, groups) {
    const flat = groups.flatMap((g) => g[1]), sel = new Set();
    const chips = mk("div", "cp-chips"), q = mk("input", "cp-q"), list = mk("div", "cp-list");
    q.type = "text"; q.autocomplete = "off"; q.placeholder = "Search or pick the delivered items";
    q.setAttribute("role", "combobox"); q.setAttribute("aria-label", "Search delivered items"); q.setAttribute("aria-expanded", "false");
    list.setAttribute("role", "listbox"); list.setAttribute("aria-multiselectable", "true"); list.hidden = true;
    host.append(chips, q, list);
    let hits = [], cur = 0;
    const ordered = () => flat.filter((i) => sel.has(i));
    const drawChips = () => chips.replaceChildren(...ordered().map((it) => {
      const s = mk("span", "cp-chip"), b = mk("button", "", "×");
      s.append(it); b.type = "button"; b.setAttribute("aria-label", "Remove " + it);
      b.onclick = () => { sel.delete(it); refresh(); };
      s.append(b); return s;
    }));
    const drawList = () => {
      const top = list.scrollTop, w = q.value.toLowerCase().split(/\s+/).filter(Boolean), nodes = [];
      hits = [];
      groups.forEach(([g, items]) => {
        const m = items.filter((i) => w.every((x) => i.toLowerCase().includes(x) || g.toLowerCase().includes(x)));
        if (!m.length) return;
        nodes.push(mk("div", "cp-grp", g));
        m.forEach((i) => {
          const idx = hits.length, d = mk("div", "cp-opt" + (sel.has(i) ? " on" : ""));
          hits.push(i); d.append(mk("i", "ck"), mk("span", "", i));
          d.setAttribute("role", "option"); d.setAttribute("aria-selected", idx === cur);
          d.onmousedown = (e) => { e.preventDefault(); cur = idx; toggle(i); };
          nodes.push(d);
        });
      });
      if (!nodes.length) nodes.push(mk("div", "cp-none", "No item matches. Try a shorter word."));
      list.replaceChildren(...nodes); list.scrollTop = top;
    };
    const refresh = () => { drawChips(); if (!list.hidden) drawList(); };
    const toggle = (i) => { sel.has(i) ? sel.delete(i) : sel.add(i); refresh(); };
    const open = (v) => { list.hidden = !v; q.setAttribute("aria-expanded", v); if (v) drawList(); };
    q.addEventListener("focus", () => open(true));
    q.addEventListener("click", () => open(true));
    q.addEventListener("blur", () => open(false));
    q.addEventListener("input", () => { cur = 0; open(true); });
    q.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (list.hidden) { open(true); return; }
        if (!hits.length) return;
        cur = (cur + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; drawList();
        const on = list.querySelectorAll(".cp-opt")[cur]; if (on) on.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") { e.preventDefault(); if (!list.hidden && hits[cur]) toggle(hits[cur]); }
      else if (e.key === "Escape") open(false);
    });
    return { get: ordered, clear: () => { sel.clear(); q.value = ""; refresh(); } };
  }
  const pick1 = checklist(document.getElementById("ftp1-checklist"), P1);
  const pick2 = checklist(document.getElementById("ftp2-checklist"), P2);

  // ---- rating rows (S / C / N/I / N/O / NRT) ----
  function buildRatings(hostId, prefix) {
    const host = document.getElementById(hostId);
    let n = 0;
    RT.forEach(([cat, items]) => {
      const box = mk("div", "rt-cat"); box.append(mk("h4", "", cat));
      items.forEach((label) => {
        n++;
        const row = mk("div", "rt-row"), seg = mk("div", "seg");
        row.append(mk("span", "", n + ". " + label));
        seg.setAttribute("role", "radiogroup"); seg.setAttribute("aria-label", n + ". " + label + " rating");
        RV.forEach((v, i) => {
          const inp = mk("input"); inp.type = "radio"; inp.name = prefix + "-r" + n; inp.id = prefix + "-r" + n + "-" + i; inp.value = v;
          if (v === "N/O") inp.checked = true;
          const lb = mk("label", "", v); lb.htmlFor = inp.id; seg.append(inp, lb);
        });
        row.append(seg); box.append(row);
      });
      host.append(box);
    });
    return n;
  }
  const rn = buildRatings("ftp2-ratings", "ftp2");
  buildRatings("ftp3-ratings", "ftp3");
  const ratingOf = (prefix, n) => { const c = document.querySelector('input[name="' + prefix + '-r' + n + '"]:checked'); return c ? c.value : "N/O"; };

  // ---- FTO Evaluation Patrol Report: a single flat "Attitude" rating list, S/C/N/I/N/O only (no NRT) ----
  const RV_FTO = ["S", "C", "N/I", "N/O"];
  const FTO_ITEMS = [
    { label: "Theoretical Knowledge", out: "Theoretical Knowledge" },
    { label: "Policy Compliance", out: "Policy Compliance" },
    { label: "Decision-Making", out: "Decision-Making" },
    { label: "Policy Explanation", out: "Policy Explanation" },
    { label: "Instructional Ability", out: "Instructional Ability" },
    { label: "Assessment & Feedback", out: "Assessment & Feedback" },
    { label: "Professional Demeanor", out: "Professional Demeanor" },
    { label: "Roleplay Quality (OOC)", out: "[ooc]Roleplay Quality[/ooc]" },
    { label: "Character Portrayal (OOC)", out: "[ooc]Character Portrayal[/ooc]" },
    { label: "OOC Demeanor (OOC)", out: "[ooc]OOC Demeanor[/ooc]" },
  ];
  (function buildFtoRatings() {
    const host = document.getElementById("fto-ratings");
    FTO_ITEMS.forEach((item, idx) => {
      const n = idx + 1, row = mk("div", "rt-row"), seg = mk("div", "seg");
      row.append(mk("span", "", n + ". " + item.label));
      seg.setAttribute("role", "radiogroup"); seg.setAttribute("aria-label", n + ". " + item.label + " rating");
      RV_FTO.forEach((v, i) => {
        const inp = mk("input"); inp.type = "radio"; inp.name = "fto-r" + n; inp.id = "fto-r" + n + "-" + i; inp.value = v;
        if (v === "N/O") inp.checked = true;
        const lb = mk("label", "", v); lb.htmlFor = inp.id; seg.append(inp, lb);
      });
      row.append(seg); host.append(row);
    });
  })();

  // ---- textareas that grow with their content ----
  const grow = (t) => { t.style.height = "auto"; t.style.height = t.scrollHeight + 2 + "px"; };
  const growAll = () => document.querySelectorAll("#f-ftp-phase1 .ftp-grow, #f-ftp-phase2 .ftp-grow, #f-ftp-phase3 .ftp-grow, #f-ftp-fto-eval .ftp-grow").forEach((t) => { if (t.offsetParent) grow(t); });
  document.querySelectorAll(".ftp-grow").forEach((t) => t.addEventListener("input", () => grow(t)));

  // ---- BBCode ----
  const sz = (t) => "[size=85]" + t + "[/size]";
  const head = (title) => [
    "[block=20,20,white,white][center][img]https://i.imgur.com/LEWTXbL.png[/img]", "",
    "[size=85][b]" + title + "[/b]", "LOS SANTOS COUNTY SHERIFF'S DEPARTMENT — FIELD TRAINING PROGRAM[/size]", "[hr][/hr][/center]", "",
  ];
  const infoTables = (p, phase) => [
    "[transtable=Arial]", "[tr]",
    "[td][size=90][b]REPORT DATE[/b][/size][/td]", "[td][size=90][b]REPORT TIME[/b][/size][/td]", "[td][size=90][b]PHASE #[/b][/size][/td]", "[/tr]", "[tr]",
    "[td]" + sz(formatPickerDate(val(p + "-date")) || "Month Day, Year") + "[/td]",
    "[td]" + sz(val(p + "-time") || "HH:MM") + "[/td]",
    "[td]" + sz(phase) + "[/td]", "[/tr]", "[/transtable]", "",
    "[transtable=Arial]", "[tr]",
    "[td][size=90][b]TRAINEE NAME[/b][/size][/td]", "[td][size=90][b]EMPLOYEE NUMBER[/b][/size][/td]", "[td][size=90][b]FTO NAME[/b][/size][/td]", "[td][size=90][b]EMPLOYEE NUMBER[/b][/size][/td]", "[/tr]", "[tr]",
    "[td]" + sz(val(p + "-trainee-name") || " ") + "[/td]",
    "[td]" + sz(val(p + "-trainee-number") || " ") + "[/td]",
    "[td]" + sz(val(p + "-fto-name") || " ") + "[/td]",
    "[td]" + sz(val(p + "-fto-number") || " ") + "[/td]", "[/tr]", "[/transtable]", "",
  ];
  const textBox = (title, body) => [
    "[transtable=Arial]", "[tr]", "[td][b][center][size=90]" + title + "[/size][/center][/b][/td]", "[/tr]", "[tr]", "[td]", body, "[/td]", "[/tr]", "[/transtable]",
  ];
  const listBody = (items, fallback) => items.length ? items.map(sz).join("\n") : sz(fallback);

  function buildP1() {
    return [
      ...head("PHASE 1 PATROL SUMMARY"),
      ...infoTables("ftp1", "Phase 1"),
      "[size=80][b]INSTRUCTION[/b]:[i]This section shall briefly document the FTO’s observations of the trainee during Phase 1. It should focus on the trainee’s conduct, engagement, professionalism, communication, ability to follow instruction, response to feedback, basic understanding of Phase 1 topics, and overall readiness to advance to Phase 2.[/i][/size]", "",
      ...textBox("OBSERVATIONS", sz(val("ftp1-obs") || "Observations go here.")), "",
      "[size=80][i]This section should not be written as a patrol narrative or timeline. FTOs should document relevant strengths, concerns, or areas requiring continued attention in an objective and concise manner.[/i][/size]", "",
      ...textBox("DELIVERED THEORETICAL KNOWLEDGE", listBody(pick1.get(), "Covered checklist items go here.")),
      "[/block]",
    ].join("\n");
  }
  function buildP2() {
    const out = [
      ...head("FIELD TRAINING OBSERVATIONAL REPORT"),
      ...infoTables("ftp2", val("ftp2-phase") || "Phase 2"),
      "[transtable=Arial]", "[tr]", "[td][size=90][b][center]GRADING SYSTEM[/center][/b][/size][/td]", "[/tr]", "[tr]",
      "[td][justify][size=85][b]INSTRUCTIONS:[/b][/size]",
      "[indent=25][size=85]S — A rating of S (Superior) denotes outstanding performance and shall only be attributed if the trainee exceeds expectations.[/size]",
      "[size=85]C — A rating of C (Competent) is the minimum required to be considered at standard for a solo patrol deputy.[/size]",
      "[size=85]N/I — A rating of N/I (Needs Improvement) shall be ticked to denote needing further training focused on a specific task.[/size]",
      "[size=85]N/O — A rating of N/O (Not Observed) shall be ticked for all situations that were not encountered in the patrol.[/size]",
      "[size=85]NRT — A rating of NRT (Not Responding to Training) shall be given if the trainee does not respond to training.[/size][/indent][/justify][/td]",
      "[/tr]", "[/transtable]", "",
    ];
    let n = 0;
    RT.forEach(([cat, items]) => {
      const labels = [], rates = [];
      items.forEach((label) => { n++; labels.push(sz(n + ". " + label)); rates.push(sz(ratingOf("ftp2", n))); });
      out.push(
        "[table=Arial]", "[tr]",
        "[tdwidth=1,black,white,middle,center,45,2][size=90][b]" + cat + "[/b][/size][/tdwidth]",
        "[tdwidth=1,black,white,middle,center,10,2][size=90][center][b]RATING[/b][/center][/size][/tdwidth]", "[/tr]", "[tr]",
        "[td]" + labels.join("[hr][/hr]\n") + "[/td]",
        "[td][center]" + rates.join("[hr][/hr]\n") + "[/center][/td]", "[/tr]", "[tr][/tr]", "[/table]", "",
      );
    });
    out.push(
      ...textBox("LEAST SATISFACTORY PERFORMANCE", sz(val("ftp2-least") || "Detail where the trainee struggled.")),
      ...textBox("MOST SATISFACTORY PERFORMANCE", sz(val("ftp2-most") || "Detail where the trainee excelled.")),
      ...textBox("REPORT NARRATIVE", sz(val("ftp2-narrative") || "Patrol narrative goes here.")), "",
      ...textBox("DELIVERED PRACTICAL & THEORETICAL KNOWLEDGE", listBody(pick2.get(), "Covered checklist items go here.")),
      "[/block]",
    );
    return out.join("\n");
  }
  function buildP3() {
    const out = [
      ...head("FIELD TRAINING OBSERVATIONAL REPORT"),
      ...infoTables("ftp3", "Phase 3"),
      "[transtable=Arial]", "[tr]", "[td][size=90][b][center]GRADING SYSTEM[/center][/b][/size][/td]", "[/tr]", "[tr]",
      "[td][justify][size=85][b]INSTRUCTIONS:[/b][/size]",
      "[indent=25][size=85]S — A rating of S (Superior) denotes outstanding performance and shall only be attributed if the trainee exceeds expectations.[/size]",
      "[size=85]C — A rating of C (Competent) is the minimum required to be considered at standard for a solo patrol deputy.[/size]",
      "[size=85]N/I — A rating of N/I (Needs Improvement) shall be ticked to denote needing further training focused on a specific task.[/size]",
      "[size=85]N/O — A rating of N/O (Not Observed) shall be ticked for all situations that were not encountered in the patrol.[/size]",
      "[size=85]NRT — A rating of NRT (Not Responding to Training) shall be given if the trainee does not respond to training.[/size][/indent][/justify][/td]",
      "[/tr]", "[/transtable]", "",
    ];
    let n = 0;
    RT.forEach(([cat, items]) => {
      const labels = [], rates = [];
      items.forEach((label) => { n++; labels.push(sz(n + ". " + label)); rates.push(sz(ratingOf("ftp3", n))); });
      out.push(
        "[table=Arial]", "[tr]",
        "[tdwidth=1,black,white,middle,center,45,2][size=90][b]" + cat + "[/b][/size][/tdwidth]",
        "[tdwidth=1,black,white,middle,center,10,2][size=90][center][b]RATING[/b][/center][/size][/tdwidth]", "[/tr]", "[tr]",
        "[td]" + labels.join("[hr][/hr]\n") + "[/td]",
        "[td][center]" + rates.join("[hr][/hr]\n") + "[/center][/td]", "[/tr]", "[tr][/tr]", "[/table]", "",
      );
    });
    out.push(
      ...textBox("LEAST SATISFACTORY PERFORMANCE", sz(val("ftp3-least") || "Detail where the trainee struggled.")),
      ...textBox("MOST SATISFACTORY PERFORMANCE", sz(val("ftp3-most") || "Detail where the trainee excelled.")),
      ...textBox("REPORT NARRATIVE", sz(val("ftp3-narrative") || "Patrol narrative goes here.")), "",
      ...textBox("DELIVERED PRACTICAL & THEORETICAL KNOWLEDGE", sz("Phase 3 Evaluation. Does not apply.")),
      "[/block]",
    );
    return out.join("\n");
  }
  function buildFtoEval() {
    const attitudeLabels = FTO_ITEMS.map((item, i) => sz((i + 1) + ". " + item.out)).join("[hr][/hr]\n");
    const attitudeRatings = FTO_ITEMS.map((item, i) => sz(ratingOf("fto", i + 1))).join("[hr][/hr]\n");
    return [
      ...head("FTO EVALUATION PATROL REPORT"),
      "[transtable=Arial]", "[tr]",
      "[td][size=90][b]REPORT DATE[/b][/size][/td]", "[td][size=90][b]REPORT TIME[/b][/size][/td]", "[/tr]", "[tr]",
      "[td]" + sz(formatPickerDate(val("fto-date")) || "Month Day, Year") + "[/td]",
      "[td]" + sz(val("fto-time") || "HH:MM") + "[/td]", "[/tr]", "[/transtable]", "",
      "[transtable=Arial]", "[tr]",
      "[td][size=90][b]FTO CANDIDATE NAME[/b][/size][/td]", "[td][size=90][b]EMPLOYEE NUMBER[/b][/size][/td]", "[td][size=90][b]FTO NAME[/b][/size][/td]", "[td][size=90][b]EMPLOYEE NUMBER[/b][/size][/td]", "[/tr]", "[tr]",
      "[td]" + sz(val("fto-candidate-name") || " ") + "[/td]",
      "[td]" + sz(val("fto-candidate-number") || " ") + "[/td]",
      "[td]" + sz(val("fto-officer-name") || " ") + "[/td]",
      "[td]" + sz(val("fto-officer-number") || " ") + "[/td]", "[/tr]", "[/transtable]", "",
      "[transtable=Arial]", "[tr]", "[td][size=90][b][center]GRADING SYSTEM[/center][/b][/size][/td]", "[/tr]", "[tr]",
      "[td][justify][size=85][b]GRADES[/b][/size]",
      "[indent=25]",
      "[size=85]S — A rating of S (Superior) denotes outstanding performance and shall only be assigned when the candidate exceeds expectations.[/size]",
      "[size=85]C — A rating of C (Competent) denotes performance that meets the minimum standard required of a field training officer.[/size]",
      "[size=85]N/I — A rating of N/I (Needs Improvement) shall be selected when the candidate requires further training in a specific task or area.[/size]",
      "[size=85]N/O — A rating of N/O (Not Observed) shall be selected for any task, area, or situation that was not observed during the evaluation.[/size][/indent][/justify][/td]",
      "[/tr]", "[/transtable]", "",
      "[table=Arial]", "[tr]",
      "[tdwidth=1,black,white,middle,center,45,2][size=90][b]ATTITUDE[/b][/size][/tdwidth]",
      "[tdwidth=1,black,white,middle,center,10,2][size=90][center][b]RATING[/b][/center][/size][/tdwidth]", "[/tr]", "[tr]",
      "[td]" + attitudeLabels + "[/td]",
      "[td][center]" + attitudeRatings + "[/center][/td]", "[/tr]", "[tr][/tr]", "[/table]", "",
      ...textBox("MOST SATISFACTORY PERFORMANCE", sz(val("fto-most") || " ")), "",
      ...textBox("LEAST SATISFACTORY PERFORMANCE", sz(val("fto-least") || " ")),
      "[/block]", "",
      ...textBox("NARRATIVE", sz(val("fto-narrative") || " ")),
    ].join("\n");
  }

  // ---- reset / today's date ----
  const setToday = (id) => { document.getElementById(id).value = taskListTodayDate(); updateTaskListDateLabel(id); };
  window.resetFtp1 = function () {
    ["ftp1-time", "ftp1-trainee-name", "ftp1-trainee-number", "ftp1-fto-name", "ftp1-fto-number", "ftp1-obs"].forEach((id) => (document.getElementById(id).value = ""));
    pick1.clear(); setToday("ftp1-date"); applyDeputyDetails(); growAll();
  };
  window.resetFtp2 = function () {
    ["ftp2-time", "ftp2-trainee-name", "ftp2-trainee-number", "ftp2-fto-name", "ftp2-fto-number", "ftp2-least", "ftp2-most", "ftp2-narrative"].forEach((id) => (document.getElementById(id).value = ""));
    document.getElementById("ftp2-phase").selectedIndex = 0;
    for (let i = 1; i <= rn; i++) document.getElementById("ftp2-r" + i + "-3").checked = true;
    pick2.clear(); setToday("ftp2-date"); applyDeputyDetails(); growAll();
  };
  window.resetFtp3 = function () {
    ["ftp3-time", "ftp3-trainee-name", "ftp3-trainee-number", "ftp3-fto-name", "ftp3-fto-number", "ftp3-least", "ftp3-most", "ftp3-narrative"].forEach((id) => (document.getElementById(id).value = ""));
    document.getElementById("ftp3-phase").value = "Phase 3";
    for (let i = 1; i <= rn; i++) document.getElementById("ftp3-r" + i + "-3").checked = true;
    setToday("ftp3-date"); applyDeputyDetails(); growAll();
  };
  window.resetFtoEval = function () {
    ["fto-time", "fto-candidate-name", "fto-candidate-number", "fto-officer-name", "fto-officer-number", "fto-most", "fto-least", "fto-narrative"].forEach((id) => (document.getElementById(id).value = ""));
    for (let i = 1; i <= FTO_ITEMS.length; i++) document.getElementById("fto-r" + i + "-3").checked = true;
    setToday("fto-date"); applyDeputyDetails(); growAll();
  };
  setToday("ftp1-date"); setToday("ftp2-date"); setToday("ftp3-date"); setToday("fto-date");

  // ---- hook into copy + navigation ----
  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "ftp-phase1" && k !== "ftp-phase2" && k !== "ftp-phase3" && k !== "ftp-fto-eval") return baseCopy.apply(this, arguments);
    const txt = k === "ftp-phase1" ? buildP1() : k === "ftp-phase2" ? buildP2() : k === "ftp-phase3" ? buildP3() : buildFtoEval();
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  const baseShow = window.show;
  window.show = function (k) {
    baseShow.apply(this, arguments);
    if (k === "ftp-phase1" || k === "ftp-phase2" || k === "ftp-phase3" || k === "ftp-fto-eval") requestAnimationFrame(growAll);
  };
  window.__ftp = { buildP1, buildP2, buildP3, buildFtoEval };
})();

/* ===== PEU — Pre-Employment Unit: Applicant Letters + Administrative File ===== */
(() => {
  // PEU-PURE-BEGIN (no DOM access below this line until PEU-PURE-END; the test script runs this block on its own)
  const PEU = {
    sheriff: "Grant Mendez",
    banner: "https://i.imgur.com/LEWTXbL.png",
    sheriffSig: "https://i.booskit.dev/gtaw/signature-sheriff.png",
    footer: "https://i.imgur.com/vggSUzN.png",
    discord: "https://discord.gg/j97T7Yz6h4",
    intranet: "https://lssd.gta.world/viewforum.php?f=371",
    chief: "Richard Dunne",
    chiefRank: "Division Chief",
    chiefUnit: "Personnel Command",
    chiefSig: "https://www.upload.ee/image/18776202/signature_3_.png",
  };
  const DST = "[b]Deputy Sheriff Trainee[/b]";
  const APPEAL_TRAINING = "Training Bureau Command";
  const APPEAL_PERSONNEL = "Personnel Command: Headquarters";
  const DQ_REASONS = [
    "Employment history;",
    "Credit or financial history;",
    "Discovered undisclosed information;",
    "Dishonesty;",
    "Incomplete application;",
    "Other reason(s) as not listed.",
  ];
  const paras = (...a) => a.filter((x) => x != null && x !== "").join("\n\n");
  const appeal = (to) =>
    "[b]Any formal appeal must be in writing and received by " + to + " within ten (10) business days from the [u]postmark date[/u] of this letter. Please note, appeals may take 5-7 business days to be processed.\n\nTo appeal, you must demonstrate that the factors leading to your disqualification are in error.[/b]";
  const evaluated = "We have evaluated your application and qualifications for the position of " + DST;
  // one object per letter: add a 9th letter by adding one entry here
  const LETTERS = [
    { id: "app-received", group: "Application", label: "Received", body: () => paras(
      "We have received your application and qualifications for the position of " + DST + ". Thank you for showing interest in employment with the Los Santos County Sheriff's Department.",
      "Your request has been acknowledged and forwarded to the Pre-Employment Unit for further deliberation & conclusion. This deliberation will include a thorough examination of your previous service with the Department and personal background information.",
      "While extraneous circumstances may preclude a fixed timeframe, you should expect a response to your request within 72 hours.") },
    { id: "app-hold", group: "Application", label: "On-Hold", body: (s) => {
      const n = (s.issues || []).filter(Boolean);
      const list = n.length ? n : ["Issue 1", "Issue 2", "Issue 3"];
      const items = list.map((t, i) => "[*]" + t + (i === list.length - 1 ? "." : ";")).join("\n");
      return paras(
        "We have reviewed your application and qualifications for the position of " + DST + ".",
        "We have noticed one or more errors in your application and may not process it further. The following issue(s) must first be corrected:",
        "[list=1]\n" + items + "\n[/list]",
        "You have 24 hours to correct the aforementioned issue(s). Once corrected, you must forward a reply, stating that amendments have been made.");
    } },
    { id: "app-accepted", group: "Application", label: "Accepted (to Written Test)", body: () => paras(
      evaluated + ".",
      "We are pleased to inform you that your application has been successful. The next step in the recruitment process is to attend and complete your Written Test.",
      "You will shortly receive correspondence with instructions on completing your Written Test.",
      "Should you have any questions, comments, or concerns, please contact Training Bureau Command.") },
    { id: "app-dq", group: "Application", label: "Disqualified", body: (s) => {
      const on = (s.reasons || []).map((v, i) => (v ? DQ_REASONS[i] : null)).filter(Boolean);
      const lines = on.map((t) => "[*]" + t);
      if ((s.dqOoc || "").trim()) lines.push("[*][ooc]" + s.dqOoc.trim() + "[/ooc]");
      return paras(
        evaluated + " and regret to inform you that you were not selected for this position due to issues that may have involved:",
        "[list]" + lines.join("\n") + "[/list][br][/br]\nUnder all circumstances, you are ineligible to reapply during the current recruitment drive as well as any concurrent recruitment drives for civilian employment. You may reapply [b]three (3)[/b] weeks from the date of your denial.",
        appeal(APPEAL_TRAINING));
    } },
    { id: "wt-passed", group: "Written Test", label: "Passed (to Academy)", body: () => paras(
      "We have evaluated your written test for the position of " + DST + " and are pleased to inform you that you have been successful. The next step in the recruitment process is to attend and complete the Academy.",
      "You will be sent further correspondence explaining the process for this stage, along with available dates for you to sign up and undergo training.",
      "[ooc]At this point, your character will advance one step forward in the recruitment process and will be enrolled in academy training.\n\nYou are now also asked to join the LSSD Discord [url=" + PEU.discord + "]here[/url] and follow the verification steps found in the \"group-requests\" channel to verify and/or sync your roles. Verifying your Discord account will give you access to the Deputy Sheriff Trainee channel where important correspondence will be communicated to you by Training Bureau Command in regards to the Academy process and further beyond. You may also ask questions in the channel.[/ooc]") },
    { id: "wt-failed", group: "Written Test", label: "Failed", body: () => paras(
      evaluated + " and regret to inform you that you were not selected for this position due to issues involving your Written Test.",
      "Under all circumstances, you are ineligible to take the Written Test again or reapply during the current recruitment drive as well as any concurrent recruitment drives for civilian employment. You may reapply three weeks after the date of your denial.",
      appeal(APPEAL_TRAINING)) },
    { id: "acad-passed", group: "Academy", label: "Passed (to Sworn In)", body: () => paras(
      evaluated + ".",
      "Pursuant to personnel guidelines and hiring standards of the County of Los Santos, we would like to offer you a conditional offer of employment at the sworn title of " + DST + ".",
      "[b]Any request for refusal of this offer must be in writing and received by Training Bureau Command within ten (10) business days from the [u]postmark date[/u] of this letter.[/b]",
      "You will be sent further correspondence explaining the process of your swearing-in further.",
      "[ooc]At this point, your character would be sworn in following completion of academy training.\n\nSince you already have access to the Deputy Sheriff Trainee channel, important correspondence will be communicated to you by Training Bureau Command regarding the final examination and beyond. You may also ask questions in the channel.\n\nAs of this moment, your next step is to familiarize yourself with the academy material on our [url=" + PEU.intranet + "]intranet page[/url] in order to take your final exam.[/ooc]") },
    { id: "acad-failed", group: "Academy", label: "Failed", body: (s) => paras(
      evaluated + " and regret to inform you that you were not selected for this position due to issues related to your Academy training.",
      "Under all circumstances, you are ineligible to undergo Academy training again or reapply during the current recruitment drive, as well as any concurrent recruitment drives for civilian employment. You may reapply three weeks after the date of your denial.",
      (s.failOoc || "").trim() ? "[ooc]" + s.failOoc.trim() + "[/ooc]" : "",
      appeal(APPEAL_PERSONNEL)) },
  ];
  const lastWord = (n) => String(n || "").trim().split(/\s+/).pop();
  function buildLetter(s) {
    const L = LETTERS.find((l) => l.id === s.type) || LETTERS[0];
    return [
      "[center][b][size=150]OFFICE OF THE SHERIFF[/size][/b][/center]",
      "",
      "[center][aligntable=left,200,0,0,0,0,transparent]",
      "[indent][b]" + PEU.sheriff.toUpperCase() + "[/b]",
      "LOS SANTOS COUNTY SHERIFF[/indent][/aligntable]",
      "[aligntable=right,200,0,0,0,0,transparent]",
      "[b][indent]HALL OF JUSTICE[/b]",
      "301 INNOCENCE BOULEVARD[indent][/aligntable]",
      "[img]" + PEU.banner + "[/img][hr][/hr][/center]",
      "",
      "[indent]" + ((s.date || "").trim() || "Month Day, Year"),
      "",
      "Dear " + (s.salutation || "Mr.") + " " + (lastWord(s.name) || "Lastname") + ",",
      "",
      L.body(s),
      "",
      "Sincerely,",
      "[imgmw=100]" + PEU.sheriffSig + "[/imgmw]",
      PEU.sheriff + ", Sheriff",
      "[imgmw=200]" + PEU.chiefSig + "[/imgmw]",
      PEU.chief + ", " + PEU.chiefRank,
      PEU.chiefUnit + "[/indent]",
      "[br][/br]",
      "[center][img]" + PEU.footer + "[/img][/center]",
    ].join("\n");
  }
  // Administrative File: each checklist line is a checkbox, [cb][/cb] when open and [cbc][/cbc] when ticked
  const CHECKS = ["Application", "Written Test (WT)"];
  function buildAdmin(s) {
    const k = (i) => (s.checks && s.checks[i] ? "[cbc][/cbc]" : "[cb][/cb]");
    const notes = (s.notes || "").trim();
    return [
      "[block=0,30,transparent,white][center][img]" + PEU.banner + "[/img]",
      "",
      "[b]DEPUTY SHERIFF TRAINEE ADMINISTRATIVE FILE[/b]",
      "LOS SANTOS COUNTY SHERIFF'S DEPARTMENT — PRE-EMPLOYMENT UNIT[/center]",
      "",
      "[hr][/hr]",
      "",
      "[b]INFORMATION[/b]",
      "",
      "[indent]Applicant Name: " + ((s.name || "").trim() || "Firstname Lastname"),
      "Application: [url=" + ((s.url || "").trim() || "https://lssd.gta.world/") + "]ACCESS[/url]",
      "Notes:" + (notes ? " " + notes : ""),
      "[/indent]",
      "",
      "[hr][/hr]",
      "",
      "[b]PRE-EMPLOYMENT UNIT CHECKLIST[/b]",
      "[indent]" + k(0) + " " + CHECKS[0],
      k(1) + " " + CHECKS[1] + "[/indent][/block]",
    ].join("\n");
  }
  // thread title: one template string, so the tag position is a one-line change
  const TITLE_TEMPLATE = "[DST] {name}{tag}";
  const TAGS = {
    internal: [
      ["REVIEW", "The application is currently under review by a member."],
      ["ON-HOLD", "The application requires amendments to be made and is pending per such."],
      ["DQ", "The application was rejected for one of the disqualifying reasons."],
      ["WT SENT", "The applicant has been sent the Written Test."],
      ["WT RETURNED", "Written Test returned from the applicant."],
      ["WT FAILED", "Written Test has been reviewed and the applicant has failed."],
      ["ACADEMY", "The applicant has been moved to Academy training."],
      ["ACADEMY CONDUCTED", "The applicant has undergone Academy training, and the logs are pending grading."],
      ["ES/UC APPROVAL", "The applicant has passed their Academy training and is ready for ES/PEU Unit Commander review."],
      ["FINAL EXAM", "The applicant has been approved by TB Command & Executive Staff and is qualified to sit the final exam."],
      ["ACCEPTED", "The applicant has passed the final examination."],
    ],
  };
  function buildTitle(s) {
    return TITLE_TEMPLATE.replace("{name}", (s.name || "").trim() || "Firstname Lastname").replace("{tag}", s.tag ? " [" + s.tag + "]" : "");
  }
  // PEU-PURE-END
  window.__peu = { PEU, LETTERS, TAGS, CHECKS, DQ_REASONS, buildLetter, buildAdmin, buildTitle };

  /* ---------------- page wiring ---------------- */
  const $ = (id) => document.getElementById(id);
  const AK = "lssd-peu-applicant";
  const load = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable: the form still works */ } };
  const ukToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const setDate = (v) => { $("peu-date").value = v; updateTaskListDateLabel("peu-date"); };
  const letterState = () => ({
    type: $("peu-type").value,
    date: formatPickerDate($("peu-date").value),
    salutation: $("peu-sal").value,
    name: $("peu-name").value,
    issues: [...document.querySelectorAll("#peu-issues .peu-issue")].map((i) => i.value.trim()),
    reasons: [...document.querySelectorAll("#peu-reasons input")].map((c) => c.checked),
    dqOoc: $("peu-dq-ooc").value,
    failOoc: $("peu-af-ooc").value,
  });
  const adminState = () => ({
    name: $("peu-a-name").value,
    url: $("peu-a-url").value,
    notes: $("peu-a-notes").value,
    checks: [...document.querySelectorAll("#peu-a-checks input")].map((c) => c.checked),
    tag: $("peu-tag").value,
  });
  function addIssue(v) {
    const row = document.createElement("div");
    row.className = "eg";
    row.innerHTML = '<input type="text" class="peu-issue" aria-label="Issue" placeholder="Describe the issue" autocomplete="off" /><button class="b" type="button" aria-label="Remove issue">−</button>';
    row.querySelector("input").value = v || "";
    row.querySelector("button").onclick = () => { row.remove(); refreshLetter(); };
    $("peu-issues").appendChild(row);
  }
  function refreshLetter() {
    const s = letterState();
    $("peu-issues-wrap").hidden = s.type !== "app-hold";
    $("peu-dq-wrap").hidden = s.type !== "app-dq";
    $("peu-af-wrap").hidden = s.type !== "acad-failed";
    save(AK, s.name);
  }
  function refreshTags() {
    $("peu-tag").replaceChildren(new Option("No tag", ""), ...TAGS.internal.map(([t]) => new Option(t, t)));
  }
  function refreshAdmin() {
    const s = adminState(), hit = TAGS.internal.find(([t]) => t === s.tag);
    $("peu-tag-help").textContent = hit ? hit[0] + " — " + hit[1] : "Pick a tag to add it to the thread title.";
    $("peu-title-out").value = buildTitle(s);
    save(AK, s.name);
  }
  function syncApplicant(from) {
    const v = $(from).value;
    $(from === "peu-name" ? "peu-a-name" : "peu-name").value = v;
  }
  function fillDefaults() {
    const a = load(AK);
    if (typeof a === "string" && !$("peu-name").value && !$("peu-a-name").value) { $("peu-name").value = a; $("peu-a-name").value = a; }
  }
  window.resetPeuLetter = function () {
    $("peu-type").selectedIndex = 0;
    setDate(ukToday());
    $("peu-sal").selectedIndex = 0;
    $("peu-name").value = $("peu-a-name").value = "";
    $("peu-issues").replaceChildren();
    addIssue("");
    document.querySelectorAll("#peu-reasons input").forEach((c) => (c.checked = false));
    $("peu-dq-ooc").value = $("peu-af-ooc").value = "";
    refreshLetter(); refreshAdmin();
  };
  window.resetPeuAdmin = function () {
    $("peu-a-name").value = $("peu-name").value = "";
    $("peu-a-url").value = $("peu-a-notes").value = "";
    document.querySelectorAll("#peu-a-checks input").forEach((c) => (c.checked = false));
    $("peu-tag").value = "";
    refreshAdmin(); refreshLetter();
  };
  async function toClipboard(txt) {
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  }
  window.copyPeuTitle = () => toClipboard($("peu-title-out").value);

  // build the dynamic parts of the two forms
  const sel = $("peu-type");
  [...new Set(LETTERS.map((l) => l.group))].forEach((g) => {
    const og = document.createElement("optgroup");
    og.label = g;
    LETTERS.filter((l) => l.group === g).forEach((l) => og.appendChild(new Option(l.label, l.id)));
    sel.appendChild(og);
  });
  $("peu-reasons").innerHTML = DQ_REASONS.map((t, i) => '<label class="pchk"><input type="checkbox" /><i class="mk" aria-hidden="true"></i><span>' + t.replace(/;$|\.$/, "") + "</span></label>").join("");
  $("peu-a-checks").innerHTML = CHECKS.map((t) => '<label class="pchk"><input type="checkbox" /><i class="mk" aria-hidden="true"></i><span>' + t + "</span></label>").join("");
  addIssue("");
  setDate(ukToday());
  $("peu-add-issue").onclick = () => { addIssue(""); refreshLetter(); };
  refreshTags();
  fillDefaults();
  const fl = $("f-peu-letters"), fa = $("f-peu-admin");
  ["input", "change", "click"].forEach((ev) => {
    fl.addEventListener(ev, (e) => { if (e.target.id === "peu-name") syncApplicant("peu-name"); refreshLetter(); refreshAdmin(); });
    fa.addEventListener(ev, (e) => { if (e.target.id === "peu-a-name") syncApplicant("peu-a-name"); refreshAdmin(); refreshLetter(); });
  });
  refreshLetter(); refreshAdmin();

  // ---- hook into copy + navigation (same pattern as FTP) ----
  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k === "peu-letters") return toClipboard(window.__peu.buildLetter(letterState()));
    if (k === "peu-admin") return toClipboard(buildAdmin(adminState()));
    return baseCopy.apply(this, arguments);
  };
  const baseShow = window.show;
  window.show = function (k) {
    baseShow.apply(this, arguments);
    if (k === "peu-letters" || k === "peu-admin") { fillDefaults(); refreshLetter(); refreshAdmin(); }
  };
})();

/* ===== VST: K9 Emergency Medical Care Report ===== */
(() => {
  const K9EMC_FORUM_URL = "https://lssd.gta.world/viewforum.php?f=2134";
  const K9EMC_IMG = "https://i.imgur.com/fKnA8Rv.png";
  const ID = ["name","handler","breed","age","sex","date","time","vet","clinic","narrative","airway","breathing","circulation","emerg-comments","general","eent","oral","skin","cardio","resp","musc","neuro","abd","clin-comments","blood","urine","fecal","imaging","results","treatment","vacc","meds","followup","disposition"];
  const g = (i) => $("kem-" + i);
  // pure: v = { key: string }, dateTime already formatted
  function k9emcBuild(v) {
    return [
      "[block=1,20,black,white]",
      "[center][img]" + K9EMC_IMG + "[/img]",
      "[b][size=150]K-9 Emergency Medical Care[/size][/b][/center]",
      "[hr]",
      "[b]K-9 Name:[/b] " + v.name,
      "[b]Handler (rank, name, badge number):[/b] " + v.handler,
      "[b]Breed:[/b] " + v.breed,
      "[b]Age:[/b] " + v.age,
      "[b]Sex:[/b] " + v.sex,
      "[b]Date & Time of Incident:[/b] " + v.dateTime,
      "[b]Veterinarian/Veterinary Technician:[/b] " + v.vet,
      "[b]Clinic Name:[/b] " + v.clinic,
      "[b]Narrative:[/b]",
      "[quote]" + v.narrative + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Emergency survey[/b][/size]",
      "[b]Airway:[/b] " + v.airway,
      "[b]Breathing:[/b] " + v.breathing,
      "[b]Circulation:[/b] " + v.circulation,
      "",
      "[b]Comments/Findings:[/b]",
      "[quote]" + v.emergComments + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Clinical survey[/b][/size]",
      "[b]General Appearance:[/b] " + v.general,
      "[b]Eyes/Ears/Nose/Throat:[/b] " + v.eent,
      "[b]Oral/Dental Health:[/b] " + v.oral,
      "[b]Skin/Coat Condition:[/b] " + v.skin,
      "[b]Cardiovascular System:[/b] " + v.cardio,
      "[b]Respiratory System:[/b] " + v.resp,
      "[b]Musculoskeletal System:[/b] " + v.musc,
      "[b]Neurological Exam:[/b] " + v.neuro,
      "[b]Abdominal Palpation:[/b] " + v.abd,
      "",
      "[b]Comments/Findings:[/b]",
      "[quote]" + v.clinComments + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Laboratory & Diagnostic Tests[/b][/size]",
      "[b]Bloodwork Performed:[/b] " + v.blood,
      "[b]Urinalysis:[/b] " + v.urine,
      "[b]Fecal Exam:[/b] " + v.fecal,
      "[b]X-rays / Imaging:[/b] " + v.imaging,
      "",
      "[b]Results/Interpretation:[/b]",
      "[quote]" + v.results + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Medications & Treatments[/b][/size]",
      "[b]Treatment / Interventions:[/b]",
      "[quote]" + v.treatment + "[/quote]",
      "",
      "[b]Emergency Vaccination:[/b] " + v.vacc,
      "[b]Medications Prescribed:[/b]",
      "[quote]" + v.meds + "[/quote]",
      "",
      "[b]Follow-up Care:[/b]",
      "[quote]" + v.followup + "[/quote]",
      "",
      "[b]Disposition:[/b]",
      "[quote]" + v.disposition + "[/quote]",
      "",
      "[hr]",
      "",
      "[quote=K9 Handler][/quote]",
      "[quote=K9 Supervisor][/quote]",
      "[quote=Lead Veterinarian][/quote][/block]",
    ].join("\n");
  }
  const civPrefix = () => ($("kem-civ").checked ? "[postas=" + $("kem-civ-name").value.trim() + ",CIV]\n" : "");
  function k9emcTitle(name) {
    return "[K9 " + String(name || "").trim().replace(/^k-?9[\s-]+/i, "").trim() + "] Emergency Care";
  }
  const ML = new Set(["narrative","emerg-comments","clin-comments","results","treatment","meds","followup","disposition"]);
  function values() {
    const v = {};
    ID.forEach((i) => { v[i.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = ML.has(i) ? g(i).value : g(i).value.trim(); });
    v.dateTime = g("date").value ? formatPickerDate(g("date").value, "time-date", g("time").value) : "";
    return v;
  }
  function refresh() {
    $("kem-civ-wrap").hidden = !$("kem-civ").checked;
    $("kem-title").value = k9emcTitle(g("name").value);
  }
  function applyDeputy() {
    const rn = [$("deputy-rank").value, $("deputy-full-name").value.trim()].filter(Boolean).join(" ");
    prefillDeputyField("kem-vet", rn);
    refresh();
  }
  window.resetK9Emc = function () {
    ID.forEach((i) => { if (i !== "sex" && i !== "date" && i !== "time") g(i).value = ""; });
    g("sex").selectedIndex = 0;
    $("kem-civ").checked = false; $("kem-civ-name").value = "";
    g("date").value = taskListTodayDate();
    g("time").value = "00:00";
    updateTaskListDateLabel("kem-date");
    $("kem-vet").dataset.deputyPrefill = "";
    applyDeputy();
    growAllTextareas("f-k9-emc");
  };
  g("date").value = taskListTodayDate();
  updateTaskListDateLabel("kem-date");
  $("kem-forum").href = K9EMC_FORUM_URL;
  const form = $("f-k9-emc");
  ["input", "change", "click"].forEach((ev) => form.addEventListener(ev, (e) => {
    if (ev === "input" && e.target.matches("textarea")) growTextarea(e.target);
    refresh();
  }));
  ["deputy-full-name", "deputy-rank", "deputy-badge-number"].forEach((id) =>
    ["input", "change"].forEach((ev) => $(id).addEventListener(ev, applyDeputy)));
  $("f-deputy").addEventListener("click", (e) => { if (e.target.closest("button")) applyDeputy(); });
  applyDeputy();
  window.__k9emc = { build: k9emcBuild, title: k9emcTitle, values, prefix: civPrefix };

  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "k9-emc") return baseCopy.apply(this, arguments);
    const txt = civPrefix() + k9emcBuild(values());
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  const baseShow = window.show;
  window.show = function (k) {
    baseShow.apply(this, arguments);
    if (k === "k9-emc") { refresh(); growAllTextareas("f-k9-emc"); }
  };
})();

/* ===== VST: K9 Checkup Card ===== */
(() => {
  const K9CC_FORUM_URL = "https://lssd.gta.world/viewforum.php?f=2100";
  const K9CC_IMG = "https://i.imgur.com/fKnA8Rv.png";
  const g = (i) => $("kcc-" + i);
  // One template per mode, so either can be changed without touching the other.
  function tplFirst(v) {
    return [
      "[block=1,20,black,white]",
      "[center][img]https://i.imgur.com/fKnA8Rv.png[/img]",
      "[b][size=150]K-9 Veterinary Patient Card[/size][/b][/center]",
      "[hr]",
      "[b]K-9 Name:[/b] " + v.name,
      "[b]Handler (rank, name, badge number):[/b] " + v.handler,
      "[b]Breed:[/b] " + v.breed,
      "[b]Age:[/b] " + v.age,
      "[b]Sex:[/b] " + v.sex,
      "[b]Date of Examination:[/b] " + v.date,
      "[b]Veterinarian/Veterinary Technician:[/b] " + v.vet,
      "[b]Clinic Name:[/b] " + v.clinic,
      "",
      "[hr]",
      "",
      "[size=120][b]Physical Examination[/b][/size]",
      "[b]Weight:[/b] " + v.weight,
      "[b]Temperature:[/b] " + v.temp,
      "[b]Heart Rate:[/b] " + v.hr,
      "[b]Respiration Rate:[/b] " + v.rr,
      "[b]Body Condition Score (1–9):[/b] " + v.bcs,
      "",
      "[b]General Appearance:[/b] " + v.sysGeneral,
      "[b]Eyes/Ears/Nose/Throat:[/b] " + v.sysEent,
      "[b]Oral/Dental Health:[/b] " + v.sysOral,
      "[b]Skin/Coat Condition:[/b] " + v.sysSkin,
      "[b]Cardiovascular System:[/b] " + v.sysCardio,
      "[b]Respiratory System:[/b] " + v.sysResp,
      "[b]Musculoskeletal System:[/b] " + v.sysMusc,
      "[b]Neurological Exam:[/b] " + v.sysNeuro,
      "[b]Abdominal Palpation:[/b] " + v.sysAbd,
      "",
      "[b]Comments/Findings:[/b]",
      "[quote]" + v.comments + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Vaccinations & Preventatives[/b][/size]",
      "[b]Rabies:[/b] " + v.rabies,
      "[b]Distemper/Parvo (DHPP):[/b] " + v.dhpp,
      "[b]Bordetella:[/b] " + v.bord,
      "[b]Leptospirosis:[/b] " + v.lepto,
      "[b]Lyme Disease:[/b] " + v.lyme,
      "",
      "[b]Heartworm Test:[/b] " + v.hwtest,
      "[b]Heartworm Preventative Given:[/b] " + v.hwprev,
      "[b]Flea/Tick Preventative Given:[/b] " + v.flea,
      "[b]Deworming Completed:[/b] " + v.deworm,
      "",
      "[b]Vaccination Notes:[/b]",
      "[quote]" + v.vnotes + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Laboratory & Diagnostic Tests[/b][/size]",
      "[b]Bloodwork Performed:[/b] " + v.blood,
      "[b]Urinalysis:[/b] " + v.urine,
      "[b]Fecal Exam:[/b] " + v.fecal,
      "[b]X-rays / Imaging:[/b] " + v.imaging,
      "",
      "[b]Results/Interpretation:[/b]",
      "[quote]" + v.results + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Medications & Treatments[/b][/size]",
      "[b]Medications Prescribed:[/b]",
      "[quote]" + v.meds + "[/quote]",
      "",
      "[b]Follow-up Care / Recommendations:[/b]",
      "[quote]" + v.followup + "[/quote]",
      "",
      "[hr]",
      "[b]Next Scheduled Checkup:[/b] " + v.next,
      "",
      "[quote=K9 Handler][/quote]",
      "[quote=K9 Supervisor][/quote]",
      "[quote=Lead Veterinarian][/quote][/block]",
    ].join("\n");
  }

  function tplFollow(v) {
    return [
      "[block=1,20,black,white]",
      "[center][img]https://i.imgur.com/fKnA8Rv.png[/img]",
      "[b][size=150]K-9 Veterinary Patient Card[/size][/b][/center]",
      "[hr]",
      "[b]K-9 Name:[/b] " + v.name,
      "[b]Handler (rank, name, badge number):[/b] " + v.handler,
      "[b]Breed:[/b] " + v.breed,
      "[b]Age:[/b] " + v.age,
      "[b]Sex:[/b] " + v.sex,
      "[b]Date of Examination:[/b] " + v.date,
      "[b]Veterinarian/Veterinary Technician:[/b] " + v.vet,
      "[b]Clinic Name:[/b] " + v.clinic,
      "",
      "[hr]",
      "",
      "[size=120][b]Physical Examination[/b][/size]",
      "[b]Weight:[/b] " + v.weight,
      "[b]Temperature:[/b] " + v.temp,
      "[b]Heart Rate:[/b] " + v.hr,
      "[b]Respiration Rate:[/b] " + v.rr,
      "[b]Body Condition Score (1–9):[/b] " + v.bcs,
      "",
      "[b]General Appearance:[/b] " + v.sysGeneral,
      "[b]Eyes/Ears/Nose/Throat:[/b] " + v.sysEent,
      "[b]Oral/Dental Health:[/b] " + v.sysOral,
      "[b]Skin/Coat Condition:[/b] " + v.sysSkin,
      "[b]Cardiovascular System:[/b] " + v.sysCardio,
      "[b]Respiratory System:[/b] " + v.sysResp,
      "[b]Musculoskeletal System:[/b] " + v.sysMusc,
      "[b]Neurological Exam:[/b] " + v.sysNeuro,
      "[b]Abdominal Palpation:[/b] " + v.sysAbd,
      "",
      "[b]Comments/Findings:[/b]",
      "[quote]" + v.comments + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Vaccinations & Preventatives[/b][/size]",
      "[b]Rabies:[/b] " + v.rabies,
      "[b]Distemper/Parvo (DHPP):[/b] " + v.dhpp,
      "[b]Bordetella:[/b] " + v.bord,
      "[b]Leptospirosis:[/b] " + v.lepto,
      "[b]Lyme Disease:[/b] " + v.lyme,
      "",
      "[b]Heartworm Test:[/b] " + v.hwtest,
      "[b]Heartworm Preventative Given:[/b] " + v.hwprev,
      "[b]Flea/Tick Preventative Given:[/b] " + v.flea,
      "[b]Deworming Completed:[/b] " + v.deworm,
      "",
      "[b]Vaccination Notes:[/b]",
      "[quote]" + v.vnotes + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Laboratory & Diagnostic Tests[/b][/size]",
      "[b]Bloodwork Performed:[/b] " + v.blood,
      "[b]Urinalysis:[/b] " + v.urine,
      "[b]Fecal Exam:[/b] " + v.fecal,
      "[b]X-rays / Imaging:[/b] " + v.imaging,
      "",
      "[b]Results/Interpretation:[/b]",
      "[quote]" + v.results + "[/quote]",
      "",
      "[hr]",
      "",
      "[size=120][b]Medications & Treatments[/b][/size]",
      "[b]Medications Prescribed:[/b]",
      "[quote]" + v.meds + "[/quote]",
      "",
      "[b]Follow-up Care / Recommendations:[/b]",
      "[quote]" + v.followup + "[/quote]",
      "",
      "[hr]",
      "[b]Next Scheduled Checkup:[/b] " + v.next,
      "",
      "[quote=K9 Handler][/quote]",
      "[quote=K9 Supervisor][/quote]",
      "[quote=Lead Veterinarian][/quote][/block]",
    ].join("\n");
  }

  function tplMedical(v) {
    return [
      "[block=1,20,black,white]",
      "[center][img]" + K9CC_IMG + "[/img]",
      "[b][size=150]Medical Tests[/size][/b][/center]",
      "[b][url=" + v.link + "]" + v.topic + "[/url][/b][/block]",
    ].join("\n");
  }
  function kccTitle(name) {
    return "[K9 " + String(name || "").trim().replace(/^k-?9[\s-]+/i, "").trim() + "] Patient Card";
  }
  const SYS = ["general", "eent", "oral", "skin", "cardio", "resp", "musc", "neuro", "abd"];
  const TXT = ["name", "handler", "breed", "age", "sex", "vet", "clinic", "weight", "temp", "hr", "rr", "bcs", "link", "topic"];
  const SEL = ["rabies", "dhpp", "bord", "lepto", "lyme", "hwtest", "hwprev", "flea", "deworm", "blood", "urine", "fecal", "imaging"];
  const radio = (id) => (document.querySelector('input[name="kcc-' + id + '"]:checked') || {}).value || "";
  const ML = ["comments", "vnotes", "results", "meds", "followup"];
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  function mode() { return (document.querySelector('input[name="kcc-mode"]:checked') || {}).value || "first"; }
  function values() {
    const v = {};
    TXT.forEach((i) => (v[i] = g(i).value.trim()));
    ML.forEach((i) => (v[i] = g(i).value));
    SEL.forEach((i) => (v[i] = radio(i)));
    SYS.forEach((i) => {
      v["sys" + cap(i)] = radio("sys-" + i);
    });
    v.date = g("date").value ? formatPickerDate(g("date").value) : "";
    v.next = g("next").value ? formatPickerDate(g("next").value) : "";
    return v;
  }
  function prefix() {
    if (!g("civ").checked) return "";
    return "[postas=" + g("civ-name").value.trim() + ",CIV]\n";
  }
  function kccBuild(m, v, civ) {
    const body = (m === "test" ? tplMedical : m === "follow" ? tplFollow : tplFirst)(v);
    return (civ === undefined ? prefix() : civ) + body;
  }
  function refresh() {
    const m = mode();
    const cards = [...form.querySelectorAll(":scope > .card")], links = [...form.querySelectorAll(".rail .outline a")];
    cards.forEach((c, i) => {
      const hide = !!c.dataset.kcc && c.dataset.kcc !== (m === "test" ? "test" : "checkup");
      c.hidden = hide;
      if (links.length === cards.length) links[i].hidden = hide;
    });
    $("kcc-badge").hidden = m !== "follow";
    $("kcc-civ-wrap").hidden = !g("civ").checked;
    $("kcc-link-hint").hidden = m !== "test" || !!g("link").value.trim();
    $("kcc-title").value = kccTitle(g("name").value);
  }
  function applyDeputy() {
    prefillDeputyField("kcc-vet", [$("deputy-rank").value, $("deputy-full-name").value.trim()].filter(Boolean).join(" "));
    refresh();
  }
  window.resetK9Checkup = function () {
    TXT.forEach((i) => { const e = g(i); if (e.tagName === "SELECT") e.selectedIndex = 0; else e.value = ""; });
    ML.forEach((i) => (g(i).value = ""));
    SEL.concat(SYS.map((i) => "sys-" + i)).forEach((i) => document.querySelectorAll('input[name="kcc-' + i + '"]').forEach((r) => (r.checked = r.defaultChecked)));
    g("civ").checked = false; g("civ-name").value = "";
    g("date").value = taskListTodayDate(); g("next").value = "";
    updateTaskListDateLabel("kcc-date"); updateTaskListDateLabel("kcc-next");
    g("vet").dataset.deputyPrefill = "";
    applyDeputy();
    growAllTextareas("f-k9-checkup");
  };
  g("date").value = taskListTodayDate();
  updateTaskListDateLabel("kcc-date");
  $("kcc-forum").href = K9CC_FORUM_URL;
  const form = $("f-k9-checkup");
  ["input", "change", "click"].forEach((ev) => form.addEventListener(ev, (e) => {
    if (ev === "input" && e.target.matches("textarea")) growTextarea(e.target);
    refresh();
  }));
  ["deputy-full-name", "deputy-rank"].forEach((id) =>
    ["input", "change"].forEach((ev) => $(id).addEventListener(ev, applyDeputy)));
  $("f-deputy").addEventListener("click", (e) => { if (e.target.closest("button")) applyDeputy(); });
  applyDeputy();
  window.__kcc = { first: tplFirst, follow: tplFollow, medical: tplMedical, title: kccTitle, values, build: kccBuild };

  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "k9-checkup") return baseCopy.apply(this, arguments);
    const txt = kccBuild(mode(), values());
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  const baseShow = window.show;
  window.show = function (k) {
    baseShow.apply(this, arguments);
    if (k === "k9-checkup") { refresh(); growAllTextareas("f-k9-checkup"); }
  };
})();

/* ===== VST: Laboratory Services Report (Autopsy / Biopsy / Blood Screening) ===== */
(() => {
  const LAB_REPORTS_FORUM_URL = "https://lssd.gta.world/viewforum.php?f=1674";
  const LR_IMG = "https://i.imgur.com/fKnA8Rv.png";
  const g = (i) => $("lr-" + i);
  const TYPES = { autopsy: "Autopsy Report", biopsy: "Biopsy Report", blood: "Blood Screening Report" };
  // One template per report type.
  function tplAutopsy(v) {
    return [
      "[block=1,20,black,white]",
      "[center][imgmh=200]https://i.imgur.com/fKnA8Rv.png[/imgmh][/center]",
      "[b][center]VETERINARY AUTOPSY REPORT[/center][/b]",
      "[b]Attending Veterinarian:[/b] " + v.vet,
      "[b]Date and Time:[/b] " + v.dateTime,
      "",
      "[b][u]Patient Information[/u][/b]",
      "[b]Name:[/b] " + v.name,
      "[b]Species:[/b] " + v.species,
      "[b]Breed:[/b] " + v.breed,
      "[b]Age:[/b] " + v.age,
      "[b]Sex:[/b] " + v.sex,
      "[b]Color/Markings:[/b] " + v.a_color,
      "",
      "[b][u]Clinical History[/u][/b]",
      "[list]Presenting signs and symptoms:",
      "Results: " + v.a_ch1,
      "[*]Duration of illness:",
      "Results: " + v.a_ch2,
      "[*]Treatment history:",
      "Results: " + v.a_ch3,
      "[*]Previous medical conditions:",
      "Results: " + v.a_ch4 + "[/list]",
      "",
      "[b][u]Date and Time of Death:[/u][/b]",
      "[list]" + v.deathDate + "[/list]",
      "",
      "[b][u]Circumstances of Death:[/u][/b] (Brief description of the circumstances leading to death (e.g., sudden onset, progressive illness, trauma))",
      "[b]Description:[/b] " + v.a_circ,
      "",
      "[b][u]External Examination[/u][/b]",
      "[list]General condition of the body:",
      "Results: " + v.a_ex1,
      "[*]Signs of trauma or injury:",
      "Results: " + v.a_ex2,
      "[*]Presence of parasites:",
      "Results: " + v.a_ex3,
      "[*]External abnormalities:",
      "Results: " + v.a_ex4 + "[/list]",
      "",
      "[b][u]Internal Examination[/u][/b]",
      "[list]Body cavities opened (thoracic, abdominal, cranial):",
      "Results: " + v.a_in1,
      "[*]Description of major organs:",
      "Results: " + v.a_in2,
      "[*]Size, color, texture, consistency:",
      "Results: " + v.a_in3,
      "[*]Presence of abnormalities, lesions, or tumors:",
      "Results: " + v.a_in4,
      "[*]Description of major organ systems:",
      "Results: " + v.a_in5,
      "[*]Any abnormalities noted in each system:",
      "Results: " + v.a_in6 + "[/list]",
      "",
      "[b][u]Sample Collection[/u][/b]",
      "Results: " + v.a_sample,
      "",
      "[b][u]Conclusion[/u][/b]",
      "[list]Cause of death:",
      "Results: " + v.a_co1,
      "[*]Contributing factors:",
      "Results: " + v.a_co2,
      "[*]Differential diagnoses considered:",
      "Results: " + v.a_co3 + "[/list]",
      "",
      "[b]Additional Notes:[/b] " + v.a_notes,
      "",
      "[b]Signature:[/b] " + v.sig + "[/block]",
    ].join("\n");
  }

  function tplBiopsy(v) {
    return [
      "[block=1,20,black,white]",
      "[center][imgmh=200]https://i.imgur.com/fKnA8Rv.png[/imgmh][/center]",
      "[b][center]VETERINARY BIOPSY REPORT[/center][/b]",
      "",
      "[b]Attending Veterinarian:[/b] " + v.vet,
      "[b]Date and Time:[/b] " + v.dateTime,
      "",
      "[b][u]Patient Information:[/u][/b]",
      "",
      "Name: " + v.name,
      "Species: " + v.species,
      "Breed: " + v.breed,
      "Age: " + v.age,
      "Gender: " + v.sex,
      "Handler: " + v.handler,
      "",
      "[b][u]Biopsy Procedure:[/u][/b]",
      "",
      "[b]Type of Biopsy: [/b]",
      v.biopsyType,
      "",
      "[b]Tissue Sample Location:[/b] " + v.b_loc,
      "",
      "[b][u]Microscopic Examination:[/u][/b]",
      "",
      "[b]Staining Method:[/b] " + v.b_stain,
      "",
      "[b]Magnification: [/b]" + v.b_mag,
      "Findings:",
      "",
      "[b]Description of Tissue Characteristics:[/b] " + v.b_tissue,
      "Abnormalities Detected: " + v.b_abn,
      "Final Diagnosis: " + v.b_diag,
      "",
      "Interpretation:",
      v.b_interp,
      "",
      "[b]Diagnostic Report:[/b]",
      v.b_report,
      "",
      "[b]Recommendations:[/b]",
      v.b_recs,
      "",
      "[i][b]Signature:[/b][/i] " + v.sig + "[/block]",
    ].join("\n");
  }

  const cb = (on) => (on ? "[cbc][/cbc]" : "[cb][/cb]");
  const TESTS = [["cbc", "Complete Blood Count (CBC)"], ["chem", "Serum Chemistry Profile"], ["hw", "Canine Heartworm Antigen Test"], ["lyme", "Canine Lyme Disease Antibody Test"], ["ehr", "Canine Ehrlichia Antibody Test"], ["ana", "Canine Anaplasma Antibody Test"]];
  const CBC = [["c_rbc", "Red Blood Cells (RBC)", "million/µL"], ["c_wbc", "White Blood Cells (WBC)", "thousand/µL"], ["c_hb", "Hemoglobin (Hb)", "g/dL"], ["c_hct", "Hematocrit (HCT)", "%"], ["c_plt", "Platelets", "thousand/µL"]];
  const CHEM = [["c_bun", "Blood Urea Nitrogen (BUN)", "mg/dL"], ["c_cre", "Creatinine", "mg/dL"], ["c_glu", "Glucose", "mg/dL"], ["c_tp", "Total Protein", "g/dL"], ["c_alb", "Albumin", "g/dL"], ["c_alp", "Alkaline Phosphatase (ALP)", "U/L"], ["c_alt", "Alanine Aminotransferase (ALT)", "U/L"], ["c_ca", "Calcium", "mg/dL"], ["c_phos", "Phosphorus", "mg/dL"]];
  function tplBlood(v) {
    const L = [
      "[block=1,20,black,white]",
      "[center][imgmh=200]" + LR_IMG + "[/imgmh][/center]",
      "[b][center]VETERINARY BLOOD SCREENING REPORT[/center][/b]",
      "[b]Attending Veterinarian:[/b] " + v.vet,
      "[b]Date and Time:[/b] " + v.dateTime,
      "",
      "[b][u]Patient Information:[/u][/b]",
      "Name: " + v.name,
      "Species: " + v.species,
      "Breed: " + v.breed,
      "Age: " + v.age,
      "Sex: " + v.sex,
      "Weight: " + v.c_weight,
      "Handler's name: " + v.handler,
      "",
      "[b][u]Test Panel:[/u][/b]",
    ];
    TESTS.forEach(([k, label]) => L.push(cb(v.tests[k]) + " " + label));
    L.push("", "[b][u]Results:[/u][/b]");
    if (v.tests.cbc) {
      L.push("Complete Blood Count (CBC):");
      CBC.forEach(([k, label, unit]) => L.push(label + ": " + v[k] + " " + unit));
    }
    if (v.tests.chem) {
      L.push("Serum Chemistry Profile:");
      CHEM.forEach(([k, label, unit]) => L.push(label + ": " + v[k] + " " + unit));
    }
    L.push("");
    TESTS.slice(2).forEach(([k, label]) => {
      if (!v.tests[k]) return;
      L.push("[b][u]" + label + ":[/u][/b]", "Result: " + cb(v.res[k] === "neg") + " Negative / " + cb(v.res[k] === "pos") + " Positive", "");
    });
    L.push("[b]Comments/Interpretation:[/b]", v.c_comments, "", "[b]Recommendations:[/b]", v.c_recs, "", "Signature: " + v.sig, "[/block]");
    return L.join("\n");
  }
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function lrDate(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    return m ? m[3] + "/" + MONTHS[+m[2] - 1] + "/" + m[1] : "";
  }
  function lrTitle(type) { return "[VET-#NUMBER] " + (TYPES[type] || TYPES.autopsy); }
  function lrNotify(requested, supervisor) {
    return [requested, supervisor].map((n) => String(n || "").trim()).filter(Boolean).map((n) => "[quote=" + n + "][/quote]").join("\n");
  }
  const TXT = ["vet", "name", "species", "breed", "age", "sex", "handler", "sig", "a-color", "b-loc", "b-stain", "b-mag", "c-weight"].concat(CBC.concat(CHEM).map((x) => x[0].replace(/_/g, "-")));
  const ML = ["a-ch1", "a-ch2", "a-ch3", "a-ch4", "a-circ", "a-ex1", "a-ex2", "a-ex3", "a-ex4", "a-in1", "a-in2", "a-in3", "a-in4", "a-in5", "a-in6", "a-sample", "a-co1", "a-co2", "a-co3", "a-notes", "b-tissue", "b-abn", "b-diag", "b-interp", "b-report", "b-recs", "c-comments", "c-recs"];
  const key = (i) => i.replace(/-/g, "_");
  function type() { return (document.querySelector('input[name="lr-type"]:checked') || {}).value || "autopsy"; }
  function values() {
    const v = {};
    TXT.forEach((i) => (v[key(i)] = g(i).value.trim()));
    ML.forEach((i) => (v[key(i)] = g(i).value));
    const t = g("date").value ? lrDate(g("date").value) : "", tm = g("time").value;
    v.dateTime = t ? (tm ? t + " - " + tm : t) : "";
    v.deathDate = lrDate(g("death").value);
    const bt = g("b-type").value;
    v.biopsyType = bt === "Other" ? g("b-type-other").value.trim() || "Other" : bt;
    v.tests = {}; v.res = {};
    TESTS.forEach(([k]) => {
      v.tests[k] = g("t-" + k).checked;
      const r = document.querySelector('input[name="lr-r-' + k + '"]:checked');
      v.res[k] = r ? r.value : "neg";
    });
    return v;
  }
  function prefix() {
    if (!g("civ").checked) return "";
    return "[postas=" + g("civ-name").value.trim() + ",CIV]\n";
  }
  function lrBuild(t, v, civ) {
    const body = (t === "biopsy" ? tplBiopsy : t === "blood" ? tplBlood : tplAutopsy)(v);
    return (civ === undefined ? prefix() : civ) + body;
  }
  function refresh() {
    const t = type();
    const cards = [...form.querySelectorAll(":scope > .card")], links = [...form.querySelectorAll(".rail .outline a")];
    cards.forEach((c, i) => {
      const hide = !!c.dataset.lr && c.dataset.lr !== t;
      c.hidden = hide;
      if (links.length === cards.length) links[i].hidden = hide;
    });
    $("lr-civ-wrap").hidden = !g("civ").checked;
    $("lr-b-type-other-wrap").hidden = g("b-type").value !== "Other";
    TESTS.forEach(([k]) => form.querySelectorAll('[data-for="lr-t-' + k + '"]').forEach((e) => (e.hidden = !g("t-" + k).checked)));
    $("lr-title").value = lrTitle(t);
    const n = lrNotify(g("req").value, g("sup").value);
    $("lr-notify").value = n;
    $("lr-notify-wrap").hidden = !n;
    $("lr-notify-hint").hidden = !!n;
  }
  function applyDeputy() {
    const full = $("deputy-full-name").value.trim();
    prefillDeputyField("lr-vet", [$("deputy-rank").value, full].filter(Boolean).join(" "));
    prefillDeputyField("lr-sig", full);
    refresh();
  }
  window.resetLabReport = function () {
    const card = form.querySelector('.card[data-lr="' + type() + '"]');
    card.querySelectorAll("input, textarea, select").forEach((e) => {
      if (e.type === "checkbox" || e.type === "radio") e.checked = e.defaultChecked;
      else if (e.tagName === "SELECT") e.selectedIndex = 0;
      else e.value = e.defaultValue;
    });
    updateTaskListDateLabel("lr-death");
    refresh();
    growAllTextareas("f-vet-lab-report");
  };
  async function clip(txt) {
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  }
  function aiPrompt() {
    const t = type(), v = values();
    if (t === "autopsy") return "";
    const what = t === "biopsy" ? "biopsy report results" : "blood test report results";
    const L = ["Generate a randomized " + what + " using the provided criteria and patient information.", "", "Patient information:", "Name: " + v.name, "Species: " + v.species, "Breed: " + v.breed, "Age: " + v.age, "Sex: " + v.sex];
    if (t === "biopsy") L.push("Handler: " + v.handler, "", "Biopsy:", "Type of biopsy: " + v.biopsyType, "Tissue sample location: " + v.b_loc, "Staining method: " + v.b_stain, "Magnification: " + v.b_mag);
    else L.push("Weight: " + v.c_weight, "Handler: " + v.handler, "", "Tests performed: " + (TESTS.filter(([k]) => v.tests[k]).map((x) => x[1]).join(", ") || "none selected"));
    return L.join("\n");
  }
  window.copyLabAiPrompt = () => clip(aiPrompt());
  const form = $("f-vet-lab-report");
  g("date").value = taskListTodayDate();
  updateTaskListDateLabel("lr-date");
  $("lr-forum").href = LAB_REPORTS_FORUM_URL;
  ["input", "change", "click"].forEach((ev) => form.addEventListener(ev, (e) => {
    if (ev === "input" && e.target.matches("textarea")) growTextarea(e.target);
    refresh();
  }));
  ["deputy-full-name", "deputy-rank"].forEach((id) =>
    ["input", "change"].forEach((ev) => $(id).addEventListener(ev, applyDeputy)));
  $("f-deputy").addEventListener("click", (e) => { if (e.target.closest("button")) applyDeputy(); });
  applyDeputy();
  window.__lr = { build: lrBuild, values, title: lrTitle, notify: lrNotify, aiPrompt, type };

  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "vet-lab-report") return baseCopy.apply(this, arguments);
    return clip(lrBuild(type(), values()));
  };
  const baseShow = window.show;
  window.show = function (k) {
    baseShow.apply(this, arguments);
    if (k === "vet-lab-report") { refresh(); growAllTextareas("f-vet-lab-report"); }
  };
})();

/* ===== SSB: Forensic Lab Workspace (sessions, identifier manager, evidence records, nine report types) ===== */
(() => {
  const host = document.getElementById("f-forensic-lab");
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>
:host([hidden]){display:none}
:host{display:block;box-sizing:border-box;color:var(--tx);font:14px/1.5 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--pn:var(--panel);--p2:color-mix(in srgb,var(--green2) 14%,var(--panel));--tx:var(--text);--mu:var(--mute);--bd:var(--line);--ac:var(--green);--er:#e0605e;--ok:var(--green);--ring:color-mix(in srgb,var(--green) 32%,transparent);--sh:0 1px 2px rgba(0,0,0,.18),0 8px 24px rgba(0,0,0,.12)}
*,*::before,*::after{box-sizing:border-box}
.top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px;background:var(--pn);border:1px solid var(--bd);border-radius:14px 14px 0 0}
.brand{display:flex;align-items:center;gap:10px;font:600 12px/1 Inter,sans-serif;letter-spacing:.16em}
.brand svg{width:22px;height:22px;color:var(--ac)}
#act{margin-left:auto}
#ind{font-size:12px;color:var(--ok);display:flex;align-items:center;gap:7px}
#ind.er{color:var(--er)}
#ind::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:currentColor}
#ind.sv{color:var(--mu)}#ind.sv::before{animation:pulse .9s ease-in-out infinite}
nav{display:flex;gap:4px;padding:8px 10px;background:var(--pn);border:1px solid var(--bd);border-top:0;border-radius:0 0 14px 14px;overflow-x:auto;margin-bottom:20px}
nav button{white-space:nowrap;border:0;background:transparent;color:var(--mu);padding:7px 13px;border-radius:99px;font-weight:600;font-size:13px}
nav button:hover{color:var(--tx);background:var(--p2);border-color:transparent}
nav button.on{background:color-mix(in srgb,var(--ac) 18%,transparent);color:var(--ac)}
main{padding:0}
.ph{margin:0 0 16px}
.ph h2{margin:0;font:600 24px/1.15 "Barlow Condensed",Inter,sans-serif;letter-spacing:.02em}
.ph .sub{margin:5px 0 0;color:var(--mu);max-width:78ch}
.sub-h{margin:22px 0 10px;font:600 12px/1.2 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.card{background:var(--pn);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;margin-bottom:14px}
.card-h{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.card h3{margin:0;font:600 12px/1.2 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.card.empty,.empty{padding:18px;text-align:center;color:var(--mu)}
.empty-s{margin:0 0 10px;color:var(--mu);font-size:13px}
.mu{color:var(--mu)}
p{margin:0 0 10px}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px 16px;align-items:start}
.w{grid-column:1/-1}
.fl{display:flex;flex-direction:column;gap:6px;margin:0;font-size:12px;font-weight:600;color:var(--mu);min-width:0}
.fl.grow{flex:2 1 260px}
input:not([type=checkbox]):not([type=radio]),select,textarea{display:block;width:100%;padding:9px 12px;background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:10px;font:inherit;font-size:13.5px;font-weight:400;transition:border-color .18s,box-shadow .18s}
input:not([type=checkbox]):not([type=radio]),select{height:42px}
select{appearance:auto}
textarea{min-height:78px;resize:vertical;line-height:1.45}
.mono,code,.ln{font-family:ui-monospace,Menlo,Consolas,monospace}
textarea.mono{font-size:12px}
input:focus,select:focus,textarea:focus{outline:0;border-color:var(--ac);box-shadow:0 0 0 3px var(--ring)}
input::placeholder,textarea::placeholder{color:color-mix(in srgb,var(--mu) 70%,transparent)}
.filepick{position:relative;display:flex;align-items:center;gap:10px;height:42px;padding:0 8px;border:1px solid var(--bd);border-radius:10px;background:transparent;cursor:pointer;font-weight:400;transition:border-color .18s,box-shadow .18s}
.filepick:hover{border-color:var(--ac)}
.filepick:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px var(--ring)}
.filepick input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;padding:0;border:0}
.fp-btn{flex:0 0 auto;padding:4px 12px;border-radius:8px;background:color-mix(in srgb,var(--ac) 16%,transparent);color:var(--ac);font-size:12.5px;font-weight:600}
.fp-name{min-width:0;color:var(--mu);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
button{font:inherit;font-size:13px;font-weight:600;padding:8px 15px;margin:0;background:var(--pn);color:var(--tx);border:1px solid var(--bd);border-radius:10px;cursor:pointer;transition:background .18s,border-color .18s,transform .12s,filter .18s}
button:hover{border-color:var(--ac)}button:active{transform:scale(.97)}
button.p{background:var(--ac);border-color:var(--ac);color:#fff}button.p:hover{filter:brightness(1.1)}
button.d{color:var(--er);border-color:color-mix(in srgb,var(--er) 45%,var(--bd))}button.d:hover{background:var(--er);border-color:var(--er);color:#fff}
button.sm{padding:4px 12px;font-size:12.5px;border-radius:8px}
button:focus-visible,summary:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.seg{display:inline-flex;border:1px solid var(--bd);border-radius:10px;overflow:hidden;background:var(--bg)}
.seg button{border:0;border-radius:0;background:transparent;color:var(--mu);padding:6px 13px;font-size:12.5px;border-right:1px solid var(--bd)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--ac);color:#fff}
.seg.big{display:flex;margin-bottom:14px;max-width:100%;overflow-x:auto}.seg.big button{flex:1;white-space:nowrap;padding:9px 14px;font-size:13px}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0}
.card-h+.toolbar{margin-top:0}
.bar{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px}
.bar>.fl{flex:1 1 170px}
.addrow{display:flex;gap:8px;margin-top:12px}.addrow input{flex:1}.addrow button{flex:0 0 auto;height:42px}
.stack{margin-top:12px}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{display:inline-block;font-size:11px;font-weight:600;padding:2px 10px;border-radius:99px;background:var(--p2);color:var(--mu);border:1px solid var(--bd);line-height:1.5}
.tag.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 40%,var(--bd))}
.tag.act{color:var(--ac);border-color:color-mix(in srgb,var(--ac) 50%,var(--bd));background:color-mix(in srgb,var(--ac) 12%,transparent)}
.tag.er{color:var(--er);border-color:color-mix(in srgb,var(--er) 45%,var(--bd))}
.st{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px}
.st div{background:var(--p2);border-radius:10px;padding:10px 13px;font-size:12px;color:var(--mu)}
.st b{display:block;font:600 26px/1.1 "Barlow Condensed",Inter,sans-serif;color:var(--tx);font-variant-numeric:tabular-nums}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-bottom:6px}
.tiles.sm{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.tile{display:flex;gap:12px;align-items:flex-start;text-align:left;padding:14px;border-radius:12px;background:var(--pn)}
.tile:hover{border-color:var(--ac);transform:translateY(-2px);box-shadow:var(--sh)}
.tile .ic{flex:0 0 38px;height:38px;border-radius:10px;display:grid;place-items:center;background:color-mix(in srgb,var(--ac) 14%,transparent);color:var(--ac)}
.tile .ic svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.tile .tx{display:flex;flex-direction:column;gap:3px;min-width:0}.tile b{font-size:14px}.tile .d{color:var(--mu);font-size:12.5px;font-weight:400;line-height:1.4}
.item{display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap;padding:12px 14px;border:1px solid var(--bd);border-radius:11px;background:var(--bg);margin-bottom:8px}
.item.vr{padding:8px 12px}
.item-main{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 240px}
.item-t{font-size:14.5px;font-weight:600;overflow-wrap:anywhere}
.item-m{font-size:12.5px;color:var(--mu)}.item-m.none{font-style:italic}
.item-d{font-size:13px}
.item-a{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-left:auto}
.ask{font-size:12.5px;color:var(--er);margin-right:4px}
.crumb{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.tbl{overflow-x:auto;border:1px solid var(--bd);border-radius:11px;margin-bottom:10px;background:var(--pn)}
table{width:100%;border-collapse:collapse;font-size:13px}
th{padding:9px 12px;text-align:left;background:var(--p2);font:600 11px/1.2 Inter,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--mu);white-space:nowrap}
td{padding:9px 12px;border-top:1px solid var(--bd);vertical-align:top}
tbody tr:hover td,tr:hover td{background:color-mix(in srgb,var(--ac) 5%,transparent)}
.r{text-align:right;white-space:nowrap}.r button{margin-left:4px}
.ln{font-size:12px;color:var(--mu);word-break:break-all}
.rg{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:start}
@media (max-width:1000px){.rg{grid-template-columns:1fr}}
.pvc{position:sticky;top:10px}
.pvb{background:#fff;color:#111;padding:14px;border-radius:10px;max-height:min(56vh,540px);overflow:auto;font:13px/1.45 Arial,sans-serif;border:1px solid var(--bd)}
.pvb ul,.pvb ol{margin:4px 0;padding-left:22px}
.pvc textarea.mono{min-height:300px}
.wnb,.okb{font-size:12.5px;border-radius:10px;padding:9px 12px;margin:0 0 10px}
.wnb{color:var(--er);background:color-mix(in srgb,var(--er) 9%,transparent);border:1px solid color-mix(in srgb,var(--er) 35%,transparent)}
.okb{color:var(--ok);background:color-mix(in srgb,var(--ok) 9%,transparent);border:1px solid color-mix(in srgb,var(--ok) 30%,transparent)}
.row{border:1px solid var(--bd);border-radius:11px;padding:12px 14px;margin-bottom:10px;background:var(--bg)}
.row-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.num{font:600 12px/1 Inter,sans-serif;color:var(--ac);background:color-mix(in srgb,var(--ac) 14%,transparent);padding:4px 10px;border-radius:99px}
.tone-g{border-left:4px solid #90ee90;background:color-mix(in srgb,#90ee90 5%,var(--pn))}
.tone-o{border-left:4px solid #ffbf40;background:color-mix(in srgb,#ffbf40 5%,var(--pn))}
.tone-r{border-left:4px solid #ff8080;background:color-mix(in srgb,#ff8080 5%,var(--pn))}
.lb{font-size:12px;font-weight:600;color:var(--mu)}
.chip{display:inline-flex;gap:7px;align-items:center;margin:4px 6px 0 0;padding:5px 11px;border:1px solid var(--bd);border-radius:99px;font-size:12.5px;font-weight:500;color:var(--tx);cursor:pointer;transition:background .18s,color .18s,border-color .18s}
.chip:hover{border-color:var(--ac)}
.chip input{width:auto;height:auto;margin:0;accent-color:var(--ac)}
.chip:has(input:checked){background:var(--ac);border-color:var(--ac);color:#fff}
.chkl{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:400;color:var(--tx);margin:10px 0 0;cursor:pointer}
.chkl input{width:16px;height:16px;margin:0;accent-color:var(--ac)}
.hid{display:none!important}
.cond.in{animation:rowin .32s cubic-bezier(.2,.7,.2,1)}
.diff{margin:-2px 0 10px;padding:8px 12px;border-left:3px solid var(--ac);background:var(--p2);border-radius:0 8px 8px 0}
.rule{margin-bottom:12px}.rule>b{display:block;margin-bottom:6px;font-size:13px}
.sigsec{display:flex;gap:16px;align-items:center;margin:14px 0 0;padding:12px;border:1px dashed var(--bd);border-radius:12px}
.sigprev{flex:0 0 132px;height:70px;border-radius:10px;background:#fff;display:grid;place-items:center;overflow:hidden;border:1px solid var(--bd);color:#7a7a7a;font-size:12px}
.sigprev img{max-width:100%;max-height:100%}
.sigctl{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.sigrow{display:flex;gap:8px;align-items:flex-end}.sigrow .fl{flex:1}.sigrow button{height:42px;flex:0 0 auto}
.sigp.mini{flex:0 0 auto;margin-right:4px}.sigp.mini img{max-height:44px;max-width:120px;background:#fff;border-radius:7px;padding:4px;display:block}
.opts{margin-top:6px}
.filechip{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;border:1px solid var(--bd);border-radius:10px;background:var(--p2);font-size:13px;overflow-wrap:anywhere}
.dp{display:flex;gap:8px;align-items:center}
.dp-trigger{flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;height:42px;padding:9px 12px;background:var(--bg);font-weight:400;font-size:13.5px;text-align:left;border-radius:10px}
.dp-trigger svg{width:17px;height:17px;flex:0 0 auto;color:var(--mu)}
.dp .sm,.dt .sm{height:42px;padding:0 14px}
.dt{display:flex;gap:8px;align-items:center}.dt .dp{flex:1.4}.dt input[type=time]{flex:1;min-width:110px}
@media (max-width:560px){.sigsec{flex-direction:column;align-items:stretch}.sigprev{flex-basis:auto;width:100%}}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:20;animation:fade .2s;backdrop-filter:blur(4px)}
.ov .card{width:min(640px,100%);margin:0;animation:pop .28s cubic-bezier(.2,.8,.2,1)}
@keyframes pulse{50%{opacity:.25;transform:scale(.7)}}
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.vin .ph,.vin .tile,.vin .card,.vin .st>div,.vin .item{animation:up .4s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i,0)*34ms)}
@keyframes rowin{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}
.row.enter,.vin .row.enter{animation:rowin .34s cubic-bezier(.2,.7,.2,1) both;animation-delay:0s}
@keyframes out{from{max-height:700px}to{opacity:0;transform:translateX(16px) scale(.98);max-height:0;padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-width:0}}
.row.leaving,.card.leaving,.item.leaving{animation:out .22s ease forwards!important;overflow:hidden}
tr.leaving td{opacity:0;transition:opacity .2s}
@keyframes fade{from{opacity:0}}@keyframes pop{from{opacity:0;transform:translateY(10px) scale(.97)}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-delay:0s!important;transition-duration:.001ms!important}}
</style><header class="top"><span class="brand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2.5 20 7v10l-8 4.5L4 17V7z"/><circle cx="12" cy="12" r="3.2"/></svg>FORENSIC LAB</span><span id="act"></span><span id="ind">All changes saved</span></header><nav id="nav"></nav><main id="main"></main><datalist id="chn"></datalist>`;
const $=s=>root.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const p2=n=>String(n).padStart(2,'0'),pad=n=>String(n).padStart(3,'0');
const fmtD=t=>{const d=new Date(t);return `${p2(d.getDate())}/${p2(d.getMonth()+1)}/${d.getFullYear()} – ${p2(d.getHours())}:${p2(d.getMinutes())}`},dOnly=t=>fmtD(t).split(' – ')[0];
const DEF={k:'cfg',active:null,ci:false,fmt:'lines',rules:{
 dna:{label:'DNA strings',extract:'DNA:\\s*([A-Za-z0-9_-]+)',validate:'^[0-9A-Fa-f]+$'},
 ser:{label:'Firearm serial numbers',extract:'serial(?:\\s*(?:number|no\\.?|#))?\\s*[:#]\\s*([A-Za-z0-9-]+)',validate:'^[A-Za-z0-9-]{5,}$'},
 afis:{label:'Fingerprint (AFIS) strings',extract:'AFIS-([0-9A-Fa-f]+)',validate:'^[0-9A-Fa-f]+$'},
 bag:{label:'Evidence bags',extract:'Bag\\s*#(\\d+)',validate:'^\\d+$'}}};
const S={sessions:[],chatlogs:[],reports:[],activity:[],cfg:structuredClone(DEF)};
let V='dashboard',ui={tab:'dna'},db;
const NAMES={dna:'DNA Strings',afis:'Fingerprint (AFIS) Strings',ser:'Firearm Serial Numbers'},SH={dna:'DNA identifiers',afis:'AFIS strings',ser:'serial numbers'};
const NAV=[['dashboard','Dashboard'],['reports','Laboratory Forensics'],['digital','Digital Forensics'],['history','History'],['ids','Identifier Manager'],['evidence','Evidence Records'],['sessions','Sessions'],['characters','Characters'],['search','Search'],['settings','Backups & settings']];
const IC={
 reports:'<svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
 characters:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-3.6 3.8-5.6 7.5-5.6s6.6 2 7.5 5.6"/></svg>',
 ids:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h16"/><circle cx="18" cy="12" r="2"/></svg>',
 evidence:'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3"/></svg>',
 digital:'<svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>',
 history:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
 sessions:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M9 5v14"/></svg>'};
const PH=(t,s)=>`<div class="ph"><h2>${t}</h2>${s?`<p class="sub">${s}</p>`:''}</div>`;
const TILES=[['reports','Laboratory Forensics','Nine report types with exact BBCode templates'],['digital','Digital Forensics','Digital forensic report templates'],['history','History','Every report and package you have created'],['ids','Evidence Identifier Manager','Extract and deduplicate DNA, fingerprint and serial strings'],['evidence','Evidence Records','Evidence bags parsed from saved chatlogs'],['sessions','Sessions','Keep each case or investigation separate'],['characters','Characters','Signatures for the “Submitted by” block'],['search','Global Search','Search every saved session'],['settings','Backups & settings','Extraction rules, JSON backup and restore']];
const C={chars:[]};
  // The person filling the report is the one in Character Details; requesters, investigators and team leaders are never prefilled.
  const cdet=()=>{const d=typeof deputyDetails==='object'&&deputyDetails?deputyDetails:{};return{name:String(d.fullName||'').trim(),rank:String(d.rank||'').trim()}};
  function seedChar(){const d=cdet();if(C.chars.length||S.cfg.seeded||!d.name)return;S.cfg.seeded=true;chSave({id:uid(),created:Date.now(),sig:null,def:true,name:d.name,title:d.rank,link:'',embed:false})}
const navH=()=>NAV.map(([v,l])=>`<button data-a="go" data-v="${v}">${l}</button>`).join('');$('#nav').innerHTML=navH();

/* ---------- storage layer (swap this object for a cloud backend later) ---------- */
function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open('forensiclab',2);r.onupgradeneeded=()=>{const d=r.result;[['sessions'],['chatlogs'],['reports'],['activity',1],['settings','k']].forEach(([n,x])=>{if(!d.objectStoreNames.contains(n))d.createObjectStore(n,x=='k'?{keyPath:'k'}:x?{keyPath:'id',autoIncrement:true}:{keyPath:'id'})})};r.onsuccess=()=>{db=r.result;res()};r.onerror=()=>rej(r.error)})}
const tx=(s,m,f)=>new Promise((res,rej)=>{const t=db.transaction(s,m),q=f(t.objectStore(s));t.oncomplete=()=>res(q&&q.result);t.onerror=t.onabort=()=>rej(t.error)});
const DB={all:s=>tx(s,'readonly',o=>o.getAll()),put:(s,v)=>tx(s,'readwrite',o=>o.put(v)),add:(s,v)=>tx(s,'readwrite',o=>o.add(v)),del:(s,k)=>tx(s,'readwrite',o=>o.delete(k))};
function setI(t,bad){const i=$('#ind');i.textContent=t;i.className=bad?'er':/^Saving/.test(t)?'sv':''}
async function sv(fn){setI('Saving…');try{await fn();setI('All changes saved')}catch(e){setI('Save failed',1);throw e}}
const saveS=s=>sv(()=>{s.modified=Date.now();return DB.put('sessions',s)}),saveC=()=>sv(()=>DB.put('settings',S.cfg));
/* audit log: add-only API. No update or delete function exists for activity entries. */
async function log(){}
async function copy(t){try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(_){}a.remove()}toast('Copied')}
async function dl(name,text){try{const b=new Blob([text],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}catch(e){ui.dlg={name,text};render()}}

/* ---------- data helpers ---------- */
const cur=()=>S.sessions.find(s=>s.id==S.cfg.active),sess=id=>S.sessions.find(s=>s.id==id);
const chat=id=>S.chatlogs.filter(c=>c.sid==id).sort((a,b)=>a.created-b.created);
const norm=s=>s.replace(/\s+/g,' ').trim(),strip=l=>l.replace(/^\s*\[[^\]]*\]\s*/,'');
const ci=t=>t=='ser'&&S.cfg.ci,kf=(t,v)=>ci(t)?v.toLowerCase():v;
function lines(sid){const o=[];chat(sid).forEach(c=>c.text.split(/\r?\n/).forEach((l,i)=>o.push({cl:c.id,n:i+1,raw:l,t:strip(l),lbl:c.label,ix:o.length})));return o}
function valid(t,v){try{return new RegExp(S.cfg.rules[t].validate).test(v)}catch(e){return true}}
const ens=s=>{s.added=s.added||{};s.removed=s.removed||{};s.corr=s.corr||{};['dna','ser','afis'].forEach(k=>{s.added[k]=s.added[k]||[];s.removed[k]=s.removed[k]||[];s.corr[k]=s.corr[k]||{}})};
const serType=(LS,L)=>{for(let j=L.ix+1;j<=L.ix+3&&LS[j];j++){const m=/Type\s*:\s*(.+)$/i.exec(LS[j].t);if(m)return m[1].trim();if(/Serial\s*[:#]/i.test(LS[j].t))break}return ''};
function ext(sid,t){const s=sess(sid),M=new Map();ens(s);let R=null,tot=0;
 try{R=new RegExp(S.cfg.rules[t].extract,'gi')}catch(e){}
 const LS=lines(sid);if(R)for(const L of LS){R.lastIndex=0;let m;while((m=R.exec(L.t))){if(m[0]==='')R.lastIndex++;const v=norm(m[1]??m[0]);if(!v)continue;tot++;const k=kf(t,v);if(!M.has(k))M.set(k,{k,v,src:'extracted',occ:[],info:t=='ser'?serType(LS,L):''});M.get(k).occ.push(L)}}
 const ex=M.size;
 (s.added[t]||[]).forEach(v=>{const k=kf(t,v);if(!M.has(k))M.set(k,{k,v,src:'manual',occ:[]})});
 const rem=s.removed[t]||[],items=[...M.values()].filter(i=>!rem.includes(i.k));
 items.forEach(i=>{const c=s.corr[t][i.k];if(c){i.orig=i.v;i.v=c;i.src='corrected'}i.bad=!valid(t,i.v)});
 return{items,tot,ex,dup:tot-ex}}
function bags(sid){const o=[],M=new Map();let R;try{R=new RegExp(S.cfg.rules.bag.extract,'i')}catch(e){return o}let c=null;
 for(const L of lines(sid)){const m=!L.t.startsWith('---')&&R.exec(L.t);
  if(m){const b=norm(m[1]);c=M.get(b);if(!c){c={bag:b,f:{},lines:[]};M.set(b,c);o.push(c)}c.lines.push(L);const g=/Signed by (.+?) at (.+)$/i.exec(L.t);if(g){c.f.signedBy=c.f.signedBy||norm(g[1]);c.f.signedAt=c.f.signedAt||norm(g[2])}}
  else if(c&&L.t.startsWith('---')){const g=/^---\s*([^:]+):\s*(.*)$/.exec(L.t);if(g){c.lines.push(L);const k=norm(g[1]);c.f[k]=c.f[k]||norm(g[2])}}
  else if(L.t.trim())c=null}
 return o}
const fmtL=(a,f)=>f=='comma'?a.join(', '):f=='num'?a.map((v,i)=>`${i+1}. ${v}`).join('\n'):a.join('\n');
const sact=id=>S.activity.filter(a=>a.sid==id||a.sid==null).sort((a,b)=>a.ts-b.ts||(a.id||0)-(b.id||0));

/* ---------- views ---------- */
const noS=()=>`<div class="card empty"><p>Select or create a session first.</p><button class="p" data-a="go" data-v="sessions">Open Sessions</button></div>`;
function ov(s){return `<div class="card"><div class="card-h"><h3>Your workspace</h3><button class="sm" data-a="go" data-v="sessions">${esc('#'+pad(s.num)+' '+s.name)}</button></div><div class="st">${[[chat(s.id).length,'Imported chatlogs'],[bags(s.id).length,'Evidence records'],[ext(s.id,'dna').items.length,'Unique DNA strings'],[ext(s.id,'afis').items.length,'Unique fingerprint strings'],[ext(s.id,'ser').items.length,'Unique serial numbers'],[reps(s.id).length,'Reports']].map(([n,l])=>`<div><b>${n}</b>${l}</div>`).join('')}</div></div>`}
function vDash(){const s=cur();return PH('Dashboard','Everything runs in your browser and stays on this device. Use Backups & settings to keep a copy of your data.')+(s?ov(s):noS())+`<div class="tiles">${TILES.map(([v,t,d])=>`<button class="tile" data-a="go" data-v="${v}"><span class="ic">${IC[v]}</span><span class="tx"><b>${t}</b><span class="d">${d}</span></span></button>`).join('')}</div>`}
function slHtml(){const q=(ui.q||'').toLowerCase(),f=ui.sf||'';
 const L=S.sessions.filter(s=>(!f||s.status==f)&&(f||s.status!='Archived'||ui.q)&&[s.name,s.ref,s.desc,'#'+pad(s.num)].join(' ').toLowerCase().includes(q)).sort((a,b)=>b.num-a.num);
 return L.map(s=>`<div class="item"><div class="item-main"><b class="item-t">#${pad(s.num)} · ${esc(s.name)}</b><span class="item-m">${s.ref?'Case '+esc(s.ref)+' · ':''}Created ${dOnly(s.created)} · Modified ${fmtD(s.modified)}</span>${s.desc?`<span class="item-d">${esc(s.desc)}</span>`:''}<div class="tags"><span class="tag ${s.status=='Completed'?'ok':''}">${esc(s.status)}</span>${s.id==S.cfg.active?'<span class="tag act">active</span>':''}</div></div>
 ${ui.del==s.id?`<div class="item-a"><span class="ask">This permanently deletes the session, its chatlogs and its reports. Export a backup first if unsure.</span><button class="d sm" data-a="delok" data-id="${s.id}">Delete</button><button class="sm" data-a="delcan">Cancel</button></div>`
 :`<div class="item-a"><button class="p sm" data-a="open" data-id="${s.id}">${s.id==S.cfg.active?'Open (active)':'Open'}</button><button class="sm" data-a="sedit" data-id="${s.id}">Edit</button><button class="sm" data-a="arch" data-id="${s.id}">${s.status=='Archived'?'Reopen':'Archive'}</button><button class="sm" data-a="sexp" data-id="${s.id}">Export</button><button class="d sm" data-a="delask" data-id="${s.id}">Delete</button></div>`}</div>`).join('')||'<p class="empty">No sessions match.</p>'}
function vSess(){const e=ui.edit?sess(ui.edit):null;
 return PH('Sessions','A session keeps one case or investigation together: its chatlogs, identifiers, evidence records and reports. Open a session to work in it.')+`<div class="card"><div class="card-h"><h3>${e?'Edit session':'New session'}</h3></div><div class="g"><label class="fl"><span>Name</span><input id="fn" value="${esc(e?.name)}" placeholder="Diamond Casino homicide"></label><label class="fl"><span>Case reference</span><input id="fr" value="${esc(e?.ref)}" placeholder="DIS/OIS-2026-014"></label>
 ${e?`<label class="fl"><span>Status</span><select id="fs">${['In Progress','Completed','Archived'].map(x=>`<option${x==e.status?' selected':''}>${x}</option>`).join('')}</select></label>`:''}
 <label class="fl w"><span>Description</span><textarea id="fd" rows="2">${esc(e?.desc)}</textarea></label></div>
 <div class="toolbar"><button class="p" data-a="${e?'supd':'snew'}">${e?'Save changes':'Create session'}</button>${e?'<button data-a="scan">Cancel</button>':''}</div></div>
 <div class="bar"><label class="fl"><span>Search</span><input placeholder="Name, reference or description" data-bind="q" value="${esc(ui.q)}"></label><label class="fl"><span>Show</span><select data-bind="sf"><option value="">Active sessions</option>${['In Progress','Completed','Archived'].map(x=>`<option${ui.sf==x?' selected':''}>${x}</option>`).join('')}</select></label></div><div id="lst">${slHtml()}</div>`}
function panel(t){const s=cur(),r=ext(s.id,t),f=S.cfg.fmt||'lines',rm=(s.removed[t]||[]).length;
 const rows=r.items.map((i,n)=>{const id=t+'|'+i.k,ed=ui.ed==id;const kk=esc(i.k);
 return `<tr><td>${n+1}<td>${ed?`<input id="ev" value="${esc(i.v)}">`:`<code>${esc(i.v)}</code>${i.info?` <span class="tag">${esc(i.info)}</span>`:''}${t=='afis'&&nameFromId(i.v)?` <small class="mu">${esc(nameFromId(i.v).name)}</small>`:''}`}${i.bad?' <span class="tag er">malformed</span>':''}${i.src!='extracted'?` <span class="tag">${i.src}</span>`:''}${i.orig?` <small class="mu">was ${esc(i.orig)}</small>`:''}<td>${i.occ.length}×<td class="r">${ed?`<button class="p sm" data-a="esave" data-t="${t}" data-k="${kk}">Save</button><button class="sm" data-a="ecan">Cancel</button>`:`<button class="sm" data-a="insp" data-id="${esc(id)}">Lines</button><button class="sm" data-a="eedit" data-id="${esc(id)}">Edit</button><button class="d sm" data-a="rem" data-t="${t}" data-k="${kk}">Remove</button>`}</tr>${ui.ins==id?`<tr><td><td colspan="3">${i.occ.length?i.occ.map(o=>`<div class="ln">${esc(o.lbl)} line ${o.n}: ${esc(o.raw)}</div>`).join(''):'<span class="mu">Entered manually, no source line</span>'}</tr>`:''}`}).join('');
 return `<div class="card"><div class="card-h"><h3>${NAMES[t]}</h3><div class="seg" role="group" aria-label="List format">${[['lines','One per line'],['comma','Comma-separated'],['num','Numbered']].map(([k,l])=>`<button class="${f==k?'on':''}" data-a="fmt" data-v="${k}">${l}</button>`).join('')}</div></div>
 <div class="st"><div><b>${r.tot}</b>Total occurrences</div><div><b>${r.items.length}</b>Unique</div><div><b>${r.dup}</b>Duplicates removed</div></div>
 <div class="toolbar"><button class="p sm" data-a="copy" data-t="${t}">Copy all</button><button class="sm" data-a="dlt" data-t="${t}">Download TXT</button><button class="sm" data-a="clr" data-t="${t}">Clear results</button>${rm?`<button class="sm" data-a="rst" data-t="${t}">Restore ${rm} removed</button>`:''}</div>
 <div class="tbl"><table><tr><th>#<th>Identifier<th>Seen<th></tr>${rows||'<tr><td colspan="4" class="mu">No identifiers yet.</tr>'}</table></div>
 <div class="addrow"><input id="add-${t}" data-enter="add" data-t="${t}" placeholder="Add ${SH[t]} manually"><button class="sm" data-a="add" data-t="${t}">Add</button></div></div>`}
function vIds(){const s=cur();if(!s)return noS();const tb=ui.tab||'dna',T=tb=='combo'?['dna','afis','ser']:[tb];
 return PH('Evidence Identifier Manager',`${chat(s.id).length} chatlog(s) saved in this session. Identifiers are never merged unless exactly equal after whitespace cleanup.`)+`<div class="seg big" role="tablist">${[['dna','DNA Strings'],['afis','Fingerprints (AFIS)'],['ser','Firearm Serials'],['combo','Combined']].map(([k,l])=>`<button class="${tb==k?'on':''}" data-a="tab" data-v="${k}">${l}</button>`).join('')}</div>
 <div class="card"><label class="fl"><span>Paste FiveM chatlog (the original text is stored unchanged)</span><textarea id="paste" class="mono" rows="7" data-bind="paste" placeholder="Paste the chatlog here, then press Extract Identifiers">${esc(ui.paste)}</textarea></label><div class="toolbar"><button class="p" data-a="extract">Extract Identifiers</button><button data-a="reproc">Reprocess saved chatlogs</button></div></div>
 ${T.map(panel).join('')}${tb=='combo'?'<div class="toolbar"><button class="p" data-a="both">Copy both lists</button></div>':''}`}
function vEv(){const s=cur();if(!s)return noS();const B=bags(s.id);
 return PH('Evidence Records','Parsed from saved chatlogs. Empty fields were not found in the logs.')+`<div class="tbl"><table><tr><th>Bag #<th>Signed by<th>Signed at<th>Label<th>DNA<th>Other<th>Lines</tr>${B.map(b=>{const o=Object.entries(b.f).filter(([k])=>!['signedBy','signedAt','Label','DNA'].includes(k)).map(([k,v])=>`${esc(k)}: ${esc(v)}`).join('; ');const x=v=>v?esc(v):'<span class="mu">not found</span>';return `<tr><td><b>${esc(b.bag)}</b><td>${x(b.f.signedBy)}<td>${x(b.f.signedAt)}<td>${x(b.f.Label)}<td>${x(b.f.DNA)}<td>${o}<td>${b.lines.length}</tr>`}).join('')||'<tr><td colspan="7" class="mu">No evidence bags found. Import a chatlog in the Identifier Manager first.</tr>'}</table></div>`}
function sr(){const q=(ui.gq||'').trim().toLowerCase(),f=ui.gf?new Date(ui.gf).getTime():0,t=ui.gt?new Date(ui.gt).getTime()+864e5:Infinity;if(!q)return '<p class="empty">Enter a search term above.</p>';
 const o=[],add=(ty,s,tx,sub,v,tab,rid)=>o.length<300&&o.push(`<tr><td>${ty}<td>${esc(tx)}${sub?`<div class="ln">${esc(sub)}</div>`:''}<td class="mu">${esc(s.name)}<td class="r"><button class="sm" data-a="open" data-id="${s.id}" data-v="${v}" data-tab="${tab||''}" data-rid="${rid||''}">Open</button></tr>`);
 S.sessions.forEach(s=>{if(s.created<f||s.created>=t)return;
  if([s.name,s.ref,s.desc].join(' ').toLowerCase().includes(q))add('Session',s,s.name,s.ref,'dashboard');
  ['dna','afis','ser'].forEach(k=>ext(s.id,k).items.forEach(i=>{if(i.v.toLowerCase().includes(q))add(NAMES[k],s,i.v,i.occ[0]?.raw,'ids',k)}));
  bags(s.id).forEach(b=>{if([b.bag,...Object.values(b.f)].join(' ').toLowerCase().includes(q))add('Evidence bag',s,'Bag #'+b.bag,b.f.signedBy?'Signed by '+b.f.signedBy:'','evidence')});
  reps(s.id).forEach(r=>{if(((r.bb||'')+r.title).toLowerCase().includes(q))add('Report: '+TP[r.type].name,s,r.title,'',(TP[r.type].cat||'lab')=='digital'?'digital':'reports','',r.id)});chat(s.id).forEach(c=>c.text.split(/\r?\n/).forEach((l,n)=>{if(l.toLowerCase().includes(q))add('Chatlog',s,l.slice(0,200),`${c.label} line ${n+1}`,'ids','dna')}))});
 return `<p class="mu">${o.length>=300?'First 300 results':o.length+' result(s)'}. Date range applies to session creation date.</p><div class="tbl"><table>${o.join('')||'<tr><td class="mu">No matches.</tr>'}</table></div>`}
function vSearch(){return PH('Global Search','Searches session names, references, DNA strings, serials, evidence bags, reports and chatlog text.')+`<div class="bar"><label class="fl grow"><span>Search</span><input placeholder="Search…" data-bind="gq" value="${esc(ui.gq)}"></label><label class="fl"><span>Created from</span>${dpField('data-bind="gf"',ui.gf)}</label><label class="fl"><span>Created until</span>${dpField('data-bind="gt"',ui.gt)}</label></div><div id="res">${sr()}</div>`}
function vSet(){return PH('Backups & settings','Your data is kept in this browser only. Export a backup to keep a copy or move it to another browser.')+`<div class="card"><div class="card-h"><h3>Backup and restore</h3></div><div class="toolbar"><button class="p" data-a="bk">Export all data (JSON)</button></div><div class="g">${fileField('rf','.json,application/json','Restore from file (merges, nothing is deleted)')}${ui.rfile?`<div class="filechip w"><span>Loaded file: <b>${esc(ui.rfile)}</b></span><button type="button" class="d sm" data-a="rclrfile">Remove file</button></div>`:''}<label class="fl w"><span>or paste backup JSON</span><textarea id="rt" class="mono" rows="4" data-bind="rtext">${esc(ui.rtext)}</textarea></label></div><div class="toolbar"><button class="p" data-a="rs">Restore</button><button data-a="rclrfile">Clear</button></div></div>
 <div class="card"><div class="card-h"><h3>Extraction rules</h3></div><p class="mu">Regular expressions, case-insensitive. Capture group 1 is the identifier. Use Reprocess in the Identifier Manager after changing rules.</p>
 ${['dna','afis','ser','bag'].map(k=>`<div class="rule"><b>${S.cfg.rules[k].label}</b><div class="g"><label class="fl"><span>Extraction</span><input id="rx-${k}" value="${esc(S.cfg.rules[k].extract)}"></label><label class="fl"><span>Valid format (others are flagged malformed)</span><input id="rv-${k}" value="${esc(S.cfg.rules[k].validate)}"></label></div></div>`).join('')}
 <label class="chkl"><input type="checkbox" id="cib" ${S.cfg.ci?'checked':''}> Case-insensitive duplicate detection for serial numbers</label><div class="toolbar"><button class="p" data-a="srules">Save rules</button><button data-a="rrules">Reset to defaults</button></div></div>`}
const dlg=()=>`<div class="ov"><div class="card"><h3>${esc(ui.dlg.name)}</h3><p class="mu">Direct download is unavailable here. Copy the text below and save it yourself.</p><textarea rows="10" readonly onfocus="this.select()">${esc(ui.dlg.text)}</textarea><button class="p" data-a="dcopy">Copy</button><button data-a="dclose">Close</button></div></div>`;
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const leave=(el,fn)=>{if(el&&!RM){el.classList.add('leaving');return new Promise(r=>setTimeout(()=>r(fn&&fn()),210))}return Promise.resolve(fn&&fn())};
const countUp=e=>{const n=parseInt(e.textContent);if(!(n>0&&n<9999))return;const t0=performance.now(),f=t=>{const k=Math.min(1,(t-t0)/600);e.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};e.textContent=0;requestAnimationFrame(f)};
function post(){regDates();const m=$('#main'),key=V+'|'+(['reports','digital'].includes(V)?(ui.rep||'')+'|'+(ui.pk||''):'');
 if(key!==ui._k){ui._k=key;scrollTo({top:0});if(!RM){m.classList.remove('vin');m.querySelectorAll('h2,.tile,.card,.st>div,.row').forEach((e,i)=>e.style.setProperty('--i',Math.min(i,12)));void m.offsetWidth;m.classList.add('vin');clearTimeout(post.t);post.t=setTimeout(()=>m.classList.remove('vin'),1200);m.querySelectorAll('.st b').forEach(countUp)}}
 const f=m.querySelector('.row.enter');if(f){if(f.scrollIntoView)f.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});const i=f.querySelector('input:not([type=checkbox]),textarea,select');i&&i.focus({preventScroll:true})}ui.fresh=null}
const VIEWS={dashboard:vDash,sessions:vSess,reports:vReports,ids:vIds,evidence:vEv,search:vSearch,settings:vSet,characters:vChars,digital:vDigital,history:vHistory};
function render(){seedChar();const dn=$('#chn');if(dn)dn.innerHTML=C.chars.map(c=>`<option value="${esc(c.name)}">`).join('');root.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==V));const cs=cur();$('#act').innerHTML=cs?`<button class="sm" data-a="go" data-v="sessions" title="Switch session">#${pad(cs.num)} ${esc(cs.name)}</button>`:'';$('#main').innerHTML=(VIEWS[V]||vDash)()+(ui.dlg?dlg():'');post()}

/* ---------- characters (signature presets, stored in this browser) ---------- */
const RANKS={'Law Enforcement':['Deputy Sheriff','Deputy Sheriff Bonus I','Deputy Sheriff Bonus II','Detective','Sergeant','Lieutenant','Captain','Executif Staff'],'Laboratory':['Criminalist','Senior Criminalist','Supervisor']};
async function upSig(f){try{if(!/^image\//.test(f.type)){toast('Choose an image file (PNG works best)');return null}
 const src=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
 const im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src});let out='';
 for(const W of [520,400,300,200]){const k=Math.min(1,W/im.width,220/im.height),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);out=c.toDataURL('image/png');if(out.length<150000)break}
 if(out.length>=150000){toast('That image is too detailed. Try a simpler or smaller one.');return null}return{data:out}}catch(e){toast('Could not read that image');return null}}
async function chSave(c){C.chars=[...C.chars.filter(x=>x.id!=c.id),c].sort((a,b)=>(a.created||0)-(b.created||0));S.cfg.chars=C.chars.slice();await saveC()}
async function chDel(id){C.chars=C.chars.filter(x=>x.id!=id);S.cfg.chars=C.chars.slice();await saveC()}
// Same rank list as Character Details, plus the laboratory titles; "Custom" opens a box, exactly like Character Details.
const rankList=()=>[...document.querySelectorAll('#deputy-rank option')].filter(o=>o.id!=='deputy-rank-custom-opt'&&o.value).map(o=>o.value);
function rankSel(t){const L=rankList(),lab=RANKS.Laboratory.filter(x=>!L.includes(x)),known=!!t&&(L.includes(t)||lab.includes(t));
 return `<select id="ch-rank"><option value="">Select rank</option>${L.map(x=>`<option${t===x?' selected':''}>${esc(x)}</option>`).join('')}<optgroup label="Laboratory">${lab.map(x=>`<option${t===x?' selected':''}>${esc(x)}</option>`).join('')}</optgroup><option value="__custom"${t&&!known?' selected':''}>Custom</option></select>`}
function vChars(){const e=ui.che,ed=e&&e!='new'?C.chars.find(c=>c.id==e):null;
 const t=String((ed?ed.title:cdet().rank)||'').trim(),L=rankList().concat(RANKS.Laboratory),custom=!!t&&!L.includes(t),img=ed&&(ed.data||(ed.sig&&ed.sig.url));
 const form=e?`<div class="card"><div class="card-h"><h3>${ed?'Edit character':'New character'}</h3></div><div class="g"><label class="fl"><span>Character name (IC)</span><input id="ch-name" value="${esc(ed?ed.name:cdet().name)}" placeholder="First Last"></label><label class="fl"><span>Title / rank on reports</span>${rankSel(t)}</label><label class="fl w${custom?'':' hid'}" id="ch-title-wrap"><span>Custom title / rank</span><input id="ch-title" maxlength="60" value="${esc(t)}" placeholder="Your title or rank"></label></div>
 <div class="sigsec"><div class="sigprev" id="ch-prev">${img?`<img src="${esc(img)}" alt="Signature">`:'<span>No image</span>'}</div><div class="sigctl"><div class="sigrow">${fileField('ch-file','image/png,image/jpeg,image/webp,image/gif','Signature image',img?'Saved image':'')}<button type="button" class="d" data-a="chclr" title="Remove the chosen or saved signature image">Clear image</button></div><input type="checkbox" id="ch-rm" class="hid" tabindex="-1" aria-hidden="true"><small class="mu">PNG works best. It is resized automatically.</small></div></div>
 <div class="g" style="margin-top:14px"><label class="fl w"><span>Public link to the .png (optional)</span><input id="ch-link" value="${esc(ed&&ed.link)}" placeholder="https://i.imgur.com/\u2026"></label></div>
 <div class="opts"><label class="chkl"><input type="checkbox" id="ch-def" ${ed?(ed.def?'checked':''):(C.chars.length?'':'checked')}> Use as my default character</label>
 <label class="chkl"><input type="checkbox" id="ch-emb" ${ed&&ed.embed?'checked':''}> Put the image itself inside the BBCode (only works if your forum accepts embedded images; most do not)</label></div><p class="mu" style="margin-top:12px">A forum can only show a signature from a public web address. If you already host the .png somewhere, paste its link and every report uses it. Otherwise your saved image appears in this app, but the BBCode will list the signature as missing.</p><div class="toolbar"><button class="p" data-a="chsave">Save character</button><button data-a="chcan">Cancel</button></div></div>`:'';
 return PH('Characters','Your name and rank from Character Details are filled in for you, and every field stays editable. Create the characters you write reports as. A report, or a whole case package, picks one of them for its \u201cSubmitted by\u201d signature.')+(e?form:'<div class="toolbar" style="margin:0 0 14px"><button class="p" data-a="chnew">+ New character</button></div>')
 +C.chars.map(c=>`<div class="item">${c.data||(c.sig&&c.sig.url)?`<div class="sigp mini"><img src="${esc(c.data||c.sig.url)}" alt=""></div>`:''}<div class="item-main"><b class="item-t">${esc(c.name)} ${c.def?'<span class="tag act">default</span>':''}</b><span class="item-m">${esc(c.title)||'No title'} \u00b7 ${c.link?'public link set':c.embed&&c.data?'image embedded in BBCode':c.data?'image saved, no public link':'no signature'}</span></div>${ui.chd==c.id?`<div class="item-a"><span class="ask">Delete this character?</span><button class="d sm" data-a="chdelok" data-id="${c.id}">Delete</button><button class="sm" data-a="chdelcan">Cancel</button></div>`:`<div class="item-a"><button class="p sm" data-a="chedit" data-id="${c.id}">Edit</button>${c.def?'':`<button class="sm" data-a="chdef" data-id="${c.id}">Make default</button>`}<button class="d sm" data-a="chdelask" data-id="${c.id}">Delete</button></div>`}</div>`).join('')||(e?'':'<p class="empty">No characters yet.</p>')}
const CHA={
 chnew:()=>{ui.che='new';render();scrollTo(0,0)},chedit:d=>{ui.che=d.id;render();scrollTo(0,0)},chcan:()=>{ui.che=null;render()},
 chsave:async()=>{const name=$('#ch-name').value.trim();if(!name)return toast('Character name is required');let link=$('#ch-link').value.trim();if(link&&!/^https?:\/\//i.test(link))link='https://'+link;if(link){let ok=false;try{ok=/^https?:$/.test(new URL(link).protocol)}catch(e){}if(!ok)return toast('That image link does not look right')}
  const ed=ui.che&&ui.che!='new'?C.chars.find(c=>c.id==ui.che):null,c=ed?{...ed}:{id:uid(),created:Date.now(),sig:null,def:false};c.name=name;c.title=$('#ch-title').value.trim();c.link=link;c.embed=$('#ch-emb').checked;
  const f=$('#ch-file').files[0];if(f){const u=await upSig(f);if(!u)return;c.data=u.data;c.sig=null}else if($('#ch-rm')&&$('#ch-rm').checked){c.data=null;c.sig=null}
  const def=$('#ch-def').checked||!C.chars.length;if(def)for(const o of C.chars)if(o.def&&o.id!=c.id)await chSave({...o,def:false});c.def=def;
  await chSave(c);await log(cur().id,ed?'Character updated':'Character created',{ref:name,prev:ed?ed.name:null});ui.che=null;render()},
 chdef:async d=>{for(const o of C.chars)if(o.def!=(o.id==d.id))await chSave({...o,def:o.id==d.id});render()},
 chdelask:d=>{ui.chd=d.id;render()},chdelcan:()=>{ui.chd=null;render()},
 chdelok:async d=>{await leave(root.querySelector(`[data-a="chdelok"][data-id="${d.id}"]`)?.closest(".item"));const c=charById(d.id);await chDel(d.id);ui.chd=null;await log(cur().id,'Character deleted',{ref:c&&c.name});render()}};
/* ---------- actions ---------- */
async function report(s){for(const t of ['dna','afis','ser']){const r=ext(s.id,t);await log(s.id,`${r.tot} ${SH[t]} extracted`);if(r.dup)await log(s.id,`${r.dup} duplicate ${SH[t]} removed`)}}
const A={
 go:d=>{if(['reports','digital','history'].includes(d.v)){ui.rep=null;ui.pk=null;ui.from=null}V=d.v;render()},
 snew:async()=>{const name=$('#fn').value.trim();if(!name)return toast('Session name is required');
  const s={id:uid(),num:Math.max(0,...S.sessions.map(x=>x.num))+1,name,ref:$('#fr').value.trim(),desc:$('#fd').value.trim(),status:'In Progress',created:Date.now(),modified:Date.now(),added:{dna:[],ser:[]},removed:{dna:[],ser:[]},corr:{dna:{},ser:{}}};
  await sv(()=>DB.put('sessions',s));S.sessions.push(s);S.cfg.active=s.id;await saveC();await log(s.id,'Session created',{ref:s.name,next:s.ref});render()},
 sedit:d=>{ui.edit=d.id;render();scrollTo(0,0)},scan:()=>{ui.edit=null;render()},
 supd:async()=>{const s=sess(ui.edit),n={name:$('#fn').value.trim(),ref:$('#fr').value.trim(),desc:$('#fd').value.trim(),status:$('#fs').value};if(!n.name)return toast('Session name is required');
  const ch=Object.keys(n).filter(k=>s[k]!=n[k]).map(k=>[k,s[k],n[k]]);ch.forEach(([k,,v])=>s[k]=v);await saveS(s);for(const[k,p,v]of ch)await log(s.id,`Session ${k} changed`,{ref:s.name,prev:p,next:v});ui.edit=null;render()},
 open:async d=>{S.cfg.active=d.id;await saveC();if(d.tab)ui.tab=d.tab;A.go({v:d.v||'dashboard'});if(d.rid){ui.rep=d.rid;ui.pk=null;ui.from=null;render()}},
 arch:async d=>{const s=sess(d.id),p=s.status;s.status=p=='Archived'?'In Progress':'Archived';await saveS(s);await log(s.id,s.status=='Archived'?'Session archived':'Session reopened',{prev:p,next:s.status});render()},
 sexp:async d=>{const s=sess(d.id);await dl(`session-${pad(s.num)}.json`,JSON.stringify({format:'forensiclab-session',session:s,chatlogs:chat(s.id),reports:reps(s.id),activity:sact(s.id)},null,2));await log(s.id,'Session exported',{ref:s.name})},
 delask:d=>{ui.del=d.id;render()},delcan:()=>{ui.del=null;render()},
 delok:async d=>{await leave(root.querySelector(`[data-a="delok"][data-id="${d.id}"]`)?.closest(".item"));const s=sess(d.id);await sv(async()=>{for(const c of chat(s.id))await DB.del('chatlogs',c.id);for(const x of reps(s.id))await DB.del('reports',x.id);await DB.del('sessions',s.id)});
  S.chatlogs=S.chatlogs.filter(c=>c.sid!=s.id);S.reports=S.reports.filter(c=>c.sid!=s.id);S.sessions=S.sessions.filter(x=>x.id!=s.id);if(S.cfg.active==s.id){let n=S.sessions.slice().sort((a,b)=>b.num-a.num)[0];if(!n){n={id:uid(),num:1,name:'Workspace',ref:'',desc:'',status:'In Progress',created:Date.now(),modified:Date.now(),added:{dna:[],ser:[]},removed:{dna:[],ser:[]},corr:{dna:{},ser:{}}};await DB.put('sessions',n);S.sessions.push(n)}S.cfg.active=n.id;await saveC()}ui.del=null;
  await log(null,'Session deleted',{ref:s.name,prev:`#${pad(s.num)} ${s.ref}`});render()},
 tab:d=>{ui.tab=d.v;ui.ins=ui.ed=null;render()},
 fmt:async d=>{S.cfg.fmt=d.v;await saveC();render()},
 extract:async()=>{const s=cur(),tx=$('#paste').value;if(!tx.trim())return toast('Paste a chatlog first');
  const c={id:uid(),sid:s.id,text:tx,created:Date.now(),label:'Import '+(chat(s.id).length+1)};await sv(()=>DB.put('chatlogs',c));S.chatlogs.push(c);
  await log(s.id,'Chatlog imported',{ref:c.label,next:tx.split(/\r?\n/).length+' lines'});await report(s);ui.paste='';render()},
 reproc:async()=>{const s=cur();if(!chat(s.id).length)return toast('No saved chatlogs');await log(s.id,'Chatlogs reprocessed',{ref:s.name});await report(s);render()},
 insp:d=>{ui.ins=ui.ins==d.id?null:d.id;render()},eedit:d=>{ui.ed=d.id;render()},ecan:()=>{ui.ed=null;render()},
 esave:async d=>{const s=cur(),t=d.t,k=d.k,nv=norm($('#ev').value);if(!nv)return toast('A value is required');
  const it=ext(s.id,t).items.find(i=>i.k==k);if(!it)return;const prev=it.v;ui.ed=null;if(nv==prev)return render();
  if(it.src=='manual'){const a=s.added[t],ix=a.findIndex(v=>kf(t,v)==k);if(ix>-1)a[ix]=nv}else if(it.orig!==undefined&&nv==it.orig)delete s.corr[t][k];else s.corr[t][k]=nv;
  await saveS(s);await log(s.id,'Identifier corrected',{ref:NAMES[t],prev,next:nv});render()},
 rem:async d=>{await leave(root.querySelector(`[data-a="rem"][data-k="${CSS.escape(d.k)}"][data-t="${d.t}"]`)?.closest('tr'));const s=cur(),t=d.t,it=ext(s.id,t).items.find(i=>i.k==d.k);if(!it)return;(s.removed[t]=s.removed[t]||[]).push(d.k);await saveS(s);await log(s.id,'Identifier removed from results',{ref:NAMES[t],prev:it.v});render()},
 add:async d=>{const s=cur(),t=d.t,v=norm($('#add-'+t).value);if(!v)return;const k=kf(t,v);
  if(ext(s.id,t).items.some(i=>i.k==k))return toast('Already in the list');
  s.removed[t]=(s.removed[t]||[]).filter(x=>x!=k);if(!ext(s.id,t).items.some(i=>i.k==k)&&!(s.added[t]||[]).some(x=>kf(t,x)==k))s.added[t].push(v);
  await saveS(s);await log(s.id,t=='ser'?'Serial number added':'DNA identifier added',{next:v});render()},
 clr:async d=>{const s=cur(),t=d.t,it=ext(s.id,t).items;if(!it.length)return;s.removed[t]=[...(s.removed[t]||[]),...it.map(i=>i.k)];await saveS(s);await log(s.id,`${it.length} ${SH[t]} cleared from results`);render()},
 rst:async d=>{const s=cur(),n=s.removed[d.t].length;s.removed[d.t]=[];await saveS(s);await log(s.id,`${n} ${SH[d.t]} restored to results`);render()},
 copy:async d=>{const s=cur(),a=ext(s.id,d.t).items.map(i=>i.v);await copy(fmtL(a,S.cfg.fmt));await log(s.id,`${NAMES[d.t]} list copied`,{next:a.length+' items'})},
 both:async()=>{const s=cur(),f=S.cfg.fmt;await copy(['dna','afis','ser'].map(t=>NAMES[t]+'\n'+fmtL(ext(s.id,t).items.map(i=>i.v),f)).join('\n\n'));await log(s.id,'Both identifier lists copied')},
 dlt:async d=>{const s=cur(),a=ext(s.id,d.t).items.map(i=>i.v);await dl(`${({dna:'dna-strings',afis:'afis-strings',ser:'serial-numbers'})[d.t]}-unique.txt`,fmtL(a,S.cfg.fmt));await log(s.id,`${NAMES[d.t]} list exported`,{next:a.length+' items'})},
 srules:async()=>{const R={};for(const k of ['dna','afis','ser','bag']){const e=$('#rx-'+k).value,v=$('#rv-'+k).value;try{new RegExp(e);new RegExp(v)}catch(x){return toast('Invalid regex for '+S.cfg.rules[k].label)}R[k]={e,v}}
  for(const k in R){S.cfg.rules[k].extract=R[k].e;S.cfg.rules[k].validate=R[k].v}S.cfg.ci=$('#cib').checked;await saveC();toast('Rules saved')},
 rrules:async()=>{S.cfg.rules=structuredClone(DEF.rules);S.cfg.ci=false;await saveC();render()},
 bk:async()=>{await dl('forensiclab-backup.json',JSON.stringify({format:'forensiclab-backup',version:1,exported:Date.now(),sessions:S.sessions,chatlogs:S.chatlogs,reports:S.reports,activity:S.activity,cfg:S.cfg},null,2))},
 rs:async()=>{let j;try{j=JSON.parse(ui.rtext||'')}catch(e){return toast('Not valid JSON')}
  const ss=j.sessions||(j.session?[j.session]:null);if(!ss)return toast('No sessions found in backup');
  await sv(async()=>{const keys=new Set(S.activity.map(a=>[a.sid,a.ts,a.action,a.ref].join('|')));
   for(const s of ss)await DB.put('sessions',s);for(const c of j.chatlogs||[])await DB.put('chatlogs',c);for(const c of j.reports||[])await DB.put('reports',c);
   for(const a of j.activity||[]){if(keys.has([a.sid,a.ts,a.action,a.ref].join('|')))continue;const{id,...r}=a;await DB.add('activity',r)}});
  S.sessions=await DB.all('sessions');S.chatlogs=await DB.all('chatlogs');S.reports=await DB.all('reports');S.activity=await DB.all('activity');ui.rtext='';ui.rfile=null;await log(null,'Backup restored',{next:ss.length+' session(s)'});render()},
 dcopy:()=>copy(ui.dlg.text),dclose:()=>{ui.dlg=null;render()},
};
/* ---------- report generator: exact BBCode templates ---------- */
const LOCS=['Hall of Justice','Sally Port','Davis Station','Senora Station','Mont Chilliad Sub-Station'];
const MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const fdt=(v,m)=>{const x=/^(\d{4})-(\d\d)-(\d\d)$/.exec(v);return x?(m=='n'?`${x[3]}/${x[2]}/${x[1]}`:`${x[3]}/${MON[+x[2]-1]}/${x[1]}`):v};
const HD=r=>`[transtable=Arial][tr][transtd][size=75]Los Santos County Sheriff's Department[/size][/transtd]\n[transtd][right][size=75]Scientific Services Bureau[/size]${r?'[/right]':''}[/transtd][/tr][/transtable]`;
const TOP=(r,t)=>`${HD(r)}\n[center][img]https://i.imgur.com/i3x2zzd.png[/img]\n[size=115][b]Scientific Services Bureau[/b][/size]\n[size=110][b][u]${t}[/u][/b][/size][/center]`;
let CM=null,CR=null;
const charById=id=>C.chars.find(c=>c.id==id),defChar=()=>C.chars.find(c=>c.def)||C.chars[0];
const sg=(f,l)=>{const c=(CR&&charById(CR.author))||defChar();let v=c?(f=='img'?(c.link||''):f=='name'?(c.name||''):(c.title||'')):((S.cfg.sig||{})[f]||'');v=String(v).trim();
 if(!v&&c&&f=='img'&&c.embed&&c.data)v=c.data;
 if(v)return v;if(CM&&!CM.includes(l))CM.push(l);return `<<${l.toUpperCase()}>>`};
const SIGW=p=>`[b][u]Submitted by[/u][/b]\n[${p?'img':'imgmh=120'}]${sg('img','Signature image (add a public link to the character)')}[/${p?'img':'imgmh'}]\n${sg('name','Signature name')}, ${sg('title','Signature title')}\nScientific Services Bureau`;
const BX=(c,t,s,x)=>s?`[divbox=${c}]\n[b][u]${t}[/u][/b]\n${s}${x}\n[/divbox]`:'';
const SYNB=v=>`[b][u]Synopsis[/u][/b]\n[b]Investigator:[/b] ${v.inv}\n[b]Unit:[/b] ${v.unit}\n[b]Date:[/b] ${v.date}\n[b]Location:[/b] ${v.loc}`;
const SYNC=v=>`[b][u]Synopsis[/u][/b]\n[b]Requesting Party:[/b] ${v.req}\n[b]Unit:[/b] ${v.unit}\n[b]Date:[/b] ${v.date}\n[b]Location:[/b] ${v.loc}\n[b]Criminalist Team Leader:[/b] ${v.lead}`;
const SY=[['inv','Investigator'],['unit','Unit'],['date','Date','d'],['loc','Location','t','Hertzberg-Davis Forensic Science Center']];
const SY2=[['req','Requesting Party'],['unit','Unit'],['date','Date','d'],['loc','Location'],['lead','Criminalist Team Leader (optional)','t','','','opt']];
const STL=['store','Evidence storage location','s',LOCS],STN=['evn','Evidence number (write the real one)','t','','EV-#####-###'];
const ID3=[['ev','Evidence tested','E'],['id','Identifier'],['name','Name']];
const DNAX=`Amplification of extracted DNA from the above evidence was performed using the Polymerase Chain Reaction (PCR) and profiled at the following STR loci (locus abbreviations used in this report are noted in parenthesis): D3S11358 (D3), vWA, D16S539 (D16), CSF1PO (CSF), TPOX, D8S1179 (D8), D21S11 (D21), D18S51 (D18), D2S441, D19S433 (D19), TH01, FGA, D22S1045 (D22), D5S818 (D5), D13S317 (D13), D7S820 (D7), SE33, D10S1248 (D10), D1S1656 (D1), D12S391 (D12), D2S1338, Y indel (a Y insertion/deletion locus), and the sex-determining marker, Amelogenin.`;
const FRX=`The submitted samples were examined for latent prints and digitally imaged for further analysis. Friction ridge print examinations were conducted using the Analysis, Comparison, Evaluation, and Verification (ACE-V) process. The first step in the process is Analysis, which is conducted independently on first the latent than the known prints. During this step, each print is analyzed for both the quality and quantity of information present. The quality and quantity of information observed during the Analysis phase determine whether the print contains suitable information to conduct a comparison with another print.\n\nIn the Comparison phase of the ACE-V process, a side-by-side comparison of the latent print with suspect (latent or exemplary) prints was conducted. Both prints were examined for similarities and differences, assessing ridges sequentially for agreement or disagreement in all levels of detail. In the Evaluation phase of the ACE-V, all of the information gathered during Analysis and Comparison were considered to reach conclusions about the origin of the latent prints.\n\n[b]Note:[/b] Items of evidence submitted to the Scientific Services Bureau for examination may be examined visually, examined with various light sources, or processed with chemicals and powders to detect the presence of latent friction ridge prints. The specific sequence of examinations and processes depends upon the nature of the evidence.`;
const BAX=`The submitted cartridge casings were microscopically examined for the presence and pattern of toolmarks (breech face marks, firing pin impressions, extractor/ejector marks, and expansion marks). Firearm(s) in question were test-fired in a controlled environment and the fired cartridge casings and projectiles were recovered for microscopic comparison.`;
const TRX=`[justify]The specimens were prepared and mounted for Scanning Electron Microscope analysis. Particles were present on the aluminum stubs with double-sided cellophane tape. Energy-dispersive X-ray Spectroscopy Detector was utilized to identify the elements present in the collected particles. In order for the particles to be confirmed GSR, they must: (1) contain all three primer elements; Lead, Barium and Antimony, and (2) have spheroid shape (rounded, non-crystalline, irregular, and molten).[/justify]`;
const NAX=`[justify]Examination started by separating the different types of substances, weighting them and proceeding to sampling and sample preparation, following lab protocols. Samples were extracted for qualitative analysis.
[list][*][b]Presumptive:[/b]
[list][*][b]Infrared Spectrography[/b] was performed in order to get an initial identification of the different functional groups found on the unknown substances. The spectra obtained were matched against the database in order to obtain an initial identification.
[*]The spectra were analyzed to identify the substance.

[/list]

[*][b]Confirmatory:[/b]
[list][*][b]Gas chromatography-flame ionization detection (GC-FID)[/b] was performed. ATS standard and sample solutions were prepared and identification was accomplished by comparing the retention time of the analyte with that of a reference standard after GC analysis.[/list][/list]
[/justify]`;
const NAG=`[i][b][u]DEPA Category Guide*:[/u][/b][/i]
[list]
[*] Category A - (Crack) Cocaine, Heroin, Opium/Opioids (Vicodin), Ecstasy (MDMA), Phencyclidine (PCP), Psilocybin ("Magic Mushrooms"), Lysergic acid diethylamide (LSD)
[*] Category B - Methamphetamine, Amphetamines (Adderall), Fentanyl, Oxycodone, Morphine.
[*] Category C - Ketamine, Testosterone, Benzphetamine, Nalorphine
[*] Category D - Cannabis (Marijuana), Diazepam, Lorazepam, Xanax,
[*] Category T - Ganaxolone, Lomotil, Motofen, Parepectolin, Lyrica
[/list]`;
const TXX=`[justify]Examination began with the visual inspection, homogenization, and aliquoting of the biological liquid (urine sample) sample(s), following standard laboratory protocols. An internal standard was added to the sample aliquots in preparation for qualitative and quantitative analysis.
[list][*][b]Presumptive / Screening:[/b]
[list][*][b]Enzymatic Assay (Alcohol Dehydrogenase)[/b] was performed as an initial biochemical screen to detect the presence of volatile alcohols in the biological matrix.
[*]The reaction absorbance was analyzed against a baseline to provide a preliminary indication of alcohol content.

[/list]

[*][b]Confirmatory:[/b]
[list][*][b]Headspace Gas Chromatography-Flame Ionization Detection (HS-GC-FID)[/b] was performed. Calibration standards and sample solutions were prepared. Identification of ethyl alcohol (ethanol) was accomplished by comparing the retention time of the analyte with that of a certified reference standard after GC analysis.[/list][/list]
[/justify]`;
const FUT=`for any additional tests that may be requested in the future`;
const FUX=`for any additional examinations that may be requested in the future`;
const DFX=`The mobile devices were isolated from cell towers by placing it in Faraday bags. The make and model of the mobile devices were determined. The devices were connected to Cellebrite UFED Physical Analyzer to acquire a bit-by-bit copy of the entire storage, including both allocated and unallocated space. The data was extracted into a sterile storage media. The cloned data was parsed and the contents were viewed.`;
const FIX=`The submitted data was analyzed for suspicious transactions in the given period of time. A forensic specialist collected all relevant financial records, including bank statements, tax filings, payroll records, business contracts, invoices and receipts. Financial transactions were carefully analyzed to identify anomalies, suspicious patterns or inconsistencies, such as unexplained transfers of funds, missing or altered documentation, patterns indicative of fraud, such as inflated expenses or unauthorized payments. Forensic software tools were used for data mining and pattern detection, allowing the experts to sort, filter and analyze large data sets to identify unusual patterns or discrepancies.`;
const VFX=`Video enhancement software was used to improve the quality of the low-resolution footage, including sharpening the image, adjusting contrast, and reducing noise. Stabilization software was used to smooth out shaky footage, making it easier to identify important details. Techniques of time-stamping and frame-by-frame analysis were used to extract relevant details from the footage from a relevant time frame. `;
const AUX=`Audio enhancement software was used to enhance the audio for improved clarity and reduced noisy, filtering out background noise and amplifying certain frequencies to isolate the voice more clearly. Voice samples were collected and acoustic features were extracted to be analyzed using advanced audio technology. Vocal features extracted for analysis included pitch, tone, timbre and voice biometrics. Spectrograms were used for voice matching, offering a possibility to examine unique frequency patterns and match visual representations of the submitted samples. `;
const IAX=`The images were processed using photo forensic software to verify their authenticity and exclude any doctoring. Trained forensic experts visually examined the images for oddities, such as unnatural edges, inconsistent lighting, or odd reflections. The images were also compared with other known images from similar locations to identify any signs of potential tampering. Error Level Analysis (ELA) was used to examine the compression levels in an image to identify areas that have been altered. Areas that have been changed will typically show different error levels compared to the rest of the image. `;
const MEDE=[['type','Type'],['url','Link'],['desc','Link text']];
const TP={
cs:{name:'Crime Scene Report',d:'Scene processing and evidence inventory',
 f:[...SY2,['pics','Crime scene pictures URL'],{k:'items',label:'Evidence inventory (E1, E2…)',cols:[['item','Item'],['evd','Evidence number','t','','EVD-9999999']]},['narr','Narrative','a'],{k:'corp',label:'Corpse information (optional)',opt:1,cols:[['name','Spoiler label'],['url','Image URL']]},STL,STN],
 b:(v,R)=>`${TOP(0,'Crime Scene Report')}\n\n${SYNC(v)}\n\n[b][u]Evidence Inventory[/u][/b]\n\n[list]\n[*][b]E0[/b] [url=${v.pics}]Crime Scene Pictures[/url] [i]Departamental report database[/i]\n${R('items',(r,n)=>`[*][b]E${n}[/b] ${r.item} [i]${r.evd}[/i]`)}\n[/list]\n\n[b][u]Narrative[/u][/b]\n${v.narr}\n\n${(c=>c?`[b][u]((Corpse Information))[/u][/b]\n${c}\n\n\n`:'')(R('corp',r=>`[altspoiler=${r.name}][img]${r.url}[/img][/altspoiler]`))}[justify]The remaining portion(s) of the above evidence are being preserved in the ${v.store} Crime Laboratory ${FUT}, under [b]${v.evn}[/b].[/justify]\n\n${SIGW()}\n\n\n${HD(0)}`},
vp:{name:'Vehicle Processing Report',d:'Vehicle examination results',
 f:[...SY2,{k:'veh',label:'Vehicles',cols:[['make','Vehicle make/model'],['plate','Vehicle plate'],['owner','Registered owner'],['hot','Hotwired','s',['Yes','No']]]},{k:'res',label:'Examination results (one block per vehicle)',cols:[['h','Heading','t','','Vapid Riata - PL4T3'],['fin','Findings (one per line)','a']]}],
 b:(v,R)=>`${TOP(1,'Vehicle Processing Report')}\n\n${SYNC(v)}\n\n\n[b]Vehicle Information: [/b]\n[list]\n${R('veh',(r,n)=>`[*][b]Vehicle ${n}[/b]\n[list]\n[*] [b]Vehicle Make/Model:[/b] ${r.make}\n[*] [b]Vehicle Plate:[/b] ${r.plate}\n[*] [b]Registered Owner:[/b] ${r.owner}\n[*] [b]Hotwired:[/b] ${r.hot}\n[/list]\n`)}\n[/list]\n[hr]\n[b]Examination and Results: [/b]\n${R('res',r=>`[b]${r.h}[/b]\n[list]${r.fin.split(/\r?\n/).filter(x=>x.trim()).map((l,i)=>(i?'\n':'')+'[*] '+l.trim()).join('')}\n[/list]\n`)}\n[hr]\n${SIGW()}\n\n${HD(1)}`},
pm:{name:'Positive Match Notification',d:'Friction ridge positive match',
 f:[['name','Arrested person','t','','FIRST LAST'],['arr','Arrest date','dn'],['sh','Case reference','t','','SH-00000'],['eref','Evidence and AFIS reference','t','','E1 - AFIS-#STRING'],['rq','Reexamination requested by'],['bur','Bureau']],
 b:v=>`[block=1,20,black,white]${TOP(1,'Positive Match Notification')}\n\n\n[b][u]Results of Examination and Conclusion[/u][/b]\n[list]\n[*] Following the arrest of [b]${v.name}[/b] on [b]${v.arr}[/b], their Friction Ridge Profile produced a positive match to a previously unmatched profile found in [b]${v.sh}[/b] under [b]${v.eref}[/b]\n[/list]\n\n\n[b][u]Reexamination requested by[/u][/b]\n${v.rq}\n${v.bur}\n\n${SIGW(1)}\n\n\n${HD(1)}[/block]`},
dna:{name:'DNA Profiling Report',d:'STR profiling and CODIS results',
 f:[...SY,{k:'e',evl:['desc'],label:'Evidence submitted',cols:[['desc','Description','t','Blood samples submitted for DNA analysis'],['ids','DNA identifiers','t','','#1000-#1005']]},
 {k:'m',tone:'g',label:'Matched profiles (optional, left out when empty)',opt:1,cols:[['ev','Evidence tested','E'],['id','DNA string (paste only the string)','t','','42506F7352616E646F75726973323235313538'],['name','Name']]},
 {k:'u',tone:'o',label:'Unmatched profiles (optional)',opt:1,cols:[['ev','Evidence tested','E'],['id','DNA string','t','','536172617961685F4B656C6C73'],['note','Note','t','','John Doe - No DNA on file']]},
 {k:'d',tone:'r',label:'Deceased (optional)',opt:1,cols:[['ev','Evidence tested','E'],['id','DNA string','t','','42506F7352616E646F75726973323235313538'],['kind','Type','s',['PK','CK']],['name','Actual character name'],['ic','Name shown in game','t','John Doe']]}],
 b:(v,R)=>`${TOP(1,'DNA Profiling Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for DNA Analysis[/u][/b]\n[list=1]${R('e',(r,n)=>`[*]E${n} - ${r.desc} - [b]${r.ids}[/b]`)}\n[/list]\n[b][u]Examination[/u][/b]\n${DNAX}\n\n[b][u]Results of Profiling and Conclusion[/u][/b]\n\n${[BX('lightgreen','Matched profiles',R('m',r=>`${r.ev} - [CODIS-${pid(r.id)}]  - [b]${r.name}[/b]`),'\n'),BX('#FFBF40','Unmatched profiles',R('u',r=>`${r.ev} - [CODIS-${pid(r.id)}] - [b]UNKNOWN[/b] [i](( ${r.note} ))[/i]`),'\n'),BX('#FF8080','Deceased',R('d',r=>`${r.ev} - [CODIS-${pid(r.id)}]  - [b]${r.ic} ((${r.kind}: ${r.name}))[/b]`),'\n')].filter(Boolean).join('\n\n')}\n\n\n[b][u]Preservation of Evidence[/u][/b]\n[justify]All DNA samples have been entered into CODIS.\n[/justify]\n${SIGW()}\n\n\n${HD(1)}`},
fr:{name:'Friction Ridge Examination Report',d:'Latent print ACE-V examination',
 f:[...SY,{k:'e',evl:['item'],nf:['m','u','d'],label:'Evidence submitted',cols:[['item','Item'],['evd','Evidence number','t','','EVD-99999999999']]},
 {k:'m',tone:'g',dec:1,label:'Matched profiles (optional, left out when empty)',opt:1,cols:[['ev','Evidence tested','E'],['id','AFIS string (paste only the string)','t','','417273656E696A655F447261736B6F766963'],['name','Name (filled in automatically)']]},
 {k:'u',tone:'o',label:'Unmatched profiles (optional)',opt:1,cols:[['ev','Evidence tested','E'],['id','AFIS string','t','','417273656E696A655F447261736B6F766963'],['note','Note','t','','John Doe - No fingerprints on file']]},
 {k:'d',tone:'r',dec:1,label:'Deceased (optional)',opt:1,cols:[['ev','Evidence tested','E'],['id','AFIS string','t','','417273656E696A655F447261736B6F766963'],['kind','Type','s',['PK','CK']],['name','Actual character name (filled in automatically)'],['ic','Name shown in game','t','John Doe']]},STL,STN],
 b:(v,R,X)=>`${TOP(1,'Friction Ridge Examination Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Friction Ridge Examination[/u][/b]\n[list=1]\n${R('e',(r,n)=>`[*]E${n} - ${r.item} - [b]${r.evd}[/b]`)}\n[/list]\n[b][u]Examination[/u][/b]\n${FRX}\n\n[b][u]Results of Verifications[/u][/b]\n${(u=>u?`[list=1]\n[*] No fingerprints were found on items: ${u}\n[/list]\n\n`:'')(X.unref(['m','u','d']))}${[BX('lightgreen','Matched profiles',R('m',r=>`${r.ev} - [AFIS-${pid(r.id)}]  - [b]${r.name}[/b]`),''),BX('#FFBF40','Unmatched profiles',R('u',r=>`${r.ev} - [AFIS-${pid(r.id)}]  - [b]UNKNOWN[/b] [i](( ${r.note} ))[/i]`),''),BX('#FF8080','Deceased',R('d',r=>`${r.ev} - [AFIS-${pid(r.id)}]  - [b]${r.ic} ((${r.kind}: ${r.name}))[/b]`),'')].filter(Boolean).join('\n\n')}\n[b][u]Preservation of Samples[/u][/b]\nThe remaining portion(s) of the above evidence and all digitally imaged latent prints are being preserved in the ${v.store} Crime Laboratory ${FUT}, under [b]${v.evn}[/b].\n\nAll fingerprint samples have been entered into SAAFIS.\n\n${SIGW()}\n\n\n${HD(1)}`},
ba:{name:'Forensic Ballistics Report',d:'Casing and IBIS examination',
 f:[...SY,{k:'e',evl:['item'],label:'Evidence submitted',cols:[['item','Item'],['evd','Evidence number','t','','EVD-1234'],['m','Item resulted in IBIS match','c'],['ibis','IBIS matches (paste from game)','a','','','if:m']]},STL,STN],
 b:(v,R)=>`${TOP(1,'Forensic Ballistics Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list=1]\n${R('e',(r,n)=>`[*]E${n} - ${r.item} - [b]${r.evd}[/b]`)}\n[/list]\n[b][u]Examination[/u][/b]\n${BAX}\n\n[b][u]Results of Examination and Conclusion[/u][/b]\n[list=1]\n${R('e',(r,n)=>r.m?`[*]Item E${n} has produced the following IBIS matches:\n[code]\n${r.ibis}\n[/code]`:'')}\n[/list]\n[b][u]Preservation of Evidence[/u][/b]\nThe remaining portion(s) of the above evidence and any evidence that was generated in a controlled environment for comparison are being preserved in the ${v.store} Crime Laboratory ${FUT}, under [b]${v.evn}[/b].\n\nAll samples have been entered into IBIS.\n\n${SIGW()}\n\n\n${HD(1)}`},
tr:{name:'Trace Analysis Report',d:'GSR kit analysis',
 f:[...SY,{k:'e',evl:['name'],label:'Evidence submitted (GSR kits)',cols:[['name','Person name only (the text “collected from” is already in the template)']]},{k:'res',label:'Results',cols:[['ev','Sample','E'],['r','Result','s',['positive','negative']]]},STL],
 b:(v,R)=>`${TOP(1,'Trace Analysis Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*]E${n} - GSR test kit sample collected from [b]${r.name}[/b].`)}\n[/list]\n\n[b][u]Examination[/u][/b]\n${TRX}\n[b][u]Results of Examination and Conclusion[/u][/b]\n[list]\n${R('res',r=>r.r=='positive'?`[*]Test kit returned positive, indicating that gunshot residue (GSR) was detected in sample [b]${r.ev}[/b].`:`[*]Test kit returned negative, indicating that no gunshot residue (GSR) was detected in sample [b]${r.ev}[/b].`)}\n[/list]\n\n[b][u]Preservation of Evidence[/u][/b]\nThe submitted GSR kit as well as GSR discs which were used to collect particles from clothing are being preserved in the ${v.store} Crime Laboratory ${FUT}.\n\n${SIGW()}\n\n\n${HD(1)}`},
na:{name:'Narcotics Analysis Report',d:'Presumptive and confirmatory substance analysis',
 f:[...SY,{k:'e',evl:['sub'],label:'Evidence submitted',cols:[['sub','Description','t','Unidentified substance'],['evd','Evidence number','t','','EVD-1234567'],['w','Evidential weight','t','','10g']]},['paste','Paste the in-game lab analysis here, then press the button (fills the results below)','P'],{k:'res',label:'Results',cols:[['ev','Evidence tested','E'],['sub','Drug name'],['q','Drug quality','s',['','Low','Medium','High']],['qx','Quality cannot be determined','c'],['sig','Laboratory signature','t','','LAB-00721E-RX'],['sx','Laboratory signature cannot be determined','c']]},STL,STN],
 b:(v,R)=>`${TOP(1,'Narcotics Analysis Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*][b]E${n}[/b] - ${r.sub} - [b]${r.evd}[/b] - Evidential weight - ${r.w}`)}\n[/list]\n\n[b][u]Examination[/u][/b]\n${NAX}\n[b][u]Results of Examination and Conclusion[/u][/b]\n${NAG}\n[list]\n${R('res',r=>`[*][b]${r.ev}[/b] - The substance was conclusively identified as [b]${r.sub}[/b]\n[list]\n[*][b]Drug Quality[/b]: ${r.qx?'Could not be determined':r.q}\n[*][b]Laboratory Signature[/b]: ${r.sx?'Could not be determined':r.sig}\n[/list]`)}\n[/list]\n[b][u]Preservation of Evidence[/u][/b]\n[justify]The remaining portion(s) of the above evidence are being preserved in the ${v.store} Crime Laboratory ${FUT}, under [b]${v.evn}[/b].[/justify]\n\n${SIGW()}\n\n\n[size=80][i](*) The suggested category is a categorization made by the scientific team and does not constitute legal advice and/or evidence. It's the investigator's responsibility to check whether it is appropriate.[/i][/size]\n${HD(1)}`},
tx:{name:'Toxicology Report',d:'Alcohol screening and confirmation',
 f:[...SY,{k:'e',evl:['type','name'],label:'Evidence submitted',cols:[['type','Sample type','t','Urine Sample'],['name','Collected from'],['when','Date and time','dt','','07/07/2026 15:00']]},{k:'res',label:'Results',cols:[['ev','Sample','E'],['bac','Blood Alcohol Concentration','t','','0.08%']]},STL],
 b:(v,R)=>`${TOP(1,'Toxicology Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*][b]E${n}[/b] - ${r.type} sample from [b]${r.name} ${r.when}[/b]`)}\n[/list]\n\n[b][u]Examination[/u][/b]\n${TXX}\n\n[b][u]Results of Examination and Conclusion[/u][/b]\n[list]\n${R('res',r=>`[*]Ethyl alcohol (ethanol) was detected in the urine sample sample from [b]${r.ev}[/b]. Blood Alcohol Concentration (BAC) was measured at [b]${r.bac}[/b].`)}\n[/list]\n\n[b][u]Preservation of Evidence[/u][/b]\n[justify]The remaining portion(s) of the above evidence are being preserved in the ${v.store} Crime Laboratory ${FUT}.[/justify]\n\n${SIGW()}\n\n${HD(1)}`},
df:{cat:'digital',name:'Digital Forensics Report',d:'Mobile device extraction and analysis',
 f:[...SY,{k:'e',label:'Devices submitted',cols:[['dev','Device','t','','iFruit 15'],['num','Phone number'],['evd','Evidence number','t','','EVD-999999'],['wurl','Warrant link','t','','https://…'],['wid','Warrant ID']]},{k:'res',label:'Attached extraction files',cols:[['url','Download link'],['label','File label','t','','Number - 07/JUL/2026.zip'],['cl','Call Log','c',true],['ml','Message Log','c',true],['ct','Contact List','c',true],['gl','Gallery','c',true],['other','Other items (one per line, optional)','a','','','opt']]},STL,STN],
 b:(v,R)=>`${TOP(1,'Digital Forensics Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*][b]E${n}[/b] ${r.dev} (${r.num}) - [b]${r.evd}[/b] - Warrant: [url=${r.wurl}]${r.wid}[/url]`)}\n[/list]\n[b][u]Examination[/u][/b]\n[justify]${DFX}[/justify]\n[b][u]Results of Examination and Conclusion[/u][/b]\n\n[justify]The parsed data of the analysis was compiled and attached. The printed evidence consists of a track record of information exchange, including call history, messages and contacts. Generated hash values are also shown for authenticity.[/justify]\n[list]\n${R('res',r=>`[*][url=${r.url}]${r.label}[/url]\n[list]\n${[r.cl&&'Call Log',r.ml&&'Message Log',r.ct&&'Contact List',r.gl&&'Gallery',...r.other.split(/\r?\n/).map(x=>x.trim())].filter(Boolean).map(x=>'[*]'+x).join('\n')}\n[/list]`)}\n[/list]\n[b][u]Preservation of Evidence[/u][/b]\n[justify]The cloned data in sterile storage media is being preserved in the ${v.store} Crime Laboratory ${FUX}, under [b]${v.evn}[/b].[/justify]\n${SIGW()}\n\n${HD(1)}`},
fin:{cat:'digital',name:'Financial Records Analysis',d:'Bank and transaction records review',
 f:[...SY,{k:'e',label:'Records submitted',cols:[['name','Person name'],['acct','Account number','t','','0000000000000000001'],['from','Period start','dn'],['to','Period end','dn'],['wurl','Warrant link','t','','https://…'],['wid','Warrant ID'],['zip','Download link for the results']]}],
 b:(v,R)=>`${TOP(1,'Financial Records Analysis')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*][b]E${n}[/b] Financial records of ${r.name} (${r.acct}) - time period between ${r.from} - ${r.to} - Warrant: [url=${r.wurl}]${r.wid}[/url]`)}\n[/list]\n[b][u]Examination[/u][/b]\n[justify]${FIX}[/justify]\n[b][u]Results of Examination and Conclusion[/u][/b]\n\n${R('e',r=>`Attached below is a spread sheet of the financial records of ${r.name} (${r.acct}) spanning the period between [b]${r.from} - ${r.to}[/b]:\n[list]\n[*] [url=${r.zip}]${r.name} (${r.acct}) financials.zip[/url]\n[/list]`)}\n${SIGW()}\n\n${HD(1)}`},
vf:{cat:'digital',name:'Video Footage Analysis',d:'CCTV and video enhancement review',
 f:[...SY,{k:'e',label:'Footage submitted',cols:[['type','Type','t','CCTV Footage'],['url','Link'],['desc','Link text','t','','Description']]},['tdate','Footage date','dn'],['trange','Time range','t','','15:00-15:30'],['sum','Findings (continues the sentence “After thorough analysis of the CCTV footage … ,”)','a'],{k:'veh',label:'Vehicles identified (optional, left out when empty)',opt:1,cols:[['plate','Plates'],['owner','Registered owner'],['phone','Phone number'],['addr','Last known address'],['rec','Criminal record','t','','N/A']]},STL],
 b:(v,R)=>`${TOP(1,'Video Footage Analysis')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*][b]E${n}[/b] - ${r.type} ([url=${r.url}]${r.desc}[/url])`)}\n[/list]\n[b][u]Examination[/u][/b]\n[justify]${VFX}[/justify]\n[b][u]Results of Examination and Conclusion[/u][/b]\n\n[justify]After thorough analysis of the CCTV footage (time frame ${v.tdate}, between ${v.trange}), ${v.sum}[/justify]\n\n${(s=>s?`[list]\n${s}\n[/list]\n`:'')(R('veh',(r,n)=>`Vehicle ${n}\n[list]\n[list]\n[*] Plates: [b]${r.plate}[/b]\n[*] Registered owner: [b]${r.owner}[/b]\n[*] Phone number: [b]${r.phone}[/b]\n[*] Last Known Address: [b]${r.addr}[/b]\n[*] Criminal Record: [b]${r.rec}[/b]\n[/list]\n[/list]`))}[b][u]Preservation of Evidence[/u][/b]\n[justify]A copy of the footage is stored on a sterile storage media  and is being preserved in the ${v.store} Crime Laboratory ${FUX}.[/justify]\n${SIGW()}\n\n${HD(1)}`},
al:{cat:'digital',name:'Audio Log Analysis',d:'Voice and audio recording analysis',
 f:[...SY,{k:'e',label:'Recordings submitted',cols:[['type','Type','t','Audio Recording'],['url','Link'],['desc','Link text','t','','Description']]},{k:'res',label:'Results (one line each)',cols:[['t','Finding','a']]},STL],
 b:(v,R)=>`${TOP(1,'Audio Log Analysis')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*][b]E${n}[/b] - ${r.type} ([url=${r.url}]${r.desc}[/url])`)}\n[/list]\n[b][u]Examination[/u][/b]\n[justify]${AUX}[/justify]\n[b][u]Results of Examination and Conclusion[/u][/b]\n\n[justify]After thorough analysis submitted voice data, the voice prints obtained from the given samples were compared, and the examination produced the following results:[/justify]\n\n[list]\n${R('res',r=>`[*] ${r.t}`)}\n[/list]\n[b][u]Preservation of Evidence[/u][/b]\n[justify]A copy recordings, as well as any voice biometrics/prints have been stored and are being preserved in the ${v.store} Crime Laboratory ${FUX}.[/justify]\n${SIGW()}\n\n${HD(1)}`},
ia:{cat:'digital',name:'Image Authentication Report',d:'Image authenticity and EXIF analysis',
 f:[...SY,{k:'e',evl:['type'],label:'Images submitted',cols:[['type','Type','t','Images submitted'],['url','Link'],['desc','Link text','t','','may include link to image']]},{k:'res',label:'Results',cols:[['ev','Evidence tested','E'],['desc','Description']]},STL],
 b:(v,R)=>`${TOP(1,'Image Authentication Report')}\n\n${SYNB(v)}\n\n[b][u]Evidence Submitted for Forensic Examination[/u][/b]\n[list]\n${R('e',(r,n)=>`[*][b]E${n}[/b] - ${r.type} ([url=${r.url}]${r.desc}[/url])`)}\n[/list]\n[b][u]Examination[/u][/b]\n[justify]${IAX}[/justify]\n[b][u]Results of Examination and Conclusion[/u][/b]\n\n[justify]The parsed data of the analysis was compiled and attached. The printed evidence consists of a track record of information exchange, including all data extracted through EXIF/Metadata analysis.[/justify]\n[list]\n${R('res',r=>`[*] ${r.ev} - [i]Attachment[/i] EXIF data that includes the timestamps and coordinates of when the photos were taken, as well as the information of device used to take the photo. ${r.desc}`)}\n[/list]\n[b][u]Preservation of Evidence[/u][/b]\n[justify]A copy of the extracted data, as well as a log of the examination have been documented into a report and are being preserved in the ${v.store} Crime Laboratory ${FUX}.[/justify]\n${SIGW()}\n\n${HD(1)}`}
};
/* ---------- report engine ---------- */
const reps=sid=>S.reports.filter(r=>r.sid==sid).sort((a,b)=>b.modified-a.modified),rcur=()=>S.reports.find(x=>x.id==ui.rep);
const pid=s=>String(s).replace(/^(?:CODIS|AFIS)-/i,'').trim();
function nameFromId(s){s=String(s||'').trim().replace(/^(?:CODIS|AFIS)-/i,'').replace(/[\s\[\]]/g,'');if(s.length<4||s.length%2||!/^[0-9a-f]+$/i.test(s))return null;let t='';for(let i=0;i<s.length;i+=2){const c=parseInt(s.substr(i,2),16);if(c<32||c>126)return null;t+=String.fromCharCode(c)}
 const m=/^(AB|A|B|O)(Pos|Neg)(?=[A-Z])(.*?)(\d*)$/.exec(t);let name,blood='',num='';if(m){blood=m[1]+(m[2]=='Pos'?'+':'-');name=m[3];num=m[4]}else{name=t.replace(/\d+$/,'');num=(/\d+$/.exec(t)||[''])[0]}
 return{raw:t,name:name.replace(/_/g,' ').replace(/\s+/g,' ').trim(),blood,num}}
const known=(r,row)=>{const out=[];S.reports.filter(x=>x.sid==r.sid).forEach(x=>['m','d'].forEach(k=>(x.vals[k]||[]).forEach(o=>{if(o!==row&&o.name&&/\s/.test(String(o.name).trim()))out.push(String(o.name).trim())})));return out};
const complete=(r,row,tok)=>{if(!tok||/\s/.test(tok))return[];const t=tok.toLowerCase();return[...new Set(known(r,row).filter(n=>n.toLowerCase().split(/\s+/).includes(t)))]};
const hintOf=(d,c)=>'Decoded: '+d.raw+(d.blood?' · Blood type '+d.blood:'')+(d.num?' · Number '+d.num:'')+(!/\s/.test(d.name)?' · this string holds only one name part':'')+(c&&c.length>1?' · could be: '+c.join(' / '):'')+(c&&c.length==1?' · completed from a fingerprint match':'');
function parseLab(tx){const bl=[];let c=null;tx.split(/\r?\n/).forEach(l=>{l=l.replace(/^\s*\[[^\]]*\]\s*/,'').replace(/^\s*\[INFO\]\s*/i,'').trim();let m;
 if(m=/^Drug Name\s*:\s*(.+)$/i.exec(l)){c={sub:m[1].trim(),q:'',qx:false,sig:'',sx:false};bl.push(c)}
 else if(c&&(m=/^Drug Quality\s*:\s*(.+)$/i.exec(l))){const v=m[1].trim().toLowerCase();if(/^(low|medium|high)$/.test(v))c.q=v[0].toUpperCase()+v.slice(1);else c.qx=true}
 else if(c&&(m=/^Laboratory Signature\s*:\s*(.+)$/i.exec(l))){const s=m[1].trim(),g=/LAB-[\w-]+/i.exec(s);if(g)c.sig=g[0];else if(/could not be determined/i.test(s))c.sx=true;else c.sig=s}});return bl}
const hintTxt=(v,r,o)=>{const d=nameFromId(v);if(!d)return '';return esc(hintOf(d,r?complete(r,o,d.name):[]))};
function autoName(r,t){if(t.dataset.rc!='id')return;const rk=t.dataset.rk,f=TP[r.type].f.find(x=>x.k==rk);if(!f||!f.dec)return;const ri=+t.dataset.ri,row=r.vals[rk][ri],d=nameFromId(t.value),c=d?complete(r,row,d.name):[],hn=root.querySelector(`[data-hint="${rk}:${ri}"]`);if(hn)hn.textContent=d?hintOf(d,c):'';
 if(d&&d.name&&(!row.name||row.name===row._an)){const nm=c.length==1?c[0]:d.name;row.name=nm;row._an=nm;const i=root.querySelector(`[data-rk="${rk}"][data-ri="${ri}"][data-rc="name"]`);if(i)i.value=nm}}
function fixNames(r){if(r.type!='fr')return;let ch=0;['m','d'].forEach(k=>(r.vals[k]||[]).forEach(o=>{if(o._an&&o.name===o._an&&!/\s/.test(o._an)){const c=complete(r,o,o._an);if(c.length==1){o.name=o._an=c[0];ch=1}}}));if(ch)qs(r)}
const rowNew=(T,k,n)=>{const f=T.f.find(x=>x.k==k),o={};f.cols.forEach(c=>o[c[0]]=c[2]=='c'?!!c[3]:c[2]=='E'?[]:c[2]=='s'?c[3][0]:c[3]||'');if(f.evl)o._id=uid();return o};
const unrefOf=(r,ks)=>{const ef=TP[r.type].f.find(x=>x.evl),ER=ef?(r.vals[ef.k]||[]):[],used=new Set();ks.forEach(k=>(r.vals[k]||[]).forEach(o=>Array.isArray(o.ev)&&o.ev.forEach(i=>used.add(i))));return ER.map((o,i)=>used.has(o._id)?'':'E'+(i+1)).filter(Boolean).join('; ')};
const nfH=r=>{const ef=TP[r.type].f.find(x=>x.evl);return ef&&ef.nf?`Items not assigned to any person are reported as having no fingerprints. Currently: <b>${esc(unrefOf(r,ef.nf)||'none')}</b>`:''};
const evLbl=(r,o,i)=>`E${i+1} · ${(TP[r.type].f.find(x=>x.evl).evl.map(k=>o[k]||'').join(' ').trim()||'(untitled)').slice(0,40)}`;
function chips(r,f,c,o,ri){const ef=TP[r.type].f.find(x=>x.evl),ER=r.vals[ef.k]||[],sel=Array.isArray(o[c[0]])?o[c[0]]:[];
 return `<div class="lb">${esc(c[1])}${typeof o[c[0]]=='string'&&o[c[0]]?` <small>(older value: ${esc(o[c[0]])})</small>`:''}<div>${ER.map((e,i)=>`<label class="chip"><input type="checkbox" data-rk="${f.k}" data-ri="${ri}" data-rc="${c[0]}" data-eid="${e._id}" ${sel.includes(e._id)?'checked':''}><span data-lbl="${e._id}">${esc(evLbl(r,e,i))}</span></label>`).join('')||'<small>Add evidence items above first.</small>'}</div></div>`}
const defVals=T=>{const o={};T.f.forEach(f=>{if(Array.isArray(f))o[f[0]]=f[2]=='s'?f[3][0]:(f[3]||'');else o[f.k]=f.opt?[]:[rowNew(T,f.k,1)]});return o};
const blank=T=>{const o={};T.f.forEach(f=>o[Array.isArray(f)?f[0]:f.k]=Array.isArray(f)?(f[2]=='s'?f[3][0]:''):[]);return o};
function out(r){const T=TP[r.type],miss=[];
 const evf=T.f.find(x=>x.evl),ER=evf?(r.vals[evf.k]||[]):[];ER.forEach(o=>{if(!o._id)o._id=uid()});const EL=ER.map(o=>o._id);
 const elab=raw=>Array.isArray(raw)?raw.map(id=>EL.indexOf(id)).filter(i=>i>-1).sort((a,b)=>a-b).map(i=>'E'+(i+1)).join('; '):String(raw??'').trim();
 const X={unref:ks=>unrefOf(r,ks)};
 const mk=(o,F,suf)=>new Proxy(o,{get:(t,k)=>{const f=F.find(x=>x[0]==k);if(f&&f[2]=='c')return t[k]?'1':'';let v=f&&f[2]=='E'?elab(t[k]):String(t[k]??'').trim();if(f&&f[2]=='d')v=fdt(v);if(f&&f[2]=='dn')v=fdt(v,'n');if(!v){if(f&&f[5]=='opt')return '';const l=(f?f[1]:String(k))+suf;if(!miss.includes(l))miss.push(l);return `<<${l.toUpperCase()}>>`}return v}});
 const v=mk(r.vals,T.f.filter(Array.isArray),'');
 const R=(k,fn)=>{const f=T.f.find(x=>x.k==k);return (r.vals[k]||[]).map((o,i)=>fn(mk(o,f.cols,` (${f.label}, row ${i+1})`),i+1)).filter(s=>s!=='').join('\n')};
 CM=miss;CR=r;let bb;try{bb=T.b(v,R,X)}finally{CM=null;CR=null}return{bb,miss}}
function pvh(bb){const st=[];let h=esc(bb);
 h=h.replace(/\[img(?:mh=\d+)?\]([^\[]*)\[\/img(?:mh)?\]/g,(m,u)=>/^data:image\//.test(u)?`<img src="${u}" style="max-height:60px">`:'<span class="tag">[image]</span>').replace(/\[\/?(?:transtable|tr|transtd|block)[^\]]*\]/g,' ')
 .replace(/\[(\/?)(b|i|u)\]/g,'<$1$2>').replace(/\[(\/?)center\]/g,(m,c)=>c?'</div>':'<div style="text-align:center">').replace(/\[(\/?)right\]/g,(m,c)=>c?'</div>':'<div style="text-align:right">').replace(/\[(\/?)justify\]/g,(m,c)=>c?'</div>':'<div style="text-align:justify">')
 .replace(/\[size=(\d+)\]/g,'<span style="font-size:$1%">').replace(/\[\/size\]/g,'</span>').replace(/\[url=[^\]]*\]/g,'<u>').replace(/\[\/url\]/g,'</u>')
 .replace(/\[list(=1)?\]|\[\/list\]/g,m=>m=='[/list]'?'</'+(st.pop()||'ul')+'>':(st.push(m=='[list]'?'ul':'ol'),m=='[list]'?'<ul>':'<ol>')).replace(/\[\*\]/g,'<li>').replace(/\[hr\]/g,'<hr>')
 .replace(/\[divbox=([^\]]*)\]/g,(m,c)=>`<div style="background:${/^(#[0-9a-f]{3,6}|[a-z]+)$/i.test(c)?c:'#ccc'};padding:6px;margin:6px 0">`).replace(/\[\/divbox\]/g,'</div>')
 .replace(/\[altspoiler=([^\]]*)\]/g,'<div><i>Spoiler: $1</i></div><div>').replace(/\[\/altspoiler\]/g,'</div>').replace(/\[code\]/g,'<pre>').replace(/\[\/code\]/g,'</pre>');
 return h.replace(/\n/g,'<br>')}
const fileField=(id,accept,label,shown)=>`<label class="fl"><span>${label}</span><div class="filepick"><input type="file" id="${id}" accept="${accept}"><span class="fp-btn">Choose file</span><span class="fp-name">${shown||'No file chosen'}</span></div></label>`;
const CAL='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path></svg>';
const dpName=(p,a)=>p+':'+a.replace(/[^A-Za-z0-9]+/g,'-');
// A date field: a hidden value (carries the data-* hooks the editor already uses), the site calendar button and a Now button.
const dpField=(a,val)=>{const n=dpName('dp',a);return `<div class="dp" data-dpn="${esc(n)}"><input type="hidden" ${a} value="${esc(val||'')}"><button type="button" class="dp-trigger" data-a="dpopen" data-dp="${esc(n)}" aria-label="Choose date"><span class="dp-label"></span>${CAL}</button><button type="button" class="sm" data-a="dpnow" data-dp="${esc(n)}" title="Set to today">Now</button></div>`};
// Date and time stored as DD/MM/YYYY HH:MM: calendar + time + Now (UK time).
const dtField=(a,val,l)=>{const m=/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}:\d{2}))?/.exec(String(val||'').trim()),iso=m?`${m[3]}-${m[2]}-${m[1]}`:'',tm=m&&m[4]||'',n=dpName('dt',a);return `<div class="fl"><span>${esc(l)}</span><div class="dt"><input type="hidden" ${a} value="${esc(val||'')}"><div class="dp" data-dpn="${esc(n)}"><input type="hidden" data-dtp="date" value="${iso}"><button type="button" class="dp-trigger" data-a="dpopen" data-dp="${esc(n)}" aria-label="Choose date"><span class="dp-label"></span>${CAL}</button></div><input type="time" data-dtp="time" value="${tm}" aria-label="Time (24-hour)"><button type="button" class="sm" data-a="dtnow" data-dp="${esc(n)}" title="Set to the current UK date and time">Now</button></div></div>`};
function regDates(){root.querySelectorAll('.dp').forEach(d=>{const n=d.dataset.dpn;extDatePickers[n]={value:d.querySelector('input'),label:d.querySelector('.dp-label'),trigger:d.querySelector('.dp-trigger')};updateTaskListDateLabel(n)})}
const wn=o=>o.miss.length?`<div class="wnb"><b>Missing ${o.miss.length}:</b> ${o.miss.map(esc).join(', ')}</div>`:'<div class="okb">All fields complete.</div>';
const pvw=o=>ui.pv=='raw'?`<textarea class="mono" readonly rows="18" onfocus="this.select()">${esc(o.bb)}</textarea>`:`<div class="pvb">${pvh(o.bb)}</div>`;
function fld(f,val,a){const[k,l,t='t',d,ph]=f;if(t=='dt')return dtField(a,val,l);if(t[0]=='d')return `<div class="fl"><span>${esc(l)}</span>${dpField(a,val)}</div>`;if(t=='P')return `<div class="w"><label class="fl"><span>${esc(l)}</span><textarea class="mono" rows="5" ${a} placeholder="[INFO] Police Lab Analysis:&#10;[INFO] Drug Name: Cocaine&#10;[INFO] Drug Quality: Low&#10;[INFO] Laboratory Signature: LAB-00721E-RX">${esc(val)}</textarea></label><div class="toolbar"><button class="sm" data-a="napaste">Fill results from this text</button></div></div>`;if(t=='c')return `<label class="chkl w"><input type="checkbox" ${a} ${val?'checked':''}> ${esc(l)}</label>`;return `<label class="fl${t=='a'?' w':''}"><span>${esc(l)}</span>${t=='s'?`<select ${a}>${d.map(o=>`<option${o==val?' selected':''}>${esc(o)}</option>`).join('')}</select>`:t=='a'?`<textarea rows="3" ${a}>${esc(val)}</textarea>`:`<input ${a} ${t[0]=='d'?'type="date"':''} ${['req','inv'].includes(k)?'list="chn"':''} value="${esc(val)}" placeholder="${esc(ph||'')}">`}</label>`}
function rowsH(f,r){const rows=(r.vals[f.k]||[]).map((o,i)=>`<div class="row${ui.fresh==f.k+':'+i?' enter':''}"><div class="row-h"><span class="num">${f.evl?'E':'#'}${i+1}</span><button class="d sm" data-a="rdel" data-k="${f.k}" data-i="${i}">Remove</button></div><div class="g">${f.cols.map(c=>{const a=`data-rk="${f.k}" data-ri="${i}" data-rc="${c[0]}"`,w=(c[5]||'').startsWith('if:')?c[5].slice(3):'',x=(c[2]=='E'?chips(r,f,c,o,i):fld(c,o[c[0]]??'',a))+(c[0]=='id'&&f.dec?`<div class="ln w" data-hint="${f.k}:${i}">${hintTxt(o.id,r,o)}</div>`:'');return w?`<div class="cond w${o[w]?'':' hid'}" data-if="${f.k}:${i}:${w}">${x}</div>`:x}).join('')}</div></div>`).join('');
 return `<section class="card grp${f.tone?' tone-'+f.tone:''}"><div class="card-h"><h3>${esc(f.label)}</h3>${f.opt?'<span class="tag">optional</span>':''}</div>${rows||'<p class="empty-s">Nothing added yet.</p>'}<div class="toolbar"><button class="sm" data-a="radd" data-k="${f.k}">+ Add row</button></div>${f.nf?`<p class="mu" id="nfn">${nfH(r)}</p>`:''}</section>`}
function vdiff(r,x){const o=[];TP[r.type].f.forEach(f=>{const k=Array.isArray(f)?f[0]:f.k;if(JSON.stringify(x.vals[k])!=JSON.stringify(r.vals[k]))o.push(Array.isArray(f)?`<div class="ln">${esc(f[1])}: ${esc(x.vals[k])} → ${esc(r.vals[k])}</div>`:`<div class="ln">${esc(f.label)}: rows changed</div>`)});return o.join('')||'<div class="ln">Identical to current.</div>'}
const vers=r=>`<div class="card"><div class="card-h"><h3>Version history (${r.versions.length})</h3></div>${r.versions.map((x,i)=>`<div class="item vr"><div class="item-main"><span class="item-t">${fmtD(x.ts)}</span></div><div class="item-a"><button class="sm" data-a="rcmp" data-i="${i}">Changes vs current</button><button class="sm" data-a="rrest" data-i="${i}">Restore</button></div></div>${ui.cmp===i?`<div class="diff">${vdiff(r,x)}</div>`:''}`).reverse().join('')||'<p class="empty-s">Versions are saved when you copy, download, mark completed or press Save version. They are never deleted.</p>'}</div>`;
function edit(r){fixNames(r);const T=TP[r.type],o=out(r);
 const parts=[];let flat=[],keys=[];const flush=()=>{if(!flat.length)return;const first=!parts.length;const title=keys.includes('narr')?'Narrative':keys.includes('store')?'Evidence storage':keys.includes('paste')?'Lab log import':(keys.includes('inv')||keys.includes('req'))?'Synopsis':'Details';parts.push(`<section class="card grp"><div class="card-h"><h3>${title}</h3></div><div class="g">${flat.join('')}</div></section>`);flat=[];keys=[]};
 T.f.forEach(f=>{if(Array.isArray(f)){flat.push(fld(f,r.vals[f[0]]??'',`data-rf="${f[0]}"`));keys.push(f[0])}else{flush();parts.push(rowsH(f,r))}});flush();
 return `<div class="crumb"><button class="sm" data-a="rback">← ${ui.from?'Back to history':ui.pk?'Back to package':'All reports'}</button><span class="tag ${r.status=='Completed'?'ok':''}">${r.status}</span></div>${PH(T.name,T.d)}<div class="rg"><div class="col-l"><section class="card grp"><div class="card-h"><h3>Report</h3></div><div class="g"><label class="fl w"><span>Report title</span><input data-rt value="${esc(r.title)}"></label>${C.chars.length?`<label class="fl w"><span>Submitted by (character)</span><select data-ra>${C.chars.map(c=>`<option value="${c.id}"${c.id==((charById(r.author)||defChar()||{}).id)?' selected':''}>${esc(c.name)}${c.title?' · '+esc(c.title):''}</option>`).join('')}</select></label>`:`<div class="wnb w">No character yet. <button class="sm" data-a="go" data-v="characters">Create one</button> to fill in the signature.</div>`}</div></section>${parts.join('')}</div>
 <div class="col-r"><div class="card pvc"><div class="card-h"><h3>Preview</h3><div class="seg" role="group" aria-label="Preview mode"><button class="${ui.pv!='raw'?'on':''}" data-a="rpv" data-v="fmt">Formatted</button><button class="${ui.pv=='raw'?'on':''}" data-a="rpv" data-v="raw">Raw BBCode</button></div></div><div id="wn">${wn(o)}</div><div id="pv">${pvw(o)}</div>
 <div class="toolbar"><button class="p" data-a="rcopy">Copy BBCode</button><button class="sm" data-a="rdl">Download TXT</button><button class="sm" data-a="rver">Save version</button><button class="sm" data-a="rdone">${r.status=='Completed'?'Reopen':'Mark completed'}</button><button class="sm" data-a="rreset">Reset template</button><button class="d sm" data-a="rclr">Clear form</button></div></div>${vers(r)}</div></div>`}
const pkl=s=>{if(s.pkg&&!s.pkgMig){s.pkgMig=1;if(s.pkg.sel&&s.pkg.sel.length)(s.pkgs=s.pkgs||[]).push({id:uid(),name:'Case package',...s.pkg,created:Date.now()})}return s.pkgs=s.pkgs||[]};
const curPk=()=>{const s=cur();return s&&pkl(s).find(p=>p.id==ui.pk)};
function pkgBB(pk){const ids=pk.sel.filter(id=>S.reports.some(r=>r.id==id));if(!ids.length)return{bb:'',miss:[],n:0};const miss=[];
 let bb=ids.map(id=>{const r=S.reports.find(x=>x.id==id),o=out(r);o.miss.forEach(m=>{const l=`${r.title}: ${m}`;if(!miss.includes(l))miss.push(l)});return o.bb}).join('\n[hr]\n');
 const m='\nScientific Services Bureau\n',i=bb.lastIndexOf(m),ml=(pk.mail||'').trim(),q=(pk.quote||'').trim();
 if(i>-1&&(ml||q)){const at=i+m.length-1;bb=bb.slice(0,at)+(ml?`\nReport(s) mailed to [b]${ml}[/b]`:'')+(q?`\n[quote=${q}][/quote]`:'')+bb.slice(at)}
 return{bb,miss,n:ids.length}}
const pkOut=pk=>{const o=pkgBB(pk);return o.n?`${wn(o)}${ui.pv=='raw'?`<textarea class="mono" readonly rows="12" onfocus="this.select()">${esc(o.bb)}</textarea>`:`<div class="pvb">${pvh(o.bb)}</div>`}<div class="toolbar"><button class="p" data-a="pkcopy">Copy single message</button><button class="sm" data-a="pkdl">Download TXT</button></div>`:'<p class="empty-s">Add reports above to build the message.</p>'};
const TTL={cs:'Crime Scene Report',vp:'Vehicle Processing Report',pm:'Positive Match Notification',dna:'DNA Profiling Report',fr:'Friction Ridge Report',ba:'Forensic Ballistics Report',tr:'Trace Analysis Report',na:'Narcotics Analysis Report',tx:'Toxicology Report',df:'Digital Forensics Report',fin:'Financial Records Analysis',vf:'Video Footage Analysis',al:'Audio Log Analysis',ia:'Image Authentication Report'};
function pkTitle(pk){const names=pk.sel.map(id=>S.reports.find(r=>r.id==id)).filter(Boolean).map(r=>TTL[r.type]||TP[r.type].name);if(!names.length)return null;const n=String(pk.sh||'').replace(/\D/g,'')||'#####';return{plain:`[SH-${n}] ${names.join(' / ')}`}}
const pktH=pk=>{const t=pkTitle(pk);return t?`<label class="fl"><span>Title</span><input readonly value="${esc(t.plain)}" onfocus="this.select()"></label><div class="toolbar"><button class="p" data-a="pktcopy" data-v="plain">Copy title</button></div>`:'<p class="empty-s">Add reports to the package to generate a title.</p>'};
function pkgView(s,pk){const rs=pk.sel.map(id=>S.reports.find(r=>r.id==id)).filter(Boolean),rest=reps(s.id).filter(r=>!pk.sel.includes(r.id)&&(TP[r.type].cat||'lab')==(pk.cat||'lab'));
 return `<div class="crumb"><button class="sm" data-a="pkback">← All packages</button></div>${PH((pk.cat||'lab')=='digital'?'Digital case package':'Laboratory case package','One scene, several reports, one forum message.')}<div class="card"><div class="card-h"><h3>Package details</h3></div><p class="mu">Filled into every report in this package, so you type them once. The scene location goes into Crime Scene and Vehicle reports only; the other reports keep the laboratory location.</p><div class="g"><label class="fl"><span>Requester</span><input list="chn" data-pk="requester" value="${esc(pk.requester)}"></label><label class="fl"><span>Division / unit</span><input data-pk="unit" value="${esc(pk.unit)}"></label><label class="fl"><span>Scene location</span><input data-pk="loc" value="${esc(pk.loc)}"></label><label class="fl"><span>Date</span>${dpField('data-pk="date"',pk.date)}</label><label class="fl w"><span>Submitted by (character)</span><select data-pk="author"><option value="">Default character</option>${C.chars.map(c=>`<option value="${c.id}"${c.id==pk.author?' selected':''}>${esc(c.name)}${c.title?' · '+esc(c.title):''}</option>`).join('')}</select></label></div></div>
 <div class="card"><div class="card-h"><h3>Reports, in posting order</h3></div><label class="fl"><span>Package name</span><input data-pk="name" value="${esc(pk.name)}"></label><div class="stack">
 ${rs.map((r,i)=>{const n=out(r).miss.length;return `<div class="item"><div class="item-main"><b class="item-t">${i+1}. ${esc(r.title)}</b><div class="tags"><span class="tag">${TP[r.type].name}</span>${n?`<span class="tag er">${n} missing</span>`:'<span class="tag ok">complete</span>'}</div></div><div class="item-a"><button class="sm" data-a="pkmv" data-i="${i}" data-d="-1" title="Move up">↑</button><button class="sm" data-a="pkmv" data-i="${i}" data-d="1" title="Move down">↓</button><button class="p sm" data-a="ropen" data-id="${r.id}">Edit</button><button class="sm" data-a="pkrm" data-id="${r.id}">Remove</button></div></div>`}).join('')||'<p class="empty-s">No reports yet. Add the first one below.</p>'}</div>
 <h3 class="sub-h">Add a report</h3><div class="tiles sm">${Object.entries(TP).filter(([k,t])=>(t.cat||'lab')==(pk.cat||'lab')).map(([k,t])=>`<button class="tile" data-a="rnew" data-t="${k}"><span class="tx"><b>+ ${t.name}</b></span></button>`).join('')}</div>
 ${rest.length?`<h3 class="sub-h">Or add a report you already wrote</h3>${rest.map(r=>`<div class="item vr"><div class="item-main"><span class="item-t">${esc(r.title)}</span></div><div class="item-a"><button class="sm" data-a="pkadd" data-id="${r.id}">+ Add</button></div></div>`).join('')}`:''}</div>
 <div class="card"><div class="card-h"><h3>Title for the forum thread</h3></div><label class="fl"><span>SH number (digits only, leave empty to keep #####)</span><input data-pk="sh" value="${esc(pk.sh)}" placeholder="#####"></label><div id="pkt">${pktH(pk)}</div></div>
 <div class="card"><div class="card-h"><h3>One message</h3><div class="seg" role="group" aria-label="Preview mode"><button class="${ui.pv!='raw'?'on':''}" data-a="rpv" data-v="fmt">Formatted</button><button class="${ui.pv=='raw'?'on':''}" data-a="rpv" data-v="raw">Raw BBCode</button></div></div><p class="mu">Reports are joined in this order, separated by a horizontal rule, with the optional mailed-to and quote lines before the final footer.</p><div class="g"><label class="fl"><span>Report(s) mailed to (optional)</span><input data-pk="mail" value="${esc(pk.mail)}"></label><label class="fl"><span>Quote author (optional)</span><input data-pk="quote" value="${esc(pk.quote)}"></label></div>
 <div id="pko">${pkOut(pk)}</div></div>`}
function vGen(cat){const s=cur();if(!s)return noS();const r=ui.rep&&S.reports.find(x=>x.id==ui.rep&&x.sid==s.id);if(r&&(TP[r.type].cat||'lab')==cat)return edit(r);const pk=ui.pk&&curPk();if(pk&&(pk.cat||'lab')==cat)return pkgView(s,pk);
 const T=Object.entries(TP).filter(([k,t])=>(t.cat||'lab')==cat),rec=pkl(s).filter(p=>(p.cat||'lab')==cat).sort((a,b)=>(b.modified||b.created||0)-(a.modified||a.created||0)).slice(0,3);
 return PH(cat=='lab'?'Laboratory Forensics':'Digital Forensics','Pick a report type to start, or build several reports for one scene as a case package.')+`<div class="card"><div class="card-h"><h3>Case package</h3></div><p class="mu">One scene, several reports, one forum message. Start a package, add reports in any order, then copy everything at once.</p><div class="addrow"><input id="pkn" data-enter="pknew" placeholder="Package name, e.g. Diamond Casino homicide"><button class="p" data-a="pknew">New package</button></div>
 <div class="stack">${rec.map(p=>{const n=p.sel.filter(id=>S.reports.some(x=>x.id==id)).length,meta=(n?n+(n==1?' report':' reports'):'No reports yet')+' · edited '+dOnly(p.modified||p.created);return `<div class="item pk-item"><div class="item-main"><b class="item-t">${esc(p.name)}</b><span class="item-m${n?'':' none'}">${meta}</span></div>${ui.pkd==p.id?`<div class="item-a"><span class="ask">Delete this package? The reports are kept.</span><button class="d sm" data-a="pkdelok" data-id="${p.id}">Delete</button><button class="sm" data-a="pkdelcan">Cancel</button></div>`:`<div class="item-a"><button class="p sm" data-a="pkopen" data-id="${p.id}">Open</button><button class="d sm" data-a="pkdelask" data-id="${p.id}">Delete</button></div>`}</div>`}).join('')||'<p class="empty-s">No packages yet.</p>'}</div></div>
 <h3 class="sub-h">Single report</h3>${T.length?`<div class="tiles">${T.map(([k,t])=>`<button class="tile" data-a="rnew" data-t="${k}"><span class="ic">${IC.reports}</span><span class="tx"><b>${t.name}</b><span class="d">${t.d}</span></span></button>`).join('')}</div>`:'<div class="card mu">The digital forensic templates are being added.</div>'}<div class="toolbar"><button class="sm" data-a="go" data-v="history">All packages and reports in History</button></div>`}
function vReports(){return vGen('lab')}
function vDigital(){return vGen('digital')}
function hlh(){const s=cur(),q=(ui.hq||'').toLowerCase(),ty=ui.ht||'';
 const ps=pkl(s).filter(p=>!q||p.name.toLowerCase().includes(q)).sort((a,b)=>(b.modified||b.created||0)-(a.modified||a.created||0)),rs=reps(s.id).filter(r=>(!ty||r.type==ty)&&(!q||(r.title+' '+(r.bb||'')).toLowerCase().includes(q)));
 return `<h3 class="sub-h">Case packages (${ps.length})</h3>${ps.map(p=>{const n=p.sel.filter(id=>S.reports.some(x=>x.id==id)).length;return `<div class="item pk-item"><div class="item-main"><b class="item-t">${esc(p.name)}</b><div class="tags"><span class="tag">${(p.cat||'lab')=='digital'?'Digital':'Laboratory'}</span><span class="tag">${n} ${n==1?'report':'reports'}</span></div><span class="item-m">Created ${fmtD(p.created)}${p.modified?' · Modified '+fmtD(p.modified):''}</span></div>${ui.pkd==p.id?`<div class="item-a"><span class="ask">Delete this package? The reports are kept.</span><button class="d sm" data-a="pkdelok" data-id="${p.id}">Delete</button><button class="sm" data-a="pkdelcan">Cancel</button></div>`:`<div class="item-a"><button class="p sm" data-a="pkopen" data-id="${p.id}">Open</button><button class="d sm" data-a="pkdelask" data-id="${p.id}">Delete</button></div>`}</div>`}).join('')||'<p class="empty-s">None.</p>'}
 <h3 class="sub-h">Reports (${rs.length})</h3>${rs.map(r=>`<div class="item"><div class="item-main"><b class="item-t">${esc(r.title)}</b><div class="tags"><span class="tag ${r.status=='Completed'?'ok':''}">${r.status}</span><span class="tag">${TP[r.type].name}</span></div><span class="item-m">Created ${fmtD(r.created)} · Modified ${fmtD(r.modified)} · ${r.versions.length} version(s)</span></div>${ui.rdel==r.id?`<div class="item-a"><span class="ask">Permanently delete this report?</span><button class="d sm" data-a="rdelok" data-id="${r.id}">Delete</button><button class="sm" data-a="rdelcan">Cancel</button></div>`:`<div class="item-a"><button class="p sm" data-a="ropen" data-id="${r.id}">Open</button><button class="sm" data-a="rdup" data-id="${r.id}">Duplicate</button><button class="d sm" data-a="rdelask" data-id="${r.id}">Delete</button></div>`}</div>`).join('')||'<p class="empty-s">None.</p>'}`}
function vHistory(){const s=cur();if(!s)return noS();return PH('History','Every report and package you have created, newest first.')+`<div class="bar"><label class="fl grow"><span>Search</span><input placeholder="Search titles and report text" data-bind="hq" value="${esc(ui.hq)}"></label><label class="fl"><span>Type</span><select data-bind="ht"><option value="">All types</option>${Object.entries(TP).map(([k,t])=>`<option value="${k}"${ui.ht==k?' selected':''}>${t.name}</option>`).join('')}</select></label></div><div id="hl">${hlh()}</div>`}
let rst;function qs(r){setI('Saving…');clearTimeout(rst);rst=setTimeout(async()=>{try{await sv(()=>DB.put('reports',r));if(!r.lg||Date.now()-r.lg>3e5){r.lg=Date.now();await log(r.sid,'Report modified',{ref:r.title})}}catch(e){}},500)}
async function snap(r){const bb=out(r).bb,l=r.versions[r.versions.length-1];r.bb=bb;if(l&&l.bb==bb)return;r.versions.push({ts:Date.now(),bb,vals:structuredClone(r.vals)});r.modified=Date.now();await sv(()=>DB.put('reports',r))}
root.addEventListener('input',e=>{const t=e.target,r=rcur();if(!r||!t.dataset)return;
 if('rf' in t.dataset)r.vals[t.dataset.rf]=t.value;else if('eid' in t.dataset){const o=r.vals[t.dataset.rk][+t.dataset.ri],a=Array.isArray(o[t.dataset.rc])?o[t.dataset.rc]:[],i=a.indexOf(t.dataset.eid);if(t.checked&&i<0)a.push(t.dataset.eid);if(!t.checked&&i>-1)a.splice(i,1);o[t.dataset.rc]=a}else if('rc' in t.dataset){r.vals[t.dataset.rk][+t.dataset.ri][t.dataset.rc]=t.type=='checkbox'?t.checked:t.value;autoName(r,t);if(t.type=='checkbox')root.querySelectorAll(`[data-if="${t.dataset.rk}:${t.dataset.ri}:${t.dataset.rc}"]`).forEach(e=>{e.classList.toggle('hid',!t.checked);if(t.checked){e.classList.remove('in');void e.offsetWidth;e.classList.add('in')}});const ef=TP[r.type].f.find(x=>x.evl);if(ef&&t.dataset.rk==ef.k)r.vals[ef.k].forEach((e,i)=>root.querySelectorAll(`[data-lbl="${e._id}"]`).forEach(s=>s.textContent=evLbl(r,e,i)))}else if('rt' in t.dataset)r.title=t.value;else if('ra' in t.dataset)r.author=t.value;else return;
 r.modified=Date.now();const o=out(r);r.bb=o.bb;const nf=$('#nfn');if(nf)nf.innerHTML=nfH(r);$('#wn').innerHTML=wn(o);$('#pv').innerHTML=pvw(o);qs(r)});
Object.assign(A,{
 rnew:async d=>{const s=cur(),T=TP[d.t],n=Date.now(),r={id:uid(),sid:s.id,type:d.t,title:T.name,status:'Draft',created:n,modified:n,vals:defVals(T),versions:[],bb:'',author:(defChar()||{}).id||''};r.bb=out(r).bb;await sv(()=>DB.put('reports',r));S.reports.push(r);await log(s.id,'Report created',{ref:T.name});{const pk=curPk();if(pk&&(pk.cat||'lab')==(T.cat||'lab')){fillPk(r,pk,true);r.bb=out(r).bb;await sv(()=>DB.put('reports',r));pk.sel.push(r.id);pk.modified=Date.now();await saveS(s);await log(s.id,'Report added to package',{ref:T.name,next:pk.name})}}ui.rep=r.id;ui.cmp=null;render()},
 ropen:d=>{const x=S.reports.find(r=>r.id==d.id),fh=V=='history';A.go({v:(TP[x.type].cat||'lab')=='digital'?'digital':'reports'});ui.from=fh?'history':null;ui.pk=null;ui.rep=d.id;ui.cmp=null;render()},rback:()=>{ui.rep=null;if(ui.from){const f=ui.from;ui.from=null;A.go({v:f})}else render()},rpv:d=>{ui.pv=d.v;render()},
 radd:d=>{const r=rcur(),a=r.vals[d.k];a.push(rowNew(TP[r.type],d.k,a.length+1));ui.fresh=d.k+':'+(a.length-1);qs(r);render()},
 rdel:d=>leave(root.querySelector(`[data-a="rdel"][data-k="${d.k}"][data-i="${d.i}"]`)?.closest(".row"),()=>{const r=rcur(),x=r.vals[d.k].splice(+d.i,1)[0];if(x&&x._id)Object.values(r.vals).forEach(a=>Array.isArray(a)&&a.forEach(o=>o&&Array.isArray(o.ev)&&(o.ev=o.ev.filter(i=>i!=x._id))));r.bb=out(r).bb;qs(r);render()}),
 rcopy:async()=>{const r=rcur(),o=out(r);await copy(o.bb);if(o.miss.length)toast(`Copied with ${o.miss.length} missing field(s)`);await snap(r);await log(r.sid,'BBCode copied',{ref:r.title});render()},
 rdl:async()=>{const r=rcur();await snap(r);await dl(r.title.replace(/[^\w -]+/g,'')+'.txt',r.bb);await log(r.sid,'Report exported',{ref:r.title})},
 rver:async()=>{const r=rcur();await snap(r);await log(r.sid,'Report version saved',{ref:r.title});render()},
 rdone:async()=>{const r=rcur(),p=r.status;r.status=p=='Completed'?'Draft':'Completed';await snap(r);await sv(()=>DB.put('reports',r));await log(r.sid,r.status=='Completed'?'Report marked as completed':'Report reopened',{ref:r.title,prev:p,next:r.status});render()},
 rreset:async()=>{const r=rcur();await snap(r);r.vals=defVals(TP[r.type]);await snap(r);await log(r.sid,'Report template reset',{ref:r.title});render()},
 rclr:async()=>{const r=rcur();await snap(r);r.vals=blank(TP[r.type]);r.bb=out(r).bb;await sv(()=>DB.put('reports',r));await log(r.sid,'Report form cleared (previous version kept)',{ref:r.title});render()},
 napaste:async()=>{const r=rcur(),bl=parseLab(r.vals.paste||'');if(!bl.length)return toast('No lab analysis found in that text');out(r);let rows=r.vals.res||[];if(rows.every(o=>!o.sub&&!o.q&&!o.sig&&!o.qx&&!o.sx))rows=[];const E=r.vals.e||[];
  bl.forEach(b=>{const n=rows.length;rows.push({...rowNew(TP.na,'res',n+1),...b,ev:E[n]?[E[n]._id]:[]})});r.vals.res=rows;r.vals.paste='';r.bb=out(r).bb;qs(r);await log(r.sid,'Lab analysis pasted',{ref:r.title,next:bl.length+' result(s)'});toast(bl.length+' result(s) added');render()},
 rcmp:d=>{ui.cmp=ui.cmp===+d.i?null:+d.i;render()},
 rrest:async d=>{const r=rcur(),x=r.versions[+d.i];await snap(r);r.vals=structuredClone(x.vals);await snap(r);await log(r.sid,'Report version restored',{ref:r.title,prev:'current',next:fmtD(x.ts)});render()},
 rdup:async d=>{const o=S.reports.find(x=>x.id==d.id),n=Date.now(),r={...structuredClone(o),id:uid(),title:o.title+' (copy)',status:'Draft',created:n,modified:n,versions:[]};await sv(()=>DB.put('reports',r));S.reports.push(r);await log(r.sid,'Report duplicated',{ref:r.title,prev:o.title});render()},
 rdelask:d=>{ui.rdel=d.id;render()},rdelcan:()=>{ui.rdel=null;render()},
 rdelok:async d=>{await leave(root.querySelector(`[data-a="rdelok"][data-id="${d.id}"]`)?.closest(".item"));const r=S.reports.find(x=>x.id==d.id);await sv(()=>DB.del('reports',r.id));S.reports=S.reports.filter(x=>x.id!=r.id);for(const ss of S.sessions)if((ss.pkgs||[]).some(p=>p.sel.includes(r.id))){ss.pkgs.forEach(p=>p.sel=p.sel.filter(i=>i!=r.id));await saveS(ss)}ui.rdel=null;await log(r.sid,'Report deleted',{ref:r.title,prev:r.bb});render()}});

const PKMAP=[['req','requester'],['inv','requester'],['unit','unit'],['date','date'],['loc','loc']];
function fillPk(r,pk,force){const T=TP[r.type];if(pk.author&&(force||!r.author))r.author=pk.author;PKMAP.forEach(([k,p])=>{if(!pk[p])return;if(k=='loc'&&!['cs','vp'].includes(r.type))return;if(!T.f.some(f=>Array.isArray(f)&&f[0]==k))return;if(force||!r.vals[k])r.vals[k]=pk[p]})}
let pkt;root.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.pk;if(!k)return;const pk=curPk(),s=cur();if(!pk)return;pk[k]=e.target.value;pk.modified=Date.now();if(k!='name'&&k!='sh')$('#pko').innerHTML=pkOut(pk);if(k=='sh'){const pt=$('#pkt');if(pt)pt.innerHTML=pktH(pk)}clearTimeout(pkt);
 pkt=setTimeout(async()=>{await saveS(s);if(['requester','unit','date','loc','author'].includes(k)){for(const id of pk.sel){const r=S.reports.find(x=>x.id==id);if(r){fillPk(r,pk,true);r.bb=out(r).bb;await DB.put('reports',r)}}await log(s.id,'Package details updated',{ref:pk.name,next:k});const el=$('#pko');if(el)el.innerHTML=pkOut(pk)}},600)});
Object.assign(A,{
 pknew:async()=>{const s=cur(),el=$('#pkn'),name=(el&&el.value.trim())||`Case ${pkl(s).length+1}`,pk={id:uid(),name,cat:V=='digital'?'digital':'lab',sel:[],mail:'',quote:'',created:Date.now(),modified:Date.now()};pkl(s).push(pk);await saveS(s);await log(s.id,'Report package created',{ref:name});ui.pk=pk.id;render()},
 pkopen:d=>{const p=pkl(cur()).find(x=>x.id==d.id);A.go({v:p&&p.cat=='digital'?'digital':'reports'});ui.pk=d.id;ui.rep=null;render()},
 pktcopy:async d=>{const t=pkTitle(curPk());if(t)await copy(t[d.v])},pkback:()=>{ui.pk=null;ui.rep=null;render()},
 pkdelask:d=>{ui.pkd=d.id;render()},pkdelcan:()=>{ui.pkd=null;render()},
 pkdelok:async d=>{await leave(root.querySelector(`[data-a="pkdelok"][data-id="${d.id}"]`)?.closest(".item"));const s=cur(),p=pkl(s).find(x=>x.id==d.id);s.pkgs=s.pkgs.filter(x=>x.id!=d.id);ui.pkd=null;await saveS(s);await log(s.id,'Report package deleted (reports kept)',{ref:p.name});render()},
 pkadd:async d=>{const s=cur(),pk=curPk();pk.sel.push(d.id);{const x=S.reports.find(r=>r.id==d.id);fillPk(x,pk,false);x.bb=out(x).bb;await sv(()=>DB.put('reports',x))}pk.modified=Date.now();await saveS(s);await log(s.id,'Report added to package',{ref:S.reports.find(r=>r.id==d.id).title,next:pk.name});render()},
 pkrm:async d=>{await leave(root.querySelector(`[data-a="pkrm"][data-id="${d.id}"]`)?.closest(".item"));const s=cur(),pk=curPk();pk.sel=pk.sel.filter(x=>x!=d.id);await saveS(s);await log(s.id,'Report removed from package',{ref:S.reports.find(r=>r.id==d.id)?.title,prev:pk.name});render()},
 pkmv:async d=>{const s=cur(),a=curPk().sel,i=+d.i,j=i+ +d.d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];await saveS(s);render()},
 pkcopy:async()=>{const s=cur(),pk=curPk(),o=pkgBB(pk);await copy(o.bb);if(o.miss.length)toast(`Copied with ${o.miss.length} missing field(s)`);for(const id of pk.sel){const r=S.reports.find(x=>x.id==id);if(r)await snap(r)}await log(s.id,'Report package copied',{ref:pk.name,next:o.n+' report(s)'})},
 pkdl:async()=>{const s=cur(),pk=curPk(),o=pkgBB(pk);await dl(pk.name.replace(/[^\w -]+/g,'')+'.txt',o.bb);await log(s.id,'Report package exported',{ref:pk.name,next:o.n+' report(s)'})},
});
Object.assign(A,CHA);
Object.assign(A,{
 rclrfile:()=>{ui.rtext='';ui.rfile=null;render()},
 chclr:()=>{const f=$('#ch-file');f.value='';f.parentElement.querySelector('.fp-name').textContent='No file chosen';$('#ch-rm').checked=true;$('#ch-prev').innerHTML='<span>No image</span>'},
 dpopen:d=>toggleDatePicker(d.dp),
 dpnow:d=>{const e=extDatePickers[d.dp];if(!e)return;e.value.value=taskListTodayDate();updateTaskListDateLabel(d.dp);e.value.dispatchEvent(new Event('input',{bubbles:true}))},
 dtnow:d=>{const e=extDatePickers[d.dp],w=e&&e.value.closest('.dt');if(!w)return;e.value.value=taskListTodayDate();w.querySelector('[data-dtp="time"]').value=ukTimeNow('HH:MM');updateTaskListDateLabel(d.dp);e.value.dispatchEvent(new Event('input',{bubbles:true}))}});
// keeps the stored DD/MM/YYYY HH:MM text in step with the calendar and the time box
root.addEventListener('input',e=>{const t=e.target;if(!t.dataset||!t.dataset.dtp)return;const w=t.closest('.dt'),h=w.querySelector('input[type=hidden]:not([data-dtp])'),di=w.querySelector('[data-dtp="date"]'),tm=w.querySelector('[data-dtp="time"]').value;if(!di.value&&tm){di.value=taskListTodayDate();updateTaskListDateLabel(w.querySelector('.dp').dataset.dpn)}const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(di.value);h.value=m?`${m[3]}/${m[2]}/${m[1]}${tm?' '+tm:''}`:'';h.dispatchEvent(new Event('input',{bubbles:true}))});
root.addEventListener('keydown',e=>{const a=e.key=='Enter'&&e.target.dataset&&e.target.dataset.enter;if(a&&A[a])A[a](e.target.dataset)});
root.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])Promise.resolve(A[b.dataset.a](b.dataset)).catch(e=>toast('Action failed: '+(e?.message||e?.code||'error')))});
root.addEventListener('input',e=>{const b=e.target.dataset.bind;if(!b)return;ui[b]=e.target.value;
 if(b=='hq'||b=='ht'){const el=$('#hl');if(el)el.innerHTML=hlh()}else if(b=='q'||b=='sf')$('#lst').innerHTML=slHtml();else if(['gq','gf','gt'].includes(b))$('#res').innerHTML=sr()});
root.addEventListener('change',e=>{const t=e.target;if(t.type=='file'){const n=t.parentElement.querySelector('.fp-name');if(n)n.textContent=t.files[0]?t.files[0].name:'No file chosen'}if(t.id=='rf'){const f=t.files[0];f&&f.text().then(x=>{ui.rtext=x;ui.rfile=f.name+' ('+Math.max(1,Math.round(f.size/1024))+' KB)';render()})}
 else if(t.id=='ch-rank'){const w=$('#ch-title-wrap'),i=$('#ch-title');if(t.value=='__custom'){if([...t.options].some(o=>o.value&&o.value===i.value))i.value='';w.classList.remove('hid');i.focus()}else{w.classList.add('hid');i.value=t.value}}
 else if(t.id=='ch-file'){const f=t.files[0],pv=$('#ch-prev');$('#ch-rm').checked=false;if(f&&/^image\//.test(f.type)){const r=new FileReader();r.onload=()=>{pv.innerHTML=`<img src="${r.result}" alt="Signature">`};r.readAsDataURL(f)}}});
(async()=>{try{await openDB();[S.sessions,S.chatlogs,S.activity,S.reports]=await Promise.all([DB.all('sessions'),DB.all('chatlogs'),DB.all('activity'),DB.all('reports')]);
  const c=(await DB.all('settings')).find(x=>x.k=='cfg');if(c){S.cfg={...DEF,...c};S.cfg.rules={};for(const k in DEF.rules)S.cfg.rules[k]={...DEF.rules[k],...(c.rules||{})[k]};if(S.cfg.rules.dna.validate==='^\\d+$')S.cfg.rules.dna.validate=DEF.rules.dna.validate}
  if(!S.sessions.length){const w={id:uid(),num:1,name:'Workspace',ref:'',desc:'',status:'In Progress',created:Date.now(),modified:Date.now(),added:{dna:[],ser:[]},removed:{dna:[],ser:[]},corr:{dna:{},ser:{}}};await DB.put('sessions',w);S.sessions.push(w)}
  if(!sess(S.cfg.active)){S.cfg.active=S.sessions[0].id;await DB.put('settings',S.cfg)}C.chars=(S.cfg.chars||[]).slice()}catch(e){setI('Save failed',1);toast('Browser storage is unavailable: changes will not persist')}
 render();})();
})();

/* ===== Supplemental Use of Force Report ===== */
(() => {
  const val = (id) => (id === "usup-date" ? formatPickerDate($(id).value, "time-date", $("usup-time").value) : $(id).value.trim());
  function buildUofSupp() {
    return [
      "[font=Arial][color=black]",
      "",
      "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
      "",
      `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
      "",
      "[size=110][u]SUPPLEMENTAL USE OF FORCE REPORT[/u][/size][/center][hr][/hr]",
      "",
      "[font=arial][color=black][indent][size=105][b]Filing Information[/b][/size]",
      "",
      "[indent]",
      `[b]Time & Date:[/b] ${val("usup-date") || "0000, Month Day, Year"}`,
      `[b]Location:[/b] ${val("usup-location")}`,
      "",
      `[b]Filed By:[/b] ${val("usup-filed-by") || "Rank Forename Surname (if partnered, list Partner Deputy as well)"}`,
      `[b]Unit Number:[/b] ${val("usup-unit") || "Callsign"}`,
      "[/indent]",
      "",
      "[size=105][b]Narrative[/b][/size]",
      `[indent]${val("usup-narrative") || "Write narrative here."}[/indent]`,
    ].join("\n");
  }
  window.resetUofSupp = function () {
    ["usup-location", "usup-filed-by", "usup-unit", "usup-narrative"].forEach((id) => ($(id).value = ""));
    $("usup-filed-by").dataset.deputyPrefill = "";
    $("usup-unit").dataset.deputyPrefill = "";
    $("usup-date").value = taskListTodayDate();
    $("usup-time").value = "00:00";
    updateTaskListDateLabel("usup-date");
    applyDeputyDetails();
  };
  $("usup-date").value = taskListTodayDate();
  updateTaskListDateLabel("usup-date");
  applyDeputyDetails();
  // the "This is a Supplemental" switch on both pages jumps between the two forms
  window.uofSuppSwitch = (box) => window.show(box.checked ? "uof-supp" : "uof");
  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "uof-supp") return baseCopy.apply(this, arguments);
    const txt = buildUofSupp();
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  const baseShow = window.show;
  window.show = function (k) {
    baseShow.apply(this, arguments);
    if (k === "uof" || k === "uof-supp") { $("uof-is-supp").checked = false; $("usup-is-supp").checked = true; }
  };
  window.__usup = { build: buildUofSupp };
})();

/* ===== IAB: Use of Force Preliminary Review ===== */
(() => {
  function buildIabPrelim() {
    const ok = $("iab-prelim-ok").checked;
    return [
      "[divbox=white][color=Transparent].[/color]",
      "[center][size=120][b]USE OF FORCE \u2014 PRELIMINARY REVIEW[/b][/size]",
      "[size=110]INTERNAL AFFAIRS BUREAU[/size][/center]",
      "",
      "",
      "[list=none][justify][center]This use of force incident has been subject to preliminary review by Internal Affairs Bureau pursuant to [b]MPP [i]2-03/010.05 INTERNAL AFFAIRS BUREAU[/i][/b], and determined to:[/center][/justify]",
      `[list=none]${ok ? "[cbc][/cbc]" : "[cb][/cb]"} Be in line with Department policy and procedure, and the law.`,
      `${ok ? "[cb][/cb]" : "[cbc][/cbc]"}Contain elements that indicate the use of force incident may not be in line with Department policy and procedure, and/or the law, warranting further investigation.[/list]`,
      "[justify]",
      "[center][size=75][font=courier new][b]LEGAL NOTICE:[/b] THE FINDING ABOVE IS BASED ON A PRELIMINARY ASSESSMENT THAT MAY BE SUBJECT TO CHANGE IN THE EVENT THAT ADDITIONAL WITNESSES, PHYSICAL EVIDENCE, ELECTRONIC RECORDS, AND/OR OTHER FORENSIC EVIDENCE EMERGES. AS SUCH, THE DEPARTMENT'S UNDERSTANDING OF THE FACTS AND CIRCUMSTANCES MAY CHANGE AS ADDITIONAL EVIDENCE IS COLLECTED AND ANALYZED.[/center] [/size][/justify][/list][/divbox]",
    ].join("\n");
  }
  window.resetIabPrelim = () => { $("iab-prelim-ok").checked = true; };
  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "iab-prelim") return baseCopy.apply(this, arguments);
    const txt = buildIabPrelim();
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  window.__iabPrelim = { build: buildIabPrelim };
})();

/* ===== Notice Board: Bonus Assignments, Bonus Removals ===== */
(() => {
  const TYPES = {
    "bonus-assignment": { head: "BONUS ASSIGNMENT", word: "Bonus Assignment" },
    "bonus-removal": { head: "BONUS REMOVAL", word: "Bonus Removal" },
  };
  // Rank: the same dropdown as Character Details (all ranks, then Custom with its own box). The hidden-or-shown
  // text box always holds the final value, so every builder keeps reading the same field.
  window.nbRankReset = (pre) => {
    $(pre + "-rank-sel").selectedIndex = 0;
    $(pre + "-rank-custom-wrap").hidden = true;
    $(pre + "-rank").value = "";
  };
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!t.id || t.id !== "nb-rank-sel") return;
    const box = $("nb-rank"), wrap = $("nb-rank-custom-wrap");
    if (t.value === "__custom") {
      wrap.hidden = false;
      if ([...t.options].some((o) => o.value && o.value === box.value)) box.value = "";
      box.focus();
    } else {
      wrap.hidden = true;
      box.value = t.value;
    }
  }, true);
  // keeps the right-hand Sections outline in step with the cards that are showing for the chosen notice
  window.syncCardOutline = (f) => {
    const cards = [...f.querySelectorAll(":scope > .card")], links = [...f.querySelectorAll(".rail .outline a")];
    if (links.length === cards.length) cards.forEach((c, i) => (links[i].hidden = c.hidden));
  };
  const g = (id) => $("nb-" + id);
  const val = (id) => g(id).value.trim();
  const type = () => (document.querySelector('input[name="nb-type"]:checked') || {}).value || "bonus-assignment";
  const name = () => val("name") || "Firstname Lastname";
  const rank = () => val("rank") || "Rank";
  const asg = (p, u) => (val(p) || "Position") + ", " + (val(u) || "Unit of Assignment");
  function nbBuild(t) {
    const head = [
      "[block=0,40,white,white][center][imgmh=150]https://i.imgur.com/iaZp7uU.png[/imgmh]",
      "",
      "[color=black][b]NOTICE OF " + TYPES[t].head + "[/b][/center]",
      "",
      "",
      "[width=80,auto]",
    ];
    const foot = ["", "[/width][br][br][center][img]https://i.imgur.com/DsKIRPf.png[/img][/center][/color][/block]"];
    const body =
      t === "bonus-assignment"
        ? ["[b]EMPLOYEE NAME & RANK:[/b] " + name() + ", " + rank(), "[b]UPGRADED TO:[/b] " + (val("upgraded") || "Bonus I/Bonus II"), "[b]ASSIGNMENT:[/b] " + asg("position", "unit")]
        : ["[b]EMPLOYEE NAME & RANK:[/b] " + name() + ", " + rank(), "[b]DOWNGRADED TO:[/b] " + (val("downgraded") || "Generalist/Bonus I/Bonus II"), "[b]ASSIGNMENT:[/b] " + asg("position", "unit")];
    return head.concat(body, foot).join("\n");
  }
  // "[Bonus Assignment] Rank Firstname Lastname"
  function nbTitle(t) {
    return "[" + TYPES[t].word + "] " + rank() + " " + name();
  }
  function refresh() {
    const t = type();
    document.querySelectorAll("#f-notices [data-nb]").forEach((c) => (c.hidden = c.dataset.nb !== t));
    $("nb-title").value = nbTitle(t);
    syncCardOutline($("f-notices"));
  }
  window.resetNotices = function () {
    ["name", "position", "unit"].forEach((i) => (g(i).value = ""));
    nbRankReset("nb");
    ["upgraded", "downgraded"].forEach((i) => (g(i).selectedIndex = 0));
    refresh();
  };
  const form = $("f-notices");
  ["input", "change"].forEach((ev) => form.addEventListener(ev, refresh));
  refresh();
  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "notices") return baseCopy.apply(this, arguments);
    const txt = nbBuild(type());
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  window.__notices = { build: nbBuild, title: nbTitle, type };
})();

/* ===== Notice Board: Commendations ===== */
(() => {
  const g = (id) => $("nbc-" + id);
  function nbcBuild() {
    const ooc = (document.querySelector('input[name="nbc-ooc"]:checked') || {}).value || "Yes/No",
      issuer = g("issuer").value.trim();
    return [
      "[center][imgmh=300]https://i.booskit.dev/gtaw/lssd.png[/imgmh]",
      "[b][size=125]COMMENDATION REPORT[/size][/b]",
      "[size=110]AWARDS AND COMMENDATIONS[/size][/center][hr][/hr]",
      "",
      "[b]Name of Employee:[/b] " + g("name").value.trim(),
      "[ooc][b]OOC Commendation:[/b] " + ooc + "[/ooc]",
      "",
      "[b]Notes:[/b] " + g("notes").value.trim(),
      "",
      "[b]Issuing Employee:[/b]" + (issuer ? " " + issuer : ""),
    ].join("\n");
  }
  // the person filing the commendation is the issuing employee, so Character Details fill that box (still editable)
  function applyDeputy() {
    prefillDeputyField("nbc-issuer", [$("deputy-rank").value, $("deputy-full-name").value.trim()].filter(Boolean).join(" "));
  }
  window.resetNoticesCommendations = function () {
    ["name", "notes", "issuer"].forEach((i) => (g(i).value = ""));
    g("issuer").dataset.deputyPrefill = "";
    document.querySelectorAll('input[name="nbc-ooc"]').forEach((r) => (r.checked = false));
    applyDeputy();
  };
  ["deputy-full-name", "deputy-rank"].forEach((id) => ["input", "change"].forEach((ev) => $(id).addEventListener(ev, applyDeputy)));
  $("f-deputy").addEventListener("click", (e) => { if (e.target.closest("button")) applyDeputy(); });
  applyDeputy();
  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "notices-commendations") return baseCopy.apply(this, arguments);
    const txt = nbcBuild();
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  window.__noticesC = { build: nbcBuild };
})();

/* ===== Credits: copy the Discord username ===== */
window.copyDiscordName = async function () {
  const name = "cirano";
  try { await navigator.clipboard.writeText(name); toast("Copied " + name); }
  catch (e) {
    const a = document.createElement("textarea"); a.value = name; document.body.appendChild(a); a.select();
    try { document.execCommand("copy"); toast("Copied " + name); } catch (e2) { toast("Copy failed"); }
    a.remove();
  }
};

/* ===== Stay on the same page after a refresh (the page key lives in the URL hash) ===== */
(() => {
  const valid = (k) => k && k !== "home" && (k === "davis-citation" || !!document.getElementById("f-" + k));
  const baseShow = window.show;
  window.show = function (k) {
    baseShow.apply(this, arguments);
    try { history.replaceState(null, "", k === "home" ? location.pathname + location.search : "#" + k); } catch (e) {}
  };
  const fromHash = () => decodeURIComponent((location.hash || "").slice(1));
  addEventListener("hashchange", () => { const k = fromHash(); if (valid(k)) window.show(k); else if (!k) window.show("home"); });
  const k = fromHash();
  if (valid(k)) window.show(k);
})();
    
