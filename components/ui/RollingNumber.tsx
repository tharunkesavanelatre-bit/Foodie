"use client";

import { useEffect, useState } from "react";

type RollingNumberProps = {
  value: number;
  prefix?: string;
  fractionDigits?: number;
  className?: string;
};

export default function RollingNumber({
  value,
  prefix = "",
  fractionDigits = 2,
  className = "",
}: RollingNumberProps) {
  const [animated, setAnimated] = useState(false);

  const safeValue = Math.max(
    0,
    Number.isFinite(value) ? value : 0
  );

  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safeValue);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAnimated(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  let digitIndex = 0;

  const tokens = formatted.split("").map((char) => {
    if (/\d/.test(char)) {
      return {
        key: `digit-${digitIndex++}`,
        char,
        isDigit: true,
      };
    }

    return {
      key: `separator-${digitIndex}-${char}`,
      char,
      isDigit: false,
    };
  });

  return (
    <span
      className={`rolling-number ${className}`}
      role="text"
      aria-label={`${prefix}${formatted}`}
    >
      {prefix && (
        <span className="rolling-prefix" aria-hidden="true">
          {prefix}
        </span>
      )}

      {tokens.map((token) =>
        token.isDigit ? (
          <span
            key={token.key}
            className="rolling-digit-window"
            aria-hidden="true"
          >
            <span
              className="rolling-digit-strip"
              style={{
                transform: `translateY(-${
                  animated ? Number(token.char) * 10 : 0
                }%)`,
              }}
            >
              {Array.from({ length: 10 }, (_, index) => (
                <span key={index}>{index}</span>
              ))}
            </span>
          </span>
        ) : (
          <span
            key={token.key}
            className="rolling-separator"
            aria-hidden="true"
          >
            {token.char}
          </span>
        )
      )}
    </span>
  );
}