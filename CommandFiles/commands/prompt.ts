// @ts-check

/**
 * @type {CommandMeta}
 */
export const meta = {
  name: "prompt",
  description: "Generate prompt description from image",
  author: "Christus dev AI",
  version: "1.0.0",
  usage: "{prefix}{name} <imageUrl>",
  category: "AI",
  permissions: [0],
  waitingTime: 5,
  otherNames: ["p"],
  icon: "🖼️",
  noWeb: true,
};

import axios from "axios";
import { defineEntry } from "@cass/define";

export const entry = defineEntry(async ({ args, output, event, api }) => {
  let imageUrl = args[0];

  // Si l'utilisateur répond avec une image
  if (
    !imageUrl &&
    event.messageReply &&
    event.messageReply.attachments &&
    event.messageReply.attachments.length > 0
  ) {
    const attachment = event.messageReply.attachments[0];
    if (attachment.type === "photo" || attachment.type === "image") {
      imageUrl = attachment.url || attachment.previewUrl;
    }
  }

  if (!imageUrl) {
    return output.reply("⚠️ Veuillez fournir une URL d'image ou répondre à une image.");
  }

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  try {
    const response = await axios.get<any>(
      "https://estapis.onrender.com/api/ai/img2prompt/v8",
      { params: { imageUrl } }
    );

    if (!response.data || !response.data.description) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return output.reply("❌ Aucune description trouvée pour cette image.");
    }

    const { input_image_url, input_image_type, description } = response.data;

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    output.reply({
      body: `📌 Type: ${input_image_type}\n🌐 Source: ${input_image_url}\n\n📝 Description:\n${description}`,
      attachment: await global.utils.getStreamFromURL(imageUrl, "image.jpg"),
    });
  } catch (err: any) {
    console.error("Prompt Command Error:", err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    output.reply("❌ Une erreur est survenue lors de la génération de la description.");
  }
});
