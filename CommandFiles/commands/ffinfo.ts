import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "ffinfo",
  author: "Aryan Chauhan • TS by Christus",
  version: "1.1.0",
  description: "Fetch detailed Free Fire player info by UID & Server",
  category: "Info",
  usage: "{prefix}{name} <uid> | <server>",
  role: 0,
  waitingTime: 5,
  icon: "🎮",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🎮 Christus • FF Info",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noArgs: "❌ | UID and server are required. Example: ffinfo 1234567890 | IND",
    invalidServer: "❌ | Invalid server. Available: SG, BD, RU, ID, TW, US, VN, TH, ME, PK, CIS, BR, IND",
    playerNotFound: "❌ | Player not found!",
    fetchFail: "❌ | Failed to fetch Free Fire data.",
  },
};

/* ================= CONSTANTS ================= */

const SERVERS: Record<string, string> = {
  SG: "sg", BD: "bd", RU: "ru", ID: "id", TW: "tw",
  US: "us", VN: "vn", TH: "th", ME: "me", PK: "pk",
  CIS: "cis", BR: "br", IND: "ind"
};

const PET_NAMES: Record<number, string> = {
  1300000041: "Falco",
  1300000042: "Ottero",
  1300000043: "Mr. Waggor",
  1300000044: "Poring",
  1300000045: "Detective Panda",
  1300000046: "Night Panther",
  1300000047: "Beaston",
  1300000048: "Rockie",
  1300000049: "Moony",
  1300000050: "Dreki",
  1300000051: "Arvon"
};

/* ================= UTILS ================= */

function unix(ts?: number | string) {
  if (!ts) return "N/A";
  return new Date(Number(ts) * 1000).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata"
  });
}

function cleanEnum(v?: string) {
  if (!v) return "N/A";
  return v
    .replace(/(GENDER|LANGUAGE|TIMEACTIVE|MODEPREFER|RANKSHOW|REWARDSTATE|EXTERNALICONSTATUS|EXTERNALICONSHOWTYPE)/g, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function creditStatus(score?: number) {
  if (typeof score !== "number") return "Unknown";
  if (score >= 90) return "Excellent 🟢";
  if (score >= 70) return "Good 🟡";
  if (score >= 50) return "Average 🟠";
  return "Low 🔴";
}

/* ================= ENTRY ================= */

export const entry = defineEntry(async ({ args, output, event, langParser }) => {
  const t = langParser.createGetLang(langs);

  const input = args.join(" ");
  const [uidRaw, serverRaw] = input.split("|").map(t => t?.trim());
  const uid = uidRaw;
  const serverKey = serverRaw?.toUpperCase();

  if (!uid || !serverKey) return output.reply(t("noArgs"));
  if (!SERVERS[serverKey]) return output.reply(t("invalidServer"));

  try {
    const infoUrl = `https://ffapii.vercel.app/get_player_personal_show?server=${SERVERS[serverKey]}&uid=${uid}`;
    const { data } = await axios.get(infoUrl, { timeout: 15000 });

    if (!data?.basicinfo) return output.reply(t("playerNotFound"));

    const b = data.basicinfo;
    const pr = data.profileinfo || {};
    const p = data.petinfo || {};
    const s = data.socialinfo || {};
    const c = data.creditscoreinfo || {};
    const clan = data.clanbasicinfo || {};

    const petName = PET_NAMES[p.id] || "Unknown";

    const msg =
`🌍 Server: ${serverKey}

━━━━━━━━━━━━━
👤 ACCOUNT
• Nickname: ${b.nickname}
• UID: ${b.accountid}
• Region: ${b.region}
• Account Type: ${b.accounttype}
• Level: ${b.level}
• EXP: ${b.exp}
• Likes: ❤️ ${b.liked}
• Title ID: ${b.title}
• Banner ID: ${b.bannerid}
• Avatar Frame: ${b.avatarframe}
• Created: ${unix(b.createat)}
• Last Login: ${unix(b.lastloginat)}
• Game Version: ${b.releaseversion}

━━━━━━━━━━━━━
🎖 BADGES
• Total Badges: ${b.badgecnt}
• Badge ID: ${b.badgeid}

━━━━━━━━━━━━━
🏆 RANKS
• BR Rank: ${b.rank}
• BR Points: ${b.rankingpoints}
• Max BR Rank: ${b.maxrank}
• CS Rank: ${b.csrank}
• CS Points: ${b.csrankingpoints}
• Max CS Rank: ${b.csmaxrank}
• Season ID: ${b.seasonid}

━━━━━━━━━━━━━
🎯 ADVANCED RANK DATA
• Hippo Rank: ${b.hipporank}
• Hippo Points: ${b.hipporankingpoints}
• CS Peak Tournament Rank: ${b.cspeaktournamentrankpos}

━━━━━━━━━━━━━
🧬 PROFILE
• Avatar ID: ${pr.avatarid}
• Head Pic ID: ${b.headpic}
• Equipped Skills Count: ${pr.equipedskills?.length || 0}
• Skill IDs: ${pr.equipedskills?.join(", ") || "N/A"}
• Clothes Count: ${pr.clothes?.length || 0}
• PvE Weapon: ${pr.pveprimaryweapon}

━━━━━━━━━━━━━
🐾 PET
• Name: ${petName}
• Pet ID: ${p.id || "N/A"}
• Level: ${p.level || "N/A"}
• EXP: ${p.exp || "N/A"}
• Skin ID: ${p.skinid || "N/A"}
• Skill ID: ${p.selectedskillid || "N/A"}
• Selected: ${p.isselected ? "Yes" : "No"}

━━━━━━━━━━━━━
🏰 CLAN
• Clan Name: ${clan.clanname || "Not in clan"}
• Clan ID: ${clan.clanid || "N/A"}
• Clan Level: ${clan.clanlevel || "N/A"}

━━━━━━━━━━━━━
🌐 SOCIAL
• Gender: ${cleanEnum(s.gender)}
• Language: ${cleanEnum(s.language)}
• Active Time: ${cleanEnum(s.timeactive)}
• Preferred Mode: ${cleanEnum(s.modeprefer)}
• Rank Show Mode: ${cleanEnum(s.rankshow)}

📝 SIGNATURE
${s.signature || "None"}

━━━━━━━━━━━━━
🛡 TRUST & SECURITY
• Credit Score: ${c.creditscore || "N/A"}
• Credit Status: ${creditStatus(c.creditscore)}
• Reward State: ${cleanEnum(c.rewardstate)}
• Period Ends: ${unix(c.periodicsummaryendtime)}
• Safe Account: ${
  typeof c.creditscore === "number"
    ? c.creditscore >= 90 ? "Yes ✅" : "No ⚠️"
    : "Unknown"
}

━━━━━━━━━━━━━
📦 VISIBILITY
• Show BR Rank: ${b.showbrrank}
• Show CS Rank: ${b.showcsrank}
• Weapon Skins Shown: ${b.weaponskinshows?.length || 0}
`;

    let attachment;
    try {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `ff_${uid}.jpg`);
      const img = await axios.get(`https://profile.thug4ff.com/api/profile?uid=${uid}`, {
        responseType: "arraybuffer",
        timeout: 8000
      });
      fs.writeFileSync(imgPath, img.data);
      attachment = fs.createReadStream(imgPath);
    } catch (_) {}

    await output.reply(attachment ? { body: msg, attachment } : msg);

    if (attachment) fs.unlinkSync((attachment as any).path);

  } catch (e) {
    console.error(e);
    return output.reply(t("fetchFail"));
  }
});
