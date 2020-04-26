import React, { useState } from "react";
import "./App.css";
import styled from "styled-components";

const mod4Mode = false;
const mod = mod4Mode ? 4 : 2;
const boardSize = 6;
const boardDensity = 0.4;
const cellCount = boardSize * boardSize;
const lightsOnCount = Math.floor(cellCount * boardDensity);

const MainGrid = styled.div`
  padding: 20px;
  display: grid;
  height: calc(100vh - 100px);
  width: calc(100vw - 40px);
  gap: 3px;
  grid-template-columns: repeat(${(props) => props.size}, 1fr);
  grid-template-rows: repeat(${(props) => props.size}, 1fr);
`;

const Cell = styled.div`
  height: 1fr;
  width: 1fr;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
  background: ${(props) => {
    const timesClicked = props.cell.clicks;
    if ((timesClicked - 0) % mod === 0) {
      return "linear-gradient(to bottom, #434343, #000000)";
    }
    if ((timesClicked - 1) % mod === 0) {
      return "linear-gradient(to top, #fffc00, #fff)";
    }
    if ((timesClicked - 2) % mod === 0) {
      return "linear-gradient(to bottom, #fc6767, #ec008c)";
    }
    if ((timesClicked - 3) % mod === 0) {
      return "linear-gradient(to bottom, #56ccf2, #2f80ed)";
    }
  }};
  border-radius: 5px;
`;

const getPosition = (id, rowSize) => {
  const row = Math.floor(id / rowSize);
  const column = id % rowSize;
  return { column, row };
};

const getSolution = (lightsOnCount, cells) => {
  const length = cells.length;
  let solution = [];
  while (solution.length < lightsOnCount) {
    const randomPosition = Math.round(Math.random() * length);
    if (!solution.includes(randomPosition)) {
      solution.push(randomPosition);
    }
  }
  return solution;
};

const getSolvedBoard = () => {
  return new Array(cellCount).fill(0).map((_newCell, ci) => {
    return {
      id: ci,
      position: getPosition(ci, boardSize),
      clicks: 0,
      solution: 0,
    };
  });
};

const clickCell = (cell, cells) => {
  const { position, id } = cell;
  let cellsToFlip = [];
  cellsToFlip.push(id);
  if (position.column !== boardSize - 1) {
    cellsToFlip.push(id + 1);
  }
  if (position.column !== 0) {
    cellsToFlip.push(id - 1);
  }
  if (position.row !== boardSize - 1) {
    cellsToFlip.push(id + boardSize);
  }
  if (position.row !== 0) {
    cellsToFlip.push(id - boardSize);
  }
  const newCells = [
    ...cells.filter((cell) => !cellsToFlip.includes(cell.id)),
    ...cells
      .filter((cell) => cellsToFlip.includes(cell.id))
      .map((cell) => ({ ...cell, clicks: cell.clicks + 1 })),
  ].sort((a, b) => a.id - b.id);
  return newCells;
};
const getInitialCells = (solvedCells, solution) => {
  let initialCells = [...solvedCells];
  solution.forEach((cell, _solutionCellIndex) => {
    initialCells = clickCell(solvedCells[cell], initialCells);
    if (mod4Mode) {
      initialCells = clickCell(solvedCells[cell], initialCells);
    }
  });
  return initialCells.map((cell, cellIndex) => {
    return { ...cell, solution: solution.includes(cellIndex) ? 1 : 0 };
  });
};

const solvedBoard = getSolvedBoard();
const solution = getSolution(lightsOnCount, solvedBoard);
const initialCells = getInitialCells(solvedBoard, solution);
const App = () => {
  const [cells, setCells] = useState(initialCells);
  const handleCellClick = (cell) => {
    setCells(clickCell(cell, cells));
  };
  console.warn({ cells, solution });
  return (
    <MainGrid size={boardSize}>
      {cells.map((cell) => (
        <Cell
          key={cell.id}
          cell={cell}
          style={{ fontSize: "3rem" }}
          onClick={() => handleCellClick(cell)}
        >
          <div
            style={{
              diplay: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* <div>{cell.clicks % mod}</div> */}
            <div>{cell.solution}</div>
          </div>
        </Cell>
      ))}
    </MainGrid>
  );
};

export default App;
