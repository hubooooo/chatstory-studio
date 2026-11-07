import { interpolate, staticFile } from "remotion";
import type { Story } from "../../schema/story";
import { timeline, scrollAt, rowHeight } from "../../timeline";
export function Conversation({
  story: s,
  frame,
}: {
  story: Story;
  frame: number;
}) {
  return (
    <div
      style={{
        padding: "25px 30px",
        transform: `translateY(-${scrollAt(s, frame)}px)`,
      }}
    >
      {timeline(s)
        .filter((e) => e.start <= frame)
        .map((e) => {
          const m = e.message,
            c = s.characters.find((c) => c.id === m.sender_id)!,
            right = c.side === "right",
            progress = interpolate(
              frame,
              [e.start, e.start + e.animation],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
          if (["system", "recall", "time"].includes(m.type))
            return (
              <div
                key={m.id}
                style={{
                  height: rowHeight(m),
                  textAlign: "center",
                  fontSize: 29,
                  color: "#858b92",
                  opacity: progress,
                }}
              >
                {m.type === "recall" ? `${c.name} 撤回了一条消息` : m.text}
              </div>
            );
          const speaking =
            m.type === "voice" &&
            frame < e.start + e.voiceFrames &&
            m.voice_mode === "auto";
          return (
            <div
              key={m.id}
              data-message-id={m.id}
              style={{
                height: rowHeight(m),
                display: "flex",
                flexDirection: right ? "row-reverse" : "row",
                gap: 22,
                opacity: progress,
                transform: `scale(${0.94 + 0.06 * progress})`,
                transformOrigin: right ? "right top" : "left top",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  flexShrink: 0,
                  background: c.color,
                  color: "white",
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 40,
                  overflow: "hidden",
                }}
              >
                {c.avatar ? (
                  <img
                    src={staticFile(c.avatar)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  c.name.slice(0, 1)
                )}
              </div>
              <div style={{ maxWidth: 700 }}>
                <div
                  style={{
                    fontSize: 26,
                    color: "#7d868c",
                    marginBottom: 9,
                    textAlign: right ? "right" : "left",
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    padding: "23px 28px",
                    background: right
                      ? "#a6e779"
                      : s.theme.mode === "dark"
                        ? "#303a43"
                        : "#fff",
                    color: right
                      ? "#152813"
                      : s.theme.mode === "dark"
                        ? "white"
                        : "#20272c",
                    borderRadius: 17,
                    fontSize: 39,
                    lineHeight: 1.4,
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                    boxShadow: "0 2px 3px #00000008",
                  }}
                >
                  {m.type === "image" ? (
                    <img
                      src={staticFile(m.asset_path!)}
                      style={{
                        width: 550,
                        height: 275,
                        objectFit: "cover",
                        borderRadius: 10,
                      }}
                    />
                  ) : m.type === "voice" ? (
                    <div
                      onClick={() => {
                        if (m.audio_path)
                          void new Audio(staticFile(m.audio_path)).play();
                      }}
                      style={{
                        width:
                          260 + Math.min(240, (m.audio_duration_ms ?? 0) / 70),
                        cursor: "pointer",
                      }}
                    >
                      {speaking
                        ? ["▂ ▄ ▆", "▃ ▆ █", "▂ ▄ ▆"][Math.floor(frame / 5) % 3]
                        : "◖ )))"}
                      　{Math.ceil((m.audio_duration_ms ?? 0) / 1000)}″
                    </div>
                  ) : m.type === "redpacket" ? (
                    <span style={{ color: "#b24120" }}>▣ 红包 · {m.text}</span>
                  ) : m.type === "transfer" ? (
                    <span style={{ color: "#b9631f" }}>⇄ 转账　{m.text}</span>
                  ) : m.type === "card" ? (
                    <span>▤ 名片 · {m.text}</span>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            </div>
          );
        })}
      {timeline(s)
        .filter(
          (e) =>
            frame < e.start &&
            frame >= e.start - Math.round(e.message.typing_ms * 0.03),
        )
        .slice(0, 1)
        .map((e) => (
          <div
            key={"typing" + e.index}
            style={{ fontSize: 30, color: "#76868c", padding: 20 }}
          >
            对方正在输入{".".repeat((Math.floor(frame / 10) % 3) + 1)}
          </div>
        ))}
    </div>
  );
}
