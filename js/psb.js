/* ===== PSB: Crisis and Field Intervention Database + MET Incident Report ===== */
(() => {
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n) => String(n).padStart(2, "0");
  const NA = (s) => (String(s || "").trim() ? String(s).trim() : "N/A");
  const FORMS = {
    cfid: { key: "cfid", met: false },
    met: { key: "met-incident", met: true },
  };
  const ROLES = { Deputy: "Badge Number", Provider: "Service Number" };
  const ASSIGNMENT = "Mental Evaluation Team";

  // DD/MMM/YYYY; HH:MM
  function stamp(dateValue, time) {
    if (!dateValue) return "";
    const [y, m, d] = dateValue.split("-").map(Number);
    if (!y || !m || !d) return "";
    const t = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time || "") ? time : "00:00";
    return pad(d) + "/" + MON[m - 1] + "/" + y + "; " + t;
  }

  // Pure builders (kept free of DOM access so they can be tested on their own).
  const box = (title) => "[divbox=black][color=white][b][center]" + title + "[/center][/b][/color][/divbox]";
  // One table row per person: Deputy -> Badge Number, Provider -> Service Number.
  function personnelTable(people) {
    return [
      "[table=arial]",
      ...people.map((x) =>
        "[tr]\n[td][b]" + x.role + " Full Name[/b]\n" + x.name + "[/td]\n" +
        "[td][b]" + x.role + " Assignment[/b]\n" + x.assignment + "[/td]\n" +
        "[td][b]" + x.role + " " + ROLES[x.role] + "[/b]\n" + x.number + "[/td]\n[/tr]"),
      "[/table]",
    ].join("\n");
  }
  function build(v) {
    const out = [
      "[hr][/hr]",
      "[center][b][size=125]LOS SANTOS COUNTY SHERIFF'S DEPARTMENT",
      "MENTAL EVALUATION TEAM[/size][/b]",
      "[size=110]CRISIS AND FIELD INTERVENTION DATABASE[/size][/center]",
      "[hr][/hr]",
      box("GENERAL INFORMATION"),
      "[table=arial][tr]",
      "[td][b]Date and Time[/b]\n" + v.dateTime + "[/td]",
      "[td][b]Location[/b]\n" + v.location + "[/td]",
      "[td][b]County[/b]\n" + v.county + "[/td]",
      "[td][b]State[/b]\n" + v.state + "[/td]",
      "[/tr][/table]",
      personnelTable(v.people),
      "[table=arial][tr]",
      "[td][b]Type of Incident[/b]\n" + v.type + "[/td]",
      "[td][b]Unit Callsign[/b]\n" + v.callsign + "[/td]",
      "[/tr][/table]",
      "",
    ];
    if (v.met) {
      out.push(
        box("REQUEST INFORMATION"),
        "[divbox=white][vspace=5][/vspace][indent]",
        "[b]Deputy Rank & Name:[/b] " + v.reqName,
        "[b]Request Reason:[/b] " + v.reason,
        "[b]Services Requested:[/b] " + v.services,
        "[/indent][vspace=5][/vspace][/divbox]",
        "",
        box("VICTIM INFORMATION"),
        "[divbox=white][vspace=5][/vspace][indent]" +
          v.victims
            .map((x, i) => "[b]Victim #" + (i + 1) + ":[/b]\n[b]Name:[/b] " + x.name + "\n[b]Age:[/b] " + x.age + "\n[b]Details:[/b] " + x.details + "\n")
            .join("\n") +
          "[/indent][vspace=5][/vspace][/divbox]",
        "",
      );
    }
    out.push(
      box("NARRATIVE"),
      "[divbox=white][center][size=85][b]CONTACT NARRATIVE & EXTERNAL REFERENCES[/b][/size][/center]",
      "[size=85]" + v.narrative + "\n\n[/size][/divbox]",
    );
    return out.join("\n");
  }
  const title = (v) => "[" + v.type + "] " + (v.dateShort ? v.dateShort : "DD/MMM/YYYY") + (v.location ? " - " + v.location : "");
  const joinNames = (a) => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

  const INCIDENT_PHRASE = { "Call of Service": "a call for service", "Inter-Agency Request": "an inter-agency request", "Field Request": "a field request" };

  function setup(p) {
    const cfg = FORMS[p], formEl = $("f-" + cfg.key), g = (id) => $(p + "-" + id);
    // UK time (Europe/London: GMT in winter, BST in summer), date included so it rolls over with the clock
    const nowParts = () => {
      const x = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach((q) => (x[q.type] = q.value));
      return { date: x.year + "-" + x.month + "-" + x.day, time: x.hour + ":" + x.minute };
    };
    const setNow = () => { const n = nowParts(); g("date").value = n.date; g("time").value = n.time; updateTaskListDateLabel(p + "-date"); };

    // ---- personnel: any number of Deputies / Providers ----
    function addPerson(pre) {
      const box = g("people"), row = document.createElement("div");
      row.className = "item psb-victim psb-person";
      row.innerHTML =
        '<div class="psb-vh"><b class="psb-vn"></b><button class="b" type="button" aria-label="Remove personnel">Remove</button></div>' +
        '<div class="g psb-gp"><div class="f"><span>Role</span><select class="p-role"><option>Deputy</option><option>Provider</option></select></div>' +
        '<div class="f"><span>Full Name</span><input type="text" class="p-name" placeholder="Full name" autocomplete="off" /></div>' +
        '<div class="f"><span>Assignment</span><input type="text" class="p-asg" placeholder="' + ASSIGNMENT + '" autocomplete="off" /></div>' +
        '<div class="f"><span class="p-num-l"></span><input type="text" class="p-num" placeholder="XXXXX" inputmode="numeric" autocomplete="off" /></div></div>';
      const q = (c) => row.querySelector(c);
      pre = pre || {};
      q(".p-role").value = pre.role || "Deputy";
      q(".p-name").value = pre.name || "";
      q(".p-asg").value = pre.assignment || ASSIGNMENT;
      q(".p-num").value = pre.number || "";
      if (pre.me) row.dataset.me = "1";
      q(".p-role").addEventListener("change", () => label(row));
      q(".psb-vh .b").onclick = () => { row.remove(); renumber(); refresh(); };
      box.appendChild(row); label(row); renumber();
      return row;
    }
    const label = (row) => { row.querySelector(".p-num-l").textContent = ROLES[row.querySelector(".p-role").value]; };
    function renumber() {
      const rows = [...g("people").children];
      rows.forEach((r, i) => {
        r.querySelector(".psb-vn").textContent = "Personnel #" + (i + 1) + (r.dataset.me ? " (you)" : "");
        r.querySelector(".psb-vh .b").hidden = rows.length < 2;
      });
    }
    const people = () => [...g("people").children].map((r) => ({
      role: r.querySelector(".p-role").value, name: NA(r.querySelector(".p-name").value),
      assignment: NA(r.querySelector(".p-asg").value), number: NA(r.querySelector(".p-num").value),
    }));

    // ---- victims (MET only) ----
    function addVictim(pre) {
      const box = g("victims"), row = document.createElement("div");
      row.className = "item psb-victim";
      row.innerHTML =
        '<div class="psb-vh"><b class="psb-vn"></b><button class="b" type="button" aria-label="Remove victim">Remove</button></div>' +
        '<div class="g psb-g2"><div class="f"><span>Name</span><input type="text" class="v-name" placeholder="Full name" autocomplete="off" /></div>' +
        '<div class="f"><span>Age</span><div class="psb-age"><input type="text" class="v-age" placeholder="Age" inputmode="numeric" autocomplete="off" /><button class="b" type="button" title="Age is not known">D.N.A</button></div></div></div>' +
        '<div class="f"><span>Details</span><textarea class="v-details" placeholder="Condition, circumstances, what the person needs..."></textarea></div>';
      const age = row.querySelector(".v-age");
      row.querySelector(".psb-age .b").onclick = () => { age.value = "D.N.A"; refresh(); };
      row.querySelector(".psb-vh .b").onclick = () => { if (box.children.length > 1) { row.remove(); renumberV(); refresh(); } else toast("At least one victim is required"); };
      if (pre) { row.querySelector(".v-name").value = pre.name || ""; age.value = pre.age || ""; row.querySelector(".v-details").value = pre.details || ""; }
      box.appendChild(row); renumberV();
    }
    function renumberV() {
      const rows = [...g("victims").children];
      rows.forEach((r, i) => { r.querySelector(".psb-vn").textContent = "Victim #" + (i + 1); r.querySelector(".psb-vh .b").hidden = rows.length < 2; });
    }
    const victims = () => cfg.met ? [...g("victims").children].map((r) => ({
      name: NA(r.querySelector(".v-name").value), age: NA(r.querySelector(".v-age").value), details: NA(r.querySelector(".v-details").value),
    })) : [];

    function values() {
      const t = (id) => g(id).value.trim();
      const v = {
        met: cfg.met,
        dateTime: stamp(g("date").value, g("time").value) || "DD/MMM/YYYY; HH:MM",
        location: NA(t("location")), county: NA(t("county")), state: NA(t("state")),
        people: people(),
        type: g("type").value, callsign: NA(t("callsign")),
        narrative: g("narrative").value.replace(/\s+$/, "") || "Write Narrative here.",
      };
      if (cfg.met) Object.assign(v, { reqName: NA(t("req-name")), reason: NA(t("reason")), services: NA(t("services")), victims: victims() });
      return v;
    }
    function titleValues() {
      const s = stamp(g("date").value, g("time").value);
      return { type: g("type").value, dateShort: s ? s.split(";")[0] : "", location: g("location").value.trim() };
    }

    // ---- automation: Character Details -> the first (your) personnel row ----
    function applyDeputy() {
      const me = g("people").querySelector("[data-me]");
      if (me) {
        const fill = (el, val) => {
          if (!el.value.trim() || el.value === el.dataset.deputyPrefill) { el.value = val; el.dataset.deputyPrefill = val; }
        };
        fill(me.querySelector(".p-name"), $("deputy-full-name").value.trim());
        fill(me.querySelector(".p-num"), $("deputy-badge-number").value.trim().replace(/^#/, ""));
      }
      prefillDeputyField(p + "-callsign", $("deputy-callsign").value.trim());
      refresh();
    }
    // ---- automation: first sentence of the narrative ----
    let lastDraft = "";
    function draftOpening() {
      const v = values(), names = v.people.map((x) => x.name).filter((n) => n !== "N/A");
      const subject = names.length ? joinNames(names) : "The responding personnel";
      const cs = v.callsign !== "N/A" ? ", under the callsign " + v.callsign + "," : "";
      let s = subject + cs + " responded to " + (INCIDENT_PHRASE[v.type] || "a request");
      if (cfg.met) {
        if (v.reqName !== "N/A") s += " from " + v.reqName;
        if (v.reason !== "N/A") s += " concerning " + v.reason.replace(/\s+/g, " ").replace(/[.\s]+$/, "").replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase());
      }
      if (v.location !== "N/A") s += " at " + v.location;
      const subj = cfg.met ? "" : g("subject").value.trim();
      if (subj) s += (cfg.met ? "" : " regarding ") + subj;
      s += ". ";
      const cur = g("narrative").value;
      g("narrative").value = lastDraft && cur.includes(lastDraft) ? cur.replace(lastDraft, s) : (cur.trim() ? s + "\n\n" + cur : s);
      lastDraft = s; growTextarea(g("narrative")); g("narrative").focus(); refresh();
    }
    // "Firstname Middle Surname" -> "Surname, Firstname Middle" (last word is the surname)
    const surnameFirst = (name) => {
      const n = String(name || "").trim();
      if (!n) return "Surname, Firstname";
      if (n.includes(",")) return n;
      const w = n.split(/\s+/);
      return w.length < 2 ? n : w[w.length - 1] + ", " + w.slice(0, -1).join(" ");
    };
    function refresh() {
      const t = titleValues();
      g("title").value = cfg.met ? "[MET] " + (t.dateShort || "DD/MMM/YYYY") : "[CFID] " + surnameFirst(g("subject").value);
    }

    function resetPeople() {
      g("people").replaceChildren();
      addPerson({ me: true, role: "Provider" });
    }
    window["psbBuild_" + p] = () => build(values());
    window["psbReset_" + p] = () => {
      ["location", "callsign", "narrative", ...(cfg.met ? [] : ["subject"])].forEach((id) => { g(id).value = ""; g(id).dataset.deputyPrefill = ""; });
      g("county").value = "Los Santos"; g("state").value = "San Andreas";
      g("type").selectedIndex = 0; lastDraft = "";
      resetPeople();
      if (cfg.met) { ["req-name", "reason", "services"].forEach((id) => (g(id).value = "")); g("victims").replaceChildren(); addVictim(); }
      setNow(); applyDeputy(); growAllTextareas("f-" + cfg.key);
    };
    window["psbPure_" + p] = { build, title, stamp, values };

    g("county").value = "Los Santos"; g("state").value = "San Andreas";
    resetPeople();
    g("add-person").onclick = () => { addPerson(); refresh(); };
    if (cfg.met) { addVictim(); g("add-victim").onclick = () => { addVictim(); refresh(); growAllTextareas("f-" + cfg.key); }; }
    setNow();
    g("now").onclick = () => { setNow(); refresh(); };
    g("draft").onclick = draftOpening;
    ["input", "change", "click"].forEach((ev) => formEl.addEventListener(ev, (e) => {
      if (ev === "input" && e.target.matches("textarea")) growTextarea(e.target);
      refresh();
    }));
    ["deputy-full-name", "deputy-rank", "deputy-badge-number", "deputy-callsign"].forEach((id) =>
      ["input", "change"].forEach((ev) => $(id).addEventListener(ev, applyDeputy)));
    $("f-deputy").addEventListener("click", (e) => { if (e.target.closest("button")) applyDeputy(); });
    applyDeputy();
  }
  setup("cfid"); setup("met");

  window.resetPsb = (p) => window["psbReset_" + p]();

  const baseCopy = window.copy;
  window.copy = async function (k) {
    const p = k === "cfid" ? "cfid" : k === "met-incident" ? "met" : "";
    if (!p) return baseCopy.apply(this, arguments);
    const txt = window["psbBuild_" + p]();
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
    if (k === "cfid" || k === "met-incident") growAllTextareas("f-" + k);
  };
})();
