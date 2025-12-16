// @ts-check

/**
 * @type {CommandMeta}
 */
export const meta = {
  name: "googleimage",
  description: "🔍 Recherche des images sur Google",
  author: "Aesther x Christus typeScript version",
  version: "1.0.0",
  usage: "{prefix}{name} <mot-clé> [nombre]",
  category: "Image",
  permissions: [0],
  waitingTime: 5,
  otherNames: [],
  icon: "🖼",
  noWeb: true,
};

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { defineEntry } from "@cass/define";

export const entry = defineEntry(async ({ args, output }) => {
  const query = args[0];
  if (!query) return output.reply("❌ Veuillez entrer un mot-clé pour la recherche.");

  const limit = Math.min(parseInt(args[1]) || 4, 20); // par défaut 4, max 20
  const apiUrl = `https://archive.lick.eu.org/api/search/googleimage?query=${encodeURIComponent(query)}`;

  await output.react("⏳");

  try {
    const res = await axios.get(apiUrl, { timeout: 30000 });
    if (!res.data.status) {
      await output.react("❌");
      return output.reply("❌ Erreur lors de la récupération des images.");
    }

    const results = res.data.result.slice(0, limit);
    if (results.length === 0) {
      await output.react("❌");
      return output.reply("❌ Aucune image trouvée.");
    }

    const attachments: Array<NodeJS.ReadableStream> = [];
    for (let i = 0; i < results.length; i++) {
      const imgData = await axios.get(results[i], { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "tmp", `google_${Date.now()}_${i}.jpg`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, imgData.data);
      attachments.push(fs.createReadStream(filePath));
    }

    await output.reply({
      body: `🖼 Résultats pour : "${query}"`,
      attachment: attachments
    });

    await output.react("✅");

    // Nettoyage des fichiers
    for (const file of attachments) {
      fs.unlink(file.path).catch(() => null);
    }
  } catch (err) {
    console.error("Google Command Error:", err);
    await output.react("❌");
    output.reply("❌ Une erreur est survenue lors de la recherche.");
  }
});
