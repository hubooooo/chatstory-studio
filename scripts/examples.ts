import fs from "node:fs/promises";
import { parseStory, storySchema } from "../src/schema/story";
import { z } from "zod";
import { initEffects } from "./media";
const chars = [
  {
    id: "lin",
    name: "小林",
    side: "left",
    color: "#bd8870",
    voice_id: "zh-CN-XiaoxiaoNeural",
  },
  {
    id: "zhou",
    name: "小周",
    side: "right",
    color: "#5a8192",
    voice_id: "zh-CN-YunxiNeural",
  },
  {
    id: "chen",
    name: "阿辰",
    side: "left",
    color: "#8e7baa",
    voice_id: "zh-CN-YunxiNeural",
  },
];
const story = (id: string, title: string, messages: unknown[]) =>
  parseStory({ project_id: id, title, characters: chars, messages });
const msg = (
  i: number,
  text: string,
  type = "text",
  sender = i % 2 ? "zhou" : "lin",
  ms = i * 800,
) => ({
  id: `m${i}`,
  sender_id: sender,
  type,
  text,
  appear_at_ms: ms,
  typing_ms: 300,
  sound_effect: i % 2 ? "send" : "receive",
});
await fs.mkdir("examples", { recursive: true });
await fs.mkdir("public/assets", { recursive: true });
const a = story("demo-a", "周末去看海", [
  msg(0, "周六 08:30", "time"),
  msg(1, "醒了吗？今天去看海！"),
  msg(2, "早就准备好了，背包都收拾好了。"),
  msg(3, "天气很好 ☀️"),
  msg(4, "那我们老地方见。"),
  msg(5, "到了给我发消息～"),
  msg(6, "没问题，See you soon!"),
  msg(7, "车票已经订好了", "card"),
  msg(8, "路上买早餐", "transfer"),
  msg(9, "出发啦！ 🌊"),
]);
const b = story("demo-b", "一份特别的惊喜", [
  msg(0, "今天有什么安排？"),
  msg(1, "我想带你去一个特别的地方。", "voice", "zhou", 1100),
  msg(2, "真的吗？我已经开始期待了。", "voice", "lin", 5000),
  msg(3, "带上相机，我们去看日落。", "text", "zhou", 9500),
  msg(4, "好，马上出门！", "text", "lin", 11000),
]);
const c = story("demo-c", "周末远行小分队", [
  msg(0, "周六 09:00", "time"),
  msg(1, "大家集合啦！"),
  {
    ...msg(2, "这是我画的路线图", "image", "chen"),
    asset_path: "assets/landscape.svg",
  },
  msg(
    3,
    "今天的计划：先沿着海边慢慢走，看看晨光照在水面上的样子。中午找一家小店吃饭，下午再去山顶，等一场日落。记得带水、防晒和好心情。",
  ),
  msg(4, "收到！我带了相机和充电宝。", "text", "chen"),
  msg(5, "收到 🌊 / Ready to go!"),
  msg(6, "给大家准备的小惊喜", "redpacket"),
  msg(7, "我们已经到了集合点。", "text", "chen"),
  msg(8, "刚刚发错了，哈哈", "recall"),
  msg(9, "所有人都已准备好", "system"),
  msg(10, "别急，旅途本身就是最好的风景。我们慢慢走，把今天的故事记录下来。"),
  msg(11, "出发！", "emoji", "chen"),
]);
for (const s of [a, b, c])
  await fs.writeFile(
    `examples/${s.project_id}.json`,
    JSON.stringify(s, null, 2),
  );
await fs.writeFile(
  "public/assets/landscape.svg",
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#d4e9e6"/><circle cx="640" cy="90" r="45" fill="#edbd70"/><path d="M0 290Q200 190 400 290T800 270V400H0" fill="#74adae"/><path d="M0 340Q200 260 400 350T800 320V400H0" fill="#397a87"/><path d="M120 300L280 170 400 300" fill="#65988b"/></svg>',
);
await fs.writeFile(
  "src/schema/story.schema.json",
  JSON.stringify(z.toJSONSchema(storySchema), null, 2),
);
await initEffects();
