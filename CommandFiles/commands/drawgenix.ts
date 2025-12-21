import axios from "axios";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "drawgenix",
  aliases: [],
  author: "RIFAT (edited by Saim) • TS fixed by Christus",
  version: "1.0.0",
  description: "Generate AI images from text using optional models",
  category: "AI",
  usage: "{prefix}{name} <prompt> [--model]",
  role: 2,
  waitingTime: 10,
  icon: "🎨",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🎨 Christus • Drawgenix",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noPrompt: "❌ | Please provide a prompt.",
    generating: "🎨 Generating image, please wait...",
    failed: "❌ | Failed to generate image.",
  },
};

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ input, output, args, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) return output.reply(t("noPrompt"));

    let prompt = args.join(" ");
    let model = "";

    // Detect model flag
    const modelMatch = prompt.match(/--(\w+)/);
    if (modelMatch) {
      model = modelMatch[1];
      prompt = prompt.replace(`--${model}`, "").trim();
    }

    const apiUrl = `https://mj-s6wm.onrender.com/draw?prompt=${encodeURIComponent(
      prompt
    )}${model ? `&model=${model}` : ""}`;

    const waitMsg = await output.reply(
      `${t("generating")}\n📌 Prompt: ${prompt}\n${
        model ? `🧠 Model: ${model}` : "🤖 Model: Default"
      }`
    );

    try {
      const { data } = await axios.get(apiUrl);
      const images: string[] = data?.images;

      if (!images || images.length === 0) throw new Error("No image returned");

      const imgStream = await global.utils.getStreamFromURL(images[0]);

      await output.unsend(waitMsg.messageID);

      await output.reply({
        body: `✅ Image generated successfully!\n${UNISpectra.standardLine}`,
        attachment: imgStream,
      });
    } catch (err) {
      console.error("Drawgenix Error:", err);
      await output.unsend(waitMsg.messageID);
      output.reply(t("failed"));
    }
  }
);
