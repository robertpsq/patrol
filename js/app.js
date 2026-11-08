      const Q = [
        "Was someone injured as a result of the incident?",
        "Did the incident involve weapons or violence?",
        "Did the incident happen because of your race religion sexual orientation or a disability?",
        "Is there any information about who is responsible for the act (if a crime was involved)?",
        "Are there any photos or videos of the incident occurring?",
      ];
      const $ = (i) => document.getElementById(i);
      const deputyStorageKey = "lssd-deputy-details";
      const deputyRanks = [
        "Deputy Sheriff",
        "Deputy Sheriff (Bonus I)",
        "Deputy Sheriff (Bonus II)",
        "Sergeant",
        "Detective",
        "Lieutenant",
        "Captain",
        "Commander",
        "Division Chief",
        "Undersheriff",
        "Assistant Sheriff",
        "Sheriff",
      ];
      let deputyDetails = { fullName: "", badgeNumber: "", rank: "", bureau: "", callsign: "" };
      const characterPrefillForms = new Set([
        "sheriff",
        "arrest-report",
        "incident",
        "supp",
        "notices-commendations",
        "uof-supp",
        "uof",
        "king-patrol",
        "apb",
        "tc",
        "trespass",
        "impound",
        "lab",
        "dforensics",
        "nccit",
        "nccit-supp",
        "email",
        "depmail",
        "card",
        "arrest-warrant",
        "search-warrant",
        "electronic-surveillance-warrant",
        "senora-k9-deployment",
        "senora-logbook",
        "sib-activity",
        "citation",
        "oss-incident",
        "oss-supplemental",
        "davis-k9-deployment",
        "csd-k9-deployment",
        "vst-request",
        "cfid",
        "met-incident",
        "k9-emc",
        "k9-checkup",
        "vet-lab-report",
        "forensic-lab",
        "ftp-phase1",
        "ftp-phase2",
        "ftp-phase3",
        "ftp-fto-eval",
        "peu-letters",
        "mcb-case",
        "mcb-supplemental",
        "hb-case",
        "hb-supplemental",
      ]);
      // Shown on every page (home included) until Character Details are saved. It can't be
      // dismissed, but it never blocks anything.
      function updateCharacterDetailsPrompt() {
        const prompt = $("character-details-prompt");
        if (!prompt) return;
        const activeForm = [...document.querySelectorAll('main > [id^="f-"]')].find(
            (form) => !form.hidden,
          ),
          detailsFilled = Object.values(deputyDetails).some((value) => value.trim());
        prompt.hidden =
          !activeForm ||
          activeForm.id === "f-deputy" ||
          detailsFilled;
      }
      function loadDeputyDetails() {
        try {
          let saved = localStorage.getItem(deputyStorageKey),
            migrate = false;
          if (!saved) {
            saved = sessionStorage.getItem(deputyStorageKey);
            migrate = !!saved;
          }
          if (!saved) return;
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            typeof parsed.fullName === "string" &&
            typeof parsed.badgeNumber === "string" &&
            typeof parsed.rank === "string" &&
            (parsed.bureau === undefined || typeof parsed.bureau === "string") &&
            (parsed.assignment === undefined || typeof parsed.assignment === "string") &&
            (parsed.callsign === undefined || typeof parsed.callsign === "string")
          ) {
            deputyDetails = {
              fullName: parsed.fullName,
              badgeNumber: parsed.badgeNumber,
              rank: parsed.rank.trim().slice(0, 40),
              bureau:
                typeof parsed.bureau === "string"
                  ? parsed.bureau
                  : typeof parsed.assignment === "string"
                    ? parsed.assignment
                    : "",
              callsign: typeof parsed.callsign === "string" ? parsed.callsign : "",
            };
            if (migrate) localStorage.setItem(deputyStorageKey, JSON.stringify(deputyDetails));
          }
        } catch (error) {
          console.error("Could not load or migrate Character Details in this browser:", error);
          toast("Could not load Character Details");
        }
      }
      function deputyNameParts() {
        const parts = deputyDetails.fullName.trim().split(/\s+/).filter(Boolean);
        if (parts.length < 2) return { first: parts[0] || "", middle: "", last: "" };
        return {
          first: parts[0],
          middle: parts.slice(1, -1).join(" "),
          last: parts[parts.length - 1],
        };
      }
      function apbRankValue(rank) {
        return (
          {
            "Deputy Sheriff": "Dep.",
            "Deputy Sheriff (Bonus I)": "Dep.",
            "Deputy Sheriff (Bonus II)": "Dep.",
            Detective: "Det.",
            Sergeant: "Sgt.",
            Lieutenant: "Lt.",
            Captain: "Cpt.",
            Commander: "Cmdr.",
          }[rank] || rank
        );
      }
      function prefillDeputyField(id, value) {
        const field = $(id);
        if (!field) return;
        const previous = field.dataset.deputyPrefill;
        if (!field.value.trim() || field.value === previous) {
          field.value = value;
          field.dataset.deputyPrefill = value;
        }
      }
      function applyDeputyDetails() {
        const fullName = deputyDetails.fullName.trim(),
          rank = deputyDetails.rank,
          rankAndName = [rank, fullName].filter(Boolean).join(" "),
          parts = deputyNameParts(),
          tcName = [parts.last, [parts.first, parts.middle].filter(Boolean).join(" ")]
            .filter(Boolean)
            .join(", ");
        [
          ["ar-rank", rank],
          ["ar-name", fullName],
          ["ar-badge", deputyDetails.badgeNumber.trim().replace(/^#/, "")],
          ["ar-callsign", deputyDetails.callsign],
          ["d1", rank],
          ["d2", fullName],
          ["i4", rankAndName],
          ["s2", rankAndName],
          ["uof-filed-by", rankAndName],
          ["usup-filed-by", rankAndName],
          ["king-trainee-name", fullName],
          ["king-employee-number", deputyDetails.badgeNumber],
          ["king-signature", fullName],
          ["apb-rank", apbRankValue(rank)],
          ["apb-name", fullName],
          ["apb-bureau", deputyDetails.bureau],
          ["senora-logbook-deputy", rankAndName],
          ["sib-activity-name", fullName],
          ["oss-ir-filed-by", rankAndName],
          ["oss-supp-filed-by", rankAndName],
          ["lab-name", fullName],
          ["lab-rank", rank],
          ["dfr-name", fullName],
          ["dfr-rank", rank],
          ["nccit-name", fullName],
          ["nccit-rank", rank],
          ["email-deputy-name", fullName],
          ["email-rank", rank],
          ["email-bureau", deputyDetails.bureau],
          ["email-unit", deputyDetails.bureau],
          ["email-sig-title", rank],
          ["depmail-name", fullName],
          ["depmail-rank", rank],
          ["depmail-bureau", deputyDetails.bureau],
          ["arrest-rank", rank],
          ["arrest-deputy-name", fullName],
          ["arrest-badge", deputyDetails.badgeNumber],
          ["arrest-bureau", deputyDetails.bureau],
          ["search-rank", rank],
          ["search-deputy-name", fullName],
          ["search-badge", deputyDetails.badgeNumber],
          ["search-bureau", deputyDetails.bureau],
          ["electronic-rank", rank],
          ["electronic-deputy-name", fullName],
          ["electronic-badge", deputyDetails.badgeNumber],
          ["electronic-bureau", deputyDetails.bureau],
          ["trespass-rank", rank],
          ["trespass-name", fullName],
          ["trespass-badge", deputyDetails.badgeNumber.trim().replace(/^#/, "")],
          ["trespass-callsign", deputyDetails.callsign],
          ["impound-rank", rank],
          ["impound-name", fullName],
          ["impound-badge", deputyDetails.badgeNumber.trim().replace(/^#/, "")],
          ["impound-callsign", deputyDetails.callsign],
          ["tc-prepared-by", tcName],
          ["tc-employee", deputyDetails.badgeNumber],
          ["citation-officer", fullName],
          ["citation-rank", rank],
          [
            "citation-badge",
            deputyDetails.badgeNumber.trim()
              ? "#" + deputyDetails.badgeNumber.trim().replace(/^#/, "")
              : "",
          ],
          ["b1", parts.first],
          ["b2", parts.last],
          ["b6", deputyDetails.bureau],
          ["b7", rank],
          ["i5", deputyDetails.callsign],
          ["uof-unit", deputyDetails.callsign],
          ["usup-unit", deputyDetails.callsign],
          ["king-callsign", deputyDetails.callsign],
          ["nccit-callsign", deputyDetails.callsign],
          ["nccit-supp-callsign", deputyDetails.callsign],
          ["citation-callsign", deputyDetails.callsign],
          ["oss-ir-callsign", deputyDetails.callsign],
          ["oss-supp-callsign", deputyDetails.callsign],
          ["ftp1-fto-name", fullName],
          ["ftp1-fto-number", deputyDetails.badgeNumber.trim()],
          ["ftp2-fto-name", fullName],
          ["ftp2-fto-number", deputyDetails.badgeNumber.trim()],
          ["ftp3-fto-name", fullName],
          ["ftp3-fto-number", deputyDetails.badgeNumber.trim()],
          ["fto-officer-name", fullName],
          ["fto-officer-number", deputyDetails.badgeNumber.trim()],
          ["mcb-case-rank", rank],
          ["mcb-case-name", fullName],
          ["mcb-case-badge", deputyDetails.badgeNumber.trim().replace(/^#/, "")],
          ["mcb-supp-rank", rank],
          ["mcb-supp-name", fullName],
          ["mcb-supp-badge", deputyDetails.badgeNumber.trim().replace(/^#/, "")],
          ["hb-case-rank", rank],
          ["hb-case-name", fullName],
          ["hb-case-badge", deputyDetails.badgeNumber.trim().replace(/^#/, "")],
          ["hb-supp-rank", rank],
          ["hb-supp-name", fullName],
          ["hb-supp-badge", deputyDetails.badgeNumber.trim().replace(/^#/, "")],
        ].forEach(([id, value]) => prefillDeputyField(id, value));
        updateNcCitTitle();
        drawSheriffReport();
        if (typeof arUpdate === "function") arUpdate();
        if (typeof window.prRender === "function") window.prRender();
        drawC();
        updateCharacterDetailsPrompt();
      }
      function saveDeputyDetails() {
        deputyDetails = {
          fullName: $("deputy-full-name").value.trim(),
          badgeNumber: $("deputy-badge-number").value.trim(),
          rank: $("deputy-rank").value,
          bureau: $("deputy-bureau").value.trim(),
          callsign: $("deputy-callsign").value.trim(),
        };
        try {
          localStorage.setItem(deputyStorageKey, JSON.stringify(deputyDetails));
        } catch (error) {
          console.error("Could not save Character Details in this browser:", error);
          toast("Could not save Character Details");
          return;
        }
        applyDeputyDetails();
        toast("Character Details saved");
      }
      function clearDeputyDetails() {
        deputyDetails = { fullName: "", badgeNumber: "", rank: "", bureau: "", callsign: "" };
        try {
          localStorage.removeItem(deputyStorageKey);
        } catch (error) {
          console.error("Could not clear Character Details from this browser:", error);
          toast("Could not clear Character Details");
          return;
        }
        $("deputy-full-name").value = "";
        $("deputy-badge-number").value = "";
        setDeputyRankField("");
        $("deputy-bureau").value = "";
        $("deputy-callsign").value = "";
        applyDeputyDetails();
        toast("Character Details cleared");
      }
      // Rank: the "Custom" option takes whatever is typed in the box below it as its value,
      // so every form that reads the Rank dropdown gets the custom text with no other change.
      function setDeputyRankField(rank) {
        const sel = $("deputy-rank"), opt = $("deputy-rank-custom-opt"), box = $("deputy-rank-custom");
        const known = [...sel.options].find((o) => o !== opt && o.value && o.value === rank);
        if (known) sel.value = rank;
        else if (rank) { opt.value = rank; box.value = rank; opt.selected = true; }
        else { opt.value = ""; box.value = ""; sel.selectedIndex = 0; }
        $("deputy-rank-custom-wrap").hidden = !opt.selected;
      }
      $("deputy-rank").addEventListener("change", () => {
        const opt = $("deputy-rank-custom-opt"), box = $("deputy-rank-custom");
        $("deputy-rank-custom-wrap").hidden = !opt.selected;
        if (opt.selected) { opt.value = box.value.trim(); box.focus(); }
      });
      $("deputy-rank-custom").addEventListener("input", () => {
        $("deputy-rank-custom-opt").value = $("deputy-rank-custom").value.trim();
        $("deputy-rank").dispatchEvent(new Event("change", { bubbles: true }));
      });
      function initializeDeputyDetails() {
        loadDeputyDetails();
        $("deputy-full-name").value = deputyDetails.fullName;
        $("deputy-badge-number").value = deputyDetails.badgeNumber;
        setDeputyRankField(deputyDetails.rank);
        $("deputy-bureau").value = deputyDetails.bureau;
        $("deputy-callsign").value = deputyDetails.callsign;
        applyDeputyDetails();
      }
      $("sheriff-report-logo").src = document.querySelector(".brand .logo").src;
      $("sheriff-questions").innerHTML = Q.map(
        (t, i) =>
          `<div class="row"><label class="q"><span class="n">1.${i + 1}</span>${t}</label><div class="yn"><input type="radio" name="q${i}" id="q-yes-${i}" value="Yes"><label for="q-yes-${i}">Yes</label><input class="no" type="radio" name="q${i}" id="q-no-${i}" value="No" checked><label for="q-no-${i}">No</label></div></div>`,
      ).join("");
      $("f-sheriff").addEventListener("input", drawSheriffReport);
      $("f-sheriff").addEventListener("change", drawSheriffReport);
      function setBu(item, open) {
        item.classList.toggle("expanded", open);
        const head = item.querySelector(":scope > .nav");
        if (head) head.setAttribute("aria-expanded", open);
      }
      function toggleBu(button) {
        const item = button.closest(".bu-item"),
          open = !item.classList.contains("expanded");
        [...item.parentElement.children].forEach((sibling) => {
          if (sibling !== item && sibling.classList.contains("bu-item")) setBu(sibling, false);
        });
        setBu(item, open);
      }
      function revealBu(button) {
        let item = button && button.closest(".bu-item");
        const path = [];
        while (item) {
          path.push(item);
          item = item.parentElement.closest(".bu-item");
        }
        document.querySelectorAll(".bureaus .bu-item.expanded").forEach((open) => {
          if (!path.includes(open)) setBu(open, false);
        });
        path.forEach((entry) => setBu(entry, true));
      }
      function filt(v) {
        v = v.trim().toLocaleLowerCase();
        const buttons = [...document.querySelectorAll(".nav-group .nav")],
          byId = new Map(buttons.map((button) => [button.id, button])),
          directMatches = new Set(buttons.filter((button) => !v || button.dataset.k.includes(v))),
          ancestors = (button) => {
            const list = [];
            let parent = button.dataset.parent;
            while (parent && byId.get(parent)) {
              list.push(byId.get(parent));
              parent = byId.get(parent).dataset.parent;
            }
            return list;
          };
        document.querySelectorAll(".nav-group").forEach((group) => {
          const categoryMatches = !!v && group.dataset.group.includes(v),
            visibleButtons = new Set(directMatches);
          for (const button of directMatches) ancestors(button).forEach((p) => visibleButtons.add(p));
          if (v)
            group.querySelectorAll(".nav").forEach((button) => {
              if (ancestors(button).some((p) => p.dataset.cat && directMatches.has(p))) visibleButtons.add(button);
            });
          let visible = 0;
          group.querySelectorAll(".nav").forEach((button) => {
            const matches = !v || categoryMatches || visibleButtons.has(button);
            button.style.display = matches ? "" : "none";
            if (matches) visible++;
          });
          group.querySelectorAll(".bu-item").forEach((item) => {
            const head = item.querySelector(":scope > .nav");
            item.style.display = head && head.style.display === "none" ? "none" : "";
          });
          group.classList.toggle("searching", !!v && group.classList.contains("bureaus"));
          group.style.display = visible ? "" : "none";
        });
      }
      function data() {
        const a = Q.map((t, i) => [
          `1.${i + 1} ${t}`,
          document.querySelector(`input[name=q${i}]:checked`).value,
        ]);
        return {
          a,
          c1: $("c1").value,
          c2: $("c2").value,
          n1: $("n1").value,
          n2: $("n2").value,
          d: ((x) => (x ? x + "." : ""))(
            [[$("d1").value, $("d2").value].filter(Boolean).join(" "), $("d3").value]
              .filter(Boolean)
              .join(", "),
          ),
          s: $("d2").value,
        };
      }
      function build(k) {
        const D = data(),
          b = k === "bb";
        const B = (s) => (b ? `[b]${s}[/b]` : s);
        let o = b
          ? "[center][b][size=5]County of Los Santos\nSheriff's Department Headquarters[/size][/b]\n[b]SHERIFF'S REPORT SYSTEM[/b][/center]\n\n"
          : "SHERIFF'S REPORT SYSTEM\n\n";
        o +=
          B("SECTION 1 - QUALIFYING INFORMATION") +
          "\n" +
          D.a.map((x) => `${B(x[0])} ${x[1]}`).join("\n") +
          "\n\n";
        o +=
          B("SECTION 2 - COMPLAINANT INFORMATION") +
          `\n${B("2.1 (Reporting Party) Fullname:")} ${D.c1}\n${B("2.2 (Reporting Party) Contact Phone Number:")} ${D.c2}\n\n`;
        o +=
          B("SECTION 3 - REPORT INFORMATION") +
          `\n${B("3.1 Narrative:")}\n${D.n1}\n\n${B("3.2 Evidence:")}\n${D.n2}\n\n`;
        o += B("4 Filling Deputy:") + `\n${D.d}` + (D.s ? "\n" + (b ? `[i]${D.s}[/i]` : D.s) : "");
        return o;
      }
      function bbx() {
        const D = data(),
          sg = $("d4").value.trim();
        const cb = (v, y) => (v === y ? "[cbc][/cbc]" : "[cb][/cb]");
        const qs = D.a.map(
          (x, i) =>
            `[question=1.${i + 1},${Q[i]}]${i ? "" : " "}Yes ${cb(x[1], "Yes")}No ${cb(x[1], "No")}[/question]`,
        );
        const L = [
          "[block=1,0,black,transparent][block=0,5,black,white][center][b][size=5]County of Los Santos\nSheriff's Department Headquarters[/size][/b][/center][/block]",
          "[block=0,5,black,#084f0a]",
          "[b][size=125][center][color=#FFFFFF]SHERIFF'S REPORT SYSTEM[/color][/b][/center][/size][color=#000000][/block]",
          "[block=0,10,black,white]",
          "[block=1,2,black,transparent][size=55]SECTION 1[/size] [b]QUALIFYING INFORMATION[/b][/block]",
          "[block=1,2,black,transparent]",
          "[indent]" + qs.join("\n") + "[/indent][/block]",
          "",
          "[block=1,2,black,transparent][size=55]SECTION 2[/size] [b]COMPLAINANT INFORMATION[/b][/block]",
          "[block=1,2,black,transparent]",
          "[indent][question=2.1,(Reporting Party) Fullname]" + D.c1 + "[/question]",
          "[question=2.2,(Reporting Party) Contact Phone Number]" + D.c2 + "[/question]",
          "[/indent][/block]",
          "",
          "[block=1,2,black,transparent][size=55]SECTION 3[/size] [b]REPORT INFORMATION[/b][/block]",
          "[block=1,2,black,transparent]",
          "[indent][question=3.1,Narrative]",
          D.n1 + "[/question]",
          "",
          "[question=3.2,Evidence]",
          D.n2 + "[/question]",
          "[/indent][/block]",
          "",
          "[question=4,Filling Deputy]",
          D.d + "[/question]",
          ...(sg ? ["[img]" + sg + "[/img]"] : []),
          "",
          "[/block][/color][/block]",
        ];
        return L.join("\n");
      }
      function addUofSuspect() {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `<div class='ih'><b class='uof-suspect-label'></b><button class='b' onclick="this.closest('.item').remove();numberUofSuspects()">Remove</button></div><div class='g'><div class='f'><span>Forename Surname</span><input type='text' class='uof-suspect-name' placeholder='Forename Surname'></div><div class='f'><span>Status</span><select class='uof-suspect-status'><option value=''>Select status</option><option>Arrested</option><option>Deceased</option><option>Released</option></select></div></div>`;
        $("uof-suspects").appendChild(row);
        numberUofSuspects();
      }
      function numberUofSuspects() {
        $("uof-suspects")
          .querySelectorAll(".uof-suspect-label")
          .forEach((label, i) => (label.textContent = "Person #" + (i + 1)));
      }
      function addUofPerson(container, placeholder) {
        const row = document.createElement("div");
        row.className = "command-row";
        row.innerHTML = `<input type='text' class='uof-person-name' placeholder='${placeholder}' aria-label='${container === "employees" ? "Employee" : "Witness"} name'><button class='b' onclick="this.closest('.command-row').remove()">Remove</button>`;
        $(container === "employees" ? "uof-employees" : "uof-witnesses").appendChild(row);
      }
      // Use of Force evidence: same lettered exhibits and BBCode as the Incident Report.
      function numberUofExhibits() {
        $("uof-evidence")
          .querySelectorAll(".uof-e-label")
          .forEach((label, i) => (label.textContent = "Exhibit " + sevLetter(i)));
      }
      function addUofEvidence() {
        const row = document.createElement("div");
        row.className = "item uof-exhibit";
        row.innerHTML = `
      <div class='ih'><b class='uof-e-label'></b><button class='b' type='button' onclick="this.closest('.uof-exhibit').remove();numberUofExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='uof-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='uof-e-body' placeholder='Images, links, details…'></textarea></div>`;
        $("uof-evidence").appendChild(row);
        numberUofExhibits();
      }
      function updateUofTitle() {
        const location = $("uof-location").value.trim() || "Location",
          date = formatPickerDate($("uof-date").value, "time-date", $("uof-time").value) || "Date";
        $("uof-title").value = `UOF - ${location} / ${date}`;
      }
      function chargeTitle(id) {
        const e = $(id), c = e.value.trim() ? e._ch || [] : [];
        return c.length >= 3 ? c.map((x) => x[0]).join(", ") : e.value.trim();
      }
      function updateIncidentTitle() {
        const charge = chargeTitle("i2") || "Charge or Description",
          location = $("i3").value.trim() || "Location",
          date = formatPickerDate($("i1").value, "time-date", $("incident-time").value) || "Date";
        $("incident-title").value = `IR - ${charge} / ${location} / ${date}`;
      }
      function updateSubjectTitle() {
        const first = $("subject-first").value.trim() || "Firstname",
          last = $("subject-last").value.trim() || "Lastname";
        $("subject-title").value = `${first} ${last}`;
      }
      function buildSubject() {
        const val = (id) => $(id).value.trim(),
          checked = (id) => ($(id).checked ? "[cbc][/cbc]" : "[cb][/cb]"),
          cell = (value) => `[td]${value}[/td]`,
          row = (values) => `[table=Times New][tr]${values.map(cell).join("")}[/tr][/table]`,
          section = (title) => `[table=Times New][tr][td][b]${title}[/b][/td][/tr][/table]`,
          fullName = ["subject-last", "subject-first", "subject-middle"]
            .map(val)
            .filter(Boolean)
            .join(", ");
        const marks = (label) =>
          `${checked(`subject-${label}-left`)}L ${checked(`subject-${label}-right`)}R ${label === "face" ? "Face/Head/Neck" : label.charAt(0).toUpperCase() + label.slice(1)}: ${val(`subject-${label}-detail`)}`;
        const dateInfo = ["subject-date", "subject-time", "subject-road", "subject-unit"].map(
          (id, i) => {
            const value = id === "subject-date" ? formatTaskListDate(val(id)) : val(id);
            return `[b]${["DATE", "TIME", "ROAD", "UNIT"][i]}[/b]${value ? "\n" + value : ""}`;
          },
        );
        const demographics = ["SEX", "RACE", "DOB", "HT", "WT", "EYES", "HAIR"].map(
          (label, i) =>
            `[b]${label}[/b] ${val(["subject-sex", "subject-race", "subject-dob", "subject-height", "subject-weight", "subject-eyes", "subject-hair"][i])}`,
        );
        return [
          "[table=Times New][tr][td][center][b][size=130]LSSD SUBJECT INFORMATION SYSTEM FORMAT[/size][/b][/center][/td][/tr][/table]",
          row(dateInfo),
          section("F.I INFORMATION"),
          `[table=Times New][tr][td][b]NAME [i](Last, First, Middle)[/i][/b]\n${fullName}[/td][/tr][/table]`,
          `[table=Times New][tr][td][b]RESIDENCE ADDRESS[/b]\n${val("subject-address")}[/td][/tr][/table]`,
          row([
            `[b]PHONE:[/b] ${val("subject-phone")}`,
            `[b]MONIKER[/b] ${val("subject-moniker")}`,
          ]),
          row(demographics),
          `[table=Times New][tr][td][b]GANG/CLIQUE[/b] ${val("subject-gang")} [float=right][b]Known[/b] ${checked("subject-gang-known")} [b]Suspected[/b] ${checked("subject-gang-suspected")} [b]Affiliate[/b] ${checked("subject-gang-affiliate")}[/float][/td][/tr][/table]`,
          `[table=Times New][tr][td][b]TATTOOS/SCARS/MARKS/ODDITIES[/b]\n${marks("arm")}\n${marks("face")}\n${marks("hand")}\n${marks("leg")}\n${marks("other")}[/td][/tr][/table]`,
          section("VEHICLE INFORMATION"),
          row([
            "[b]MAKE[/b] " + val("subject-vehicle-make"),
            "[b]MODEL[/b] " + val("subject-vehicle-model"),
            "[b]COLOR[/b] " + val("subject-vehicle-color"),
            "[b]LICENSE #[/b] " + val("subject-vehicle-license"),
          ]),
          row([
            "[b]ODDITIES/COMMENTS/REGISTERED OWNER/or VIN#[/b]\n" + val("subject-vehicle-notes"),
          ]),
        ].join("\n");
      }
      function resetSubject() {
        const form = $("f-subject");
        form.querySelectorAll("input[type=text],textarea").forEach((field) => (field.value = ""));
        form.querySelectorAll("input[type=checkbox]").forEach((field) => (field.checked = false));
        $("subject-date").value = taskListTodayDate();
        updateTaskListDateLabel("subject-date");
        updateSubjectTitle();
      }
      function nextTcCode(container, selector, prefix) {
        let max = 0;
        $(container)
          .querySelectorAll(selector)
          .forEach((input) => {
            const match = input.value.trim().match(new RegExp(`^${prefix}(\\d+)$`, "i"));
            if (match) max = Math.max(max, Number(match[1]));
          });
        return `${prefix}${max + 1}`;
      }
      function addTcPerson(code = nextTcCode("tc-people", ".tc-person-code", "D")) {
        const row = document.createElement("div");
        row.className = "tc-people-row item";
        row.innerHTML = `<label class='f'><span>Code</span><input type='text' class='tc-person-code' value='${code}'></label><label class='f'><span>Last name</span><input type='text' class='tc-person-last'></label><label class='f'><span>First name</span><input type='text' class='tc-person-first'></label><label class='f'><span>Sex</span><input type='text' class='tc-person-sex'></label><label class='f'><span>Age</span><input type='text' class='tc-person-age'></label><label class='f'><span>Belted</span><select class='tc-person-belted'><option value=''></option><option>Y</option><option>N</option></select></label><label class='f'><span>Status</span><select class='tc-person-status'><option value=''></option><option>UNHARMED</option><option>INJURED</option><option>SEVERELY INJURED</option><option>DECEASED</option></select></label><button class='b' type='button' aria-label='Remove person' onclick="this.closest('.tc-people-row').remove()">Remove</button>`;
        $("tc-people").appendChild(row);
      }
      function addTcVehicle(code = nextTcCode("tc-vehicles", ".tc-vehicle-code", "V")) {
        const row = document.createElement("div");
        row.className = "tc-vehicle-row item";
        row.innerHTML = `<label class='f'><span>Code</span><input type='text' class='tc-vehicle-code' value='${code}'></label><label class='f'><span>Driver</span><input type='text' class='tc-vehicle-driver'></label><label class='f'><span>Passengers</span><input type='text' class='tc-vehicle-passengers'></label><label class='f'><span>Tag</span><input type='text' class='tc-vehicle-tag'></label><label class='f'><span>Color</span><input type='text' class='tc-vehicle-color'></label><label class='f'><span>Model</span><input type='text' class='tc-vehicle-model'></label><label class='f'><span>Damage</span><select class='tc-vehicle-damage'><option value=''></option><option>FUNCTIONAL</option><option>DISABLED</option></select></label><label class='f'><span>Towed</span><select class='tc-vehicle-towed'><option value=''></option><option>Y</option><option>N</option></select></label><button class='b' type='button' aria-label='Remove vehicle' onclick="this.closest('.tc-vehicle-row').remove()">Remove</button>`;
        $("tc-vehicles").appendChild(row);
      }
      function formatTcDate(value) {
        return formatPickerDate(value, "short") || "ZZ/LLL/YYYY";
      }
      function updateTcTitle() {
        const date = formatTcDate($("tc-date").value),
          location = $("tc-location").value.trim() || "Location of Collision";
        $("tc-title").value = `${$("tc-title-type").value}-${date} ${location}`;
      }
      function buildTc() {
        const val = (row, selector) => row.querySelector(selector).value.trim(),
          cell = (value) => `[td][size=85]${value}[/size][/td]`,
          header = (labels) =>
            `[tr]${labels.map((label) => `[td][size=85][b]${label}[/b][/size][/td]`).join("")}[/tr]`,
          table = (labels, rows) =>
            `[table=Arial]${header(labels)}\n${rows.map((row) => `[tr]${row.map(cell).join("")}[/tr]`).join("\n")}\n[/table]`;
        const people = [...document.querySelectorAll("#tc-people .tc-people-row")].map((row) =>
          [
            "tc-person-code",
            "tc-person-last",
            "tc-person-first",
            "tc-person-sex",
            "tc-person-age",
            "tc-person-belted",
            "tc-person-status",
          ].map((selector) => val(row, "." + selector)),
        );
        const vehicles = [...document.querySelectorAll("#tc-vehicles .tc-vehicle-row")].map((row) =>
          [
            "tc-vehicle-code",
            "tc-vehicle-driver",
            "tc-vehicle-passengers",
            "tc-vehicle-tag",
            "tc-vehicle-color",
            "tc-vehicle-model",
            "tc-vehicle-damage",
            "tc-vehicle-towed",
          ].map((selector) => val(row, "." + selector)),
        );
        const info = [
          ["LOCATION OF COLLISION", $("tc-location").value.trim()],
          ["DATE OF COLLISION", formatPickerDate($("tc-date").value, "short") || "DD/MMM/YYYY"],
          ["TIME OF COLLISION", $("tc-time").value.trim()],
        ];
        const staff = [
          ["PREPARED BY", $("tc-prepared-by").value.trim()],
          ["EMPLOYEE #", $("tc-employee").value.trim()],
          ["STATION/UNIT", $("tc-station").value.trim()],
          ["UNIT/CAR #", $("tc-car").value.trim()],
        ];
        return [
          "[divbox=white][center][lssdheader][/lssdheader][/center]",
          "",
          "[b][center]Traffic Collision Report Form[/center][/b]",
          "",
          `[center][size=150]${$("tc-title-type").value}-${formatTcDate($("tc-date").value)}[/size][/center]`,
          "[hr][/hr]",
          table(
            ["LOCATION OF COLLISION", "DATE OF COLLISION", "TIME OF COLLISION"],
            [info.map((item) => item[1])],
          ),
          "[b][center]INVOLVED PEOPLE[/center][/b]",
          "[center][size=87]CODES: D - DRIVER (1, 2, 3) / W - WITNESS (1, 2, 3) / P - PASSENGER (1, 2, 3) / PED - PEDESTRIAN (1, 2, 3)[/size][/center]",
          "",
          table(["CODE", "L. NAME", "F. NAME", "SEX", "AGE", "BELTED", "STATUS"], people),
          "[b][center]INVOLVED VEHICLES[/center][/b]",
          "[center][size=87]CODES: V - VEHICLE (1, 2, 3)[/size][/center]",
          "",
          table(
            ["CODE", "DRIVER", "PASSENGERS", "TAG", "COLOR", "MODEL", "DAMAGE", "TOWED"],
            vehicles,
          ),
          "",
          "[olddivbox=white][center][size=85][b]NARRATIVE[/b][/size][/center]",
          "",
          `[size=85]${$("tc-narrative").value.trim()}[/size]`,
          "[/olddivbox]",
          "",
          "[olddivbox=white][center][size=85][b]ATTACHED EVIDENCE[/b][/size][/center]",
          "",
          `[size=85]${$("tc-evidence").value.trim()}[/size]`,
          "[/olddivbox]",
          "",
          table(
            ["PREPARED BY", "EMPLOYEE #", "STATION/UNIT", "UNIT/CAR #"],
            [staff.map((item) => item[1])],
          ),
          "[hr][/hr]",
          "[/divbox]",
        ].join("\n");
      }
      function resetTc() {
        [
          "tc-location",
          "tc-date",
          "tc-time",
          "tc-narrative",
          "tc-evidence",
          "tc-prepared-by",
          "tc-employee",
          "tc-car",
        ].forEach((id) => ($(id).value = ""));
        updateTaskListDateLabel("tc-date");
        $("tc-title-type").value = "TC";
        $("tc-station").value = "TRAFFIC SERVICES";
        $("tc-people").innerHTML = "";
        $("tc-vehicles").innerHTML = "";
        addTcPerson("D1");
        addTcPerson("D2");
        addTcVehicle("V1");
        addTcVehicle("V2");
        applyDeputyDetails();
        updateTcTitle();
      }
      function buildLab() {
        const val = (id) => $(id).value.trim();
        const answer = (name) => {
          const selected = document.querySelector(`input[name="${name}"]:checked`),
            marker = (value) =>
              selected && selected.value === value ? "[cbc][/cbc]" : "[cb][/cb]";
          return "Yes " + marker("Yes") + " No " + marker("No");
        };
        return [
          `[b]Name:[/b] ${val("lab-name")}`,
          `[b]Rank:[/b] ${val("lab-rank")}`,
          `[b]Division or Bureau/Detail/Team:[/b] ${val("lab-division")}`,
          "",
          `[b]Article(s) of Evidence:[/b] ${val("lab-evidence")}`,
          `[b]Evidence Locker:[/b] ${val("lab-locker")}`,
          `[b]Evidence Entry #:[/b] ${val("lab-entry")}`,
          `[b]Casefile / Incident Report Link:[/b] ${val("lab-case-link")}`,
          `[b]Suspect(s) in 48-hour hold?[/b] ${answer("lab-hold")}`,
          "",
          `[b]Request Details:[/b] ${val("lab-request-details")}`,
          `[b](( Can you see the SSB reports section?: ))[/b] ${answer("lab-ssb")}`,
          `[b]OOC Details:[/b] ${val("lab-ooc-details")}`,
        ].join("\n");
      }
      function resetLab() {
        const form = $("f-lab");
        form.querySelectorAll("input[type=text],textarea").forEach((field) => (field.value = ""));
        form.querySelectorAll("select").forEach((field) => (field.selectedIndex = 0));
        form.querySelectorAll("input[type=radio]").forEach((field) => (field.checked = false));
        applyDeputyDetails();
      }
      function resetFleet() {
        $("fleet-station").selectedIndex = 0;
        $("fleet-plate").value = "";
        $("fleet-service").selectedIndex = 0;
      }
      function buildDigitalForensics() {
        const val = (id) => $(id).value.trim(),
          answer = (name) => {
            const selected = document.querySelector(`input[name="${name}"]:checked`),
              marker = (value) =>
                selected && selected.value === value ? "[cbc][/cbc]" : "[cb][/cb]";
            return "Yes " + marker("Yes") + " No " + marker("No");
          };
        return [
          `[b]Name:[/b] ${val("dfr-name")}`,
          `[b]Rank:[/b] ${val("dfr-rank")}`,
          `[b]Division or Bureau/Detail/Team:[/b] ${val("dfr-division")}`,
          "",
          `[b]Article(s) of Evidence:[/b] ${val("dfr-evidence")}`,
          `[b]Evidence Locker:[/b] ${val("dfr-locker")}`,
          `[b]Evidence Entry #:[/b] ${val("dfr-entry")}`,
          `[b]Casefile / Incident Report Link:[/b] ${val("dfr-case-link")}`,
          `[b]Link to Electronic Search Warrant:[/b] ${val("dfr-warrant-link")}`,
          `[b]Suspect(s) in 48-hour hold?[/b] ${answer("dfr-hold")}`,
          "",
          `[b]Request Details:[/b] ${val("dfr-request-details")}`,
          `[b](( Can you see the SSB reports section?: ))[/b] ${answer("dfr-ssb")}`,
          `[b]OOC Details:[/b] ${val("dfr-ooc-details")}`,
        ].join("\n");
      }
      function resetDforensics() {
        const form = $("f-dforensics");
        form.querySelectorAll("input[type=text],textarea").forEach((field) => (field.value = ""));
        form.querySelectorAll("select").forEach((field) => (field.selectedIndex = 0));
        form.querySelectorAll("input[type=radio]").forEach((field) => (field.checked = false));
        applyDeputyDetails();
      }
      // Auto-growing text boxes (NCCIT Personnel File + Supplemental). Each box starts at its
      // compact default height, grows as text is added, stops at its max-height and then
      // scrolls inside itself, so a very long entry never stretches the page.
      function growTextarea(el) {
        if (!el.offsetParent) return;
        const sy = window.scrollY;
        el.style.height = "0px";
        const cs = getComputedStyle(el),
          border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth),
          max = parseFloat(cs.maxHeight) || 380,
          need = el.scrollHeight + border;
        el.style.height = Math.min(need, max) + "px";
        el.style.overflowY = need > max ? "auto" : "hidden";
        if (window.scrollY !== sy) window.scrollTo(window.scrollX, sy);
      }
      function growAllTextareas(formId) {
        document.querySelectorAll(`#${formId} textarea`).forEach(growTextarea);
      }
      ["f-nccit", "f-nccit-supp"].forEach((id) => {
        $(id).addEventListener("input", (e) => {
          if (e.target.matches("textarea")) growTextarea(e.target);
        });
      });
      addEventListener("resize", () => {
        ["f-nccit", "f-nccit-supp"].forEach((id) => !$(id).hidden && growAllTextareas(id));
      });
      function updateNcCitTitle() {
        $("nccit-title").value = "[NC-CIT] " + $("nccit-name").value.trim().toLocaleUpperCase();
      }
      function addNcCitFocus() {
        const row = document.createElement("div");
        row.className = "item nccit-focus-row";
        row.innerHTML = `<div class='ih'><b class='nccit-focus-label'></b><button class='b nccit-remove' type='button' aria-label='Remove focus entry' title='Remove focus' onclick="removeNcCitRow(this,'focus')">−</button></div><div class='g'><label class='f'><span>Name / Location</span><input type='text' class='nccit-focus-name'></label><label class='f'><span>Reason</span><textarea class='nccit-focus-reason'></textarea></label><label class='f'><span>Notes</span><textarea class='nccit-focus-notes'></textarea></label></div>`;
        $("nccit-focus-list").appendChild(row);
        numberNcCitRows("focus");
      }
      function addNcCitIr(kind) {
        const row = document.createElement("div");
        row.className = "nccit-ir-row";
        row.dataset.kind = kind;
        row.innerHTML = `<label class='f'><span class='nccit-ir-number-label'></span><input type='text' class='nccit-ir-number'></label><label class='f'><span class='nccit-ir-link-label'></span><input type='text' class='nccit-ir-link'></label><label class='f'><span class='nccit-ir-status-label'></span><input type='text' class='nccit-ir-status'></label><button class='b nccit-remove' type='button' aria-label='Remove IR' title='Remove IR' onclick="removeNcCitRow(this,'ir')">−</button>`;
        $(`nccit-${kind}-ir-list`).appendChild(row);
        numberNcCitRows(kind);
      }
      function removeNcCitRow(button, kind) {
        const row = button.closest(kind === "focus" ? ".nccit-focus-row" : ".nccit-ir-row"),
          container = kind === "focus" ? "nccit-focus-list" : `nccit-${row.dataset.kind}-ir-list`;
        if ($(container).children.length <= 1) return;
        row.remove();
        numberNcCitRows(kind === "focus" ? "focus" : row?.dataset.kind);
      }
      function numberNcCitRows(kind) {
        const rows =
          kind === "focus"
            ? [...document.querySelectorAll("#nccit-focus-list .nccit-focus-row")]
            : [...document.querySelectorAll(`#nccit-${kind}-ir-list .nccit-ir-row`)];
        rows.forEach((row, index) => {
          const number = index + 1;
          if (kind === "focus")
            row.querySelector(".nccit-focus-label").textContent = `Focus Entry ${number}`;
          else {
            row.querySelector(".nccit-ir-number-label").textContent = `IR #${number}`;
            row.querySelector(".nccit-ir-link-label").textContent = `IR #${number} Link`;
            row.querySelector(".nccit-ir-status-label").textContent = `IR #${number} Status`;
          }
          const remove = row.querySelector(".nccit-remove");
          remove.disabled = rows.length === 1;
          remove.setAttribute(
            "aria-label",
            `Remove ${kind === "focus" ? "focus entry" : "IR " + number}`,
          );
        });
      }
      function initializeNcCitRows() {
        ["nccit-focus-list", "nccit-active-ir-list", "nccit-self-ir-list"].forEach((id) =>
          $(id).replaceChildren(),
        );
        addNcCitFocus();
        addNcCitFocus();
        addNcCitIr("active");
        addNcCitIr("active");
        addNcCitIr("self");
        addNcCitIr("self");
      }
      function buildNcCit() {
        const val = (field) => (typeof field === "string" ? $(field) : field).value.trim(),
          focus = [...document.querySelectorAll("#nccit-focus-list .nccit-focus-row")].map(
            (row) =>
              `[*][b]Name / Location:[/b] ${val(row.querySelector(".nccit-focus-name"))}\n[b]Reason:[/b] ${val(row.querySelector(".nccit-focus-reason"))}\n[b]Notes:[/b] ${val(row.querySelector(".nccit-focus-notes"))}`,
          ),
          irs = (kind) =>
            [...document.querySelectorAll(`#nccit-${kind}-ir-list .nccit-ir-row`)].map((row) => {
              const number = val(row.querySelector(".nccit-ir-number")),
                link = val(row.querySelector(".nccit-ir-link")),
                status = val(row.querySelector(".nccit-ir-status"));
              return `[*][url=${link || "link"}]${number || "IR#"}[/url] – ${status}`;
            });
        return [
          "[block=0,30,transparent,white]",
          "[center][b]NC-CIT DEPUTY ACTIVITY & INVESTIGATION LOG[/b][/center]",
          "",
          "[hr]",
          "",
          "[b]DEPUTY INFORMATION[/b]",
          "[list]",
          `[*][b]Name:[/b] ${val("nccit-name")}`,
          `[*][b]Rank:[/b] ${val("nccit-rank")}`,
          `[*][b]Callsign:[/b] ${val("nccit-callsign")}`,
          `[*][b]Assignment Status:[/b] ${val("nccit-status")}`,
          "[/list]",
          "",
          "[hr]",
          "",
          "[b]CURRENT INVESTIGATIVE FOCUS[/b]",
          "[i]List any individuals, groups, or locations you are actively monitoring[/i]",
          "",
          "[list]",
          ...focus,
          "[/list]",
          "",
          "[hr]",
          "",
          "[b]ACTIVE IRs[/b]",
          "[list]",
          ...irs("active"),
          "[/list]",
          "",
          "[b]SELF-INITIATED IRs[/b]",
          "[list]",
          ...irs("self"),
          "[/list]",
          "",
          "[hr]",
          "",
          "[/block]",
        ].join("\n");
      }
      function buildNcCitSupp() {
        const val = (id) => $(id).value.trim(),
          date = formatPickerDate(val("nccit-supp-date"), "short") || "DD/MMM/YYYY",
          handledIrs = val("nccit-supp-irs")
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean);
        return [
          "[block=0,30,transparent,white]",
          "",
          "[hr]",
          `[b]DATE:[/b] ${date}`,
          `[b]CALLSIGN:[/b] ${val("nccit-supp-callsign")}`,
          "",
          "[list]",
          `[*][b]Activity:[/b] ${val("nccit-supp-activity")}`,
          `Narrative (Brief summary of what you worked on)`,
          `[*][b]Investigative Actions:[/b] ${val("nccit-supp-actions")}`,
          `(Surveillance, contacts, follow-ups, etc.)`,
          `[*][b]IRs Handled:[/b]`,
          "[list]",
          ...(handledIrs.length
            ? handledIrs.map((item) => "[*]" + item)
            : ["(Include IR numbers if applicable)"]),
          "[/list]",
          `[*][b]Notes:[/b] ${val("nccit-supp-notes")}`,
          `Any relevant intel or observations`,
          "[/list]",
          "",
          "[hr]",
          "",
          "[b]NOTES[/b]",
          "[i]Use this section to track anything important for future investigations[/i]",
          "[list]",
          `[*]${val("nccit-supp-future-notes")}`,
          "[/list]",
          "",
          "[/block]",
        ].join("\n");
      }
      function buildEmailTemplate() {
        const val = (id) => $(id).value.trim(),
          join = (...parts) => parts.filter(Boolean).join(", "),
          body = val("email-body") || "_\n_\n_\n_",
          image = val("email-signature");
        return [
          `[depcor=${join(val("email-deputy-name"), val("email-rank"))}|${val("email-unit")}|${join(val("email-recipient-name"), val("email-recipient-rank"))}|${val("email-recipient-station")}|${val("email-title")}]`,
          "",
          body,
          "",
          val("email-closing"),
          ...(image ? [`[img]${image}[/img]`] : []),
          val("email-deputy-name"),
          join(val("email-sig-title"), val("email-bureau")),
          "[/depcor]",
        ].join("\n");
      }
      function emailTodayDate() {
        return taskListTodayDate();
      }
      function initializeEmailDate() {}
      function resetEmail() {
        [
          "email-deputy-name",
          "email-rank",
          "email-unit",
          "email-recipient-name",
          "email-recipient-rank",
          "email-recipient-station",
          "email-title",
          "email-body",
          "email-signature",
          "email-sig-title",
          "email-bureau",
        ].forEach((id) => ($(id).value = ""));
        $("email-closing").value = "Kind regards,";
        applyDeputyDetails();
      }
      const depmailAddresses = {
        "Hall of Justice": "100 Innocence Boulevard, City of Davis, SA 90012",
        "Davis Station": "300 Innocence Boulevard, City of Davis, SA 90220",
        "Senora Station": "501 Joshua Road, Sandy Shores, SA 90021",
        "Eugene Biskarrat Regional Training Center": "1060 Greenwich Parkway, Los Santos, SA 90220",
      };
      function buildDepmail() {
        const val = (id) => $(id).value.trim(),
          name = val("depmail-name"),
          date = formatPickerDate(val("depmail-date")),
          rankLine = [val("depmail-rank"), val("depmail-bureau")].filter(Boolean).join(", ");
        return [
          `[depmail=${name}|${date}|${val("depmail-recipient")}|${val("depmail-cc") || "-"}|${val("depmail-title")}|${val("depmail-priority")}]`,
          "",
          val("depmail-body"),
          "",
          "[font=times]" + `[b]${name}[/b]`,
          `${rankLine}[aligntable=right,0,0,40,0,0,0][/aligntable]`,
          depmailAddresses[$("depmail-address").value],
          "[/font]",
          "[/depmail]",
        ].join("\n");
      }
      function resetDepmail() {
        [
          "depmail-name",
          "depmail-recipient",
          "depmail-cc",
          "depmail-title",
          "depmail-body",
          "depmail-rank",
          "depmail-bureau",
        ].forEach((id) => ($(id).value = ""));
        $("depmail-priority").value = "Normal";
        $("depmail-address").selectedIndex = 0;
        $("depmail-date").value = emailTodayDate();
        updateTaskListDateLabel("depmail-date");
        applyDeputyDetails();
      }
      function initializeDepmail() {
        if (!$("depmail-date").value) $("depmail-date").value = emailTodayDate();
      }
      function addArrestEvidence() {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `<div class='eg'><textarea class='arrest-evidence-item' placeholder='Describe evidence discovered'></textarea><button class='b' type='button' aria-label='Remove evidence' onclick="this.closest('.item').remove()">−</button></div>`;
        $("arrest-evidence").appendChild(row);
      }
      function waEscape(value) {
        return String(value || "").replace(
          /[&<>"]/g,
          (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
        );
      }
      function waText(value, fallback) {
        const text = String(value || "").trim();
        return text || fallback;
      }
      function waParagraph(value, fallback) {
        const text = String(value || "").trim();
        if (!text)
          return `<span class="wa-muted">${waEscape(fallback || "[Not provided]")}</span>`;
        return waEscape(text).replace(/\r?\n/g, "<br>");
      }
      function waEm(value, fallback) {
        const text = String(value || "").trim();
        if (!text) return `<span class="wa-muted">${waEscape(fallback || "[Not provided]")}</span>`;
        return `<span class="wa-em">${waEscape(text)}</span>`;
      }
      function waCharges(crimes) {
        const parts = String(crimes || "")
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        if (!parts.length)
          return `<div class="wa-charges"><span class="wa-muted">[No charges selected]</span></div>`;
        return `<div class="wa-charges">${parts
          .map((part) => `<div class="wa-charge">${waEscape(part)}</div>`)
          .join("")}</div>`;
      }
      function waEvidence(items) {
        if (!items.length)
          return `<p class="wa-muted" style="margin:0">[No evidence listed]</p>`;
        return `<ul style="margin:0.35em 0 0">${items
          .map((item) => `<li>${waParagraph(item)}</li>`)
          .join("")}</ul>`;
      }
      function waHeader(title) {
        return `<div class="wa-head"><div class="wa-agency">County of Los Santos</div><div class="wa-dept">Sheriff's Department</div><h3 class="wa-title">${waEscape(title)}</h3></div>`;
      }
      function waSignature(name, rank, date) {
        return `<div class="wa-sig"><div class="wa-sig-name">${waText(name, "[Affiant Name]")}</div><p class="wa-sig-line">${waText(rank, "[Rank]")}</p><p class="wa-sig-line">Los Santos County Sheriff's Department</p><div class="wa-date">Dated: ${waText(date, "DD MONTH YYYY")}</div></div>`;
      }
      function waEvidenceFoot(items) {
        return `<div class="wa-evidence-foot"><div class="wa-label">Evidence Discovered</div>${waEvidence(items)}</div>`;
      }
      function buildArrestWarrant() {
        const val = (id) => $(id).value.trim(),
          date = formatPickerDate(val("arrest-date"), "caps") || "DD MONTH YYYY",
          evidence = [...document.querySelectorAll(".arrest-evidence-item")]
            .map((field) => field.value.trim())
            .filter(Boolean),
          crimes = val("arrest-crimes") || "[No charges selected]",
          suspect = val("arrest-suspect") || "[Suspect]",
          rank = val("arrest-rank") || "[Rank]",
          name = val("arrest-deputy-name") || "[Affiant Name]",
          badge = val("arrest-badge") || "N/A",
          bureau = val("arrest-bureau") || "[Bureau]",
          years = val("arrest-years") || "[years]";
        return [
          "AFFIDAVIT IN SUPPORT OF ARREST WARRANT",
          "County of Los Santos — Sheriff's Department",
          "",
          `I, ${rank} ${name} (#${badge}), am a peace officer employed with the Los Santos County Sheriff's Department, currently assigned to ${bureau}. I have been employed by this agency for ${years} years and have extensive experience in crime scene investigations, including crime scene processing, evidence collection, interview procedures, and preliminary field investigations.`,
          "",
          `I submit this affidavit in support of an Arrest Warrant for ${suspect}. This request is based on an ongoing investigation into the following crimes:`,
          crimes
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => `• ${part}`)
            .join("\n") || "• [No charges selected]",
          "",
          "PROBABLE CAUSE",
          val("arrest-probable-cause") || "[Not provided]",
          "",
          `Based on the facts and probable cause set forth above, I respectfully request that this Court issue an Arrest Warrant for ${suspect} for violation of ${crimes}.`,
          "",
          "I declare under penalty of perjury that the foregoing is true and correct.",
          "",
          name,
          rank,
          "Los Santos County Sheriff's Department",
          `DATED: ${date}`,
          "",
          "",
          "EVIDENCE DISCOVERED",
          ...(evidence.length ? evidence.map((item) => `• ${item}`) : ["• [No evidence listed]"]),
        ].join("\n");
      }
      function updateArrestPreview() {
        const val = (id) =>
            id === "arrest-date"
              ? formatPickerDate($(id).value, "caps") || "DD MONTH YYYY"
              : $(id).value.trim(),
          evidence = [...document.querySelectorAll(".arrest-evidence-item")]
            .map((field) => field.value.trim())
            .filter(Boolean),
          years = val("arrest-years") || "[years]";
        $("arrest-preview").innerHTML =
          waHeader("Affidavit in Support of Arrest Warrant") +
          `<p>I, ${waEm(val("arrest-rank"), "[Rank]")} ${waEm(val("arrest-deputy-name"), "[Affiant Name]")} (${waEm("#" + (val("arrest-badge") || "N/A"))}), am a peace officer employed with the Los Santos County Sheriff's Department, currently assigned to ${waEm(val("arrest-bureau"), "[Bureau]")}. I have been employed by this agency for ${waEm(years)} years and have extensive experience in crime scene investigations, including crime scene processing, evidence collection, interview procedures, and preliminary field investigations.</p>` +
          `<p>I submit this affidavit in support of an Arrest Warrant for ${waEm(val("arrest-suspect"), "[Suspect]")}. This request is based on an ongoing investigation into the following crimes:</p>` +
          waCharges(val("arrest-crimes")) +
          `<div class="wa-label">Probable Cause</div><div class="wa-body">${waParagraph(val("arrest-probable-cause"))}</div>` +
          `<p>Based on the facts and probable cause set forth above, I respectfully request that this Court issue an Arrest Warrant for ${waEm(val("arrest-suspect"), "[Suspect]")} for violation of the listed charges.</p>` +
          `<p class="wa-jurat">I declare under penalty of perjury that the foregoing is true and correct.</p>` +
          waSignature(val("arrest-deputy-name"), val("arrest-rank"), val("arrest-date")) +
          waEvidenceFoot(evidence);
      }

      function buildWarrantClipboardHtml(preview) {
        const clone = preview.cloneNode(true);
        clone.removeAttribute("id");
        const originals = [preview, ...preview.querySelectorAll("*")];
        const copies = [clone, ...clone.querySelectorAll("*")];
        const keep = new Set(["color","font-family","font-size","font-weight","font-style","font-variant","font-stretch","letter-spacing","word-spacing","line-height","text-align","text-transform","text-decoration-line","text-decoration-style","text-decoration-color","text-indent","white-space","padding-top","padding-right","padding-bottom","padding-left","margin-top","margin-right","margin-bottom","margin-left","border-top-width","border-top-style","border-top-color","border-right-width","border-right-style","border-right-color","border-bottom-width","border-bottom-style","border-bottom-color","border-left-width","border-left-style","border-left-color","border-top-left-radius","border-top-right-radius","border-bottom-right-radius","border-bottom-left-radius","list-style-type","list-style-position"]);
        const toRgb = (value) => {
          const m = String(value).match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
          if (!m) return value;
          const f = (x) => Math.round(parseFloat(x) * 255);
          return `rgb(${f(m[1])}, ${f(m[2])}, ${f(m[3])})`;
        };
        copies.forEach((node, index) => {
          const source = originals[index];
          if (!source) return;
          const computed = getComputedStyle(source);
          for (let i = 0; i < computed.length; i++) {
            const property = computed[i];
            if (!keep.has(property)) continue;
            if (/^border-(top|right|bottom|left)-color$/.test(property)) {
              const side = property.match(/^border-(top|right|bottom|left)-color$/)[1];
              if (computed.getPropertyValue("border-" + side + "-style") === "none") continue;
            }
            let value = computed.getPropertyValue(property);
            if (/^color\(/.test(value)) value = toRgb(value);
            if (value && value !== "normal" && value !== "none" && value !== "0px" && value !== "0px 0px" && value !== "medium" && value !== "auto") node.style.setProperty(property, value);
          }
          node.removeAttribute("class");
          node.removeAttribute("contenteditable");
          node.removeAttribute("draggable");
        });
        clone.style.cssText += ";display:block;width:100%;max-width:760px;margin:0;padding:0;border:0;border-radius:0;color:#e8e4d6;font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.6;";
        return clone.outerHTML;
      }
      function fallbackCopyHtml(html) {
        const holder = document.createElement("div");
        holder.contentEditable = "true";
        holder.style.cssText = "position:fixed;left:-10000px;top:0;width:760px;";
        holder.innerHTML = html;
        document.body.appendChild(holder);
        const selection = getSelection();
        const range = document.createRange();
        range.selectNodeContents(holder);
        selection.removeAllRanges();
        selection.addRange(range);
        const copied = document.execCommand("copy");
        selection.removeAllRanges();
        holder.remove();
        if (!copied) throw new Error("Rich-text clipboard copy was rejected");
      }

      async function copyArrestWarrant() {
        const preview = $("arrest-preview"),
          plain = buildArrestWarrant(),
          html = buildWarrantClipboardHtml(preview);
        let clipboardError;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([plain], { type: "text/plain" }),
              }),
            ]);
            toast("Copied!");
            return;
          }
        } catch (error) {
          clipboardError = error;
        }
        try {
          fallbackCopyHtml(html);
          toast("Copied!");
        } catch (error) {
          console.error("Could not copy the formatted arrest warrant:", clipboardError || error);
          toast("Copy failed");
        }
      }
      function initializeArrestWarrant() {
        if (!$("arrest-date").value) $("arrest-date").value = emailTodayDate();
        if (!$("arrest-evidence").children.length) addArrestEvidence();
        updateArrestPreview();
      }
      function resetArrestWarrant() {
        [
          "arrest-rank",
          "arrest-deputy-name",
          "arrest-badge",
          "arrest-bureau",
          "arrest-years",
          "arrest-suspect",
          "arrest-crimes",
          "arrest-probable-cause",
        ].forEach((id) => ($(id).value = ""));
        $("arrest-date").value = emailTodayDate();
        updateTaskListDateLabel("arrest-date");
        $("arrest-evidence").replaceChildren();
        addArrestEvidence();
        applyDeputyDetails();
        updateArrestPreview();
      }
      function addSearchEvidence() {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `<div class='eg'><textarea class='search-evidence-item' placeholder='Describe evidence discovered'></textarea><button class='b' type='button' aria-label='Remove evidence' onclick="this.closest('.item').remove()">−</button></div>`;
        $("search-evidence").appendChild(row);
      }
      function buildSearchWarrant() {
        const val = (id) =>
            id === "search-date"
              ? formatPickerDate($(id).value, "caps") || "DD MONTH YYYY"
              : $(id).value.trim(),
          evidence = [...document.querySelectorAll(".search-evidence-item")]
            .map((field) => field.value.trim())
            .filter(Boolean),
          crimes = val("search-crimes") || "[No charges selected]",
          property = val("search-property") || "[Property / location]",
          scope = val("search-scope") || "[Items to be seized]",
          rank = val("search-rank") || "[Rank]",
          name = val("search-deputy-name") || "[Affiant Name]",
          badge = val("search-badge") || "N/A",
          bureau = val("search-bureau") || "[Bureau]",
          years = val("search-years") || "[years]";
        return [
          "AFFIDAVIT IN SUPPORT OF SEARCH WARRANT",
          "County of Los Santos — Sheriff's Department",
          "",
          `I, ${rank} ${name} (#${badge}), am a peace officer employed with the Los Santos County Sheriff's Department, currently assigned to ${bureau}. I have been employed by this agency for ${years} years and have extensive experience in crime scene investigations, including crime scene processing, evidence collection, interview procedures, and preliminary field investigations.`,
          "",
          `I submit this affidavit in support of a Search Warrant for ${property}. This request is based on an ongoing investigation into the following crimes:`,
          crimes
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => `• ${part}`)
            .join("\n") || "• [No charges selected]",
          "",
          "PROBABLE CAUSE",
          val("search-probable-cause") || "[Not provided]",
          "",
          `Based on the information contained in this affidavit, I respectfully request that this Court issue a Search Warrant authorizing a search of the described premises to locate and seize ${scope}.`,
          "",
          "I declare under penalty of perjury that the foregoing is true and correct.",
          "",
          name,
          rank,
          "Los Santos County Sheriff's Department",
          `DATED: ${val("search-date")}`,
          "",
          "",
          "EVIDENCE DISCOVERED",
          ...(evidence.length ? evidence.map((item) => `• ${item}`) : ["• [No evidence listed]"]),
        ].join("\n");
      }
      function updateSearchPreview() {
        const val = (id) =>
            id === "search-date"
              ? formatPickerDate($(id).value, "caps") || "DD MONTH YYYY"
              : $(id).value.trim(),
          evidence = [...document.querySelectorAll(".search-evidence-item")]
            .map((field) => field.value.trim())
            .filter(Boolean),
          years = val("search-years") || "[years]";
        $("search-preview").innerHTML =
          waHeader("Affidavit in Support of Search Warrant") +
          `<p>I, ${waEm(val("search-rank"), "[Rank]")} ${waEm(val("search-deputy-name"), "[Affiant Name]")} (${waEm("#" + (val("search-badge") || "N/A"))}), am a peace officer employed with the Los Santos County Sheriff's Department, currently assigned to ${waEm(val("search-bureau"), "[Bureau]")}. I have been employed by this agency for ${waEm(years)} years and have extensive experience in crime scene investigations, including crime scene processing, evidence collection, interview procedures, and preliminary field investigations.</p>` +
          `<p>I submit this affidavit in support of a Search Warrant for ${waEm(val("search-property"), "[Property / location]")}. This request is based on an ongoing investigation into the following crimes:</p>` +
          waCharges(val("search-crimes")) +
          `<div class="wa-label">Probable Cause</div><div class="wa-body">${waParagraph(val("search-probable-cause"))}</div>` +
          `<p>Based on the information contained in this affidavit, I respectfully request that this Court issue a Search Warrant authorizing a search of the described premises to locate and seize ${waEm(val("search-scope"), "[Items to be seized]")}.</p>` +
          `<p class="wa-jurat">I declare under penalty of perjury that the foregoing is true and correct.</p>` +
          waSignature(val("search-deputy-name"), val("search-rank"), val("search-date")) +
          waEvidenceFoot(evidence);
      }
      async function copySearchWarrant() {
        const preview = $("search-preview"),
          plain = buildSearchWarrant(),
          html = buildWarrantClipboardHtml(preview);
        let clipboardError;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([plain], { type: "text/plain" }),
              }),
            ]);
            toast("Copied!");
            return;
          }
        } catch (error) {
          clipboardError = error;
        }
        try {
          fallbackCopyHtml(html);
          toast("Copied!");
        } catch (error) {
          console.error("Could not copy the formatted search warrant:", clipboardError || error);
          toast("Copy failed");
        }
      }
      function initializeSearchWarrant() {
        if (!$("search-date").value) $("search-date").value = emailTodayDate();
        if (!$("search-evidence").children.length) addSearchEvidence();
        updateSearchPreview();
      }
      function resetSearchWarrant() {
        [
          "search-rank",
          "search-deputy-name",
          "search-badge",
          "search-bureau",
          "search-years",
          "search-property",
          "search-crimes",
          "search-probable-cause",
          "search-scope",
        ].forEach((id) => ($(id).value = ""));
        $("search-date").value = emailTodayDate();
        updateTaskListDateLabel("search-date");
        $("search-evidence").replaceChildren();
        addSearchEvidence();
        applyDeputyDetails();
        updateSearchPreview();
      }
      function addElectronicEvidence() {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `<div class='eg'><textarea class='electronic-evidence-item' placeholder='Describe evidence discovered'></textarea><button class='b' type='button' aria-label='Remove evidence' onclick="this.closest('.item').remove()">−</button></div>`;
        $("electronic-evidence").appendChild(row);
      }
      function buildElectronicWarrant() {
        const val = (id) =>
            id === "electronic-date"
              ? formatPickerDate($(id).value, "caps") || "DD MONTH YYYY"
              : $(id).value.trim(),
          evidence = [...document.querySelectorAll(".electronic-evidence-item")]
            .map((field) => field.value.trim())
            .filter(Boolean),
          crimes = val("electronic-crimes") || "[No charges selected]",
          subject = val("electronic-suspect") || "[Subject]",
          rank = val("electronic-rank") || "[Rank]",
          name = val("electronic-deputy-name") || "[Affiant Name]",
          badge = val("electronic-badge") || "N/A",
          bureau = val("electronic-bureau") || "[Bureau]",
          years = val("electronic-years") || "[years]",
          targets = val("electronic-targets") || "[No targets specified]";
        return [
          "AFFIDAVIT IN SUPPORT OF ELECTRONIC SEARCH WARRANT",
          "County of Los Santos — Sheriff's Department",
          "",
          `I, ${rank} ${name} (#${badge}), am a peace officer employed with the Los Santos County Sheriff's Department, currently assigned to ${bureau}. I have been employed by this agency for ${years} years and have extensive experience in crime scene investigations, including crime scene processing, evidence collection, and interview procedures.`,
          "",
          `I submit this affidavit in support of an Electronic Search Warrant concerning ${subject}. This request is based on an ongoing investigation into the following crimes:`,
          crimes
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => `• ${part}`)
            .join("\n") || "• [No charges selected]",
          "",
          "PROBABLE CAUSE",
          val("electronic-probable-cause") || "[Not provided]",
          "",
          "SEARCH, SEIZURE, AND/OR MONITORING TARGETS",
          targets,
          "",
          "Based on the information contained in this affidavit, I respectfully request that this Court issue the requested Electronic Search Warrant.",
          "",
          "I declare under penalty of perjury that the foregoing is true and correct.",
          "",
          name,
          rank,
          "Los Santos County Sheriff's Department",
          `DATED: ${val("electronic-date")}`,
          "",
          "",
          "EVIDENCE DISCOVERED",
          ...(evidence.length ? evidence.map((item) => `• ${item}`) : ["• [No evidence listed]"]),
        ].join("\n");
      }
      function updateElectronicPreview() {
        const val = (id) =>
            id === "electronic-date"
              ? formatPickerDate($(id).value, "caps") || "DD MONTH YYYY"
              : $(id).value.trim(),
          evidence = [...document.querySelectorAll(".electronic-evidence-item")]
            .map((field) => field.value.trim())
            .filter(Boolean),
          years = val("electronic-years") || "[years]";
        $("electronic-preview").innerHTML =
          waHeader("Affidavit in Support of Electronic Search Warrant") +
          `<p>I, ${waEm(val("electronic-rank"), "[Rank]")} ${waEm(val("electronic-deputy-name"), "[Affiant Name]")} (${waEm("#" + (val("electronic-badge") || "N/A"))}), am a peace officer employed with the Los Santos County Sheriff's Department, currently assigned to ${waEm(val("electronic-bureau"), "[Bureau]")}. I have been employed by this agency for ${waEm(years)} years and have extensive experience in crime scene investigations, including crime scene processing, evidence collection, and interview procedures.</p>` +
          `<p>I submit this affidavit in support of an Electronic Search Warrant concerning ${waEm(val("electronic-suspect"), "[Subject]")}. This request is based on an ongoing investigation into the following crimes:</p>` +
          waCharges(val("electronic-crimes")) +
          `<div class="wa-label">Probable Cause</div><div class="wa-body">${waParagraph(val("electronic-probable-cause"))}</div>` +
          `<div class="wa-label">Search, Seizure, and/or Monitoring Targets</div><div class="wa-body">${waParagraph(val("electronic-targets"), "[No targets specified]")}</div>` +
          `<p>Based on the information contained in this affidavit, I respectfully request that this Court issue the requested Electronic Search Warrant.</p>` +
          `<p class="wa-jurat">I declare under penalty of perjury that the foregoing is true and correct.</p>` +
          waSignature(val("electronic-deputy-name"), val("electronic-rank"), val("electronic-date")) +
          waEvidenceFoot(evidence);
      }
      async function copyElectronicWarrant() {
        const preview = $("electronic-preview"),
          plain = buildElectronicWarrant(),
          html = buildWarrantClipboardHtml(preview);
        let clipboardError;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([plain], { type: "text/plain" }),
              }),
            ]);
            toast("Copied!");
            return;
          }
        } catch (error) {
          clipboardError = error;
        }
        try {
          fallbackCopyHtml(html);
          toast("Copied!");
        } catch (error) {
          console.error(
            "Could not copy the formatted electronic surveillance warrant:",
            clipboardError || error,
          );
          toast("Copy failed");
        }
      }
      function initializeElectronicWarrant() {
        if (!$("electronic-date").value) $("electronic-date").value = emailTodayDate();
        if (!$("electronic-evidence").children.length) addElectronicEvidence();
        updateElectronicPreview();
      }
      function resetElectronicWarrant() {
        [
          "electronic-rank",
          "electronic-deputy-name",
          "electronic-badge",
          "electronic-bureau",
          "electronic-years",
          "electronic-suspect",
          "electronic-crimes",
          "electronic-probable-cause",
          "electronic-targets",
        ].forEach((id) => ($(id).value = ""));
        $("electronic-date").value = emailTodayDate();
        updateTaskListDateLabel("electronic-date");
        $("electronic-evidence").replaceChildren();
        addElectronicEvidence();
        applyDeputyDetails();
        updateElectronicPreview();
      }
      function buildFinancialServiceWarrant() {
        return `[b]Full Name:[/b] ${$("fsw-name").value.trim() || "First Last"}\n[b]Amount of Unpaid Fines:[/b] ${$("fsw-amount").value.trim() || "$0,000"}\n[b]FSW Filed:[/b] ${$("fsw-filed").value}`;
      }
      function resetFinancialServiceWarrant() {
        $("fsw-name").value = "";
        $("fsw-amount").value = "";
        $("fsw-filed").selectedIndex = 0;
      }
      function resetNcCit() {
        const form = $("f-nccit");
        form.querySelectorAll("input[type=text],textarea").forEach((field) => {
          if (field.id !== "nccit-title") field.value = "";
        });
        form.querySelectorAll("select").forEach((field) => (field.selectedIndex = 0));
        initializeNcCitRows();
        applyDeputyDetails();
        growAllTextareas("f-nccit");
      }
      function updateK9Medical(p) {
        const bite = $(p + "-type-bite").checked,
          choice = document.querySelector(`input[name="${p}-medical"]:checked`),
          wrap = $(p + "-medical-wrap");
        wrap.hidden = !bite;
        $(p + "-medical-unit-wrap").hidden = !(bite && choice);
        $(p + "-medical-unit-label").textContent =
          choice && choice.value === "none" ? "Reason for lack of provided care" : "Providing Unit";
        // The matching sentence(s) go into the narrative, where they can be read and edited.
        const pick = choice ? choice.value : "";
        syncK9Block(p, "medical", buildK9Medical(p), wrap.dataset.pick !== pick);
        wrap.dataset.pick = pick;
      }
      // Keeps one auto-written block of text inside a K9 narrative. The block is replaced when
      // its inputs change, as long as the user has not edited it; if they have, it is left alone
      // (a changed choice then adds the new text underneath instead of overwriting their edit).
      function syncK9Block(p, key, text, mayAppend) {
        const narr = $(p + "-narrative"),
          attr = "auto" + key,
          prev = narr.dataset[attr] || "";
        let next = narr.value;
        if (prev && next.includes(prev)) {
          next = next.replace(prev, () => text);
          if (!text) next = next.replace(/\n{3,}/g, "\n\n").replace(/^\s+|\s+$/g, "");
        } else if (text && mayAppend) {
          next = (next.trim() ? next.replace(/\s+$/, "") + "\n\n" : "") + text;
        } else {
          if (!text) narr.dataset[attr] = "";
          return;
        }
        narr.dataset[attr] = text;
        if (next !== narr.value) {
          narr.value = next;
          narr.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
      function buildK9Medical(p) {
        if (!$(p + "-type-bite").checked) return "";
        const choice = document.querySelector(`input[name="${p}-medical"]:checked`),
          pick = choice ? choice.value : "",
          unit = $(p + "-medical-unit").value.trim();
        if (pick === "er")
          return `The suspect was medically examined on scene. The sustained injuries were deemed critical, and they were transported to PHMC ER for further checks. The medical examination and transport were conducted by ${unit || "PROVIDING UNIT"}.`;
        if (pick === "cleared")
          return `The suspect was medically examined on scene. The sustained injuries were deemed non-critical and they were released into the custody of the Los Santos County Sheriff's Department. Medical examination conducted by ${unit || "PROVIDING UNIT"}.`;
        if (pick === "none")
          return `No medical care has been provided. Reason: ${unit || "REASON FOR LACK OF PROVIDED CARE"}.`;
        return "";
      }
      function applySenoraK9DeputyDetails() {
        prefillDeputyField("k9-signature-name", $("deputy-full-name").value.trim());
        prefillDeputyField("k9-signature-rank", $("deputy-rank").value);
        const badge = $("deputy-badge-number").value.trim().replace(/^#/, "");
        prefillDeputyField("k9-signature-badge", badge ? "#" + badge : "");
        prefillDeputyField("k9-callsign", $("deputy-callsign").value.trim());
      }
      function buildSenoraK9Deployment() {
        const val = (id) =>
            id === "k9-date" ? formatPickerDate($(id).value, "short") : $(id).value.trim(),
          types = [
            ["k9-type-bite", "Bite"],
            ["k9-type-warrant", "Search Warrant"],
            ["k9-type-tracking", "Tracking"],
            ["k9-type-other", "Other: (Please detail in the narrative)"],
          ]
            .map(([id, label]) => `${$(id).checked ? "[cbc][/cbc]" : "[cb][/cb]"} ${label}`)
            .join("\n");
        return [
          "[divbox=white]",
          "[center][img]https://i.imgur.com/Sd8j7lb.png[/img][/center]",
          "[b][u][center]Senora Station Canine Team Deployment Report[/center][/u][/b]",
          "",
          "[center][table=Arial]",
          "[tr]",
          "[td][b]TIME AND DATE:[/b][/td]",
          "[td][b]LOCATION:[/b][/td]",
          "[td][b]CALLSIGN:[/b][/td]",
          "[/tr]",
          "[tr]",
          `[td]${val("k9-date") || "DD/MMM/YYYY"} - ${val("k9-time") || "HH:MM"}[/td]`,
          `[td]${val("k9-street") || "STREET"}, ${val("k9-district") || "DISTRICT"}, San Andreas[/td]`,
          `[td]${val("k9-callsign") || "CALLSIGN HERE"}[/td]`,
          "[/tr]",
          "[/table][/center]",
          "[divbox=white]",
          "DEPLOYMENT TYPE:",
          "",
          types,
          "",
          "[hr][/hr]",
          "",
          "[center][b][u]DEPLOYMENT NARRATIVE:[/u][/b][/center]",
          "",
          val("k9-narrative") || "FILL IN THE NARRATIVE HERE.",
          "",
          "[hr][/hr]",
          "",
          "[u][b][center]EVIDENCE FOUND:[/center][/b][/u]",
          "",
          k9EvidenceBbcode("k9"),
          "",
          "[hr][/hr]",
          "",
          "Signed by:",
          `${val("k9-signature-name") || "FIRSTNAME LASTNAME"},`,
          `${val("k9-signature-rank") || "RANK"},`,
          val("k9-signature-badge") || "#BADGE",
          "[/divbox]",
        ].join("\n");
      }
      function resetSenoraK9Deployment() {
        resetK9Exhibits("k9");
        [
          "k9-time",
          "k9-street",
          "k9-district",
          "k9-callsign",
          "k9-narrative",
          "k9-signature-name",
          "k9-signature-rank",
          "k9-signature-badge",
        ].forEach((id) => ($(id).value = ""));
        $("k9-date").value = taskListTodayDate();
        updateTaskListDateLabel("k9-date");
        ["k9-type-bite", "k9-type-warrant", "k9-type-tracking", "k9-type-other"].forEach(
          (id) => ($(id).checked = false),
        );
                document.querySelectorAll('input[name="k9-medical"]').forEach((r) => (r.checked = false));
        $("k9-medical-unit").value = "";
        updateK9Medical("k9");
        applySenoraK9DeputyDetails();
      }
      function initializeSenoraK9Deployment() {
        if (!$("k9-date").value) $("k9-date").value = taskListTodayDate();
        applySenoraK9DeputyDetails();
      }
      function applyDavisK9DeputyDetails() {
        const badge = $("deputy-badge-number").value.trim().replace(/^#/, "");
        prefillDeputyField("dk9-signature-name", $("deputy-full-name").value.trim());
        prefillDeputyField("dk9-signature-rank", $("deputy-rank").value);
        prefillDeputyField("dk9-signature-badge", badge ? "#" + badge : "");
        prefillDeputyField("dk9-callsign", $("deputy-callsign").value.trim());
      }
      function buildDavisK9Deployment() {
        const val = (id) =>
            id === "dk9-date" ? formatPickerDate($(id).value, "short") : $(id).value.trim(),
          types = [
            ["dk9-type-bite", "Bite"],
            ["dk9-type-warrant", "Search Warrant"],
            ["dk9-type-tracking", "Tracking"],
            ["dk9-type-other", "Other: (Please detail in the narrative)"],
          ]
            .map(([id, label]) => `${$(id).checked ? "[cbc][/cbc]" : "[cb][/cb]"} ${label}`)
            .join("\n"),
          signature = [
            `${val("dk9-signature-name") || "FIRSTNAME LASTNAME"},`,
            `${val("dk9-signature-rank") || "RANK"},`,
            val("dk9-signature-badge") || "#BADGE",
          ].join("\n");
        return [
          "[divbox=white]",
          "[center][img]https://i.imgur.com/Q2JgKiN.png[/img][/center]",
          "[b][u][center]Canine Deployment Report[/center][/u][/b]",
          "",
          "[center][table=Arial]",
          "[tr]",
          "[td][b]TIME AND DATE:[/b][/td]",
          "[td][b]LOCATION:[/b][/td]",
          "[td][b]CALLSIGN:[/b][/td]",
          "[/tr]",
          "[tr]",
          `[td]${val("dk9-date") || "DD/MMM/YYYY"} - ${val("dk9-time") || "HH:MM"}[/td]`,
          `[td]${val("dk9-street") || "STREET"}, ${val("dk9-district") || "DISTRICT"}, San Andreas[/td]`,
          `[td]${val("dk9-callsign") || "CALLSIGN HERE"}[/td]`,
          "[/tr]",
          "[/table][/center]",
          "[divbox=white]",
          "DEPLOYMENT TYPE:",
          "",
          types,
          "",
          "[hr][/hr]",
          "[center][b][u]DEPLOYMENT NARRATIVE:[/u][/b][/center]",
          "",
          val("dk9-narrative") || "FILL IN THE NARRATIVE HERE.",
          "",
          "[hr][/hr]",
          "",
          "[u][b][center]EVIDENCE FOUND:[/center][/b][/u]",
          "",
          k9EvidenceBbcode("dk9"),
          "",
          "[hr][/hr]",
          "",
          "Signed by:",
          "",
          signature,
          "[/divbox]",
        ].join("\n");
      }
      function resetDavisK9Deployment() {
        resetK9Exhibits("dk9");
        [
          "dk9-time",
          "dk9-street",
          "dk9-district",
          "dk9-callsign",
          "dk9-narrative",
          "dk9-signature-name",
          "dk9-signature-rank",
          "dk9-signature-badge",
        ].forEach((id) => ($(id).value = ""));
        $("dk9-date").value = taskListTodayDate();
        updateTaskListDateLabel("dk9-date");
        ["dk9-type-bite", "dk9-type-warrant", "dk9-type-tracking", "dk9-type-other"].forEach(
          (id) => ($(id).checked = false),
        );
                document.querySelectorAll('input[name="dk9-medical"]').forEach((r) => (r.checked = false));
        $("dk9-medical-unit").value = "";
        updateK9Medical("dk9");
        applyDavisK9DeputyDetails();
      }
      function initializeDavisK9Deployment() {
        if (!$("dk9-date").value) $("dk9-date").value = taskListTodayDate();
        applyDavisK9DeputyDetails();
      }
      function applyCsdK9DeputyDetails() {
        prefillDeputyField("ck9-signature-name", $("deputy-full-name").value.trim());
        prefillDeputyField("ck9-signature-rank", $("deputy-rank").value);
        const badge = $("deputy-badge-number").value.trim().replace(/^#/, "");
        prefillDeputyField("ck9-signature-badge", badge ? "#" + badge : "");
        prefillDeputyField("ck9-callsign", $("deputy-callsign").value.trim());
      }
      function buildCsdK9Deployment() {
        const val = (id) =>
            id === "ck9-date" ? formatPickerDate($(id).value, "short") : $(id).value.trim(),
          types = [
            ["ck9-type-bite", "Bite"],
            ["ck9-type-warrant", "Search Warrant"],
            ["ck9-type-tracking", "Tracking"],
            ["ck9-type-other", "Other: (Please detail in the narrative)"],
          ]
            .map(([id, label]) => `${$(id).checked ? "[cbc][/cbc]" : "[cb][/cb]"} ${label}`)
            .join("\n");
        return [
          "[divbox=white]",
          "[center][img]https://i.imgur.com/Oln4e7O.png[/img][/center]",
          "[b][u][center]Canine Deployment Report[/center][/u][/b]",
          "",
          "[center][table=Arial]",
          "[tr]",
          "[td][b]TIME AND DATE:[/b][/td]",
          "[td][b]LOCATION:[/b][/td]",
          "[td][b]CALLSIGN:[/b][/td]",
          "[/tr]",
          "[tr]",
          `[td]${val("ck9-date") || "DD/MMM/YYYY"} - ${val("ck9-time") || "HH:MM"}[/td]`,
          `[td]${val("ck9-street") || "STREET"}, ${val("ck9-district") || "DISTRICT"}, San Andreas[/td]`,
          `[td]${val("ck9-callsign") || "CALLSIGN HERE"}[/td]`,
          "[/tr]",
          "[/table][/center]",
          "[divbox=white]",
          "DEPLOYMENT TYPE:",
          "",
          types,
          "",
          "[hr][/hr]",
          "",
          "[center][b][u]DEPLOYMENT NARRATIVE:[/u][/b][/center]",
          "",
          val("ck9-narrative") || "FILL IN THE NARRATIVE HERE.",
          "",
          "[hr][/hr]",
          "",
          "[u][b][center]EVIDENCE FOUND:[/center][/b][/u]",
          "",
          k9EvidenceBbcode("ck9"),
          "",
          "[hr][/hr]",
          "",
          "Signed by:",
          `${val("ck9-signature-name") || "FIRSTNAME LASTNAME"},`,
          `${val("ck9-signature-rank") || "RANK"},`,
          val("ck9-signature-badge") || "#BADGE",
          "[/divbox]",
        ].join("\n");
      }
      function resetCsdK9Deployment() {
        resetK9Exhibits("ck9");
        [
          "ck9-time",
          "ck9-street",
          "ck9-district",
          "ck9-callsign",
          "ck9-narrative",
          "ck9-signature-name",
          "ck9-signature-rank",
          "ck9-signature-badge",
        ].forEach((id) => ($(id).value = ""));
        $("ck9-date").value = taskListTodayDate();
        updateTaskListDateLabel("ck9-date");
        ["ck9-type-bite", "ck9-type-warrant", "ck9-type-tracking", "ck9-type-other"].forEach(
          (id) => ($(id).checked = false),
        );
                document.querySelectorAll('input[name="ck9-medical"]').forEach((r) => (r.checked = false));
        $("ck9-medical-unit").value = "";
        updateK9Medical("ck9");
        applyCsdK9DeputyDetails();
      }
      function initializeCsdK9Deployment() {
        if (!$("ck9-date").value) $("ck9-date").value = taskListTodayDate();
        applyCsdK9DeputyDetails();
      }
      function updateVsrBreed() {
        $("vsr-breed-other-wrap").hidden = $("vsr-breed").value !== "other";
      }
      function updateVsrOther() {
        $("vsr-other-wrap").hidden = !$("vsr-svc-other").checked;
      }
      function applyVsrDeputyDetails() {
        const name = [$("deputy-rank").value, $("deputy-full-name").value.trim()]
          .filter(Boolean)
          .join(" ");
        prefillDeputyField("vsr-handler-name", name);
        prefillDeputyField("vsr-handler-unit", $("deputy-bureau").value.trim());
      }
      function buildVsrRequest() {
        const val = (id) => $(id).value.trim(),
          breedPick = $("vsr-breed").value,
          breed =
            breedPick === "other"
              ? val("vsr-breed-other").toUpperCase() || "OTHER (SPECIFY)"
              : breedPick
                ? breedPick.toUpperCase()
                : "GERMAN SHEPHERD / DUTCH SHEPHERD / BELGIAN MALINOIS / BLOODHOUND / OTHER (SPECIFY)",
          services = [
            ["vsr-svc-checkup", "ROUTINE CHECK-UP"],
            ["vsr-svc-vaccinations", "VACCINATIONS"],
            ["vsr-svc-injury", "INJURY"],
            ["vsr-svc-illness", "ILLNESS"],
            ["vsr-svc-dental", "DENTAL CARE"],
          ].map(([id, label]) => `${$(id).checked ? "[cbc][/cbc]" : "[cb][/cb]"} ${label}`),
          other = $("vsr-svc-other").checked
            ? `[cbc][/cbc] OTHER (PLEASE SPECIFY):${val("vsr-other-text") ? " " + val("vsr-other-text") : ""}`
            : "[cb][/cb] OTHER (PLEASE SPECIFY):",
          from = val("vsr-time-from"),
          to = val("vsr-time-to");
        return [
          "[b][u]HANDLER INFORMATION:[/u][/b]",
          `[b]HANDLER'S NAME:[/b] ${val("vsr-handler-name") || "RANK FIRSTNAME LASTNAME"}`,
          `[b]HANDLER'S UNIT:[/b] ${val("vsr-handler-unit") || "UNIT"}`,
          `[b]PHONE NUMBER:[/b] ${val("vsr-phone") || "000-000-0000"}`,
          "",
          "[b][u]K9 INFORMATION:[/u][/b]",
          `[b]K9 NAME:[/b] ${val("vsr-k9-name") || "K9 NAME"}`,
          `[b]BREED:[/b] ${breed}`,
          `[b]AGE:[/b] ${val("vsr-age") || "X"} YEARS`,
          `[b]GENDER:[/b] ${$("vsr-gender").value || "M / F"}`,
          "",
          "[b][u]SERVICE REQUEST DETAILS:[/u][/b]",
          ...services,
          other,
          "",
          "[b][u]APPOINTMENT PREFERENCES:[/u][/b]",
          `[b]PREFERRED DATE OF APPOINTMENT:[/b] ${formatPickerDate($("vsr-date").value, "short") || "DD/MMM/YYYY"}`,
          `[b]PREFERRED TIME OF APPOINTMENT:[/b] ${from || "00:00"} - ${to || "00:00"} [i]((Timeframe when you are available.))[/i]`,
        ].join("\n");
      }
      function resetVsrRequest() {
        [
          "vsr-handler-name",
          "vsr-handler-unit",
          "vsr-phone",
          "vsr-k9-name",
          "vsr-breed-other",
          "vsr-age",
          "vsr-other-text",
          "vsr-time-from",
          "vsr-time-to",
        ].forEach((id) => ($(id).value = ""));
        $("vsr-breed").selectedIndex = 0;
        $("vsr-gender").selectedIndex = 0;
        [
          "vsr-svc-checkup",
          "vsr-svc-vaccinations",
          "vsr-svc-injury",
          "vsr-svc-illness",
          "vsr-svc-dental",
          "vsr-svc-other",
        ].forEach((id) => ($(id).checked = false));
        $("vsr-date").value = taskListTodayDate();
        updateTaskListDateLabel("vsr-date");
        updateVsrBreed();
        updateVsrOther();
        applyVsrDeputyDetails();
      }
      function initializeVsrRequest() {
        if (!$("vsr-date").value) $("vsr-date").value = taskListTodayDate();
        applyVsrDeputyDetails();
      }
      function addSenoraLogbookReport(url = "", text = "") {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `<div class='ih'><b>Associated Report</b><button class='b' type='button' onclick="this.closest('.item').remove()">Remove</button></div><div class='g'><div class='f'><span>URL</span><input type='text' class='senora-logbook-report-url' placeholder='Report URL'></div><div class='f'><span>Report Title</span><input type='text' class='senora-logbook-report-title' placeholder='Report name'></div></div>`;
        row.querySelector(".senora-logbook-report-url").value = url;
        row.querySelector(".senora-logbook-report-title").value = text;
        $("senora-logbook-reports").appendChild(row);
      }
      function buildSenoraLogbook() {
        const val = (id) => $(id).value.trim(),
          reports = [...document.querySelectorAll("#senora-logbook-reports .item")]
            .map((row) => {
              const url = row.querySelector(".senora-logbook-report-url").value.trim(),
                title = row.querySelector(".senora-logbook-report-title").value.trim();
              return url && title ? `[*][url=${url}]${title}[/url]` : "";
            })
            .filter(Boolean);
        return [
          "[olddivbox=white][center]",
          `[b]LOGBOOK ENTRY - ${val("senora-logbook-title") || "INSERT TITLE HERE"}[/b]`,
          "[hr][/hr][/center]",
          `[b]Filing Deputy:[/b] ${val("senora-logbook-deputy") || "RANK FIRSTNAME LASTNAME"}`,
          `[b]Date / Time[/b]: ${formatPickerDate(val("senora-logbook-date"), "short") || "DD/MMM/YYYY"}; ${val("senora-logbook-time") || "XX:XX"}`,
          `[b]Location:[/b] ${val("senora-logbook-location") || "LOCATION"}`,
          "",
          `[b]Associated Reports (if applicable):[/b][list]`,
          ...(reports.length ? reports : ["[*][url=X]N/A[/url]"]),
          "[/list]",
          `[b]Summary:[/b]`,
          "",
          val("senora-logbook-summary") || "Placeholder.",
          "",
          "[b]Attached Media[/b] [spoiler]",
          val("senora-logbook-media") || "Insert stuff here.",
          "[/spoiler]",
          "[/olddivbox]",
        ].join("\n");
      }
      function resetSenoraLogbook() {
        $("senora-logbook-title").selectedIndex = 0;
        [
          "senora-logbook-time",
          "senora-logbook-location",
          "senora-logbook-deputy",
          "senora-logbook-summary",
          "senora-logbook-media",
        ].forEach((id) => ($(id).value = ""));
        $("senora-logbook-date").value = taskListTodayDate();
        updateTaskListDateLabel("senora-logbook-date");
        $("senora-logbook-reports").replaceChildren();
        addSenoraLogbookReport("", "N/A");
        applyDeputyDetails();
      }
      function initializeSenoraLogbook() {
        if (!$("senora-logbook-date").value) $("senora-logbook-date").value = taskListTodayDate();
        if (!$("senora-logbook-reports").children.length) addSenoraLogbookReport("", "N/A");
        applyDeputyDetails();
      }
      function sibTag(id) {
        return $(id).value.trim().replace(/^#+\s*/, "").replace(/\s+/g, "");
      }
      function buildSibStory() {
        const val = (id) => $(id).value.trim(),
          date = formatPickerDate(val("sib-story-date")).toUpperCase() || "MONTH DD, YYYY",
          title = (val("sib-story-title") || "TITLE").replace(/\|/g, "-"),
          tags = [1, 2, 3].map((n) => sibTag("sib-story-tag" + n) || "TAG" + n),
          hash = (t) => `[color=#000000]#[/color]${t}`;
        return [
          `[newsrelease=${date}|${title}][center]`,
          `[img]${val("sib-story-image") || "INSERT PICTURE"}[/img]`,
          "",
          `[font=Montserrat][size=180][b]${val("sib-story-subtitle") || "SUBTITLE"}[/b][/size][/font][/center]`,
          "",
          "",
          "[font=Arial][size=115][justify]",
          val("sib-story-content") || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          "[/justify][/size][/font]",
          "[size=90][center][color=#777]" + "LSSDHQ",
          tags.map(hash).join("\u2003"),
          "[/color][/center][/size]",
          "[/newsrelease]",
        ].join("\n");
      }
      function updateSibStoryPreview() {
        const val = (id) => $(id).value.trim(),
          url = val("sib-story-image"),
          img = $("sib-story-img"),
          msg = $("sib-story-img-msg"),
          pimg = $("sib-prev-img");
        $("sib-prev-date").textContent =
          formatPickerDate(val("sib-story-date")).toUpperCase() || "MONTH DD, YYYY";
        $("sib-prev-title").textContent = val("sib-story-title") || "TITLE";
        if (!$("sib-prev-badge").src) $("sib-prev-badge").src = document.querySelector(".logo").src;
        $("sib-prev-sub").textContent = val("sib-story-subtitle") || "SUBTITLE";
        $("sib-prev-body").textContent =
          val("sib-story-content") || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        $("sib-prev-source").textContent = "LSSDHQ";
        $("sib-prev-tags").replaceChildren(
          ...[1, 2, 3].flatMap((n) => {
            const h = document.createElement("b");
            h.textContent = "#";
            return [h, document.createTextNode(sibTag("sib-story-tag" + n) || "TAG" + n)];
          }),
        );
        if (img.dataset.src !== url) {
          img.dataset.src = url;
          img.hidden = pimg.hidden = true;
          $("sib-prev-imgph").hidden = false;
          if (url) {
            img.onload = () => {
              img.hidden = pimg.hidden = false;
              $("sib-prev-imgph").hidden = true;
              msg.hidden = true;
            };
            img.onerror = () => {
              img.hidden = pimg.hidden = true;
          $("sib-prev-imgph").hidden = false;
              msg.hidden = false;
              msg.textContent = "This image could not be loaded. The link is still used in the BBCode.";
            };
            img.src = pimg.src = url;
            msg.hidden = false;
            msg.textContent = "Loading preview…";
          } else {
            img.removeAttribute("src");
            pimg.removeAttribute("src");
            msg.hidden = false;
            msg.textContent = "Paste an image link above to preview it here.";
          }
        }
      }
      function resetSibStory() {
        [
          "sib-story-title",
          "sib-story-subtitle",
          "sib-story-image",
          "sib-story-content",
          "sib-story-tag1",
          "sib-story-tag2",
          "sib-story-tag3",
        ].forEach((id) => ($(id).value = ""));
        $("sib-story-date").value = taskListTodayDate();
        updateTaskListDateLabel("sib-story-date");
        updateSibStoryPreview();
      }
      function initializeSibStory() {
        if (!$("sib-story-date").value) $("sib-story-date").value = taskListTodayDate();
        const f = $("f-sib-story"),
          refresh = () => requestAnimationFrame(updateSibStoryPreview);
        ["input", "change", "click"].forEach((ev) => f.addEventListener(ev, refresh));
        updateSibStoryPreview();
      }
      function buildSibActivity() {
        const val = (id) => $(id).value.trim();
        return [
          `[b]NAME[/b]: ${val("sib-activity-name") || "Firstname Lastname"}`,
          `[b]DATE[/b]: ${formatPickerDate(val("sib-activity-date"), "short") || "DD/MMM/YYYY"}`,
          `[b]ACTIVITY TYPE[/b]: ${val("sib-activity-type") || "Media Interview/Social Media Post/Information Page/Story/Event Organization/Event Attendance/Other"}`,
          `[b]SUMMARY[/b]: ${val("sib-activity-summary") || "Brief summary of the activity conducted"}`,
        ].join("\n");
      }
      function resetSibActivity() {
        ["sib-activity-name", "sib-activity-summary"].forEach((id) => ($(id).value = ""));
        $("sib-activity-type").selectedIndex = 0;
        $("sib-activity-date").value = taskListTodayDate();
        updateTaskListDateLabel("sib-activity-date");
        applyDeputyDetails();
      }
      function initializeSibActivity() {
        if (!$("sib-activity-date").value) $("sib-activity-date").value = taskListTodayDate();
        applyDeputyDetails();
      }
      function updateOssIncidentTitle() {
        const penalCodes = chargeTitle("oss-ir-penal-code") || "CHARGE",
          location = $("oss-ir-location").value.trim() || "LOCATION";
        $("oss-ir-title").value =
          `[IR] ${penalCodes} - ${location} - ${formatPickerDate($("oss-ir-date").value, "short") || "DD/MMM/YYYY"}`;
      }
      async function copyOssIncidentTitle() {
        const field = $("oss-ir-title");
        try {
          await navigator.clipboard.writeText(field.value);
          toast("Title copied!");
        } catch (error) {
          field.select();
          try {
            if (!document.execCommand("copy")) throw new Error("Clipboard copy was rejected");
            toast("Title copied!");
          } catch (copyError) {
            console.error("Could not copy OSS incident report title:", copyError);
            toast("Copy failed");
          }
          field.setSelectionRange(0, 0);
        }
      }
      function addOssPerson() {
        const row = document.createElement("div");
        row.className = "item oss-person";
        row.innerHTML = `
          <div class='ih'>
            <b class='oss-person-label'></b>
            <button class='b' type='button' onclick="this.closest('.oss-person').remove();numberOssPeople()">Remove</button>
          </div>
          ${personCard({
            nameClass: "oss-person-name",
            placeholder: "Forename Surname",
            imgClass: "oss-person-image",
            profileClass: "oss-person-profile",
            identity: `
              <div class='f'>
                <span>Classification</span>
                <select class='oss-person-class'>
                  <option value=''>Select classification</option>
                  <option>Victim</option>
                  <option>Suspect</option>
                  <option>Witness</option>
                  <option>Informant</option>
                </select>
              </div>
              <div class='f'>
                <span>Date of Birth</span>
                <input type='text' class='oss-person-dob' autocomplete='off'>
              </div>`,
            details: `
              <div class='f'>
                <span>Phone Number</span>
                <input type='text' class='oss-person-phone' autocomplete='off'>
              </div>
              <div class='f'>
                <span>Residence / Owned Properties</span>
                <input type='text' class='oss-person-residence' autocomplete='off'>
              </div>
              <div class='f'>
                <span>Moniker</span>
                <input type='text' class='oss-person-moniker' autocomplete='off'>
              </div>
              <div class='f'>
                <span>Gang Member</span>
                <select class='oss-person-gang'>
                  <option value=''>Not specified</option>
                  <option value='yes'>Yes</option>
                  <option value='no'>No</option>
                </select>
              </div>`,
            relation: `
              <div class='f pc-rel'>
                <span>Relation to Incident</span>
                <textarea class='oss-person-relation' placeholder='How this person is involved in the incident'></textarea>
              </div>`,
          })}
        `;
        $("oss-ir-persons").appendChild(row);
        const name = row.querySelector(".oss-person-name");
        wirePersonPhoto(row, "oss-person-image", name, "oss-person-profile");
        initPersonDeath(row, () => name.value.trim());
        numberOssPeople();
      }
      function numberOssPeople() {
        $("oss-ir-persons")
          .querySelectorAll(".oss-person-label")
          .forEach((label, index) => (label.textContent = `Person #${index + 1}`));
      }
      // OSS Case Package evidence: lettered exhibits, same logic and BBCode as the MCB Case Package.
      function numberOssExhibits() {
        $("oss-ir-evidence")
          .querySelectorAll(".oss-e-label")
          .forEach((label, i) => (label.textContent = "Exhibit " + sevLetter(i)));
      }
      function addOssEvidence() {
        const row = document.createElement("div");
        row.className = "item oss-exhibit";
        row.innerHTML = `
      <div class='ih'><b class='oss-e-label'></b><button class='b' type='button' onclick="this.closest('.oss-exhibit').remove();numberOssExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='oss-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='oss-e-body' placeholder='Images, links, details…'></textarea></div>`;
        $("oss-ir-evidence").appendChild(row);
        numberOssExhibits();
      }
      function addOssSupplementalEvidence() {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `<div class='eg'><input type='text' class='oss-supp-evidence-item' placeholder='Description of evidence'><button class='b' type='button' aria-label='Remove exhibit' onclick="this.closest('.item').remove()">Remove</button></div>`;
        $("oss-supp-evidence").appendChild(row);
      }
      function buildOssIncident() {
        const val = (id) => $(id).value.trim(),
          people = [...document.querySelectorAll("#oss-ir-persons .oss-person")].map(
            (row, index) => {
              const get = (selector) => row.querySelector(selector).value.trim(),
                name = get(".oss-person-name") || "Forename Surname",
                shownName = personDisplayName(row, name),
                death = personDeathState(row),
                profile =
                  get(".oss-person-profile") ||
                  "https://mdc.gta.world/record/" + name.replace(/\s+/g, "_"),
                classification =
                  get(".oss-person-class") || "Victim / Suspect / Witness / Informant",
                gang = get(".oss-person-gang"),
                gangValue = gang === "yes" ? "[cbc][/cbc]" : gang === "no" ? "[cb][/cb]" : "[cb]",
                image = get(".oss-person-image");
              return [
                `[b]Person #${index + 1} -[/b] [url=${profile}]${shownName}[/url]`,
                `[b]Classification:[/b] ${classification}`,
                `[aligntable=right,0,0,50,0,0,0][img]${image || "https://i.imgur.com/4FqUxmw.png"}[/img][/aligntable]`,
                `[b]Date of Birth:[/b] ${get(".oss-person-dob")}`,
                `[b]Phone Number:[/b] ${get(".oss-person-phone")}`,
                `[b]Residence / Owned Properties:[/b] ${get(".oss-person-residence")}`,
                `[b]Gang Member[/b]: ${gangValue}`,
                `[b]Moniker[/b]: ${get(".oss-person-moniker")}`,
                `[b]Relation to Incident:[/b] ${get(".oss-person-relation") || "RELATION TO INCIDENT"}`,
                ...(death.dead ? [`[altspoiler=OOC Death Details]${death.ooc}[/altspoiler]`] : []),
              ].join("\n");
            },
          );
        const evidenceItems = [...$("oss-ir-evidence").querySelectorAll(".oss-exhibit")].map(
            (row, i) =>
              `[*][b]Exhibit ${sevLetter(i)}; ${row.querySelector(".oss-e-desc").value.trim() || "Evidence description"}[/b]\n[spoiler]${row.querySelector(".oss-e-body").value.trim()}[/spoiler]`,
          ),
          filedBy = [val("oss-ir-filed-by"), val("oss-ir-partner")].filter(Boolean).join("; ");
        return [
          "[block=0,30,transparent,white][font=Arial][color=black]",
          "",
          "[center][img]https://i.imgur.com/LEWTXbL.png[/img][img]https://i.imgur.com/HZPGu8j.png[/img]",
          "",
          `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
          "",
          "[size=110][u]INCIDENT REPORT – OPERATION SAFE STREETS BUREAU[/u][/size][/center][hr][/hr]",
          "",
          "[font=arial][color=black][indent][size=105][b]Filing Information[/b][/size]",
          "",
          "[indent]",
          `[b]Time & Date:[/b] ${val("oss-ir-time") || "0000"}, ${formatPickerDate(val("oss-ir-date"), "short") || "DD/MMM/YYYY"}`,
          `[b]Penal Code (if Criminal):[/b] ${val("oss-ir-penal-code") || "123MC, PENAL CODE TITLE; 456MC, PENAL CODE TITLE"}`,
          `[b]Location:[/b] ${val("oss-ir-location")}`,
          "",
          `[b]Filed By:[/b] ${filedBy || "Rank Forename Surname (if partnered, list Partner Deputy as well)"}`,
          `[b]Unit Number:[/b] ${val("oss-ir-callsign") || "Callsign"}`,
          "[/indent]",
          "",
          "[size=105][b]Involved Persons[/b][/size]",
          "[indent]",
          people.join("\n\n"),
          "[/indent]",
          "",
          "[size=105][b]Narrative[/b][/size]",
          `[indent]${val("oss-ir-narrative") || "Write narrative here."}[/indent]`,
          "",
          "[size=105][b]Evidence[/b][/size]",
          "[list]" + evidenceItems.join("\n") + "[/list][/block]",
        ].join("\n");
      }
      function buildOssSupplemental() {
        const val = (id) => $(id).value.trim(),
          evidence = [...document.querySelectorAll(".oss-supp-evidence-item")]
            .map((field) => field.value.trim())
            .filter(Boolean),
          evidenceItems = evidence.length
            ? evidence.map((item, index) => `[*]Exhibit ${index + 1} – ${item}`)
            : ["[*]Exhibit 1 – Description of evidence", "[*]Exhibit 2 – Description of evidence"],
          filedBy = [val("oss-supp-filed-by"), val("oss-supp-partner")].filter(Boolean).join("; ");
        return [
          "[block=0,30,transparent,white][font=Arial][color=black]",
          "",
          "[center][img]https://i.imgur.com/LEWTXbL.png[/img][img]https://i.imgur.com/HZPGu8j.png[/img]",
          "",
          `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
          "",
          "[size=110][u]SUPPLEMENTAL REPORT – OPERATION SAFE STREETS BUREAU[/u][/size][/center][hr][/hr]",
          "",
          "[font=arial][color=black][indent][size=105][b]Filing Information[/b][/size]",
          "",
          "[indent]",
          `[b]Time & Date:[/b] ${val("oss-supp-time") || "0000"}, ${formatPickerDate(val("oss-supp-date"), "short") || "DD/MMM/YYYY"}`,
          "",
          `[b]Filed By:[/b] ${filedBy || "Rank Forename Surname (if partnered, list Partner Deputy as well)"}`,
          `[b]Unit Number:[/b] ${val("oss-supp-callsign") || "Callsign"}`,
          "[/indent]",
          "",
          "[size=105][b]Narrative[/b][/size]",
          `[indent]${val("oss-supp-narrative") || "Write narrative here."}[/indent]`,
          "",
          "[size=105][b]Evidence[/b][/size]",
          "[list=1]",
          ...evidenceItems,
          "[/list]",
          "[/block]",
        ].join("\n");
      }
      function resetOssIncident() {
        [
          "oss-ir-time",
          "oss-ir-penal-code",
          "oss-ir-location",
          "oss-ir-callsign",
          "oss-ir-partner",
          "oss-ir-narrative",
        ].forEach((id) => ($(id).value = ""));
        $("oss-ir-date").value = taskListTodayDate();
        updateTaskListDateLabel("oss-ir-date");
        $("oss-ir-persons").replaceChildren();
        $("oss-ir-evidence").replaceChildren();
        addOssPerson();
        addOssPerson();
        addOssEvidence();
        applyDeputyDetails();
        updateOssIncidentTitle();
      }
      function resetOssSupplemental() {
        ["oss-supp-time", "oss-supp-callsign", "oss-supp-partner", "oss-supp-narrative"].forEach(
          (id) => ($(id).value = ""),
        );
        $("oss-supp-date").value = taskListTodayDate();
        updateTaskListDateLabel("oss-supp-date");
        $("oss-supp-evidence").replaceChildren();
        addOssSupplementalEvidence();
        applyDeputyDetails();
      }
      function initializeOssGenerators() {
        if (!$("oss-ir-date").value) $("oss-ir-date").value = taskListTodayDate();
        if (!$("oss-supp-date").value) $("oss-supp-date").value = taskListTodayDate();
        if (!$("oss-ir-persons").children.length) {
          addOssPerson();
          addOssPerson();
        }
        if (!$("oss-ir-evidence").children.length) addOssEvidence();
        if (!$("oss-supp-evidence").children.length) addOssSupplementalEvidence();
        applyDeputyDetails();
        updateOssIncidentTitle();
      }
      function resetNcCitSupp() {
        $("f-nccit-supp")
          .querySelectorAll("input[type=text],input[type=hidden],textarea")
          .forEach((field) => (field.value = ""));
        updateTaskListDateLabel("nccit-supp-date");
        applyDeputyDetails();
        growAllTextareas("f-nccit-supp");
      }
      function buildUof() {
        const val = (id) =>
            id === "uof-date"
              ? formatPickerDate($(id).value, "time-date", $("uof-time").value)
              : $(id).value.trim(),
          checked = (id) => ($(id).checked ? "[cbc][/cbc]" : "[cb][/cb]");
        const suspects = [...document.querySelectorAll("#uof-suspects .item")].map((row, i) => {
          const name = row.querySelector(".uof-suspect-name").value.trim() || "Forename Surname",
            status =
              row.querySelector(".uof-suspect-status").value || "Arrested / Deceased / Released";
          return `[indent][u]Person #${i + 1} - ${name}[/u]\n[b]Status:[/b] ${status}[/indent]`;
        });
        const employees = [...document.querySelectorAll("#uof-employees .uof-person-name")]
            .map((input) => input.value.trim())
            .filter(Boolean),
          witnesses = [...document.querySelectorAll("#uof-witnesses .uof-person-name")]
            .map((input) => input.value.trim())
            .filter(Boolean);
        const evidenceList = [...$("uof-evidence").querySelectorAll(".uof-exhibit")].map(
          (row, i) =>
            `[*][b]Exhibit ${sevLetter(i)}; ${row.querySelector(".uof-e-desc").value.trim() || "Evidence description"}[/b]\n[spoiler]${row.querySelector(".uof-e-body").value.trim()}[/spoiler]`,
        );
        const employeeList = employees.length
            ? employees
            : ["Rank Forename Surname", "Rank Forename Surname"],
          witnessList = witnesses.length
            ? witnesses
            : ["Rank Forename Surname", "Forename Surname"];
        return [
          "[font=Arial][color=black]",
          "",
          "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
          "",
          `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
          "",
          `[size=110][u]USE OF FORCE REPORT[/u][/size][/center][hr][/hr]`,
          "",
          "[font=arial][color=black][indent][size=105][b]Filing Information[/b][/size]",
          "",
          "[indent]",
          `[b]Time & Date:[/b] ${val("uof-date") || "0000, Month Day, Year"}`,
          `[b]Location:[/b] ${val("uof-location")}`,
          "",
          `[b]Filed By:[/b] ${val("uof-filed-by") || "Rank Forename Surname (if partnered, list Partner Deputy as well)"}`,
          `[b]IAB Response:[/b] ${checked("uof-iab")}`,
          `[b]Supervisor Response:[/b] ${checked("uof-supervisor")}`,
          `[b]Unit Number:[/b] ${val("uof-unit") || "Callsign"}`,
          "[/indent]",
          "",
          "[size=105][b]Suspects[/b][/size]",
          ...suspects,
          "",
          "[size=105][b]Employees Involved (Only include employees who used lethal force)[/b][/size]",
          "[list]",
          ...employeeList.map((name) => "[*]" + name),
          "[/list]",
          "",
          "[size=105][b]Witnesses[/b][/size]",
          "[list]",
          ...witnessList.map((name) => "[*]" + name),
          "[/list]",
          "",
          "[size=105][b]Narrative[/b][/size]",
          `[indent]${val("uof-narrative") || "Write narrative here."}[/indent]`,
          "",
          "[size=105][b]Evidence[/b][/size]",
          "[list]" + evidenceList.join("\n") + "[/list]",
        ].join("\n");
      }
      function resetUof() {
        ["uof-date", "uof-location", "uof-filed-by", "uof-unit", "uof-narrative"].forEach(
          (id) => ($(id).value = ""),
        );
        $("uof-time").value = "00:00";
        updateTaskListDateLabel("uof-date");
        $("uof-iab").checked = false;
        $("uof-supervisor").checked = false;
        $("uof-suspects").innerHTML = "";
        $("uof-employees").innerHTML = "";
        $("uof-witnesses").innerHTML = "";
        $("uof-evidence").replaceChildren();
        addUofSuspect();
        addUofPerson("employees", "Rank Forename Surname");
        addUofPerson("employees", "Rank Forename Surname");
        addUofPerson("witnesses", "Rank Forename Surname");
        addUofPerson("witnesses", "Forename Surname");
        addUofEvidence();
        applyDeputyDetails();
        updateUofTitle();
      }
      $("f-uof").addEventListener("input", updateUofTitle);
      $("f-incident").addEventListener("input", updateIncidentTitle);
      $("f-subject").addEventListener("input", updateSubjectTitle);
      $("f-tc").addEventListener("input", updateTcTitle);
      $("f-nccit").addEventListener("input", updateNcCitTitle);
      function drawSheriffReport() {
        const canvas = $("sheriff-preview");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const W = 1050,
          pad = 28,
          contentW = W - pad * 2,
          lineH = 30,
          sectionTitleH = 42;
        const wrap = (text, font, maxWidth) => {
          ctx.font = font;
          const lines = [];
          String(text ?? "")
            .split(/\r?\n/)
            .forEach((paragraph) => {
              if (!paragraph) {
                lines.push("");
                return;
              }
              let line = "";
              paragraph.split(/\s+/).forEach((word) => {
                const next = line ? line + " " + word : word;
                if (ctx.measureText(next).width > maxWidth && line) {
                  lines.push(line);
                  line = word;
                } else line = next;
              });
              lines.push(line);
            });
          return lines;
        };
        const bold = "700 19px Arial,sans-serif",
          regular = "17px Arial,sans-serif",
          small = "14px Arial,sans-serif",
          questionLayouts = Q.map((q, i) => {
            const prefix = `1.${i + 1} `,
              text = prefix + q,
              lines = wrap(text, bold, contentW - 270);
            return { lines, answer: document.querySelector(`input[name=q${i}]:checked`).value };
          });
        const section2 = [
          ["2.1 (Reporting Party) Fullname:", $("c1").value],
          ["2.2 (Reporting Party) Contact Phone Number:", $("c2").value],
        ];
        const section3 = [
          ["3.1 Narrative:", $("n1").value],
          ["3.2 Evidence:", $("n2").value],
        ];
        const deputy = data().d;
        let height =
          220 +
          sectionTitleH +
          questionLayouts.reduce(
            (sum, row) => sum + Math.max(1, row.lines.length) * lineH + 8,
            20,
          ) +
          sectionTitleH +
          section2.length * lineH +
          24;
        for (const [label, value] of section3)
          height +=
            sectionTitleH / 1.4 +
            lineH +
            Math.max(1, wrap(value, regular, contentW - 60).length) * lineH +
            18;
        height +=
          sectionTitleH + Math.max(1, wrap(deputy, bold, contentW - 60).length) * lineH + 52;
        canvas.width = W;
        canvas.height = height;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, height);
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, W - 2, height - 2);
        const headerY = 12,
          headerH = 140,
          logo = document.querySelector(".brand .logo");
        if (logo.complete && logo.naturalWidth) ctx.drawImage(logo, 45, headerY + 12, 94, 112);
        ctx.fillStyle = "#171717";
        ctx.textAlign = "center";
        ctx.font = "bold 30px Georgia,serif";
        ctx.fillText("County of Los Santos", W / 2 + 35, headerY + 61);
        ctx.font = "bold 25px Georgia,serif";
        ctx.fillText("Sheriff's Department Headquarters", W / 2 + 35, headerY + 101);
        let y = headerY + headerH + 8;
        ctx.fillStyle = "#084f0a";
        ctx.fillRect(pad, y, contentW, 48);
        ctx.fillStyle = "#fff";
        ctx.font = "700 27px Arial,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SHERIFF'S REPORT SYSTEM", W / 2, y + 24);
        y += 66;
        const section = (index, title) => {
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#222";
          ctx.lineWidth = 2;
          ctx.fillRect(pad, y, contentW, sectionTitleH);
          ctx.strokeRect(pad, y, contentW, sectionTitleH);
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = "#555";
          ctx.font = small;
          ctx.fillText(`SECTION ${index}`, pad + 12, y + 26);
          ctx.fillStyle = "#111";
          ctx.font = "700 21px Arial,sans-serif";
          ctx.fillText(title, pad + 112, y + 27);
          y += sectionTitleH;
        };
        const check = (x, cy, checked) => {
          ctx.strokeStyle = checked ? "#0874e8" : "#555";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, cy - 17, 18, 18);
          if (checked) {
            ctx.strokeStyle = "#0874e8";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 3, cy - 8);
            ctx.lineTo(x + 7, cy - 3);
            ctx.lineTo(x + 15, cy - 14);
            ctx.stroke();
          }
        };
        section(1, "QUALIFYING INFORMATION");
        ctx.fillStyle = "#111";
        ctx.font = bold;
        ctx.textAlign = "left";
        for (const row of questionLayouts) {
          const baseY = y + lineH;
          row.lines.forEach((line, i) => ctx.fillText(line, pad + 30, baseY + i * lineH));
          const answerY = baseY + (row.lines.length - 1) * lineH;
          ctx.font = regular;
          ctx.fillText("Yes", W - pad - 215, answerY);
          check(W - pad - 174, answerY - 4, row.answer === "Yes");
          ctx.fillText("No", W - pad - 137, answerY);
          check(W - pad - 99, answerY - 4, row.answer === "No");
          ctx.font = bold;
          y += row.lines.length * lineH + 8;
        }
        y += 12;
        section(2, "COMPLAINANT INFORMATION");
        ctx.fillStyle = "#111";
        ctx.textAlign = "left";
        for (const [label, value] of section2) {
          ctx.font = bold;
          const labelText = label + " ";
          ctx.fillText(labelText, pad + 30, y + lineH);
          const labelW = ctx.measureText(labelText).width;
          ctx.font = regular;
          ctx.fillText(value, pad + 30 + labelW, y + lineH);
          y += lineH;
        }
        y += 18;
        section(3, "REPORT INFORMATION");
        ctx.fillStyle = "#111";
        ctx.textAlign = "left";
        for (const [label, value] of section3) {
          ctx.font = bold;
          ctx.fillText(label, pad + 30, y + lineH);
          y += lineH;
          ctx.font = regular;
          const lines = wrap(value, regular, contentW - 60);
          lines.forEach((line) => {
            ctx.fillText(line, pad + 52, y + lineH);
            y += lineH;
          });
          y += 10;
        }
        y += 8;
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(W - pad, y);
        ctx.stroke();
        y += 34;
        ctx.fillStyle = "#111";
        ctx.font = bold;
        ctx.textAlign = "left";
        ctx.fillText("4 Filling Deputy:", pad + 18, y);
        y += lineH;
        const deputyLines = wrap(deputy, regular, contentW - 60);
        ctx.font = regular;
        deputyLines.forEach((line, i) => ctx.fillText(line, pad + 18, y + i * lineH));
        y += deputyLines.length * lineH;
        const signature = $("d4").value.trim();
        if (signature) {
          ctx.fillStyle = "#555";
          ctx.font = small;
          ctx.fillText("Signature image:", pad + 18, y + lineH);
          ctx.fillText(signature, pad + 150, y + lineH, contentW - 170);
        }
      }
      async function dlSheriffReport() {
        try {
          drawSheriffReport();
          const canvas = $("sheriff-preview"),
            blob = await new Promise((resolve, reject) => {
              if (!canvas.toBlob) {
                reject(new Error("PNG export is not supported by this browser"));
                return;
              }
              canvas.toBlob(
                (file) => (file ? resolve(file) : reject(new Error("Could not create report PNG"))),
                "image/png",
              );
            });
          const deputyName = $("d2")
              .value.trim()
              .replace(/[^A-Za-z0-9-]+/g, "_"),
            url = URL.createObjectURL(blob),
            link = document.createElement("a");
          link.href = url;
          link.download = "sheriffs-report" + (deputyName ? "-" + deputyName : "") + ".png";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Download started");
        } catch (e) {
          console.error("Sheriff report PNG download failed:", e);
          toast("Download failed");
        }
      }
      function kingTodayDate() {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, "0")}/${date.toLocaleString("en-US", { month: "short" }).toUpperCase()}/${date.getFullYear()}`;
      }
      function apbTodayDate() {
        return taskListTodayDate();
      }
      // The APB number is a fixed "####" placeholder (filled in on the forum), not generated.
      const APB_NUMBER = "####";
      function buildApb() {
        const val = (id) => $(id).value.trim(),
          date = formatPickerDate(val("apb-date"), "weekday"),
          bureau = val("apb-bureau"),
          rank = val("apb-rank"),
          name = val("apb-name"),
          contact = [rank, name].filter(Boolean).join(" "),
          unit = bureau ? `LSSD ${bureau}` : "LSSD",
          address = "300 Innocence Boulevard, City of Davis, SA 90220",
          phone = "(888) 901",
          image = val("apb-image") || "https://i.ibb.co/WjtXWwg/No-Avatar.png";
        return `[bulletin=${image}|${val("apb-type")}|${val("apb-status")}|${unit}|${address}, ${phone}|${contact}|${date}|SIB|APB ${APB_NUMBER}]\nOn ${date}, at approximately ${val("apb-time")} hours, ${val("apb-narrative")}\n\nSheriff's Department is seeking assistance in locating the suspect(s) and is asking anyone with information to please contact the Los Santos County Sheriff's Department${bureau ? ` ${bureau}` : ""} at ${phone}.\n\nIf you have any information, please contact the Los Santos County Sheriff's Department${bureau ? ` ${bureau}` : ""} ${contact} at ${phone} immediately.\n[/bulletin]`;
      }
      let apbPreviewImage = null,
        apbPreviewImageUrl = "",
        apbPreviewImageState = "loading",
        apbPreviewImagePromise = Promise.resolve();
      function updateApbPreview() {
        const canvas = $("apb-preview"),
          ctx = canvas && canvas.getContext("2d");
        if (!ctx) return;
        const value = (id) => $(id).value.trim(),
          imageUrl = value("apb-image") || "https://i.ibb.co/WjtXWwg/No-Avatar.png";
        if (imageUrl !== apbPreviewImageUrl) {
          apbPreviewImageUrl = imageUrl;
          apbPreviewImage = null;
          apbPreviewImageState = "loading";
          const image = new Image();
          image.crossOrigin = "anonymous";
          apbPreviewImagePromise = new Promise((resolve) => {
            image.onload = () => {
              if (apbPreviewImageUrl === imageUrl) {
                apbPreviewImage = image;
                apbPreviewImageState = "ready";
                updateApbPreview();
              }
              resolve();
            };
            image.onerror = () => {
              if (apbPreviewImageUrl === imageUrl) {
                apbPreviewImage = null;
                apbPreviewImageState = "error";
                updateApbPreview();
              }
              resolve();
            };
            image.src = imageUrl;
          });
        }
        const W = canvas.width,
          scale = W / 479,
          headerH = 103 * scale,
          yellowH = 40 * scale,
          statusH = 33 * scale,
          photoSize = 192 * scale,
          photoX = (W - photoSize) / 2,
          photoY = 187 * scale;
        const wrap = (text, font, maxWidth) => {
          ctx.font = font;
          const lines = [];
          String(text || "")
            .split(/\r?\n/)
            .forEach((paragraph) => {
              if (!paragraph) {
                lines.push("");
                return;
              }
              let line = "";
              paragraph.split(/\s+/).forEach((word) => {
                const next = line ? line + " " + word : word;
                if (line && ctx.measureText(next).width > maxWidth) {
                  lines.push(line);
                  line = word;
                } else line = next;
              });
              lines.push(line);
            });
          return lines;
        };
        const drawCentered = (text, font, color, baseline, maxWidth) => {
          ctx.font = font;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(text, W / 2, baseline, maxWidth);
        };
        const textFont = "22px Arial,sans-serif",
          textLine = 28,
          textWidth = W - 34 * scale;
        const date = formatPickerDate(value("apb-date"), "weekday"),
          time = value("apb-time"),
          narrative = value("apb-narrative"),
          bureau = value("apb-bureau"),
          rank = value("apb-rank"),
          name = value("apb-name"),
          contact = [rank, name].filter(Boolean).join(" ") || "";
        let y = photoY + photoSize + 22 * scale;
        const paragraphs = [
          `On ${date || "DATE"}, at approximately ${time || "TIME"} hours, ${narrative || "BULLETIN NARRATIVE"}`,
          `Sheriff's Department is seeking assistance in locating the suspect(s) and is asking anyone with information to please contact the Los Santos County Sheriff's Department${bureau ? " " + bureau : ""} at (888) 901.`,
          `If you have any information, please contact the Los Santos County Sheriff's Department${bureau ? " " + bureau : ""} ${contact} at (888) 901 immediately.`,
        ];
        ctx.font = textFont;
        const textLines = [];
        paragraphs.forEach((paragraph, index) => {
          if (index) y += 12 * scale;
          const lines = wrap(paragraph, textFont, textWidth);
          lines.forEach((line) => {
            y += textLine;
            textLines.push({ line, baseline: y });
          });
        });
        const footerTop = y + 8 * scale,
          footerContactH = 112,
          footerBottomH = 34,
          footerEnd = Math.ceil(footerTop + footerContactH + footerBottomH);
        canvas.height = footerEnd;
        const draw = canvas.getContext("2d");
        draw.fillStyle = "#e5e6e8";
        draw.fillRect(0, 0, W, canvas.height);
        draw.fillStyle = "#07152c";
        draw.fillRect(0, 0, W, headerH);
        const logo = document.querySelector(".brand .logo");
        if (logo && logo.complete && logo.naturalWidth) {
          const maxH = 90 * scale,
            maxW = 72 * scale,
            ratio = logo.naturalWidth / logo.naturalHeight,
            h = Math.min(maxH, maxW / ratio),
            w = h * ratio;
          draw.drawImage(logo, 48 * scale - w / 2, 6 * scale + (maxH - h) / 2, w, h);
        }
        draw.fillStyle = "#fff";
        draw.textAlign = "center";
        draw.textBaseline = "alphabetic";
        draw.font = `24px 'Barlow Condensed',Impact,sans-serif`;
        draw.fillText("LOS SANTOS COUNTY SHERIFF'S DEPARTMENT", W * 0.59, 20 * scale, W * 0.78);
        draw.font = `900 62px Impact,'Barlow Condensed',Arial Narrow,sans-serif`;
        draw.fillText("SPECIAL BULLETIN", W * 0.59, 66 * scale, W * 0.8);
        draw.font = `22px 'Barlow Condensed',Impact,sans-serif`;
        draw.fillText("SHERIFF GRANT MENDEZ", W * 0.59, 94 * scale, W * 0.8);
        draw.fillStyle = "#ffdf00";
        draw.fillRect(0, headerH, W, yellowH);
        drawCentered(
          value("apb-type"),
          `900 36px Impact,'Barlow Condensed',Arial Narrow,sans-serif`,
          "#090909",
          headerH + 31 * scale,
          W - 20 * scale,
        );
        draw.fillStyle = "#55575a";
        draw.fillRect(0, headerH + yellowH, W, statusH);
        drawCentered(
          value("apb-status"),
          `900 24px Impact,'Barlow Condensed',Arial Narrow,sans-serif`,
          "#fff",
          headerH + yellowH + 23 * scale,
          W - 20 * scale,
        );
        draw.fillStyle = "#666";
        draw.fillRect(photoX, photoY, photoSize, photoSize);
        if (apbPreviewImage) {
          const image = apbPreviewImage,
            ratio = Math.max(photoSize / image.naturalWidth, photoSize / image.naturalHeight),
            sw = photoSize / ratio,
            sh = photoSize / ratio,
            sx = (image.naturalWidth - sw) / 2,
            sy = (image.naturalHeight - sh) / 2;
          draw.drawImage(image, sx, sy, sw, sh, photoX, photoY, photoSize, photoSize);
        } else {
          draw.fillStyle = "#fff";
          draw.beginPath();
          draw.arc(W / 2, photoY + photoSize * 0.325, photoSize * 0.25, 0, Math.PI * 2);
          draw.fill();
          draw.beginPath();
          draw.moveTo(photoX + photoSize * 0.07, photoY + photoSize * 0.93);
          draw.bezierCurveTo(
            photoX + photoSize * 0.1,
            photoY + photoSize * 0.68,
            photoX + photoSize * 0.25,
            photoY + photoSize * 0.57,
            W / 2,
            photoY + photoSize * 0.67,
          );
          draw.bezierCurveTo(
            photoX + photoSize * 0.75,
            photoY + photoSize * 0.57,
            photoX + photoSize * 0.9,
            photoY + photoSize * 0.68,
            photoX + photoSize * 0.93,
            photoY + photoSize * 0.93,
          );
          draw.closePath();
          draw.fill();
        }
        draw.textBaseline = "alphabetic";
        draw.fillStyle = "#050505";
        draw.textAlign = "center";
        draw.font = textFont;
        textLines.forEach(({ line, baseline }) => draw.fillText(line, W / 2, baseline, textWidth));
        draw.fillStyle = "#405337";
        draw.fillRect(0, footerTop, W, footerContactH + footerBottomH);
        draw.textAlign = "center";
        draw.textBaseline = "alphabetic";
        draw.font = `700 26px Arial,sans-serif`;
        draw.fillStyle = "#f2bf56";
        draw.fillText("Any information, please contact:", W / 2, footerTop + 20, W - 24 * scale);
        draw.fillStyle = "#fff";
        draw.font = `700 24px Arial,sans-serif`;
        draw.fillText(`LSSD${bureau ? " " + bureau : ""}`, W / 2, footerTop + 44, W - 24 * scale);
        draw.fillText(
          "300 Innocence Boulevard, City of Davis, SA 90220, (888) 901",
          W / 2,
          footerTop + 72,
          W - 24 * scale,
        );
        draw.fillText(
          `ATTENTION: ${contact || "CONTACT NAME"}`,
          W / 2,
          footerTop + 100,
          W - 24 * scale,
        );
        draw.font = `600 22px Arial,sans-serif`;
        draw.textAlign = "left";
        draw.fillText(date || "DATE", 18 * scale, footerEnd - 12 * scale);
        draw.textAlign = "center";
        draw.font = `700 26px Arial,sans-serif`;
        draw.fillText(`APB ${APB_NUMBER}`, W / 2, footerEnd - 12 * scale);
        draw.textAlign = "right";
        draw.font = `600 22px Arial,sans-serif`;
        draw.fillText("Created by SIB", W - 18 * scale, footerEnd - 12 * scale);
        const status = $("apb-preview-status");
        if (status)
          status.textContent =
            apbPreviewImageState === "error"
              ? "Image could not be loaded for the preview; a placeholder is shown."
              : apbPreviewImageState === "loading"
                ? "Loading bulletin image…"
                : "";
      }
      async function downloadApbPng() {
        try {
          updateApbPreview();
          await apbPreviewImagePromise;
          updateApbPreview();
          const canvas = $("apb-preview"),
            blob = await new Promise((resolve, reject) => {
              if (!canvas.toBlob) {
                reject(new Error("PNG export is not supported by this browser"));
                return;
              }
              canvas.toBlob(
                (file) => (file ? resolve(file) : reject(new Error("Could not create APB PNG"))),
                "image/png",
              );
            });
          const bureau = $("apb-bureau")
              .value.trim()
              .replace(/[^A-Za-z0-9-]+/g, "_"),
            url = URL.createObjectURL(blob),
            link = document.createElement("a");
          link.href = url;
          link.download = `apb${bureau ? "-" + bureau : ""}.png`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Download started");
        } catch (error) {
          console.error("APB PNG download failed:", error);
          toast("Download failed");
        }
      }
      function resetApb() {
        ["apb-image", "apb-name", "apb-time", "apb-narrative", "apb-bureau"].forEach(
          (id) => ($(id).value = ""),
        );
        $("apb-type").selectedIndex = 0;
        $("apb-status").selectedIndex = 0;
        $("apb-date").value = apbTodayDate();
        updateTaskListDateLabel("apb-date");
        $("apb-rank").value = "";
        $("apb-rank").dataset.deputyPrefill = "";
        $("apb-name").dataset.deputyPrefill = "";
        $("apb-bureau").dataset.deputyPrefill = "";
        applyDeputyDetails();
        updateApbPreview();
      }
      function initializeApb() {
        if (!$("apb-date").value) $("apb-date").value = apbTodayDate();
        applyDeputyDetails();
      }
      function addKingAssociatedReport(url = "", text = "") {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `<div class='ih'><b>Associated Report</b><button class='b' type='button' onclick="this.closest('.item').remove()">Remove</button></div><div class='g'><div class='f'><span>URL</span><input type='text' class='king-report-url' placeholder='https://...' value=''></div><div class='f'><span>Report Name</span><input type='text' class='king-report-text' placeholder='Arrest Report - John Doe' value=''></div></div>`;
        row.querySelector(".king-report-url").value = url;
        row.querySelector(".king-report-text").value = text;
        $("king-associated-reports").appendChild(row);
      }
      function buildKingPatrol() {
        const value = (id) =>
            id === "king-report-date" ? formatPickerDate($(id).value, "short") : $(id).value.trim(),
          reports = [...document.querySelectorAll("#king-associated-reports .item")]
            .map((row) => {
              const url = row.querySelector(".king-report-url").value.trim(),
                text = row.querySelector(".king-report-text").value.trim();
              return url && text ? `[*][url=${url}]${text}[/url]` : "";
            })
            .filter(Boolean),
          reportList = reports.length ? reports : ["[*]D.N.A"];
        const instructions = `[b]INSTRUCTIONS:[/b] Please fill out the "Associated Reports" section if you handle/fill out any reports during your King patrol. Provide the link in the specified area and also include a general name for the report (i.e. Arrest Report - John Doe). If you do not use/need the reports section, please fill in the "REPORT NAME" with D.N.A.

For the "Patrol Narrative", please try and use general timestamps to log your patrol (i.e. 1345 - Traffic stop on a black sedan, Hawick Avenue. I noticed the vehicle driving quite recklessly and it was picked up on my dashcam. I decided to pull the vehicle over and the plates read, XXXXXX. After approaching the driver and asking for a backup unit, I decided to issue a citation for reckless driving). Again, this is an example, but please provide depth to the scenarios you find yourself in during the patrol. However, utilize time stamps to track everything that you encounter during your patrol. For example:
[list][*]1600 - Start of patrol under 111 King.
[*]1622 - I performed a traffic stop on a black Asbo on Elgin Avenue. I required a backup unit since the vehicle matched the description from a crime broadcast from earlier. You could then expand on that and write about what occurred before or after, for example.
[*]1648 - 923s were heard around Davis LTD. Utilize that to write about what you did, did you respond? Did you find the shooter? All of this can be included.
[*]1700 - End of patrol.[/list]`;
        return [
          "[center][color=Transparent][/color]",
          "[img]https://i.postimg.cc/gjxmBXm7/image.png[/img]",
          "",
          "[color=grey][size=100]LOS SANTOS COUNTY SHERIFF'S DEPARTMENT[/size][/color]",
          "[color=black][size=150][b]FIELD TRAINING KING PATROL LOG[/b][/size][/color]",
          "[/center]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][b]REPORT DATE[/b][/td]",
          "[td][b]REPORT TIME[/b][/td]",
          "[td][b]PATROL #[/b][/td]",
          "[/tr]",
          "[tr]",
          `[td]${value("king-report-date") || "DD/MON/YYYY"}[/td]`,
          `[td]${value("king-report-time")}[/td]`,
          `[td]${value("king-patrol-number")}[/td]`,
          "[/tr]",
          "[/transtable]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][b]TRAINEE NAME[/b][/td]",
          "[td][b]EMPLOYEE NUMBER[/b][/td]",
          "[td][b]CALLSIGN[/b][/td]",
          "[/tr]",
          "[tr]",
          `[td]${value("king-trainee-name")}[/td]`,
          `[td]${value("king-employee-number")}[/td]`,
          `[td]${value("king-callsign")}[/td]`,
          "[/tr]",
          "[/transtable]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][b][center]ASSOCIATED REPORTS & PATROL NARRATIVE[/center][/b][/td]",
          "[/tr]",
          "[/transtable]",
          "[hr][/hr]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][justify]" + instructions + "[/justify][/td]",
          "[/tr]",
          "[/transtable]",
          "[hr][/hr]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][b]ASSOCIATED REPORTS[/b][/td]",
          "[/tr]",
          "[tr]",
          "[td][list]",
          ...reportList,
          "[/list][/td]",
          "[/tr]",
          "[/transtable]",
          "[hr][/hr]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][b]PATROL NARRATIVE[/b][/td]",
          "[/tr]",
          "[tr]",
          "[td]",
          value("king-narrative"),
          "[/td]",
          "[/tr]",
          "[/transtable]",
          "[hr][/hr]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][b][center]SIGNATURE[/center][/b][/td]",
          "[/tr]",
          "[/transtable]",
          "[hr][/hr]",
          "",
          "[transtable=Arial]",
          "[tr]",
          "[td][b]TRAINEE SIGNATURE[/b][/td]",
          "[td][b]DATE[/b][/td]",
          "[/tr]",
          "[tr]",
          `[td][i]${value("king-signature")}[/i][/td]`,
          `[td]${value("king-signature-date") || "DD/MON/YYYY"}[/td]`,
          "[/tr]",
          "[/transtable]",
        ].join("\n");
      }
      function initializeKingPatrol() {
        if (!$("king-report-date").value) $("king-report-date").value = taskListTodayDate();
        if (!$("king-signature-date").value) $("king-signature-date").value = kingTodayDate();
        if (!$("king-associated-reports").children.length) addKingAssociatedReport();
        applyDeputyDetails();
      }
      function resetKingPatrol() {
        ["king-report-time", "king-patrol-number", "king-callsign", "king-narrative"].forEach(
          (id) => ($(id).value = ""),
        );
        $("king-report-date").value = taskListTodayDate();
        updateTaskListDateLabel("king-report-date");
        $("king-signature-date").value = kingTodayDate();
        $("king-associated-reports").replaceChildren();
        addKingAssociatedReport();
        applyDeputyDetails();
      }
      const citP3 = [
          "$2,500",
          "$5,000",
          "$7,500 + 2 Days Vehicle Impound + 3 Days Suspension License",
        ],
        citImp = [
          "$5,000 + 1 Day Vehicle Impound + 3 Day License Suspension",
          "$5,000 + 1 Day Vehicle Impound",
        ],
        citInfractions = [
          ["403", "Failure to Produce Driver's License (I)", ["$1,000"]],
          ["404", "Failure to Produce Vehicle Registration (I)", ["$1,000"]],
          ["405", "Failure to Produce Proof of Insurance (I)", ["$1,000"]],
          ["406", "Unregistered Vehicle (I)", citImp],
          ["407", "No Insurance (I)", citImp],
          [
            "410",
            "Speeding (I)",
            ["$2,500", "$5,000", "$8,000 + 2 Days Impounding Vehicle + 3 Days Suspension License"],
          ],
          [
            "411",
            "Excessive Speeding (I)",
            [
              "$8,000",
              "$8,000 + 2 Days Suspension License + 1 Day Vehicle Impound",
              "$12,000 + 4 Days Suspension License + 3 Days Vehicle Impound",
              "$15,000 + 7 Days Suspension License + 7 Days Vehicle Impound",
              "$20,000 + 10 Days Suspension License + 10 Days Vehicle Impound",
            ],
          ],
          ["412", "Failure to Yield/Stop to a Traffic Control Device (I)", citP3],
          ["413", "Failure to Yield at Intersection (I)", citP3],
          ["414", "Failure to Yield Entering Roadway (I)", citP3],
          ["415", "Failure to Yield for Crosswalk (I)", citP3],
          ["416", "Failure to Yield to an Emergency Vehicle (I)", citP3],
          ["417", "Improper Lane Entry while Turning (I)", citP3],
          ["421", "Drive Without Headlights (I)", ["$2,500"]],
          ["422", "Unsafe Reversing (I)", citP3],
          ["423", "Obstructing Traffic (I)", citP3],
          ["424", "Driving Against One-Way Traffic (I)", citP3],
          ["425", "Imprudent Driving (I)", citP3],
          ["428", "Illegal Usage of Hydraulics (I)", citP3],
          ["429", "Tinted Windows (I)", ["$1,000", "$2,500", "$5,000"]],
          ["434", "Possession of Open Container (I)", ["$1,000"]],
          ["435", "Failure to Wear a Seatbelt/Safety Equipment (I)", ["$1,000"]],
          ["436", "Operation of Unsafe Motor Vehicle (I)", ["$2,000 + 2 Days Vehicle Impound"]],
          [
            "442",
            "Operation of an Unauthorized Vehicle on Vespucci Beach (I)",
            ["$2,500", "$5,000", "$7,500 + 3 Day Vehicle Impound + 3 Day License Suspension"],
          ],
        ];
      const citEsc = (x) =>
        String(x ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      function citDate() {
        const v = $("citation-date").value;
        if (!v) return "";
        const d = taskListDateFromValue(v);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      }
      function citNow() {
        return new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      }
      function numberCitationRows() {
        document
          .querySelectorAll("#citation-rows .cit-row")
          .forEach((r, i) => (r.querySelector(".cit-label").textContent = `Infraction #${i + 1}`));
      }
      function updateCitationTotal() {
        let t = 0;
        document
          .querySelectorAll("#citation-rows .cit-pen")
          .forEach((i) =>
            (i.value.match(/\$[\d,]+/g) || []).forEach(
              (m) => (t += Number(m.replace(/[$,]/g, ""))),
            ),
          );
        $("citation-total").value = "$" + t.toLocaleString();
      }
      function addCitationInfraction() {
        const row = document.createElement("div");
        row.className = "item cit-row";
        row.innerHTML = `<div class='ih'><b class='cit-label'></b><button class='b' type='button'>Remove</button></div><div class='g'><div class='f'><span>Infraction</span><select class='cit-code'><option value=''>Select infraction</option>${citInfractions.map((i) => `<option value='${i[0]}'>${i[0]} — ${i[1]}</option>`).join("")}</select></div><div class='f'><span>Occurrence</span><select class='cit-occ' disabled></select></div></div><div class='f'><span>Penalty / Fine</span><input type='text' class='cit-pen' readonly></div>`;
        const code = row.querySelector(".cit-code"),
          occ = row.querySelector(".cit-occ"),
          pen = row.querySelector(".cit-pen");
        row.querySelector(".ih .b").onclick = () => {
          row.remove();
          numberCitationRows();
          updateCitationTotal();
        };
        code.onchange = () => {
          const it = citInfractions.find((i) => i[0] === code.value);
          occ.innerHTML = "";
          if (!it) {
            occ.disabled = true;
            pen.value = "";
            updateCitationTotal();
            return;
          }
          it[2].forEach((x, i) => occ.add(new Option(`Occurrence ${i + 1}`, i)));
          occ.disabled = it[2].length <= 1;
          occ.value = "0";
          pen.value = it[2][0];
          updateCitationTotal();
        };
        occ.onchange = () => {
          const it = citInfractions.find((i) => i[0] === code.value);
          if (it) pen.value = it[2][Number(occ.value)] || "";
          updateCitationTotal();
        };
        $("citation-rows").appendChild(row);
        numberCitationRows();
      }
      function citationNarrative() {
        const v = (id) => $(id).value.trim(),
          c = (id) => $(id).checked,
          def = v("citation-defendant"),
          out = [];
        let o = "";
        if (c("citation-n-officer"))
          o = `I am ${v("citation-rank")}, ${v("citation-officer")}, currently employed by the Los Santos Sheriffs Department working within the Traffic Services Detail as a qualified Traffic Investigator. On ${citDate()} ${v("citation-time")},`;
        if (c("citation-n-area"))
          o += ` I was conducting area enforcement on ${v("citation-location")} in a department-issued vehicle fitted with a calibrated Stalker DSR 2X Direction Sensing Radar device and also PIPS Technology PAGIS ALPR.`;
        if (c("citation-n-stop"))
          o += ` After observing the ${v("citation-model")} ${v("citation-plate")} commit a traffic violation, I conducted a traffic stop on the vehicle with the driver identifying themself with their ID as ${def}.`;
        if (o.trim()) out.push(o.trim());
        const vn = v("citation-model") || "[VEHICLE MAKE AND MODEL]",
          g = (id, d) => v(id) || d;
        if (c("citation-n-speeding"))
          out.push(
            `I observed ${vn} travelling along ${g("citation-sp-street", "[STREET NAME]")} where it activated my radar at a speed of ${g("citation-sp-speed", "[INSERT SPEED]")} in a ${g("citation-sp-zone", "[INSERT SPEED]")} zone.`,
          );
        if (c("citation-n-xspeeding"))
          out.push(
            `I observed ${vn} travelling along ${g("citation-xs-street", "[STREET NAME]")} where it activated my radar at a speed of ${g("citation-xs-speed", "[INSERT SPEED]")} in a ${g("citation-xs-zone", "[INSERT SPEED]")} zone, this speed is in excess of 30MPH over the posted limit and thus constitutes excessive speeding.`,
          );
        if (c("citation-n-noins"))
          out.push(
            `After conducting checks on the ${vn} I established that it had no valid policy of insurance, the previous insurance that was held on the vehicle expired on ${g("citation-ni-date", "[INSERT DATE]")} at ${g("citation-ni-time", "[INSERT TIME]")} so at the time of the stop being ${g("citation-ni-stop", v("citation-time") || "[COPIED FROM TIME]")} it had no valid insurance.`,
          );
        if (c("citation-n-yield"))
          out.push(
            `Whilst on ${g("citation-y-street", "[STREET NAME]")} I observed a ${vn} travelling ${g("citation-y-dir", "[DIRECTION]")} towards the intersection with ${g("citation-y-cross", "[STREET NAME]")}, as the vehicle approached it did not yield the right of way to the other vehicle present in the intersection and instead progressed through it with no regard for the other users of the road.`,
          );
        if (v("citation-free")) out.push(v("citation-free"));
        if (c("citation-n-citation"))
          out.push(
            `After conducting checks and interacting with ${def} I issued them with citation(s) for the traffic offences I witnessed them commit, outlined in section 6. I also then informed them that the citation must either be paid or appealed within 28 days of its issue date, with an appeal contesting the violation in court under (San Andreas Penal Code 1007), and that payment of the citation constitutes a legal admission of guilt, which results in automatic case dismissal if appealed (SA People v. Wyse). I also informed them that failing to pay or appeal could result in a warrant being issued for the unpaid fine(s) that authorises peace officers to seize or impound personal assets to cover the amount owed and can lead to additional penalties such as a driver's license suspension (San Andreas Penal Code 1210 & 1211).`,
          );
        return out;
      }
      function updateCitationPreview() {
        [
          ["speeding", "sp"],
          ["xspeeding", "xs"],
          ["noins", "ni"],
          ["yield", "y"],
        ].forEach(([k, w]) => ($(`citation-${w}-wrap`).hidden = !$(`citation-n-${k}`).checked));
        if ($("citation-same-owner").checked)
          $("citation-owner").value = $("citation-defendant").value;
        const dash = $("citation-dash").checked,
          type = document.querySelector('input[name="citation-dash-type"]:checked')?.value;
        $("citation-picture-wrap").hidden = !$("citation-radar").checked;
        $("citation-dash-opts").hidden = !dash;
        $("citation-dash-written").hidden = !(dash && type === "written");
        $("citation-dash-video").hidden = !(dash && type === "video");
        $("citation-preview").innerHTML = citationNarrative()
          .map((p) => `<p style="white-space:pre-wrap">${citEsc(p)}</p>`)
          .join("");
        $("citation-report-preview").innerHTML = buildCitation();
      }
      function buildCitation() {
        const v = (id) => $(id).value,
          E = citEsc,
          H = "font-family:Arial,sans-serif;font-weight:700;font-size:1.125rem;",
          B = "border:1px solid black;padding:.5rem;",
          cell = (l, x) => `<td style="${B}"><strong>${l}</strong><br>${E(x)}</td>`,
          tb = (rows) =>
            `<table style="width:100%;border-collapse:collapse;margin-top:.75rem;">${rows.map((r) => `<tr>${r.join("")}</tr>`).join("")}</table>`,
          sec = (t, x) =>
            `<tr><td style="padding:1rem;border-top:2px solid black;"><div style="${H}">${t}</div>${x}</td></tr>`,
          box = (x, m) => `<div style="${B}min-height:${m}px;margin-top:.75rem;">${x}</div>`,
          p = (x) => `<p style="margin:0 0 .75rem 0;white-space:pre-wrap;">${x}</p>`;
        let rows = "";
        document.querySelectorAll("#citation-rows .cit-row").forEach((r) => {
          const it = citInfractions.find((i) => i[0] === r.querySelector(".cit-code").value);
          if (!it) return;
          rows += `<tr><td style="${B}">${E(it[0])}</td><td style="${B}">${E(it[1])}</td><td style="${B}">Occurrence ${Number(r.querySelector(".cit-occ").value || 0) + 1}</td><td style="${B}white-space:normal;overflow:visible;word-break:normal;overflow-wrap:break-word;line-height:1.4;">${E(r.querySelector(".cit-pen").value)}</td></tr>`;
        });
        if (!rows) rows = `<tr><td colspan="4" style="${B}">No infractions entered.</td></tr>`;
        const th = (t) => `<th style="${B}background-color:#e5e7eb;">${t}</th>`,
          nar = citationNarrative(),
          narHTML = nar.length
            ? nar.map((x) => p(E(x))).join("")
            : '<p style="margin:0;min-height:150px;"></p>',
          ini = v("citation-officer")
            .split(/\s+/)
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          ev = [];
        if ($("citation-radar").checked)
          ev.push(
            p(
              `I took a picture of the reading displayed and locked in on my Stalker DSR 2X Direction Sensing Radar device and exhibit this as ${E(ini)}-01`,
            ) + p(`Exhibit ${E(ini)}-01 — Photograph: ${E(v("citation-picture").trim())}`),
          );
        if ($("citation-dash").checked) {
          const t = document.querySelector('input[name="citation-dash-type"]:checked')?.value;
          if (t === "written")
            ev.push(
              `<p style="margin:0 0 .5rem 0;"><strong>Dashcam Footage — Written</strong></p><div style="${B}white-space:pre-wrap;min-height:80px;">${E(v("citation-dash-text").trim())}</div>`,
            );
          else if (t === "video")
            ev.push(
              `<p style="margin:0 0 .5rem 0;"><strong>Dashcam Footage — Video Link</strong></p><p style="margin:0;word-break:break-all;">${E(v("citation-dash-link").trim())}</p>`,
            );
        }
        const outc = [
          $("citation-out-license").checked && "LICENSE SUSPENDED",
          $("citation-out-impound").checked && "VEHICLE IMPOUNDED",
        ].filter(Boolean);
        return (
          `<table style="width:100%;font-family:'Times New Roman',serif;border-collapse:collapse;border:4px solid black;background-color:white;color:black;"><tr><td style="padding:1rem;border-bottom:2px solid black;text-align:center;"><div style="font-family:Arial,sans-serif;font-size:2rem;font-weight:700;">LOS SANTOS SHERIFF DEPARTMENT</div><div style="font-family:Arial,sans-serif;font-size:1.5rem;font-weight:600;margin-top:.25rem;">TRAFFIC SERVICES DETAIL</div><div style="font-family:Arial,sans-serif;font-size:1.5rem;font-weight:600;">INFRACTION REPORT</div></td></tr>` +
          sec(
            "1. GENERAL INFORMATION",
            tb([[cell("Date", citDate()), cell("Time", v("citation-time"))]]),
          ) +
          sec(
            "2. OFFICER INFORMATION",
            tb([
              [cell("Officer", v("citation-officer")), cell("Rank", v("citation-rank"))],
              [cell("Badge", v("citation-badge")), cell("Callsign", v("citation-callsign"))],
            ]),
          ) +
          sec(
            "3. DEFENDANT INFORMATION",
            tb([
              [
                cell("Full Name", v("citation-defendant")),
                cell("License Status", v("citation-license")),
              ],
            ]),
          ) +
          sec(
            "4. VEHICLE INFORMATION",
            tb([
              [
                cell("Make &amp; Model", v("citation-model")),
                cell("Identification Plate", v("citation-plate")),
              ],
              [
                cell("Registered Owner", v("citation-owner")),
                cell("Tint Level", v("citation-tint")),
              ],
            ]),
          ) +
          sec("5. LOCATION OF INFRACTION", tb([[cell("Location", v("citation-location"))]])) +
          sec(
            "6. CITATIONS / INFRACTIONS",
            `<table style="width:100%;border-collapse:collapse;margin-top:.75rem;table-layout:auto;"><tr>${th("Code")}${th("Infraction")}${th("Occurrence")}${th("Penalty / Fine").replace("background-color:#e5e7eb;", "background-color:#e5e7eb;min-width:280px;")}</tr>${rows}</table>` +
              tb([[cell("Total Fines", v("citation-total"))]]) +
              `<div style="${B}padding:.75rem;margin-top:.75rem;"><strong>Enforcement Outcome</strong><div style="margin-top:.5rem;">${outc.length ? outc.map((x) => `<div>${x}</div>`).join("") : '<div style="min-height:40px;"></div>'}</div></div>`,
          ) +
          sec("7. NARRATIVE", box(narHTML, 150)) +
          sec(
            "8. EVIDENCE",
            box(
              ev.length
                ? ev.join('<div style="border-top:1px solid black;margin:.75rem 0;"></div>')
                : '<p style="margin:0;min-height:100px;"></p>',
              100,
            ),
          ) +
          "</table>"
        );
      }
      async function copyCitation() {
        const txt = buildCitation();
        try {
          await navigator.clipboard.writeText(txt);
          toast("Copied!");
        } catch (e) {
          const a = document.createElement("textarea");
          a.value = txt;
          document.body.appendChild(a);
          a.select();
          try {
            document.execCommand("copy");
            toast("Copied!");
          } catch (e2) {
            toast("Copy failed");
          }
          a.remove();
        }
      }
      function resetCitation() {
        [
          "citation-time",
          "citation-callsign",
          "citation-defendant",
          "citation-model",
          "citation-plate",
          "citation-owner",
          "citation-location",
          "citation-free",
          "citation-picture",
          "citation-dash-text",
          "citation-dash-link",
          "citation-officer",
          "citation-rank",
          "citation-badge",
          "citation-sp-street",
          "citation-sp-speed",
          "citation-sp-zone",
          "citation-xs-street",
          "citation-xs-speed",
          "citation-xs-zone",
          "citation-ni-date",
          "citation-ni-time",
          "citation-ni-stop",
          "citation-y-street",
          "citation-y-dir",
          "citation-y-cross",
        ].forEach((id) => ($(id).value = ""));
        $("citation-date").value = taskListTodayDate();
        updateTaskListDateLabel("citation-date");
        $("citation-time").value = citNow();
        $("citation-license").selectedIndex = 0;
        $("citation-tint").selectedIndex = 0;
        [
          "citation-same-owner",
          "citation-out-license",
          "citation-out-impound",
          "citation-radar",
          "citation-dash",
          "citation-n-speeding",
          "citation-n-xspeeding",
          "citation-n-noins",
          "citation-n-yield",
        ].forEach((id) => ($(id).checked = false));
        ["citation-n-officer", "citation-n-area", "citation-n-stop", "citation-n-citation"].forEach(
          (id) => ($(id).checked = true),
        );
        document
          .querySelectorAll('input[name="citation-dash-type"]')
          .forEach((r) => (r.checked = false));
        $("citation-rows").replaceChildren();
        addCitationInfraction();
        updateCitationTotal();
        applyDeputyDetails();
        updateCitationPreview();
      }
      function initializeCitation() {
        $("citation-date").value = taskListTodayDate();
        $("citation-time").value = citNow();
        addCitationInfraction();
        applyDeputyDetails();
        updateCitationPreview();
        $("f-citation").addEventListener("input", updateCitationPreview);
        $("f-citation").addEventListener("change", updateCitationPreview);
        $("f-citation").addEventListener("click", updateCitationPreview);
      }
      function show(k) {
        const via = k === "davis-citation" ? k : null; // the Citation form, reached from the Davis Station menu
        if (via) k = "citation";
        [
          "home",
          "sheriff",
          "arrest-report",
          "incident",
          "uof",
          "king-patrol",
          "apb",
          "supp",
          "notices",
          "notices-commendations",
          "iab-prelim",
          "uof-supp",
          "task-list",
          "subject",
          "tc",
          "trespass",
          "impound",
          "lab",
          "fleet",
          "dforensics",
          "nccit",
          "nccit-supp",
          "senora-k9-deployment",
          "senora-logbook",
          "citation",
          "sib-story",
          "sib-activity",
          "oss-incident",
          "oss-supplemental",
          "davis-k9-deployment",
          "csd-k9-deployment",
          "vst-request",
          "cfid",
          "met-incident",
          "k9-emc",
          "k9-checkup",
          "vet-lab-report",
          "forensic-lab",
          "ftp-phase1",
          "ftp-phase2",
          "ftp-phase3",
          "ftp-fto-eval",
          "peu-letters",
          "peu-admin",
          "credits",
          "mcb-poi",
          "mcb-case",
          "mcb-supplemental",
          "nb-poi",
          "hb-poi",
          "hb-case",
          "hb-supplemental",
          "ossb-poi",
          "arrest-warrant",
          "search-warrant",
          "electronic-surveillance-warrant",
          "financial-service-warrant",
          "updates",
          "card",
          "email",
          "depmail",
          "deputy",
        ].forEach((x) => {
          $("f-" + x).hidden = x !== k;
          $("nv-" + x).classList.toggle("on", x === k && !via);
        });
        $("nv-davis-citation").classList.toggle("on", !!via);
        document
          .querySelectorAll(".nav-group")
          .forEach((group) => group.classList.toggle("active", !!group.querySelector(".nav.on")));
        if (k !== "home") revealBu($(via ? "nv-davis-citation" : "nv-" + k));
        if (k === "nccit" || k === "nccit-supp") growAllTextareas("f-" + k);
        $("ttl").textContent = {
          home: "Home",
          sheriff: "Sheriff's Report System",
          "arrest-report": "Arrest Report",
          incident: "Incident Report",
          uof: "Use of Force Report",
          "king-patrol": "King Patrol Report",
          apb: "APB",
          supp: "Supplemental Report",
          notices: "Notice Board — Bonus Assignments, Bonus Removals",
          "notices-commendations": "Notice Board — Commendations",
          "iab-prelim": "IAB — UOF - Preliminary Review",
          "uof-supp": "Supplemental Use of Force Report",
          "task-list": "Task List",
          subject: "Subject Information",
          tc: "Traffic Collision Report",
          trespass: "Trespass Notice",
          impound: "Impound Report",
          lab: "Laboratory Services Requests",
          fleet: "Fleet Maintenance Requests",
          dforensics: "Digital Forensics Requests",
          nccit: "NCCIT — Personnel File",
          "nccit-supp": "NCCIT — Supplemental",
          "senora-k9-deployment": "K9 — Deployment Log",
          "senora-logbook": "Senora Station — Logbook",
          citation: "TSD — Citation",
          "sib-story": "SIB — Story",
          "sib-activity": "SIB — Activity Tracker",
          "oss-incident": "OSS — Case Package",
          "oss-supplemental": "OSS — Supplemental",
          "ftp-phase1": "FTP — Phase 1 Patrol Summary",
          "ftp-phase2": "FTP — Phase 2 Report",
          "ftp-phase3": "FTP — Phase 3 Evaluation",
          "ftp-fto-eval": "FTP — FTO Evaluation Patrol Report",
          "peu-letters": "PEU — Applicant Letters",
          "peu-admin": "PEU — Administrative File",
          credits: "Credits",
          "mcb-poi": "Person of Interest File",
          "mcb-case": "MCB — Case Package",
          "mcb-supplemental": "MCB — Supplemental Report",
          "nb-poi": "Person of Interest File",
          "hb-poi": "Person of Interest File",
          "hb-case": "HB — Case Package",
          "hb-supplemental": "HB — Supplemental Report",
          "ossb-poi": "Person of Interest File",
          "davis-k9-deployment": "K9 — Deployment Log (Davis)",
          "csd-k9-deployment": "K9 — Deployment Log (CSD)",
          "vst-request": "VST — Veterinary Services Request",
          cfid: "PSB — Crisis and Field Intervention Database",
          "met-incident": "PSB — MET Incident Report",
          "k9-emc": "VST — K9 Emergency Medical Care Report",
          "k9-checkup": "VST — K9 Checkup Card",
          "vet-lab-report": "VST — Laboratory Services Report",
          "forensic-lab": "SSB — Forensic Lab Workspace",
          "arrest-warrant": "Arrest Warrant",
          "search-warrant": "Search Warrant",
          "electronic-surveillance-warrant": "Electronic Surveillance Warrant",
          "financial-service-warrant": "Financial Service Warrant Request",
          updates: "Release Notes",
          card: "Business Card Generator",
          email: "Correspondence",
          depmail: "Email Template",
          deputy: "Character Details",
        }[k];
        $("si").classList.remove("open");
        updateCharacterDetailsPrompt();
      }
      function num() {
        document
          .querySelectorAll("#persons .item .pn")
          .forEach((e, i) => (e.textContent = "Person #" + (i + 1)));
      }
      let personUid = 0;
      function personNameHead(nameClass, placeholder) {
        return `<div class='f p-full'><div class='pd-head'><span class='pd-title'>Forename Surname</span><label class='pchk dead'><input type='checkbox' class='pd-dead'><i class='mk' aria-hidden='true'></i><span>Deceased</span></label></div><input type='text' class='${nameClass}' placeholder='${placeholder || ""}'></div>`;
      }
      function personDeathPanel() {
        const u = ++personUid;
        const seg = (cls, name, items) =>
          `<div class='seg' role='radiogroup'>${items
            .map(
              ([val, text], i) =>
                `<input type='radio' class='${cls}' name='${name}-${u}' id='${name}-${u}-${i}' value='${val}'><label for='${name}-${u}-${i}'>${text}</label>`,
            )
            .join("")}</div>`;
        return `<div class='pd-panel' hidden><div class='pd-line'><div class='pd-grp'><span class='pd-lbl'>Death type</span>${seg("pd-type", "pd-type", [["PK", "PK"], ["CK", "CK"]])}</div><div class='pd-grp pd-gender-grp' hidden><span class='pd-lbl'>Gender (for John / Jane Doe)</span>${seg("pd-gender", "pd-gender", [["Male", "Male"], ["Female", "Female"]])}</div></div><div class='pd-preview'>Name in report: <b class='pd-out'></b> <span class='pd-hint'></span></div><div class='f'><span>OOC Death Details</span><textarea class='pd-ooc' placeholder='Collect a picture of /cdna, /cexamine and /cdamages.'></textarea></div></div>`;
      }
      function personDeathState(row) {
        const type = row.querySelector(".pd-type:checked"),
          gender = row.querySelector(".pd-gender:checked");
        return {
          dead: row.querySelector(".pd-dead").checked,
          type: type ? type.value : "",
          gender: gender ? gender.value : "",
          ooc: row.querySelector(".pd-ooc").value.trim(),
        };
      }
      // Name as it appears in the BBCode. MDC link / image always use the real name.
      function personDisplayName(row, real) {
        const s = personDeathState(row);
        if (s.dead && s.type === "PK" && s.gender)
          return `${s.gender === "Female" ? "Jane" : "John"} Doe (( ${real || "Forename Surname"} ))`;
        return real;
      }
      function initPersonDeath(row, getReal) {
        const panel = row.querySelector(".pd-panel"),
          genderGrp = row.querySelector(".pd-gender-grp"),
          out = row.querySelector(".pd-out"),
          hint = row.querySelector(".pd-hint");
        const refresh = () => {
          const s = personDeathState(row);
          panel.hidden = !s.dead;
          genderGrp.hidden = !(s.dead && s.type === "PK");
          out.textContent = personDisplayName(row, getReal()) || getReal() || "Forename Surname";
          hint.textContent = !s.dead
            ? ""
            : !s.type
              ? "- choose PK or CK"
              : s.type === "PK" && !s.gender
                ? "- choose Male or Female"
                : "";
        };
        row.addEventListener("input", refresh);
        row.addEventListener("change", refresh);
        refresh();
      }
      function personAdvanced(inner, summary) {
        return `<details class='p-adv'><summary>${summary}</summary><div class='padv'>${inner}</div></details>`;
      }
      // ---- shared photo preview (MDC image, auto-generated from a person's name) ----
      const PERSON_DEFAULT_IMG = "https://i.imgur.com/4FqUxmw.png";
      // The same default avatar embedded in the page, used for the on-page preview only, so the
      // preview never depends on Imgur being reachable (Imgur is blocked for UK visitors).
      // Fields and BBCode still use PERSON_DEFAULT_IMG.
      const PERSON_DEFAULT_PREVIEW = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAIAAACzY+a1AAAP20lEQVR4nOyd62/T1v/449iJEydtLi1JL9AkJKVdw0aBtist5ToGE2hFmwZosAtoY9VAPNnfMU3TNqHBpglpaEJi2kWbYKwa2thEt9I19DKgF2VACwptSdPEiZ3YPj8p/vz6RQwa53aOXfx6nPi821fO/fh9iMOHD2tUlIwWdQAq+aIqVDyqQsWjKlQ8qkLFoypUPKpCxaMqVDyqQsVDoA6gYAAA+P+PIAhYmv9+BgCAPwCiYAuJ4hXyPJ9MJnme1+v1paWldrvd6XTabDaLxVJSUkIQBABA/CTLsnNzc5FIZDrN/fv3Y7EYz/O6NFqtUhskpSoUBIFhGACAzWZraGior6/3eDyVlZVWq1XK13men5qampiYGE0zMTERi8V0Op1er/9v3ZU5mOKWuTmOYxjGbDbX19c3Nzc3NDTY7fZ8HggAuHXrViAQ6Ovru3nzpiAIBoNBQZVSSQpFeWVlZevWrWtvb6+pqSn484eHh3/99ddAIJBMJimKUkSNVIZCAABN01ardfPmzVu2bMmz2mVkZGTk/Pnzf//9NwDAYDAUtaz8UUBfyLIsAGDTpk0vvvii0+mEUOKKNFevXv3mm29GRkYoipLz2BVfu3Yt6hgei1j5qqur33777Z07d5rNZpilV1RUtLe3GwyGkZERhmF0Oh3M0qUjX4U8zycSiU2bNh05cqTg3Z5EcByvq6vz+/3BYPDevXt6vR5JGAsjR4UYhiWTSY1Gc+DAgVdeeQX5P85ut7e2tobD4bGxMYIg5DbGkZ1CDMMSiQRFUUePHm1ra0Mdzv/Q6XTNzc0ajWZwcBDHcVlNOeSlEMOweDxut9vfe++9uro61OE8TENDg8lkCgQC2jSow/kfMlIo1j/Rn8vlQh3Oo/H5fBaL5cqVK/KxKCOFyWTSZDLJ2Z+Ix+MxGo39/f0y6RflopDjOI1Gc+zYsRUrVqCOJTO1tbUsyw4NDZEkiToWeewXAgBYlj1w4MDKlStRxyKVffv2NTU1xWIx1IHIQ2EsFtu0adOWLVtQB5IFGIa99dZblZWVLMuijQS9QoZhXC7Xq6++ijqQrCktLX3jjTfEnS+EYSBWCADAMOzAgQMURaGNJDeefvrp5557jqZphDEgVkjTdEdHh9/vRxtGPuzevbuqqkpcTkICSoUcx1mt1t27dyOMIX/MZnNnZ2cqlUIVAEqFDMNs27atrKwMYQwFoa2tzefzMQyDpHRkCjmOW7JkydatW1EFUEBwHN++fTvP80hKR6aQYZi2traSkhJUARSWlpYWj8eDZIKBRqEgCGazecOGDUhKLwY4jnd0dCDpEdEoZBjG7/dXVFQgKb1INDc32+12caUQJmgUAgBaWlqQFF08bDZbfX09/LYUgUKO48rKyhoaGuAXXWxWr14Nf+8CgcJkMun1ektLS+EXXWyeeuopi8UCeWiKQKEgCDLckS8INptt2bJlkAc1sBUCAEiSXL58OeRyoeH1eiGPaGAr5HneYrFUVlZCLhcaLpcLx/H516kgAFshx3Hl5eWQD/XCpLKy0mAwLGaFPM87HA7IhcLEarWWlJTAHNEg6AsXwbr2AlAUVVJSAnMTGMGI1GKxwC8UGlqtdpErxHFcoRv00qEoatH2heIxC/m/sZcner1+0SoUgfnnIQHybxT9CbbFB+QDbarCwsMwDMzFbqgKMQwTBCGRSMAsFD6QT7MhmNrL4RB7UYnFYjBfeoKtEMOw2dlZyIXChOO4aDS6mBVqtdrp6WnIhcIkFostcoU4jk9NTaF9CaGoiKndYCY5ga2QIIjp6elIJAK5XGhMTEywLLtoR6RiQxqNRicmJiCXC41///0XcokIhjMcx42OjkIuFw6CIASDQYKAmlMLwdSeIIgbN27ALxcCd+/enZychJwnCoFCvV5/8+bNUCgEv+hiMzQ0RNM05EwYCBSK3WEgEIBfdLER02BALhTNGilBEL29vYtsy+L27dtjY2Pw042hUUiS5NjY2MjICJLSi8Qff/yRSCTg5xNCo1Acl168eBFJ6cUgGo329PQgSUODbLPJaDT29fVNTk6iCqCwXLx4cWpqCknOUmQKtVptIpH44YcfUAVQQGKx2C+//IIqExTKLV+j0djT07MIpvnnzp1DVQURK9RqtRzHnT17VtFD04mJiZ9//tloNKIKAPHBC4qiBgcHu7u70YaRD1999VU8HkeYfx392Rmj0fj1118rdFxz/vz5QCBgMpkQxoBeoU6no2n6888/R5h9JzfGx8fPnj2LsAkVQa8QAEBR1PXr17/88kvUsWRBJBL59NNPU6kU8iss0CsUMZvN3d3dP/74I+pAJJFKpY4fP37nzh3kVVBGCjEMMxqNZ86cuXTpEupYMiAIwokTJwYGBkwmkxzG0nJJ7CzOMTAM6+vrKy8vR3W3SEZ4nv/iiy9+++03+eStkpFC0aJGo+nr6ystLfV4PKjDeZhkMnnixAlZ+ZOdwgctijlAUIfzf0QikY8//ri3t1dW/uSoULSI4/jAwEAoFGpoaEB+4Y9GoxkdHf3www/HxsZkmCVAjgrF0Y1OpxsfHx8YGKiuri4vL0cYzLlz5z777LNIJIJ2Cv84ZKpQtKjX68PhcE9PD8Mwy5cvh7+OfOvWrZMnT164cAHHcTk0Bo9EvgpFxCuxh4aGrl69SlHUsmXL4JQ7Nzf3/fffnzp16vbt22azWSZ3+zwSuSsUu0aSJGdnZ//666/r16+bTCan01m849LRaPTChQunTp3q7e0lCEIO98EsjAIughUR/5XX03i93o6OjjVr1ki8Al0it27dunz58p9//hkKhUiSlNvI83Eo4zrmBxFvB+J5vry83O/3NzY21tbW5uNycnLy2rVr/f39o6OjNE2TJCnbO18fifIUzsNxHMuyWq3WZrO5XC5PGofDYbPZFli65Hk+Ho9PT0/fvXs3GAyOj4/fuXNHfKmTJEk593mPA71CAADP8ziO59y9cRyXSqV4nicIwmg0lpSUWK1WUxqdTicuY4qXI8bj8Wg0Ojs7S9O0+L44QRA6nS5nc/MPz+3rBQFlXyi+d6/X6+12+/T0dM7/SiLN/K9hZmbm3r17giA8tAaNpRHXDbRabZ6TvPkLh4U0BoMBlUg0CgVBiMfjJpNp3bp1GzZscLvd3d3d3377LYZh+YwA5yVB6Myi0ajD4Xjttdc0Gk13d/e1a9c4jjMYDPCbYtgNKQAgHo9TFNXS0rJt27YHLwzt7+8/ffr0nTt3zGazHG7nfBypVIphmKamptdff31+2ejGjRs//fRTf38/z/OQNxGhKmRZVhCEpqamzs7OR972GolEzpw58/vvv8szzxcAgKZpi8XS2dm5ffv2/37gn3/++e6774aHh/V6PbRhLaSpvfjHV1RUHDp06KWXXnrcHMBgMKxdu7ampmZycjIUCon9FoTwpMAwDMdxra2tXV1djY2Nj/zMkiVLOjo6bDZbMBiMRCJw1uSKrhDDsFQqxbLs5s2b3333XSm7gFVVVevXr6coanJyMhwOI79Hnknj8/nefPPNzs7OjFN+j8fT3Nw8MzMTDAYhBF90hYlEwmg0Hjp0qLOzU/pQhSCIurq61tZWnU4XCoXC4TCGYZBrJACAYZhUKuV2u/fu3bt///6qqiqJ36UoqrW11WQyDQ8Pp1Kpojaqxe0LY7FYTU1NV1dXPvech8PhS5cuXb58WUyyQJJkUV0CAMRFA5Ik6+rqNm7c2NzcnHOJw8PDJ0+enJmZKV4W1iIqjEajjY2NXV1dBblVJJlMBgKBnp6eGzduRCIRcSsqnwWBhwAApFKpZDKJ47jT6WxsbGxtbfV6vfk/ORQKffLJJ+Pj40XaLi6Wwmg02t7efvjw4YK3IVNTU0NDQ4ODg8FgMBwOiyc5CYIQdUo3CgAQBIFLAwAwGAwVFRW1tbWrVq2qq6srbKWJxWIfffTR4OBgMZbOi6IwGo12dHR0dXUVdXo3Nzd38+bN8fHxYDAYCoVmZ2fFQaOYe/iROkEaQRBwHNfpdBRFlZWVVVdXu93u2trapUuXFq/TYhjm+PHjV65cKXhdLLxC0d8777wDcxjJsuz9+/en04TD4bm5OZqm4/H4/BobAEB0ZjabrWkcDoc9DbQ4k8nkBx98MDAwUFiLBVYYi8WampqOHTsmn/mcrKBp+v333x8ZGTGbzYU6RlywHyCGYTRNr1ixoqurS/X3OEwm09GjR6uqquLxeKF6mYIpZBimvLz8yJEjcnjNQM7Y7fYjR45QFFWo5MGFUcjzvFar7erqQntaUCm4XK6DBw9yHFeQpJ6FUZhIJPbu3VtfX1+Qpz0JPPvsszt37qRpOv9H5asQw7BYLNba2vrIlXuVBXj55Zf9fn88Hs/zOfkqZFl2fudTJSsIgjh48KDJZMrzysq8FIrLifv37y/sYcAnh6qqqj179jAMk89D8lJI03RbW1tTU1M+D3nC2bJlS2NjYz7Nae4KOY6z2Wx79uzJ+QkqIvv27TMYDDnfWpm7wkQisWvXrsV9nyQcli1b9vzzz+dcEXNUyDCM1+vdunVrbl9XeYidO3dWV1fnNtnPRaG42L97925lHVyXMxRF7dq1C55ChmH8fr/8X4lSFu3t7T6fL4fRadYKxfX1F154IdsvqiwMQRA7duzIYVCTtUKGYRoaGp555plsv6iSkZaWFq/Xm21FzE6huOu9Y8cOOZ+2Vi44jm/fvj3bipidQpZlfT6fWgWLR3Nzc01NTVbjmuwUchy3ceNGJb6EpxR0Ol1HRwfLstK/koUMjuOcTmdLS0tOsalIpa2traysTPradxYKxdd5inekVUXEYrE0NjZKr4hSFQqCQJLkunXr8ohNRSrr168Xs7VI+bBUhclk0uv1ut3u/GJTkURtba3b7ZY4qJGqkOO4pqYmdS4BB61Wu2bNGomZriUp5Hm+pKRk1apVecemIpXVq1dTFCXlfJQkhclk0u12V1RUFCI2FUksXbrU5XJJaUul1kK/31+IwFSkgmHYypUrpUwtMisU3/pRFcJHzMWacVyaWWEqlXI4HNBSEKrM43K5HA5HxoooSSGSXKAqJEm63e6M41JJfaHP5ytQVCrZ4fP58m1IAQAkSebzprxKPng8HpIkF7aYQSHP81ar1el0Fjo2FUlUVFRYLJaFdxAzKOQ4bsmSJfJMK/4kYDabM45oMitUZ/RocTqdedVCDMMcDkeho1LJgoy9WGaF6nlttJSXly+8u7CQQgAAQRAWi6UIgalIxWKxLLx3mEGhXq9XxzJoMZlMJEkusGWRoSHVarUyvKXoicJsNi+cQWShxM5iE9zb22u1WuVw1+ITCIZh4XBYEIQFusMMCgVBOH36tOoPIWKC5AUOfmZOry7DBMsqD6Ie6lU8qkLFoypUPKpCxaMqVDyqQsWjKlQ8qkLF8/8CAAD//zqZeuNqei9LAAAAAElFTkSuQmCC";
      function setPersonPreview(preview, url) {
        const isDefault = !url || url === PERSON_DEFAULT_IMG;
        preview.classList.toggle("p-default", isDefault);
        preview.src = isDefault ? PERSON_DEFAULT_PREVIEW : url;
      }
      function personImageUrl(personName) {
        return (
          "https://mdc.gta.world/img/persons/" +
          personName.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "") +
          ".png"
        );
      }
      function personRecordUrl(personName) {
        return "https://mdc.gta.world/record/" + personName.trim().replace(/\s+/g, "_");
      }
      // imgClass is the class/id of the actual image-URL field (kept stable so BBCode builders can keep reading it).
      // profileClass, if given, is an MDC profile-link field that also auto-fills from the name.
      // Shared Involved Persons card layout (Incident, OSS Incident, MCB / HB Case Package).
      // Only the layout lives here: every field keeps its own class, so the photo wiring,
      // death panel and BBCode builders find them exactly as before.
      //   identity → fields beside the photo (classification, date of birth…)
      //   details  → the "Details" grid below (phone, residence…)
      //   relation → optional full-width field after the details
      function personCard({ nameClass, placeholder, imgClass, profileClass, identity, details, relation }) {
        // The MDC profile link and photo URL are generated from the name behind the scenes:
        // kept as hidden fields so the photo wiring and BBCode builders still read them.
        const profileField = profileClass ? `<input type='hidden' class='${profileClass}'>` : "";
        return `<div class='pc'>
          <div class='pc-top'>
            <div class='pc-photo'>
              <img class='${imgClass}-prev' alt='Person photo'>
              <button type='button' class='b photo-reset' title='Use the default image'>Use default</button>
            </div>
            <div class='pc-id'>
              ${personNameHead(nameClass, placeholder)}
              <div class='g'>${identity}</div>
            </div>
          </div>
          ${personDeathPanel()}
          <div class='pc-h'>Details</div>
          <div class='g'>${details}</div>
          ${relation || ""}
          ${profileField}<input type='hidden' class='${imgClass}' value='${PERSON_DEFAULT_IMG}'>
        </div>`;
      }
      // Wires a name field + an image field (+ optional preview/profile/reset) so the image
      // URL field auto-fills from the name, the reset button clears any manual override, and
      // the preview actually verifies the picture loads: it shows the default until the
      // generated (or manually typed) URL is confirmed to work, and if it 404s / fails to
      // load, falls back to the default for real — in the field too — so the BBCode output
      // never ships a broken image link for a name with no MDC picture.
      // While typing, the URL field updates at once (so the BBCode is always current), but the
      // preview only looks the picture up once the user has stopped typing for this long.
      const PERSON_PHOTO_LOOKUP_DELAY = 1000;
      function wirePersonPhotoEls({ name, image, preview, resetBtn, profile }) {
        // Wrap the preview in a frame that can show a "searching" overlay.
        let frame = null;
        if (preview) {
          frame = document.createElement("span");
          frame.className = "p-frame";
          frame.innerHTML = `<span class='p-loading' aria-hidden='true'><i></i><small>Searching MDC…</small></span>`;
          preview.parentElement.insertBefore(frame, preview);
          frame.prepend(preview);
          const done = () => {
            if (preview.dataset.target === preview.dataset.loading) frame.classList.remove("is-loading");
          };
          preview.addEventListener("load", done);
          preview.addEventListener("error", done);
        }
        let lookupTimer = 0;
        const fill = () => {
          image.value = name.value.trim() ? personImageUrl(name.value) : PERSON_DEFAULT_IMG;
        };
        const sync = () => {
          clearTimeout(lookupTimer);
          if (!preview) return;
          const target = image.value.trim() || PERSON_DEFAULT_IMG;
          if (preview.dataset.target === target) {
            frame.classList.remove("is-loading");
            return;
          }
          preview.dataset.target = target;
          preview.dataset.loading = target;
          // The embedded default appears instantly; only a real lookup shows the loader.
          frame.classList.toggle("is-loading", target !== PERSON_DEFAULT_IMG);
          setPersonPreview(preview, target);
        };
        // Wait until typing pauses before looking the picture up. An empty / default value
        // has nothing to look up, so it shows the default straight away.
        const syncLater = () => {
          clearTimeout(lookupTimer);
          if (!preview) return;
          const target = image.value.trim() || PERSON_DEFAULT_IMG;
          if (target === PERSON_DEFAULT_IMG || preview.dataset.target === target) return sync();
          frame.classList.add("is-loading");
          lookupTimer = setTimeout(sync, PERSON_PHOTO_LOOKUP_DELAY);
        };
        name.addEventListener("input", () => {
          if (profile && (!profile.value.trim() || profile.dataset.auto === "1")) {
            profile.value = name.value.trim() ? personRecordUrl(name.value) : "";
            profile.dataset.auto = "1";
          }
          if (image.dataset.manual !== "1") fill();
          syncLater();
        });
        if (profile) profile.addEventListener("input", () => (profile.dataset.auto = "0"));
        image.addEventListener("input", () => {
          image.dataset.manual = "1";
          syncLater();
        });
        if (resetBtn)
          resetBtn.addEventListener("click", () => {
            image.dataset.manual = "";
            image.value = PERSON_DEFAULT_IMG;
            sync();
          });
        if (preview)
          preview.addEventListener("error", () => {
            // The URL we just tried (`preview.dataset.target`) genuinely doesn't load — fall
            // back for real. Only touch the field if it still holds that same failed URL (a
            // newer, still-pending attempt shouldn't get clobbered by a stale error).
            const failed = preview.dataset.target;
            if (failed && failed !== PERSON_DEFAULT_IMG) {
              if (image.value.trim() === failed) {
                image.value = PERSON_DEFAULT_IMG;
                image.dataset.manual = "";
              }
              preview.dataset.target = PERSON_DEFAULT_IMG;
            }
            if (preview.getAttribute("src") !== PERSON_DEFAULT_PREVIEW) setPersonPreview(preview, PERSON_DEFAULT_IMG);
          });
        sync();
      }
      // Row-scoped convenience: finds the image/preview/reset/profile fields inside `row` by class.
      function wirePersonPhoto(row, imgClass, nameEl, profileClass) {
        wirePersonPhotoEls({
          name: nameEl,
          image: row.querySelector("." + imgClass),
          preview: row.querySelector("." + imgClass + "-prev"),
          resetBtn: row.querySelector(".photo-reset"),
          profile: profileClass ? row.querySelector("." + profileClass) : null,
        });
      }
      function addP() {
        const d = document.createElement("div");
        d.className = "item";
        d.innerHTML = `<div class='ih'><b class='pn'></b><button class='b' onclick="this.closest('.item').remove();num()">Remove</button></div>${personCard({
          nameClass: "p-name",
          placeholder: "Forename Surname",
          imgClass: "p-img",
          identity: `<div class='f'><span>Classification</span><select class='p-cls'><option>Victim</option><option>Suspect</option><option>Witness</option><option>Informant</option></select></div><div class='f'><span>Date of Birth</span><input type='text' class='p-dob' autocomplete='off'></div>`,
          details: `<div class='f'><span>Phone Number</span><input type='text' class='p-ph' autocomplete='off'></div><div class='f'><span>Residence</span><input type='text' class='p-res' autocomplete='off'></div>`,
          relation: `<div class='f pc-rel'><span>Relation to Incident</span><textarea class='p-rel' placeholder='How this person is involved in the incident'></textarea></div>`,
        })}`;
        $("persons").appendChild(d);
        num();
        const nm = d.querySelector(".p-name");
        wirePersonPhoto(d, "p-img", nm);
        initPersonDeath(d, () => nm.value.trim());
      }
      // Incident Report evidence: lettered exhibits, same logic and BBCode as the
      // Major Crimes Case Package ("Exhibit A; …" + spoiler).
      function numberIncExhibits() {
        $("evs")
          .querySelectorAll(".inc-e-label")
          .forEach((label, i) => (label.textContent = "Exhibit " + sevLetter(i)));
      }
      function addE() {
        const row = document.createElement("div");
        row.className = "item inc-exhibit";
        row.innerHTML = `
      <div class='ih'><b class='inc-e-label'></b><button class='b' type='button' onclick="this.closest('.inc-exhibit').remove();numberIncExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='inc-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='inc-e-body' placeholder='Images, links, details…'></textarea></div>`;
        $("evs").appendChild(row);
        numberIncExhibits();
      }
      function resetI() {
        ["i1", "i2", "i3", "i4", "i5", "i6"].forEach((i) => ($(i).value = ""));
        $("incident-time").value = "00:00";
        updateTaskListDateLabel("i1");
        $("persons").innerHTML = "";
        $("evs").innerHTML = "";
        addP();
        addE();
        applyDeputyDetails();
        updateIncidentTitle();
      }
      function bbi() {
        const f = (l, v) => `[b]${l}:[/b]` + (v ? " " + v : ""),
          g = (i) =>
            i === "i1"
              ? formatPickerDate($(i).value, "time-date", $("incident-time").value)
              : $(i).value.trim();
        const P = [...document.querySelectorAll("#persons .item")]
          .map((e, i) => {
            const v = (c) => e.querySelector(c).value.trim(),
              n = personDisplayName(e, v(".p-name")),
              death = personDeathState(e);
            return (
              `[u]Person #${i + 1}${n ? " - " + n : ""}[/u]\n` +
              [
                f("Classification", v(".p-cls")),
                `[aligntable=right,0,0,50,0,0,0][img]${v(".p-img") || "https://i.imgur.com/4FqUxmw.png"}[/img][/aligntable]`,
                f("Date of Birth", v(".p-dob")),
                f("Phone Number", v(".p-ph")),
                f("Residence", v(".p-res")),
                f("Relation to Incident", v(".p-rel")),
                ...(death.dead ? [`[altspoiler=OOC Death Details]${death.ooc}[/altspoiler]`] : []),
              ].join("\n")
            );
          })
          .join("\n\n\n");
        const E = [...$("evs").querySelectorAll(".inc-exhibit")]
          .map(
            (row, i) =>
              `[*][b]Exhibit ${sevLetter(i)}; ${row.querySelector(".inc-e-desc").value.trim() || "Evidence description"}[/b]\n[spoiler]${row.querySelector(".inc-e-body").value.trim()}[/spoiler]`,
          )
          .join("\n");
        return [
          "[font=Arial][color=black]",
          "",
          "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
          "",
          `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]`,
          `[i]"A Tradition of Service Since 1850"[/i][/size]`,
          "",
          "[size=110][u]INCIDENT REPORT[/u][/size][/center][hr][/hr]",
          "",
          "[font=arial][color=black][indent][size=105][b]Filing Information[/b][/size]",
          "",
          "[indent]",
          f("Time & Date", g("i1")),
          f("Penal Code (if Criminal)", g("i2")),
          f("Location", g("i3")),
          "",
          f("Filed By", g("i4")),
          f("Unit Number", g("i5")),
          "[/indent]",
          "",
          "[size=105][b]Involved Persons[/b][/size]",
          "[indent]" + P + "[/indent]",
          "[size=105][b]Narrative[/b][/size]",
          "[indent]" + g("i6") + "[/indent]",
          "",
          "[size=105][b]Evidence[/b][/size]",
          "[list]" + E + "[/list]",
        ].join("\n");
      }
      // Supplemental Report evidence: lettered attachments, same logic and
      // BBCode as the Major Crimes Supplemental ("Attachment A; …" + spoiler).
      function sevLetter(i) {
        let s = "";
        i++;
        while (i > 0) {
          const r = (i - 1) % 26;
          s = String.fromCharCode(65 + r) + s;
          i = Math.floor((i - 1) / 26);
        }
        return s;
      }
      function numberSevExhibits() {
        $("sevs")
          .querySelectorAll(".sev-e-label")
          .forEach((label, i) => (label.textContent = "Attachment " + sevLetter(i)));
      }
      function addSevExhibit() {
        const row = document.createElement("div");
        row.className = "item sev-exhibit";
        row.innerHTML = `
      <div class='ih'><b class='sev-e-label'></b><button class='b' type='button' onclick="this.closest('.sev-exhibit').remove();numberSevExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='sev-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='sev-e-body' placeholder='Images, links, details…'></textarea></div>`;
        $("sevs").appendChild(row);
        numberSevExhibits();
      }
      // ===== Street / District pickers =====
      // Lists copied from the GTA World report builder (rebb.booskit.dev, gtaw_locations.json).
      // Every street / district field becomes a search box: typing shows only the matches,
      // and only a name from the list can be kept (anything else reverts on leaving the field).
      const GTAW_DISTRICTS = [
        "Alamo Sea",
        "Alta",
        "Banham Canyon",
        "Banning",
        "Bolingbroke Penitentiary",
        "Braddock Pass",
        "Burton",
        "Calafia Bridge",
        "Cassidy Creek",
        "Chamberlain Hills",
        "Chiliad Mountain State Wilderness",
        "Chumash",
        "Cypress Flats",
        "Davis",
        "Davis Quarry",
        "Del Perro",
        "Del Perro Beach",
        "Downtown",
        "Downtown Vinewood",
        "East Vinewood",
        "El Burro Heights",
        "El Gondo Lighthouse",
        "Elysian Island",
        "Fort Zancudo",
        "GWC and Golfing Society",
        "Galilee",
        "Grand Senora Desert",
        "Grapeseed",
        "Great Chaparral",
        "Harmony",
        "Hawick",
        "Humane Labs and Research",
        "La Mesa",
        "La Puerta",
        "Lago Zancudo",
        "Land Act Dam",
        "Land Act Reservoir",
        "Legion Square",
        "Little Seoul",
        "Los Santos International Airport (LSIA)",
        "Maze Bank Arena",
        "Mirror Park",
        "Mission Row",
        "Morningwood",
        "Mount Chiliad",
        "Mount Gordo",
        "Mount Josiah",
        "Murrieta Heights",
        "N.O.O.S.E",
        "North Chumash",
        "Pacific Bluffs",
        "Palomino Highlands",
        "Paleto Bay",
        "Paleto Cove",
        "Paleto Forest",
        "Palmer-Taylor Power Station",
        "Pillbox Hill",
        "Port of South Los Santos",
        "Procopio Beach",
        "Rancho",
        "Raton Canyon",
        "Redwood Lights Track",
        "Richards Majestic",
        "Richman",
        "Richman Glen",
        "Rockford Hills",
        "Ron Alternatives Wind Farm",
        "San Chanski Mountain Range",
        "Sandy Shores",
        "Stab City",
        "Strawberry",
        "Tataviam Mountains",
        "Terminal",
        "Textile City",
        "Tongva Hills",
        "Vespucci",
        "Vespucci Beach",
        "Vespucci Canals",
        "Vinewood",
        "Vinewood Hills",
        "Vinewood Racetrack",
        "West Vinewood",
        "Zancudo River",
      ];
      const GTAW_STREETS = [
        "Abattoir Avenue",
        "Abe Milton Parkway",
        "Ace Jones Drive",
        "Adam's Apple Boulevard",
        "Aguja Street",
        "Algonquin Boulevard",
        "Alhambra Drive",
        "Alta Place",
        "Alta Street",
        "Amarillo Vista",
        "Amarillo Way",
        "Americano Way",
        "Armadillo Avenue",
        "Atlee Street",
        "Autopia Parkway",
        "Banham Canyon Drive",
        "Barbareno Road",
        "Bay City Avenue",
        "Bay City Incline",
        "Baytree Canyon Road",
        "Boulevard Del Perro",
        "Bridge Street",
        "Brouge Avenue",
        "Buccaneer Way",
        "Buen Vino Road",
        "Caesars Place",
        "Calafia Road",
        "Calais Avenue",
        "Capital Boulevard",
        "Carcer Way",
        "Carson Avenue",
        "Cascabel Avenue",
        "Cassidy Trail",
        "Cat-Claw Avenue",
        "Catfish View",
        "Chianski Passage",
        "Cholla Road",
        "Cholla Springs Avenue",
        "Chum Street",
        "Chupacabra Street",
        "Clinton Avenue",
        "Cockingend Drive",
        "Conquistador Street",
        "Cortes Street",
        "Cougar Avenue",
        "Covenant Avenue",
        "Cox Way",
        "Crusade Road",
        "Davis Avenue",
        "Decker Street",
        "Del Perro Freeway",
        "Didion Drive",
        "Dorset Drive",
        "Dorset Place",
        "Dry Dock Street",
        "Duluoz Avenue",
        "Dunstable Drive",
        "Dunstable Lane",
        "Dutch London Street",
        "East Galileo Avenue",
        "East Joshua Road",
        "East Mirror Drive",
        "Eastbourne Way",
        "Eclipse Boulevard",
        "Edwood Way",
        "El Burro Boulevard",
        "El Rancho Boulevard",
        "Elgin Avenue",
        "Elysian Fields Freeway",
        "Equality Way",
        "Exceptionalists Way",
        "Fantastic Place",
        "Fenwell Place",
        "Fort Zancudo Approach Road",
        "Forum Drive",
        "Fudge Lane",
        "Galileo Road",
        "Gentry Lane",
        "Ginger Street",
        "Glory Way",
        "Goma Street",
        "Grapeseed Avenue",
        "Grapeseed Main Street",
        "Great Ocean Highway",
        "Greenwich Parkway",
        "Greenwich Place",
        "Greenwich Way",
        "Grove Street",
        "Hanger Way",
        "Hangman Avenue",
        "Hardy Way",
        "Hawick Avenue",
        "Heritage Way",
        "Hillcrest Avenue",
        "Hillcrest Ridge Access Road",
        "Imagination Court",
        "Industry Passage",
        "Ineseno Road",
        "Innocence Boulevard",
        "Integrity Way",
        "Invention Court",
        "Jamestown Street",
        "Joad Lane",
        "Joshua Road",
        "Kimble Hill Drive",
        "Kortz Drive",
        "La Puerta Freeway",
        "Labor Place",
        "Laguna Place",
        "Lake Vinewood Drive",
        "Lake Vinewood Estate",
        "Las Lagunas Boulevard",
        "Lesbos Lane",
        "Liberty Street",
        "Lindsay Circus",
        "Little Bighorn Avenue",
        "Lolita Avenue",
        "Los Santos Freeway",
        "Low Power Street",
        "Macdonald Street",
        "Mad Wayne Thunder Drive",
        "Magellan Avenue",
        "Marathon Avenue",
        "Marina Drive",
        "Marlowe Drive",
        "Melanoma Street",
        "Meringue Lane",
        "Meteor Street",
        "Milton Road",
        "Mirror Park Boulevard",
        "Mirror Place",
        "Morningwood Boulevard",
        "Mount Haan Drive",
        "Mount Haan Road",
        "Mount Vinewood Drive",
        "Mountain View Drive",
        "Movie Star Way",
        "Mutiny Road",
        "New Empire Way",
        "Nikola Avenue",
        "Nikola Place",
        "Niland Avenue",
        "Normandy Drive",
        "North Archer Avenue",
        "North Calafia Way",
        "North Conker Avenue",
        "North Rockford Drive",
        "North Sheldon Avenue",
        "Nowhere Road",
        "O'Neil Way",
        "Occupation Avenue",
        "Olympic Freeway",
        "Orchardville Avenue",
        "Paleto Boulevard",
        "Palomino Avenue",
        "Palomino Freeway",
        "Panorama Drive",
        "Peaceful Street",
        "Perth Street",
        "Picture Perfect Drive",
        "Plaice Place",
        "Playa Vista",
        "Popular Street",
        "Portola Drive",
        "Power Street",
        "Procopio Drive",
        "Procopio Promenade",
        "Prosperity Street",
        "Prosperity Street Promenade",
        "Pyrite Avenue",
        "Raton Pass",
        "Red Desert Avenue",
        "Richman Street",
        "Rockford Drive",
        "Route 68",
        "Route 68 Approach",
        "Roy Lowenstein Boulevard",
        "Rub Street",
        "Sam Austin Drive",
        "San Andreas Avenue",
        "San Vitus Boulevard",
        "Sandcastle Way",
        "Seaview Road",
        "Senora Freeway",
        "Senora Road",
        "Senora Way",
        "Shank Street",
        "Signal Street",
        "Sinner Street",
        "Sinners Passage",
        "Smoke Tree Road",
        "South Arsenal Street",
        "South Boulevard Del Perro",
        "South Mo Milton Drive",
        "South Rockford Drive",
        "South Shambles Street",
        "Spanish Avenue",
        "Steele Way",
        "Strangeways Drive",
        "Strawberry Avenue",
        "Supply Street",
        "Sustancia Road",
        "Swiss Street",
        "Tackle Street",
        "Tangerine Street",
        "Tongva Drive",
        "Tower Way",
        "Tug Street",
        "Union Road",
        "Utopia Gardens",
        "Vespucci Boulevard",
        "Vinewood Boulevard",
        "Vinewood Park Drive",
        "Vitus Street",
        "Voodoo Place",
        "West Eclipse Boulevard",
        "West Galileo Avenue",
        "West Mirror Drive",
        "Whispymound Drive",
        "Wild Oats Drive",
        "York Street",
        "Zancudo Avenue",
        "Zancudo Barranca",
        "Zancudo Road",
        "Zancudo Trail",
      ];
      const PLACE_LISTS = { street: GTAW_STREETS, district: GTAW_DISTRICTS };
      // Fields that ask for one street or one district.
      const PLACE_FIELDS = {
        street: ["subject-road", "k9-street", "ck9-street", "dk9-street", "citation-sp-street", "citation-xs-street", "citation-y-street", "citation-y-cross", "mcb-case-street", "hb-case-street"],
        district: ["k9-district", "ck9-district", "dk9-district", "mcb-case-district", "hb-case-district"],
      };
      // "Location" fields: split into a Street picker + a District picker, written back to the
      // original field as "Street, District" (so every BBCode builder keeps reading that field).
      const LOCATION_FIELDS = ["i3", "uof-location", "usup-location", "tc-location", "citation-location", "senora-logbook-location", "oss-ir-location", "cfid-location", "met-location"];
      const LOCATION_JOIN = ", ";
      let placeUid = 0;
      function placeMatches(list, query) {
        const q = query.trim().toLowerCase(),
          words = q.split(/\s+/).filter(Boolean);
        if (!words.length) return list.slice();
        const rank = (x) => {
          const l = x.toLowerCase();
          if (l.startsWith(q)) return 0;
          return l.split(/\s+/).some((w) => w.startsWith(words[0])) ? 1 : 2;
        };
        return list
          .filter((x) => words.every((w) => x.toLowerCase().includes(w)))
          .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
      }
      function placeLabel(text, query) {
        // Bold the typed words inside the option (built as text nodes, never innerHTML).
        const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) return document.createTextNode(text);
        const frag = document.createDocumentFragment(),
          lower = text.toLowerCase(),
          marks = new Array(text.length).fill(false);
        words.forEach((w) => {
          let i = lower.indexOf(w);
          while (i !== -1) {
            for (let k = i; k < i + w.length; k++) marks[k] = true;
            i = lower.indexOf(w, i + w.length);
          }
        });
        let i = 0;
        while (i < text.length) {
          let j = i;
          while (j < text.length && marks[j] === marks[i]) j++;
          const part = text.slice(i, j);
          frag.append(marks[i] ? Object.assign(document.createElement("b"), { textContent: part }) : part);
          i = j;
        }
        return frag;
      }
      function makePlacePicker(input, kind, onCommit) {
        const list = PLACE_LISTS[kind],
          id = "place-list-" + ++placeUid;
        const wrap = document.createElement("div");
        wrap.className = "place";
        input.parentElement.insertBefore(wrap, input);
        wrap.append(input);
        const box = document.createElement("ul");
        box.className = "place-list";
        box.id = id;
        box.hidden = true;
        box.setAttribute("role", "listbox");
        wrap.append(box);
        input.setAttribute("role", "combobox");
        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-controls", id);
        input.autocomplete = "off";
        input.spellcheck = false;
        input.placeholder = kind === "street" ? "Search streets…" : "Search districts…";
        const inList = (v) => list.includes(v);
        input.dataset.placeValid = inList(input.value.trim()) ? input.value.trim() : "";
        let items = [],
          active = -1,
          silent = false;
        const setOpen = (on) => {
          box.hidden = !on;
          wrap.classList.toggle("open", on);
          input.setAttribute("aria-expanded", String(on));
          if (!on) input.removeAttribute("aria-activedescendant");
        };
        const mark = () => {
          [...box.children].forEach((li, i) => {
            li.classList.toggle("on", i === active);
            li.setAttribute("aria-selected", String(i === active));
          });
          const li = box.children[active];
          if (li && li.id) {
            input.setAttribute("aria-activedescendant", li.id);
            li.scrollIntoView({ block: "nearest" });
          }
        };
        const commit = (value) => {
          const changed = input.value !== value || input.dataset.placeValid !== value;
          silent = true;
          input.value = value;
          input.dataset.placeValid = value;
          setOpen(false);
          if (changed) {
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            if (onCommit) onCommit(value);
          }
          silent = false;
        };
        const render = () => {
          // With a chosen name still in the box, show the whole list so it can be changed.
          const q = input.value.trim() === input.dataset.placeValid ? "" : input.value;
          items = placeMatches(list, q);
          if (items.length) {
            box.replaceChildren(
              ...items.map((t, i) => {
                const li = document.createElement("li");
                li.id = id + "-" + i;
                li.setAttribute("role", "option");
                li.append(placeLabel(t, q));
                li.addEventListener("mousedown", (e) => {
                  e.preventDefault();
                  commit(t);
                });
                return li;
              }),
            );
          } else {
            const li = document.createElement("li");
            li.className = "place-empty";
            li.textContent = `No ${kind} matches “${input.value.trim()}”`;
            box.replaceChildren(li);
          }
          active = items.length ? Math.max(0, items.indexOf(input.dataset.placeValid)) : -1;
          setOpen(true);
          mark();
        };
        input.addEventListener("input", () => {
          if (!silent) render();
        });
        input.addEventListener("focus", render);
        input.addEventListener("click", () => {
          if (box.hidden) render();
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (box.hidden) return render();
            if (!items.length) return;
            active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
            mark();
          } else if (e.key === "Enter") {
            if (!box.hidden && active >= 0) {
              e.preventDefault();
              commit(items[active]);
            }
          } else if (e.key === "Escape") {
            if (!box.hidden) {
              e.preventDefault();
              setOpen(false);
            }
          } else if (e.key === "Tab" && !box.hidden && active >= 0 && input.value.trim() && !inList(input.value.trim())) {
            commit(items[active]);
          }
        });
        input.addEventListener("blur", () => {
          setOpen(false);
          const v = input.value.trim();
          if (!v) return commit("");
          const exact = list.find((x) => x.toLowerCase() === v.toLowerCase());
          if (exact) return commit(exact);
          // Only a name from the list may stay: a single match is taken, anything else reverts.
          const m = placeMatches(list, v);
          commit(m.length === 1 ? m[0] : input.dataset.placeValid);
        });
        return {
          // Set from code (reset / prefill) without firing events.
          set(value) {
            const v = inList(value) ? value : "";
            input.value = v;
            input.dataset.placeValid = v;
          },
        };
      }
      function makeLocationPair(orig) {
        const label = orig.closest(".f")?.querySelector("span")?.textContent.trim() || "Location";
        const pair = document.createElement("div");
        pair.className = "place-pair";
        const street = document.createElement("input"),
          district = document.createElement("input");
        street.type = district.type = "text";
        street.setAttribute("aria-label", `${label}: street`);
        district.setAttribute("aria-label", `${label}: district`);
        pair.append(street, district);
        orig.parentElement.insertBefore(pair, orig.nextSibling);
        orig.type = "hidden";
        const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        const compose = () => {
          native.set.call(orig, [street.value.trim(), district.value.trim()].filter(Boolean).join(LOCATION_JOIN));
          orig.dispatchEvent(new Event("input", { bubbles: true }));
          orig.dispatchEvent(new Event("change", { bubbles: true }));
        };
        const sp = makePlacePicker(street, "street", compose),
          dp = makePlacePicker(district, "district", compose);
        // Resets / prefills elsewhere still assign orig.value: mirror that into the two pickers.
        Object.defineProperty(orig, "value", {
          configurable: true,
          get() {
            return native.get.call(this);
          },
          set(v) {
            native.set.call(this, v);
            const parts = String(v ?? "").split(",").map((x) => x.trim());
            sp.set(parts.find((x) => GTAW_STREETS.includes(x)) || "");
            dp.set(parts.find((x) => GTAW_DISTRICTS.includes(x)) || "");
          },
        });
        orig.value = native.get.call(orig);
      }
      function initPlacePickers() {
        Object.entries(PLACE_FIELDS).forEach(([kind, ids]) =>
          ids.forEach((id) => {
            const f = $(id);
            if (f && !f.closest(".place")) makePlacePicker(f, kind);
          }),
        );
        LOCATION_FIELDS.forEach((id) => {
          const f = $(id);
          if (f && f.type !== "hidden") makeLocationPair(f);
        });
      }
      // K9 deployment log evidence: lettered exhibits, same logic and BBCode as the Incident Report.
      function numberK9Exhibits(pre) {
        $(pre + "-evs")
          .querySelectorAll(".k9-e-label")
          .forEach((label, i) => (label.textContent = "Exhibit " + sevLetter(i)));
      }
      function addK9Exhibit(pre) {
        const row = document.createElement("div");
        row.className = "item k9-exhibit";
        row.innerHTML = `
      <div class='ih'><b class='k9-e-label'></b><button class='b' type='button' onclick="const w=this.closest('.k9-exhibit').parentElement;this.closest('.k9-exhibit').remove();numberK9Exhibits(w.id.replace('-evs',''))">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='k9-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='k9-e-body' placeholder='Images, links, details…'></textarea></div>`;
        $(pre + "-evs").appendChild(row);
        numberK9Exhibits(pre);
      }
      function resetK9Exhibits(pre) {
        $(pre + "-evs").replaceChildren();
        addK9Exhibit(pre);
      }
      function k9EvidenceBbcode(pre) {
        return (
          "[list]" +
          [...$(pre + "-evs").querySelectorAll(".k9-exhibit")]
            .map(
              (row, i) =>
                `[*][b]Exhibit ${sevLetter(i)}; ${row.querySelector(".k9-e-desc").value.trim() || "Evidence description"}[/b]\n[spoiler]${row.querySelector(".k9-e-body").value.trim()}[/spoiler]`,
            )
            .join("\n") +
          "[/list]"
        );
      }
      // "Now" buttons: fill each time field with the current time on the
      // 24-hour (UK) clock, written in the format that field already uses.
      const TIME_NOW_FIELDS = {
        "incident-time": "HH:MM",
        "ar-time": "HH:MM",
        "trespass-time": "HH:MM",
        "impound-time": "HH:MM",
        "uof-time": "HH:MM",
        "mcb-case-time": "HH:MM",
        "hb-case-time": "HH:MM",
        "king-report-time": "HH:MM",
        "apb-time": "HHMM",
        "subject-time": "HH:MM",
        "tc-time": "HH:MM",
        "k9-time": "HH:MM",
        "ck9-time": "HH:MM",
        "dk9-time": "HH:MM",
        "kem-time": "HH:MM",
        "lr-time": "HH:MM",
        "citation-time": "HH:MM:SS",
        "citation-ni-stop": "HH:MM:SS",
        "senora-logbook-time": "HH:MM",
        "oss-ir-time": "HHMM",
        "oss-supp-time": "HHMM",
        "ftp1-time": "HH:MM",
        "usup-time": "HH:MM",
        "ftp2-time": "HH:MM",
        "ftp3-time": "HH:MM",
        "fto-time": "HH:MM",
      };
      // Current time in the UK (Europe/London: GMT in winter, BST in summer),
      // regardless of the computer's own time zone.
      function ukTimeNow(fmt) {
        const parts = Object.fromEntries(
            new Intl.DateTimeFormat("en-GB", {
              timeZone: "Europe/London",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hourCycle: "h23",
            })
              .formatToParts(new Date())
              .map((x) => [x.type, x.value]),
          ),
          hh = parts.hour,
          mm = parts.minute;
        if (fmt === "HHMM") return hh + mm;
        if (fmt === "HH:MM:SS") return `${hh}:${mm}:${parts.second}`;
        return `${hh}:${mm}`;
      }
      function initTimeNowButtons() {
        Object.entries(TIME_NOW_FIELDS).forEach(([id, fmt]) => {
          const field = $(id);
          if (!field || field.dataset.timeNow) return;
          field.dataset.timeNow = "1";
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "b time-now";
          btn.title = "Fill with the current UK time (24-hour)";
          const label = field.closest(".f")?.querySelector("span")?.textContent.trim() || "time";
          btn.setAttribute("aria-label", `Set ${label} to the current UK time`);
          btn.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg><span>Now</span>`;
          btn.addEventListener("click", () => {
            field.value = ukTimeNow(fmt);
            field.dispatchEvent(new Event("input", { bubbles: true }));
            field.dispatchEvent(new Event("change", { bubbles: true }));
          });
          const control = field.closest(".date-time-control");
          if (control) {
            control.append(btn);
          } else {
            const wrap = document.createElement("div");
            wrap.className = "time-now-wrap";
            field.parentElement.insertBefore(wrap, field);
            wrap.append(field, btn);
          }
        });
      }
      function bbs() {
        const E = [...$("sevs").querySelectorAll(".sev-exhibit")].map(
          (row, i) =>
            `[*][b]Attachment ${sevLetter(i)}; ${row.querySelector(".sev-e-desc").value.trim() || "Description"}[/b]\n[spoiler]${row.querySelector(".sev-e-body").value.trim()}[/spoiler]`,
        );
        return [
          "[font=Arial][color=black]",
          "",
          "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
          "",
          `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]`,
          `[i]"A Tradition of Service Since 1850"[/i][/size]`,
          "",
          "[size=110][u]SUPPLEMENTAL REPORT[/u][/size][/center][hr][/hr]",
          "",
          "[font=arial][color=black]",
          "[size=105][b]Narrative[/b][/size]",
          "[indent]" + $("s1").value.trim() + "[/indent]",
          "",
          "[size=105][b]Evidence[/b][/size]",
          "[list]" + E.join("\n") + "[/list]",
          "",
          "[size=105][b]Filed By:[/b][/size]",
          "[indent]" + ($("s2").value.trim() || "N/A") + "[/indent]",
        ].join("\n");
      }
      function resetS() {
        $("s1").value = $("s2").value = "";
        $("sevs").replaceChildren();
        addSevExhibit();
        applyDeputyDetails();
      }
      let taskListCalendarMonth = new Date(),
        activeDatePicker = "task-list";
      function taskListTodayDate() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      }
      function taskListDateFromValue(value) {
        if (!value) return new Date();
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
      }
      const additionalDatePickerFields = [
        "ar-date",
        "i1",
        "uof-date",
        "usup-date",
        "king-report-date",
        "apb-date",
        "tc-date",
        "trespass-date",
        "impound-date",
        "depmail-date",
        "arrest-date",
        "search-date",
        "electronic-date",
        "oss-ir-date",
        "oss-supp-date",
        "senora-logbook-date",
        "sib-story-date",
        "sib-activity-date",
        "nccit-supp-date",
        "k9-date",
        "dk9-date",
        "ck9-date",
        "vsr-date",
        "kem-date",
        "cfid-date",
        "met-date",
        "kcc-date",
        "kcc-next",
        "lr-date",
        "lr-death",
        "citation-date",
        "ftp1-date",
        "ftp2-date",
        "ftp3-date",
        "fto-date",
        "mcb-case-date",
        "hb-case-date",
        "peu-date",
      ];
      // Date fields that live outside the page DOM (the Forensic Lab Workspace keeps its fields in a shadow root) register here.
      const extDatePickers = {};
      function dpRef(name, kind) {
        const ext = extDatePickers[name];
        return ext ? ext[kind] : $(datePickerIds(name)[kind]);
      }
      function datePickerIds(name) {
        if (name === "task-list")
          return {
            value: "task-list-updated",
            label: "task-list-date-label",
            trigger: "task-list-date-trigger",
          };
        const value = name === "subject-date" ? "subject-date" : name;
        return { value, label: `${value}-label`, trigger: `${value}-trigger` };
      }
      function updateTaskListDateLabel(name = "task-list") {
        const label = dpRef(name, "label");
        if (!label) return;
        const value = dpRef(name, "value").value;
        label.textContent = value
          ? taskListDateFromValue(value).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "Select a date";
      }
      function formatPickerDate(value, format, timeValue = "00:00") {
        if (!value) return "";
        const date = taskListDateFromValue(value);
        if (Number.isNaN(date.getTime())) return "";
        const day = String(date.getDate()).padStart(2, "0"),
          month = date.toLocaleString("en-US", { month: "long" }),
          year = date.getFullYear();
        if (format === "short") return `${day}/${month.slice(0, 3).toUpperCase()}/${year}`;
        if (format === "caps") return `${day} ${month.toUpperCase()} ${year}`;
        if (format === "weekday")
          return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        if (format === "time-date") {
          const time = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue),
            hhmm = time ? `${time[1]}${time[2]}` : "0000";
          return `${hhmm}, ${month} ${date.getDate()}, ${year}`;
        }
        return `${month} ${date.getDate()}, ${year}`;
      }
      function mountAdditionalDatePickers() {
        additionalDatePickerFields.forEach((id) => {
          const field = $(id);
          if (!field || field.closest(".date-picker")) return;
          const wrapper = document.createElement("div");
          wrapper.className = "date-picker";
          wrapper.id = `${id}-picker`;
          const trigger = document.createElement("button");
          trigger.type = "button";
          trigger.className = "date-picker-trigger";
          trigger.id = `${id}-trigger`;
          trigger.setAttribute("aria-haspopup", "dialog");
          trigger.setAttribute("aria-expanded", "false");
          trigger.setAttribute("aria-controls", "task-list-calendar");
          trigger.setAttribute(
            "aria-label",
            `Choose ${field.closest(".f")?.querySelector("span")?.textContent || "date"}`,
          );
          trigger.innerHTML = `<span id="${id}-label"></span><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path></svg>`;
          trigger.addEventListener("click", () => toggleDatePicker(id));
          field.type = "hidden";
          field.parentElement.insertBefore(wrapper, field);
          wrapper.append(field, trigger);
          updateTaskListDateLabel(id);
        });
      }
      function renderTaskListCalendar() {
        const selected = dpRef(activeDatePicker, "value").value,
          year = taskListCalendarMonth.getFullYear(),
          month = taskListCalendarMonth.getMonth(),
          firstDay = new Date(year, month, 1),
          gridStart = new Date(year, month, 1 - firstDay.getDay());
        $("task-list-calendar-title").textContent = taskListCalendarMonth.toLocaleDateString(
          "en-US",
          { month: "long", year: "numeric" },
        );
        const grid = $("task-list-calendar-days");
        grid.replaceChildren();
        for (let offset = 0; offset < 42; offset++) {
          const date = new Date(
              gridStart.getFullYear(),
              gridStart.getMonth(),
              gridStart.getDate() + offset,
            ),
            value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
            button = document.createElement("button");
          button.type = "button";
          button.className = "calendar-day";
          button.textContent = String(date.getDate());
          button.setAttribute(
            "aria-label",
            date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
          );
          button.setAttribute("aria-pressed", String(value === selected));
          if (date.getMonth() !== month) button.classList.add("outside-month");
          if (value === selected) {
            button.classList.add("selected");
            button.setAttribute("aria-current", "date");
          }
          if (value === taskListTodayDate()) button.classList.add("today");
          button.addEventListener("click", () => selectTaskListDate(value));
          grid.appendChild(button);
        }
      }
      function positionTaskListCalendar() {
        const popover = $("task-list-calendar");
        if (popover.hidden) return;
        const rect = dpRef(activeDatePicker, "trigger").getBoundingClientRect(),
          margin = 12,
          gap = 8,
          width = popover.getBoundingClientRect().width,
          height = popover.getBoundingClientRect().height,
          below = innerHeight - rect.bottom - gap,
          above = rect.top - gap;
        let top = below >= height || below >= above ? rect.bottom + gap : rect.top - height - gap;
        top = Math.max(margin, Math.min(top, innerHeight - height - margin));
        const left = Math.max(margin, Math.min(rect.left, innerWidth - width - margin));
        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
      }
      function toggleDatePicker(name) {
        const popover = $("task-list-calendar"),
          trigger = dpRef(name, "trigger");
        if (!popover.hidden && activeDatePicker === name) {
          closeTaskListCalendar();
          return;
        }
        if (!popover.hidden) closeTaskListCalendar();
        activeDatePicker = name;
        const selected = taskListDateFromValue(dpRef(name, "value").value);
        taskListCalendarMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        renderTaskListCalendar();
        popover.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        positionTaskListCalendar();
        $("task-list-calendar-days").querySelector(".selected")?.focus({ preventScroll: true });
      }
      function closeTaskListCalendar() {
        const popover = $("task-list-calendar");
        if (popover.hidden) return;
        popover.hidden = true;
        document
          .querySelectorAll(".date-picker-trigger")
          .forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
      }
      function changeTaskListCalendarMonth(amount) {
        taskListCalendarMonth = new Date(
          taskListCalendarMonth.getFullYear(),
          taskListCalendarMonth.getMonth() + amount,
          1,
        );
        renderTaskListCalendar();
        positionTaskListCalendar();
      }
      function selectTaskListDate(value) {
        const field = dpRef(activeDatePicker, "value");
        field.value = value;
        updateTaskListDateLabel(activeDatePicker);
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        closeTaskListCalendar();
        dpRef(activeDatePicker, "trigger").focus();
      }
      function selectDatePickerToday() {
        selectTaskListDate(taskListTodayDate());
      }
      function formatTaskListDate(value) {
        if (!value) return "N/A";
        const [year, month, day] = value.split("-").map(Number),
          date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime())
          ? "N/A"
          : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      }
      function addTaskListRow(task = "", handler = "", completed = false) {
        const row = document.createElement("div");
        row.className = "item task-list-row";
        row.innerHTML = `<div class='ih'><b>Task</b><button class='b' type='button' aria-label='Remove task' onclick="this.closest('.task-list-row').remove()">− Remove</button></div><div class='g'><label class='f'><span>Task</span><input type='text' class='task-list-task' placeholder='Enter task'></label><label class='f'><span>Handler</span><input type='text' class='task-list-handler' placeholder='Enter handler'></label><label class='row'><span>Complete</span><input type='checkbox' class='task-list-complete'></label></div>`;
        row.querySelector(".task-list-task").value = task;
        row.querySelector(".task-list-handler").value = handler;
        row.querySelector(".task-list-complete").checked = completed;
        $("task-list-rows").appendChild(row);
      }
      function initializeTaskList() {
        if (!$("task-list-updated").value) $("task-list-updated").value = taskListTodayDate();
        if (!$("subject-date").value) $("subject-date").value = taskListTodayDate();
        updateTaskListDateLabel();
        updateTaskListDateLabel("subject-date");
        if (!$("task-list-rows").children.length) addTaskListRow();
        document.body.appendChild($("task-list-calendar"));
        document.addEventListener("click", (event) => {
          if (!event.composedPath().some((n) => n.classList && (n.classList.contains("date-picker") || n.classList.contains("dp") || n.id === "task-list-calendar"))) closeTaskListCalendar();
        });
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && !$("task-list-calendar").hidden) {
            closeTaskListCalendar();
            dpRef(activeDatePicker, "trigger").focus();
          }
        });
        window.addEventListener("resize", positionTaskListCalendar);
        window.addEventListener("scroll", positionTaskListCalendar, true);
      }
      function buildTaskList() {
        const tasks = [...document.querySelectorAll("#task-list-rows .task-list-row")].map(
          (row) => {
            const task = row.querySelector(".task-list-task").value.trim() || "N/A",
              handler = row.querySelector(".task-list-handler").value.trim() || "N/A",
              checked = row.querySelector(".task-list-complete").checked
                ? "[cbc][/cbc]"
                : "[cb][/cb]";
            return `[tr]\n    [td]${task}[/td]\n    [td]${handler}[/td]\n    [td]${checked}[/td]\n[/tr]`;
          },
        );
        return [
          "[custable=Transparent,Black,Arial]",
          "[tr]",
          "    [th][center][b][font=courier][size=80]UPDATED: " +
            formatTaskListDate($("task-list-updated").value) +
            "[/size][/font][/b][/center][/th]",
          "[/tr]",
          "[tr]",
          "    [td][b][center]Task[/center][/b][/td]",
          "    [td][b][center]Handler[/center][/b][/td]",
          "    [td][center][/center][/td]",
          "[/tr]",
          ...tasks,
          "[/custable]",
        ].join("\n");
      }
      function resetTaskList() {
        $("task-list-updated").value = taskListTodayDate();
        updateTaskListDateLabel();
        $("task-list-rows").replaceChildren();
        addTaskListRow();
      }
      const EMD = "lssd.gov";
      function mail() {
        const f = $("b1").value.trim(),
          l = $("b2").value.trim();
        return f && l ? (f[0] + l).toLowerCase().replace(/[^a-z0-9]/g, "") + "@" + EMD : "";
      }
      function resetB() {
        ["b1", "b2", "b4", "b6", "b7"].forEach((i) => ($(i).value = ""));
        $("b8").selectedIndex = 0;
        applyDeputyDetails();
        drawC();
      }
      $("f-card").addEventListener("input", drawC);
      $("f-card").addEventListener("change", drawC);
      function updateCardCommands() {
        const name =
          [$("b1").value.trim(), $("b2").value.trim()].filter(Boolean).join(" ") || "Nume Prenume";
        $("bc-note-name").value = "/note ID AMOUNT name LSSD Business Card - " + name;
        $("bc-note-content").value = "/note ID AMOUNT content LINK";
      }
      // Paper styles for the business card. "" = plain white; otherwise one of PAPER_VARIANTS.
      let FX = "light",
        fxCache = null;
      const PAPER_VARIANTS = {
        // Gentle wrinkles (the original look)
        light: { seed: 20261016, cells: [260, 130, 65], rc: 190, rc2: 0, rw: 0.35, rw2: 0, sh: 26, al: 70, ad: 60, fibers: 220, vg: 0.2, tint: "#f3f0e8", folds: [] },
        // Paper that was scrunched up and flattened again: planar facets with thin sharp creases
        heavy: { seed: 7741993, cells: [330, 160, 80], rc: 220, rc2: 0, rw: 0.15, rw2: 0, sh: 9, al: 26, ad: 24, fibers: 150, vg: 0.2, tint: "#f1eee5", folds: [], facets: { cell: 96, light: 0.1, dark: 0.11, crease: 0.14, width: 2, warp: 34 } },
        // Folded into quarters and carried around: soft creases, panel shading, worn fold lines
        folded: { seed: 3318807, cells: [340, 170, 80], rc: 260, rc2: 0, rw: 0.12, rw2: 0, sh: 9, al: 26, ad: 22, fibers: 120, vg: 0.17, tint: "#f2eee4", folds: [["v", 0.5], ["h", 0.575]] },
      };
      function setFx(v) {
        FX = v in PAPER_VARIANTS ? v : "";
        drawC();
      }
      function paperRng(a) {
        return function () {
          a |= 0;
          a = (a + 0x6d2b79f5) | 0;
          let t = Math.imul(a ^ (a >>> 15), 1 | a);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      function buildPaperFx(w, h, variant) {
        const cfg = PAPER_VARIANTS[variant] || PAPER_VARIANTS.light;
        const o = document.createElement("canvas");
        o.width = w;
        o.height = h;
        const g = o.getContext("2d"),
          r = paperRng(cfg.seed),
          sm = (t) => t * t * (3 - 2 * t),
          layer = (cell) => {
            const gx = Math.ceil(w / cell) + 2,
              gy = Math.ceil(h / cell) + 2,
              v = new Float32Array(gx * gy);
            for (let i = 0; i < v.length; i++) v[i] = r();
            return (x, y) => {
              const fx = x / cell, fy = y / cell,
                ix = Math.floor(fx), iy = Math.floor(fy),
                tx = sm(fx - ix), ty = sm(fy - iy),
                a0 = v[iy * gx + ix], b0 = v[iy * gx + ix + 1],
                c0 = v[(iy + 1) * gx + ix], d0 = v[(iy + 1) * gx + ix + 1];
              return a0 + (b0 - a0) * tx + (c0 - a0) * ty + (a0 - b0 - c0 + d0) * tx * ty;
            };
          },
          n1 = layer(cfg.cells[0]), n2 = layer(cfg.cells[1]), n3 = layer(cfg.cells[2]), rd = layer(cfg.rc), rd2 = layer(cfg.rc2 || 97),
          H = new Float32Array(w * h);
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const ridge = 1 - Math.abs(rd(x, y) - 0.5) * 2;
            const ridge2 = cfg.rw2 ? 1 - Math.abs(rd2(x, y) - 0.5) * 2 : 0;
            H[y * w + x] =
              n1(x, y) * 1 + n2(x, y) * 0.45 + n3(x, y) * 0.18 + ridge * ridge * cfg.rw + ridge2 * ridge2 * cfg.rw2;
          }
        const lit = document.createElement("canvas");
        lit.width = w;
        lit.height = h;
        const lx = lit.getContext("2d"),
          img = lx.createImageData(w, h);
        for (let y = 0; y < h - 1; y++)
          for (let x = 0; x < w - 1; x++) {
            const i = y * w + x,
              sh = ((H[i + 1] - H[i]) * 0.7 + (H[i + w] - H[i]) * 0.7) * cfg.sh,
              o4 = i * 4;
            if (sh > 0) {
              img.data[o4] = img.data[o4 + 1] = img.data[o4 + 2] = 255;
              img.data[o4 + 3] = Math.min(cfg.al, sh * 90);
            } else {
              img.data[o4] = 45;
              img.data[o4 + 1] = 32;
              img.data[o4 + 2] = 18;
              img.data[o4 + 3] = Math.min(cfg.ad, -sh * 80);
            }
          }
        lx.putImageData(img, 0, 0);
        g.drawImage(lit, 0, 0);
        for (let n = 0; n < cfg.fibers; n++) {
          const x0 = r() * w, y0 = r() * h, a = r() * 6.28, l = 3 + r() * 9;
          g.strokeStyle = r() < 0.5 ? "rgba(70,55,35,0.07)" : "rgba(255,255,255,0.18)";
          g.lineWidth = 0.7;
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x0 + Math.cos(a) * l, y0 + Math.sin(a) * l);
          g.stroke();
        }
        if (cfg.facets) {
          // Crumpled facets: a jittered grid of points, each cell a patch of paper tilted a slightly
          // different way. The sampling is warped by noise so borders wander like real wrinkles,
          // and each crease has its own (mostly faint) strength, so nothing reads as a tile edge.
          const F = cfg.facets,
            cs = F.cell,
            gx = Math.ceil(w / cs) + 3,
            gy = Math.ceil(h / cs) + 3,
            PX = new Float32Array(gx * gy), PY = new Float32Array(gx * gy),
            PS = new Float32Array(gx * gy), PA = new Float32Array(gx * gy), PB = new Float32Array(gx * gy),
            cl = (v, m) => Math.max(0, Math.min(m - 1, v));
          for (let j = 0; j < gy; j++)
            for (let i = 0; i < gx; i++) {
              const k = j * gx + i;
              PX[k] = (i - 1 + 0.12 + 0.76 * r()) * cs;
              PY[k] = (j - 1 + 0.12 + 0.76 * r()) * cs;
              // Lighting follows a broad field (neighbouring facets face alike) plus a little chance
              PS[k] = Math.max(-1, Math.min(1, (n1(cl(PX[k], w), cl(PY[k], h)) - 0.5) * 1.5 + (r() - 0.5) * 0.7));
              PA[k] = ((r() - 0.5) * 0.7) / cs;
              PB[k] = ((r() - 0.5) * 0.7) / cs;
            }
          const fc = document.createElement("canvas");
          fc.width = w;
          fc.height = h;
          const fx = fc.getContext("2d"),
            fd = fx.createImageData(w, h);
          for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++) {
              const sx = x + (n2(x, y) - 0.5) * F.warp + (n3(x, y) - 0.5) * F.warp * 0.35,
                sy = y + (n3(x, y) - 0.5) * F.warp + (n2(x, y) - 0.5) * F.warp * 0.35,
                ci = Math.max(0, Math.min(gx - 3, Math.floor(sx / cs) + 1)),
                cj = Math.max(0, Math.min(gy - 3, Math.floor(sy / cs) + 1));
              let b1 = 1e9, b2 = 1e9, k1 = 0;
              for (let dj = -1; dj <= 1; dj++)
                for (let di = -1; di <= 1; di++) {
                  const k = (cj + dj) * gx + ci + di,
                    dx = sx - PX[k], dy = sy - PY[k], d = dx * dx + dy * dy;
                  if (d < b1) { b2 = b1; b1 = d; k1 = k; } else if (d < b2) b2 = d;
                }
              const edge = Math.sqrt(b2) - Math.sqrt(b1);
              let lit = PS[k1] + (sx - PX[k1]) * PA[k1] + (sy - PY[k1]) * PB[k1];
              lit = Math.max(-1, Math.min(1, lit));
              let la = lit > 0 ? lit * F.light : 0,
                da = lit < 0 ? -lit * F.dark : 0;
              if (edge < F.width * 3) {
                // Per-crease strength: most are faint, a few are noticeable
                const m = n2(x, y), strength = 0.12 + 0.88 * m * m * m,
                  t = Math.max(0, 1 - edge / (F.width * 3));
                da = Math.max(da, t * t * t * F.crease * strength);
              }
              const o4 = (y * w + x) * 4;
              if (da > la) {
                fd.data[o4] = 70; fd.data[o4 + 1] = 54; fd.data[o4 + 2] = 34; fd.data[o4 + 3] = da * 255;
              } else {
                fd.data[o4] = fd.data[o4 + 1] = fd.data[o4 + 2] = 255; fd.data[o4 + 3] = la * 255;
              }
            }
          fx.putImageData(fd, 0, 0);
          g.save();
          g.filter = "blur(0.7px)";
          g.drawImage(fc, 0, 0);
          g.restore();
        }
        cfg.folds.forEach(([dir, at]) => {
          // A fold: soft shading either side, a lit lip and a thin shadowed crease, slightly
          // wandering like real paper, then pale wear along it where the fibres have broken.
          const vert = dir === "v",
            len = vert ? h : w,
            pos = (vert ? w : h) * at,
            seed = [r() * 6.28, r() * 6.28, r() * 6.28],
            wob = (t) => Math.sin(t / 150 + seed[0]) * 1.8 + Math.sin(t / 53 + seed[1]) * 0.9 + Math.sin(t / 19 + seed[2]) * 0.4,
            pt = (t, off) => (vert ? [pos + wob(t) + off, t] : [t, pos + wob(t) + off]),
            line = (off, lw, col) => {
              g.beginPath();
              for (let t = -4; t <= len + 4; t += 6) {
                const [px, py] = pt(t, off);
                t === -4 ? g.moveTo(px, py) : g.lineTo(px, py);
              }
              g.lineWidth = lw;
              g.strokeStyle = col;
              g.lineJoin = g.lineCap = "round";
              g.stroke();
            };
          const span = (vert ? w : h) * 0.3,
            sh1 = vert ? g.createLinearGradient(pos - span, 0, pos, 0) : g.createLinearGradient(0, pos - span, 0, pos),
            sh2 = vert ? g.createLinearGradient(pos, 0, pos + span, 0) : g.createLinearGradient(0, pos, 0, pos + span);
          sh1.addColorStop(0, "rgba(255,255,255,0)");
          sh1.addColorStop(1, "rgba(60,45,25,0.07)");
          sh2.addColorStop(0, "rgba(255,255,255,0.10)");
          sh2.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = sh1;
          vert ? g.fillRect(pos - span, 0, span, h) : g.fillRect(0, pos - span, w, span);
          g.fillStyle = sh2;
          vert ? g.fillRect(pos, 0, span, h) : g.fillRect(0, pos, w, span);
          [26, 16, 9].forEach((lw) => line(3, lw, "rgba(60,45,25,0.03)"));
          line(-2.6, 5, "rgba(255,255,255,0.20)");
          line(-2.2, 1.6, "rgba(255,255,255,0.45)");
          line(0.6, 2.6, "rgba(60,42,22,0.16)");
          line(0.4, 1.1, "rgba(60,42,22,0.34)");
          for (let n = 0; n < 240; n++) {
            const t = r() * len, off = (r() + r() + r() - 1.5) * 3.2, l = 1 + r() * 4.5,
              [px, py] = pt(t, off);
            g.strokeStyle = r() < 0.78 ? `rgba(255,255,255,${0.35 + r() * 0.4})` : "rgba(70,52,30,0.22)";
            g.lineWidth = 0.7;
            g.beginPath();
            g.moveTo(px, py);
            g.lineTo(px + (vert ? (r() - 0.5) * 1.6 : l), py + (vert ? l : (r() - 0.5) * 1.6));
            g.stroke();
          }
        });
        if (cfg.folds.length > 1) {
          // Where the folds cross the paper is the most worn: a little extra whitening
          for (let n = 0; n < 90; n++) {
            const a = r() * 6.28, d = Math.pow(r(), 1.6) * 34;
            g.strokeStyle = `rgba(255,255,255,${0.3 + r() * 0.4})`;
            g.lineWidth = 0.8;
            g.beginPath();
            const px = w * 0.5 + Math.cos(a) * d, py = h * 0.575 + Math.sin(a) * d;
            g.moveTo(px, py);
            g.lineTo(px + Math.cos(a + 1.2) * (1 + r() * 4), py + Math.sin(a + 1.2) * (1 + r() * 4));
            g.stroke();
          }
        }
        const nz = document.createElement("canvas");
        nz.width = w;
        nz.height = h;
        const nx = nz.getContext("2d"),
          id = nx.createImageData(w, h);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = r() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = 16;
        }
        nx.putImageData(id, 0, 0);
        g.drawImage(nz, 0, 0);
        const vg = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.64);
        vg.addColorStop(0, "rgba(60,45,25,0)");
        vg.addColorStop(1, `rgba(60,45,25,${cfg.vg})`);
        g.fillStyle = vg;
        g.fillRect(0, 0, w, h);
        return o;
      }
      function drawC() {
        updateCardCommands();
        const c = $("cv"),
          x = c.getContext("2d"),
          W = 1000,
          H = 573;
        x.setTransform(1, 0, 0, 1, 0, 0);
        x.clearRect(0, 0, c.width, c.height);
        x.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
        x.fillStyle = FX ? PAPER_VARIANTS[FX].tint : "#ffffff";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "#000000";
        x.lineWidth = 2;
        x.strokeRect(1, 1, W - 2, H - 2);
        const SERIF = "'Times New Roman',Times,serif",
          SANS = "Arial,Helvetica,sans-serif",
          FANCY = "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif";
        const T = (t, font, y, al, xx, col) => {
          x.font = font;
          x.fillStyle = col || "#000000";
          x.textAlign = al;
          x.letterSpacing = "0px";
          x.fillText(t, xx, y);
        };
        const lg = document.querySelector(".brand .logo");
        if (lg && lg.complete && lg.naturalWidth) {
          const bw = 230,
            bh = 256,
            r = Math.min(bw / lg.naturalWidth, bh / lg.naturalHeight),
            w = lg.naturalWidth * r,
            h = lg.naturalHeight * r;
          x.drawImage(lg, 200 - w / 2, 217 - h / 2, w, h);
        }
        T("County of Los Santos", "italic bold 35px " + SERIF, 95, "right", 927);
        const caps = (txt, big, small, y, xr) => {
          const parts = [];
          txt.split(" ").forEach((word, i, a) => {
            parts.push([word[0], big]);
            parts.push([word.slice(1), small]);
            if (i < a.length - 1) parts.push([" ", big]);
          });
          let tw = 0;
          parts.forEach(([t, sz]) => {
            x.font = "bold " + sz + "px " + SANS;
            tw += x.measureText(t).width;
          });
          let cx = xr - tw;
          x.textAlign = "left";
          x.fillStyle = "#000000";
          x.letterSpacing = "0px";
          parts.forEach(([t, sz]) => {
            x.font = "bold " + sz + "px " + SANS;
            x.fillText(t, cx, y);
            cx += x.measureText(t).width;
          });
        };
        caps("SHERIFF'S DEPARTMENT", 46, 36, 141, 922);
        x.fillStyle = "#000000";
        x.fillRect(338, 157, 589, 3);
        T("A Tradition of Service", "italic bold 22px " + FANCY, 188, "left", 345);
        T("Since 1850", "italic bold 22px " + FANCY, 214, "left", 345);
        T("Grant Mendez - Sheriff", "bold 20px " + SERIF, 190, "right", 927);
        const nm = ($("b1").value.trim() + " " + $("b2").value.trim()).trim() || "Deputy Name";
        T(nm, "bold 44px " + SERIF, 284, "center", 620);
        T($("b7").value.trim(), "27px " + SANS, 319, "center", 620);
        T($("b6").value.trim(), "27px " + SANS, 353, "center", 620);
        const st = $("b8").value,
          info =
            st === "Hall of Justice"
              ? ["Hall of Justice", "100 Innocence Boulevard", "City of Davis, SA 90012"]
              : st === "Davis Sheriff's Station"
                ? ["Davis Sheriff's Station", "300 Innocence Boulevard", "City of Davis, SA 90220"]
                : st === "Eugene Biskarrat Regional Training Center"
                  ? ["Eugene Biskarrat Regional Training Center", "1060 Greenwich Parkway", "Los Santos, SA 90220"]
                  : ["Senora Sheriff's Station", "501 Joshua Road", "Sandy Shores, SA 90021"];
        info.push("LSSD.gta.world");
        info.forEach((ln, i) => T(ln, "26px " + SANS, 397 + i * 34, "left", 73));
        T("Office: 901", "26px " + SANS, 397, "right", 927);
        const cell = $("b4").value.trim();
        T("Cell: " + (cell || "—"), "26px " + SANS, 431, "right", 927);
        if (FX) {
          if (!fxCache || fxCache.fxKey !== FX || fxCache.width !== c.width || fxCache.height !== c.height) {
            fxCache = buildPaperFx(c.width, c.height, FX);
            fxCache.fxKey = FX;
          }
          x.setTransform(1, 0, 0, 1, 0, 0);
          x.drawImage(fxCache, 0, 0);
        }
      }
      async function dlCard() {
        try {
          const c = $("cv"),
            scale = 0.7,
            out = document.createElement("canvas");
          out.width = Math.round(c.width * scale);
          out.height = Math.round(c.height * scale);
          const x = out.getContext("2d");
          if (!x) throw new Error("Could not prepare resized PNG");
          x.drawImage(c, 0, 0, out.width, out.height);
          const b = await new Promise((resolve, reject) => {
              if (!out.toBlob) {
                reject(new Error("PNG export is not supported by this browser"));
                return;
              }
              out.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error("Could not create PNG image"))),
                "image/png",
              );
            }),
            n =
              ($("b1").value + "-" + $("b2").value).trim().replace(/[^A-Za-z0-9-]+/g, "_") ||
              "card",
            url = URL.createObjectURL(b),
            a = document.createElement("a");
          a.href = url;
          a.download = "business-card-" + n + ".png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast("Download started");
        } catch (e) {
          console.error("Business card PNG download failed:", e);
          toast("Download failed");
        }
      }
      drawC();
      if (document.fonts) {
        document.fonts.load("700 30px 'Barlow Condensed'").then(drawC);
        document.fonts.ready.then(drawC);
      }
      initializeTaskList();
      initTimeNowButtons();
      initPlacePickers();
      ["k9", "ck9", "dk9"].forEach(addK9Exhibit);
      addP();
      addE();
      addSevExhibit();
      updateIncidentTitle();
      resetUof();
      updateSubjectTitle();
      resetTc();
      initializeNcCitRows();
      initializeDeputyDetails();
      initializeSenoraK9Deployment();
      initializeDavisK9Deployment();
      initializeCsdK9Deployment();
      initializeVsrRequest();
      initializeSenoraLogbook();
      initializeSibStory();
      initializeSibActivity();
      initializeCitation();
      initializeOssGenerators();
      $("f-oss-incident").addEventListener("input", updateOssIncidentTitle);
      $("deputy-full-name").addEventListener("input", applySenoraK9DeputyDetails);
      $("deputy-rank").addEventListener("change", applySenoraK9DeputyDetails);
      $("deputy-full-name").addEventListener("input", applyDavisK9DeputyDetails);
      $("deputy-rank").addEventListener("change", applyDavisK9DeputyDetails);
      $("deputy-badge-number").addEventListener("input", applyDavisK9DeputyDetails);
      $("deputy-badge-number").addEventListener("input", applySenoraK9DeputyDetails);
      $("deputy-callsign").addEventListener("input", applySenoraK9DeputyDetails);
      $("deputy-callsign").addEventListener("input", applyDavisK9DeputyDetails);
      ["deputy-full-name", "deputy-rank", "deputy-badge-number", "deputy-callsign"].forEach((id) =>
        ["input", "change"].forEach((ev) => $(id).addEventListener(ev, applyCsdK9DeputyDetails)),
      );
      ["deputy-full-name", "deputy-rank", "deputy-bureau"].forEach((id) =>
        ["input", "change"].forEach((ev) => $(id).addEventListener(ev, applyVsrDeputyDetails)),
      );
      $("f-deputy").addEventListener("click", (event) => {
        if (event.target.closest("button")) {
          applySenoraK9DeputyDetails();
          applyDavisK9DeputyDetails();
          applyCsdK9DeputyDetails();
          applyVsrDeputyDetails();
        }
      });
      initializeKingPatrol();
      initializeApb();
      $("f-apb").addEventListener("input", updateApbPreview);
      $("f-apb").addEventListener("change", updateApbPreview);
      updateApbPreview();
      initializeEmailDate();
      initializeDepmail();
      initializeArrestWarrant();
      initializeSearchWarrant();
      initializeElectronicWarrant();
      mountAdditionalDatePickers();
      $("f-arrest-warrant").addEventListener("input", updateArrestPreview);
      $("f-arrest-warrant").addEventListener("click", updateArrestPreview);
      $("f-search-warrant").addEventListener("input", updateSearchPreview);
      $("f-search-warrant").addEventListener("click", updateSearchPreview);
      $("f-electronic-surveillance-warrant").addEventListener("input", updateElectronicPreview);
      $("f-electronic-surveillance-warrant").addEventListener("click", updateElectronicPreview);
      drawSheriffReport();
      const reportLogo = document.querySelector(".brand .logo");
      if (!reportLogo.complete)
        reportLogo.addEventListener("load", drawSheriffReport, { once: true });
      function toast(m) {
        const t = $("toast");
        t.textContent = m;
        t.classList.add("s");
        setTimeout(() => t.classList.remove("s"), 1600);
      }
      async function copyCardCommand(id) {
        const field = $(id);
        try {
          await navigator.clipboard.writeText(field.value);
          toast("Copied!");
        } catch (e) {
          field.select();
          try {
            if (!document.execCommand("copy")) throw new Error("Clipboard copy was rejected");
            toast("Copied!");
          } catch (error) {
            console.error("Could not copy business card command:", error);
            toast("Copy failed");
          }
          field.setSelectionRange(0, 0);
        }
      }
      const themeToggle = $("theme-toggle");
      themeToggle.checked = document.documentElement.dataset.theme === "dark";
      themeToggle.addEventListener("change", () => {
        const theme = themeToggle.checked ? "dark" : "light",
          root = document.documentElement,
          apply = () => {
            root.dataset.theme = theme;
          },
          reduce = matchMedia("(prefers-reduced-motion: reduce)").matches,
          label = themeToggle.closest(".theme-switch");
        if (label && !reduce) {
          label.classList.remove("ts-pulse");
          void label.offsetWidth;
          label.classList.add("ts-pulse");
        }
        if (!document.startViewTransition || reduce) apply();
        else {
          // The new theme spreads across the page from the switch, like the sky changing.
          const r = themeToggle.getBoundingClientRect(),
            x = r.left + r.width / 2,
            y = r.top + r.height / 2,
            radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
          try {
            document
              .startViewTransition(apply)
              .ready.then(() =>
                root.animate(
                  {
                    clipPath: [
                      `circle(0px at ${x}px ${y}px)`,
                      `circle(${radius}px at ${x}px ${y}px)`,
                    ],
                  },
                  {
                    duration: 650,
                    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                    pseudoElement: "::view-transition-new(root)",
                  },
                ),
              )
              .catch(() => {});
          } catch (e) {
            apply();
          }
        }
        try {
          localStorage.setItem("lssd-theme", theme);
        } catch (e) {
          console.error("Could not save the theme preference:", e);
          toast("Theme changed but could not be saved");
        }
      });
      // phone layout: the opened menu starts right below the top bar, whatever its height
      (() => {
        const bar = document.querySelector("aside");
        if (!bar || !window.ResizeObserver) return;
        new ResizeObserver(() => {
          document.documentElement.style.setProperty("--bar-h", bar.offsetHeight + "px");
        }).observe(bar);
      })();
      // replay the page-title animation whenever another page is opened
      (() => {
        const original = window.show, top = document.querySelector("main .top, .top");
        if (typeof original !== "function" || !top) return;
        window.show = function () {
          const result = original.apply(this, arguments);
          if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
            top.classList.remove("m-retitle");
            void top.offsetWidth;
            top.classList.add("m-retitle");
          }
          return result;
        };
      })();
      // Clicking a page travels through the pages in between (parallax); it never reacts to scrolling.
      // Only transform and opacity are animated on the live page: no snapshots, no blur, so it stays smooth.
      (() => {
        const before = window.show, main = document.querySelector("main");
        if (typeof before !== "function" || !main || !main.animate) return;
        const norm = (k) => (k === "davis-citation" ? "citation" : k);
        let active = null;
        function order() {
          const keys = [], labels = {};
          document.querySelectorAll('#si [onclick*="show("]').forEach((b) => {
            const m = /show\('([^']+)'\)/.exec(b.getAttribute("onclick") || "");
            if (!m || keys.includes(m[1])) return;
            keys.push(m[1]);
            labels[m[1]] = (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 44);
          });
          return { keys, labels };
        }
        function ghosts(mids, labels, dir) {
          const box = document.createElement("div");
          box.className = "pt-ghosts";
          const aside = document.querySelector("aside"), wide = innerWidth > 760;
          box.style.setProperty("--pt-dir", dir);
          box.style.setProperty("--pt-left", wide && aside ? aside.getBoundingClientRect().right + "px" : "0px");
          box.style.setProperty("--pt-top", !wide && aside ? aside.getBoundingClientRect().bottom + "px" : "0px");
          const make = (text, o) => {
            const g = document.createElement("div");
            g.className = "pt-ghost";
            if (text) {
              const b = document.createElement("b");
              b.textContent = text;
              g.append(b);
            }
            g.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
            Object.entries(o).forEach(([k, v]) => g.style.setProperty(k, v));
            box.append(g);
          };
          make("", { "--s": 0.8, "--o": 0.45, "--blur": "3px", "--x": "-22%", "--pt-dur": ".85s", "--pt-delay": "0s" });
          mids.forEach((k, i) =>
            make(labels[k] || "", { "--s": 1, "--o": 0.9, "--x": i % 2 ? "9%" : "-9%", "--pt-dur": ".72s", "--pt-delay": 0.05 * (i + 1) + "s" }),
          );
          make("", { "--s": 0.74, "--o": 0.4, "--blur": "4px", "--x": "24%", "--pt-dur": ".9s", "--pt-delay": ".06s" });
          document.body.append(box);
          return box;
        }
        function finish() {
          if (!active) return;
          active.anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
          active.timers.forEach(clearTimeout);
          active.box.remove();
          main.style.willChange = "";
          active = null;
        }
        window.show = function (k) {
          const args = arguments, self = this;
          const cur = document.querySelector('main > [id^="f-"]:not([hidden])');
          const from = cur ? cur.id.slice(2) : null, to = norm(k);
          if (active) { finish(); return before.apply(this, args); }
          if (!from || from === to || document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches)
            return before.apply(this, args);
          const { keys, labels } = order();
          const a = keys.indexOf(from);
          let b = keys.indexOf(k);
          if (b < 0) b = keys.indexOf(to);
          const known = a >= 0 && b >= 0, dir = !known || b >= a ? 1 : -1;
          let mids = known ? keys.slice(Math.min(a, b) + 1, Math.max(a, b)) : [];
          if (dir < 0) mids.reverse();
          if (mids.length > 4) mids = Array.from({ length: 4 }, (_, i) => mids[Math.round((i * (mids.length - 1)) / 3)]);
          const dist = known ? Math.abs(b - a) : 1;
          const travel = (Math.min(24 + dist * 4, 54) * innerHeight) / 100;
          const box = ghosts(mids, labels, dir);
          main.style.willChange = "transform, opacity";
          const out = main.animate(
            [{ transform: "none", opacity: 1 }, { transform: `translateY(${-dir * travel}px) scale(.97)`, opacity: 0 }],
            { duration: 280, easing: "cubic-bezier(.5,0,.8,.4)", fill: "forwards" },
          );
          const me = (active = { anims: [out], box, timers: [] });
          let swapped = false;
          const swap = () => {
            if (swapped || active !== me) return;
            swapped = true;
            try {
              before.apply(self, args); // swap the page while it is invisible
            } catch (e) {
              finish();
              throw e;
            }
            const inn = main.animate(
              [{ transform: `translateY(${dir * travel * 0.55}px) scale(1.02)`, opacity: 0 }, { transform: "none", opacity: 1 }],
              { duration: 520, delay: 110, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" },
            );
            me.anims.push(inn);
            out.cancel();
            inn.onfinish = finish;
          };
          out.onfinish = swap;
          // never get stuck if the browser is not painting (background tab): swap and clean up on timers
          me.timers.push(setTimeout(swap, 450), setTimeout(() => active === me && finish(), 1800));
        };
      })();
      // the search box types out example searches while it is idle
      (() => {
        const input = document.getElementById("hq"), home = document.getElementById("f-home");
        if (!input || !home || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const base = input.getAttribute("placeholder") || "";
        const phrases = ["incident report", "arrest warrant", "senora k9 deployment", "use of force", "citation", "commendations", "task list"];
        let p = 0, n = 0, dir = 1, wait = 0;
        setInterval(() => {
          if (home.hidden || document.hidden) return;
          if (input.value || document.activeElement === input) {
            if (input.placeholder !== base) input.placeholder = base;
            n = 0; dir = 1; wait = 0;
            return;
          }
          if (wait > 0) { wait--; return; }
          n += dir;
          const text = phrases[p];
          input.placeholder = "Search forms, e.g. " + text.slice(0, n) + (n < text.length || dir < 0 ? "|" : "");
          if (n >= text.length) { dir = -1; wait = 22; }
          else if (n <= 0 && dir < 0) { dir = 1; p = (p + 1) % phrases.length; wait = 6; }
        }, 70);
      })();
      async function copy(k) {
        if (k === "citation") {
          await copyCitation();
          return;
        }
        if (k === "arrest-warrant") {
          await copyArrestWarrant();
          return;
        }
        if (k === "search-warrant") {
          await copySearchWarrant();
          return;
        }
        if (k === "electronic-surveillance-warrant") {
          await copyElectronicWarrant();
          return;
        }
        const txt =
          k === "financial-service-warrant"
            ? buildFinancialServiceWarrant()
            : k === "king-patrol"
              ? buildKingPatrol()
              : k === "apb"
                ? buildApb()
                : k === "davis-k9-deployment"
                  ? buildDavisK9Deployment()
                  : k === "csd-k9-deployment"
                  ? buildCsdK9Deployment()
                  : k === "vst-request"
                  ? buildVsrRequest()
                  : k === "senora-k9-deployment"
                  ? buildSenoraK9Deployment()
                  : k === "sib-activity"
                    ? buildSibActivity()
                    : k === "sib-story"
                    ? buildSibStory()
                    : k === "senora-logbook"
                    ? buildSenoraLogbook()
                    : k === "oss-incident"
                      ? buildOssIncident()
                      : k === "oss-supplemental"
                        ? buildOssSupplemental()
                        : k === "task-list"
                          ? buildTaskList()
                          : k === "bb"
                            ? bbx()
                            : k === "inc"
                              ? bbi()
                              : k === "uof"
                                ? buildUof()
                                : k === "sup"
                                  ? bbs()
                                  : k === "subject"
                                    ? buildSubject()
                                    : k === "tc"
                                      ? buildTc()
                                      : k === "lab"
                                        ? buildLab()
                                        : k === "fleet"
                                          ? `[b]STATION:[/b] ${$("fleet-station").value}\n[b]PLATE:[/b] ${$("fleet-plate").value.trim()}\n[b]SERVICE:[/b] ${$("fleet-service").value}`
                                          : k === "dforensics"
                                            ? buildDigitalForensics()
                                            : k === "nccit"
                                              ? buildNcCit()
                                              : k === "nccit-supp"
                                                ? buildNcCitSupp()
                                                : k === "email"
                                                  ? buildEmailTemplate()
                                                  : k === "depmail"
                                                    ? buildDepmail()
                                                    : build(k);
        try {
          await navigator.clipboard.writeText(txt);
          toast("Copied!");
        } catch (e) {
          const a = document.createElement("textarea");
          a.value = txt;
          document.body.appendChild(a);
          a.select();
          try {
            document.execCommand("copy");
            toast("Copied!");
          } catch (e2) {
            toast("Copy failed");
          }
          a.remove();
        }
      }
      function resetF() {
        Q.forEach((_, i) => ($("q-no-" + i).checked = true));
        $("c1").value = $("c2").value = $("n2").value = "N/A";
        $("n1").value = "N/A.";
        $("d1").value = $("d2").value = $("d3").value = "";
        $("d4").value = "";
        applyDeputyDetails();
        drawSheriffReport();
      }
    
