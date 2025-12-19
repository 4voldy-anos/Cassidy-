// CommandFiles/commands/waifu.ts

import axios from "axios";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "waifu",
  aliases: ["wf"],
  author: "Christus dev AI",
  version: "1.0.0",
  description: "Get random waifu images",
  category: "Image",
  usage: "{prefix}{name} [type] [category]",
  role: 0,
  waitingTime: 5,
  icon: "🧸",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🧸 Christus • Waifu",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    loading: "🧸 Fetching waifu image...",
    fail: "❌ Failed to fetch waifu image.",
  },
};

/* ================= CONSTANT ================= */

const API_BASE = "https://nil-apidocs.dev.tc/api/waifu";

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ input, output, args, langParser }) => {
    const t = langParser.createGetLang(langs);

    // Defaults
    const type = args[0] || "sfw";
    const category = args[1] || "waifu";

    const url = `${API_BASE}?type=${encodeURIComponent(
      type
    )}&category=${encodeURIComponent(category)}`;

    try {
      const loadingMsg = await output.reply(t("loading"));

      const { data } = await axios.get(url);

      const imageUrl =
        data?.url || data?.data?.url;

      if (!imageUrl) throw new Error("No image URL");

      await output.reply({
        body: `${UNISpectra.charm} Type: ${type}\n${UNISpectra.charm} Category: ${category}`,
        attachment: await global.utils.getStreamFromURL(imageUrl),
      });

      if (loadingMsg?.messageID) {
        output.unsend(loadingMsg.messageID);
      }
    } catch (err) {
      console.error(err);
      output.reply(t("fail"));
    }
  }
);
