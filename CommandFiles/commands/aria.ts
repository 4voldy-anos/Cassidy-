import axios, { AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const API_URL = "https://haji-mix-api.gleeze.com/api/aria";

const cmd = easyCMD({
  name: "aria",
  meta: {
    otherNames: ["ariaai", "gleeze", "askaria"],
    author: "Christus dev AI",
    description: "Aria AI – Friendly assistant to find useful information",
    icon: "🤖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "Aria AI 🤖",
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

interface AriaResponse {
  user_ask: string;
  answer: string;
  usage?: string;
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
      "❓ Please provide a prompt for Aria AI.\n\nExample: aria Hello!"
    );
  }

  try {
    const params = {
      ask: prompt,
      stream: false,
    };

    const res: AxiosResponse<AriaResponse> = await axios.get(API_URL, {
      params,
      timeout: 20_000,
    });

    const answer =
      res.data?.answer || "⚠️ No response from Aria AI.";

    const form: StrictOutputForm = {
      body:
        `🤖 **Aria AI**\n\n` +
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
    console.error("Aria AI API Error:", err?.message || err);
    await output.reaction("🔴");
    cancelCooldown();
    return output.reply(
      `❌ Failed to connect to Aria AI.\n\nMessage: ${
        err?.message || "Unknown error"
      }`
    );
  }
}

export default cmd;
