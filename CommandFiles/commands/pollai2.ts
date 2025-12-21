import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "pollinations2",
  aliases: ["pollai2"],
  author: "Christus Dev AI",
  version: "1.0.0",
  description: "Generate AI images using Pollinations.ai API",
  category: "AI",
  usage: "{prefix}{name} <prompt>",
  role: 0,
  waitingTime: 5,
  icon: "🖼️",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🖼️ Christus • Pollinations.ai",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */
export const langs = {
  en: {
    noPrompt: "❌ | Please provide a prompt.",
    generating: "🖼️ | Generating your Pollinations.ai image...",
    generateFail: "❌ | Image generation failed.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "https://zetbot-page.onrender.com/api/pollinations.ai";
const CACHE_DIR = path.join(__dirname, "tmp");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ input, output, args, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) return output.reply(t("noPrompt"));

    const prompt = args.join(" ").trim();
    const waitMsg = await output.reply(t("generating"));

    try {
      const response = await axios.get(API_URL, {
        params: { prompt },
        responseType: "arraybuffer",
        timeout: 120000,
      });

      if (!response.data) throw new Error("No image returned");

      const filePath = path.join(CACHE_DIR, `pollinationsai_${Date.now()}.png`);
      fs.writeFileSync(filePath, response.data);

      await output.unsend(waitMsg.messageID);

      await output.reply({
        body: `${UNISpectra.standardLine}\n✅ Image generated successfully!\n🧠 Prompt: ${prompt}\n${UNISpectra.standardLine}`,
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
    } catch (err: any) {
      console.error("Pollinations.ai Error:", err.message || err);
      await output.unsend(waitMsg.messageID);
      output.reply(t("generateFail"));
    }
  }
);
