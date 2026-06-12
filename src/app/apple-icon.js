import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1d1812 0%, #0a0805 100%)",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 110,
            fontStyle: "italic",
            letterSpacing: "-6px",
            background: "linear-gradient(to bottom, #f3c187, #d4884d)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          NS
        </div>
      </div>
    ),
    size,
  );
}
