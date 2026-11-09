"""Turns the pipe-separated roster text (see data/ROSTER-SNAPSHOT.md) into data/sed-roster.csv.

Usage:  python data/build-roster-csv.py roster.txt
Each input line looks like:  DIV|NAME|POSITION   (DIV is SEB, SED, ESD or CSD)
The departmental rank is not read from the roster: it is set from the position (RANK_FOR below).
"""
import csv
import sys
from pathlib import Path

# Roster wording -> the divisional rank names used by the site (js/sed-squad.js, DIV).
POS = {
    "AREA COMMANDER": "Area Commander",
    "UNIT COMMANDER": "Unit Commander",
    "OPERATIONS LIEUTENANT": "Operations Lieutenant",
    "OPERATIONS SERGEANT": "Operations Sergeant",
    "DETAIL COMMANDER": "Detail Commander",
    "TEAM LEADER": "Team Leader",
    "CREW CHIEF": "Crew Chief",
    "TACTICAL MEDIC": "Tactical Medic",
    "P/TACTICAL MEDIC": "Probationary Tactical Medic",
    "TAC. CANINE HANDLER": "Tactical Canine Handler",
    "SNR. TAC. CANINE HANDLER": "Senior Tactical Canine Handler",
    "P/TAC. CANINE HANDLER": "Probationary Tactical Canine Handler",
    "TEAM MEMBER": "Team Member",
    "P/TEAM MEMBER": "Probationary Team Member",
    "TEAM SCOUT": "Team Scout",
}
DS, B1, B2 = "Deputy Sheriff", "Deputy Sheriff (Bonus I)", "Deputy Sheriff (Bonus II)"
# Departmental rank for each assignment. Keep in step with RANK_FOR in js/sed-squad.js.
RANK_FOR = {
    "SEB": {"Area Commander": "Commander", "Unit Commander": "Captain", "Operations Lieutenant": "Lieutenant", "Operations Sergeant": "Sergeant"},
    "SED": {"Probationary Team Member": DS, "Team Member": B1, "Team Scout": B2, "Team Leader": "Sergeant", "Detail Commander": "Lieutenant"},
    "ESD": {"Probationary Tactical Medic": DS, "Tactical Medic": B2, "Crew Chief": B2, "Team Leader": "Sergeant", "Detail Commander": "Lieutenant"},
    "CSD": {"Probationary Tactical Canine Handler": DS, "Tactical Canine Handler": B1, "Senior Tactical Canine Handler": B2, "Team Leader": "Sergeant", "Detail Commander": "Lieutenant"},
    "TT": {"Team Leader": "Sergeant", "Detail Commander": "Lieutenant"},
}
ORDER = ["SEB", "SED", "ESD", "CSD", "TT"]  # the order the groups are listed on the site


def main(src):
    rows, problems = [], []
    for n, line in enumerate(Path(src).read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#") or line.endswith(" rows"):
            continue
        div, name, pos = [p.strip() for p in line.split("|")]
        pos = pos.split(" (")[0].strip()  # drop the (EM)/(PM) shift tag
        if div not in ORDER or pos not in POS or POS[pos] not in RANK_FOR[div]:
            problems.append(f"line {n}: {line}")
            continue
        rows.append((ORDER.index(div), [name.title(), RANK_FOR[div][POS[pos]], f"{div}: {POS[pos]}"]))
    if problems:
        sys.exit("Unknown division or position (add it to the tables above):\n  " + "\n  ".join(problems))
    rows.sort(key=lambda r: r[0])  # stable: keeps the roster's own order inside each group
    out = Path(__file__).with_name("sed-roster.csv")
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL, lineterminator="\r\n")
        w.writerow(["Name", "Rank", "Divisional Rank"])
        w.writerows(r for _, r in rows)
    print(f"{len(rows)} people written to {out}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
