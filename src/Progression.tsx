import React, { useState } from "react";
import { cva, cx } from "class-variance-authority";

import usePrevious from "./hooks/usePrevious";

const progressionStyles = cva(`
  inline-flex items-center
  justify-center

  relative

  before:content-[' ']
  before:absolute
  before:inset-x-0
  before:bg-white
  before:z-0
  before:h-[3px]

`);
const lineStyles = cva(
  `
  w-10
  -m-1
  relative
  z-[0]
  scale-x-0
  origin-left
  `,
  {
    variants: {
      active: {
        true: "transition-transform scale-x-100 bg-gray-100",
        false: "bg-transparent",
      },
      size: {
        md: "h-1",
        lg: "h-2",
        xl: "h-[3px]",
      },
    },
    defaultVariants: {
      active: false,
      size: "xl",
    },
  }
);
const nodeStyles = cva(
  `
  rounded-full
  relative
  z-[1]
  border-[2px]
`,
  {
    variants: {
      active: {
        true: "",
        false: "bg-gray-300",
      },
      filled: {
        true: "border-0",
        false: "",
      },
      size: {
        md: "w-2 h-2",
        lg: "w-3 h-3",
        xl: "w-3 h-3",
      },
      color: {
        white: "",
        gray: "",
        blue: "",
        green: "",
        lime: "",
        yellow: "",
        sand: "",
        amber: "",
        orange: "",
        pink: "",
        red: "",
        rose: "",
        purple: "",
        stone: "",
      },
    },
    defaultVariants: {
      active: false,
      filled: false,
      size: "xl",
      color: `white`,
    },
    compoundVariants: [
      {
        active: false,
        filled: false,
        className: "border-white",
      },
      {
        active: true,
        filled: false,
        className: "border-gray-100",
      },
      {
        active: true,
        color: "white",
        className: "bg-white",
      },
      {
        active: true,
        color: "orange",
        className: "bg-orange-500",
      },
      {
        active: true,
        color: "green",
        className: "bg-green-400",
      },
      {
        active: true,
        color: "lime",
        className: "bg-lime-500",
      },
      {
        active: true,
        color: "yellow",
        className: "bg-yellow-400",
      },
      {
        active: true,
        color: "red",
        className: "bg-red-400",
      },
      {
        active: true,
        color: "rose",
        className: "bg-rose-400",
      },
    ],
  }
);

export default function Progression({
  num = 6,
  numFilled = 2,
  color = ``,
  colors = [],
}) {
  const prevNumFilled = usePrevious(numFilled);
  const prev = prevNumFilled || 0;

  return (
    <div className={progressionStyles()}>
      {[...Array(num)].map((__, i) => {
        const dotFilled = i <= numFilled;
        const lineFilled = i < numFilled;

        const lineDelay = lineFilled && i > prev ? i - prev : 0;
        const dotDelay = dotFilled && i >= prev ? i - prev : 0;

        const _color = color || colors[i];

        return [
          <div
            key={`node-${i}`}
            style={{
              transitionDelay: `${dotDelay * 100}ms`,
            }}
            className={cx(
              nodeStyles({
                active: dotFilled,
                ...(dotFilled ? { color: _color } : {}),
              })
            )}
          ></div>,
          i < num - 1 && (
            <div
              key={`line-${i}`}
              style={{
                transitionDelay: `${lineDelay * 100}ms`,
              }}
              className={lineStyles({ active: lineFilled })}
            ></div>
          ),
        ];
      })}
    </div>
  );
}
