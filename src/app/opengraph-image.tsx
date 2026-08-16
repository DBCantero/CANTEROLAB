import { ImageResponse } from "next/og";

export const alt = "CanteroLab — Código, dados e experiências do dia a dia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#070b10",
          color: "#f2f4f7",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #1c2732",
            paddingBottom: "28px",
          }}
        >
          <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: "0.11em" }}>
            CANTEROLAB<span style={{ color: "#258cf4" }}>_</span>
          </span>
          <span style={{ color: "#7f8b97", fontFamily: "monospace", fontSize: 18 }}>
            cantero@lab:~
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <span
            style={{
              color: "#64b5ff",
              fontFamily: "monospace",
              fontSize: 19,
              marginBottom: 18,
            }}
          >
            $ whoami
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 650,
              letterSpacing: "-0.045em",
              lineHeight: 1.08,
            }}
          >
            Código, dados e experiências do dia a dia.
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, color: "#a7b0ba", fontSize: 19 }}>
          <span>SQL Server</span>
          <span style={{ color: "#293744" }}>/</span>
          <span>Python</span>
          <span style={{ color: "#293744" }}>/</span>
          <span>C#</span>
          <span style={{ color: "#293744" }}>/</span>
          <span>.NET</span>
        </div>
      </div>
    ),
    size,
  );
}
