import { useMemo } from "react";

const CODE_CHARS = [
  "<",
  ">",
  "/",
  "{",
  "}",
  "(",
  ")",
  ";",
  "=",
  "+",
  "-",
  "*",
  "&",
  "|",
  "!",
  "?",
  "#",
  "@",
  "$",
  "%",
  "^",
  "~",
  "`",
  "[",
  "]",
  ":",
  ".",
  ",",
  "0",
  "1",
];

const generateCodeLines = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    chars: Array.from(
      { length: Math.floor(Math.random() * 15) + 5 },
      () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join(""),
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    size: Math.random() * 0.5 + 0.6,
  }));

export default function AnimatedBackground({ density = 25 }) {
  const codeLines = useMemo(() => generateCodeLines(density), [density]);

  return (
    <>
      <div className="app-gradient-bg" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {codeLines.map((line) => (
          <div
            key={line.id}
            className="absolute font-mono whitespace-nowrap code-glitter"
            style={{
              top: `${line.top}%`,
              left: `${line.left}%`,
              fontSize: `${line.size}rem`,
              animationDuration: `${line.duration}s`,
              animationDelay: `${line.delay}s`,
            }}
          >
            {line.chars}
          </div>
        ))}
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
    </>
  );
}
