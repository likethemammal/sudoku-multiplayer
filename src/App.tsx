import { useState, useRef, useEffect, useMemo } from "react";
import useMousePosition from "./hooks/useMousePosition";
import useWindowSize from "./hooks/useWindowSize";
import useFrame from "./hooks/useFrame";
import usePrevious from "./hooks/usePrevious";
import { cva, cx } from "class-variance-authority";
import {
  myPlayer,
  useIsHost,
  useMultiplayerState,
  usePlayerState,
  usePlayersList,
  usePlayersState,
} from "playroomkit";
import {
  FaAngleDoubleRight,
  FaCheck,
  FaMousePointer,
  FaStar,
  FaWalking,
} from "react-icons/fa";
import Tooltip from "@tippyjs/react";
import "react-tippy/dist/tippy.css";

import gsap from "gsap";

import Input from "./Input";

const mainStyles = cva(
  "h-screen flex flex-col items-center gap-y-6 max-sm:gap-y-4 pt-12 pb-[4rem] mx-auto"
);

const messageStyles = cva(
  `
  leading-[1em] min-h-[1em]
  text-lg font-semibold
  px-4 py-2
  bg-white text-teal-800
  rounded-full
  shadow-lg
  `,
  {
    variants: {
      visible: {
        true: "",
        false: "invisible",
      },
    },
  }
);
const messageContainerStyles = cva("pb-2");
const iconButtonText = cva("text-2xl");
const bottomButtonStyles = cva(
  "w-full grid grid-cols-[auto_auto] space-between gap-x-4 max-sm:min-w-[20rem] min-w-[26rem]"
);
const buttonGroupStyles = cva("flex gap-x-4", {
  variants: {
    side: {
      right: "justify-self-end",
      left: "",
    },
  },
  defaultVariants: {
    side: "left",
  },
});
const mouseStyles = cva(
  "w-4 h-4 shadow border-white border-2 bg-white/70 rounded text-1xl text-slate-300"
);
const mouseSlotStyles = cva("flex flex-row items-center gap-x-2 pt-2");
const playerSlotStyles = cva("w-4 h-4 border-2 border-slate-300");
const playerSlotsStyles = cva("flex flex-row items-center gap-x-1 pt-2");

const difficultyStyles = cva(
  "w-48 rounded border-2 border-slate-300 px-3 py-2"
);

const tooltipItemStyles = cva(
  "w-8 h-8 border-2 border-x-amber-400 border-t-amber-400 border-b-amber-500 bg-amber-400 font-bold rounded flex items-center justify-center cursor-pointer hover:bg-amber-400"
);
const tooltipItemsStyles = cva(
  "z-20 grid grid-cols-3 p-[0.4rem] pb-[0.5rem] bg-amber-200 border-2 border-x-amber-300 border-t-amber-100 border-b-amber-400 rounded-lg gap-2 shadow-xl"
);
const footerStyles = cva(
  `
  min-h-[1rem] w-full self-end fixed bottom-0
  
  before:content-[' ']
  before:absolute before:inset-0
  before:bg-teal-500
  before:border-t-4 before:border-teal-300/80
  `
);
const subgridStyles = cva("grid grid-cols-3 gap-1 z-0");
const inputBadgeStyles = cva(
  "absolute flex items-center justify-center z-10 rounded-full -translate-y-2/4 translate-x-2/4 w-8 h-8 top-0 right-0 bg-red-200"
);
const gridStyles = cva(
  "transition-colors relative p-[5px] rounded-lg shadow-xl",
  {
    variants: {
      intent: {
        none: "bg-amber-200",
        success: "duration-[1000ms] bg-green-200",
      },
    },
    defaultVariants: {
      intent: "none",
    },
  }
);
const sideButtonsStyles = cva(
  `
  absolute left-0 -translate-x-full
  px-6
  grid justify-items-center
  gap-y-2
  opacity-0
  `
);
const sideButtonsTextStyles = cva("text-white font-bold ");
const buttonInnerStyles = cva(
  `
  flex
  rounded-full

  border-2

`,
  {
    variants: {
      intent: {
        teal: `
          bg-teal-800/30
          border-teal-800/10
          
      `,
        transparent: `
          border-transparent
        `,
        white: `
        bg-white/30
        border-white/40
        `,
      },
      density: {
        reg: `gap-x-4`,
        compact: `gap-x-2 py-1`,
      },
    },
    defaultVariants: {
      intent: "white",
      density: "reg",
    },
    compoundVariants: [
      {
        density: "reg",
        intent: "white",
        className: `py-2 px-4`,
      },
      {
        density: "compact",
        intent: "white",
        className: `px-2`,
      },
      {
        density: "compact",
        intent: "teal",
        className: `px-1`,
      },
    ],
  }
);
const buttonsStyles = cva(
  `
  grid gap-y-4
  w-full
  justify-center
`,
  {
    variants: {
      intent: {
        paper: `
          border-4
          bg-amber-100
          border-amber-500/40
          rounded-full
          py-2 px-4
        `,
        transparent: ``,
        teal: `
          border-2
          bg-teal-500/50
          border-teal-700/10
          rounded-xl
          pb-4 pt-8 px-6
          min-w-[20rem]
        `,
      },
    },
    defaultVariants: {
      intent: "transparent",
    },
  }
);
const gridInnerStyles = cva(
  "transition-colors grid grid-cols-3 gap-[0.4rem] min-[400px]:gap-[0.4rem] sm:gap-[0.4rem] p-[0.4rem] rounded-[3px]",
  {
    variants: {
      intent: {
        none: "bg-amber-800",
        success: "duration-[2000ms] bg-green-800",
      },
    },
    defaultVariants: {
      intent: "none",
    },
  }
);

const iconButtonStyles = cva(
  `
  flex justify-center items-center font-bold 
  rounded-full transition-colors
  relative
  overflow-hidden

  before:rounded-full
  before:-translate-y-1
  before:content-[' ']
  before:absolute before:inset-0
  before:bg-white/20 

  

  before:transition-transform
  `,
  {
    variants: {
      disabled: {
        true: "",
        false: `
        hover:before:bg-white/10
        hover:before:translate-y-0
        active:scale-[1.02]
        hover:scale-[0.99]
        `,
      },
      hasBorder: {
        true: `
          border-[0.165rem] 
        `,
        false: ``,
      },
      active: {
        true: `
          scale-[0.99]
          before:bg-transparent
          before:translate-y-0
        `,
        false: ``,
      },
      dark: {
        true: `
          text-white/60
          hover:text-white
          hover:border-white
        `,
        false: `text-white`,
      },
      faded: {
        true: `
        text-white/60
        opacity-60
        hover:opacity-100
        `,
        false: ``,
      },
      outlined: {
        true: `outline-4 outline outline-offset-0 `,
        false: ``,
      },
      intent: {
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
      size: {
        md: "w-10 h-10",
        lg: "w-12 h-12",
      },
      iconSize: {
        md: "text-xl",
        lg: "text-2xl",
      },
    },
    defaultVariants: {
      intent: "blue",
      size: "lg",
      iconSize: "lg",
      disabled: false,
      hasBorder: true,
      dark: false,
      faded: false,
      outlined: false,
    },
    compoundVariants: [
      {
        faded: true,
        dark: false,
        className: `
        border-white/90`,
      },
      {
        hasBorder: true,
        dark: false,
        className: `border-white`,
      },
      {
        intent: "gray",
        disabled: false,
        className: "bg-gray-500",
      },
      {
        intent: "gray",
        disabled: true,
        className: "bg-gray-400",
      },
      {
        intent: "gray",
        dark: true,
        className: "border-stone-300",
      },
      {
        intent: "stone",
        disabled: false,
        className: "bg-stone-600",
      },
      {
        intent: "stone",
        disabled: true,
        className: "bg-stone-300",
      },
      {
        intent: "stone",
        dark: true,
        className: "border-stone-400",
      },
      {
        intent: "blue",
        disabled: false,
        className: "bg-blue-600",
      },
      {
        intent: "blue",
        disabled: true,
        className: "bg-blue-300",
      },
      {
        intent: "blue",
        dark: true,
        className: "border-blue-400",
      },
      {
        intent: "lime",
        disabled: false,
        className: "bg-lime-600",
      },
      {
        intent: "lime",
        disabled: true,
        className: "bg-lime-600",
      },
      {
        intent: "lime",
        dark: true,
        className: "border-lime-400",
      },
      {
        intent: "yellow",
        disabled: false,
        className: "bg-yellow-600",
      },
      {
        intent: "yellow",
        disabled: true,
        className: "bg-yellow-600",
      },
      {
        intent: "yellow",
        dark: true,
        className: "border-yellow-400",
      },
      {
        intent: "sand",
        disabled: false,
        className: "bg-amber-500",
      },
      {
        intent: "sand",
        disabled: true,
        className: "bg-amber-500",
      },
      {
        intent: "sand",
        dark: true,
        className: "border-amber-300",
      },
      {
        intent: "amber",
        disabled: false,
        className: "bg-amber-600",
      },
      {
        intent: "amber",
        disabled: true,
        className: "bg-amber-600",
      },
      {
        intent: "amber",
        dark: true,
        className: "border-amber-400",
      },
      {
        intent: "green",
        disabled: false,
        className: "bg-green-600",
      },
      {
        intent: "green",
        disabled: true,
        className: "bg-green-600",
      },
      {
        intent: "green",
        dark: true,
        className: "border-green-400",
      },
      {
        intent: "orange",
        disabled: false,
        className: "bg-orange-600",
      },
      {
        intent: "orange",
        disabled: true,
        className: "bg-orange-600",
      },
      {
        intent: "orange",
        dark: true,
        className: "border-orange-400",
      },
      {
        intent: "pink",
        disabled: false,
        className: "bg-rose-400",
      },
      {
        intent: "pink",
        disabled: true,
        className: "bg-rose-400",
      },
      {
        intent: "pink",
        dark: true,
        className: "border-rose-200",
      },
      {
        intent: "red",
        disabled: false,
        className: "bg-red-600",
      },
      {
        intent: "red",
        disabled: true,
        className: "bg-red-600",
      },
      {
        intent: "red",
        dark: true,
        className: "border-red-400",
      },
      {
        intent: "rose",
        disabled: false,
        className: "bg-rose-600",
      },
      {
        intent: "rose",
        disabled: true,
        className: "bg-rose-600",
      },
      {
        intent: "rose",
        dark: true,
        className: "border-rose-400",
      },
      {
        intent: "purple",
        outlined: true,
        className: "outline-purple-600",
      },
      {
        intent: "purple",
        disabled: false,
        className: "bg-purple-600",
      },
      {
        intent: "purple",
        disabled: true,
        className: "bg-purple-600",
      },
      {
        intent: "purple",
        dark: true,
        className: "border-purple-400",
      },
    ],
  }
);

const inputContainerStyles = cva(
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

const inputStyles = cva(
  `
  transition-colors
  w-7 h-7 sm:w-10 sm:h-10
  text-lg font-bold border-2 rounded-[3px] 
  text-center relative outline 
  
  
  outline-2 outline-offset-1 outline-transparent
  `,
  {
    variants: {
      selected: {
        true: "",
        false: "",
      },
      isInitial: {
        true: "bg-amber-400 border-x-amber-400 border-t-amber-300 border-b-amber-600 text-amber-900 disabled:text-amber-900",
        false: "",
      },
      status: {
        wrong: "",
        success: "",
        none: "",
      },
    },
    defaultVariants: {
      status: "none",
      isInitial: false,
      selected: false,
    },
    compoundVariants: [
      {
        selected: true,
        className: "bg-amber-200",
      },
      {
        selected: true,
        status: "wrong",
        className: "bg-amber-200",
      },
      {
        selected: false,
        status: "wrong",
        className:
          "bg-red-300 line-through text-red-800 border-x-red-300 border-t-red-200 border-b-red-400",
      },
      {
        isInitial: false,
        status: "none",
        className:
          "bg-amber-200 border-x-amber-200 border-t-amber-100 border-b-amber-400",
      },
      {
        isInitial: false,
        status: "success",
        className:
          "pointer-events-none bg-green-500 border-x-green-500 border-t-green-400 border-b-green-600 text-green-200 disabled:text-green-900",
      },
      {
        isInitial: true,
        status: "success",
        className:
          "bg-green-600 border-x-green-600 border-t-green-500 border-b-green-700 text-green-800 disabled:text-green-800",
      },
      {
        isInitial: false,
        status: "none",
        selected: false,
        className:
          "hover:bg-amber-300 hover:border-x-amber-300 hover:border-t-amber-200 hover:border-b-amber-400",
      },
    ],
  }
);

import _ from "lodash";
import { IoIosUndo } from "react-icons/io";
import {
  FaArrowLeft,
  FaArrowRotateLeft,
  FaBan,
  FaBicycle,
  FaCableCar,
  FaCarSide,
  FaDeleteLeft,
  FaDoorOpen,
  FaFaceDizzy,
  FaFaceGrimace,
  FaFaceGrin,
  FaFaceGrinBeam,
  FaFaceKiss,
  FaFaceMeh,
  FaFaceSadCry,
  FaFaceSadTear,
  FaFaceSmile,
  FaFaceSmileBeam,
  FaFaceSurprise,
  FaPlane,
  FaRocket,
  FaSkull,
  FaTruckPickup,
  FaWandMagicSparkles,
  FaX,
} from "react-icons/fa6";
import { TiDelete } from "react-icons/ti";
import { RiDeleteBack2Fill, RiRestartLine } from "react-icons/ri";
import {
  MdClose,
  MdDelete,
  MdDeleteForever,
  MdDeleteSweep,
  MdOutlineExitToApp,
} from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";
import { FiRefreshCcw } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";
import { BiSolidExit } from "react-icons/bi";
import Progression from "./Progression";

function board_string_to_grid(board_string) {
  // Validate input length
  if (board_string.length !== 81) {
    throw new Error("Board string must be exactly 81 characters long");
  }

  // Initialize the 9x9 grid
  let grid = Array(9)
    .fill()
    .map(() => Array(9).fill("."));

  // Convert string to array of characters
  const chars = board_string.split("");

  let stringIndex = 0;

  // Iterate through each 3x3 block from left to right, top to bottom
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      // Within each 3x3 block
      for (let innerRow = 0; innerRow < 3; innerRow++) {
        for (let innerCol = 0; innerCol < 3; innerCol++) {
          // Calculate the actual position in the grid
          const row = blockRow * 3 + innerRow;
          const col = blockCol * 3 + innerCol;
          grid[row][col] = chars[stringIndex++];
        }
      }
    }
  }

  return grid;
}

function DifficultyButtons({
  difficulties,
  difficulty,
  setDifficulty,
  size = "lg",
  disabled = false,
}) {
  return (
    <div
      className={buttonInnerStyles({
        intent: "white",
        density: "compact",
      })}
    >
      {difficulties.map(({ value, color, Icon }, i) => {
        const isActive = value === difficulty;

        return (
          <button
            disabled={disabled}
            className={iconButtonStyles({
              intent: color,
              dark: false,
              faded: !isActive,
              disabled: disabled || isActive,
              size,
              iconSize: size,
            })}
            onClick={() => setDifficulty(value)}
          >
            <Icon />
            {/* <span className={iconButtonText({})}>{i + 1}</span> */}
          </button>
        );
      })}
    </div>
  );
}

function App() {
  // const ref = useRef();
  // const positionRef = useMousePosition();
  const me = myPlayer();
  const players = usePlayersList(true);
  const isHost = useIsHost();

  const numLevels = 4;

  // const { width, height } = useWindowSize();

  const otherPlayers = players.filter((player) => {
    return me.id !== player.id;
  });

  const otherColors = otherPlayers.reduce((colors, player) => {
    return {
      ...colors,
      [player.id]: player?.state?.profile?.color,
    };
  }, {});

  // State for the sudoku grid
  const [initialGridState, setInitialGridState] = useMultiplayerState(
    "initialGrid",
    []
  );
  const [solutionGridState, setSolutionGridState] = useMultiplayerState(
    "solutionGrid",
    []
  );
  const [gridState, setGridState] = useMultiplayerState("grid", []);
  const [personalGridState, setPersonalGridState] = usePlayerState(
    me,
    "gridState",
    []
  );

  const [history, setHistory] = useState([]);

  const [solutionAttempts, setSolutionAttempts] = usePlayerState(
    me,
    "solutionAttempts",
    0
  );
  const [successes, setSuccesses] = usePlayerState(me, "successes", 0);
  const [successesWithAutoSolve, setSuccessesWithAutoSolve] = usePlayerState(
    me,
    "successesWithAutoSolve",
    0
  );
  const [forceUpdate, setForceUpdate] = useMultiplayerState("forceUpdate", 0);
  const [difficulty, setDifficulty] = useMultiplayerState(
    "difficulty",
    "very-hard"
  );
  const [message, setMessage] = useState("");
  const [wrongIndexes, setWrongIndexes] = useState([]);
  const [selectedIndex, setSelectedIndex] = usePlayerState(
    me,
    "selectedIndex",
    false
  );
  const selectedIndexesWithState = usePlayersState("selectedIndex");
  const gridStates = usePlayersState("gridState");

  const [tempInputValue, setTempInputValue] = useState("");
  const [succeeded, setSucceeded] = useState(false);
  const [autoSolve, setAutoSolve] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [levelColors, setLevelColors] = useState([]);

  const otherGridStates = gridStates.filter(({ player }) => {
    return me.id !== player.id;
  });

  const selectedIndexes = selectedIndexesWithState.map(({ state }) => {
    return state;
  });

  const hasSelectedIndex = !!selectedIndex;

  const myColor = me?.state?.profile?.color;

  const hasWrongIndexes = !!wrongIndexes.length;

  const hasSolutionAttempts = !!solutionAttempts;

  const playerSlots = players.concat([...Array(4 - players.length)]);

  const prevPersonalGridState = history[history.length - 2];
  const hasPrevPersonalGridState = !!prevPersonalGridState?.length;

  const disabled_undo = !hasPrevPersonalGridState;

  // const addToHistory = (gridState) => {
  //   setHistory((prev) => {
  //     if (!gridState || !gridState.length) {
  //       return prev;
  //     }

  //     console.log(prev, gridState);

  //     return [...prev, gridState];
  //   });
  // };

  // useEffect(() => {
  //   addToHistory(personalGridState);
  // }, [personalGridState]);

  const gridRef = useRef(null);

  const difficulties = [
    {
      value: "easy",
      label: "🚗 Basic",
      color: `green`,
      Icon: FaFaceGrinBeam,
    },
    {
      value: "medium",
      label: "🚎 Intermediate",
      color: `lime`,
      Icon: FaFaceSmile,
    },
    {
      value: "hard",
      label: "🚄 Advanced",
      color: `yellow`,
      Icon: FaFaceKiss,
    },
    {
      value: "very-hard",
      label: "🚀 Expert",
      color: `orange`,
      Icon: FaFaceMeh,
    },
    {
      value: "insane",
      label: "☄ Guru",
      color: `red`,
      Icon: FaFaceDizzy,
    },
    {
      value: "inhuman",
      label: "🌌 Galaxy Brain",
      color: `rose`,
      Icon: FaSkull,
    },
  ];

  const difficultyProps = useMemo(() => {
    return difficulties.find(({ value }) => value === difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (!message) {
      return;
    }

    console.log(message);
  }, [message]);

  const [currentLevel, setCurrentLevel] = useState(0);

  const nextLevel = () => {
    setCurrentLevel((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isHost) {
      return;
    }

    const challengeStr = sudoku.generate(difficulty);
    const solutionStr = sudoku.solve(challengeStr);
    const characters = challengeStr.split("");
    const solution = solutionStr.split("");
    const initialGrid = board_string_to_grid(challengeStr);
    const solutionGrid = board_string_to_grid(solutionStr);

    // sudoku.print_board(challengeStr);

    setSolutionGridState(solutionGrid);
    setWrongIndexes([]);
    setMessage("");
    setHasChanges(false);
    setSucceeded(false);

    const grid = autoSolve ? solutionGrid : initialGrid;

    setHistory([initialGrid]);
    setInitialGridState(initialGrid);
    setPersonalGridState(grid);
  }, [difficulty, currentLevel]);

  useEffect(() => {
    const lastPersonalGridState = history[history.length - 1];
    const newPersonalState = autoSolve
      ? solutionGridState
      : lastPersonalGridState;

    if (!lastPersonalGridState) {
      return;
    }

    setPersonalGridState(newPersonalState);
  }, [autoSolve]);

  useEffect(() => {
    if (isHost) {
      return;
    }

    setPersonalGridState(initialGridState);
  }, [initialGridState]);

  // Handle input change
  const handleInputChange = (gridIndex, cellIndex, value) => {
    if (value === "" || (value.match(/^[1-9]$/) && value.length === 1)) {
      let newGrid = [...personalGridState];

      const currentValue = newGrid[gridIndex][cellIndex];

      if (value === currentValue) {
        return;
      }

      newGrid[gridIndex][cellIndex] = value || ".";

      let newWrongGrid = [...wrongIndexes];

      const wrongIndex = newWrongGrid.indexOf(`${gridIndex}${cellIndex}`);

      const hasWrong = wrongIndex >= 0;

      if (hasWrong && value) {
        newWrongGrid.splice(wrongIndex, 1);
        setWrongIndexes(newWrongGrid);
      }

      setSucceeded(false);
      setHasChanges(true);
      setHistory((prev) => [...prev, personalGridState]);
      setPersonalGridState(newGrid, true);
      setForceUpdate(forceUpdate + 1, true);
    }
  };

  const completeGridState = otherGridStates.reduce(
    (all, { state: currentGridState }) => {
      return all.map((grid, gridIndex) => {
        return grid.map((cell, cellIndex) => {
          return cell !== "."
            ? cell
            : currentGridState?.[gridIndex]?.[cellIndex];
        });
      });
    },
    personalGridState
  );

  function removeLastGridState() {
    let newHistory = [...history];
    newHistory.splice(newHistory.length - 1, 1);

    setHistory(newHistory);

    return newHistory;
  }

  const resetLevels = () => {
    setCurrentLevel(0);
    setLevelColors([]);
  };

  // Check if the solution is valid
  const checkSolution = () => {
    if (succeeded) {
      return;
    }

    // Flatten the grid
    const flatGrid = completeGridState.flat();

    let _wrongIndexes = [];

    completeGridState.map((grid, gridIndex) => {
      grid.map((value, cellIndex) => {
        const index = `${gridIndex}${cellIndex}`;

        const doesExist = !!value;
        const isEmpty = value === ".";
        const hasValue = doesExist && !isEmpty;

        const solutionCharacter = solutionGridState[gridIndex][cellIndex];

        const isCorrect = value === solutionCharacter;

        const isWrong = !hasValue || !isCorrect;

        if (isWrong) {
          _wrongIndexes.push(index);
        }
      });
    });

    setSolutionAttempts(solutionAttempts + 1);

    if (_wrongIndexes.length) {
      if (flatGrid.includes(".")) {
        setMessage("Please fill in all cells before submitting!");
        setWrongIndexes(_wrongIndexes);
        return;
      }

      setMessage("Some of the numbers are wrong");
      setWrongIndexes(_wrongIndexes);
      return;
    }

    setHistory([...history, solutionGridState]);
    setWrongIndexes([]);
    setAutoSolve(false);
    setMessage("Success! 🙌");
    setSuccesses(successes + 1);
    if (autoSolve) {
      setSuccessesWithAutoSolve(successesWithAutoSolve + 1);
    }
    setSucceeded(true);
    setLevelColors((prev) => [...prev, difficultyProps.color]);
  };

  const getCellPosition = (gridIndex, cellIndex) => {
    const boxRow = Math.floor(gridIndex / 3);
    const boxCol = gridIndex % 3;
    const cellRow = Math.floor(cellIndex / 3);
    const cellCol = cellIndex % 3;
    return {
      row: boxRow * 3 + cellRow + 1,
      col: boxCol * 3 + cellCol + 1,
    };
  };

  const getTooltipContent = (gridIndex, cellIndex, value, isInitial) => {
    return (
      <div className={tooltipItemsStyles()}>
        {[...Array(9)].map((__, i) => {
          return (
            <button
              className={tooltipItemStyles()}
              onClick={() => {
                handleInputChange(gridIndex, cellIndex, `${i + 1}`);
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    );
  };

  // useFrame(() => {
  //   me.setState("pos", {
  //     x: positionRef.current.x / width,
  //     y: positionRef.current.y / height,
  //   });
  // }, 20);

  const isLastLevel = currentLevel === numLevels - 1;

  return (
    <>
      <main className={mainStyles()}>
        <h1 className="grid justify-center font-sans pb-6">
          <span className="text-6xl font-bold">Sudoku</span>
          <span className="text-2xl font-bold">Multiplayer</span>
          <div className={mouseSlotStyles()}>
            {playerSlots.map((player, i) => (
              <div
                key={i}
                className={mouseStyles()}
                style={{
                  // left: `${player?.state?.pos?.x * width}px`,
                  // top: `${player?.state?.pos?.y * height}px`,
                  backgroundColor: player?.state?.profile?.color,
                }}
              >
                {/* <FaMousePointer /> */}
              </div>
            ))}
          </div>
        </h1>

        <div className={buttonsStyles({})}>
          <DifficultyButtons
            disabled={succeeded}
            setDifficulty={setDifficulty}
            difficulties={difficulties}
            difficulty={difficulty}
          />
        </div>

        <div className={``}>
          <Progression
            num={numLevels}
            numFilled={currentLevel}
            colors={levelColors}
          />
        </div>

        <div
          ref={gridRef}
          className={gridStyles({ intent: succeeded ? "success" : "none" })}
        >
          <div className={sideButtonsStyles()}>
            {hasSolutionAttempts && (
              <button
                onClick={() => {
                  setSucceeded(false);
                  setSuccesses(0);
                  setSuccessesWithAutoSolve(0);
                  setSolutionAttempts(0);
                }}
                className={iconButtonStyles({
                  intent: "gray",
                  iconSize: "md",
                  disabled: false,
                })}
              >
                <FaDoorOpen />
              </button>
            )}
            <div className={sideButtonsTextStyles()}>{`${
              successesWithAutoSolve ? `*` : ``
            }${successes} / ${solutionAttempts}`}</div>
          </div>
          <div
            className={gridInnerStyles({
              intent: succeeded ? "success" : "none",
            })}
          >
            {personalGridState.map((grid, gridIndex) => (
              <div key={gridIndex} className={subgridStyles()}>
                {grid.map((character, cellIndex) => {
                  const isEmptyForMe = character === ".";

                  const { state: otherPlayerGridState, player: otherPlayer } =
                    isEmptyForMe
                      ? otherGridStates.find(({ state: otherGridState }) => {
                          return (
                            otherGridState?.[gridIndex]?.[cellIndex] !== "."
                          );
                        }) || {}
                      : {};

                  const otherCharacter =
                    otherPlayerGridState?.[gridIndex]?.[cellIndex];

                  const isOther = !!otherCharacter;

                  const otherColor = isOther
                    ? otherColors[otherPlayer?.id]
                    : "";

                  const isEmpty = isEmptyForMe && !otherCharacter;

                  const isInitial =
                    initialGridState[gridIndex][cellIndex] !== ".";

                  const index = `${gridIndex}${cellIndex}`;

                  const selected = selectedIndexes.includes(index);

                  const storedValue = isOther
                    ? otherCharacter
                    : isEmpty
                    ? ""
                    : character;

                  const isSelectedIndex =
                    hasSelectedIndex && selectedIndex === index;
                  const value = isSelectedIndex ? tempInputValue : storedValue;

                  const { player: selectedPlayer } = selected
                    ? selectedIndexesWithState.find(({ state }) => {
                        return state === index;
                      })
                    : {};
                  const position = getCellPosition(gridIndex, cellIndex);

                  const isWrong = !!wrongIndexes.includes(index);

                  const numCellsPerSubGrid = 3;
                  const delayInterval = 0.02;

                  return (
                    <Input
                      className={inputContainerStyles({ selected })}
                      delay={
                        (gridIndex * numCellsPerSubGrid + (cellIndex + 1)) *
                        delayInterval
                      }
                      succeeded={succeeded}
                      tooltipProps={{
                        content: getTooltipContent(
                          gridIndex,
                          cellIndex,
                          character,
                          isInitial
                        ),
                      }}
                      inputProps={{
                        className: inputStyles({
                          status: isWrong
                            ? "wrong"
                            : succeeded
                            ? "success"
                            : "none",
                          isInitial,
                          selected,
                        }),
                        style: {
                          outlineColor: selectedPlayer?.state?.profile?.color,
                          color: isSelectedIndex ? null : otherColor || null,
                        },
                        onBlur: (ev) => {
                          if (ev.currentTarget.contains(ev.relatedTarget)) {
                            return;
                          }

                          setSelectedIndex(false);

                          const hasOther =
                            typeof otherCharacter !== "undefined";
                          const hasTemp = typeof tempInputValue !== "undefined";

                          const hasCharacter = hasTemp || hasOther;
                          const hasUniqueCharacter =
                            otherCharacter !== tempInputValue;
                          const hasChange = hasCharacter && hasUniqueCharacter;

                          const shouldChange = !tempInputValue && isEmpty;

                          if (shouldChange) {
                            return;
                          }

                          if (hasChange) {
                            handleInputChange(
                              gridIndex,
                              cellIndex,
                              tempInputValue
                            );
                          }

                          setTempInputValue("");
                        },
                        onFocus: () => {
                          setSelectedIndex(index);
                          setTempInputValue(value);
                        },
                        onChange: (e) => {
                          setTempInputValue(e.target.value);
                          // handleClose();
                        },
                        value,
                        disabled: isInitial,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* <div className={buttonsStyles()}></div> */}
        <div className={buttonsStyles({})}>
          <div className={bottomButtonStyles({})}>
            <div className={buttonGroupStyles({})}>
              {!succeeded && (
                <>
                  {!disabled_undo && (
                    <button
                      disabled={disabled_undo}
                      onClick={() => {
                        const newHistory = removeLastGridState();

                        const lastPersonalGridState =
                          history[history.length - 2];
                        const newPersonalState =
                          lastPersonalGridState || initialGridState;
                        if (lastPersonalGridState || newHistory.length) {
                          setHasChanges(true);
                        } else {
                          setHasChanges(false);
                        }

                        setPersonalGridState(newPersonalState);
                      }}
                      className={iconButtonStyles({
                        disabled: disabled_undo,
                        intent: "gray",
                      })}
                    >
                      <IoIosUndo />
                    </button>
                  )}
                  {hasChanges && (
                    <button
                      onClick={() => {
                        setHasChanges(false);
                        setAutoSolve(false);
                        setHistory([...history, initialGridState]);
                        setPersonalGridState(initialGridState);
                      }}
                      className={iconButtonStyles({
                        intent: "sand",
                      })}
                    >
                      <MdDelete />
                    </button>
                  )}
                  {hasWrongIndexes && (
                    <button
                      onClick={() => {
                        setWrongIndexes([]);
                        setMessage("");
                      }}
                      className={iconButtonStyles({
                        intent: "pink",
                        disabled: false,
                        dark: false,
                      })}
                    >
                      <FaBan />
                    </button>
                  )}
                </>
              )}
            </div>
            <div className={buttonGroupStyles({ side: "right" })}>
              <button
                disabled={succeeded}
                onClick={() => setAutoSolve((prev) => !prev)}
                className={iconButtonStyles({
                  intent: autoSolve ? "purple" : "gray",
                  iconSize: "md",
                  disabled: succeeded,
                })}
              >
                <FaWandMagicSparkles />
              </button>
              <button
                onClick={
                  succeeded
                    ? isLastLevel
                      ? resetLevels
                      : nextLevel
                    : checkSolution
                }
                className={iconButtonStyles({
                  intent: succeeded ? "green" : "blue",
                  disabled: succeeded,
                })}
              >
                {succeeded ? (
                  isLastLevel ? (
                    <FaArrowRotateLeft />
                  ) : (
                    <FaAngleDoubleRight />
                  )
                ) : (
                  <FaCheck />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className={messageContainerStyles()}>
          <div className={messageStyles({ visible: !!message })}>{message}</div>
        </div>
        <footer className={footerStyles()}></footer>
      </main>
    </>
  );
}

export default App;
