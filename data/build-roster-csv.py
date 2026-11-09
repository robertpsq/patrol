"""Turns the pipe-separated roster text (see data/ROSTER-SNAPSHOT.md) into data/sed-roster.csv.

Usage:  python data/build-roster-csv.py roster.txt
Each input line looks like:  DIV|RANK|NAME|POSITION   (DIV is SEB, SED, ESD or CSD)
"""
import csv
import sys
from pathlib import Path

RANK = {
    "COMMANDER": "Commander",
    "CAPTAIN": "Captain",
    "LIEUTENANT": "Lieutenant",
    "SERGEANT": "Sergeant",
    "DEPUTY SHERIFF": "Deputy Sheriff",
}
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
ORDER = ["SEB", "SED", "ESD", "CSD"]  # the order the groups are listed on the site


def main(src):
    rows, problems = [], []
    for n, line in enumerate(Path(src).read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#") or line.endswith(" rows"):
            continue
        div, rank, name, pos = [p.strip() for p in line.split("|")]
        pos = pos.split(" (")[0].strip()  # drop the (EM)/(PM) shift tag
        if div not in ORDER or rank not in RANK or pos not in POS:
            problems.append(f"line {n}: {line}")
            continue
        rows.append((ORDER.index(div), [name.title(), RANK[rank], f"{div}: {POS[pos]}"]))
    if problems:
        sys.exit("Unknown division, rank or position (add it to the tables above):\n  " + "\n  ".join(problems))
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
