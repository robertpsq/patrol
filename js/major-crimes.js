(() => {
  // ===== Major Crimes Bureau: Person of Interest File + Case Package =====
  const v = (id) => $(id).value.trim();

  // ---------- Person of Interest File ----------
  wirePersonPhotoEls({
    name: $("poi-name"),
    image: $("poi-img"),
    preview: $("poi-img-prev"),
    resetBtn: $("poi-img-reset"),
    profile: $("poi-profile"),
  });
  $("poi-race").addEventListener("change", () => {
    $("poi-race-other-wrap").hidden = $("poi-race").value !== "other";
  });

  function buildMcbPoi() {
    const name = v("poi-name"),
      race = $("poi-race").value === "other" ? v("poi-race-other") || "Other" : $("poi-race").value,
      image = v("poi-img") || PERSON_DEFAULT_IMG,
      profile = v("poi-profile") || (name ? personRecordUrl(name) : "https://mdc.gta.world/record/Full_Name");
    return [
      "[center][float=right][imgmw=50]https://i.imgur.com/et1xqzP.png[/imgmw][/float]",
      "[size=175][vstretch=1][font=Roboto Slab][color=black]LOS SANTOS COUNTY SHERIFF'S DEPARTMENT[/color][/font][/vstretch][/size]",
      "[size=150][font=times new roman][color=black]PERSON OF INTEREST FILE[/color][/font][/size]",
      "[/center]",
      `[hr][/hr][float=right][divbox=white][img]${image}[/img][/divbox][b]MDC FILE: [url=${profile}]ACCESS[/url][/b][/float]`,
      `[b]NAME:[/b] ${name}`,
      `[b]ALIASES:[/b] ${v("poi-aliases")}`,
      `[b]GANG MEMBER:[/b] ${$("poi-gang").checked ? "[cbc]" : "[cb]"}`,
      `[B]STATUS:[/B] ${$("poi-status").value}`,
      `[B]RACE:[/b] ${race}`,
      `[B]PHYSICAL DESCRIPTION:[/b] ${v("poi-physical")}`,
      `[B]ASSOCIATES:[/b] ${v("poi-associates")}`,
      `[B]NOTES:[/b] ${v("poi-notes")}`,
      "[hr][/hr]",
    ].join("\n");
  }
  window.resetMcbPoi = function () {
    ["poi-name", "poi-aliases", "poi-race-other", "poi-physical", "poi-associates", "poi-notes", "poi-profile"].forEach((id) => ($(id).value = ""));
    $("poi-profile").dataset.auto = "";
    $("poi-gang").checked = false;
    $("poi-img").dataset.manual = "";
    $("poi-img").value = PERSON_DEFAULT_IMG;
    $("poi-img-prev").dataset.target = PERSON_DEFAULT_IMG;
    setPersonPreview($("poi-img-prev"), PERSON_DEFAULT_IMG);
    $("poi-status").selectedIndex = 0;
    $("poi-race").selectedIndex = 0;
    $("poi-race-other-wrap").hidden = true;
  };

  // ---------- Case Package ----------
  const letter = (i) => { let s = ""; i++; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; };

  window.numberCasePersons = function () {
    $("mcb-case-persons").querySelectorAll(".mcb-p-label").forEach((label, i) => (label.textContent = "Person #" + (i + 1)));
  }
  window.numberCaseExhibits = function () {
    $("mcb-case-evidence").querySelectorAll(".mcb-e-label").forEach((label, i) => (label.textContent = "Exhibit " + letter(i)));
  }
  window.addCasePerson = function () {
    const row = document.createElement("div");
    row.className = "item mcb-person";
    row.innerHTML = `
      <div class='ih'><b class='mcb-p-label'></b><button class='b' type='button' onclick="this.closest('.mcb-person').remove();numberCasePersons()">Remove</button></div>
      ${personCard({
        nameClass: "mcb-p-name",
        placeholder: "John Doe",
        imgClass: "mcb-p-img",
        identity: `<div class='f'><span>Classification</span><select class='mcb-p-class'><option>Suspect</option><option>Victim</option><option>Witness</option><option value='other'>Other (specify)</option></select></div>
          <div class='f'><span>Date of Birth</span><input type='text' class='mcb-p-dob' autocomplete='off'></div>
          <div class='f p-full mcb-p-other-wrap' hidden><span>Specify Classification</span><input type='text' class='mcb-p-other' autocomplete='off'></div>`,
        details: `<div class='f'><span>Phone Number</span><input type='text' class='mcb-p-phone' autocomplete='off'></div>
          <div class='f'><span>Residence</span><input type='text' class='mcb-p-res' autocomplete='off'></div>
          <div class='f'><span>Other Properties</span><input type='text' class='mcb-p-props' autocomplete='off'></div>
          <div class='f'><span>Gang Affiliation</span><input type='text' class='mcb-p-gang' autocomplete='off'></div>`,
      })}`;
    $("mcb-case-persons").appendChild(row);
    numberCasePersons();
    const cls = row.querySelector(".mcb-p-class");
    cls.addEventListener("change", () => (row.querySelector(".mcb-p-other-wrap").hidden = cls.value !== "other"));
    wirePersonPhoto(row, "mcb-p-img", row.querySelector(".mcb-p-name"));
    initPersonDeath(row, () => row.querySelector(".mcb-p-name").value.trim());
  }
  window.addCaseExhibit = function () {
    const row = document.createElement("div");
    row.className = "item mcb-exhibit";
    row.innerHTML = `
      <div class='ih'><b class='mcb-e-label'></b><button class='b' type='button' onclick="this.closest('.mcb-exhibit').remove();numberCaseExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='mcb-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='mcb-e-body' placeholder='Images, links, details…'></textarea></div>`;
    $("mcb-case-evidence").appendChild(row);
    numberCaseExhibits();
  }

  function buildMcbCase() {
    const street = v("mcb-case-street"), district = v("mcb-case-district"),
      badge = v("mcb-case-badge").replace(/^#/, ""),
      when = formatPickerDate($("mcb-case-date").value, "time-date", $("mcb-case-time").value);
    const people = [...$("mcb-case-persons").querySelectorAll(".mcb-person")].map((row, i) => {
      const g = (c) => row.querySelector(c).value.trim(),
        realName = g(".mcb-p-name"),
        name = personDisplayName(row, realName),
        death = personDeathState(row),
        cls = g(".mcb-p-class") === "other" ? g(".mcb-p-other") || "Other" : g(".mcb-p-class");
      return [
        `[u]Person #${i + 1}${name ? " - " + name : ""}[/u] [aligntable=right,0,0,55,0,0,0][img]${g(".mcb-p-img") || PERSON_DEFAULT_IMG}[/img][/aligntable]`,
        `[b]Classification:[/b] ${cls}`,
        `[b]Date of Birth:[/b] ${g(".mcb-p-dob")}`,
        `[b]Phone Number:[/b] ${g(".mcb-p-phone")}`,
        `[b]Residence:[/b] ${g(".mcb-p-res")}`,
        `[b]Other Properties:[/b] ${g(".mcb-p-props")}`,
        `[b]Gang Affiliation:[/b] ${g(".mcb-p-gang")}`,
        ...(death.dead ? [`[altspoiler=OOC Death Details]${death.ooc}[/altspoiler]`] : []),
      ].join("\n");
    });
    const exhibits = [...$("mcb-case-evidence").querySelectorAll(".mcb-exhibit")].map((row, i) =>
      `[*][b]Exhibit ${letter(i)}; ${row.querySelector(".mcb-e-desc").value.trim() || "Evidence description"}[/b]\n[spoiler]${row.querySelector(".mcb-e-body").value.trim()}[/spoiler]`,
    );
    return [
      "[font=Arial][color=black]",
      "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
      `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
      "[size=110][u]CASE PACKAGE[/u][/size][/center][hr][/hr]",
      "[font=arial][color=black][indent][size=105][b]Investigative Background and Assignment[/b][/size]",
      "[indent]",
      `[b]Classification / Penal Code(s):[/b] ${v("mcb-case-charges")}`,
      `[b]Time & Date:[/b] ${when}`,
      `[b]Location:[/b] ${[street, district, "Los Santos", "SA"].filter(Boolean).join(", ")}`,
      `[b]Handling Investigator:[/b] ${v("mcb-case-rank") || "Detective"} ${v("mcb-case-name")}${badge ? ", badge #" + badge : ""}`,
      `[b]Additional Investigator(s):[/b] ${v("mcb-case-additional")}`,
      "[/indent]",
      "[size=105][b]Involved Persons[/b][/size]",
      "[indent]",
      people.join("\n\n"),
      "[/indent]",
      "[size=105][b]Narrative[/b][/size]",
      `[indent][b]BRIEF:[/b] ${v("mcb-case-brief")}`,
      v("mcb-case-narrative"),
      "[/indent]",
      "[size=105][b]Evidence[/b][/size]",
      "[list]" + exhibits.join("\n") + "[/list]",
    ].join("\n");
  }
  window.resetMcbCase = function () {
    ["mcb-case-street", "mcb-case-district", "mcb-case-additional", "mcb-case-brief", "mcb-case-narrative"].forEach((id) => ($(id).value = ""));
    $("mcb-case-time").value = "00:00";
    $("mcb-case-date").value = taskListTodayDate();
    updateTaskListDateLabel("mcb-case-date");
    $("mcb-case-persons").replaceChildren();
    $("mcb-case-evidence").replaceChildren();
    addCasePerson();
    addCaseExhibit();
    applyDeputyDetails();
  };
  $("mcb-case-date").value = taskListTodayDate();
  updateTaskListDateLabel("mcb-case-date");
  addCasePerson();
  addCaseExhibit();
  applyDeputyDetails();

  // ---------- Supplemental Report ----------
  window.numberSuppExhibits = function () {
    $("mcb-supp-evidence").querySelectorAll(".mcb-supp-e-label").forEach((label, i) => (label.textContent = "Attachment " + letter(i)));
  };
  window.addSuppExhibit = function () {
    const row = document.createElement("div");
    row.className = "item mcb-supp-exhibit";
    row.innerHTML = `
      <div class='ih'><b class='mcb-supp-e-label'></b><button class='b' type='button' onclick="this.closest('.mcb-supp-exhibit').remove();numberSuppExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='mcb-supp-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='mcb-supp-e-body' placeholder='Images, links, details…'></textarea></div>`;
    $("mcb-supp-evidence").appendChild(row);
    numberSuppExhibits();
  };

  function buildMcbSupplemental() {
    const badge = v("mcb-supp-badge").replace(/^#/, "");
    const exhibits = [...$("mcb-supp-evidence").querySelectorAll(".mcb-supp-exhibit")].map((row, i) =>
      `[*][b]Attachment ${letter(i)}; ${row.querySelector(".mcb-supp-e-desc").value.trim() || "Description"}[/b]\n[spoiler]${row.querySelector(".mcb-supp-e-body").value.trim()}[/spoiler]`,
    );
    return [
      "[font=Arial][color=black]",
      "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
      `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
      "[size=110][u]SUPPLEMENTAL REPORT[/u][/size][/center][hr][/hr]",
      "[font=arial][color=black]",
      "[size=105][b]Narrative[/b][/size]",
      `[indent]${v("mcb-supp-narrative")}[/indent]`,
      "",
      "[size=105][b]Evidence[/b][/size]",
      "[list]" + exhibits.join("\n") + "[/list]",
      "",
      "",
      "[size=105][b]Filed By:[/b][/size]",
      `[indent]${v("mcb-supp-rank") || "Detective"} ${v("mcb-supp-name")}${badge ? ", badge #" + badge : ""}[/indent]`,
    ].join("\n");
  }
  window.resetMcbSupplemental = function () {
    $("mcb-supp-narrative").value = "";
    $("mcb-supp-evidence").replaceChildren();
    addSuppExhibit();
    applyDeputyDetails();
  };
  addSuppExhibit();
  applyDeputyDetails();

  // ===== Homicide Bureau: Case Package + Supplemental (identical logic/format to MCB) =====
  window.numberHbCasePersons = function () {
    $("hb-case-persons").querySelectorAll(".hb-p-label").forEach((label, i) => (label.textContent = "Person #" + (i + 1)));
  };
  window.numberHbCaseExhibits = function () {
    $("hb-case-evidence").querySelectorAll(".hb-e-label").forEach((label, i) => (label.textContent = "Exhibit " + letter(i)));
  };
  window.addHbCasePerson = function () {
    const row = document.createElement("div");
    row.className = "item hb-person";
    row.innerHTML = `
      <div class='ih'><b class='hb-p-label'></b><button class='b' type='button' onclick="this.closest('.hb-person').remove();numberHbCasePersons()">Remove</button></div>
      ${personCard({
        nameClass: "hb-p-name",
        placeholder: "John Doe",
        imgClass: "hb-p-img",
        identity: `<div class='f'><span>Classification</span><select class='hb-p-class'><option>Suspect</option><option>Victim</option><option>Witness</option><option value='other'>Other (specify)</option></select></div>
          <div class='f'><span>Date of Birth</span><input type='text' class='hb-p-dob' autocomplete='off'></div>
          <div class='f p-full hb-p-other-wrap' hidden><span>Specify Classification</span><input type='text' class='hb-p-other' autocomplete='off'></div>`,
        details: `<div class='f'><span>Phone Number</span><input type='text' class='hb-p-phone' autocomplete='off'></div>
          <div class='f'><span>Residence</span><input type='text' class='hb-p-res' autocomplete='off'></div>
          <div class='f'><span>Other Properties</span><input type='text' class='hb-p-props' autocomplete='off'></div>
          <div class='f'><span>Gang Affiliation</span><input type='text' class='hb-p-gang' autocomplete='off'></div>`,
      })}`;
    $("hb-case-persons").appendChild(row);
    numberHbCasePersons();
    const cls = row.querySelector(".hb-p-class");
    cls.addEventListener("change", () => (row.querySelector(".hb-p-other-wrap").hidden = cls.value !== "other"));
    wirePersonPhoto(row, "hb-p-img", row.querySelector(".hb-p-name"));
    initPersonDeath(row, () => row.querySelector(".hb-p-name").value.trim());
  };
  window.addHbCaseExhibit = function () {
    const row = document.createElement("div");
    row.className = "item hb-exhibit";
    row.innerHTML = `
      <div class='ih'><b class='hb-e-label'></b><button class='b' type='button' onclick="this.closest('.hb-exhibit').remove();numberHbCaseExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='hb-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='hb-e-body' placeholder='Images, links, details…'></textarea></div>`;
    $("hb-case-evidence").appendChild(row);
    numberHbCaseExhibits();
  };

  function buildHbCase() {
    const street = v("hb-case-street"), district = v("hb-case-district"),
      badge = v("hb-case-badge").replace(/^#/, ""),
      when = formatPickerDate($("hb-case-date").value, "time-date", $("hb-case-time").value);
    const people = [...$("hb-case-persons").querySelectorAll(".hb-person")].map((row, i) => {
      const g = (c) => row.querySelector(c).value.trim(),
        realName = g(".hb-p-name"),
        name = personDisplayName(row, realName),
        death = personDeathState(row),
        cls = g(".hb-p-class") === "other" ? g(".hb-p-other") || "Other" : g(".hb-p-class");
      return [
        `[u]Person #${i + 1}${name ? " - " + name : ""}[/u] [aligntable=right,0,0,55,0,0,0][img]${g(".hb-p-img") || PERSON_DEFAULT_IMG}[/img][/aligntable]`,
        `[b]Classification:[/b] ${cls}`,
        `[b]Date of Birth:[/b] ${g(".hb-p-dob")}`,
        `[b]Phone Number:[/b] ${g(".hb-p-phone")}`,
        `[b]Residence:[/b] ${g(".hb-p-res")}`,
        `[b]Other Properties:[/b] ${g(".hb-p-props")}`,
        `[b]Gang Affiliation:[/b] ${g(".hb-p-gang")}`,
        ...(death.dead ? [`[altspoiler=OOC Death Details]${death.ooc}[/altspoiler]`] : []),
      ].join("\n");
    });
    const exhibits = [...$("hb-case-evidence").querySelectorAll(".hb-exhibit")].map((row, i) =>
      `[*][b]Exhibit ${letter(i)}; ${row.querySelector(".hb-e-desc").value.trim() || "Evidence description"}[/b]\n[spoiler]${row.querySelector(".hb-e-body").value.trim()}[/spoiler]`,
    );
    return [
      "[font=Arial][color=black]",
      "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
      `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
      "[size=110][u]CASE PACKAGE[/u][/size][/center][hr][/hr]",
      "[font=arial][color=black][indent][size=105][b]Investigative Background and Assignment[/b][/size]",
      "[indent]",
      `[b]Classification / Penal Code(s):[/b] ${v("hb-case-charges")}`,
      `[b]Time & Date:[/b] ${when}`,
      `[b]Location:[/b] ${[street, district, "Los Santos", "SA"].filter(Boolean).join(", ")}`,
      `[b]Handling Investigator:[/b] ${v("hb-case-rank") || "Detective"} ${v("hb-case-name")}${badge ? ", badge #" + badge : ""}`,
      `[b]Additional Investigator(s):[/b] ${v("hb-case-additional")}`,
      "[/indent]",
      "[size=105][b]Involved Persons[/b][/size]",
      "[indent]",
      people.join("\n\n"),
      "[/indent]",
      "[size=105][b]Narrative[/b][/size]",
      `[indent][b]BRIEF:[/b] ${v("hb-case-brief")}`,
      v("hb-case-narrative"),
      "[/indent]",
      "[size=105][b]Evidence[/b][/size]",
      "[list]" + exhibits.join("\n") + "[/list]",
    ].join("\n");
  }
  window.resetHbCase = function () {
    ["hb-case-street", "hb-case-district", "hb-case-additional", "hb-case-brief", "hb-case-narrative"].forEach((id) => ($(id).value = ""));
    $("hb-case-time").value = "00:00";
    $("hb-case-date").value = taskListTodayDate();
    updateTaskListDateLabel("hb-case-date");
    $("hb-case-persons").replaceChildren();
    $("hb-case-evidence").replaceChildren();
    addHbCasePerson();
    addHbCaseExhibit();
    applyDeputyDetails();
  };
  $("hb-case-date").value = taskListTodayDate();
  updateTaskListDateLabel("hb-case-date");
  addHbCasePerson();
  addHbCaseExhibit();
  applyDeputyDetails();

  window.numberHbSuppExhibits = function () {
    $("hb-supp-evidence").querySelectorAll(".hb-supp-e-label").forEach((label, i) => (label.textContent = "Attachment " + letter(i)));
  };
  window.addHbSuppExhibit = function () {
    const row = document.createElement("div");
    row.className = "item hb-supp-exhibit";
    row.innerHTML = `
      <div class='ih'><b class='hb-supp-e-label'></b><button class='b' type='button' onclick="this.closest('.hb-supp-exhibit').remove();numberHbSuppExhibits()">Remove</button></div>
      <div class='f'><span>Evidence Description</span><input type='text' class='hb-supp-e-desc' placeholder='Evidence description' autocomplete='off'></div>
      <div class='f'><span>Evidence (inside the spoiler)</span><textarea class='hb-supp-e-body' placeholder='Images, links, details…'></textarea></div>`;
    $("hb-supp-evidence").appendChild(row);
    numberHbSuppExhibits();
  };

  function buildHbSupplemental() {
    const badge = v("hb-supp-badge").replace(/^#/, "");
    const exhibits = [...$("hb-supp-evidence").querySelectorAll(".hb-supp-exhibit")].map((row, i) =>
      `[*][b]Attachment ${letter(i)}; ${row.querySelector(".hb-supp-e-desc").value.trim() || "Description"}[/b]\n[spoiler]${row.querySelector(".hb-supp-e-body").value.trim()}[/spoiler]`,
    );
    return [
      "[font=Arial][color=black]",
      "[center][img]https://i.imgur.com/LEWTXbL.png[/img]",
      `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]`,
      "[size=110][u]SUPPLEMENTAL REPORT[/u][/size][/center][hr][/hr]",
      "[font=arial][color=black]",
      "[size=105][b]Narrative[/b][/size]",
      `[indent]${v("hb-supp-narrative")}[/indent]`,
      "",
      "[size=105][b]Evidence[/b][/size]",
      "[list]" + exhibits.join("\n") + "[/list]",
      "",
      "",
      "[size=105][b]Filed By:[/b][/size]",
      `[indent]${v("hb-supp-rank") || "Detective"} ${v("hb-supp-name")}${badge ? ", badge #" + badge : ""}[/indent]`,
    ].join("\n");
  }
  window.resetHbSupplemental = function () {
    $("hb-supp-narrative").value = "";
    $("hb-supp-evidence").replaceChildren();
    addHbSuppExhibit();
    applyDeputyDetails();
  };
  addHbSuppExhibit();
  applyDeputyDetails();

  // ---------- Person of Interest File (shared by every Detective Division bureau) ----------
  function makePoi(prefix) {
    const id = (s) => prefix + "-" + s;
    wirePersonPhotoEls({
      name: $(id("name")),
      image: $(id("img")),
      preview: $(id("img-prev")),
      resetBtn: $(id("img-reset")),
      profile: $(id("profile")),
    });
    $(id("race")).addEventListener("change", () => {
      $(id("race-other-wrap")).hidden = $(id("race")).value !== "other";
    });
    function build() {
      const name = v(id("name")),
        race = $(id("race")).value === "other" ? v(id("race-other")) || "Other" : $(id("race")).value,
        image = v(id("img")) || PERSON_DEFAULT_IMG,
        profile = v(id("profile")) || (name ? personRecordUrl(name) : "https://mdc.gta.world/record/Full_Name");
      return [
        "[center][float=right][imgmw=50]https://i.imgur.com/et1xqzP.png[/imgmw][/float]",
        "[size=175][vstretch=1][font=Roboto Slab][color=black]LOS SANTOS COUNTY SHERIFF'S DEPARTMENT[/color][/font][/vstretch][/size]",
        "[size=150][font=times new roman][color=black]PERSON OF INTEREST FILE[/color][/font][/size]",
        "[/center]",
        `[hr][/hr][float=right][divbox=white][img]${image}[/img][/divbox][b]MDC FILE: [url=${profile}]ACCESS[/url][/b][/float]`,
        `[b]NAME:[/b] ${name}`,
        `[b]ALIASES:[/b] ${v(id("aliases"))}`,
        `[b]GANG MEMBER:[/b] ${$(id("gang")).checked ? "[cbc]" : "[cb]"}`,
        `[B]STATUS:[/B] ${$(id("status")).value}`,
        `[B]RACE:[/b] ${race}`,
        `[B]PHYSICAL DESCRIPTION:[/b] ${v(id("physical"))}`,
        `[B]ASSOCIATES:[/b] ${v(id("associates"))}`,
        `[B]NOTES:[/b] ${v(id("notes"))}`,
        "[hr][/hr]",
      ].join("\n");
    }
    function reset() {
      [id("name"), id("aliases"), id("race-other"), id("physical"), id("associates"), id("notes"), id("profile")].forEach(
        (i) => ($(i).value = ""),
      );
      $(id("profile")).dataset.auto = "";
      $(id("gang")).checked = false;
      $(id("img")).dataset.manual = "";
      $(id("img")).value = PERSON_DEFAULT_IMG;
      $(id("img-prev")).dataset.target = PERSON_DEFAULT_IMG;
      setPersonPreview($(id("img-prev")), PERSON_DEFAULT_IMG);
      $(id("status")).selectedIndex = 0;
      $(id("race")).selectedIndex = 0;
      $(id("race-other-wrap")).hidden = true;
    }
    return { build, reset };
  }
  const nbPoi = makePoi("nb-poi");
  const hbPoi = makePoi("hb-poi");
  const ossbPoi = makePoi("ossb-poi");
  window.resetNbPoi = nbPoi.reset;
  window.resetHbPoi = hbPoi.reset;
  window.resetOssbPoi = ossbPoi.reset;

  // ---------- copy hook ----------
  const baseCopy = window.copy;
  window.copy = async function (k) {
    const keys = ["mcb-poi", "mcb-case", "mcb-supplemental", "nb-poi", "hb-poi", "hb-case", "hb-supplemental", "ossb-poi"];
    if (!keys.includes(k)) return baseCopy.apply(this, arguments);
    const builders = {
      "mcb-poi": buildMcbPoi,
      "mcb-case": buildMcbCase,
      "mcb-supplemental": buildMcbSupplemental,
      "nb-poi": nbPoi.build,
      "hb-poi": hbPoi.build,
      "hb-case": buildHbCase,
      "hb-supplemental": buildHbSupplemental,
      "ossb-poi": ossbPoi.build,
    };
    const txt = builders[k]();
    try { await navigator.clipboard.writeText(txt); toast("Copied!"); }
    catch (e) {
      const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select();
      try { document.execCommand("copy"); toast("Copied!"); } catch (e2) { toast("Copy failed"); }
      a.remove();
    }
  };
  window.__mcb = { buildMcbPoi, buildMcbCase, buildMcbSupplemental };
  window.__hb = { buildHbCase, buildHbSupplemental };
  window.__poi = { buildNbPoi: nbPoi.build, buildHbPoi: hbPoi.build, buildOssbPoi: ossbPoi.build };
})();
    
