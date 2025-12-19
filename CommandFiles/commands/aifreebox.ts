// CommandFiles/commands/aifreebox.ts

import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "aifreebox",
  aliases: ["aifb", "ai-photo"],
  author: "Christus dev AI",
  version: "1.0.0",
  description: "Generate AI images via AI Freebox",
  category: "AI",
  usage: "{prefix}{name} <prompt> [--ratio X:Y]",
  role: 0,
  waitingTime: 10,
  icon: "🖼️",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🖼️ Christus • AI Freebox",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  fr: {
    noPrompt: "🖼️ Veuillez fournir un prompt pour générer l'image.",
    generating: "🖼️ Génération de l'image AI Freebox en cours... ⏳",
    fail: "❌ Impossible de générer l'image AI Freebox. Veuillez réessayer plus tard.",
  },
};

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ output, args, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) return output.reply(t("noPrompt"));

    let ratio = "1:1";
    const promptParts: string[] = [];

    // Parse flags
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--ratio" && args[i + 1]) {
        ratio = args[i + 1];
        i++;
      } else {
        promptParts.push(args[i]);
      }
    }

    const prompt = promptParts.join(" ");
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `aifreebox_${Date.now()}.png`);

    try {
      const loadingMsg = await output.reply(t("generating"));

      const { data } = await axios.get("https://zetbot-page.onrender.com/api/aifreebox", {
        params: {
          prompt,
          ratio,
          slug: "ai-photo-generator",
        },
        timeout: 180000,
      });

      const imageUrl = data?.imageUrl;
      if (!imageUrl) throw new Error("No image URL returned");

      const img = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(img.data));

      await output.reply({
        body: `${UNISpectra.charm} Prompt:\n${prompt}\nRatio: ${ratio}`,
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
      if (loadingMsg?.messageID) output.unsend(loadingMsg.messageID);
    } catch (err) {
      console.error(err);
      output.reply(t("fail"));
    }
  }
);
