// CommandFiles/commands/corean.ts

import { defineEntry } from "@cass/define";
import fs from "fs-extra";
import path from "path";
import axios from "axios";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "corean",
  description: "NSFW: Image coréenne sexy",
  author: "Christus dev AI",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "NSFW",
  role: 2,
  noPrefix: false,
  waitingTime: 5,
  otherNames: ["korean", "coreangirl"],
  icon: "🔞",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "Christus • Corean 🔥",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    error: "❌ Impossible de récupérer l'image depuis l'API.",
  },
};

/* ================= FETCH IMAGE ================= */

async function fetchCoreanImage() {
  const url = "https://christus-api.vercel.app/nsfw/corean";
  const response = await axios.get(url, { responseType: "arraybuffer" });

  const imgPath = path.join(
    __dirname,
    "cache",
    `corean_${Date.now()}.jpg`
  );

  await fs.ensureDir(path.dirname(imgPath));
  await fs.writeFile(imgPath, Buffer.from(response.data));

  return imgPath;
}

/* ================= ENTRY ================= */

export const entry = defineEntry(async ({ output, langParser }) => {
  const getLang = langParser.createGetLang(langs);

  try {
    const imgPath = await fetchCoreanImage();

    await output.reply({
      body: "🔞 | Voici une image coréenne pour toi 😏",
      attachment: fs.createReadStream(imgPath),
    });

    fs.unlinkSync(imgPath); // suppression après envoi
  } catch (err) {
    console.error(err);
    output.reply(getLang("error"));
  }
});
