import React, { useState, useEffect } from "react";
import "./App.css";
import styled from "styled-components";

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
`;

const ButtonGroup = styled.div`
  margin: 15px;
  display: flex;
`;

type MainGridProps = {
  size: number;
};
const MainGrid = styled.div<MainGridProps>`
  padding: 20px;
  display: grid;
  height: calc(100vh - 100px);
  width: calc(100vw - 40px);
  gap: 3px;
  grid-template-columns: repeat(${(props) => props.size}, 1fr);
`;
type Cell = {
  id: number;
  position: { column: number; row: number };
  clicks: number;
  solution: number;
};
const Cell = styled.div<{ cell: Cell; mod: 2 | 4 }>`
  height: 1fr;
  width: 1fr;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
  background: ${(props) => {
    const timesClicked = props.cell.clicks;
    if ((timesClicked - 0) % props.mod === 0) {
      return "linear-gradient(to bottom, #434343, #000000)";
    }
    if ((timesClicked - 1) % props.mod === 0) {
      return "linear-gradient(to top, #fffc00, #fff)";
    }
    if ((timesClicked - 2) % props.mod === 0) {
      return "linear-gradient(to bottom, #fc6767, #ec008c)";
    }
    if ((timesClicked - 3) % props.mod === 0) {
      return "linear-gradient(to bottom, #56ccf2, #2f80ed)";
    }
  }};
  border-radius: 5px;
`;

const getPosition = (id: number, rowSize: number) => {
  const row = Math.floor(id / rowSize);
  const column = id % rowSize;
  return { column, row };
};

const getSolution = (
  clicksToSolve: number,
  cellCount: number,
  modMode: ModMode
) => {
  let solution: number[] = [];
  while (solution.length < clicksToSolve) {
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
      clicks: 0,
      solution: 0,
    };
  });
};

const clickCell = (
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
      return { ...cell, clicks: cell.clicks + times };
    } else {
      return cell;
    }
  });
  return newCells;
};
const getInitialCells = (
  solution: number[],
  boardSize: number,
  modMode: ModMode
) => {
  let initialCells = [...getBlankBoard(boardSize)];
  solution.forEach((cell, _solutionCellIndex) => {
    initialCells = clickCell(initialCells[cell], initialCells, boardSize);
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

  const toggleHints = () => {
    setHintsVisible(!hintsVisible);
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
    const newCells = clickCell(cell, cells, boardSize);
    setCells(newCells);
  };
  useEffect(() => {
    const cellCount = boardSize * boardSize;
    const clicksToSolve = Math.floor(cellCount * boardDensity);
    const solution: number[] = getSolution(clicksToSolve, cellCount, modMode);
    const newCells = getInitialCells(solution, boardSize, modMode);
    setCells(newCells);
  }, [modMode, boardSize, boardDensity]);
  return (
    <>
      <MainGrid size={boardSize}>
        {cells.map((cell) => (
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
                <div>
                  {modMode === 4 && cell.solution !== 0
                    ? 4 - cell.solution
                    : cell.solution}
                </div>
              ) : null}
            </div>
          </Cell>
        ))}
      </MainGrid>
      <div style={{ display: "grid", columns: "1fr 1fr 1fr" }}>
        <ButtonGroup>
          <Button
            bg={modMode === 2 ? "lightgreen" : "orange"}
            onClick={toggleModMode}
          >
            {modMode === 2 ? "Easy Mode" : "Hard Mode"}
          </Button>
          <Button bg="lightgray" onClick={toggleHints}>
            Hints
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
      </div>
    </>
  );
};

export default App;
