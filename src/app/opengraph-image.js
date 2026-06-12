import { ImageResponse } from "next/og";

export const alt = "nieshies' dump — moments, memories, real";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at center, #2a2018 0%, #13100c 60%, #0a0805 100%)",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 280,
            fontStyle: "italic",
            letterSpacing: "-12px",
            background: "linear-gradient(to bottom, #f3c187, #d4884d)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
            marginBottom: 48,
          }}
        >
          NS
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 44,
            color: "#ffffff",
            letterSpacing: "14px",
            textTransform: "uppercase",
            fontWeight: 300,
            fontFamily: "sans-serif",
          }}
        >
          nieshies' dump
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 18,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "10px",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          moments  ·  memories  ·  real
        </div>
      </div>
    ),
    size,
  );
}
