import axios from "axios";

const supportedDomains = [
  "facebook.com",
  "fb.watch",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "instagram.com",
  "instagr.am",
  "likee.com",
  "likee.video",
  "capcut.com",
  "spotify.com",
  "terabox.com",
  "twitter.com",
  "x.com",
  "drive.google.com",
  "soundcloud.com",
  "ndown.app",
  "pinterest.com",
  "pin.it",
];

export const meta: CommandMeta = {
  name: "autodl",
  description:
    "Automatically downloads media from multiple platforms (Facebook, YouTube, TikTok, Instagram, Twitter/X, Spotify, etc.)",
  version: "2.0.0",
  author: "Christus dev AI",
  icon: "📥",
  category: "Utility",
  role: 0,
  noWeb: true,
};

export const style: CommandStyle = {
  title: "📥 Auto Downloader",
  titleFont: "bold",
  contentFont: "fancy",
};

function detectPlatform(url: string): string {
  const domain =
    supportedDomains.find((d) => url.includes(d)) ?? "Unknown Platform";
  return domain
    .replace(/(\.com|\.app|\.video|\.net)/gi, "")
    .toUpperCase();
}

export async function entry({
  output,
  input,
  threadsDB,
  args,
}: CommandContext) {
  const isEnabled =
    (await threadsDB.queryItem(input.threadID, "autodl"))?.autodl ?? true;

  const choice =
    args[0] === "on"
      ? true
      : args[0] === "off"
      ? false
      : !isEnabled;

  await threadsDB.setItem(input.threadID, {
    autodl: choice,
  });

  return output.reply(
    `📥 Auto Downloader ${choice ? "enabled ✅" : "disabled ❌"}`
  );
}

export async function event({
  output,
  input,
  threadsDB,
}: CommandContext) {
  try {
    const cache = await threadsDB.getCache(input.threadID);
    if (cache.autodl === false) return;

    const content = String(input).trim();
    if (!content.startsWith("https://")) return;
    if (!supportedDomains.some((d) => content.includes(d))) return;

    output.react("⌛");

    const API = `https://xsaim8x-xxx-api.onrender.com/api/auto?url=${encodeURIComponent(
      content
    )}`;

    const res = await axios.get(API);
    if (!res.data) throw new Error("Empty API response");

    const mediaURL = res.data.high_quality || res.data.low_quality;
    if (!mediaURL) throw new Error("Media URL not found");

    const title = res.data.title ?? "Unknown Title";
    const platform = detectPlatform(content);

    await output.replyStyled(
      {
        body: `━━━━━━━━━━━━━━
𝐌𝐞𝐝𝐢𝐚 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 ✅
╭─╼━━━━━━━━╾─╮
│ Title      : ${title}
│ Platform   : ${platform}
│ Status     : Success
╰─━━━━━━━━━╾─╯
━━━━━━━━━━━━━━`,
        attachment: await global.utils.getStreamFromURL(mediaURL),
      },
      style
    );

    output.reaction("✅");
  } catch (err) {
    output.reaction("❌");
  }
}
