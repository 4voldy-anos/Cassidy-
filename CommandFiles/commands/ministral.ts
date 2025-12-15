import axios, { AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const API_URL = "https://zetbot-page.onrender.com/api/ministral";

const cmd = easyCMD({
  name: "ministral",
  meta: {
    otherNames: ["min", "chris-min", "minai"],
    author: "Christus",
    description: "Ministral AI – Zetsu-powered assistant for advanced messages",
    icon: "📝",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "Ministral AI 📝",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  run(ctx) {
    return main(ctx);
  },
});

interface MinistralResponse {
  operator: string;
  success: boolean;
  response?: string;
}

async function main({
  output,
  args,
  input,
  cancelCooldown,
}: CommandContext & { uid?: string }) {
  const prompt = args.join(" ").trim();
  await output.reaction("🟡");

  if (!prompt) {
    cancelCooldown();
    await output.reaction("🔴");
    return output.reply(
      "❓ Please provide a message for Ministral AI.\n\nExample: ministral Hello!"
    );
  }

  try {
    const params = {
      prompt,
      uid: input.sid,
    };

    const res: AxiosResponse<MinistralResponse> = await axios.get(API_URL, {
      params,
      timeout: 20_000,
    });

    const answer =
      res.data?.response || "⚠️ No response from Ministral AI.";

    const form: StrictOutputForm = {
      body:
        `📝 **Ministral AI**\n\n` +
        `${answer}\n\n` +
        `***Reply to continue the conversation.***`,
    };

    await output.reaction("🟢");
    const info = await output.reply(form);

    // 🔁 Conversation continue
    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({
        ...rep,
        args: rep.input.words,
      });
    });
  } catch (err: any) {
    console.error("Ministral AI API Error:", err?.message || err);
    await output.reaction("🔴");
    cancelCooldown();
    return output.reply(
      `❌ Failed to connect to Ministral AI.\n\nMessage: ${
        err?.message || "Unknown error"
      }`
    );
  }
}

export default cmd;
