// CommandFiles/commands/flux.ts

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

export const meta: CommandMeta = {
  name: "flux",
  description: "Génère une image IA avec Flux AI",
  author: "Christus dev AI",
  version: "1.1.0",
  usage: "{prefix}flux <prompt>",
  category: "Image Generator",
  role: 0,
  waitingTime: 5,
  otherNames: [],
  icon: "🧠",
  noLevelUI: true,
};

export const style: CommandStyle = {
  title: "Flux • AI Image Generator ⚡",
  titleFont: "bold",
  contentFont: "fancy",
};

export const langs = {
  fr: {
    noPrompt:
      "⚠️ Veuillez fournir un prompt.\nExemple : {prefix}flux un chat mignon avec des lunettes",
    processing:
      "⚡ Génération de votre image Flux AI...\nVeuillez patienter...",
    success:
      "✅ Image Flux générée avec succès !\n\n📝 Prompt : \"{prompt}\"",
    error:
      "❌ Impossible de générer l'image Flux pour le moment. Réessayez plus tard.",
  },
  en: {
    noPrompt:
      "⚠️ Please provide a prompt.\nExample: {prefix}flux a cute cat with sunglasses",
    processing:
      "⚡ Generating your Flux AI image...\nPlease wait...",
    success:
      "✅ Flux image generated successfully!\n\n📝 Prompt: \"{prompt}\"",
    error:
      "❌ Unable to generate Flux image at the moment. Please try again later.",
  },
};

export const entry = defineEntry(
  async ({ args, output, langParser }) => {
    const getLang = langParser.createGetLang(langs);
    const prompt = args.join(" ").trim();

    if (!prompt) return output.reply(getLang("noPrompt"));

    const timestamp = moment()
      .tz("Asia/Manila")
      .format("MMMM D, YYYY h:mm A");

    const processingMsg = await output.reply(
      `${UNISpectra.charm} ${getLang("processing")}\n• 📅 ${timestamp}`
    );

    const encodedPrompt = encodeURIComponent(prompt);
    const imgPath = path.join(
      __dirname,
      "cache",
      `flux_${Date.now()}.png`
    );

    const apiURL = `https://aryapio.onrender.com/ai-image/flux?prompt=${encodedPrompt}&apikey=aryan123`;

    try {
      const response = await axios.get(apiURL, {
        responseType: "arraybuffer",
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, response.data);

      await output.unsend(processingMsg.messageID);

      await output.reply({
        body: getLang("success", { prompt }),
        attachment: fs.createReadStream(imgPath),
      });
    } catch (err) {
      console.error("Flux AI Error:", err);
      await output.unsend(processingMsg.messageID);
      await output.reply(getLang("error"));
    } finally {
      if (await fs.pathExists(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
);
