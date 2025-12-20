import axios from "axios";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "gem",
  author: "Kay • fixed TS by Christus",
  version: "1.0.0",
  description: "Generate artistic AI images",
  category: "AI",
  usage: "{prefix}{name} <prompt> [--r X:Y] [--nw]",
  : 2,
  waitingTime: 5,
  icon: "🎨",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🎨 Christus • GEM AI",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noPrompt: "🎨 | Please provide an artistic prompt.",
    generateFail: "❌ | Image generation failed.",
    badRequest:
      "🎨 | The request couldn't be processed. Try rephrasing artistically.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "https://gpt-1-m8mx.onrender.com/generate";

const ratioImages: Record<string, string> = {
  "9:16": "https://i.postimg.cc/Tw4YMpkq/Untitled4-20250828185218.jpg",
  "3:4": "https://i.postimg.cc/Dzz89kvh/Untitled5-20250828185241.jpg",
  "16:9": "https://i.postimg.cc/sfnyLQBM/Untitled9.jpg",
  L: "https://i.postimg.cc/jS1bSG6t/Untitled7-20250828185348.jpg",
  M: "https://i.postimg.cc/XJzFHNdt/Untitled8-20250828185413.jpg",
};

/* ================= UTILS ================= */

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

function filterArtisticPrompt(prompt: string) {
  return prompt
    .replace(/\bnsfw\b/gi, "artistic figure study")
    .replace(/\bnude\b/gi, "artistic figure study")
    .replace(/\bnaked\b/gi, "unclothed figure study")
    .replace(/\berotic\b/gi, "artistic")
    .replace(/\bsensual\b/gi, "graceful")
    .replace(/\bboobs?\b/gi, "chest area")
    .replace(/\bbreasts?\b/gi, "décolletage");
}

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ input, output, args, event, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) return output.reply(t("noPrompt"));

    /* ===== Parse flags ===== */
    let promptParts: string[] = [];
    let ratio: string | null = null;
    let artisticMode = false;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--r" && args[i + 1]) {
        ratio = args[i + 1];
        i++;
      } else if (args[i] === "--nw") {
        artisticMode = true;
      } else {
        promptParts.push(args[i]);
      }
    }

    const rawPrompt = promptParts.join(" ");
    if (!rawPrompt) return output.reply(t("noPrompt"));

    /* ===== Process prompt ===== */
    const processedPrompt = artisticMode
      ? filterArtisticPrompt(rawPrompt)
      : rawPrompt;

    let finalPrompt = artisticMode
      ? `You are creating a refined fine-art photograph suitable for a gallery exhibition.

ARTISTIC SUBJECT:
${processedPrompt}

Focus on composition, lighting, and aesthetic beauty.`
      : `Create a high-quality image based on this description:\n${processedPrompt}`;

    /* ===== Images array ===== */
    const images: string[] = [];

    if (ratio && ratioImages[ratio]) {
      images.push(await urlToBase64(ratioImages[ratio]));
      finalPrompt += `
CRITICAL RATIO RULE:
The image must fully fill the frame with no borders or empty space.`;
    }

    if (event.messageReply?.attachments?.length) {
      const photos = event.messageReply.attachments
        .filter((a) => a.type === "photo")
        .slice(0, 3);

      for (const img of photos) {
        const res = await axios.get(img.url, { responseType: "arraybuffer" });
        images.push(Buffer.from(res.data).toString("base64"));
      }
    }

    /* ===== API Call ===== */
    try {
      const { data } = await axios.post(
        API_URL,
        {
          prompt: finalPrompt,
          format: "jpg",
          ...(images.length ? { images } : {}),
        },
        {
          responseType: "arraybuffer",
          timeout: 180000,
        }
      );

      const cacheDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `gem_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, data);

      await output.reply({
        body: `🎨✨ Image generated${ratio ? ` (${ratio})` : ""}${
          artisticMode ? " [Artistic Mode]" : ""
        }`,
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
    } catch (err: any) {
      if (err.response?.status === 400) {
        return output.reply(t("badRequest"));
      }
      return output.reply(t("generateFail"));
    }
  }
);
