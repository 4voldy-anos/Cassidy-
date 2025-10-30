import { parseBet } from "@cass-modules/ArielUtils";
import { BriefcaseAPI } from "@cass-modules/BriefcaseAPI";
import {
  ArmorInventoryItem,
  ChequeItem,
  InventoryItem,
  WeaponInventoryItem,
} from "@cass-modules/cassidyUser";
import { Datum } from "@cass-modules/Datum";
import { Inventory } from "@cass-modules/InventoryEnhanced";
import { UNISpectra } from "@cassidy/unispectra";

export const meta: CommandMeta = {
  name: "communityshop",
  description:
    "Request, approve, buy, sell your and the community's custom items!",
  author: "Liane Cagara",
  version: "1.0.0",
  category: "Shopping",
  role: 0,
  waitingTime: 1,
  otherNames: ["comshop", "requestitem", "reqitem", "cshop", "csh"],
  shopPrice: 1000000,
  requirement: "4.0.0",
  icon: "👥",
  cmdType: "cplx_g",
  isGame: true,
};

export const globalKey = "COMSHOP";
export const propKey = "comshop";

export const style: CommandStyle = {
  title: "Community Shop 👥",
  titleFont: "bold",
  contentFont: "none",
};

export type RequestInvItem = InventoryItem & {
  shopPrice: number;
  priceType?: "money" | "gem";
  authorID?: string;
  submissionDate?: number;
};

export const itemTemplate: {
  category: string;
  guide: string;
  data: RequestInvItem;
}[] = [
  {
    guide: `Create your custom pet, keep in mind that the key is the most important here and the sellPrice, the key is for foods like if the key is "uwu" then the food type must be "uwu_food", the sellPrice reflects stats, higher sellPrice means higher hp and stats.`,
    category: "pet",
    data: {
      name: "Donkey",
      icon: "🫏",
      key: "donkey",
      shopPrice: 12999,
      sellPrice: 4500,
      flavorText: "Uncage for a new donkey pet!",
      type: "pet",
    } satisfies RequestInvItem,
  },
  {
    guide: `Generic items have no actual use on their own but some commands might require them or use them. The item interpretation depends on the command file.`,
    category: "generic",
    data: {
      name: "Negative Roll Pass",
      icon: "🎴",
      key: "negaRollPass",
      shopPrice: 6900000000000,
      sellPrice: 0,
      flavorText: "Allows you to have negative bets (jk)",
      type: "generic",
    } satisfies RequestInvItem,
  },
  {
    guide: `Potions are actually useless and just here for the sake of trolling, but you could actually make one.`,
    category: "potion",
    data: {
      name: "Water Breathing Potion",
      icon: "🧪🫧",
      key: "waterPotion",
      sellPrice: 1000000,
      shopPrice: 10000000,
      flavorText:
        "The potion allows your pet to live underwater forever and leave you.",
      type: "potion",
    } satisfies RequestInvItem,
  },
  {
    guide: `Self explanatory, atk will be the attack stat (not exactly the damage but depends on atk stat) and also def and magic stat.`,
    category: "weapon",
    data: {
      name: "Foamblade",
      icon: "🧽",
      key: "foamBlade",
      sellPrice: 1000000,
      shopPrice: 10000000,
      flavorText: "A soft but decently sharp sword for your pet.",
      type: "weapon",
      atk: 15,
      def: 1,
      magic: 0,
    } satisfies WeaponInventoryItem & RequestInvItem,
  },
  {
    guide: `An item with money tied on it. the chequeAmount must be the reward money when used.`,
    category: "cheque",
    data: {
      name: "Idk Custom Cheque",
      icon: "✨💰",
      key: "chequeIdk",
      sellPrice: 1000000,
      shopPrice: 10000000,
      flavorText: "A custom cheque maybe",
      type: "cheque",
      chequeAmount: 9000000,
    } satisfies ChequeItem & RequestInvItem,
  },
  {
    guide: `Self explanatory, def will be the defense stat (not exactly the damage reduction but depends on def stat) and also atk and magic stat.`,
    category: "armor",
    data: {
      name: "Hexagon Plate",
      icon: "🛡️",
      key: "hexaPlate",
      sellPrice: 1000000,
      shopPrice: 10000000,
      flavorText: "Geometrical Gear for damage reduction.",
      type: "armor",
      atk: 5,
      def: 23,
      magic: 0,
    } satisfies ArmorInventoryItem & RequestInvItem,
  },
  {
    guide: `Self explanatory, the saturation is actually the milliseconds of how long the pet will be full. Do not change the type, unless you want a pet food like "cat_food" or "dog_food"`,
    category: "anypet_food",
    data: {
      name: "Sweet Berries",
      icon: "🍒",
      key: "sweetBerries",
      sellPrice: 50000,
      shopPrice: 100000,
      flavorText: "Really expensive berries for any pet.",
      saturation: 6 * 60 * 1000,
      type: "anypet_food",
    },
  },
  {
    guide: `Warning, this is actually deprecated, but you can make a "food" item that works to any pet, it does not heal because the heal attribute gets converted to satuation (random range).`,
    category: "food",
    data: {
      name: "Sweet Berries",
      icon: "🍒",
      key: "sweetBerries",
      sellPrice: 50000,
      shopPrice: 100000,
      flavorText: "Really expensive berries with random result",
      heal: 100,
      type: "food",
    },
  },
  {
    category: "zip",
    guide: `This is an item, with zipContents that also contains an item, self explanatory. All zipContents have 100% chance to be redeemed.`,
    data: {
      name: "Example Pack",
      key: "examplePack",
      icon: "❓🎴",
      flavorText: "Open this example pack for something.",
      type: "zip",
      sellPrice: 1000,
      shopPrice: 10000,
      zipContents: [
        {
          name: "Example reward food 1",
          key: "exampleReward",
          icon: "✨",
          flavorText: "This is the reward maybe",
          type: "anypet_food",
          saturation: 5 * 60 * 1000,
        },
        {
          name: "Example reward food 2",
          key: "exampleReward2",
          icon: "✨",
          flavorText: "This is the reward maybe",
          type: "anypet_food",
          saturation: 5 * 60 * 1000,
        },
        {
          name: "Example reward food 3",
          key: "exampleReward3",
          icon: "✨",
          flavorText: "This is the reward maybe",
          type: "anypet_food",
          saturation: 5 * 60 * 1000,
        },
      ],
    },
  },
];

const home = new BriefcaseAPI(
  {
    isHypen: false,
    inventoryKey: "myreqitem",
    inventoryName: "My Request",
    inventoryIcon: "📤",
    inventoryLimit: Cassidy.invLimit,
    showCollectibles: false,
    showAdminFeat: false,
    ignoreFeature: ["top", "all", "trade", "sell", "use", "transfer"],
  },
  [
    {
      key: "template",
      description: "Get an item template by category.",
      aliases: ["temp", "tmp"],
      args: ["<category>"],
      async handler({ output }, extra, bc) {
        const cat = extra.spectralArgs[0];
        const item = itemTemplate.find(
          (i) => `${i.category}`.toLowerCase() === `${cat || ""}`.toLowerCase()
        );
        if (!cat || !item) {
          return output.reply(
            `📄 Please provide the template category ID as argument, here are the categories:\n\n${itemTemplate
              .map(
                (i) =>
                  `${UNISpectra.disc} "${i.category}" - ${bc.listItem(i.data)}`
              )
              .join("\n")}`
          );
        }
        return output.reply(
          `📄 **${cat.toTitleCase()}**\n\n💡 **Guide:**\nThe key is the item ID for typing, name is the item name for listing, icon is the item emoji, flavorText is the item description. Sell price is briefcase sell price (must be lower than half of it's shop price), shop price is the price in the community shop.\n${
            item.guide
          }\n\n**Preview:**\n${bc.listItem(
            item.data
          )}\n\n**Customize this JSON DATA**:\n\n${JSON.stringify(
            item.data,
            null,
            2
          )}`
        );
      },
    },
    {
      key: "getjson",
      description: "Extract the JSON of an item from your inventory.",
      args: ["<item_key>"],
      async handler({ output }, { spectralArgs }, { userData }) {
        const key = spectralArgs[0];
        const head = `👤 **${userData.name || "Unregistered"}**\n\n`;

        if (!key) {
          return output.reply(
            head +
              `Please provide the **item key** of an item from your inventory to get the JSON data.`
          );
        }
        const local = new Inventory(userData.inventory);
        const item = local.getOne(key);
        if (!item) {
          return output.reply(
            head + `Item with key "${key}" does **not** exist.`
          );
        }
        return output.reply(
          head +
            `📄 Here is the requested **JSON Data**\n\n${JSON.stringify(
              item,
              null,
              2
            )}`
        );
      },
    },
    {
      key: "submit",
      description: "Submit a JSON of your requested item.",
      args: ["<json data>"],
      async handler(
        { output, usersDB, input },
        { spectralArgs },
        { userData, inventory, iKey, listItem }
      ) {
        const head = `👤 **${userData.name || "Unregistered"}**\n\n`;
        if (inventory.size() >= inventory.limit) {
          return output.reply(
            head + `❌ Your request item inventory is **full**! Toss something.`
          );
        }
        const json = spectralArgs.join(" ");
        const validation = validateItemSubmission(json);
        const rej = `${UNISpectra.disc} ❌ Your submission has been automatically rejected.\n\n💬 **Feedback**:`;

        if (validation.success === false) {
          return output.reply(head + `${rej}\n${validation.err}`);
        }
        const item = validation.item;
        if (inventory.has(item.key)) {
          return output.reply(
            head +
              `${rej}\nItem with the key of "${item.key}" already exists in your requested items, you might consider tossing it, or using a different item key.`
          );
        }
        inventory.addOne(item);
        await usersDB.setItem(input.senderID, {
          [iKey]: Array.from(inventory),
        });
        return output.reply(
          head +
            `${
              UNISpectra.disc
            } ✅ Your submission has been successful. Please wait for the **admin approval**.\n\n${listItem(
              item
            )}\n${UNISpectra.charm} ${item.flavorText}\n\n${JSON.stringify(
              item,
              null,
              2
            )}\n\n💡 **Tip**: If you want to undo the submission, simply toss the item. You can list all submitted items.`
        );
      },
    },
  ]
);

export function validateItemSubmission(itemStr: string | RequestInvItem):
  | {
      success: true;
      item: RequestInvItem;
    }
  | { success: false; err: string } {
  let item: RequestInvItem;
  if (typeof itemStr === "string") {
    try {
      item = JSON.parse(itemStr);
    } catch (error) {
      return {
        success: false,
        err: `JSON Parsing failed: ${error.message}`,
      };
    }
  } else {
    item = itemStr;
  }
  const keys = Object.keys(item);
  const required = ["name", "key", "icon", "flavorText", "type", "shopPrice"];
  if (item.type === "armor") {
    required.push("def");
  }
  if (item.type === "weapon") {
    required.push("atk");
  }
  if (item.type === "food") {
    required.push("heal");
  }
  if (item.type?.endsWith("_food")) {
    required.push("saturation");
  }
  if (item.type === "zip") {
    required.push("zipContents");
  }
  if (item.type === "pet") {
    required.push("sellPrice");
  }
  const missing = required.filter((r) => !keys.includes(r));
  if (missing.length > 0) {
    return {
      success: false,
      err: `Missing properties:\n${missing.join(", ")}`,
    };
  }
  item.name = `${item.name}`;
  item.key = `${item.key}`;
  item.flavorText = `${item.flavorText}`;
  item.icon = `${item.icon}`;
  if (!/^[a-zA-Z0-9_]+$/.test(item.key)) {
    return {
      success: false,
      err: `Item key must only contain letters, numbers, and underscore.`,
    };
  }
  item.icon = [...item.icon.matchAll(/\p{Emoji}/gu)]
    .map((i) => i[0])
    .slice(0, 2)
    .join("\n");
  if (item.icon.length === 0) {
    return {
      success: false,
      err: "Item icon must not be empty, and must be 1-2 emojis",
    };
  }
  if (item.key.length === 0) {
    return {
      success: false,
      err: "Item key must not be empty",
    };
  }
  if (item.name.length === 0) {
    return {
      success: false,
      err: "Item name must not be empty",
    };
  }
  if (item.flavorText.length === 0) {
    return {
      success: false,
      err: "Item flavorText must not be empty",
    };
  }
  if (item.flavorText.length > 100) {
    return {
      success: false,
      err: "Item flavorText must not be longer than 100 characters.",
    };
  }
  if (item.name.length > 20) {
    return {
      success: false,
      err: "Item name must not be longer than 20 characters.",
    };
  }
  if (item.key.length > 20) {
    return {
      success: false,
      err: "Item key must not be longer than 20 characters.",
    };
  }
  item.shopPrice = Number(item.shopPrice) || 0;
  item.sellPrice = Number(item.shopPrice) || 0;
  if (item.shopPrice <= 0) {
    return {
      success: false,
      err: "Shop Price must be higher than zero.",
    };
  }
  if (item.sellPrice < 0) {
    return {
      success: false,
      err: "Sell Price must be higher or equal than zero.",
    };
  }
  if (item.sellPrice > item.shopPrice / 2) {
    return {
      success: false,
      err: "Sell Price must not be higher than half of the shop price.",
    };
  }

  if (item.type === "armor" || item.type === "weapon") {
    item.atk = Number(item.atk) || 0;
    item.def = Number(item.def) || 0;
    item.magic = Number(item.magic) || 0;
    if (item.type === "weapon" && Number(item.atk) <= 0) {
      return {
        success: false,
        err: `For weapons, the atk stat must exist and must not be lower or equal to zero.`,
      };
    }
    if (item.type === "armor" && Number(item.def) <= 0) {
      return {
        success: false,
        err: `For armors, the def stat must exist and must not be lower or equal to zero.`,
      };
    }
  }

  if (item.type === "food") {
    item.heal = Number(item.heal) || 0;
    if (Number(item.heal) <= 0) {
      return {
        success: false,
        err: `Item heal for food must not be lower or equal to zero.`,
      };
    }
  }
  if (item.type?.endsWith("_food")) {
    item.saturation = Number(item.saturation) || 0;
    if (Number(item.saturation) <= 0) {
      return {
        success: false,
        err: `Item saturation for food must not be lower or equal to zero.`,
      };
    }
  }

  if (item.type === "zip") {
    item.zipContents = Array.isArray(item.zipContents) ? item.zipContents : [];
    if ((item.zipContents as any[]).length === 0) {
      return {
        success: false,
        err: `Zip items must have zipContents as array.`,
      };
    }
    let i = 0;

    for (const zipI of item.zipContents as RequestInvItem[]) {
      i++;
      const vali = validateItemSubmission(zipI);
      if (vali.success === false) {
        return {
          success: false,
          err: `(Zip Content #${i}): ${vali.err}`,
        };
      }
    }
  }

  if (item.type === "cheque") {
    item.chequeAmount = Number(item.chequeAmount) || 0;
    if (Number(item.chequeAmount) <= 0) {
      return {
        success: false,
        err: `The chequeAmount must be higher than zero.`,
      };
    }
  }

  item.uuid = Inventory.generateUUID();

  return {
    success: true,
    item,
  };
}

export async function entry(ctx: CommandContext) {
  home.runInContext(ctx);
}
