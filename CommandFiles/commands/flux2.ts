import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "flux2",
  aliases: [],
  author: "Dipto • Converted by Christus Dev AI",
  version: "2.0.0",
  description: "Flux Image Generator",
  category: "AI",
  usage: "{prefix}{name} <prompt>",
  role: 0,
  waitingTime: 15,
  icon: "🌀",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🌀 Christus • Flux AI",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noPrompt: "⚠️ | Please provide a prompt.",
    generating: "⌛ | Generating image, please wait...",
    generateFail: "❌ | Failed to generate image.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "https://mahbub-ullash.cyberbot.top/api/flux";
const CACHE_DIR = path.join(__dirname, "tmp");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ args, output, input, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) {
      return output.reply(t("noPrompt"));
    }

    const prompt = args.join(" ").trim();

    const waitMsg = await output.reply(t("generating"));

    try {
      const response = await axios.get(API_URL, {
        params: { prompt },
        responseType: "arraybuffer",
        timeout: 120000,
      });

      if (!response.data) {
        throw new Error("No image returned");
      }

      const filePath = path.join(
        CACHE_DIR,
        `flux_${Date.now()}.png`
      );

      fs.writeFileSync(filePath, response.data);

      await output.unsend(waitMsg.messageID);

      await output.reply({
        body: "✅ Here's your image",
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
    } catch (err: any) {
      console.error("Flux Command Error:", err.message || err);
      await output.unsend(waitMsg.messageID);
      output.reply(t("generateFail"));
    }
  }
);
