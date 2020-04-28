import React, { useState, useEffect } from "react";
import "./App.css";
import styled from "styled-components";
//@ts-ignore
import Toggle from "react-styled-toggle";

type ModMode = 2 | 4;
const Text = styled.div`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
`;

type ButtonProps = {
  bg?: string;
};
const Button = styled.button<ButtonProps>`
  background: ${(props) => props.bg}
  padding: 12px;
  font-size: 1.5rem;
  border-radius: 5px;
  margin: 0 5px;
`;

const ButtonGroup = styled.div`
  margin: 15px;
`;
const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 15px;
`;

type LayoutProps = {};

const Layout = styled.div<LayoutProps>`
  display: grid;
  grid-template-columns: 1fr 3fr;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(0, 0, 0, 0.15) 100%
    ),
    radial-gradient(
        at top center,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(0, 0, 0, 0.4) 120%
      )
      #989898;
  background-blend-mode: multiply, multiply;
`;

type ControlPanelProps = {};

const ControlPanel = styled.div<ControlPanelProps>`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  padding: 20px;
  margin: 20px;
  border: 2px solid darkblue;
  border-radius: 5px;
  background: violet;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
  background-color: #e4e4e1;
  background-image: radial-gradient(
      at top center,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(0, 0, 0, 0.03) 100%
    ),
    linear-gradient(
      to top,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(143, 152, 157, 0.6) 100%
    );
  background-blend-mode: normal, multiply;
`;

type StatsPaneProps = {};

const StatsPane = styled.div<StatsPaneProps>``;

type MainGridProps = {
  size: number;
};
const MainGrid = styled.div<MainGridProps>`
  padding: 20px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(${(props) => props.size}, 1fr);
`;
type Cell = {
  id: number;
  position: { column: number; row: number };
  clicks: number;
  flips: number;
  solution: number;
};
const Cell = styled.div<{ cell: Cell; mod: 2 | 4 }>`
  height: 1fr;
  width: 1fr;
  ${(props) => {
    const timesFlipped = props.cell.flips;
    if ((timesFlipped - 0) % props.mod === 0) {
      return "box-shadow: 0 0 10px rgba(0, 0, 0, 0.9); background: linear-gradient(to bottom, #434343, #000000); ";
    }
    if ((timesFlipped - 1) % props.mod === 0) {
      return "box-shadow: 0 0 10px rgba(255, 252, 0, 0.7); background: linear-gradient(to top, #fffc00, #fff); ";
    }
    if ((timesFlipped - 2) % props.mod === 0) {
      return "box-shadow: 0 0 10px rgba(236, 0, 140, 0.7); background: linear-gradient(to bottom, #fc6767, #ec008c); ";
    }
    if ((timesFlipped - 3) % props.mod === 0) {
      return "box-shadow: 0 0 10px rgba(47, 128, 237, 0.7); background: linear-gradient(to bottom, #56ccf2, #2f80ed); ";
    }
  }}
  border-radius: 5px;
`;

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
const getInitialCells = (solution: number[], boardSize: number) => {
  let initialCells = [...getBlankBoard(boardSize)];
  solution.forEach((cell, _solutionCellIndex) => {
    initialCells = flipCell(initialCells[cell], initialCells, boardSize);
  });
  const getOccurrence = (array: number[], value: number) => {
    let count = 0;
    array.forEach((v) => v === value && count++);
    return count;
  };
  return initialCells.map((cell, cellIndex) => {
    return { ...cell, solution: getOccurrence(solution, cellIndex) };
  });
};

const App = () => {
  const [hintsVisible, setHintsVisible] = useState(false);
  const [modMode, setModMode] = useState<2 | 4>(2);
  const [boardSize, setBoardSize] = useState(5);
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
    const newCells = getInitialCells(solution, boardSize);
    setCells(newCells);
    setStartingBoard(newCells);
    setMinimumSolutionSize(solutionSize);
  }, [modMode, boardSize, boardDensity, reset]);
  return (
    <Layout>
      <ControlPanel>
        <StatsPane>
          <Text>Minimum clicks to solve: {minimumSolutionSize}</Text>
          <Text>Your clicks: {userClicks}</Text>
        </StatsPane>

        <ToggleGroup>
          <Toggle
            labelLeft="Mode"
            backgroundColorChecked="papayawhip"
            backgroundColorUnchecked="aquamarine"
            onChange={toggleModMode}
          />
          <Toggle
            labelLeft="Hints"
            backgroundColorChecked="papayawhip"
            backgroundColorUnchecked="aquamarine"
            onChange={toggleHints}
          />
        </ToggleGroup>
        <ButtonGroup>
          <Button bg="gray" onClick={resetBoard}>
            Reset
          </Button>
          <Button bg="gray" onClick={getNewGame}>
            NewGame
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Text>Size:</Text>
          <Button bg="lightblue" onClick={increaseBoardSize}>
            Increase
          </Button>
          <Button bg="lightBlue" onClick={decreaseBoardSize}>
            Decrease
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Text>Density:</Text>
          <Button bg="pink" onClick={increaseDensity}>
            Increase
          </Button>
          <Button bg="pink" onClick={decreaseDensity}>
            Decrease
          </Button>
        </ButtonGroup>
      </ControlPanel>
      <MainGrid size={boardSize}>
        {cells.map((cell) => {
          return (
            <Cell
              key={cell.id}
              cell={cell}
              mod={modMode}
              style={{ fontSize: "3rem" }}
              onClick={() => handleCellClick(cell)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* <div>{cell.clicks % mod}</div> */}
                {hintsVisible ? (
                  <div>{(modMode - cell.clicks) % modMode}</div>
                ) : null}
              </div>
            </Cell>
          );
        })}
      </MainGrid>
    </Layout>
  );
};

export default App;
