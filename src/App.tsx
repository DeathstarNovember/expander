import React, { useState, useEffect } from "react";
import "./App.css";
import styled from "styled-components";

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

const getSolution = (clicksToSolve: number, cells: Cell[], modMode: 2 | 4) => {
  const length = cells.length;
  let solution: number[] = [];
  while (
    solution.length <
    (modMode === 2 ? clicksToSolve : clicksToSolve + clicksToSolve * 0.5)
  ) {
    const randomPosition = Math.round(Math.random() * length);
    if (
      modMode === 4
        ? Math.round(Math.random())
        : !solution.includes(randomPosition)
    ) {
      solution.push(randomPosition);
    }
  }
  return solution;
};

const getSolvedBoard = (cellCount: number, boardSize: number) => {
  return new Array(cellCount).fill(0).map((_newCell, ci) => {
    return {
      id: ci,
      position: getPosition(ci, boardSize),
      clicks: 0,
      solution: 0,
    };
  });
};

const clickCell = (cell: Cell, cells: Cell[], boardSize: number) => {
  if (!cell) window.location.reload();
  const {
    position: { column, row },
    id,
  } = cell;
  let cellIdsToFlip: number[] = [];
  cellIdsToFlip.push(id);
  if (column !== boardSize - 1) {
    cellIdsToFlip.push(id + 1);
  }
  if (column !== 0) {
    cellIdsToFlip.push(id - 1);
  }
  if (row !== boardSize - 1) {
    cellIdsToFlip.push(id + boardSize);
  }
  if (row !== 0) {
    cellIdsToFlip.push(id - boardSize);
  }
  const unflippedCells = cells.filter(
    (cell) => !cellIdsToFlip.includes(cell.id)
  );
  const flippedCells = cells
    .filter((cell) => cellIdsToFlip.includes(cell.id))
    .map((cell) => ({ ...cell, clicks: cell.clicks + 1 }));
  const newCells = [...unflippedCells, ...flippedCells].sort(
    (a, b) => a.id - b.id
  );
  return newCells;
};
const getInitialCells = async (
  solvedCells: Cell[],
  solution: number[],
  boardSize: number
) => {
  let initialCells = [...solvedCells];
  await solution.forEach((cell, _solutionCellIndex) => {
    initialCells = clickCell(solvedCells[cell], initialCells, boardSize);
  });
  function getOccurrence(array: number[], value: number) {
    let count = 0;
    array.forEach((v) => v === value && count++);
    return count;
  }
  return initialCells.map((cell, cellIndex) => {
    return { ...cell, solution: getOccurrence(solution, cellIndex) };
  });
};

const App = () => {
  const [hintsVisible, setHintsVisible] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [modMode, setModMode] = useState<2 | 4>(2);
  const [boardSize, setBoardSize] = useState(5);
  const [boardDensity, setBoardDensity] = useState(0.4);

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
  const handleCellClick = async (cell: Cell) => {
    const newCells = await clickCell(cell, cells, boardSize);
    setCells(newCells);
  };
  useEffect(() => {
    const getNewCells = async (
      newBoard: Cell[],
      solution: number[],
      boardSize: number
    ) => {
      const newCells = await getInitialCells(newBoard, solution, boardSize);
      setCells(newCells);
    };
    const cellCount = boardSize * boardSize;
    const clicksToSolve = Math.floor(cellCount * boardDensity);
    const newBoard = getSolvedBoard(cellCount, boardSize);
    const solution: number[] = getSolution(clicksToSolve, newBoard, modMode);
    getNewCells(newBoard, solution, boardSize);
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
      <div style={{ display: "flex" }}>
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
        <Text>Size:</Text>
        <ButtonGroup>
          <Button bg="lightblue" onClick={increaseBoardSize}>
            Increase
          </Button>
          <Button bg="lightBlue" onClick={decreaseBoardSize}>
            Decrease
          </Button>
        </ButtonGroup>
        <Text>Density:</Text>
        <ButtonGroup>
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
