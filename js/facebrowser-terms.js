/* DFU: Facebrowser ESW Parser, flag lists.
   Keyword lists the Flagged tab matches against every message. Maintained here, not in the page.
   - Matching ignores case, needs whole words, and accepts a plural ("gun" also finds "guns").
   - A space or hyphen inside a term also matches no separator ("ak 47" finds "ak47" and "ak-47").
   - Keep terms specific. A word that is common in ordinary talk (like "pack" or "hood") floods the results.
   Order matters: when a message hits several lists, the first list below sets its colour and flag. */
window.FBTERMS = [
  {
    key: "firearms", name: "Firearms", color: "#e5534b",
    terms: [
      "gun", "pistol", "handgun", "revolver", "rifle", "shotgun", "smg", "uzi", "ak", "ak 47", "ar 15", "glock", "deagle", "desert eagle",
      "mac 10", "tec 9", "carbine", "assault rifle", "sniper", "firearm", "ammo", "ammunition", "bullet", "clip", "extended mag", "drum mag",
      "silencer", "suppressor", "glock switch", "auto sear", "strap", "heater", "chopper", "draco", "gat", "tommy gun", "blick", "9mm", "40 cal",
      ".45", ".380", "50 cal", "caliber", "semi auto", "full auto", "fully auto", "machine gun", "pump action", "sawed off", "sawn off",
      "ghost gun", "weapon", "ammu nation", "firing range", "shells", "hollow point", "armed",
      "strapped", "packing heat", "heat on me", "my heat", "got heat", "bring the heat", "bring the tools", "bring tools", "my tool", "the tool",
      "tool on me", "my piece", "got a piece", "packing a piece", "piece on me", "my iron", "the iron", "iron on me", "my stick", "the stick",
      "bang stick", "boom stick", "my pipe", "the pipe", "pew", "pew pew", "bang bang", "blicky", "toolie", "glizzy", "the nine", "my nine",
      "the forty", "my forty", "sidearm", "something to protect", "protection on me", "concealed", "concealed carry", "carrying a piece",
      "ruger", "beretta", "colt", "taurus", "sig sauer", "smith and wesson", "remington", "winchester", "mossberg", "kel tec", "hi point", "springfield",
      "mp5", "p90", "m4", "m16", "minigun", "rpg", "grenade", "explosive", "c4", "magazine", "mag", "cartridge", "casing", "scope", "barrel",
      "holster", "trigger", "pull the trigger", "safety off", "reload", "mag dump", "dumped on", "blast him", "blast you", "blasted", "spray him",
      "spray you", "pop him", "pop you", "pop off", "popped him", "light him up", "light you up", "light them up", "shoot up", "shot up", "fire off",
      "get strapped", "pull up strapped", "load up", "loaded up", "something loud", "make it loud"
    ]
  },
  {
    key: "narcotics", name: "Narcotics", color: "#3fae6b",
    terms: [
      "weed", "marijuana", "cannabis", "kush", "ganja", "dank", "joint", "blunt", "420", "edible", "cocaine", "coke", "crack", "crack cocaine",
      "heroin", "dope", "meth", "methamphetamine", "crystal meth", "fentanyl", "fent", "oxy", "oxycodone", "oxycontin", "percocet", "perc",
      "xanax", "xan", "lean", "codeine", "promethazine", "molly", "mdma", "ecstasy", "lsd", "shrooms", "psilocybin", "pcp", "ketamine", "opium",
      "adderall", "vicodin", "morphine", "steroid", "narcotic", "drug", "dealer", "dealing", "plug", "trap house", "trap", "re up", "eight ball",
      "8 ball", "ounce", "kilo", "brick", "dime bag", "nickel bag", "baggie", "stash", "stash house", "dope boy", "pusher", "junkie", "pressed pill",
      "m30", "vape cart", "dab", "hash", "hashish", "paraphernalia", "meth lab", "cook meth", "cooking meth", "get high", "stoned", "overdose"
    ]
  },
  {
    key: "violence", name: "Violence & threats", color: "#ff8a3d",
    terms: [
      "kill", "killed", "killing", "murder", "shoot", "shooting", "shot", "stab", "stabbed", "kidnap", "kidnapped", "hostage", "ransom", "rob",
      "robbed", "robbery", "heist", "put a hit", "hitman", "hit list", "execute", "execution", "ambush", "drive by", "assassinate", "gunned down",
      "bury", "threat", "threaten", "threatening", "retaliate", "retaliation", "revenge", "payback", "beef", "green light", "bounty"
    ]
  },
  {
    key: "trade", name: "Illicit trade & money", color: "#e0b030",
    terms: [
      "launder", "laundering", "dirty money", "clean money", "dirty cash", "supplier", "connect", "distribution", "distribute", "traffick",
      "trafficking", "smuggle", "smuggling", "contraband", "stolen", "chop shop", "drop off", "cut me in", "bulk", "wholesale", "shipment",
      "payout", "re sell", "resell", "off the books", "under the table"
    ]
  },
  {
    key: "evasion", name: "Law enforcement & evasion", color: "#3b9eff",
    terms: [
      "lspd", "lssd", "sheriff", "cops", "cop", "police", "fib", "feds", "federal", "warrant", "raid", "snitch", "snitching", "informant",
      "undercover", "narc", "wiretap", "surveillance", "burner", "burner phone", "delete this", "delete the chat", "delete these", "delete our",
      "dont text me", "don't text me", "talk in person", "no names", "switch phones", "get rid of", "evidence", "alibi", "bail", "arrested", "jail", "prison",
      "probation", "parole"
    ]
  }
];
