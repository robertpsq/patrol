/* Canine Caselaws: a read-only reference page under the K9 group of Davis Station, Senora Station and CSD.
   Source: "Canine Services Detail: Case Law Education" (LSSD forum). In every text, {{double braces}} mark the
   key holding and are shown highlighted. A line starting with "- " is shown as a bullet. */
(() => {
  const SECTIONS = [
    {
      id: "bite",
      title: "Bite Related",
      note: "Using a dog to apprehend: warnings, force and how long a bite may last.",
      cases: [
        { n: "Robinette v. Barnes", u: "https://www.casemine.com/judgement/us/59148b6badd7b04934521ead",
          t: `The use of a properly trained police dog to apprehend a felony suspect {{does not carry with it a "substantial risk of causing death or serious bodily harm"}}.` },
        { n: "Matthews v. Jones", u: "https://www.casemine.com/judgement/us/591484edadd7b049344be902",
          t: `The court found that there was no excessive force where the record was clear that {{the officer warned the plaintiff, a fleeing misdemeanant, several times before releasing the police dog to apprehend him}}.` },
        { n: "Vathekan v. Prince George's County", u: "https://www.casemine.com/judgement/us/5914bb88add7b049347974b5",
          t: `The Fourth Circuit reversed a summary judgment ruling in favor of a police officer who {{deployed a police dog without a verbal warning}}. The deployment of said Canine happened during a burglary investigation where the homeowner confirmed that no one legally was in the house, and Canine Castro entered the house and bit the suspect inside that was asleep with the television on, unknowingly to the Officer and Homeowner.` },
        { n: "Vera Cruz v. City of Escondido", u: "https://www.casemine.com/judgement/us/591480ecadd7b0493447b8c8",
          t: `The use of a trained police dog in biting a suspect to assist in arrest {{is not deadly force as applied under Tennessee v Garner}}. The use of the dog is not limited to circumstances where the suspect has to be an imminent life threat to others.` },
        { n: "Kuhla v. City of Minnetonka", u: "https://www.casemine.com/judgement/us/5914b800add7b049347829ea",
          t: `The court held that releasing the dog without warning the man was objectively unreasonable. Warning him would not have put the officers at an increased risk. The court indicated that {{giving the warning is a constitutional requirement}} and only under unusual circumstances the officer can forego the warning.` },
        { n: "Miller v. Clark County", u: "https://www.casemine.com/judgement/us/591478e4add7b049343ee4d4",
          t: `The Ninth Circuit Court of Appeal held that {{the use of a police dog to bite and hold a potentially dangerous fleeing felon for up to a minute, until the situation is ensured to be safe, does not violate the Fourth Amendment}}. In this case, the suspect was hiding in a wooded area. The officer announced that the dog would be released if he did not reveal himself. The dog was released, found the suspect, and bit and held him. It took the officer approx. one minute to get to the suspect and call the dog off.` },
        { n: "US v. Mohr", u: "https://www.casemine.com/judgement/us/5914b841add7b049347840b2",
          t: `Stephanie Mohr, a Prince George's County, Maryland police officer, assisted in the capture of possible burglars. Her assistance was requested by Sgt. Bonn of the Takoma Park, Maryland Police Department. The burglars were caught on the roof of a business. They were contacted and ordered to climb down. They were surrounded by several officers. The suspects fully cooperated with the police and had their hands in the air. Officer Anthony Delozier was with Officer Mohr. He asked Sergeant Bonn, "Sarge, can the dog get a bite?". He said "yes". Officer Mohr then {{released the dog to bite one of the suspects while he was standing with his hands in the air}}. The suspects made no movement to justify the attack. Officer Mohr was tried and convicted in federal court for acting under the color of law to willfully deprive suspect Mendez of his right to be free from the use of unreasonable force. {{Officer Mohr was sentenced to 10 years in prison.}}` },
        { n: "Montanez v. Parker", u: "https://www.casemine.com/judgement/us/5914ac1fadd7b0493473b39b",
          t: `Montanez was riding his bicycle at night without lights in Orlando. Ofc. Parker, a K-9 officer, was with another officer. They were in uniform. As Montanez approached, Parker ordered him to stop. Montanez did not comply and tried to ride around the officers. Parker grabbed Montanez and pulled him off the bicycle. Parker was holding his dog by the harness at the time. Parker fell on top of Montanez. The dog perceived that Parker was being attacked and bit Montanez. Montanez was arrested. He later sued for false arrest, unreasonable seizure, and excessive force under the Fourth Amendment, as well as deprivation of liberty without due process under the Fifth Amendment. The court held that the stop and arrest were lawful. The use of force to remove Montanez from the bicycle was reasonable. Finally, {{the dog bite was not due to an intentional act by Parker so the excessive force claim was denied}}.` },
        { n: "Escobar v. Montee", u: "https://www.casemine.com/judgement/us/5c01b11c342cca0e508c77fa",
          t: `Escobar assaulted his wife. He later fled into his neighborhood to avoid police at his house. The police were told that Escobar was armed with a knife. His mother told the police that they would have to kill Escobar because he will not go down without a fight. A K-9 was used to track Escobar down. He was located. The K-9 officer decided not to give Escobar a warning before throwing the K-9 over the fence. The K-9 officer followed the K-9 over the fence. Escobar had a knife. The K-9 bit him. Escobar dropped the knife in surrender, but the knife was within a couple of feet of him. The K-9 continued to bite Escobar for about a minute before the officers fully subdued and handcuffed him. Escobar sued under a 1983 action claiming his rights were violated. He was not given a warning before the K-9 bit him and the K-9 officer allowed the K-9 to continue biting after Escobar surrendered and was not resisting. The lower court dismissed the initial bite claim but denied the K-9 officer qualified immunity for the continued bite. The case was appealed to the 5th Circuit Court. The Court held that with the information provided to the officer, {{it was reasonable to believe that Escobar's surrender was not genuine}}. The officer's actions were proper and he was entitled to qualified immunity.` },
        { n: "Zuress v. Newark", u: "https://www.casemine.com/judgement/us/5d92f46c342cca5116ca613c",
          t: `Zuress was actively resisting arrest and was bitten by a police dog. The dog continued to bite for 24 seconds after she was subdued. She sued to claim excessive use of force. The Court held that the deployment of the dog was justified and that the continued bite for 24 seconds was not excessive use of force. The fact of the case was that for 24 seconds the officer was trying to get the dog to release the bite. While the officer was working to get the dog to release his bite, {{the continued bite was not a "means intentionally applied."}} Therefore, the continued bite was not a Fourth Amendment violation.` },
      ],
    },
    {
      id: "essential",
      title: "Essential Search Caselaw",
      note: "When a sniff is, or is not, a search, and what a dog's alert is worth.",
      cases: [
        { n: "US v. Race", u: "https://www.casemine.com/judgement/us/5914c633add7b049347d97a8",
          t: `The indication of drugs after a sniff from a well-trained drug detection police dog is {{sufficient to establish probable cause}}.` },
        { n: "US v. Place", u: "https://supreme.justia.com/cases/federal/us/462/696/",
          t: `The court determined that the sniffing of personal items of a person in a public place by a dog for the purpose of finding contraband {{was not a "search" under the 4th Amendment}}.` },
        { n: "US v. Thomas", u: "https://supreme.justia.com/cases/federal/us/462/696/",
          t: `The use of canine to detect odors emanating from an apartment while at a lawful place outside the apartment {{is still a search requiring probable cause and a warrant}}. The court emphasized that a person has a higher expectation of privacy in his dwelling than in objects transported through public places.` },
        { n: "State v. Boyce", u: "https://www.casemine.com/judgement/us/59148d4eadd7b049345410d2",
          t: `The use of a canine to sniff a person or the objects carried by that person is "...offensive at best and harrowing at worst to the innocent sniffee," and {{requires reasonable suspicion}}.` },
        { n: "Merrett v. Moore", u: "https://www.casemine.com/judgement/us/591483eaadd7b049344af1f9",
          t: `Canines can be used to sniff vehicles at a license and registration check roadblock {{as long as their use does not unreasonably delay the motorist}}.` },
        { n: "US v. Guzman", u: "",
          t: `{{If a dog shows only interest but does not alert, this does not constitute probable cause.}} The handler's awareness in the interest can be used in conjunction with the totality of other facts to establish probable cause.` },
        { n: "US v. Kennedy", u: "https://www.casemine.com/judgement/us/5914bd07add7b0493479fe42",
          t: `{{A warrant is not rendered invalid because the dog handler did not keep accurate training records or train the dog on a regular basis.}} The dog was certified in detection drugs and had a reliability rate of 70-80%. This was sufficient to establish probable cause.` },
        { n: "US v. Anchondo", u: "https://www.casemine.com/judgement/us/59148067add7b04934472865",
          t: `A search incident to arrest can occur before the actual arrest takes place. The search and the arrest must be contemporaneous to each other. The court further stated that {{an officer can search a person if a canine alerts on the vehicle the person occupied, but no drugs were found in the vehicle}}. If the probability of drugs diminishes in the vehicle, then it increases for drugs being on the person.` },
        { n: "City of Indianapolis v. Edmond", u: "https://www.casemine.com/judgement/us/5914ba05add7b0493478e7e4",
          t: `It is {{unconstitutional to set up a checkpoint to detect evidence of ordinary criminal wrongdoing}}. In this case, the officers were looking for drugs. The officers used canines to sniff vehicles stopped at the roadblock.` },
        { n: "Illinois v. Caballes", u: "https://www.casemine.com/judgement/us/5914b69dadd7b0493477a04c",
          t: `{{A drug dog can be used to sniff a vehicle for contraband on any traffic stop}}, if:
- The vehicle is lawfully stopped
- The sniff occurs within the duration of time necessary to reasonably conduct the stop. (If the K9 officer makes the stop and also conducts the sniff, the extra time will probably violate this requirement.)
- {{The officer is not required to have any facts of a drug violation prior to the sniff occurring.}}` },
      ],
    },
    {
      id: "search",
      title: "Search Related",
      note: "Dog reliability, how long a stop may be held for a dog, and where a dog may sniff.",
      cases: [
        { n: "United States v. Lovell", u: "https://www.casemine.com/judgement/us/59148b87add7b049345235e9",
          t: `Lovell's luggage was entrusted to a third-party common carrier. The luggage was momentarily removed from the conveyer belt to be sniffed by a drug dog. The court ruled that the removal of the bags from the conveyer belt was "insufficient to constitute a meaningful interference" with Lovell's possessory interest in his bags. The court also stated that Lovell's expectation of privacy did not extend to the airspace surrounding his luggage. {{The sniffing of the air by a drug dog was not a search.}}` },
        { n: "United States v. Owens", u: "https://www.casemine.com/judgement/us/5914bb3fadd7b04934795916",
          t: `Even if a dog failed to pass two previous certifications, it was certified at the time of the sniff and the handler and training supervisor testified to its reliability. {{The dog was sufficiently reliable to support a finding of probable cause.}}` },
        { n: "US v. Outlaw", u: "https://www.casemine.com/judgement/us/5914b848add7b04934784234",
          t: `It is undisputed that this drug-detecting team successfully completed all standard training procedures for border patrol drug-detecting teams and that this canine was certified to detect a variety of narcotics, including marijuana and its derivatives, cocaine and its derivatives, heroin and its derivatives, and methamphetamine. That the suitcase the canine alerted to later turned out to contain PCP, a drug the dog was not trained to detect, {{simply does not destroy the agent's reasonable suspicion under these facts}}.` },
        { n: "United States v. Ramirez", u: "https://www.casemine.com/judgement/us/591478ccadd7b049343ec904",
          t: `An investigation into the contents of a package {{does not have to cease just because a K-9 failed to alert on it}}.` },
        { n: "US v. Jackson", u: "https://www.casemine.com/judgement/us/5914763eadd7b049343bec5e",
          t: `Narcotics officers boarded a bus after it stopped at the terminal. The officers obtained consent to search from the driver. They then informed the passengers that a police dog will be searching the bus. The dog hit on a seat indicating that a passenger was carrying the drugs. They saw Jackson as he exited the bus. He acted very suspiciously. They located Jackson after the dog sniffed the bus for drugs and they started a consensual encounter with him. They developed reasonable suspicion and pat searched Jackson. They found a belt around his waist full of cocaine. The court held: "As we have said, as its inception, Dunn's encounter with Jackson was justified because it was consensual. Indeed, even absent Jackson's consent, the fact that Dunn was aware of the dog alert and that one of the passengers was likely carrying drugs on his person, coupled with Jackson's nervous and erratic behavior (including what Dunn regarded as his unusually erect posture), {{would be sufficient to premise a reasonable suspicion and thus a search of his person}}.` },
        { n: "United States v. Sanchez", u: "https://www.casemine.com/judgement/us/5914742eadd7b0493439c1f7",
          t: `The police were {{justified in delaying a traffic stop for 45 minutes to run computer checks}} after it was suspected the passenger gave a fake ID. The officers acted diligently to minimize the detention period by employing the least intrusive means of detention and investigation. A drug dog was alerted to the trunk and a large quantity of marijuana was found.` },
        { n: "US v. Mendoza", u: "https://www.casemine.com/judgement/us/5914b4afadd7b0493476de19",
          t: `Trooper Bowles observed two vehicles traveling on a Utah highway. He observed that one of the vehicles had a Minnesota tag and the other one an Arizona tag. Both vehicles appeared to be traveling together. Suspecting that the vehicles might be involved in auto theft or drug trafficking the trooper turned around and followed the vehicles. The trooper stopped Mendoza on traffic after he failed to stop for a stop sign. The trooper smelled air freshener coming from the vehicle. Mendoza also gave inconsistent stories about where he was traveling to and the route he was taking, who owned the vehicle, and when it was actually purchased. The trooper observed that Mendoza was very nervous. The trooper believed he had reasonable suspicion to detain Mendoza. The trooper called for a drug dog to come to the scene to check the vehicle for drugs. The drug dog arrived approx. 40 min later and searched the vehicle. The dog alerted on the gas tank. The gas tank was packed with Meth. The court ruled that Trooper Bowles had reasonable suspicion to detain Mendoza. The court also ruled that {{waiting 40 minutes for the drug dog to arrive was reasonable}}.` },
        { n: "US v. Suitt", u: "https://www.casemine.com/judgement/us/591466ebadd7b049342a84ea",
          t: `The officer issued Suitt a warning on a traffic stop and released him. He then continued to ask Suitt questions about his travel. The questions were evasive and incomplete. He was acting nervous. The officer had its canine sniff the exterior of Suitt's vehicle and found 32 bales of marijuana. The sniff occurred 3 minutes after the end of the traffic stop. The questions were not drug interdiction related, but traffic-related. The officer had reasonable suspicion. {{The extension was minimal and did not violate the 4th Amendment.}}` },
        { n: "US v. Ludwig", u: "https://www.casemine.com/judgement/us/5914f22dadd7b0493497e202",
          t: `The certification of a police canine is sufficient to establish reliability for a canine to sniff for drugs. Ludwig argued that the canine had 58% reliability in finding drugs. The Court would not quantify probable cause. {{The dog's credentials provide a bright-line rule for the officer to rely on.}}` },
        { n: "US v. Kitchell", u: "https://casetext.com/case/united-states-v-kitchell",
          t: `Potential currency contamination {{does not undermine the significance of a positive dog alert}} in indicating a fair probability of the presence of contraband, and thus probable cause to search.` },
        { n: "US v. Sharp", u: "https://www.casemine.com/judgement/us/5914fb9badd7b049349ae7d7",
          t: `{{A canine sniff of the exterior of a vehicle is not a search under the Fourth Amendment, but if the canine enters the vehicle to sniff, it is a search.}} In this case, the canine was sniffing the exterior of the vehicle. Without prompting from the handler, the canine jumped into the vehicle through an open window. It alerted on a shaving kit where meth and marijuana were found. Sharp tried to get the evidence suppressed because the canine entered and searched his vehicle unlawfully. Held: "The canine's jump and subsequent sniff inside the vehicle was not a search in violation of the Fourth Amendment because {{the jump was instinctive and not the product of police encouragement}}".` },
        { n: "Florida v. Harris", u: "https://www.casemine.com/judgement/us/5c3c7aba342cca549e0a54a3",
          t: `Officer Wheetley had his drug detection dog sniff Harris's truck. The dog alerted Officer Wheetley and ingredients for making meth were found. Harris was arrested. Harris appealed. The Florida State Supreme Court held that "The State must in every case present an exhaustive set of records, including a log of the dog's performance in the field, to establish the dog's reliability." The State "must have comprehensive documentation of the dog's prior hits and misses in the field, and holding that absent field records will preclude a finding of probable cause no matter how much other proof the State offers." The US Supreme Court reversed the Florida Court. It held that:
- The Florida Court erred in requiring the use of the dog's field performance records. These records are unreliable because the records will not show failures to alert when drugs are present and show alerts as false alerts when drugs are not found, but were recently in the area sniffed.
- {{The training and certification setting is the more reliable way to determine the dog's reliability.}}
- The standard for determining a probable cause is to use a practical and common-sense standard of considering the totality of the circumstances, not the use of rigid rules, bright-line tests, and mechanistic inquiries.` },
        { n: "Florida v. Jardines", u: "https://www.casemine.com/judgement/us/5914f119add7b049349794bd",
          t: `The Court held that taking a K-9 onto the porch of the defendant's home to sniff for drugs inside {{is a search and requires consent or a search warrant}}. The officer entered into the curtilage for evidence gathering purposes in violation of the defendant's Constitutionally protected 4th Amendment rights. See US v. Thomas.` },
        { n: "US v. Salgado", u: "https://casetext.com/case/united-states-v-salgado-22",
          t: `A Trooper stopped to assist Salgado whose vehicle was broken down on the side of the road. The Trooper developed reasonable suspicion to detain Salgado and call for a drug dog. The Trooper tried to find a close K-9, but could not. He called out another Trooper with a K-9, but he was 45 miles away. It took an hour for him to arrive. {{The court said the wait was reasonable under the circumstances.}}` },
        { n: "Rodriguez v. the US", u: "https://www.law.cornell.edu/supremecourt/text/13-9972",
          t: `The Court ruled that a traffic stop, absent reasonable suspicion or consent, {{cannot be extended even for a few minutes after the conclusion of a traffic stop in order to conduct a K-9 sniff of the vehicle}}. In this case, the driver was stopped and issued a warning. He was then asked for permission to remain so the officer can conduct a K-9 sniff. The driver refused. The officer detained the driver anyway until another officer arrived. The officer conducted the K-9 sniff approx. 8 minutes after the stop was concluded. Drugs were found in the vehicle after the K-9 alerted. The driver was arrested. The Court held that the detention beyond the length of the traffic stop was an unreasonable seizure in violation of the Constitution.` },
        { n: "US v. Pina", u: "https://www.casemine.com/judgement/us/5914efcdadd7b0493496eb8c",
          t: `A trooper contacted a passenger bus driver at a truck stop and asked permission to do a drug dog sniff of his bus. He got permission and his dog alerted the trooper to drugs being on board. He removed the baggage and ran the dog around it. The dog alerted on Pina's baggage. The trooper searched it and found two large sealed metal cans of peppers. He opened one and found cocaine in it. Pina was arrested. The court held that the search of the bus and all the baggage {{falls under the automobile search warrant exception}}. The search of Pina's baggage and opening the can without a warrant was lawful.` },
        { n: "US v. Whitaker", u: "https://caselaw.findlaw.com/us-7th-circuit/1731606.html",
          t: `The officer went to an apartment complex where the apartments share a locked common hallway. The officer obtained consent to search the hallway with a drug dog. The dog alerted on Whitaker's apartment door. The officer obtained a search warrant and found drugs and a gun in the apartment. Whitaker was arrested. The court held: The use of a dog was the same as using a super-sensitive instrument described in Kyllo v US. The use of the dog was a search of not just the hall but Whitaker's apartment. The Supreme Court held in Florida v. Jardines that an officer could not enter the curtilage of a home to perform a dog sniff of the front door. The apartment hallway is not curtilage, but {{a person still has an expectation of privacy from the warrantless dog sniffs at his apartment door}}. The sniff was an unreasonable search in violation of the Fourth Amendment.` },
        { n: "US v. Berry", u: "https://www.casemine.com/judgement/us/5914ac41add7b0493473c2bc",
          t: `The DEA investigated Berry for heroin trafficking. Berry drove to Houston, picked up a load of heroin, and was driving back to New Orleans. The DEA briefed the Louisiana State Police troopers on Berry. The troopers set up and waited for him. He was stopped by Trooper St. Romain, who also had a drug dog. The trooper completed the stop and asked for consent to search Berry's vehicle, but was refused. Trooper St. Romain used his dog to sniff Berry's vehicle. The dog alerted on several locations on the vehicle and the vehicle was searched. The truck bed was searched for about 45 minutes. No drugs were found. The dog was deployed to sniff the interior of the vehicle. The dog alerted on a speaker box. 2.5 pounds of heroin was found inside. Berry tried to get the evidence suppressed. He claimed that the stop was impermissibly extended to conduct the sniff. He also claimed that the 45-minute fruitless search of the truck bed caused the probable cause for the search to dissipate. The court held that Berry gave information to the Trooper that was inconsistent with the information given during the DEA briefing. Berry was nervous, his hands were shaking, and would not make eye contact. There was sufficient information to establish reasonable suspicion to extend the traffic stop. The court further held that {{probable cause does not dissipate with time}}. The redeployment of the dog was also permissible.` },
      ],
    },
    {
      id: "misc",
      title: "Unrelated or Miscellaneous",
      note: "Everything else.",
      cases: [
        { n: "Brown v. Battle Creek Police Department", u: "https://www.casemine.com/judgement/us/5914f845add7b0493499ac15",
          t: `The court held: A police officer's use of deadly force against a dog while executing a warrant to search a home for illegal drug activity {{is reasonable under the Fourth Amendment when, given the totality of the circumstances and viewed from the perspective of an objectively reasonable officer, the dog poses an imminent threat to the officer's safety}}.` },
      ],
    },
  ];

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const rich = (s) => esc(s).replace(/\{\{/g, "<mark>").replace(/\}\}/g, "</mark>");
  const plain = (s) => s.replace(/\{\{|\}\}/g, "");
  function body(text) {
    const out = [];
    let list = null;
    text.split("\n").forEach((line) => {
      if (/^- /.test(line)) {
        if (!list) out.push((list = []));
        list.push(line.slice(2));
      } else {
        list = null;
        out.push(line);
      }
    });
    return out
      .map((p) => (Array.isArray(p) ? `<ul>${p.map((li) => `<li>${rich(li)}</li>`).join("")}</ul>` : `<p>${rich(p)}</p>`))
      .join("");
  }
  const total = SECTIONS.reduce((n, s) => n + s.cases.length, 0);
  const arrow = `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3H3.75A.75.75 0 0 0 3 3.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 2.75h4.25V7M13 3 7.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function render(root) {
    const chips = [["all", "All", total]].concat(SECTIONS.map((s) => [s.id, s.title, s.cases.length]));
    root.innerHTML = `<div class="card"><h2><small>K9</small>Caselaws</h2><div class="body">
      <p class="cl-intro">Canine Services Detail case law education. The key holding of each case is highlighted.</p>
      <div class="cl-tools">
        <input type="search" class="cl-search" placeholder="Search ${total} caselaws (name or text)" aria-label="Search caselaws" autocomplete="off" />
        <div class="cl-chips" role="group" aria-label="Category">${chips
          .map(([id, label, n], i) => `<button type="button" class="cl-chip${i ? "" : " on"}" data-cat="${id}">${esc(label)}<em>${n}</em></button>`)
          .join("")}</div>
      </div>
      ${SECTIONS.map(
        (s) => `<section class="cl-sec" data-cat="${s.id}"><div class="cl-sec-h"><h3>${esc(s.title)}</h3><span>${esc(s.note)}</span></div><div class="cl-grid">${s.cases
          .map(
            (c) => `<article class="cl-case" data-q="${esc((c.n + " " + plain(c.t)).toLowerCase())}"><h4>${esc(c.n)}</h4><div class="cl-text">${body(c.t)}</div>${
              c.u ? `<a class="cl-docket" href="${esc(c.u)}" target="_blank" rel="noopener noreferrer">Case docket${arrow}</a>` : ""
            }</article>`,
          )
          .join("")}</div></section>`,
      ).join("")}
      <p class="cl-empty" hidden>No caselaws match your search.</p>
    </div></div>`;
    let cat = "all";
    const search = root.querySelector(".cl-search");
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      root.querySelectorAll(".cl-sec").forEach((sec) => {
        let n = 0;
        sec.querySelectorAll(".cl-case").forEach((c) => {
          const ok = (cat === "all" || sec.dataset.cat === cat) && (!q || c.dataset.q.includes(q));
          c.hidden = !ok;
          if (ok) n++;
        });
        sec.hidden = !n;
        shown += n;
      });
      root.querySelector(".cl-empty").hidden = shown > 0;
    };
    search.addEventListener("input", apply);
    root.querySelector(".cl-chips").addEventListener("click", (e) => {
      const b = e.target.closest(".cl-chip");
      if (!b) return;
      cat = b.dataset.cat;
      root.querySelectorAll(".cl-chip").forEach((x) => x.classList.toggle("on", x === b));
      apply();
    });
  }
  ["davis", "senora", "csd"].forEach((u) => {
    const root = document.getElementById("f-" + u + "-k9-caselaws");
    if (root) render(root);
  });
})();
