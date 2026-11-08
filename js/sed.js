/* ===== SED: Deployment Log ===== */
(() => {
  const g = (i) => $("sed-" + i);
  const ID = ["no", "unit", "date", "time", "location", "city", "type", "ic", "tc", "scout", "personnel", "narrative"];
  const clean = (n) => String(n || "").trim().replace(/^IL#/i, "").trim();
  const lines = (t) => String(t || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // pure: v = { key: string }, dateTime already formatted
  function sedBuild(v) {
    return [
      "[divbox=white][center][sebheader][/center]",
      "[hr][/hr]",
      "[divbox=black][color=white][b][center]IL#" + v.no + "[/center][/b][/color][/divbox]",
      "[table=Arial][tr]",
      "[td][b]DATE & TIME:[/b] " + v.dateTime + "[/td]",
      "[td][b]LOCATION:[/b] " + v.location + "[/td]",
      "[/tr]",
      "[tr]",
      "[td][b]TYPE OF INCIDENT:[/b] " + v.type + "[/td]",
      "[td][b]STATION/UNIT REQUESTING:[/b] " + v.unit + "[/td]",
      "[/tr][/table]",
      "",
      "[size=85][u][b]SCENE COMMAND[/b][/u]",
      "[list][*][b]Incident Commander:[/b] " + v.ic,
      "[*][b]Tactical Commander:[/b] " + v.tc,
      "[*][b]Designated Scout:[/b] " + v.scout + "[/list]",
      "[u][b]RESPONDING PERSONNEL[/b][/u]",
      "[list]" + v.personnel.map((p) => "[*]" + p).join("\n") + "[/list][/size]",
      "",
      "[divbox=white][center][b]INCIDENT NARRATIVE & EXTERNAL REFERENCES[/b][/center]",
      "[size=85]" + v.narrative,
      "",
      "[/size][/divbox][/divbox]",
    ].join("\n");
  }
  // [IL#26-311] Elgin Avenue, armed pursuit.
  function sedTitle(no, location, type) {
    const n = clean(no), st = String(location || "").split(",")[0].trim(), si = String(type || "").trim().replace(/\.+$/, "");
    return "[IL#" + n + "] " + [st, si].filter(Boolean).join(", ") + ".";
  }
  function values() {
    const v = {};
    ID.forEach((i) => { v[i] = g(i).value; });
    ["unit", "location", "city", "type", "ic", "tc", "scout"].forEach((k) => { v[k] = v[k].trim(); });
    v.location = [v.location, v.city].filter(Boolean).join(", ");
    v.no = clean(v.no);
    v.narrative = v.narrative.trim();
    v.personnel = lines(v.personnel);
    // DD/MMM/YYYY - HH:MM
    v.dateTime = v.date ? formatPickerDate(v.date, "short") + " - " + (/^([01]\d|2[0-3]):[0-5]\d$/.test(g("time").value) ? g("time").value : "00:00") : "";
    return v;
  }
  const refresh = () => { g("title").value = sedTitle(g("no").value, g("location").value, g("type").value); };

  window.resetSedDeployment = function () {
    ID.forEach((i) => { if (i !== "date" && i !== "time") g(i).value = ""; });
    g("date").value = taskListTodayDate();
    g("time").value = "00:00";
    updateTaskListDateLabel("sed-date");
    refresh();
    growAllTextareas("f-sed-deployment");
  };
  g("date").value = taskListTodayDate();
  updateTaskListDateLabel("sed-date");
  refresh();
  $("sed-now").addEventListener("click", () => {
    // UK time (Europe/London), not the computer's own clock
    g("date").value = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    g("time").value = ukTimeNow("HH:MM");
    updateTaskListDateLabel("sed-date");
  });
  const form = $("f-sed-deployment");
  ["input", "change"].forEach((ev) => form.addEventListener(ev, (e) => {
    if (ev === "input" && e.target.matches("textarea")) growTextarea(e.target);
    refresh();
  }));
  window.__sed = { build: sedBuild, title: sedTitle, values };

  const baseCopy = window.copy;
  window.copy = async function (k) {
    if (k !== "sed-deployment") return baseCopy.apply(this, arguments);
    const txt = sedBuild(values());
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
    if (k === "sed-deployment") { refresh(); growAllTextareas("f-sed-deployment"); }
  };
})();
