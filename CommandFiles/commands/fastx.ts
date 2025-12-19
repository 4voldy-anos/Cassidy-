import fs from "fs";
import path from "path";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "fastx",
  author: "Christus dev AI",
  version: "1.2.0",
  description: "Generate AI images (4x grid)",
  category: "AI",
  usage: "{prefix}{name} <prompt> [--ar <ratio>]",
  role: 0,
  waitingTime: 5,
  icon: "⚡",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "⚡ Christus • FASTX",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noPrompt: "❌ | Please provide a prompt.",
    generating: "⚡ Fastx is generating your images...",
    failed: "❌ | Image generation failed.",
    invalid: "❌ | Invalid choice. Use U1, U2, U3 or U4.",
  },
};

/* ================= CONSTANTS ================= */

const aspectRatioMap: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "9:7": { width: 1152, height: 896 },
  "7:9": { width: 896, height: 1152 },
  "19:13": { width: 1216, height: 832 },
  "13:19": { width: 832, height: 1216 },
  "7:4": { width: 1344, height: 768 },
  "4:7": { width: 768, height: 1344 },
  "12:5": { width: 1500, height: 625 },
  "5:12": { width: 640, height: 1530 },
  "16:9": { width: 1344, height: 756 },
  "9:16": { width: 756, height: 1344 },
  "2:3": { width: 768, height: 1152 },
  "3:2": { width: 1152, height: 768 },
};

const GEN_API = "https://www.ai4chat.co/api/image/generate";

/* ================= UTILS ================= */

async function downloadImage(url: string, filePath: string) {
  const writer = fs.createWriteStream(filePath);
  const res = await axios({ url, responseType: "stream" });
  res.data.pipe(writer);

  await new Promise<void>((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ input, output, args, event, langParser }) => {
    const t = langParser.createGetLang(langs);
    if (!args.length) return output.reply(t("noPrompt"));

    const startTime = Date.now();
    const userID = input.senderID;

    /* ===== Parse args ===== */
    let ratio = "1:1";
    let promptParts: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--ar" && args[i + 1]) {
        ratio = args[i + 1];
        i++;
      } else {
        promptParts.push(args[i]);
      }
    }

    const prompt = promptParts.join(" ").trim();
    if (!prompt) return output.reply(t("noPrompt"));

    const waitMsg = await output.reply(t("generating"));

    try {
      const cacheDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      /* ===== Generate 4 images ===== */
      const imagePaths: string[] = [];

      for (let i = 0; i < 4; i++) {
        const { data } = await axios.get(
          `${GEN_API}?prompt=${encodeURIComponent(
            prompt
          )}&aspect_ratio=${encodeURIComponent(ratio)}`
        );

        const imgPath = path.join(cacheDir, `fastx_${Date.now()}_${i}.jpg`);
        await downloadImage(data.image_link, imgPath);
        imagePaths.push(imgPath);
      }

      /* ===== Combine grid ===== */
      const imgs = await Promise.all(imagePaths.map(loadImage));
      const w = imgs[0].width;
      const h = imgs[0].height;

      const canvas = createCanvas(w * 2, h * 2);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(imgs[0], 0, 0, w, h);
      ctx.drawImage(imgs[1], w, 0, w, h);
      ctx.drawImage(imgs[2], 0, h, w, h);
      ctx.drawImage(imgs[3], w, h, w, h);

      const combinedPath = path.join(cacheDir, `fastx_grid_${Date.now()}.jpg`);
      fs.writeFileSync(combinedPath, canvas.toBuffer("image/jpeg"));

      await output.unsend(waitMsg.messageID);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      const msg = await output.reply({
        body: `${UNISpectra.standardLine}
❏ U1   U2
❏ U3   U4
⏱ ${duration}s
${UNISpectra.standardLine}`,
        attachment: fs.createReadStream(combinedPath),
      });

      input.setReply(msg.messageID, {
        key: "fastx",
        id: userID,
        images: imagePaths,
      });
    } catch (err) {
      await output.unsend(waitMsg.messageID);
      output.reply(t("failed"));
    }
  }
);

/* ================= REPLY ================= */

export async function reply({
  input,
  output,
  repObj,
  langParser,
}: CommandContext & {
  repObj: {
    id: string;
    images: string[];
  };
}) {
  const t = langParser.createGetLang(langs);
  if (input.senderID !== repObj.id) return;

  const choice = input.body.toLowerCase();
  const map: Record<string, number> = {
    u1: 0,
    u2: 1,
    u3: 2,
    u4: 3,
  };

  if (!(choice in map)) return output.reply(t("invalid"));

  await output.reply({
    attachment: fs.createReadStream(repObj.images[map[choice]]),
  });
}
