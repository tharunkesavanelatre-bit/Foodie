import { ImageResponse } from "next/og";

export const alt = "Foodie | Discover Delicious Food";
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ea580c, #b91c1c)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 700 }}>Foodie</div>
        <div style={{ fontSize: 44, marginTop: 20 }}>
          Discover Delicious Food
        </div>
      </div>
    ),
    size
  );
}