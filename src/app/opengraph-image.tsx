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
          background: "#070A0F",
          color: "#F4F7FA",
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
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
              <path
                d="M30.5 14.5a17.5 17.5 0 1 0 0 35"
                stroke="#F4F7FA"
                strokeLinecap="round"
                strokeWidth="6.5"
              />
              <path
                d="M38 14.5v30h15"
                stroke="#F4F7FA"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="6.5"
              />
              <path
                d="M47 52.5h11"
                stroke="#2F8FFF"
                strokeLinecap="round"
                strokeWidth="4.5"
              />
            </svg>
            <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: "0.11em" }}>
              CANTEROLAB
            </span>
          </div>
          <span style={{ color: "#7f8b97", fontFamily: "monospace", fontSize: 18 }}>
            cantero@lab:~
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <span
            style={{
              color: "#62AEFF",
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
