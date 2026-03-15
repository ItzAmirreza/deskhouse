import type { CSSProperties } from "react";

interface UserAvatarProps {
  photoUrl: string | null | undefined;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
}

const sizes = {
  sm: 32,
  md: 44,
  lg: 72,
} as const;

const fontSizes = {
  sm: 12,
  md: 16,
  lg: 26,
} as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Deterministic hue from a name string. */
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export default function UserAvatar({ photoUrl, name, size = "md", className, style }: UserAvatarProps) {
  const px = sizes[size];
  const fs = fontSizes[size];
  const hue = nameToHue(name);

  const baseStyle: CSSProperties = {
    width: px,
    height: px,
    minWidth: px,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fs,
    fontWeight: 600,
    lineHeight: 1,
    userSelect: "none",
    ...style,
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={className}
        style={{
          ...baseStyle,
          objectFit: "cover",
        }}
        draggable={false}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        background: `hsl(${hue}, 45%, 35%)`,
        color: `hsl(${hue}, 30%, 85%)`,
        letterSpacing: size === "sm" ? -0.5 : 0,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
