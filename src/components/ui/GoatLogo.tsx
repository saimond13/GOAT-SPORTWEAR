export function GoatLogo({ size = 32, variant = "black" }: { size?: number; variant?: "black" | "white" }) {
  const bg = variant === "black" ? "black" : "rgba(255,255,255,0.1)";
  const stroke = variant === "black" ? "black" : "white";
  const fill = variant === "black" ? "white" : "white";
  const eyeFill = "black";
  const noseFill = variant === "black" ? "#e0e0e0" : "#cccccc";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill={bg} stroke={stroke} strokeWidth="2"/>
      <g fill={fill}>
        <ellipse cx="50" cy="52" rx="18" ry="20" />
        <path d="M36 38 C30 28 24 22 28 16 C30 22 34 28 38 35 Z" />
        <path d="M64 38 C70 28 76 22 72 16 C70 22 66 28 62 35 Z" />
        <ellipse cx="32" cy="46" rx="6" ry="4" transform="rotate(-20 32 46)" />
        <ellipse cx="68" cy="46" rx="6" ry="4" transform="rotate(20 68 46)" />
        <ellipse cx="43" cy="50" rx="3" ry="2.5" fill={eyeFill} />
        <ellipse cx="57" cy="50" rx="3" ry="2.5" fill={eyeFill} />
        <ellipse cx="50" cy="62" rx="6" ry="4" fill={noseFill} />
        <circle cx="47.5" cy="62" r="1.5" fill={eyeFill} />
        <circle cx="52.5" cy="62" r="1.5" fill={eyeFill} />
        <path d="M46 70 C46 76 48 80 50 82 C52 80 54 76 54 70 Z" />
      </g>
    </svg>
  );
}
