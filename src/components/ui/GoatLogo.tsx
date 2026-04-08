import Image from "next/image";

export function GoatLogo({
  size = 32,
  variant = "black",
}: {
  size?: number;
  variant?: "black" | "white";
}) {
  // height is auto-calculated keeping the original aspect ratio (6250x4419 ≈ 1.41:1)
  const height = Math.round(size / 1.41);

  return (
    <Image
      src="/logo.png"
      alt="GOAT Sportwear"
      width={size}
      height={height}
      style={{
        filter: variant === "black" ? "brightness(0)" : "brightness(0) invert(1)",
        objectFit: "contain",
      }}
      priority
    />
  );
}
