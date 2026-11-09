# How to refresh the SED Squad Members roster snapshot

`data/sed-roster.csv` is a snapshot of the LSSD Special Operations Division roster. Squad Members loads it on every
visit (see `syncRoster()` in `js/sed-squad.js`). It is **not** live: it only changes when someone redoes these steps.

Source page: https://fp.booskit.dev/lssd/roster?roster=SOD

## Ground rules

- Read the page **the way a normal visitor does**, in the browser (Claude in Chrome). It shows as "Guest User, Read Only".
- **Do not** call `fp-api.booskit.dev` directly, with curl or anything else, and do not copy the API key that the page's own
  JavaScript carries. The API refuses requests without a key, and using that embedded key was blocked as getting around the
  site's access control. A real live feed needs a key or endpoint from the roster owner.
- Do not commit anything that is not on that public roster page.

## What is in scope

| Roster section                                              | Division in the CSV | Notes                                                 |
| ----------------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| First `OPERATIONS` table (above Emergency Services Detail)  | `SEB`               | Unit Commander, Operations Lieutenant, Ops Sergeant   |
| `EMERGENCY SERVICES DETAIL`                                 | `ESD`               |                                                       |
| `CANINE SERVICES DETAIL`                                    | `CSD`               | The CANINE (dog) column is ignored                    |
| `OPERATIONS` table just above `... RED TEAM`                | `SED`               | The SED Detail Commander                              |
| `SPECIAL ENFORCEMENT DETAIL RED TEAM` and `BLUE TEAM`       | `SED`               | Both teams go into one SED group                      |
| `Area Commander` row (in the page's top Headquarters/Fleet area; search the page for `AREA COMMANDER`) | `SEB`               | Listed first in SEB. Rank on the roster is `COMMANDER` |
| `TRAINING TEAM DETAIL` (below CSD)                          | `TT`                | Only the Detail Commander (`LIEUTENANT` row) and the Team Leader (the `SERGEANT` row). The specialty slots (negotiations, aerial, long rifle, protection, instructors) are left out. Their people can also be in SED, ESD or CSD: that is kept, one entry per division |

Left out on purpose: Division headquarters, the Training Team's specialty slots, Aero (Air 20/22 and 21/23), fleet, and empty slots
(rows whose name is `-`). Callsigns are not stored. If scope changes, edit the table above and the snippet below.

## Departmental rank

Only the name and divisional rank are taken from the roster. The departmental rank is set from the assignment
(`RANK_FOR` in `data/build-roster-csv.py` and in `js/sed-squad.js`, kept the same):

| Divisional rank                                                   | Rank                         |
| ----------------------------------------------------------------- | ---------------------------- |
| SEB Area Commander / Unit Commander                               | Commander / Captain          |
| Operations Lieutenant, any Detail Commander                       | Lieutenant                   |
| Operations Sergeant, any Team Leader                              | Sergeant                     |
| ESD Tactical Medic, Crew Chief                                    | Deputy Sheriff (Bonus II)    |
| ESD Probationary Tactical Medic                                   | Deputy Sheriff               |
| CSD Probationary Tactical Canine Handler                          | Deputy Sheriff               |
| CSD Tactical Canine Handler / Senior Tactical Canine Handler      | Bonus I / Bonus II           |
| SED Probationary Team Member / Team Member / Team Scout           | Deputy Sheriff / Bonus I / Bonus II |

In the Squad Members form, picking a divisional rank fills in the Rank the same way (it can still be changed).

## Steps

1. Open the roster page in the browser and wait about 5 seconds for it to load (it shows "Initializing faction..." first).
2. Run this in the page (javascript tool). It returns `DIV|NAME|POSITION` lines, one per person (the roster's own rank column is not used):

   ```js
   (() => { const L = c => c.innerText.split('\n').map(s => s.trim()).filter(Boolean);
   const titleOf = tb => { let el = tb; for (let k = 0; k < 6 && el; k++) { el = el.parentElement;
     const h = el && [...el.children].find(c => !c.contains(tb) && c.innerText && c.innerText.length < 90 && /[A-Z]{4}/.test(c.innerText));
     if (h) return h.innerText.trim().split('\n')[0]; } return ''; };
   const tabs = [...document.querySelectorAll('table')].map(tb => ({ tb, title: titleOf(tb) }));
   const MAP = { 'EMERGENCY SERVICES DETAIL': 'ESD', 'CANINE SERVICES DETAIL': 'CSD',
     'SPECIAL ENFORCEMENT DETAIL RED TEAM': 'SED', 'SPECIAL ENFORCEMENT DETAIL BLUE TEAM': 'SED' };
   // Training Team Detail is read separately: DETAIL COMMANDER row and the SERGEANT row only, as TT|NAME|DETAIL COMMANDER / TT|NAME|TEAM LEADER
   const out = []; let seenOps = 0;
   tabs.forEach((t, i) => { let div = MAP[t.title];
     if (!div && t.title === 'OPERATIONS') { const nxt = (tabs[i + 1] || {}).title;
       if (seenOps++ === 0) div = 'SEB'; else if (nxt === 'SPECIAL ENFORCEMENT DETAIL RED TEAM') div = 'SED'; }
     if (!div) return;
     [...t.tb.querySelectorAll('tr')].forEach(tr => { const c = [...tr.children];
       if (c.length < 4 || !/^\d+$/.test(c[0].innerText.trim())) return;
       const nm = L(c[2])[0] || ''; if (nm === '-' || !nm) return;
       out.push([div, nm, L(c[3])[0]].join('|')); }); });
   return out.length + ' rows\n' + out.join('\n'); })()
   ```

   Tool output gets cut off after a few thousand characters. If it ends with `[TRUNCATED]`, run it again per division
   (filter `out` by `div`) and join the pieces. The first line (`N rows`) is a sanity check: compare it with the count of
   people you end up with.
3. Save the lines (without the `N rows` line, or with it, the script skips it) to a scratch file, for example
   `roster.txt` outside the repo.
4. Run `python data/build-roster-csv.py roster.txt`. It maps the roster's wording to the site's names, sorts the groups
   SEB, SED, ESD, CSD (roster order kept inside each group) and rewrites `data/sed-roster.csv`.
   - If it says "Unknown division or position", add the new wording to `POS` and `RANK_FOR` in the script (and to `RANK_FOR` in `js/sed-squad.js`). If the site
     also needs a new divisional rank, add it to `DIV` in `js/sed-squad.js` too.
5. Compare with the old file (`git diff data/sed-roster.csv`) and tell the user who was added, removed or changed.
6. Check it works: serve the site locally (`python -m http.server`), open `#sed-squad`, and confirm the counts per group.
   Nothing reaches anyone's list by itself: Squad Members shows a notice and a dot when the roster changed, and the
   Sync roster button brings it in (people on the roster replace same-name entries, everyone else is kept). Revert last
   sync restores the list as it was. Bump the `?v=` on the script and style links in `index.html` with each release so
   browsers do not serve cached files.
7. Add a release note (a new card at the top of `#f-updates` in `index.html`, newest first), commit as the new version
   number and push, only when the user asks. Optionally copy the CSV to the user's Downloads folder so they can use
   Import CSV by hand.

## CSV format

```
"Name","Rank","Divisional Rank"
"Victor Heidrich","Captain","SEB: Unit Commander"
```

`Rank` must be one of the site's departmental ranks. `Divisional Rank` is `DIV: Position`, where DIV is SEB, SED, ESD or
CSD and the position is one of the names in `DIV` at the top of `js/sed-squad.js`. The same format is what Import and
Export CSV use on the Squad Members page.
