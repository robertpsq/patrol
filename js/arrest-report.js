      /* ===== Arrest Report =====
         Charge / sentencing logic ported from MDC Panel+ (src/lib/arrest-calculator.ts):
         same penal code data, additions, parole-violation handling, sentence/impound/
         suspension caps and bail rules. The report is the same HTML table MDC Panel+
         copies, so it pastes into the MDC exactly the same way. */
      (() => {
        const DATA = JSON.parse($("ar-data").textContent);
        const PENAL = {};
        DATA.penal.forEach((c) => (PENAL[c.id] = c));
        const CFG = {
          maxSentenceDays: 25,
          maxImpoundDays: 35,
          maxSuspensionDays: 35,
          urlStreets:
            "https://forum.gta.world/en/topic/122551-strengthen-traffic-regulations-to-ensure-every-travelers-safety-act-2024-streets-act/",
          urlDepa:
            "https://forum.gta.world/en/topic/30297-drug-enforcement-prevention-act-of-2020-depa/",
        };
        const ADDITIONS = [
          { name: "Offender", s: 1, p: 1 },
          { name: "Attempt", s: 0.5, p: 0.5 },
          { name: "Accomplice", s: 1, p: 1 },
          { name: "Accessory", s: 0.5, p: 0.5 },
          { name: "Conspiracy", s: 0.25, p: 0.25 },
          { name: "Solicitation", s: 0.25, p: 0.25 },
        ];
        const PAROLE = { name: "Parole Violation", s: 1, p: 2 };
        const DEFAULT_DEPT = "Los Santos County Sheriff's Department";
        const MODIFIERS = [
          { name: "callOfService", label: "Call of Service", hint: "Responded to a call", text: "received call of service #" },
          { name: "evaded", label: "Evaded", hint: "Suspect fled in a vehicle", text: "Upon attempting to detain {{suspect}}, they fled in a vehicle leading to a pursuit by the department." },
          { name: "resistedArrest", label: "Resisted Arrest", hint: "Physically resisted detainment", text: "When attempting to apprehend {{suspect}}, the suspect physically resisted detainment and attempted to flee from the peace officers involved in this arrest." },
          { name: "searched", label: "Searched", hint: "Searched before booking", text: "{{suspect}} was positioned in front of a department vehicle's dashcam and searched in accordance to the legal requirement as well as department's policy as well as the training I've undergone. No contraband or relevant to the investigation items have been found in his possession." },
          { name: "contraband", label: "Contraband found?", hint: "Items found on the suspect", sub: true, text: "{{suspect}} was positioned in front of a department vehicle's dashcam and searched in accordance to the legal requirement as well as department's policy as well as the training I've undergone. The following items have been found in the possession of the suspect:" },
          { name: "booking", label: "Booking", hint: "Transported and booked", text: "I transported {{suspect}} to the nearest department's station, where I booked them for the charges mentioned within this report according to all outlined departmental guidelines, state requirements and training." },
        ];

        let charges = [];
        let chargeUid = 0;
        let narrativeUserModified = false;
        let lastCalc = null;
        let showErrors = false;
        let calculated = false;

        const esc = (v) =>
          String(v == null ? "" : v).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
        const money = (n) => "$" + Number(n).toLocaleString("en-US");
        const cleanName = (v) => String(v || "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
        const badgeNum = (v) => String(v || "").trim().replace(/^#/, "");

        /* ---------------- calculator (port of calculateArrest) ---------------- */
        const mins = (t) => (t ? (t.days || 0) * 1440 + (t.hours || 0) * 60 + (t.min || 0) : 0);
        const isComplete = (row) => {
          const c = PENAL[row.chargeId];
          return !!(c && row.cls && row.offense && row.addition && (!c.drugs || row.category));
        };
        function chargeTitleSuffix(row, c) {
          let s = "";
          if (row.offense !== "1") s += ` (Offence #${row.offense})`;
          if (c.drugs && row.category) s += ` (Category ${row.category})`;
          return s;
        }
        function calculate(rows, isParole) {
          const extras = [];
          const results = [];
          rows.forEach((row) => {
            const c = PENAL[row.chargeId];
            if (!c) return;
            if (c.extra && c.extra !== "N/A")
              extras.push({ title: `${c.type}${row.cls} ${c.id}. ${c.charge}${chargeTitleSuffix(row, c)}`, extra: c.extra });
            const addition = ADDITIONS.find((a) => a.name === row.addition);
            const applied = [];
            if (addition) applied.push(addition);
            if (isParole) applied.push(PAROLE);
            const sentenceMultiplier = applied.reduce((acc, a) => acc * a.s, 1);
            const pointsMultiplier = applied.reduce((acc, a) => acc * a.p, 1);
            const isDrug = !!c.drugs;
            const zero = { days: 0, hours: 0, min: 0 };
            const getTime = (obj) => {
              if (!obj) return zero;
              if (isDrug && row.category) return obj[row.category] || zero;
              return obj;
            };
            const getFine = (obj) => {
              if (!obj) return 0;
              if (isDrug && row.category) return obj[row.category] || 0;
              return obj[row.offense] || 0;
            };
            const origMin = mins(getTime(c.time));
            let origMax = mins(getTime(c.maxtime));
            if (origMax < origMin) origMax = origMin;
            const origPoints = (c.points && c.points[row.cls]) || 0;
            const bailAuto = c.bail
              ? typeof c.bail.auto === "object" && row.category
                ? c.bail.auto[row.category]
                : c.bail.auto
              : null;
            const bailCost =
              c.bail && bailAuto !== false
                ? typeof c.bail.cost === "object" && row.category
                  ? c.bail.cost[row.category]
                  : c.bail.cost
                : 0;
            results.push({
              row,
              c,
              applied,
              sentenceMultiplier,
              isModified: sentenceMultiplier !== 1 || pointsMultiplier !== 1,
              original: { minTime: origMin, maxTime: origMax, points: origPoints },
              modified: { minTime: origMin * sentenceMultiplier, maxTime: origMax * sentenceMultiplier, points: origPoints * pointsMultiplier },
              fine: getFine(c.fine),
              impound: (c.impound && c.impound[row.offense]) || 0,
              suspension: (c.suspension && c.suspension[row.offense]) || 0,
              bailAuto,
              bailCost,
            });
          });
          const totals = results.reduce(
            (acc, r) => {
              acc.original.minTime += r.original.minTime;
              acc.original.maxTime += r.original.maxTime;
              acc.original.points += r.original.points;
              acc.modified.minTime += r.modified.minTime;
              acc.modified.maxTime += r.modified.maxTime;
              acc.modified.points += r.modified.points;
              acc.fine += r.fine;
              acc.original.impound += r.impound;
              acc.original.suspension += r.suspension;
              acc.modified.impound += r.impound * r.sentenceMultiplier;
              acc.modified.suspension += r.suspension * r.sentenceMultiplier;
              if (r.bailAuto !== null) {
                acc.bail.has = true;
                if (r.bailAuto === false) acc.bail.noBail = true;
                if (r.bailAuto === 2) acc.bail.discretionary = true;
                if (r.bailAuto === true) acc.bail.eligible = true;
              }
              if (r.bailAuto !== false && r.bailCost > acc.highestBail) acc.highestBail = r.bailCost;
              return acc;
            },
            {
              original: { minTime: 0, maxTime: 0, points: 0, impound: 0, suspension: 0 },
              modified: { minTime: 0, maxTime: 0, points: 0, impound: 0, suspension: 0 },
              fine: 0,
              bail: { has: false, noBail: false, discretionary: false, eligible: false },
              highestBail: 0,
            },
          );
          const bailStatus = !totals.bail.has
            ? "N/A"
            : totals.bail.noBail
              ? "NOT ELIGIBLE"
              : totals.bail.discretionary
                ? "DISCRETIONARY"
                : totals.bail.eligible
                  ? "ELIGIBLE"
                  : "N/A";
          const maxMin = CFG.maxSentenceDays * 1440;
          const streets = results.some(
            (r) => r.c.code_enhancement === "STREETS" && (!r.c.code_enhancement_count || (r.row.offense && Number(r.row.offense) >= r.c.code_enhancement_count)),
          );
          return {
            results,
            extras,
            totals,
            bailStatus,
            minTimeCapped: Math.min(totals.modified.minTime, maxMin),
            maxTimeCapped: Math.min(totals.modified.maxTime, maxMin),
            isCapped: totals.modified.minTime > maxMin || totals.modified.maxTime > maxMin,
            impoundCapped: Math.min(totals.modified.impound, CFG.maxImpoundDays),
            isImpoundCapped: totals.modified.impound > CFG.maxImpoundDays,
            suspensionCapped: Math.min(totals.modified.suspension, CFG.maxSuspensionDays),
            isSuspensionCapped: totals.modified.suspension > CFG.maxSuspensionDays,
            isStreetsEligible: streets,
          };
        }
        function formatTotalTime(total) {
          if (!total) return "0 minutes";
          total = Math.round(total);
          if (total >= 1000 * 1440) return "Life / court case";
          const d = Math.floor(total / 1440),
            h = Math.floor((total % 1440) / 60),
            m = total % 60,
            parts = [];
          if (d > 0) parts.push(`${d} ${d === 1 ? "Day" : "Days"}`);
          if (h > 0) parts.push(`${h} ${h === 1 ? "Hour" : "Hours"}`);
          if (m > 0) parts.push(`${m} ${m === 1 ? "Minute" : "Minutes"}`);
          return `${parts.join(" ")} (${total} mins total)`;
        }
        // Short form used in tables and chips: "6h", "1d 15h", and "Life" for the 9999-day placeholders.
        function compactTime(m) {
          m = Math.round(m);
          if (!m) return "0m";
          if (m >= 1000 * 1440) return "Life";
          const d = Math.floor(m / 1440),
            h = Math.floor((m % 1440) / 60),
            mi = m % 60;
          return [d && d + "d", h && h + "h", mi && mi + "m"].filter(Boolean).join(" ");
        }
        const formatDays = (v) => {
          const r = Math.round(v);
          return r > 0 ? `${r} ${r === 1 ? "Day" : "Days"}` : "None";
        };
        const typeLabel = (t) => ({ F: "Felony", M: "Misdemeanor", I: "Infraction" })[t] || "Unknown";

        /* ---------------- officers ---------------- */
        function officerHtml(first) {
          const ranks = typeof deputyRanks !== "undefined" ? deputyRanks : [];
          return `<div class="item ar-officer">
            <div class="ih"><b>${first ? "Arresting officer" : "Officer"} <small class="ar-onum"></small></b>${first ? "" : `<button class="b" type="button" aria-label="Remove officer" onclick="this.closest('.ar-officer').remove();arNumberOfficers();arUpdate()">− Remove</button>`}</div>
            <div class="ar-ogrid">
              <div class="f"><span>Rank</span><select class="ar-o-rank"${first ? ' id="ar-rank"' : ""}><option value="">Select rank</option>${ranks.map((r) => `<option>${esc(r)}</option>`).join("")}</select></div>
              <div class="f"><span>Full name</span><input type="text" class="ar-o-name"${first ? ' id="ar-name"' : ""} placeholder="Forename Surname" autocomplete="off" /></div>
              <div class="f"><span>Badge number</span><input type="text" class="ar-o-badge"${first ? ' id="ar-badge"' : ""} placeholder="e.g. 1234" autocomplete="off" /></div>
            </div>
          </div>`;
        }
        window.arAddOfficer = function () {
          const wrap = document.createElement("div");
          wrap.innerHTML = officerHtml(!$("ar-officers").children.length);
          $("ar-officers").appendChild(wrap.firstElementChild);
          arNumberOfficers();
          arUpdate();
        };
        window.arNumberOfficers = function () {
          const rows = [...document.querySelectorAll("#ar-officers .ar-officer")];
          rows.forEach((r, i) => (r.querySelector(".ar-onum").textContent = rows.length > 1 ? `#${i + 1}` : ""));
        };
        const officers = () =>
          [...document.querySelectorAll("#ar-officers .ar-officer")].map((r) => ({
            rank: r.querySelector(".ar-o-rank").value.trim(),
            name: cleanName(r.querySelector(".ar-o-name").value),
            badge: badgeNum(r.querySelector(".ar-o-badge").value),
          }));

        /* ---------------- charges UI ---------------- */
        const chargeBadge = (c) => `<span class="ar-badge ${c.type === "F" || c.type === "M" || c.type === "I" ? c.type : "x"}">${esc(c.id)}</span>`;
        const shortMoney = (n) => (n >= 1000 ? "$" + Math.round(n / 100) / 10 + "k" : "$" + n).replace(".0k", "k");
        // One-line penalty preview shown in the charge picker, e.g. "M · 6h–1d · bail $200k".
        function briefCharge(c) {
          const out = [c.type];
          if (c.drugs) out.push("varies by category");
          else {
            const mn = mins(c.time);
            let mx = mins(c.maxtime);
            if (mx < mn) mx = mn;
            out.push(mn === mx ? compactTime(mn) : compactTime(mn) + "–" + compactTime(mx));
          }
          const b = c.bail;
          if (b) {
            if (typeof b.auto === "object" || typeof b.cost === "object") out.push("bail varies");
            else if (b.auto === false) out.push("no bail");
            else if (b.auto === 2) out.push("bail discr.");
            else if (b.auto === true) out.push("bail " + shortMoney(b.cost));
          }
          return out.join(" · ");
        }
        function chargeRowHtml(row) {
          const c = PENAL[row.chargeId];
          const drug = !!(c && c.drugs);
          const lid = `ar-lb-${row.uid}`;
          const opt = (v, label, selected, disabled) =>
            `<option value="${esc(v)}"${selected ? " selected" : ""}${disabled ? " disabled" : ""}>${esc(label)}</option>`;
          const offs = ["1", "2", "3"].concat(c && (c.offence["4"] || c.offence["5"]) ? ["4", "5"] : []);
          return `<div class="item ar-charge" data-uid="${row.uid}">
            <div class="ih"><b>Charge #<span class="ar-cn"></span></b><span class="ar-rowbtns"><button class="b" type="button" aria-label="Duplicate charge" onclick="arDuplicateCharge(${row.uid})"${c ? "" : " disabled"}>Duplicate</button><button class="b" type="button" aria-label="Remove charge" onclick="arRemoveCharge(${row.uid})">− Remove</button></span></div>
            <div class="ar-cgrid${drug ? " drug" : ""}">
              <div class="f"><span>Charge</span>
                <div class="ar-combo">
                  <input type="text" class="ar-cin" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${lid}" aria-label="Charge (search by name or number)" placeholder="Search by name or number" autocomplete="off" value="${c ? esc(c.id + ". " + c.charge) : ""}" />
                  <div class="ar-combo-list" id="${lid}" role="listbox" aria-label="Charges" hidden></div>
                </div>
                ${c && c.definition ? `<details class="ar-def"><summary>Definition</summary><p>${esc(c.definition)}</p></details>` : ""}
              </div>
              <div class="f"><span>Class</span><select class="ar-cls" aria-label="Class"${c ? "" : " disabled"}>${["A", "B", "C"].map((k) => opt(k, "Class " + k, row.cls === k, !c || !c.class[k])).join("")}</select></div>
              <div class="f"><span>Offence</span><select class="ar-off" aria-label="Offence"${c ? "" : " disabled"}>${offs.map((k) => opt(k, "Offence #" + k, row.offense === k, !c || !c.offence[k])).join("")}</select></div>
              <div class="f"><span>Addition</span><select class="ar-add" aria-label="Addition"${c ? "" : " disabled"}>${ADDITIONS.map((a) => opt(a.name, a.name, row.addition === a.name, false)).join("")}</select></div>
              ${drug ? `<div class="f"><span>Category</span><select class="ar-cat" aria-label="Drug category"><option value="">Select category</option>${Object.values(c.drugs).map((v) => opt(v, v.length === 1 ? "Category " + v : v, row.category === v, false)).join("")}</select></div>` : ""}
            </div>
          </div>`;
        }
        function renderCharges() {
          const host = $("ar-charges");
          host.innerHTML = charges.map(chargeRowHtml).join("");
          host.querySelectorAll(".ar-charge").forEach((node, i) => {
            node.querySelector(".ar-cn").textContent = i + 1;
            wireCharge(node, charges.find((r) => String(r.uid) === node.dataset.uid));
          });
          renderQuick();
          arUpdate();
        }
        const QK = "lssd-arrest-charges";
        const recentCharges = () => {
          try {
            return JSON.parse(localStorage.getItem(QK)) || [];
          } catch (e) {
            return [];
          }
        };
        function noteCharge(id) {
          try {
            localStorage.setItem(QK, JSON.stringify([id, ...recentCharges().filter((x) => x !== id)].slice(0, 8)));
          } catch (e) {
            /* storage unavailable: chips just won't persist */
          }
        }
        function renderQuick() {
          const ids = recentCharges().filter((id) => PENAL[id]);
          $("ar-quick").hidden = !ids.length;
          $("ar-quick-list").innerHTML = ids
            .map((id) => `<button type="button" class="ar-chip" data-id="${esc(id)}" title="Add ${esc(PENAL[id].charge)}">${chargeBadge(PENAL[id])}<span>${esc(PENAL[id].charge)}</span></button>`)
            .join("");
        }
        function fillCharge(row, id) {
          const c = PENAL[id];
          row.chargeId = id;
          row.cls = ["A", "B", "C"].find((k) => c.class[k]) || null;
          row.offense = "1";
          row.addition = "Offender";
          row.category = null;
        }
        function wireCharge(node, row) {
          const input = node.querySelector(".ar-cin"),
            list = node.querySelector(".ar-combo-list");
          let active = -1;
          const current = () => (PENAL[row.chargeId] ? PENAL[row.chargeId].id + ". " + PENAL[row.chargeId].charge : "");
          const items = () => [...list.querySelectorAll(".ar-opt")];
          const setOpen = (open) => {
            list.hidden = !open;
            input.setAttribute("aria-expanded", open ? "true" : "false");
            if (!open) input.removeAttribute("aria-activedescendant");
          };
          const fill = (term) => {
            const t = term.trim().toLowerCase();
            const hits = DATA.penal.filter((c) => !t || c.charge.toLowerCase().includes(t) || c.id.toLowerCase().includes(t));
            list.innerHTML = hits.length
              ? hits
                  .map(
                    (c, i) =>
                      `<button type="button" role="option" aria-selected="false" id="${list.id}-o${i}" class="ar-opt" data-id="${esc(c.id)}"${c.definition ? ` title="${esc(c.definition.length > 320 ? c.definition.slice(0, 320) + "…" : c.definition)}"` : ""}>${chargeBadge(c)}<span class="ar-opt-name">${esc(c.charge)}</span><span class="ar-opt-meta">${esc(briefCharge(c))}</span></button>`,
                  )
                  .join("")
              : `<div class="ar-opt-none" role="option" aria-disabled="true">No charge found.</div>`;
            active = -1;
          };
          const close = () => {
            setOpen(false);
            input.value = current();
          };
          const choose = (id) => {
            if (!PENAL[id]) return;
            if (row.chargeId !== id) fillCharge(row, id);
            noteCharge(id);
            renderCharges();
          };
          input.addEventListener("focus", () => {
            input.select();
            fill("");
            setOpen(true);
          });
          input.addEventListener("input", () => {
            fill(input.value);
            setOpen(true);
          });
          input.addEventListener("blur", close);
          input.addEventListener("keydown", (e) => {
            const opts = items();
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              if (list.hidden) {
                fill(input.value);
                setOpen(true);
              }
              const o = items();
              if (!o.length) return;
              active = (active + (e.key === "ArrowDown" ? 1 : -1) + o.length) % o.length;
              o.forEach((n, i) => {
                n.classList.toggle("active", i === active);
                n.setAttribute("aria-selected", i === active ? "true" : "false");
              });
              input.setAttribute("aria-activedescendant", o[active].id);
              o[active].scrollIntoView({ block: "nearest" });
            } else if (e.key === "Enter") {
              e.preventDefault();
              const typed = input.value.trim().toLowerCase(),
                pick = opts[active] || opts.find((o) => o.dataset.id.toLowerCase() === typed) || (opts.length === 1 ? opts[0] : null);
              if (pick) choose(pick.dataset.id);
            } else if (e.key === "Escape") {
              close();
              input.blur();
            }
          });
          list.addEventListener("mousedown", (e) => {
            const btn = e.target.closest(".ar-opt");
            if (!btn) return;
            e.preventDefault();
            choose(btn.dataset.id);
          });
          const bind = (sel, key) => {
            const n = node.querySelector(sel);
            if (n) n.addEventListener("change", () => ((row[key] = n.value || null), arUpdate()));
          };
          bind(".ar-cls", "cls");
          bind(".ar-off", "offense");
          bind(".ar-add", "addition");
          bind(".ar-cat", "category");
        }
        const newCharge = () =>
          charges.push({ uid: ++chargeUid, chargeId: null, cls: null, offense: null, addition: null, category: null });
        window.arAddCharge = function () {
          newCharge();
          renderCharges();
          const last = document.querySelector("#ar-charges .ar-charge:last-child .ar-cin");
          if (last) last.focus();
        };
        window.arRemoveCharge = function (uid) {
          charges = charges.filter((r) => r.uid !== uid);
          if (!charges.length) newCharge();
          renderCharges();
        };
        window.arDuplicateCharge = function (uid) {
          const i = charges.findIndex((r) => r.uid === uid);
          if (i < 0) return;
          const { chargeId, cls, offense, addition, category } = charges[i];
          charges.splice(i + 1, 0, { uid: ++chargeUid, chargeId, cls, offense, addition, category });
          renderCharges();
        };

        /* ---------------- narrative ---------------- */
        function ordinalDate(value) {
          if (!value) return "";
          const d = taskListDateFromValue(value);
          if (Number.isNaN(d.getTime())) return "";
          const n = d.getDate(),
            suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" })[n % 10] || "th";
          return `${n}${suffix} of ${d.toLocaleString("en-US", { month: "long" })}, ${d.getFullYear()}`;
        }
        const NL = "\n\n";
        const PARTS = ["open", "evaded", "resistedArrest", "searched", "booking"];
        let fillTail = ",";
        let applied = {}; // part -> the exact text last written into the narrative for it
        const modOn = (n) => {
          const box = document.querySelector(`#ar-mods input[data-mod="${n}"]`);
          return !!(box && box.checked);
        };
        const itemList = () =>
          [...document.querySelectorAll("#ar-items .ar-item")].map((i) => i.value.trim()).filter(Boolean);
        function narrativeParts() {
          const o = officers()[0] || {},
            val = (id) => $(id).value.trim(),
            data = {
              date: ordinalDate($("ar-date").value),
              time: val("ar-time").replace(":", ""),
              callsign: val("ar-callsign"),
              suspect: cleanName($("ar-suspect").value),
              rank: o.rank || "",
              name: o.name || "",
              badge: val("ar-badge"),
              department: val("ar-department") || DEFAULT_DEPT,
            };
          const sub = (t) => t.replace(/\{\{(\w+)\}\}|\{(\w+)\}/g, (m, a, b) => (data[a || b] != null ? data[a || b] : m));
          const mod = (n) => sub(MODIFIERS.find((m) => m.name === n).text);
          const parts = {};
          parts.open =
            sub("On the {date}, I, {rank} {name} ({badge}) of the {department} while under the callsign {callsign}, conducted an arrest on {suspect}. At approximately {time} hours I") +
            (modOn("callOfService") ? " " + mod("callOfService") + val("ar-callnum") + "," : "") +
            " ";
          if (modOn("evaded")) parts.evaded = mod("evaded");
          if (modOn("resistedArrest")) parts.resistedArrest = mod("resistedArrest");
          if (modOn("searched")) {
            if (modOn("contraband")) {
              const items = itemList();
              parts.searched = mod("contraband") + (items.length ? "\n" + items.map((i) => "• " + i).join("\n") : "");
            } else parts.searched = mod("searched");
          }
          if (modOn("booking")) parts.booking = mod("booking");
          fillTail = " ";
          return parts;
        }
        let syncNarrative = function () {
          const preset = $("ar-preset").checked,
            ta = $("ar-narrative");
          $("ar-mods").dataset.off = preset ? "" : "1";
          const searched = document.querySelector('#ar-mods input[data-mod="searched"]'),
            contra = document.querySelector('#ar-mods input[data-mod="contraband"]');
          if (searched && contra) {
            if (!searched.checked) contra.checked = false;
            contra.closest(".resp-tile").hidden = !searched.checked;
          }
          $("ar-callnum-wrap").hidden = !modOn("callOfService");
          $("ar-items-wrap").hidden = !modOn("contraband");
          $("ar-regen").hidden = !(preset && narrativeUserModified);
          if (!preset) return;
          const parts = narrativeParts();
          if (!narrativeUserModified) {
            ta.value = PARTS.filter((k) => parts[k]).map((k) => parts[k]).join(NL);
            applied = { ...parts };
            return;
          }
          // The text has been edited by hand: update only the generated sentences,
          // in place, and leave everything the deputy wrote alone.
          let v = ta.value;
          PARTS.forEach((k, idx) => {
            const old = applied[k],
              nw = parts[k];
            if (old === nw) return;
            if (old && nw) {
              if (v.includes(old)) {
                v = v.replace(old, () => nw);
                applied[k] = nw;
              }
            } else if (old && !nw) {
              if (v.includes(NL + old)) v = v.replace(NL + old, "");
              else if (v.includes(old)) v = v.replace(old, "");
              applied[k] = undefined;
            } else if (!old && nw) {
              // after whatever the deputy has written, but ahead of any later generated sentence
              let at = -1;
              for (let j = idx + 1; j < PARTS.length; j++) {
                const later = applied[PARTS[j]];
                if (later && v.includes(later)) {
                  at = v.indexOf(later);
                  break;
                }
              }
              v =
                at >= 0
                  ? v.slice(0, at).replace(/\s+$/, "") + NL + nw + NL + v.slice(at)
                  : v.replace(/\s+$/, "") + (v.trim() ? NL : "") + nw;
              applied[k] = nw;
            }
          });
          if (v !== ta.value) ta.value = v;
        };
        // Screen-only marker (never part of the report text): highlights the end of the
        // generated opening so the deputy sees where to continue writing by hand.
        function updateFillHighlight() {
          const ta = $("ar-narrative"),
            box = $("ar-hl-text"),
            back = $("ar-hl-back"),
            v = ta.value,
            open = applied.open;
          let html = null;
          if ($("ar-preset").checked && open && fillTail) {
            const at = v.indexOf(open);
            if (at >= 0) {
              const end = at + open.length,
                start = end - fillTail.length,
                eol = v.indexOf("\n", end),
                rest = v.slice(end, eol < 0 ? v.length : eol);
              if (start >= at && !rest.trim()) html = esc(v.slice(0, start)) + "<mark>" + esc(v.slice(start, end)) + "</mark>" + esc(v.slice(end));
            }
          }
          box.innerHTML = html == null ? "" : html + "\n";
          back.style.height = ta.offsetHeight + "px";
          box.style.transform = `translateY(${-ta.scrollTop}px)`;
        }
        const syncNarrativeCore = syncNarrative;
        syncNarrative = function () {
          syncNarrativeCore();
          updateFillHighlight();
        };
        window.arRegenNarrative = function () {
          narrativeUserModified = false;
          syncNarrative();
          arUpdate();
        };
        window.arAddItem = function (value, focus) {
          const row = document.createElement("div");
          row.className = "eg";
          row.innerHTML = `<input type="text" class="ar-item" aria-label="Item found" placeholder="e.g. 2x bags of cocaine" autocomplete="off" /><button class="b" type="button" aria-label="Remove item" onclick="this.closest('.eg').remove();arUpdate()">−</button>`;
          row.querySelector("input").value = value || "";
          $("ar-items").appendChild(row);
          if (focus !== false) row.querySelector("input").focus();
        };

        /* ---------------- report HTML (same structure as MDC Panel+) ---------------- */
        const S = {
          secRow: "border-top:2px solid black;padding:0.75rem 1rem 0.25rem",
          secTitle: "font-size:1.125rem;font-weight:bold;margin:0;letter-spacing:0.05em;text-transform:uppercase",
          label: "border:1px solid black;padding:0.5rem;background-color:#f4f4f5",
          cell: "border:1px solid black;padding:0.5rem",
          num: "border:1px solid black;padding:0.5rem;text-align:center;font-weight:normal;width:6%;background-color:#f4f4f5",
          gap: "height:0.75rem;padding:0;border:none",
        };
        const section = (title) => `<tr><td colspan="5" style="${S.secRow}"><p style="${S.secTitle}">${esc(title)}</p></td></tr>`;
        const spacer = `<tr><td colspan="5" style="${S.gap}"></td></tr>`;
        function pill(type) {
          const base = "display:inline-block;padding:0.125rem 0.5rem;border-radius:9999px;font-weight:bold;font-size:0.75rem;letter-spacing:0.05em;text-transform:uppercase;border:1px solid transparent;";
          const map = {
            F: "background-color:#b91c1c;color:#ffffff;border-color:#7f1d1d;",
            M: "background-color:#f59e0b;color:#1f2937;border-color:#b45309;",
            I: "background-color:#0ea5e9;color:#0f172a;border-color:#0369a1;",
          };
          return base + (map[type] || "background-color:#e5e7eb;color:#111827;border-color:#9ca3af;");
        }
        function buildReport(calc, meta) {
          const rows = calc.results;
          const paroleOn = $("ar-parole").checked;
          const header = (meta.department || "County of Los Santos").toUpperCase();
          const add = (name) => (name || "Offender");
          let h = `<table style="width:100%;font-family:'Times New Roman',serif;border-collapse:collapse;border:6px double black;background-color:white;color:black"><tbody>`;
          h += `<tr><td colspan="5" style="padding:1.5rem 1rem 1rem;text-align:center"><p style="font-size:0.95rem;margin:0;letter-spacing:0.1em">${esc(header)}</p><p style="font-size:1.75rem;font-weight:bold;margin:0;text-transform:uppercase;letter-spacing:0.05em">Arrest Report</p></td></tr>`;
          h += section("1. GENERAL INFORMATION");
          h += `<tr style="background-color:#f4f4f5"><td colspan="2" style="${S.label}"><strong>A. DATE</strong></td><td style="${S.cell}">${esc(meta.date)}</td><td style="${S.label}"><strong>B. TIME (24HR)</strong></td><td style="${S.cell}">${esc(meta.time)}</td></tr>`;
          h += `<tr><td colspan="2" style="${S.label}"><strong>C. CALLSIGN</strong></td><td style="${S.cell}">${esc(meta.callsign)}</td><td style="${S.label}"><strong>D. DISTRICT / STREET</strong></td><td style="${S.cell}">${esc([meta.district, meta.street].filter(Boolean).join(" / "))}</td></tr>`;
          h += spacer + section("2. OFFICER(S) INFORMATION");
          meta.officers.forEach((o, i) => {
            h += `<tr style="background-color:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}"><td style="${S.num}">#${i + 1}</td><td style="${S.label};width:28%"><strong>A. OFFICER ${i + 1} NAME</strong></td><td style="${S.cell};width:28%">${esc(o.name)}</td><td style="${S.label};width:19%"><strong>B. RANK</strong></td><td style="${S.cell};width:19%"><p style="margin:0 0 0.25rem 0">${esc(o.rank)}</p><p style="margin:0"><strong>C. BADGE</strong> #${esc(o.badge)}</p></td></tr>`;
          });
          h += spacer + section("3. SUSPECT INFORMATION");
          h += `<tr><td colspan="2" style="${S.label};width:34%"><strong>A. FULL NAME</strong></td><td style="${S.cell};width:66%" colspan="3">${esc(meta.suspect)}</td></tr>`;
          h += spacer + section("4. CHARGES");
          h += `<tr style="background-color:#e5e7eb"><td style="border:1px solid black;padding:0.5rem;font-weight:bold;text-align:center;width:6%">#</td><td style="border:1px solid black;padding:0.5rem;font-weight:bold">CHARGE DESCRIPTION</td><td style="border:1px solid black;padding:0.5rem;font-weight:bold">TYPE</td><td style="border:1px solid black;padding:0.5rem;font-weight:bold">CLASS</td><td style="border:1px solid black;padding:0.5rem;font-weight:bold">OFFENCE</td></tr>`;
          rows.forEach((r, i) => {
            const c = r.c;
            h += `<tr><td style="${S.num}">#${i + 1}</td><td style="${S.cell};vertical-align:top">${esc(c.id + ". " + c.charge + chargeTitleSuffix(r.row, c))}</td><td style="${S.cell};vertical-align:top"><span style="${pill(c.type)}">${esc(typeLabel(c.type))}</span></td><td style="${S.cell};vertical-align:top">${r.row.cls ? `Class (${esc(r.row.cls)})` : "Class (N/A)"}</td><td style="${S.cell};vertical-align:top">${r.row.offense ? `Offence #${esc(r.row.offense)}` : "Offence #N/A"}</td></tr>`;
          });
          const additionLines = rows
            .map((r, i) => {
              const base = r.row.addition ? add(r.row.addition) : add("Offender");
              const text = paroleOn ? `${base} + ${PAROLE.name}` : base;
              return `<p style="margin:${i === rows.length - 1 ? "0" : "0 0 0.25rem 0"};line-height:1.35">${rows.length > 1 ? `<strong>${i + 1}. </strong>` : "<strong></strong>"}${esc(text)}</p>`;
            })
            .join("");
          h += `<tr><td style="${S.num}"></td><td style="border:1px solid black;padding:0.5rem;background-color:#f4f4f5;font-weight:bold;font-size:0.75rem">ADDITION</td><td style="border:1px solid black;padding:0.5rem;font-size:0.75rem" colspan="3">${additionLines}</td></tr>`;
          h += spacer + section("5. NARRATIVE");
          h += `<tr><td style="border:1px solid black;padding:0.75rem;line-height:1.5" colspan="5"><p style="margin:0;white-space:pre-wrap">${esc(meta.narrative)}</p></td></tr>`;
          h += spacer + section("6. EVIDENCE");
          h += `<tr><td colspan="2" style="${S.label};width:34%"><strong>A. SUPPORTING EVIDENCE</strong></td><td style="${S.cell}" colspan="3"><p style="margin:0;white-space:pre-wrap">${esc(meta.supporting)}</p></td></tr>`;
          h += `<tr><td colspan="2" style="${S.label};width:34%"><strong>B. DASHCAM FOOTAGE</strong></td><td style="${S.cell}" colspan="3"><p style="margin:0;white-space:pre-wrap">${esc(meta.dashcam)}</p></td></tr>`;
          h += spacer + section("(( 7. SENTENCING & AUTO-BAIL SUMMARY ))");
          const noBail = calc.bailStatus === "NOT ELIGIBLE",
            disc = calc.bailStatus === "DISCRETIONARY",
            bailAmount = noBail ? 0 : calc.totals.highestBail,
            bailStyle = noBail ? ";color:#b91c1c;font-weight:bold" : disc ? ";color:#d97706;font-weight:bold" : "";
          h += `<tr><td style="border:1px solid black;padding:0.75rem" colspan="2"><p style="margin:0 0 0.25rem 0"><strong>MINIMUM SENTENCE:</strong> ${esc(formatTotalTime(calc.minTimeCapped))}</p><p style="margin:0 0 0.25rem 0"><strong>MAXIMUM SENTENCE:</strong> ${esc(formatTotalTime(calc.maxTimeCapped))}</p><p style="margin:0 0 0.25rem 0"><strong>TOTAL FINE:</strong> $${calc.totals.fine.toLocaleString("en-US")}</p></td><td style="border:1px solid black;padding:0.75rem" colspan="3"><p style="margin:0 0 0.25rem 0"><strong>POINTS:</strong> ${Math.round(calc.totals.modified.points)}</p><p style="margin:0 0 0.25rem 0"><strong>BAIL STATUS:</strong> ${esc(calc.bailStatus)}</p><p style="margin:0${bailStyle}"><strong>BAIL AMOUNT:</strong> $${bailAmount.toLocaleString("en-US")}</p></td></tr>`;
          return h + "</tbody></table>";
        }

        /* ---------------- results panel ---------------- */
        function stat(label, value, extra, cls, copyValue) {
          return `<button type="button" class="ar-stat ${cls || ""}" data-copy="${esc(copyValue == null ? value : copyValue)}" title="Click to copy"><small>${esc(label)}</small><b>${esc(value)}</b>${extra ? `<em>${esc(extra)}</em>` : ""}</button>`;
        }
        function renderResults(calc) {
          const has = calc.results.length > 0;
          $("ar-results-empty").hidden = has;
          $("ar-results").hidden = !has;
          if (!has) return;
          const t = calc.totals,
            mod = calc.results.some((r) => r.isModified),
            noBail = calc.bailStatus === "NOT ELIGIBLE",
            disc = calc.bailStatus === "DISCRETIONARY",
            bail = noBail ? 0 : t.highestBail;
          const shortDays = (v) => (Math.round(v) > 0 ? Math.round(v) + "d" : "–");
          const timeTxt = compactTime;
          const head = ["Charge", "Cl.", "Min", "Max", "Fine", "Pts", "Imp.", "Susp.", "Bail"];
          $("ar-breakdown").innerHTML =
            `<div class="ar-tbl"><div class="ar-tr ar-th">${head.map((h) => `<span>${h}</span>`).join("")}</div>` +
            calc.results
              .map((r) => {
                const c = r.c,
                  mult = r.sentenceMultiplier,
                  add = r.applied.map((a) => a.name).join(" + ") || r.row.addition || "Offender",
                  name = c.charge + chargeTitleSuffix(r.row, c),
                  tip = (cur, orig, mod) => (mod ? ` class="mod" title="Original: ${esc(orig)}"` : ""),
                  bail =
                    r.bailAuto === false
                      ? `<span class="bad">✕ No bail</span>`
                      : r.bailAuto === 2
                        ? `<span class="warn" title="Discretionary${r.bailCost ? " " + money(r.bailCost) : ""}">! Discr.</span>`
                        : r.bailAuto === true
                          ? `<span>${money(r.bailCost)}</span>`
                          : `<span>N/A</span>`;
                return `<div class="ar-tr"><span class="ar-cname" title="${esc(c.id + ". " + name + " (" + add + ")")}">${chargeBadge(c)}<span>${esc(name)}${add === "Offender" ? "" : " · " + esc(add)}</span></span><span>${esc(r.row.cls)}</span><span${tip(0, timeTxt(r.original.minTime), r.isModified)}>${esc(timeTxt(r.modified.minTime))}</span><span${tip(0, timeTxt(r.original.maxTime), r.isModified)}>${esc(timeTxt(r.modified.maxTime))}</span><span>${money(r.fine)}</span><span${tip(0, Math.round(r.original.points), r.isModified)}>${Math.round(r.modified.points)}</span><span>${esc(shortDays(r.impound * mult))}</span><span>${esc(shortDays(r.suspension * mult))}</span>${bail}</div>`;
              })
              .join("") +
            `</div>`;
          $("ar-stats").innerHTML = [
            stat("Min", String(Math.round(calc.minTimeCapped)), timeTxt(calc.minTimeCapped)),
            stat("Max", String(Math.round(calc.maxTimeCapped)), timeTxt(calc.maxTimeCapped)),
            stat("Points", String(Math.round(t.modified.points)), mod ? `orig. ${Math.round(t.original.points)}` : ""),
            stat("Fine", money(t.fine), "", "", t.fine),
            stat("Impound", formatDays(calc.impoundCapped), "", "", Math.round(calc.impoundCapped)),
            stat("Susp.", formatDays(calc.suspensionCapped), "", "", Math.round(calc.suspensionCapped)),
            stat("Bail", calc.bailStatus === "N/A" ? "N/A" : noBail ? "NO BAIL" : money(bail), noBail ? "✕ not eligible" : disc ? "! discretionary" : calc.bailStatus === "ELIGIBLE" ? "✓ auto bail" : "", noBail ? "bad" : disc ? "warn" : calc.bailStatus === "ELIGIBLE" ? "ok" : "", bail),
          ].join("");
          const caps = [];
          if (calc.isCapped) caps.push(["Sentence capped", `The total sentence exceeds the maximum of ${CFG.maxSentenceDays} days, so the time shown has been capped. Original: ${formatTotalTime(t.modified.minTime)} – ${formatTotalTime(t.modified.maxTime)}.`]);
          if (calc.isImpoundCapped) caps.push(["Impound capped", `The total impound exceeds the maximum of ${CFG.maxImpoundDays} days.`]);
          if (calc.isSuspensionCapped) caps.push(["Suspension capped", `The total suspension exceeds the maximum of ${CFG.maxSuspensionDays} days.`]);
          $("ar-caps").innerHTML = caps.map(([a, b]) => `<div class="ar-callout"><b>${esc(a)}</b>${esc(b)}</div>`).join("");
          const ex = $("ar-extras");
          ex.hidden = !calc.extras.length;
          ex.innerHTML = calc.extras.length
            ? `<div><span>Charge</span><span>Stipulation</span></div>` + calc.extras.map((e) => `<div><span>${esc(e.title)}</span><span>${esc(e.extra)}</span></div>`).join("")
            : "";
        }
        function renderAlerts(calc) {
          let h = "";
          if (calc.isStreetsEligible)
            h += `<div class="ar-callout"><b>Heads up!</b>One or more of the charges are applicable to <strong>Section IV</strong> of the STREETS Act. The arrestee may be subject to the repeat offender clause and increased vehicle seizures and license suspensions (from 7 to 28 days).<br />Reference: <a href="${CFG.urlStreets}" target="_blank" rel="noopener noreferrer">Strengthen Traffic Regulations to Ensure Every Traveler's Safety Act 2024 (STREETS Act)</a></div>`;
          if (charges.some((r) => PENAL[r.chargeId] && PENAL[r.chargeId].drugs))
            h += `<div class="ar-callout"><b>Heads up!</b>Please make sure you select the correct Category for drug charges. Check the warrant (if applicable) for more information. See the <a href="${CFG.urlDepa}" target="_blank" rel="noopener noreferrer">Drug Enforcement &amp; Prevention Act of 2020 (DEPA)</a>.<details><summary>DEPA categories</summary>${DATA.depa.map((cat) => `<div style="margin-top:8px"><b style="margin:0">${esc(cat.title)}</b><ul>${cat.substances.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`).join("")}</details></div>`;
          $("ar-alerts").innerHTML = h;
        }

        /* ---------------- main update ---------------- */
        function collectMeta() {
          const v = (id) => $(id).value.trim(),
            dateRaw = $("ar-date").value;
          return {
            department: v("ar-department") || DEFAULT_DEPT,
            date: dateRaw ? formatPickerDate(dateRaw, "short") : "",
            time: v("ar-time"),
            callsign: v("ar-callsign"),
            district: v("ar-district"),
            street: v("ar-street"),
            officers: officers(),
            suspect: cleanName($("ar-suspect").value),
            narrative: $("ar-narrative").value,
            supporting: v("ar-supporting"),
            dashcam: v("ar-dashcam"),
          };
        }
        // Everything the report needs before it can be copied.
        const CHECKS = [
          ["charges", "Charges"],
          ["officer", "Officer details"],
          ["suspect", "Suspect name"],
          ["narrative", "Narrative"],
          ["dashcam", "Dashcam footage"],
        ];
        function status(meta) {
          const filled = charges.filter((r) => r.chargeId);
          return {
            charges: filled.length > 0 && filled.every(isComplete),
            officer: meta.officers.length > 0 && meta.officers.every((o) => o.name && o.rank && o.badge),
            suspect: !!meta.suspect,
            narrative: !!meta.narrative.trim(),
            dashcam: !!meta.dashcam,
          };
        }
        function jumpTo(key) {
          let target;
          if (key === "charges") {
            const row = [...document.querySelectorAll("#ar-charges .ar-charge")].find((n) => {
              const r = charges.find((x) => String(x.uid) === n.dataset.uid);
              return r && !isComplete(r);
            });
            target = row ? row.querySelector(".ar-cin") : $("ar-card-charges");
          } else if (key === "officer")
            target = [...document.querySelectorAll("#ar-officers .ar-o-rank, #ar-officers .ar-o-name, #ar-officers .ar-o-badge")].find((n) => !n.value.trim());
          else target = $({ suspect: "ar-suspect", narrative: "ar-narrative", dashcam: "ar-dashcam" }[key]);
          if (!target) return;
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          if (target.focus) target.focus({ preventScroll: true });
        }
        function renderChecklist(st) {
          const box = $("ar-check");
          box.innerHTML =
            `<b>Before you copy</b><ul>` +
            CHECKS.map(
              ([k, label]) =>
                `<li><button type="button" class="ar-ck${st[k] ? " ok" : ""}" data-go="${k}"><i aria-hidden="true">${st[k] ? "✓" : "○"}</i><span>${label}</span><span class="ar-sr">${st[k] ? " — done" : " — missing, press to go there"}</span></button></li>`,
            ).join("") +
            `</ul>`;
        }
        function markRequired(meta) {
          const flag = (id, bad) => $(id).classList.toggle("ar-bad", showErrors && bad);
          flag("ar-suspect", !meta.suspect);
          flag("ar-narrative", !meta.narrative.trim());
          flag("ar-dashcam", !meta.dashcam);
        }
        let restoring = false;
        let pendingDraft = false;
        window.arUpdate = function () {
          if (restoring || !$("ar-date")) return;
          syncNarrative();
          const meta = collectMeta(),
            rows = charges.filter(isComplete),
            calc = calculate(rows, $("ar-parole").checked);
          lastCalc = calc;
          renderResults(calc);
          renderAlerts(calc);
          document.querySelectorAll("#f-arrest-report .ar-gated").forEach((n) => {
            n.hidden = !calculated;
            const h = n.matches(".card") ? n.querySelector(":scope > h2") : null;
            if (h && h._a) h._a.hidden = !calculated;
          });
          $("ar-card-results").hidden = !calculated;
          const rh = $("ar-card-results").querySelector(":scope > h2");
          if (rh && rh._a) rh._a.hidden = !calculated;
          const html = buildReport(calc, meta);
          $("ar-paper").innerHTML = html;
          const st = status(meta),
            ready = CHECKS.every(([k]) => st[k]);
          renderChecklist(st);
          [$("ar-copy-btn"), $("ar-png-btn")].forEach((b) => {
            b.classList.toggle("ar-disabled", !ready);
            b.setAttribute("aria-disabled", ready ? "false" : "true");
          });
          markRequired(meta);
          // Offered only once every check is ticked and at least one charge carries an impound.
          const impoundDays = Math.round(calc.impoundCapped),
            impoundBtn = $("ar-impound-btn");
          if (impoundBtn) {
            impoundBtn.hidden = !(ready && impoundDays > 0);
            impoundBtn.title = `Impound: ${impoundDays} ${impoundDays === 1 ? "day" : "days"}. Opens the Impound Report with this arrest's details filled in.`;
          }
          scheduleSave();
        };
        // Hands what an impound report needs to the Impound Report form (js/patrol-reports.js).
        window.arCreateImpound = function () {
          if (typeof window.prFillImpound !== "function" || !lastCalc) return;
          const meta = collectMeta(),
            days = Math.round(lastCalc.impoundCapped),
            impounded = lastCalc.results.filter((r) => r.impound > 0).map((r) => `${r.c.id}. ${r.c.charge}`);
          window.prFillImpound({
            date: $("ar-date").value,
            time: meta.time,
            callsign: meta.callsign,
            district: meta.district,
            street: meta.street,
            officers: meta.officers,
            owner: meta.suspect,
            days,
            reason:
              "Vehicle was used in the commission of a crime, see arrest report #." +
              (impounded.length ? `\nImpound applies to: ${impounded.join("; ")}.` : ""),
          });
        };

        /* ---------------- drafts, history, undo ---------------- */
        const DK = "lssd-arrest-draft",
          HK = "lssd-arrest-recent";
        const store = {
          get(k) {
            try {
              return JSON.parse(localStorage.getItem(k));
            } catch (e) {
              return null;
            }
          },
          set(k, v) {
            try {
              localStorage.setItem(k, JSON.stringify(v));
            } catch (e) {
              /* private mode / storage full: the form still works, it just can't remember */
            }
          },
          del(k) {
            try {
              localStorage.removeItem(k);
            } catch (e) {
              /* ignore */
            }
          },
        };
        const ago = (t) => {
          const m = Math.round((Date.now() - t) / 60000);
          return m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago";
        };
        let recentId = null; // id of this report's entry in the "Recent reports" list
        function snapshot() {
          const v = (id) => $(id).value;
          return {
            v: 1,
            rid: recentId,
            f: {
              date: v("ar-date"), time: v("ar-time"), callsign: v("ar-callsign"), department: v("ar-department"),
              district: v("ar-district"), street: v("ar-street"), suspect: v("ar-suspect"),
              supporting: v("ar-supporting"), dashcam: v("ar-dashcam"), narrative: v("ar-narrative"), callnum: v("ar-callnum"),
            },
            preset: $("ar-preset").checked,
            userModified: narrativeUserModified,
            applied: { ...applied },
            mods: Object.fromEntries([...document.querySelectorAll("#ar-mods input")].map((b) => [b.dataset.mod, b.checked])),
            items: [...document.querySelectorAll("#ar-items .ar-item")].map((i) => i.value),
            officers: [...document.querySelectorAll("#ar-officers .ar-officer")].map((r) => ({
              rank: r.querySelector(".ar-o-rank").value,
              name: r.querySelector(".ar-o-name").value,
              badge: r.querySelector(".ar-o-badge").value,
            })),
            charges: charges.map(({ chargeId, cls, offense, addition, category }) => ({ chargeId, cls, offense, addition, category })),
            parole: $("ar-parole").checked,
            calculated,
          };
        }
        function restore(s) {
          if (!s || !s.f) return;
          restoring = true;
          try {
            Object.entries({
              "ar-date": "date", "ar-time": "time", "ar-callsign": "callsign", "ar-department": "department",
              "ar-district": "district", "ar-street": "street", "ar-suspect": "suspect",
              "ar-supporting": "supporting", "ar-dashcam": "dashcam", "ar-narrative": "narrative", "ar-callnum": "callnum",
            }).forEach(([id, k]) => ($(id).value = s.f[k] == null ? "" : s.f[k]));
            updateTaskListDateLabel("ar-date");
            $("ar-parole").checked = !!s.parole;
            $("ar-preset").checked = s.preset !== false;
            document.querySelectorAll("#ar-mods input").forEach((b) => (b.checked = !!(s.mods && s.mods[b.dataset.mod])));
            $("ar-items").replaceChildren();
            (s.items && s.items.length ? s.items : [""]).forEach((i) => arAddItem(i, false));
            $("ar-officers").replaceChildren();
            (s.officers && s.officers.length ? s.officers : [{}]).forEach((o) => {
              const wrap = document.createElement("div");
              wrap.innerHTML = officerHtml(!$("ar-officers").children.length);
              const row = wrap.firstElementChild;
              row.querySelector(".ar-o-rank").value = o.rank || "";
              row.querySelector(".ar-o-name").value = o.name || "";
              row.querySelector(".ar-o-badge").value = o.badge || "";
              $("ar-officers").appendChild(row);
            });
            arNumberOfficers();
            charges = (s.charges || []).filter((c) => PENAL[c.chargeId]).map((c) => ({ uid: ++chargeUid, ...c }));
            if (!charges.length) newCharge();
            narrativeUserModified = !!s.userModified;
            applied = { ...(s.applied || {}) };
            calculated = !!s.calculated && charges.some((r) => r.chargeId) && charges.filter((r) => r.chargeId).every(isComplete);
            showErrors = false;
            recentId = s.rid || null;
          } finally {
            restoring = false;
          }
          renderCharges();
        }
        let saveT;
        const hasContent = () =>
          charges.some((r) => r.chargeId) ||
          $("ar-suspect").value.trim() ||
          $("ar-supporting").value.trim() ||
          $("ar-dashcam").value.trim() ||
          narrativeUserModified;
        function saveDraft() {
          if (pendingDraft || restoring) return;
          if (hasContent()) {
            store.set(DK, { saved: Date.now(), snap: snapshot() });
            // every report with a suspect and a charge is kept in the recent list automatically
            if (cleanName($("ar-suspect").value) && charges.some((r) => r.chargeId)) saveRecent();
          } else store.del(DK);
        }
        function scheduleSave() {
          if (pendingDraft || restoring) return;
          clearTimeout(saveT);
          saveT = setTimeout(saveDraft, 500);
        }
        addEventListener("pagehide", () => {
          clearTimeout(saveT);
          saveDraft();
        });
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            clearTimeout(saveT);
            saveDraft();
          }
        });
        function offerDraft() {
          const d = store.get(DK);
          if (!d || !d.snap) return;
          const names = (d.snap.charges || []).filter((c) => PENAL[c.chargeId]).length;
          pendingDraft = true;
          $("ar-restore-text").textContent = `You have an unfinished arrest report${d.snap.f && d.snap.f.suspect ? " for " + cleanName(d.snap.f.suspect) : ""} (${names} charge${names === 1 ? "" : "s"}, saved ${ago(d.saved)}).`;
          $("ar-restore").hidden = false;
        }
        window.arRestoreDraft = function () {
          const d = store.get(DK);
          pendingDraft = false;
          $("ar-restore").hidden = true;
          if (d && d.snap) restore(d.snap);
          saveDraft();
        };
        window.arDiscardDraft = function () {
          pendingDraft = false;
          $("ar-restore").hidden = true;
          store.del(DK);
        };
        // recent reports
        function renderRecent() {
          const list = store.get(HK) || [];
          $("ar-recent").hidden = !list.length;
          $("ar-recent-n").textContent = list.length ? `(${list.length})` : "";
          $("ar-recent-list").innerHTML = list
            .map(
              (e) =>
                `<div class="ar-rec"><div><b>${esc(cleanName(e.suspect) || "Unnamed suspect")}</b><small>${esc(e.date || "")} · ${esc((e.charges || []).join(", ") || "no charges")} · ${esc(ago(e.saved))}</small></div><div class="ar-rec-btns"><button type="button" class="b" data-open="${e.id}">Open</button><button type="button" class="b" data-del="${e.id}" aria-label="Delete this saved report">Delete</button></div></div>`,
            )
            .join("");
        }
        function saveRecent() {
          if (!recentId) recentId = Date.now();
          const snap = snapshot(),
            ids = snap.charges.filter((c) => c.chargeId).map((c) => c.chargeId),
            entry = { id: recentId, saved: Date.now(), suspect: snap.f.suspect, date: formatPickerDate(snap.f.date, "short"), charges: ids, snap };
          let list = store.get(HK) || [];
          list = list.filter((e) => e.id !== recentId); // update this report's own entry
          list.unshift(entry);
          store.set(HK, list.slice(0, 5));
          renderRecent();
        }
        let snackT;
        function snack(msg, label, fn) {
          const el = $("ar-snack"),
            b = el.querySelector("button");
          el.querySelector("span").textContent = msg;
          b.hidden = !fn;
          b.textContent = label || "";
          b.onclick = () => {
            el.hidden = true;
            if (fn) fn();
          };
          el.hidden = false;
          clearTimeout(snackT);
          snackT = setTimeout(() => (el.hidden = true), 9000);
        }

        /* ---------------- actions ---------------- */
        function guard() {
          const meta = collectMeta(),
            st = status(meta),
            gaps = CHECKS.filter(([k]) => !st[k]);
          if (gaps.length) {
            showErrors = true;
            arUpdate();
            toast("Still needed: " + gaps.map((g) => g[1].toLowerCase()).join(", "));
            jumpTo(gaps[0][0]);
            return false;
          }
          return true;
        }
        async function writeText(text) {
          try {
            await navigator.clipboard.writeText(text);
            return true;
          } catch (e) {
            const a = document.createElement("textarea");
            a.value = text;
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
        let copiedT;
        function flashCopied() {
          const b = $("ar-copy-btn");
          b.textContent = "Copied ✓";
          b.classList.add("done");
          clearTimeout(copiedT);
          copiedT = setTimeout(() => {
            b.textContent = "Copy report";
            b.classList.remove("done");
          }, 2200);
        }
        window.arCopyReport = async function () {
          if (!guard()) return;
          const ok = await writeText($("ar-paper").innerHTML);
          toast(ok ? "Copied!" : "Copy failed");
          if (ok) {
            flashCopied();
            saveRecent();
            store.del(DK);
          }
        };
        window.arDownloadPng = async function () {
          if (!guard()) return;
          try {
            const table = $("ar-paper").firstElementChild,
              width = Math.ceil(table.getBoundingClientRect().width),
              height = Math.ceil(table.getBoundingClientRect().height),
              scale = 2,
              xml = new XMLSerializer().serializeToString(table),
              svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;background:#fff;transform:scale(${scale});transform-origin:0 0">${xml}</div></foreignObject></svg>`,
              img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = () => reject(new Error("The report could not be rendered"));
              img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
            });
            const canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const blob = await new Promise((resolve, reject) =>
              canvas.toBlob((f) => (f ? resolve(f) : reject(new Error("Could not create the PNG"))), "image/png"),
            );
            const who = cleanName($("ar-suspect").value).replace(/[^A-Za-z0-9-]+/g, "_"),
              url = URL.createObjectURL(blob),
              a = document.createElement("a");
            a.href = url;
            a.download = "arrest-report" + (who ? "-" + who : "") + ".png";
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast("Download started");
            saveRecent();
          } catch (e) {
            console.error("Arrest report PNG download failed:", e);
            toast("Download failed");
          }
        };
        window.arCalculate = function () {
          charges = charges.filter((r) => r.chargeId); // blank rows are dropped
          if (!charges.length) {
            newCharge();
            renderCharges();
            toast("Add at least one charge first");
            return;
          }
          if (!charges.every(isComplete)) {
            renderCharges();
            toast("Finish every charge first (including the drug category, if any)");
            jumpTo("charges");
            return;
          }
          calculated = true;
          renderCharges();
          $("ar-card-results").scrollIntoView({ behavior: "smooth", block: "start" });
        };
        function clearForm() {
          calculated = false;
          restoring = true;
          ["ar-callsign", "ar-district", "ar-street", "ar-suspect", "ar-supporting", "ar-dashcam", "ar-callnum"].forEach((id) => ($(id).value = ""));
          $("ar-department").value = DEFAULT_DEPT;
          $("ar-date").value = taskListTodayDate();
          updateTaskListDateLabel("ar-date");
          $("ar-time").value = arNowTime();
          $("ar-parole").checked = false;
          $("ar-preset").checked = true;
          document.querySelectorAll("#ar-mods input").forEach((b) => (b.checked = false));
          $("ar-items").replaceChildren();
          arAddItem("", false);
          narrativeUserModified = false;
          applied = {};
          showErrors = false;
          charges = [];
          newCharge();
          $("ar-officers").replaceChildren();
          restoring = false;
          arAddOfficer();
          renderCharges();
          applyDeputyDetails();
          arUpdate();
        }
        window.arReset = function () {
          const had = hasContent(),
            snap = snapshot();
          clearForm();
          recentId = null;
          store.del(DK);
          if (had) snack("Report cleared.", "Undo", () => restore(snap));
        };
        window.arNowTime = () => ukTimeNow("HH:MM");

        /* ---------------- init ---------------- */
        // Styled suggestion lists (free text is still allowed).
        function wireSuggest(input, values, label) {
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
            const t = input.value.trim().toLowerCase();
            const hits = values.filter((v) => !t || v.toLowerCase().includes(t)).slice(0, 80);
            list.innerHTML = hits.length
              ? hits.map((v, i) => `<button type="button" role="option" aria-selected="false" id="${list.id}-o${i}" class="ar-opt" data-v="${esc(v)}"><span class="ar-opt-name">${esc(v)}</span></button>`).join("")
              : `<div class="ar-opt-none" role="option" aria-disabled="true">No match. What you type will be used.</div>`;
            active = -1;
          };
          const pick = (v) => {
            input.value = v;
            setOpen(false);
            input.dispatchEvent(new Event("input", { bubbles: true }));
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
        wireSuggest($("ar-district"), DATA.districts, "Districts");
        wireSuggest($("ar-street"), DATA.streets, "Streets");
        $("ar-mods").innerHTML = MODIFIERS.map(
          (m) =>
            `<label class="resp-tile${m.sub ? " ar-sub" : ""}"${m.sub ? " hidden" : ""}><input type="checkbox" data-mod="${m.name}" /><i class="mk" aria-hidden="true"></i><span class="resp-txt"><b>${esc(m.label)}</b><small>${esc(m.hint)}</small></span><em class="resp-state" aria-hidden="true"></em></label>`,
        ).join("");
        arAddItem("", false);
        $("ar-date").value = taskListTodayDate();
        updateTaskListDateLabel("ar-date");
        $("ar-time").value = arNowTime();
        $("ar-narrative").addEventListener("input", () => {
          narrativeUserModified = true;
          updateFillHighlight();
        });
        $("ar-narrative").addEventListener("scroll", updateFillHighlight);
        if (window.ResizeObserver) new ResizeObserver(updateFillHighlight).observe($("ar-narrative"));
        $("ar-preset").addEventListener("change", () => {
          if ($("ar-preset").checked) narrativeUserModified = false;
        });
        $("ar-stats").addEventListener("click", async (e) => {
          const b = e.target.closest(".ar-stat");
          if (b) toast((await writeText(b.dataset.copy)) ? "Copied " + b.dataset.copy : "Copy failed");
        });
        $("ar-quick-list").addEventListener("click", (e) => {
          const b = e.target.closest(".ar-chip");
          if (!b) return;
          let row = charges.find((r) => !r.chargeId);
          if (!row) {
            newCharge();
            row = charges[charges.length - 1];
          }
          fillCharge(row, b.dataset.id);
          noteCharge(b.dataset.id);
          renderCharges();
        });
        $("ar-check").addEventListener("click", (e) => {
          const b = e.target.closest("[data-go]");
          if (b) jumpTo(b.dataset.go);
        });
        $("ar-recent-list").addEventListener("click", (e) => {
          const list = store.get(HK) || [],
            open = e.target.closest("[data-open]"),
            del = e.target.closest("[data-del]");
          if (open) {
            const entry = list.find((x) => String(x.id) === open.dataset.open);
            if (!entry) return;
            const prev = hasContent() ? snapshot() : null;
            restore(entry.snap);
            snack(`Loaded the report for ${cleanName(entry.suspect) || "this suspect"}.`, prev ? "Undo" : "", prev ? () => restore(prev) : null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (del) {
            store.set(HK, list.filter((x) => String(x.id) !== del.dataset.del));
            renderRecent();
          }
        });
        window.arClearRecent = function () {
          store.del(HK);
          renderRecent();
        };
        // floating pieces live on <body> so they don't take part in the page grid
        const snackEl = document.createElement("div");
        snackEl.id = "ar-snack";
        snackEl.className = "ar-snack";
        snackEl.setAttribute("role", "status");
        snackEl.hidden = true;
        snackEl.innerHTML = `<span></span><button type="button" class="b"></button>`;
        document.body.appendChild(snackEl);
        addEventListener("keydown", (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !$("f-arrest-report").hidden) {
            e.preventDefault();
            if (calculated) arCopyReport();
            else arCalculate();
          }
        });
        const form = $("f-arrest-report");
        form.addEventListener("input", arUpdate);
        form.addEventListener("change", arUpdate);
        newCharge();
        arAddOfficer();
        renderCharges();
        renderRecent();
        applyDeputyDetails();
        arUpdate();
        setTimeout(arUpdate, 0);
        offerDraft();
      })();
    
