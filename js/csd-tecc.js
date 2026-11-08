/* K-9 Tactical Emergency Casualty Care (TECC), CSD. Read-only guide built from the CSD "K-9 TECC" forum post.
   The top card is always visible. Below it, ticking a situation opens the next questions and the care for it,
   and the "Do this" list collects the steps for everything ticked.
   In texts: {{highlight}} marks the essential part, [[never]] marks a prohibition. A line starting "- " is a bullet. */
(() => {
  const root = document.getElementById("f-csd-tecc");
  if (!root) return;

  /* ---------- shared bleeding block (used under fire and in field care) ---------- */
  const bleeding = (p) => [
    {
      id: p + "-limb-low",
      t: "Bleeding below the elbow or knee",
      d: "Direct pressure and a pressure dressing/bandage on the wound.",
      b: "{{Direct pressure and a pressure dressing/bandage.}}",
    },
    {
      id: p + "-limb-high",
      t: "Deep compressible wound on the upper limb (triceps, caudal thigh, quadriceps) or junctional (axilla, groin)",
      d: "Direct pressure, pack the wound (hemostatic gauze preferred, or a standard roll of gauze), then a pressure bandage.",
      b: "{{Direct pressure, then pack the wound}} with a dressing impregnated with hemostatic agent (preferred) or a standard roll of gauze, and finish with a {{pressure bandage}}.",
    },
    {
      id: p + "-trunk",
      t: "Bleeding over the chest or abdomen (non-extremity)",
      d: "Direct pressure on open wounds while moving to cover, occlusive seal on open wounds, and evacuate fast: internal bleeding is likely.",
      b: "These injuries are hard to identify and treat under threat. Apply {{direct pressure to the open wound}} while you rapidly move the canine to cover. An {{occlusive seal/bandage}} is appropriate if open wounds are present.\n{{Rapid evacuation is critical}} to save a canine with internal bleeding.",
    },
  ];

  /* ---------- the tree ---------- */
  const TREE = {
    q: "Where are you right now?",
    pick: "one",
    k: [
      {
        id: "cuf",
        t: "Under fire or imminent threat",
        tag: "CUF / DTC",
        d: "Care under fire: win the threat or reach cover, then stop massive bleeding only.",
        b: "You and the canine are still under hostile fire or imminent threat. The risk of further injury is extremely high.\n- Gain tactical superiority (suppress the threat).\n- Move the canine to a safe position.\n- Treat {{immediately life-threatening bleeding}} and nothing else.\nYou only have the supplies you carry, no one will help you, you cannot do a detailed exam, and at night you will see very little.\n[[Do not use commercial human tourniquets]]: windless tourniquets made for people do not work on canines.",
        pick: "many",
        q: "What is happening?",
        k: [
          {
            id: "cuf-bleed",
            t: "Life-threatening bleeding",
            d: "Control the massive bleeding before anything else. It kills first.",
            b: "Life-threatening bleeding is {{bright red spurting blood (arterial)}} or any large blood volume lost regardless of rate, for example {{soaking a hand-sized area in under 15 seconds}}.\n{{When in doubt, treat it as life-threatening.}} Major bleeding is the number one killer of humans and canines.",
            pick: "many",
            q: "Where is the bleeding?",
            k: bleeding("cuf"),
          },
          {
            id: "cuf-drag",
            t: "The canine must be moved out of danger",
            d: "Drag the canine out of danger by the collar, vest, scruff, rump or legs.",
            b: "Getting the canine out of danger as fast as possible is the priority. The simplest option is to {{drag the canine by the collar, vest, scruff of the neck, rump and/or legs}}.",
          },
        ],
      },
      {
        id: "tfc",
        t: "Threat reduced, no longer under direct fire",
        tag: "TFC / ITC",
        d: "Field care: reassess for bleeding, then airway, breathing and shock.",
        b: "The imminent threat is reduced but may still exist, and this also applies to injuries with no hostile fire. Time before evacuation can be minutes to many hours. First aid is still dictated by the tactical situation.\n- Supplies are still limited to what you carry.\n- Use the SWAT-T stretch wrap and tuck tourniquets from your K-9 IFAK. [[Do NOT use human tourniquets.]]\n- [[Do not use supplies meant for human casualties]] until {{ALL human injuries have been addressed}}.",
        pick: "many",
        q: "What do you see? Tick all that apply.",
        k: [
          {
            id: "tfc-bleed",
            t: "Bleeding (new, missed or not yet addressed)",
            d: "Reassess the whole canine for bleeding you missed and stop it. SWAT-T from the K-9 IFAK, never a human tourniquet.",
            b: "{{Reassess the canine for any bleeding wound not seen or not addressed}}, and stop it using the methods below. Use the {{SWAT-T}} from your K-9 IFAK; [[never a commercial human tourniquet]].",
            pick: "many",
            q: "Where is the bleeding?",
            k: bleeding("tfc"),
          },
          {
            id: "tfc-arrest",
            t: "No pulse, not breathing, no signs of life",
            d: "Decide on CPR by the cause: none for blast or penetrating injury.",
            b: "CPR for traumatic arrest is generally not successful and withholds care from canines with less severe injuries, and exposes you to threat.",
            pick: "one",
            q: "What caused it?",
            k: [
              {
                id: "tfc-arrest-trauma",
                t: "Blast or penetrating injury (traumatic arrest)",
                d: "[[Do NOT attempt CPR]]: no pulse, no breathing, agonal gasping or no signs of life after blast or penetrating injury. Move on to canines you can save.",
                b: "[[Do NOT attempt CPR]] on a canine with blast or penetrating injuries that has no pulse, is not breathing, has agonal gasping or has no other signs of life. Care should go to canines with less severe injuries.",
              },
              {
                id: "tfc-arrest-other",
                t: "Non-traumatic cause (hypothermia, near drowning, electrocution)",
                d: "You may consider CPR: hypothermia, near drowning or electrocution.",
                b: "{{Consider CPR}} only for non-traumatic disorders such as hypothermia, near drowning or electrocution.",
              },
            ],
          },
          {
            id: "tfc-ams",
            t: "Altered mental state",
            d: "Handle carefully, aggression is likely even towards you. Muzzle unless the airway is blocked or breathing is a problem.",
            b: "Handle the canine carefully: {{increased aggression is likely and can be directed at its own handler}}.\n{{Use a muzzle}} if the airway is not obstructed and the canine does not have breathing problems.",
          },
          {
            id: "tfc-airway",
            t: "Airway problem or unconscious",
            d: "Treat the airway only after life-threatening bleeding is controlled.",
            b: "Do airway first aid {{once all life-threatening bleeding has been treated}}.",
            pick: "one",
            q: "What is the canine's state?",
            k: [
              {
                id: "tfc-air-conscious",
                t: "Conscious and breathing on its own",
                d: "[[No airway intervention.]] A barking or whining canine has a clear airway.",
                b: "[[Do NOT attempt any airway intervention]] if the canine is conscious and breathing adequately. {{Treat a barking or whining canine as having a clear airway.}}",
              },
              {
                id: "tfc-air-open",
                t: "Unconscious, no blockage",
                d: "Open the airway: head and neck neutral in line, mouth open, tongue pulled and extended over the bottom jaw, clear blood and vomit.",
                b: "Unconscious is most likely shock or head trauma. {{Maintain an open airway:}}\n- Extend the head and neck in a neutral, in-line position.\n- Open the mouth.\n- Pull and extend the tongue over the bottom jaw.\n- Clear secretions (blood, vomit, etc.) from the mouth.",
              },
              {
                id: "tfc-air-removable",
                t: "Unconscious, removable blockage",
                d: "Open the airway and clear the blockage without pushing it deeper. No blind finger sweeps. A smooth removable object: start chest compressions.",
                b: "Open the airway and try to clear the blockage {{without pushing it further down}}.\n- [[AVOID blind finger sweeps.]]\n- If the blockage is a {{smooth, removable object, start chest compressions}}.",
              },
              {
                id: "tfc-air-fixed",
                t: "Unconscious, fixed obstruction",
                d: "[[No Heimlich, no chest compressions.]] Evacuate immediately to definitive veterinary care.",
                b: "A fixed obstruction is structural tissue damage or embedded shrapnel you cannot remove. [[Never attempt a Heimlich maneuver or chest compressions.]]\n{{Evacuate immediately to definitive veterinary care.}}",
              },
            ],
          },
          {
            id: "tfc-breath",
            t: "Breathing problem or chest trauma",
            d: "Look for an open chest wound and for signs of a tension pneumothorax.",
            b: "Chest trauma can let air build up between the lungs and the chest wall (pneumothorax, PTX), so the canine cannot fill its lungs. Check for both an {{open PTX (sucking chest wound)}} and a {{tension PTX}}.",
            pick: "many",
            q: "What do you find?",
            k: [
              {
                id: "tfc-ptx-open",
                t: "Penetrating chest wound",
                d: "Treat as an open PTX: seal the wound during expiration (vented chest seal), sealed on all four sides if not vented. Check for an exit wound and watch for tension PTX.",
                b: "Always look for an {{entry and exit wound}}. Treat every open chest wound as an open PTX.\n- {{Cover the wound during expiration}} with an occlusive dressing, ideally a {{vented chest seal}} (the one in the canine first aid set is ideal).\n- No vented seal: use a non-vented occlusive dressing {{sealed on all four sides}}.\n- Then keep treating the PTX that remains and {{monitor for a tension PTX}}.",
              },
              {
                id: "tfc-ptx-tension",
                t: "Signs of tension PTX (severe, getting worse)",
                d: "Assume tension PTX: any progressive severe breathing distress after chest trauma. Keep any seal in place, monitor, and get the canine to a vet.",
                b: "{{Assume any progressive, severe respiratory distress after penetrating or blunt chest trauma is a tension PTX.}} Signs:\n- Rapid, shallow, open-mouth breathing\n- Agitated or cannot get comfortable\n- No drive, no response even to basic commands, unwilling to move\n- Head and neck extended, elbows and upper front legs held away from the body (tripod position)\n- Reluctant to lie down\n- Asynchronous breathing: chest and abdomen move in opposite directions\n- Barrel-chested, little chest movement, more abdominal movement\n- Blue (cyanotic) gums, a late finding\n- Collapse",
              },
            ],
          },
        ],
      },
      {
        id: "evac",
        t: "Evacuating the canine",
        tag: "TACEVAC",
        d: "Expect to keep caring for the canine yourself until the veterinary facility. Keep reassessing bleeding, airway and breathing.",
        b: "You may expect help from trained professionals, but in reality {{you should expect to keep primary care of your canine until you reach the veterinary facility}}, because there are no trained veterinarians in the field.\nKeep reassessing bleeding, airway and breathing as you move.",
      },
      {
        id: "non",
        t: "No tactical threat: emergency care",
        tag: "Non-tactical",
        d: "Immediate care by the handler saves lives. Delay raises illness and death.",
        b: "Common emergencies away from a tactical situation. {{Immediate care by the handler is essential}}; delayed treatment increases illness and death.",
        pick: "many",
        q: "What is wrong with the canine?",
        k: [
          {
            id: "non-heat",
            t: "Heat injury (hyperthermia)",
            d: "Move to a cool area, douse with cool (not cold) water, give water to drink, then transport to a vet.",
            b: "Heat injury comes from exertion, a hot and humid environment, or both. It ranges from mild (heat stress) to moderate (heat exhaustion) to severe (heatstroke).\n{{Move the canine to a cool area, douse it in cool (not cold) water and give it water to drink}}, then transport to a veterinary facility.",
          },
          {
            id: "non-paw",
            t: "Pad or paw injury",
            d: "Remove objects that are not deep and come out easily. Secure larger objects in place with bandages and go to a vet immediately.",
            b: "Unprotected pad and paw injuries get infected or worse and can end the canine's usefulness.\n- {{Remove objects that are not deeply embedded and come out easily.}}\n- {{Larger objects are secured in place with bandages}} and the canine goes to a veterinary facility immediately.",
          },
          {
            id: "non-allergy",
            t: "Allergic reaction to an insect bite or sting",
            d: "Give antihistamines, then get the canine to a vet for anything severe.",
            b: "Spider bites, bee stings and wasp stings can cause intense reactions. {{Antihistamines}} are often all that mild or moderate cases need, and they greatly improve the chance that a severe reaction survives the trip to a veterinary facility.",
          },
          {
            id: "non-gi",
            t: "Vomiting or diarrhea",
            d: "Usually self-limiting: withhold food and water for set periods.",
            b: "Most of the time this is mild and self-limiting. {{Withholding food and water for set periods}} lets the stomach and intestines recover.",
          },
          {
            id: "non-dehy",
            t: "Dehydration",
            d: "Treat without professional help; severe cases may need IV therapy at a vet.",
            b: "A major concern in active canines in austere environments and at high operational tempo. It can be treated without professional help, but {{severe cases may need IV therapy}}.",
          },
          {
            id: "non-bandage",
            t: "Head, neck or trunk injury",
            d: "Bandage the injury for protection, support and comfort.",
            b: "{{Bandages protect the injury and give support and comfort.}} Handlers need to be skilled at head, neck and trunk bandages.",
          },
        ],
      },
    ],
  };

  const RESOURCES = [
    ["K-9 Individual First Aid Kit (IFAK)", ["https://i.imgur.com/ywAIs5B.png"]],
    ["K-9 Vitals Card", ["https://i.imgur.com/0MHUEMy.png"]],
    ["K-9 Evaluation and Treatment", ["https://i.imgur.com/e3G2MDP.png", "https://i.imgur.com/iWbihbq.png", "https://i.imgur.com/G96S07U.png"]],
    ["K-9 Heat Injuries", ["https://i.imgur.com/6Hj7Tu9.png"]],
    ["K-9 High Altitude Sickness & Pulmonary Edema", ["https://i.imgur.com/ABfpsPP.png", "https://i.imgur.com/ypt79Kd.png"]],
    ["K-9 Trauma Management", ["https://i.imgur.com/dT7ncQ1.png", "https://i.imgur.com/D1NAqfF.png", "https://i.imgur.com/27ACPoE.png"]],
  ];

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const rich = (s) =>
    esc(s).replace(/\{\{/g, "<mark>").replace(/\}\}/g, "</mark>").replace(/\[\[/g, '<strong class="tc-no">').replace(/\]\]/g, "</strong>");
  function text(src) {
    const out = [];
    let list = null;
    src.split("\n").forEach((line) => {
      if (/^- /.test(line)) {
        if (!list) out.push((list = []));
        list.push(line.slice(2));
      } else {
        list = null;
        out.push(line);
      }
    });
    return out.map((p) => (Array.isArray(p) ? `<ul>${p.map((li) => `<li>${rich(li)}</li>`).join("")}</ul>` : `<p>${rich(p)}</p>`)).join("");
  }
  const ICONS = {
    cuf: '<path d="M12 3 2.5 20h19L12 3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
    tfc: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>',
    evac: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    non: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  };
  function opts(node, top) {
    const type = node.pick === "one" ? "radio" : "checkbox";
    return `<div class="tc-q">${esc(node.q)}</div><div class="tc-opts${top ? " tc-top" : ""}">${node.k
      .map(
        (n) => `<div class="tc-opt${top ? " tc-phase" : ""}"${top ? ` data-ph="${n.id}"` : ""}><label class="tc-chk"><input type="${type}" name="tecc-${node.id || "phase"}" data-do="${esc(n.d)}" data-t="${esc(n.t)}"><i class="tc-ind" aria-hidden="true"></i>${
          top && ICONS[n.id] ? `<svg class="tc-ico" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n.id]}</svg>` : ""
        }<span class="tc-lab">${esc(n.t)}${n.tag ? `<em>${esc(n.tag)}</em>` : ""}</span><svg class="tc-chev" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 6 3 3 3-3"/></svg></label><div class="tc-pane" hidden>${n.b ? `<div class="tc-body">${text(n.b)}</div>` : ""}${n.k ? opts(n, false) : ""}</div></div>`,
      )
      .join("")}</div>`;
  }

  const PHASES = [
    ["M", "Move to safe cover"],
    ["M", "Muzzle the canine for safety"],
    ["M", "Control massive bleeding"],
    ["A", "Ensure an open airway"],
    ["R", "Treat respiratory distress"],
    ["C", "Treat circulatory failure"],
    ["H", "Treat or prevent hypothermia"],
    ["H", "Manage head injury"],
  ];

  root.innerHTML = `
    <div class="card"><h2><small>CSD</small>Tactical Emergency Casualty Care</h2><div class="body">
      <p class="tc-intro">Pre-hospital care for an injured canine in a tactical, field environment. Besides the injuries you also have the tactical situation to deal with. Remember <b>M³ARCH²</b>, and <mark>control massive bleeding immediately, as it kills rapidly</mark>. Then open the airway, manage collapsed lungs, treat shock, manage or prevent hypothermia, and reduce complications from head trauma.</p>
      <ol class="tc-march">${PHASES.map(([l, t], i) => `<li><b>${l}</b><span>${esc(t)}</span></li>`).join("")}</ol>
      <div class="tc-rules">
        <div><strong class="tc-no">Never</strong> use commercial human tourniquets on a canine. Use the <mark>SWAT-T</mark> from your K-9 IFAK.</div>
        <div><strong class="tc-no">Never</strong> use human-dedicated supplies on a canine until <mark>all human injuries</mark> are addressed.</div>
        <div><strong class="tc-no">Never</strong> do CPR on a canine with blast or penetrating injuries and no signs of life.</div>
        <div><strong class="tc-no">Never</strong> attempt airway intervention on a conscious canine breathing on its own.</div>
      </div>
    </div></div>
    <div class="tc-layout">
      <div class="card"><h2><small>Guide</small>What are you dealing with?</h2><div class="body tc-tree">
        ${opts(TREE, true)}
        <div class="actions"><button class="b tc-reset" type="button" id="tecc-reset">Clear all</button></div>
      </div></div>
      <aside class="card tc-plan"><h2><small>Plan</small>Do this</h2><div class="body">
        <p class="tc-plan-empty">Tick the situation on the left and your steps appear here, in order.</p>
        <ol class="tc-plan-list" hidden></ol>
      </div></aside>
    </div>
    <div class="card"><h2><small>Resources</small>Charts and kit</h2><div class="body">
      <p class="tc-intro">Reference charts from the CSD post. Open one to see it.</p>
      ${RESOURCES.map(
        ([n, imgs]) => `<details class="tc-res"><summary>${esc(n)}</summary><div class="tc-imgs">${imgs.map((u) => `<a href="${u}" target="_blank" rel="noopener noreferrer"><img src="${u}" alt="${esc(n)}" loading="lazy" referrerpolicy="no-referrer"></a>`).join("")}</div></details>`,
      ).join("")}
    </div></div>`;

  const planList = root.querySelector(".tc-plan-list"),
    planEmpty = root.querySelector(".tc-plan-empty");
  function sync() {
    const steps = [];
    // document order puts a parent before its children, so a closed parent hides everything under it
    root.querySelectorAll(".tc-tree input").forEach((i) => {
      const opt = i.closest(".tc-opt");
      opt.querySelector(":scope > .tc-pane").hidden = !i.checked;
      opt.classList.toggle("on", i.checked);
      if (i.checked && !i.closest(".tc-pane[hidden]")) steps.push(i.dataset.do);
    });
    planList.innerHTML = steps.map((d) => `<li>${rich(d)}</li>`).join("");
    planList.hidden = !steps.length;
    planEmpty.hidden = !!steps.length;
  }
  root.querySelector(".tc-tree").addEventListener("change", sync);
  root.querySelector("#tecc-reset").addEventListener("click", () => {
    root.querySelectorAll(".tc-tree input").forEach((i) => (i.checked = false));
    sync();
  });
  sync();
})();
