// Snapshot test for the PEU letters / admin file.
// Run:  node tests/peu-snapshot.js
// It pulls the pure builder block out of index.html (between PEU-PURE-BEGIN / PEU-PURE-END),
// builds every letter from sample data and compares it with the forum templates below.
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8").replace(/\r\n/g, "\n");
const a = html.indexOf("// PEU-PURE-BEGIN"), b = html.indexOf("// PEU-PURE-END");
if (a < 0 || b < 0) throw new Error("PEU-PURE markers not found in index.html");
const P = new Function(html.slice(a, b) + "\nreturn { buildLetter, buildAdmin, buildTitle, LETTERS, TAGS };")();

const SKELETON = `[center][b][size=150]OFFICE OF THE SHERIFF[/size][/b][/center]

[center][aligntable=left,200,0,0,0,0,transparent]
[indent][b]{SHERIFF_NAME_UPPERCASE}[/b]
LOS SANTOS COUNTY SHERIFF[/indent][/aligntable]
[aligntable=right,200,0,0,0,0,transparent]
[b][indent]HALL OF JUSTICE[/b]
301 INNOCENCE BOULEVARD[indent][/aligntable]
[img]{BANNER_IMG}[/img][hr][/hr][/center]

[indent]{DATE}

Dear {SALUTATION} {LASTNAME},

{BODY}

Sincerely,
[imgmw=100]{SHERIFF_SIGNATURE_IMG}[/imgmw]
{SHERIFF_NAME}, Sheriff
[imgmw=200]{CHIEF_SIGNATURE_IMG}[/imgmw]
{CHIEF_NAME}, Division Chief
Personnel Command[/indent]
[br][/br]
[center][img]{FOOTER_IMG}[/img][/center]`;

const CFG = {
  SHERIFF_NAME_UPPERCASE: "GRANT MENDEZ", SHERIFF_NAME: "Grant Mendez",
  BANNER_IMG: "https://i.imgur.com/LEWTXbL.png",
  SHERIFF_SIGNATURE_IMG: "https://i.booskit.dev/gtaw/signature-sheriff.png",
  CHIEF_SIGNATURE_IMG: "https://www.upload.ee/image/18776202/signature_3_.png",
  FOOTER_IMG: "https://i.imgur.com/vggSUzN.png",
  CHIEF_NAME: "Richard Dunne",
  DATE: "November 4, 2026", SALUTATION: "Mr.", LASTNAME: "Smith",
};

const BODY = {
  "app-received": `We have received your application and qualifications for the position of [b]Deputy Sheriff Trainee[/b]. Thank you for showing interest in employment with the Los Santos County Sheriff's Department.

Your request has been acknowledged and forwarded to the Pre-Employment Unit for further deliberation & conclusion. This deliberation will include a thorough examination of your previous service with the Department and personal background information.

While extraneous circumstances may preclude a fixed timeframe, you should expect a response to your request within 72 hours.`,

  "app-hold": `We have reviewed your application and qualifications for the position of [b]Deputy Sheriff Trainee[/b].

We have noticed one or more errors in your application and may not process it further. The following issue(s) must first be corrected:

[list=1]
[*]Issue 1;
[*]Issue 2;
[*]Issue 3.
[/list]

You have 24 hours to correct the aforementioned issue(s). Once corrected, you must forward a reply, stating that amendments have been made.`,

  "app-accepted": `We have evaluated your application and qualifications for the position of [b]Deputy Sheriff Trainee[/b].

We are pleased to inform you that your application has been successful. The next step in the recruitment process is to attend and complete your Written Test.

You will shortly receive correspondence with instructions on completing your Written Test.

Should you have any questions, comments, or concerns, please contact Training Bureau Command.`,

  "app-dq": `We have evaluated your application and qualifications for the position of [b]Deputy Sheriff Trainee[/b] and regret to inform you that you were not selected for this position due to issues that may have involved:

[list][*]Employment history;
[*]Credit or financial history;
[*]Discovered undisclosed information;
[*]Dishonesty;
[*]Incomplete application;
[*]Other reason(s) as not listed.
[*][ooc]OOC REASON[/ooc][/list][br][/br]
Under all circumstances, you are ineligible to reapply during the current recruitment drive as well as any concurrent recruitment drives for civilian employment. You may reapply [b]three (3)[/b] weeks from the date of your denial.

[b]Any formal appeal must be in writing and received by Training Bureau Command within ten (10) business days from the [u]postmark date[/u] of this letter. Please note, appeals may take 5-7 business days to be processed.

To appeal, you must demonstrate that the factors leading to your disqualification are in error.[/b]`,

  "wt-passed": `We have evaluated your written test for the position of [b]Deputy Sheriff Trainee[/b] and are pleased to inform you that you have been successful. The next step in the recruitment process is to attend and complete the Academy.

You will be sent further correspondence explaining the process for this stage, along with available dates for you to sign up and undergo training.

[ooc]At this point, your character will advance one step forward in the recruitment process and will be enrolled in academy training.

You are now also asked to join the LSSD Discord [url=https://discord.gg/j97T7Yz6h4]here[/url] and follow the verification steps found in the "group-requests" channel to verify and/or sync your roles. Verifying your Discord account will give you access to the Deputy Sheriff Trainee channel where important correspondence will be communicated to you by Training Bureau Command in regards to the Academy process and further beyond. You may also ask questions in the channel.[/ooc]`,

  "wt-failed": `We have evaluated your application and qualifications for the position of [b]Deputy Sheriff Trainee[/b] and regret to inform you that you were not selected for this position due to issues involving your Written Test.

Under all circumstances, you are ineligible to take the Written Test again or reapply during the current recruitment drive as well as any concurrent recruitment drives for civilian employment. You may reapply three weeks after the date of your denial.

[b]Any formal appeal must be in writing and received by Training Bureau Command within ten (10) business days from the [u]postmark date[/u] of this letter. Please note, appeals may take 5-7 business days to be processed.

To appeal, you must demonstrate that the factors leading to your disqualification are in error.[/b]`,

  "acad-passed": `We have evaluated your application and qualifications for the position of [b]Deputy Sheriff Trainee[/b].

Pursuant to personnel guidelines and hiring standards of the County of Los Santos, we would like to offer you a conditional offer of employment at the sworn title of [b]Deputy Sheriff Trainee[/b].

[b]Any request for refusal of this offer must be in writing and received by Training Bureau Command within ten (10) business days from the [u]postmark date[/u] of this letter.[/b]

You will be sent further correspondence explaining the process of your swearing-in further.

[ooc]At this point, your character would be sworn in following completion of academy training.

Since you already have access to the Deputy Sheriff Trainee channel, important correspondence will be communicated to you by Training Bureau Command regarding the final examination and beyond. You may also ask questions in the channel.

As of this moment, your next step is to familiarize yourself with the academy material on our [url=https://lssd.gta.world/viewforum.php?f=371]intranet page[/url] in order to take your final exam.[/ooc]`,

  "acad-failed": `We have evaluated your application and qualifications for the position of [b]Deputy Sheriff Trainee[/b] and regret to inform you that you were not selected for this position due to issues related to your Academy training.

Under all circumstances, you are ineligible to undergo Academy training again or reapply during the current recruitment drive, as well as any concurrent recruitment drives for civilian employment. You may reapply three weeks after the date of your denial.

[ooc]OOC REASON[/ooc]

[b]Any formal appeal must be in writing and received by Personnel Command: Headquarters within ten (10) business days from the [u]postmark date[/u] of this letter. Please note, appeals may take 5-7 business days to be processed.

To appeal, you must demonstrate that the factors leading to your disqualification are in error.[/b]`,
};

const ADMIN = `[block=0,30,transparent,white][center][img]{BANNER_IMG}[/img]

[b]DEPUTY SHERIFF TRAINEE ADMINISTRATIVE FILE[/b]
LOS SANTOS COUNTY SHERIFF'S DEPARTMENT — PRE-EMPLOYMENT UNIT[/center]

[hr][/hr]

[b]INFORMATION[/b]

[indent]Applicant Name: John Smith
Application: [url=https://lssd.gta.world/viewtopic.php?t=1]ACCESS[/url]
Notes: A note
[/indent]

[hr][/hr]

[b]PRE-EMPLOYMENT UNIT CHECKLIST[/b]
[indent]{C1} Application
{C2} Written Test (WT)
{C3} Supervisor WT Grade Approval
[/indent]

[b]PRE-EMPLOYMENT UNIT SERGEANT CHECKLIST[/b]
[indent]Academy :[list][*]{C4} Academy (1)
[*]{C5} Academy (2)[/list]
{C6} Supervisor Academy Grade Approval
{C7} Pre-Employment Unit Commander Review
[/indent]

[b]TRAINING BUREAU OPERATIONS CHECKLIST[/b]
[indent]{C8} Executive Staff Review & Pre-Employment Unit Commander Approval
{C9} Final Examination[/indent][/block]`;

const fill = (t, d) => t.replace(/\{(\w+)\}/g, (m, k) => (k in d ? d[k] : m));
let fails = 0;
const check = (name, got, want) => {
  if (got === want) return console.log("ok   " + name);
  fails++;
  console.log("FAIL " + name);
  const g = got.split("\n"), w = want.split("\n");
  for (let i = 0; i < Math.max(g.length, w.length); i++) if (g[i] !== w[i]) console.log(`  line ${i + 1}\n    want: ${JSON.stringify(w[i])}\n    got:  ${JSON.stringify(g[i])}`);
};

const base = {
  date: CFG.DATE, salutation: "Mr.", name: "John Smith",
  dqOoc: "OOC REASON", failOoc: "OOC REASON", reasons: [true, true, true, true, true, true],
};
if (P.LETTERS.length !== 8) { fails++; console.log("FAIL expected 8 letters, got " + P.LETTERS.length); }
P.LETTERS.forEach((l) => check(l.id, P.buildLetter({ ...base, type: l.id }), fill(SKELETON, { ...CFG, BODY: BODY[l.id] })));

// variations
check("app-hold with 2 issues", P.buildLetter({ ...base, type: "app-hold", issues: ["First thing", "Second thing"] }),
  fill(SKELETON, { ...CFG, BODY: BODY["app-hold"].replace("[*]Issue 1;\n[*]Issue 2;\n[*]Issue 3.", "[*]First thing;\n[*]Second thing.") }));
check("app-dq without OOC, one reason off", P.buildLetter({ ...base, type: "app-dq", dqOoc: "", reasons: [true, true, true, false, true, true] }),
  fill(SKELETON, { ...CFG, BODY: BODY["app-dq"].replace("[*]Dishonesty;\n", "").replace("\n[*][ooc]OOC REASON[/ooc]", "") }));
check("acad-failed without OOC drops the line", P.buildLetter({ ...base, type: "acad-failed", failOoc: "" }),
  fill(SKELETON, { ...CFG, BODY: BODY["acad-failed"].replace("[ooc]OOC REASON[/ooc]\n\n", "") }));
check("empty form keeps placeholders", P.buildLetter({ type: "app-hold" }).split("\n").slice(10, 14).join("|"),
  "[indent]Month Day, Year||Dear Mr. Lastname,|");

// admin file: [cb][/cb] open, [cbc][/cbc] ticked
const none = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ["C" + i, "[cb][/cb]"]));
const s = { name: "John Smith", url: "https://lssd.gta.world/viewtopic.php?t=1", notes: "A note" };
check("admin file, nothing ticked", P.buildAdmin({ ...s, checks: [] }), fill(ADMIN, { BANNER_IMG: CFG.BANNER_IMG, ...none }));
check("admin file, items 1 and 4 ticked", P.buildAdmin({ ...s, checks: [true, false, false, true] }),
  fill(ADMIN, { BANNER_IMG: CFG.BANNER_IMG, ...none, C1: "[cbc][/cbc]", C4: "[cbc][/cbc]" }));

// title + tags
check("title with tag", P.buildTitle({ name: "John Smith", tag: "ON-HOLD" }), "[DST] John Smith [ON-HOLD]");
check("title without tag", P.buildTitle({ name: "John Smith", tag: "" }), "[DST] John Smith");
check("internal tags only", P.TAGS.internal.length + "/" + String(P.TAGS.public), "11/undefined");

// no stray CR, tab or curly characters in any output
const all = P.LETTERS.map((l) => P.buildLetter({ ...base, type: l.id })).join("") + P.buildAdmin(s);
const odd = all.match(/[\r\t‘’“”]/g);
check("no CR / tab / curly quotes", String(odd), "null");

console.log(fails ? "\n" + fails + " FAILED" : "\nall passed");
process.exit(fails ? 1 : 0);
