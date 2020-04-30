import { Cell, ModMode } from "./styledComponents";

export const getGridPosition = (id: number, rowSize: number) => {
  const row = Math.floor(id / rowSize);
  const column = id % rowSize;
  return { column, row };
};

export const getSolution = (
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

const blankArray = (boardSize: number) => {
  return new Array(boardSize * boardSize).fill(0);
};

const initializeCell = (id: number, boardSize: number) => {
    return {
      id: id,
      position: getGridPosition(id, boardSize),
      flips: 0,
      clicks: 0,
      solution: 0,
    };
}

export const getBlankBoard = (boardSize: number) => {
  const newArray = blankArray(boardSize);
  const blankBoard = newArray.map(
    (_newCell, cellIndex) => {
      return initializeCell(cellIndex, boardSize);
    }
  );
  return blankBoard;
};

export const flipCell = (
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

export const getOccurrence = (array: number[], value: number) => {
  let count = 0;
  array.forEach((v) => v === value && count++);
  return count;
};

export const getInitialCells = (solution: number[], boardSize: number) => {
  let initialCells = [...getBlankBoard(boardSize)];
  solution.forEach((cell, _solutionCellIndex) => {
    initialCells = flipCell(initialCells[cell], initialCells, boardSize);
  });

  return initialCells.map((cell, cellIndex) => {
    return { ...cell, solution: getOccurrence(solution, cellIndex) };
  });
};
