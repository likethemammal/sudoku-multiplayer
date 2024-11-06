import { cva } from "class-variance-authority";

export const inputContainerStyles = cva(
  `
    
  `,
  {
    variants: {
      selected: {
        true: "",
        false: "",
      },
    },
  }
);

export const inputStyles = cva(
  `
    transition-colors
    w-7 h-7 sm:w-10 sm:h-10
    text-lg font-bold border-2 rounded-[3px] 
    text-center relative outline 
    
    
    outline-2 outline-offset-1 outline-transparent
    `,
  {
    variants: {
      disabled: {
        true: "pointer-events-none",
        false: "",
      },
      strike: {
        true: "line-through",
        false: "",
      },
      color: {
        none: "",
        gray: "",
        blue: "",
        green: `
            bg-green-500
            border-x-green-500
            border-t-green-400
            border-b-green-600
            text-green-900
        `,
        black: `
            bg-slate-700
            border-x-slate-700
            border-t-slate-600
            border-b-slate-800
            text-slate-100
        `,
        watermelon: `
            bg-green-600
            border-x-green-600
            border-t-green-500
            border-b-green-700
            text-green-800
        `,
        lime: `
            bg-lime-500
            border-x-lime-500
            border-t-lime-400
            border-b-lime-600
            text-lime-900
        `,
        yellow: `
            bg-yellow-300
            border-x-yellow-400
            border-t-yellow-300
            border-b-yellow-600
            text-yellow-600
        `,
        // lavender: `
        //     bg-purple-300
        //     border-x-purple-300
        //     border-t-purple-200
        //     border-b-purple-400
        //     text-purple-700
        // `,
        lavender: `
            bg-violet-300
            border-x-violet-300
            border-t-violet-200
            border-b-violet-400
            text-violet-700
        `,
        fuchsia: `
            bg-fuchsia-300
            border-x-fuchsia-300
            border-t-fuchsia-200
            border-b-fuchsia-400
            text-fuchsia-700
        `,
        purple: `
            bg-purple-500
            border-x-purple-500
            border-t-purple-400
            border-b-purple-600
            text-purple-300
        `,
        blue: `
            bg-blue-400
            border-x-blue-400
            border-t-blue-300
            border-b-blue-500
            text-blue-800
        `,
        rock: `
            bg-amber-400
            border-x-amber-400
            border-t-amber-300
            border-b-amber-600
            text-amber-900
        `,
        amber: `
            bg-amber-200
            border-x-amber-200
            border-t-amber-100
            border-b-amber-400
        `,
        orange: `
            bg-orange-400
            border-x-orange-400
            border-t-orange-300
            border-b-orange-500
            text-orange-800
        `,
        pink: "",
        red: `
            bg-red-300
            border-x-red-300
            border-t-red-200
            border-b-red-400
            text-red-800
        `,
        cyan: `
            bg-cyan-300
            border-x-cyan-300
            border-t-cyan-200
            border-b-cyan-400
            text-cyan-800
        `,
        stone: "",
      },
    },
    defaultVariants: {
      disabled: false,
      color: "amber",
      strike: false,
    },
    compoundVariants: [
      {
        color: "amber",
        disabled: false,
        className: `
            hover:bg-amber-300
            hover:border-x-amber-300
            hover:border-t-amber-200
            hover:border-b-amber-400
        `,
      },
      {
        color: "blue",
        disabled: false,
        className: `
            hover:bg-blue-300
            hover:border-x-blue-300
            hover:border-t-blue-200
            hover:border-b-blue-400
        `,
      },
      {
        color: "purple",
        disabled: false,
        className: `
            hover:bg-purple-300
            hover:border-x-purple-300
            hover:border-t-purple-200
            hover:border-b-purple-400
        `,
      },
      {
        color: "yellow",
        disabled: false,
        className: `
            hover:bg-yellow-300
            hover:border-x-yellow-300
            hover:border-t-yellow-200
            hover:border-b-yellow-400
        `,
      },
      {
        color: "lime",
        disabled: false,
        className: `
            hover:bg-lime-300
            hover:border-x-lime-300
            hover:border-t-lime-200
            hover:border-b-lime-400
        `,
      },
    ],
  }
);
