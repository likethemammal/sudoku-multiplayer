import { useState, useRef, useEffect, useMemo } from "react";
import useMousePosition from "./hooks/useMousePosition";
import useWindowSize from "./hooks/useWindowSize";
import useFrame from "./hooks/useFrame";
import { cva, cx } from "class-variance-authority";
import {
  myPlayer,
  useIsHost,
  useMultiplayerState,
  usePlayerState,
  usePlayersList,
  usePlayersState,
} from "playroomkit";
import { FaMousePointer } from "react-icons/fa";
import Tooltip from "@tippyjs/react";
import "react-tippy/dist/tippy.css";

const mouseStyles = cva("w-4 h-8 absolute text-2xl -translate-x-1");

const inputStyles = cva(
  "transition-colors w-7 h-7 sm:w-10 sm:h-10 text-lg font-bold text-center relative focus:outline-none focus:border-blue-500",
  {
    variants: {
      selected: {
        true: "",
        false: "",
      },
      isInitial: {
        true: "bg-gray-100 text-gray-700 disabled:text-gray-700",
        false: "bg-white border-2 border-gray-300",
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
        className: "bg-red-300 border-red-500",
      },
    ],
  }
);

import _ from "lodash";

function splitIntoGrids(array) {
  const result = [];
  let currentChunk = [];

  for (let i = 0; i < array.length; i++) {
    currentChunk.push(array[i]);
    if ((i + 1) % 9 === 0 || i === array.length - 1) {
      result.push(currentChunk);
      currentChunk = [];
    }
  }
  return result;
}

function App() {
  const ref = useRef();
  const positionRef = useMousePosition();
  const me = myPlayer();
  const players = usePlayersList(true);
  const isHost = useIsHost();
  const { width, height } = useWindowSize();

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
    const initialGrid = splitIntoGrids(characters);
    const solutionGrid = splitIntoGrids(solution);

    setSolutionGridState(solutionGrid);
    setWrongIndexes([]);
    setMessage("");

    setInitialGridState(initialGrid);
    setPersonalGridState(initialGrid);
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
      newGrid[gridIndex][cellIndex] = value || ".";

      let newWrongGrid = [...wrongIndexes];

      const wrongIndex = newWrongGrid.indexOf(`${gridIndex}${cellIndex}`);

      const hasWrong = wrongIndex > 0;

      if (hasWrong && value) {
        newWrongGrid.splice(wrongIndex, 1);
        setWrongIndexes(newWrongGrid);
      }

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

    // Here you would add your Sudoku validation logic
    // For this example, we'll just check if all numbers are filled
    setMessage(
      "Solution submitted! Implementation of validation logic needed."
    );
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
      <div className="grid grid-cols-3 p-3 bg-white rounded-xl gap-2 shadow-lg">
        {[...Array(9)].map((__, i) => {
          return (
            <button
              className="w-8 h-8 border-2 font-bold rounded bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
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
    <main className="flex flex-col items-center gap-8 py-16 max-w-[1280px] mx-auto">
      <h1 className="text-4xl font-bold">Sudoku Multiplayer</h1>
      <select
        className="w-48 rounded border border-gray-300 px-3 py-2"
        value={difficulty}
        onChange={(ev) => {
          setDifficulty(ev.target.value);
        }}
      >
        <option value="" disabled selected>
          Select difficulty
        </option>
        {difficulties.map(({ value, label }) => {
          return <option value={value}>{label}</option>;
        })}
      </select>
      <div className="">{message}</div>

      <div className="flex flex-row items-center gap-6">
        {otherPlayers.map((player, i) => (
          <div
            key={i}
            className={mouseStyles()}
            style={{
              left: `${player?.state?.pos?.x * width}px`,
              top: `${player?.state?.pos?.y * height}px`,
              color: player?.state?.profile?.color,
            }}
          >
            <FaMousePointer />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 min-[400px]:gap-6 sm:gap-4 bg-white p-6 rounded-lg shadow-lg">
        {personalGridState.map((grid, gridIndex) => (
          <div key={gridIndex} className="grid grid-cols-3 gap-2">
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
                <div className="">
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

                        if (otherCharacter !== tempInputValue) {
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

      <button
        onClick={checkSolution}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Submit Solution
      </button>
      {hasWrongIndexes ? (
        <button
          onClick={() => setWrongIndexes([])}
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Clear errors
        </button>
      ) : (
        <></>
      )}
      {hasSolutionAttempts ? (
        <button
          onClick={() => setSolutionAttempts(0)}
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Clear attempts
        </button>
      ) : (
        <></>
      )}
      <div className="">{`Attempts made: ${solutionAttempts}`}</div>
    </main>
  );
}

export default App;
