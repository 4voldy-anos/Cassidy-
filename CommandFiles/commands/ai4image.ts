// @ts-check

/**
 * @type {CommandMeta}
 */
export const meta = {
  name: "ai4image",
  description: "Generate AI images using AI4Image API",
  author: "Christus",
  version: "1.0.0",
  usage: "{prefix}{name} <prompt> | <ratio>",
  category: "AI-Image",
  permissions: [0],
  waitingTime: 20,
  requirement: "3.0.0",
  otherNames: ["aiimg", "a4i"],
  icon: "🖼️",
  noWeb: true,
};

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import stream from "stream";
import { promisify } from "util";
import { defineEntry } from "@cass/define";

const pipeline = promisify(stream.pipeline);
const API_ENDPOINT = "https://arychauhann.onrender.com/api/ai4image";
const CACHE_DIR = path.join(process.cwd(), "cache", "ai4image");

/* -------------------- HELPERS -------------------- */

async function downloadImage(url: string): Promise<string> {
  const filePath = path.join(
    CACHE_DIR,
    `ai4image_${Date.now()}.jpg`
  );

  try {
    const res = await axios.get(url, {
      responseType: "stream",
      timeout: 120_000,
    });

    await pipeline(res.data, fs.createWriteStream(filePath));
    return filePath;
  } catch {
    if (fs.existsSync(filePath)) await fs.unlink(filePath);
    throw new Error("Failed to download image");
  }
}

/* -------------------- ENTRY -------------------- */

export const entry = defineEntry(
  async ({ input, output, args }) => {
    const fullInput = args.join(" ").trim();

    if (!fullInput) {
      return output.reply(
        "❌ Veuillez fournir un prompt.\n" +
        "Exemple : ai4image cyberpunk cat | 1:1"
      );
    }

    const [prompt, ratioRaw] = fullInput.split("|").map(s => s?.trim());
    const ratio = ratioRaw || "1:1";

    await fs.ensureDir(CACHE_DIR);

    await output.reply("⏳ Génération de l’image AI4Image en cours...");

    try {
      const { data } = await axios.get<any>(
        `${API_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`,
        { timeout: 180_000 }
      );

      if (!data?.status || !data?.result?.image_link) {
        throw new Error("API invalide ou image non générée");
      }

      const imageUrl: string = data.result.image_link;
      const attempt: string = data.result.attempt || "unknown";

      const imagePath = await downloadImage(imageUrl);

      await output.reply({
        body:
          "🖼️ **AI4Image Generated**\n" +
          `📝 Prompt : ${prompt}\n` +
          `📐 Ratio : ${ratio}\n` +
          `⚙️ Mode : ${attempt}`,
        attachment: fs.createReadStream(imagePath),
      });

      // cleanup
      if (fs.existsSync(imagePath)) {
        await fs.unlink(imagePath).catch(() => {});
      }
    } catch (err: any) {
      console.error("AI4Image Error:", err);
      output.reply(`❌ Échec de la génération : ${err.message}`);
    }
  }
);
