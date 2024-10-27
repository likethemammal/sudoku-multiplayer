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
import { FaCheck, FaMousePointer, FaStar } from "react-icons/fa";
import Tooltip from "@tippyjs/react";
import "react-tippy/dist/tippy.css";

const mainStyles = cva(
  "flex flex-col items-center gap-y-6 pt-12 pb-8 max-w-[1280px] mx-auto"
);

const buttonTextStyles = cva("text-lg");
const mouseStyles = cva("w-2 h-4 text-1xl text-slate-300");
const mouseSlotStyles = cva("flex flex-row items-center gap-x-2 pt-2");
const playerSlotStyles = cva("w-4 h-4 border-2 border-slate-300");
const playerSlotsStyles = cva("flex flex-row items-center gap-x-1 pt-2");

const difficultyStyles = cva(
  "w-48 rounded border-2 border-slate-300 px-3 py-2"
);
const buttonStyles = cva(
  "flex text-xl items-center gap-x-2 font-bold px-6 py-2 rounded-lg transition-colors",
  {
    variants: {
      disabled: {
        true: "",
        false: "",
      },
      intent: {
        gray: "",
        blue: "text-white",
        green:
          "text-white  outline bg-green-600 outline-4 outline-offset-2 outline-green-600",
        yellow: "text-white",
      },
      icon: {
        true: "text-3xl",
      },
    },
    defaultVariants: {
      intent: "blue",
      disabled: false,
    },
    compoundVariants: [
      {
        intent: "gray",
        disabled: false,
        className:
          "bg-slate-300 hover:text-slate-700 active:bg-slate-400 text-slate-500",
      },
      {
        intent: "gray",
        disabled: true,
        className: "bg-slate-200 text-white",
      },
      {
        intent: "blue",
        disabled: false,
        className: "hover:bg-blue-600 bg-blue-500",
      },
      {
        intent: "blue",
        disabled: true,
        className: "bg-blue-300",
      },
      {
        intent: "yellow",
        disabled: false,
        className: "hover:bg-yellow-700 bg-yellow-600",
      },
      {
        intent: "yellow",
        disabled: true,
        className: "bg-yellow-300",
      },
      {
        intent: "green",
        disabled: false,
        className: "hover:bg-green-700",
      },
      {
        intent: "green",
        disabled: true,
        className: "",
      },
    ],
  }
);
const tooltipItemStyles = cva(
  "w-8 h-8 border-2 border-slate-300 bg-slate-100 font-bold rounded flex items-center justify-center cursor-pointer hover:bg-slate-200"
);
const tooltipItemsStyles = cva(
  "grid grid-cols-3 p-3 bg-white rounded-xl gap-2 shadow-xl"
);
const subgridStyles = cva("grid grid-cols-3 gap-2");
const inputContainerStyles = cva("");
const inputBadgeStyles = cva(
  "absolute flex items-center justify-center z-10 rounded-full -translate-y-2/4 translate-x-2/4 w-8 h-8 top-0 right-0 bg-red-200"
);
const gridStyles = cva(
  "grid grid-cols-3 gap-4 min-[400px]:gap-6 sm:gap-5 bg-white p-6 rounded-lg shadow-xl border border-slate-200"
);

const inputStyles = cva(
  "transition-colors w-7 h-7 sm:w-10 sm:h-10 text-lg font-bold border-2 text-center relative focus:outline-none focus:border-blue-500",
  {
    variants: {
      selected: {
        true: "",
        false: "",
      },
      isInitial: {
        true: "bg-slate-100 border-slate-200 text-slate-700 disabled:text-slate-700",
        false: "",
      },
      wrong: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        selected: false,
        wrong: true,
        className: "bg-red-200 border-red-300",
      },
      {
        isInitial: false,
        wrong: false,
        className: "bg-white border-slate-300",
      },
    ],
  }
);

import _ from "lodash";
import { IoIosUndo } from "react-icons/io";
import { FaDeleteLeft } from "react-icons/fa6";
import { TiDelete } from "react-icons/ti";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { MdClose, MdDelete, MdDeleteForever } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";

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
function App() {
  // const ref = useRef();
  // const positionRef = useMousePosition();
  const me = myPlayer();
  const players = usePlayersList(true);
  const isHost = useIsHost();
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

  useEffect(() => {
    if (!message) {
      return;
    }

    console.log(message);
  }, [message]);

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
    setSucceeded(false);

    const grid = autoSolve ? solutionGrid : initialGrid;

    setHistory([grid]);
    setInitialGridState(initialGrid);
    setPersonalGridState(grid);
  }, [difficulty]);

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

    setMessage("Solution successful");

    setSucceeded(true);
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

  const difficulties = [
    {
      value: "easy",
      label: "🚗 Basic",
    },
    {
      value: "medium",
      label: "🚎 Intermediate",
    },
    {
      value: "hard",
      label: "🚄 Advanced",
    },
    {
      value: "very-hard",
      label: "🚀 Expert",
    },
    {
      value: "insane",
      label: "☄ Guru",
    },
    {
      value: "inhuman",
      label: "🌌 Galaxy Brain",
    },
  ];

  return (
    <main className={mainStyles()}>
      <h1 className="grid justify-center">
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
                color: player?.state?.profile?.color,
              }}
            >
              <FaMousePointer />
            </div>
          ))}
        </div>
      </h1>

      <select
        className={difficultyStyles()}
        value={difficulty}
        onChange={(ev) => {
          setDifficulty(ev.target.value);
        }}
      >
        <option value="" disabled selected>
          Select difficulty
        </option>
        {difficulties.map(({ value, label }) => {
          return (
            <option className="" value={value}>
              {label}
            </option>
          );
        })}
      </select>
      <div className={gridStyles()}>
        {personalGridState.map((grid, gridIndex) => (
          <div key={gridIndex} className={subgridStyles()}>
            {grid.map((character, cellIndex) => {
              const isEmptyForMe = character === ".";

              const { state: otherPlayerGridState, player: otherPlayer } =
                isEmptyForMe
                  ? otherGridStates.find(({ state: otherGridState }) => {
                      return otherGridState?.[gridIndex]?.[cellIndex] !== ".";
                    }) || {}
                  : {};

              const otherCharacter =
                otherPlayerGridState?.[gridIndex]?.[cellIndex];

              const isOther = !!otherCharacter;

              const otherColor = isOther ? otherColors[otherPlayer?.id] : "";

              const isEmpty = isEmptyForMe && !otherCharacter;

              const isInitial = initialGridState[gridIndex][cellIndex] !== ".";

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

              return (
                <div className={inputContainerStyles()}>
                  {/* <div className={inputBadgeStyles()}>{index}</div> */}
                  <Tooltip
                    // ref={tippyRef}
                    content={getTooltipContent(
                      gridIndex,
                      cellIndex,
                      character,
                      isInitial
                    )}
                    duration={[200, 100]}
                    trigger="focusin"
                    animation="fade"
                    arrow={true}
                    theme="light"
                    interactive={true}
                  >
                    <input
                      key={index}
                      type="tel"
                      maxLength="1"
                      className={inputStyles({
                        wrong: isWrong,
                        isInitial,
                        selected,
                      })}
                      style={{
                        borderColor: selectedPlayer?.state?.profile?.color,
                        color: isSelectedIndex ? null : otherColor || null,
                      }}
                      onBlur={() => {
                        setSelectedIndex(false);

                        const hasOther = typeof otherCharacter !== "undefined";
                        const hasTemp = typeof tempInputValue !== "undefined";

                        const has = hasTemp && hasOther;

                        console.log(tempInputValue, isEmpty, character);

                        if (!tempInputValue && isEmpty) {
                          return;
                        }

                        if (
                          (hasOther && otherCharacter !== tempInputValue) ||
                          (hasTemp && otherCharacter !== tempInputValue)
                        ) {
                          handleInputChange(
                            gridIndex,
                            cellIndex,
                            tempInputValue
                          );
                        }

                        setTempInputValue("");
                      }}
                      onFocus={() => {
                        setSelectedIndex(index);
                        setTempInputValue(value);
                      }}
                      value={value}
                      onChange={(e) => {
                        setTempInputValue(e.target.value);
                        // handleClose();
                      }}
                      disabled={isInitial}
                    />
                  </Tooltip>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="h-[1em]">{message}</div>
      <div className="flex gap-x-4">
        <button
          disabled={succeeded}
          onClick={checkSolution}
          className={buttonStyles({
            intent: succeeded ? "green" : "blue",
            disabled: succeeded,
          })}
        >
          {succeeded ? <FaStar /> : <FaCheck />}
          <span className={buttonTextStyles()}>Submit</span>
        </button>
        <button
          disabled={disabled_undo}
          onClick={() => {
            let newHistory = [...history];
            newHistory.splice(newHistory.length - 1, 1);

            setPersonalGridState(
              history[history.length - 2] || initialGridState
            );
            setHistory(newHistory);
          }}
          className={buttonStyles({
            disabled: disabled_undo,
            icon: true,
            intent: "gray",
          })}
        >
          <IoIosUndo />
        </button>
        {hasWrongIndexes ? (
          <button
            onClick={() => {
              setWrongIndexes([]);
              setMessage("");
            }}
            className={buttonStyles({
              intent: "yellow",
              disabled: false,
            })}
          >
            <span className={buttonTextStyles()}>Clear errors</span>
            <AiFillDelete />
          </button>
        ) : (
          <></>
        )}
        {hasSolutionAttempts ? (
          <button
            onClick={() => setSolutionAttempts(0)}
            className="font-bold px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Clear attempts
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className="">{`Attempts made: ${solutionAttempts}`}</div>
    </main>
  );
}

export default App;
