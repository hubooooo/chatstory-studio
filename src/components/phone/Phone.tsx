import type { ReactNode } from "react";
import type { Story } from "../../schema/story";
import "./phone.css";
export function Phone({
  story: s,
  children,
}: {
  story: Story;
  children: ReactNode;
}) {
  const dark = s.theme.mode === "dark";
  return (
    <div
      data-testid="phone-canvas"
      style={{
        width: 1080,
        height: 1920,
        background: "#192b35",
        padding: s.device.frame ? 32 : 0,
        boxSizing: "border-box",
        fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
        fontSynthesis: "none",
        color: dark ? "#f3f4f6" : "#171b20",
      }}
    >
      <div
        style={{
          height: "100%",
          position: "relative",
          borderRadius: s.device.frame ? 78 : 0,
          overflow: "hidden",
          background: dark ? "#161b20" : s.theme.background,
          border: s.device.frame ? "8px solid #070b10" : "none",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: 124,
            display: "flex",
            alignItems: "center",
            padding: "0 50px",
            gap: 18,
            fontSize: 34,
            fontWeight: 600,
            background: dark ? "#161b20" : "#f7f7f7",
          }}
        >
          <span style={{ marginRight: "auto" }}>{s.status_bar.time}</span>
          <span
            style={{ display: "flex", alignItems: "end", gap: 4, height: 28 }}
          >
            {[1, 2, 3, 4].map((n) => (
              <i
                key={n}
                style={{
                  width: 7,
                  height: 6 + n * 5,
                  background:
                    n <= s.status_bar.signal ? "currentColor" : "#9995",
                }}
              />
            ))}
          </span>
          <span>{s.status_bar.network}</span>
          <span
            style={{
              border: "3px solid",
              borderRadius: 7,
              padding: "0 6px",
              fontSize: 24,
            }}
          >
            {s.status_bar.charging ? "ϟ " : ""}
            {s.status_bar.battery}%
          </span>
        </div>
        {s.device.platform === "ios" && s.device.cutout !== "none" && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: s.device.cutout === "island" ? 240 : 340,
              height: s.device.cutout === "island" ? 65 : 76,
              background: "#080c10",
              borderRadius: 40,
            }}
          />
        )}
        <div
          style={{
            height: 120,
            borderBottom: "1px solid #8883",
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            gap: 30,
            background: dark ? "#1c232a" : "#f7f7f7",
          }}
        >
          <span style={{ fontSize: 70 }}>‹</span>
          <strong style={{ fontSize: 43, flex: 1, textAlign: "center" }}>
            {s.title}
          </strong>
          <span style={{ fontSize: 45 }}>···</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 244,
            bottom: 178,
            left: 0,
            right: 0,
            overflow: "hidden",
            backgroundImage: s.theme.wallpaper
              ? `url(/${s.theme.wallpaper})`
              : undefined,
            backgroundSize: "cover",
          }}
        >
          {children}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            height: 120,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "0 30px",
            background: dark ? "#222a32" : "#f7f7f7",
            fontSize: 42,
          }}
        >
          <span>◉</span>
          <div
            style={{
              height: 70,
              borderRadius: 12,
              flex: 1,
              background: dark ? "#37404a" : "white",
            }}
          />
          <span>☺</span>
          <span>⊕</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            display: "grid",
            placeItems: "center",
            background: dark ? "#222a32" : "#f7f7f7",
          }}
        >
          {s.device.platform === "android" ? (
            <span style={{ fontSize: 26 }}>◁　　　　 ○　　　　 □</span>
          ) : (
            <div
              style={{
                width: 300,
                height: 10,
                borderRadius: 8,
                background: "currentColor",
              }}
            />
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 5,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 18,
          color: "#cad6dd",
        }}
      >
        虚构聊天 · ChatStory Studio
      </div>
    </div>
  );
}
