import { describe, it, expect } from "vitest";
import { parseStory } from "../src/schema/story";
import { durationFrames, timeline, scrollAt } from "../src/timeline";
import fs from "node:fs";
const demo = () => JSON.parse(fs.readFileSync("examples/demo-a.json", "utf8"));
describe("Schema and frame contract", () => {
  it("rejects remote CSS backgrounds and invalid clock time", () => {
    const a = demo();
    a.theme.background = "url(https://example.com/private)";
    expect(() => parseStory(a)).toThrow();
    const b = demo();
    b.status_bar.time = "99:99";
    expect(() => parseStory(b)).toThrow();
  });
  it("accepts three runnable examples", () => {
    for (const file of ["demo-a", "demo-b", "demo-c"])
      expect(
        parseStory(JSON.parse(fs.readFileSync(`examples/${file}.json`, "utf8")))
          .schema_version,
      ).toBe("1.0");
  });
  it("reports unknown sender with path", () => {
    const s = demo();
    s.messages[0].sender_id = "missing";
    expect(() => parseStory(s)).toThrow("messages.0.sender_id");
  });
  it("rejects duplicate IDs", () => {
    const s = demo();
    s.messages[1].id = s.messages[0].id;
    expect(() => parseStory(s)).toThrow("重复");
  });
  it("rejects remote and escaping assets", () => {
    for (const p of [
      "../private.png",
      "C:/private.png",
      "https://example.com/x.png",
      "/private.png",
    ]) {
      const s = demo();
      s.messages[0].asset_path = p;
      expect(() => parseStory(s)).toThrow("相对路径");
    }
  });
  it("rejects incorrect output format", () => {
    const s = demo();
    s.render_settings.fps = 25;
    expect(() => parseStory(s)).toThrow();
  });
  it("has frame exact lead in and waits", () => {
    const s = parseStory(demo());
    s.messages[0].wait_before_ms = 100;
    expect(timeline(s)[0].start).toBe(18);
  });
  it("keeps stable ordering for ties", () => {
    const s = parseStory(demo());
    s.messages[1].appear_at_ms = 0;
    expect(
      timeline(s)
        .slice(0, 2)
        .map((e) => e.index),
    ).toEqual([0, 1]);
  });
  it("holds full actual audio plus tail", () => {
    const s = parseStory(demo());
    s.messages[9].audio_duration_ms = 9000;
    expect(durationFrames(s)).toBe(timeline(s)[9].start + 270 + 36);
  });
  it("repeats deterministic timeline and scrolling", () => {
    const s = parseStory(demo());
    expect(timeline(s)).toEqual(timeline(structuredClone(s)));
    expect(scrollAt(s, 300)).toBeGreaterThan(0);
    expect(scrollAt(s, 300)).toBe(scrollAt(structuredClone(s), 300));
  });
  it("does not scroll messages with auto_scroll off", () => {
    const s = parseStory(demo());
    s.messages.forEach((m) => (m.auto_scroll = false));
    expect(scrollAt(s, 300)).toBe(0);
  });
});
