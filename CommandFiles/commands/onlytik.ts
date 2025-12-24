import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "onlytik",
  aliases: ["otik"],
  author: "Christus Dev AI | Redwan API",
  version: "1.0.0",
  description: "Fetch a random OnlyTik video",
  category: "Media",
  usage: "{prefix}{name}",
  role: 2,
  waitingTime: 5,
  icon: "🎥",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🎥 Christus • OnlyTik",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    generating: "🎥 | Fetching OnlyTik video, please wait...",
    generateFail: "❌ | Failed to fetch video.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "http://65.109.80.126:20511/api/onlytik";
const CACHE_DIR = path.join(__dirname, "tmp");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ output, langParser }) => {
    const t = langParser.createGetLang(langs);

    const waitMsg = await output.reply(t("generating"));

    try {
      const { data } = await axios.get(API_URL, { timeout: 60000 });

      const videoUrl = data?.selected_video?.url;
      const likes = data?.selected_video?.likes ?? 0;

      if (!videoUrl) throw new Error("Invalid API response");

      const videoRes = await axios.get(videoUrl, {
        responseType: "stream",
        timeout: 120000,
      });

      const filePath = path.join(
        CACHE_DIR,
        `onlytik_${Date.now()}.mp4`
      );

      const writer = fs.createWriteStream(filePath);
      videoRes.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await output.unsend(waitMsg.messageID);

      await output.reply({
        body: `✅ OnlyTik video fetched!\n❤️ Likes: ${likes.toLocaleString()}`,
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
    } catch (err: any) {
      console.error("OnlyTik Command Error:", err.message || err);
      await output.unsend(waitMsg.messageID);
      output.reply(t("generateFail"));
    }
  }
);
