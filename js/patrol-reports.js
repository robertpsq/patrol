/* ===== Trespass Notice + Impound Report =====
   Both forms share one engine. The report is a plain HTML table that pastes straight into
   the MDC. Everything here is self-contained: districts and streets come from the Arrest
   Report data already in index.html, vehicle names from js/vehicles-data.js. */
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (v) =>
    String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const clean = (v) => String(v || "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
  const badgeNum = (v) => String(v || "").trim().replace(/^#/, "");
  const PLACES = (() => {
    try {
      const d = JSON.parse($("ar-data").textContent);
      return { districts: d.districts || [], streets: d.streets || [] };
    } catch (e) {
      return { districts: [], streets: [] };
    }
  })();
  const VEHICLES = Array.isArray(window.VEHICLE_NAMES) ? window.VEHICLE_NAMES : [];

  /* ---------------- shared report pieces ---------------- */
  const H3 = "font-family:Arial,sans-serif;font-weight:700;font-size:1.125rem;margin-bottom:.5rem";
  const TD = "border:1px solid black;padding:.5rem";
  const lab = (l) => `<strong style="font-family:Arial,sans-serif">${l}</strong>`;
  const cell = (w, l, v, extra) => `<td style="${TD};width:${w}${extra || ""}">${lab(l)} ${v}</td>`;
  const section = (title, rows) =>
    `<tr><td colspan="3" style="border-top:2px solid black;padding:.5rem"><div style="${H3}">${title}</div><table style="width:100%;border-collapse:collapse"><tbody>${rows}</tbody></table></td></tr>`;
  const frame = (subtitle, body) =>
    `<table style="width:100%;font-family:'Times New Roman',serif;border-collapse:collapse;border:4px solid black;background-color:white;color:black;"><tbody><tr><td colspan="3" style="text-align:center;padding:1rem 1rem 2rem"><div style="font-family:Arial,sans-serif;font-size:2rem;font-weight:700;text-transform:uppercase;text-align:center;margin:0">COUNTY OF LOS SANTOS</div><div style="font-family:Arial,sans-serif;font-size:1.5rem;font-weight:600;text-align:center;margin:0">${subtitle}</div></td></tr>${body}</tbody></table>`;
  const generalRows = (m) =>
    section(
      "1. GENERAL INFORMATION",
      `<tr>${cell("33.33%", "A. DATE:", esc(m.date))}${cell("33.33%", "B. TIME (24HR):", esc(m.time))}${cell("33.33%", "C. CALLSIGN:", esc(m.callsign))}</tr>`,
    );
  const officerRows = (m) =>
    section(
      "2. OFFICER INFORMATION",
      m.officers
        .map(
          (o) =>
            `<tr>${cell("41.66%", "A. OFFICER NAME:", esc(o.name))}${cell("33.33%", "B. RANK:", esc(o.rank))}${cell("25%", "C. BADGE:", "#" + esc(o.badge))}</tr>`,
        )
        .join(""),
    );

  /* ---------------- the two report types ---------------- */
  const KINDS = {
    trespass: {
      label: "Trespass Notice",
      fields: ["suspect", "duration", "gender", "race", "age", "property", "manager", "phone"],
      required: [
        ["suspect", "Full name"],
        ["duration", "Duration of trespass"],
        ["property", "Property"],
        ["manager", "Manager / owner name"],
        ["phone", "Manager / owner phone"],
      ],
      recordName: (m) => m.suspect,
      title: (m) => `TRESPASS NOTICE - ${m.property}`,
      build(m) {
        const officersInline = m.officers
          .map((o) => `<strong>${esc([o.rank, o.name].filter(Boolean).join(" "))}</strong>`)
          .join(", ");
        const details =
          section(
            "3. LOCATION DETAILS",
            `<tr>${cell("100%", "A. PROPERTY:", esc(m.property))}</tr>`,
          ) +
          section(
            "4. TRESPASS DETAILS",
            `<tr>${cell("50%", "A. TRESPASSED INDIVIDUAL:", esc(m.suspect))}${cell("50%", "B. DURATION OF TRESPASS:", esc(m.duration))}</tr>` +
              `<tr>${cell("50%", "C. GENDER:", esc(m.gender))}${cell("50%", "D. RACE:", esc(m.race))}</tr>` +
              `<tr><td colspan="2" style="${TD}">${lab("E. AGE:")} ${esc(m.age)}</td></tr>` +
              `<tr>${cell("50%", "F. MANAGER/OWNER ON BEHALF OF:", esc(m.manager))}${cell("50%", "G. MANAGER/OWNER PHONE:", esc(m.phone))}</tr>`,
          );
        const letter = `<tr><td colspan="3" style="border-top:2px solid black;padding:.5rem"><p style="font-family:'Times New Roman',serif;text-align:justify">This letter serves as official notification that you, <strong>${esc(m.suspect)}</strong>, are hereby trespassed from the property located at <strong>${esc(m.property)}</strong>. This notice is effective immediately and will remain in effect for the duration of <strong>${esc(m.duration)}</strong>. Your presence on the aforementioned property from this date forward will be deemed unlawful and may result in your arrest and prosecution under applicable state and local laws. This notice has been issued by me, ${officersInline}, on behalf of the property management represented by <strong>${esc(m.manager)}</strong>.</p></td></tr>`;
        return frame("Trespass Notice", generalRows(m) + officerRows(m) + details + letter);
      },
    },
    impound: {
      label: "Impound Report",
      fields: ["model", "owner", "plate", "district", "street", "duration", "reason"],
      required: [
        ["model", "Make & model"],
        ["duration", "Duration of impound"],
        ["reason", "Impound reason"],
      ],
      recordName: (m) => m.owner,
      title: (m) => `${m.model} - ${m.plate}`,
      build(m) {
        const na = (v) => (v ? esc(v) : "N/A");
        const vehicle = section(
          "3. VEHICLE INFORMATION",
          `<tr>${cell("50%", "A. MAKE &amp; MODEL:", esc(m.model))}${cell("50%", "B. IDENTIFICATION PLATE:", na(m.plate))}</tr>` +
            `<tr>${cell("50%", "C. REGISTERED OWNER:", na(m.owner))}${cell("50%", "D. REGISTRATION:", m.registered ? "Valid" : "Expired/None")}</tr>`,
        );
        const where = section(
          "4. LOCATION OF IMPOUND",
          `<tr>${cell("50%", "A. DISTRICT:", esc(m.district))}${cell("50%", "B. STREET:", esc(m.street))}</tr>`,
        );
        const days = m.duration ? `${esc(m.duration)} Day(s)` : "";
        const details = section(
          "5. IMPOUND DETAILS",
          `<tr><td style="${TD};width:25%">${lab("A. DURATION:")} ${days}</td><td style="${TD};width:75%;white-space:pre-wrap">${lab("B. REASON:")}<br/>${esc(m.reason)}</td></tr>`,
        );
        return frame("Vehicle Impound Report", generalRows(m) + officerRows(m) + vehicle + where + details);
      },
    },
  };

  /* ---------------- form state ---------------- */
  const text = (id) => ($(id) ? $(id).value.trim() : "");
  function officers(kind) {
    return [...document.querySelectorAll(`#${kind}-officers .ar-officer`)].map((r) => ({
      rank: r.querySelector(".pr-o-rank").value.trim(),
      name: clean(r.querySelector(".pr-o-name").value),
      badge: badgeNum(r.querySelector(".pr-o-badge").value),
    }));
  }
  function collect(kind) {
    const k = KINDS[kind],
      raw = $(`${kind}-date`).value,
      m = {
        date: raw && typeof formatPickerDate === "function" ? formatPickerDate(raw, "short") : "",
        time: text(`${kind}-time`),
        callsign: text(`${kind}-callsign`),
        officers: officers(kind),
      };
    k.fields.forEach((f) => (m[f] = f === "reason" ? $(`${kind}-${f}`).value.trim() : clean(text(`${kind}-${f}`))));
    if (kind === "impound") {
      m.registered = $("impound-registered").checked;
      if (!m.registered) m.owner = m.plate = "";
    }
    return m;
  }

  /* ---------------- officers ---------------- */
  function officerHtml(kind, first) {
    const id = (s) => (first ? ` id="${kind}-${s}"` : "");
    return `<div class="item ar-officer">
      <div class="ih"><b>${first ? "Issuing officer" : "Officer"} <small class="ar-onum"></small></b>${first ? "" : `<button class="b" type="button" aria-label="Remove officer" onclick="prRemoveOfficer('${kind}',this)">− Remove</button>`}</div>
      <div class="ar-ogrid">
        <div class="f"><span>Rank</span><input type="text" class="pr-o-rank"${id("rank")} list="pr-ranks" placeholder="Select or type a rank" autocomplete="off" /></div>
        <div class="f"><span>Full name</span><input type="text" class="pr-o-name"${id("name")} placeholder="Forename Surname" autocomplete="off" /></div>
        <div class="f"><span>Badge number</span><input type="text" class="pr-o-badge"${id("badge")} placeholder="e.g. 1234" autocomplete="off" /></div>
      </div>
    </div>`;
  }
  function numberOfficers(kind) {
    const rows = [...document.querySelectorAll(`#${kind}-officers .ar-officer`)];
    rows.forEach((r, i) => (r.querySelector(".ar-onum").textContent = rows.length > 1 ? `#${i + 1}` : ""));
  }
  window.prAddOfficer = function (kind) {
    const box = $(`${kind}-officers`),
      wrap = document.createElement("div");
    wrap.innerHTML = officerHtml(kind, !box.children.length);
    box.appendChild(wrap.firstElementChild);
    numberOfficers(kind);
    render(kind);
  };
  window.prRemoveOfficer = function (kind, btn) {
    btn.closest(".ar-officer").remove();
    numberOfficers(kind);
    render(kind);
  };

  /* ---------------- rendering ---------------- */
  function render(kind) {
    const k = KINDS[kind],
      m = collect(kind);
    $(`${kind}-paper`).innerHTML = k.build(m);
    const rec = clean(k.recordName(m)).replace(/\s+/g, "_"),
      link = $(`${kind}-mdc`);
    link.href = rec ? "https://mdc.gta.world/record/" + encodeURIComponent(rec) : "https://mdc.gta.world/";
    if (kind === "impound") $("impound-reg-fields").hidden = !m.registered;
    renderCheck(kind, m);
  }

  /* ---------------- "Before you copy" checklist ----------------
     Same idea as the Arrest Report: every required item is listed, ticked off as it is
     filled, and clickable to jump to the box that is still empty. */
  const showErrors = {};
  const checkList = (kind) => [["officer", "Officer details"], ...KINDS[kind].required];
  function checkStatus(kind, m) {
    const st = { officer: m.officers.length > 0 && m.officers.every((o) => o.name && o.rank && o.badge) };
    KINDS[kind].required.forEach(([f]) => (st[f] = !!m[f]));
    return st;
  }
  function checkTarget(kind, key) {
    if (key === "officer")
      return [...document.querySelectorAll(`#${kind}-officers .pr-o-rank, #${kind}-officers .pr-o-name, #${kind}-officers .pr-o-badge`)].find((n) => !n.value.trim());
    return $(`${kind}-${key}`);
  }
  function renderCheck(kind, m) {
    const st = checkStatus(kind, m),
      list = checkList(kind),
      ready = list.every(([k]) => st[k]);
    $(`${kind}-check`).innerHTML =
      `<b>Before you copy</b><ul>` +
      list
        .map(
          ([k, label]) =>
            `<li><button type="button" class="ar-ck${st[k] ? " ok" : ""}" data-go="${k}"><i aria-hidden="true">${st[k] ? "✓" : "○"}</i><span>${label}</span><span class="ar-sr">${st[k] ? " — done" : " — missing, press to go there"}</span></button></li>`,
        )
        .join("") +
      `</ul>`;
    const b = $(`${kind}-copy-btn`);
    b.classList.toggle("ar-disabled", !ready);
    b.setAttribute("aria-disabled", ready ? "false" : "true");
    // Empty required boxes are outlined only after a copy attempt, not while the form is still being filled.
    list.forEach(([k]) => {
      if (k === "officer")
        document.querySelectorAll(`#${kind}-officers .pr-o-rank, #${kind}-officers .pr-o-name, #${kind}-officers .pr-o-badge`).forEach((n) => n.classList.toggle("pr-bad", !!showErrors[kind] && !n.value.trim()));
      else $(`${kind}-${k}`).classList.toggle("pr-bad", !!showErrors[kind] && !st[k]);
    });
    return { st, ready, list };
  }
  window.prRender = () => Object.keys(KINDS).forEach(render);

  /* ---------------- copy / title / reset ---------------- */
  async function writeText(t) {
    try {
      await navigator.clipboard.writeText(t);
      return true;
    } catch (e) {
      const a = document.createElement("textarea");
      a.value = t;
      a.style.cssText = "position:fixed;left:-10000px;top:0";
      document.body.appendChild(a);
      a.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {
        ok = false;
      }
      a.remove();
      return ok;
    }
  }
  function jumpTo(kind, key) {
    const t = checkTarget(kind, key);
    if (!t) return;
    t.scrollIntoView({ behavior: "smooth", block: "center" });
    t.focus({ preventScroll: true });
  }
  const copiedTimers = {};
  window.prCopy = async function (kind) {
    const c = renderCheck(kind, collect(kind));
    if (!c.ready) {
      showErrors[kind] = true;
      renderCheck(kind, collect(kind));
      const gaps = c.list.filter(([k]) => !c.st[k]);
      toast("Still needed: " + gaps.map((g) => g[1]).join(", "));
      jumpTo(kind, gaps[0][0]);
      return;
    }
    render(kind);
    const ok = await writeText($(`${kind}-paper`).innerHTML);
    toast(ok ? "Copied!" : "Copy failed");
    if (!ok) return;
    if (kind === "trespass") rememberProperty();
    const b = $(`${kind}-copy-btn`);
    b.textContent = "Copied ✓";
    b.classList.add("done");
    clearTimeout(copiedTimers[kind]);
    copiedTimers[kind] = setTimeout(() => {
      b.textContent = "Copy report";
      b.classList.remove("done");
    }, 2200);
  };
  window.prCopyTitle = async function (kind) {
    const m = collect(kind);
    if (kind === "trespass" ? !m.property : !m.model) {
      toast(kind === "trespass" ? "Enter the property first" : "Enter the make & model first");
      return;
    }
    const t = KINDS[kind].title(m).replace(/ - $/, "");
    toast((await writeText(t)) ? "Title copied!" : "Copy failed");
  };
  window.prReset = function (kind) {
    const k = KINDS[kind];
    showErrors[kind] = false;
    k.fields.forEach((f) => {
      const el = $(`${kind}-${f}`);
      if (el) el.value = "";
    });
    $(`${kind}-callsign`).value = "";
    $(`${kind}-date`).value = taskListTodayDate();
    updateTaskListDateLabel(`${kind}-date`);
    $(`${kind}-time`).value = ukTimeNow("HH:MM");
    if (kind === "impound") {
      $("impound-registered").checked = true;
      $("impound-pp").value = "";
      $("impound-pp-wrap").hidden = true;
      $("impound-reason").dataset.ppLine = "";
      document.querySelector("[data-pp]").setAttribute("aria-expanded", "false");
    }
    $(`${kind}-officers`).replaceChildren();
    prAddOfficer(kind);
    applyDeputyDetails();
    refreshSources(kind);
    render(kind);
  };

  /* ---------------- suggestion lists (free text is still allowed) ---------------- */
  function wireSuggest(input, getValues, label, onPick) {
    const list = input.nextElementSibling;
    list.id = input.id + "-lb";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", label);
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", list.id);
    let active = -1;
    const opts = () => [...list.querySelectorAll(".ar-opt")];
    const setOpen = (open) => {
      list.hidden = !open;
      input.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) input.removeAttribute("aria-activedescendant");
    };
    const fill = () => {
      const t = input.value.trim().toLowerCase(),
        hits = getValues().filter((v) => !t || v.toLowerCase().includes(t)).slice(0, 80);
      list.innerHTML = hits.length
        ? hits.map((v, i) => `<button type="button" role="option" aria-selected="false" id="${list.id}-o${i}" class="ar-opt" data-v="${esc(v)}"><span class="ar-opt-name">${esc(v)}</span></button>`).join("")
        : `<div class="ar-opt-none" role="option" aria-disabled="true">No match. What you type will be used.</div>`;
      active = -1;
    };
    const pick = (v) => {
      input.value = v;
      setOpen(false);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      if (onPick) onPick(v);
    };
    input.addEventListener("focus", () => (fill(), setOpen(true)));
    input.addEventListener("input", () => (fill(), setOpen(true)));
    input.addEventListener("blur", () => setOpen(false));
    input.addEventListener("keydown", (e) => {
      const o = opts();
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (list.hidden) (fill(), setOpen(true));
        const n = opts();
        if (!n.length) return;
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + n.length) % n.length;
        n.forEach((x, i) => {
          x.classList.toggle("active", i === active);
          x.setAttribute("aria-selected", i === active ? "true" : "false");
        });
        input.setAttribute("aria-activedescendant", n[active].id);
        n[active].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && !list.hidden && o[active]) {
        e.preventDefault();
        pick(o[active].dataset.v);
      } else if (e.key === "Escape") setOpen(false);
    });
    list.addEventListener("mousedown", (e) => {
      const b = e.target.closest(".ar-opt");
      if (!b) return;
      e.preventDefault();
      pick(b.dataset.v);
    });
  }

  /* ---------------- remembered properties (Trespass Notice) ----------------
     Every copied notice stores the property with its manager and phone, so picking the
     same property again fills those two fields in. Kept only in this browser. */
  const PROP_KEY = "lssd-trespass-properties";
  function savedProperties() {
    try {
      const v = JSON.parse(localStorage.getItem(PROP_KEY) || "[]");
      return Array.isArray(v) ? v.filter((p) => p && typeof p.property === "string") : [];
    } catch (e) {
      return [];
    }
  }
  function rememberProperty() {
    const m = collect("trespass");
    if (!m.property) return;
    const rest = savedProperties().filter((p) => p.property.toLowerCase() !== m.property.toLowerCase());
    try {
      localStorage.setItem(PROP_KEY, JSON.stringify([{ property: m.property, manager: m.manager, phone: m.phone }, ...rest].slice(0, 30)));
    } catch (e) {
      /* storage unavailable: the notice is still copied */
    }
  }
  // Fill only boxes that are empty or still hold the last automatic fill, so typing is never overwritten.
  function autofill(id, value) {
    const f = $(id);
    if (!f || !value) return;
    if (!f.value.trim() || f.value === f.dataset.prAuto) {
      f.value = value;
      f.dataset.prAuto = value;
    }
  }
  function applyProperty() {
    const name = text("trespass-property").toLowerCase(),
      hit = savedProperties().find((p) => p.property.toLowerCase() === name);
    if (!hit) return;
    autofill("trespass-manager", hit.manager);
    autofill("trespass-phone", hit.phone);
  }

  /* ---------------- quick fill from other forms ---------------- */
  const WORD = (s) => String(s).toLowerCase();
  // Finds the longest district / street name mentioned in a free-text location.
  function parseLocation(t) {
    const low = WORD(t),
      best = (arr) => arr.filter((v) => low.includes(WORD(v))).sort((a, b) => b.length - a.length)[0] || "";
    return { district: best(PLACES.districts), street: best(PLACES.streets) };
  }
  const setVal = (id, v) => {
    const f = $(id);
    if (f && v != null && v !== "") f.value = v;
  };
  function ageFromDob(dob) {
    const t = Date.parse(dob);
    if (!dob || Number.isNaN(t)) return "";
    const d = new Date(t), now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
    return a >= 0 && a < 120 ? String(a) : "";
  }
  const val = (id) => (document.getElementById(id) ? document.getElementById(id).value.trim() : "");
  const arrestName = () => clean(val("ar-suspect"));
  const citationName = () => clean(val("citation-defendant"));
  const subjectName = () => clean([val("subject-first"), val("subject-last")].filter(Boolean).join(" "));
  const SOURCES = {
    trespass: [
      {
        label: () => "Arrest Report · " + arrestName(),
        ok: () => !!arrestName(),
        run() {
          setVal("trespass-suspect", arrestName());
        },
      },
      {
        label: () => "Citation · " + citationName(),
        ok: () => !!citationName(),
        run() {
          setVal("trespass-suspect", citationName());
        },
      },
      {
        label: () => "Subject Information · " + subjectName(),
        ok: () => !!subjectName(),
        run() {
          setVal("trespass-suspect", subjectName());
          const sex = val("subject-sex").toLowerCase();
          setVal("trespass-gender", /^m/.test(sex) ? "Male" : /^f/.test(sex) ? "Female" : /non|nb|enby/.test(sex) ? "Non-binary" : "");
          setVal("trespass-race", val("subject-race"));
          setVal("trespass-age", ageFromDob(val("subject-dob")));
        },
      },
    ],
    impound: [
      {
        label: () => "Citation · " + [val("citation-model"), val("citation-plate")].filter(Boolean).join(" ") + (citationName() ? " (" + citationName() + ")" : ""),
        ok: () => !!(val("citation-model") || val("citation-plate")),
        run() {
          setVal("impound-model", val("citation-model"));
          setVal("impound-plate", val("citation-plate"));
          setVal("impound-owner", clean(val("citation-owner")));
          if (val("citation-plate") || val("citation-owner")) $("impound-registered").checked = true;
          const loc = parseLocation(val("citation-location"));
          setVal("impound-district", loc.district);
          setVal("impound-street", loc.street);
          setVal("impound-callsign", val("citation-callsign"));
          const t = val("citation-time").slice(0, 5);
          if (/^\d\d:\d\d$/.test(t)) setVal("impound-time", t);
          setVal("impound-date", val("citation-date"));
          if (!$("impound-reason").value.trim()) $("impound-reason").value = "Vehicle impounded following a traffic citation, see citation #.";
        },
      },
      {
        label: () => "Arrest Report · " + arrestName(),
        ok: () => !!arrestName(),
        run() {
          setVal("impound-district", val("ar-district"));
          setVal("impound-street", val("ar-street"));
          setVal("impound-callsign", val("ar-callsign"));
          setVal("impound-date", val("ar-date"));
          setVal("impound-time", val("ar-time"));
          // The arrested person is usually the registered owner; only a suggestion, so only fill an empty box.
          if (!val("impound-owner")) setVal("impound-owner", arrestName());
          if (!$("impound-reason").value.trim()) $("impound-reason").value = "Vehicle was used in the commission of a crime, see arrest report #.";
        },
      },
    ],
  };
  function refreshSources(kind) {
    const live = SOURCES[kind].filter((s) => s.ok()),
      box = $(`${kind}-sources`),
      list = $(`${kind}-sources-list`);
    list.replaceChildren();
    live.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "b";
      b.textContent = s.label();
      b.addEventListener("click", () => {
        s.run();
        updateTaskListDateLabel(`${kind}-date`);
        render(kind);
        toast("Filled in");
      });
      list.appendChild(b);
    });
    box.hidden = !live.length;
  }

  /* ---------------- Prohibited Parking (Impound Report) ----------------
     The chosen section is written into the reason. The line is tracked so choosing a
     different section replaces it instead of adding a second one. */
  function syncProhibitedParking() {
    const ta = $("impound-reason"),
      sel = $("impound-pp").value,
      prev = ta.dataset.ppLine || "",
      next = sel ? `Vehicle was found in violation of 418. Prohibited Parking; section ${sel}.` : "";
    if (prev && ta.value.includes(prev)) ta.value = ta.value.replace(prev, next).replace(/\n{2,}/g, "\n").trim();
    else if (next) ta.value = ta.value.trim() ? ta.value.replace(/\s*$/, "\n") + next : next;
    ta.dataset.ppLine = next;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /* ---------------- filled from the Arrest Report ----------------
     Called by the "Create Impound Report" button on the Arrest Report. It replaces the
     officers and the arrest-related fields, leaves the vehicle fields alone, and opens the form. */
  window.prFillImpound = function (d) {
    setVal("impound-date", d.date);
    updateTaskListDateLabel("impound-date");
    setVal("impound-time", d.time);
    setVal("impound-callsign", d.callsign);
    setVal("impound-district", d.district);
    setVal("impound-street", d.street);
    setVal("impound-owner", d.owner);
    setVal("impound-duration", d.days ? String(d.days) : "");
    $("impound-registered").checked = true;
    $("impound-reason").value = d.reason || "";
    $("impound-reason").dataset.ppLine = "";
    $("impound-pp").value = "";
    $("impound-pp-wrap").hidden = true;
    const box = $("impound-officers");
    box.replaceChildren();
    const list = d.officers && d.officers.length ? d.officers : [{}];
    list.forEach((o) => {
      prAddOfficer("impound");
      const row = box.lastElementChild;
      row.querySelector(".pr-o-rank").value = o.rank || "";
      row.querySelector(".pr-o-name").value = o.name || "";
      row.querySelector(".pr-o-badge").value = o.badge || "";
    });
    if (!d.officers || !d.officers.length) applyDeputyDetails();
    showErrors.impound = false;
    render("impound");
    refreshSources("impound");
    show("impound");
    toast("Impound Report filled in from the Arrest Report");
  };

  /* ---------------- wiring ---------------- */
  function init() {
    if (!$("ar-data") && !PLACES.districts.length) console.warn("Arrest Report data not found; district and street suggestions are empty.");
    const dl = document.createElement("datalist");
    dl.id = "pr-ranks";
    dl.innerHTML = (typeof deputyRanks !== "undefined" ? deputyRanks : []).map((r) => `<option value="${esc(r)}">`).join("");
    document.body.appendChild(dl);

    wireSuggest($("impound-model"), () => VEHICLES, "Vehicles");
    wireSuggest($("impound-district"), () => PLACES.districts, "Districts");
    wireSuggest($("impound-street"), () => PLACES.streets, "Streets");
    $("trespass-property").addEventListener("input", () => (applyProperty(), render("trespass")));

    $("impound-pp").addEventListener("change", syncProhibitedParking);
    document.querySelectorAll(".pr-chips").forEach((box) =>
      box.addEventListener("click", (e) => {
        const pp = e.target.closest("button[data-pp]");
        if (pp) {
          // Prohibited Parking needs a section first, so it opens a dropdown instead of writing text.
          const wrap = $("impound-pp-wrap");
          wrap.hidden = !wrap.hidden;
          pp.setAttribute("aria-expanded", String(!wrap.hidden));
          if (!wrap.hidden) $("impound-pp").focus();
          return;
        }
        const b = e.target.closest("button[data-v]");
        if (!b) return;
        const f = $(box.dataset.target);
        if (box.dataset.append && f.value.trim()) {
          if (!f.value.includes(b.dataset.v)) f.value = f.value.replace(/\s*$/, "\n") + b.dataset.v;
        } else f.value = b.dataset.v;
        f.dispatchEvent(new Event("input", { bubbles: true }));
        f.focus();
      }),
    );

    Object.keys(KINDS).forEach((kind) => {
      const root = $(`f-${kind}`);
      $(`${kind}-check`).addEventListener("click", (e) => {
        const b = e.target.closest("[data-go]");
        if (b) jumpTo(kind, b.dataset.go);
      });
      root.addEventListener("input", () => render(kind));
      root.addEventListener("change", () => render(kind));
      // Sources change while this form is hidden, so look again whenever it is opened.
      new MutationObserver(() => {
        if (!root.hidden) refreshSources(kind);
      }).observe(root, { attributes: true, attributeFilter: ["hidden"] });
      $(`${kind}-date`).value = taskListTodayDate();
      updateTaskListDateLabel(`${kind}-date`);
      $(`${kind}-time`).value = ukTimeNow("HH:MM");
      prAddOfficer(kind);
    });
    applyDeputyDetails();
    prRender();
  }
  init();
})();
