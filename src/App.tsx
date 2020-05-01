import React, { useState, useEffect } from "react";
import "./App.css";
import {
  ModMode,
  Cell,
  CellContentGrid,
  Layout,
  Button,
  GameGrid,
  ControlPanel,
  StatsPanel,
  Text,
  CellContentItem,
} from "./styledComponents";
import {
  FaCompressArrowsAlt,
  FaExpandArrowsAlt,
  FaRedoAlt,
  FaPowerOff,
  FaInfo,
} from "react-icons/fa";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { TiWarning, TiWarningOutline } from "react-icons/ti";
import { MdLightbulbOutline } from "react-icons/md";
import { ThreeD } from "./threeD/ThreeD";

const getPosition = (id: number, rowSize: number) => {
  const row = Math.floor(id / rowSize);
  const column = id % rowSize;
  return { column, row };
};

const getSolution = (
  solutionSize: number,
  cellCount: number,
  modMode: ModMode
) => {
  let solution: number[] = [];
  while (solution.length < solutionSize) {
    const randomPosition = Math.floor(Math.random() * cellCount);
    if (!solution.includes(randomPosition)) {
      solution.push(randomPosition);
    } else if (modMode === 4 && Math.random() >= 0.5) {
      solution.push(randomPosition);
      if (Math.random() <= 0.5) {
        solution.push(randomPosition);
      }
    }
  }
  return solution;
};

const getBlankBoard = (boardSize: number) => {
  return new Array(boardSize * boardSize).fill(0).map((_newCell, ci) => {
    return {
      id: ci,
      position: getPosition(ci, boardSize),
      flips: 0,
      clicks: 0,
      solution: 0,
    };
  });
};

const flipCell = (
  cell: Cell,
  cells: Cell[],
  boardSize: number,
  times: number = 1
) => {
  // if (!cell) window.location.reload();
  const { id } = cell;
  const touchPattern = {
    center: id,
    top: id - boardSize,
    left: id - 1,
    right: id + 1,
    bottom: id + boardSize,
  };
  const row = Math.floor(id / boardSize);
  const column = id % boardSize;

  let cellIdsToFlip: number[] = [];
  cellIdsToFlip.push(id);
  if (column !== boardSize - 1) {
    cellIdsToFlip.push(touchPattern.right);
  }
  if (column !== 0) {
    cellIdsToFlip.push(touchPattern.left);
  }
  if (row !== boardSize - 1) {
    cellIdsToFlip.push(touchPattern.bottom);
  }
  if (row !== 0) {
    cellIdsToFlip.push(touchPattern.top);
  }
  const newCells = cells.map((cell, cellId) => {
    if (cellIdsToFlip.includes(cellId)) {
      return {
        ...cell,
        flips: cell.flips + times,
        clicks: cell.id === id ? cell.clicks + 1 : cell.clicks,
      };
    } else {
      return cell;
    }
  });
  return newCells;
};

const getOccurrence = (array: number[], value: number) => {
  let count = 0;
  array.forEach((v) => v === value && count++);
  return count;
};

const getInitialCells = (solution: number[], boardSize: number) => {
  let initialCells = [...getBlankBoard(boardSize)];
  solution.forEach((cell, _solutionCellIndex) => {
    initialCells = flipCell(initialCells[cell], initialCells, boardSize);
  });

  return initialCells.map((cell, cellIndex) => {
    return { ...cell, solution: getOccurrence(solution, cellIndex) };
  });
};

type AppProps = {
  location: string;
};

const App: React.FC<AppProps> = ({ location }) => {
  console.warn({ location });
  const [hintsVisible, setHintsVisible] = useState(false);
  const [modMode, setModMode] = useState<2 | 4>(2);
  const [boardSize, setBoardSize] = useState(3);
  const [boardDensity, setBoardDensity] = useState(0.4);
  const [cells, setCells] = useState<Cell[]>(getBlankBoard(boardSize));
  const [startingBoard, setStartingBoard] = useState<Cell[]>(cells);
  const [userClicks, setUserClicks] = useState(0);
  const [minimumSolutionSize, setMinimumSolutionSize] = useState(0);
  const [reset, pushReset] = useState(false);

  const toggleHints = () => {
    setHintsVisible(!hintsVisible);
  };
  const resetBoard = () => {
    setCells(startingBoard);
    setUserClicks(0);
  };
  const getNewGame = () => {
    pushReset(!reset);
    setUserClicks(0);
  };
  const toggleModMode = () => {
    setModMode(modMode === 2 ? 4 : 2);
  };
  const increaseBoardSize = () => {
    if (boardSize < 11) {
      setBoardSize(boardSize + 1);
    }
  };
  const decreaseBoardSize = () => {
    if (boardSize > 3) {
      setBoardSize(boardSize - 1);
    }
  };
  const increaseDensity = () => {
    if (boardDensity < 0.8) {
      setBoardDensity(boardDensity + 0.1);
    }
  };
  const decreaseDensity = () => {
    if (boardDensity > 0.1) {
      setBoardDensity(boardDensity - 0.1);
    }
  };
  const handleCellClick = (cell: Cell) => {
    const newCells = flipCell(cell, cells, boardSize);
    setCells(newCells);
    setUserClicks(userClicks + 1);
  };
  useEffect(() => {
    const cellCount = boardSize * boardSize;
    const solutionSize = Math.floor(cellCount * boardDensity);
    const solution: number[] = getSolution(solutionSize, cellCount, modMode);
    setMinimumSolutionSize(solution.length);
    const newCells = getInitialCells(solution, boardSize);
    const minimumSolutionSize = newCells
      .map((cell) => (modMode - cell.clicks) % modMode)
      .reduce((acc, clicks) => clicks + acc);
    setCells(newCells);
    setStartingBoard(newCells);
    setMinimumSolutionSize(minimumSolutionSize);
  }, [modMode, boardSize, boardDensity, reset]);
  if (location === "/3d") {
    return <ThreeD />;
  } else {
    return (
      <Layout>
        <ControlPanel>
          <StatsPanel>
            <Text size={1.5}>Par: {minimumSolutionSize}</Text>
            <Text size={1.5}>Score: {userClicks}</Text>
          </StatsPanel>
          <Button color="lightgreen" onClick={toggleModMode}>
            {modMode === 2 ? <TiWarningOutline /> : <TiWarning />}
          </Button>
          <Button color="lightgreen" onClick={toggleHints}>
            <FaInfo />
          </Button>
          <Button color="gray" onClick={getNewGame}>
            <FaPowerOff />
          </Button>
          <Button color="gray" onClick={resetBoard}>
            <FaRedoAlt />
          </Button>
          <Button color="lightblue" onClick={increaseBoardSize}>
            <FaExpandArrowsAlt />
          </Button>
          <Button color="lightBlue" onClick={decreaseBoardSize}>
            <FaCompressArrowsAlt />
          </Button>
          <Button color="pink" onClick={increaseDensity}>
            <FiTrendingUp />
          </Button>
          <Button color="pink" onClick={decreaseDensity}>
            <FiTrendingDown />
          </Button>
        </ControlPanel>
        <GameGrid size={boardSize}>
          {cells.map((cell) => {
            return (
              <Cell
                key={cell.id}
                cell={cell}
                mod={modMode}
                onClick={() => handleCellClick(cell)}
              >
                <CellContentGrid>
                  {/* <div>{cell.clicks % mod}</div> */}
                  {hintsVisible ? (
                    <CellContentItem
                      column={1}
                      row={1}
                      size={3}
                      boardSize={boardSize}
                    >
                      {cell.clicks - cell.solution}/
                      {modMode === 2
                        ? cell.clicks % modMode
                        : (modMode - ((modMode + cell.clicks) % modMode)) %
                          modMode}
                    </CellContentItem>
                  ) : (
                    <CellContentItem
                      size={3}
                      column={1}
                      row={1}
                      boardSize={boardSize}
                    >
                      <MdLightbulbOutline />
                    </CellContentItem>
                  )}
                </CellContentGrid>
              </Cell>
            );
          })}
        </GameGrid>
      </Layout>
    );
  }
};

export default App;
