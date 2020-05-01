import "./App.css";
import styled from "styled-components";

export type ModMode = 2 | 4;
export const Text = styled.div<{ size?: number }>`
  font-size: ${(props) => props.size || 1.25}rem;
  display: flex;
  align-items: center;
`;

type ButtonProps = {
  color?: string;
};
export const Button = styled.div<ButtonProps>`
  color: ${(props) => props.color || "#FFF"}
  font-size: 1.5rem;
`;

export const ButtonGroup = styled.div`
  display: grid;
  @media only screen and (orientation: portrait) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }
  @media only screen and (orientation: landscape) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

type ButtonsProps = {
  orientation?: "pirtrait" | "landscape";
};

export const Buttons = styled.div<ButtonsProps>``;

export const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 15px;
`;

type LayoutProps = {};

export const Layout = styled.div<LayoutProps>`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr;
  @media only screen and (orientation: portrait) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  height: 100vh;
  width: 100vw;
  background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(0, 0, 0, 0.15) 100%
    ),
    radial-gradient(
        at top center,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(0, 0, 0, 0.4) 120%
      )
      #272727;
  background-blend-mode: multiply, multiply;
`;

export const StatsPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
  @media only screen and (orientation: portrait) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }
`;

type ControlPanelProps = {};

export const ControlPanel = styled.div<ControlPanelProps>`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-template-columns: auto;
  @media only screen and (orientation: portrait) {
    justify-items: center;
    grid-template-columns: 3fr repeat(8, 1fr);
  }
  color: #ccc;
  padding: 10px;
  margin: 10px;
`;

type MainGridProps = {
  size: number;
};
export const GameGrid = styled.div<MainGridProps>`
  padding: 10px;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(${(props) => props.size}, 1fr);
`;
export type Cell = {
  id: number;
  position: { column: number; row: number };
  clicks: number;
  flips: number;
  solution: number;
};
export const Cell = styled.div<{ cell: Cell; mod: 2 | 4 }>`
  display: grid;
  height: 1fr;
  width: 1fr;
  cursor: pointer;
  user-select: none;
  ${(props) => {
    const timesFlipped = props.cell.flips;
    if ((timesFlipped - 0) % props.mod === 0) {
      return " color: rgba(0, 0, 0, 0.9); ";
    }
    if ((timesFlipped - 1) % props.mod === 0) {
      return " color: rgba(255, 252, 0, 0.7); filter: drop-shadow(0 0 10px rgba(255, 252, 0, 0.7)) ";
    }
    if ((timesFlipped - 2) % props.mod === 0) {
      return " color: rgba(236, 0, 140, 0.7); filter: drop-shadow(0 0 10px rgba(236, 0, 140, 0.7)) ";
    }
    if ((timesFlipped - 3) % props.mod === 0) {
      return " color: rgba(47, 128, 237, 0.7); filter: drop-shadow(0 0 10px rgba(47, 128, 237, 0.7)) ";
    }
  }}
`;

type CellContentGridProps = {};

export const CellContentGrid = styled.div<CellContentGridProps>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  height: 1fr;
  width: 1fr;
`;

type CellContentItemProps = {
  column?: 1 | 2 | 3;
  row?: 1 | 2 | 3;
  size?: 1 | 2 | 3;
  boardSize: number;
};
export const CellContentItem = styled.div<CellContentItemProps>`
  display: grid;
  height: 1fr;
  width: 1fr;
  justify-self: center;
  align-self: center;
  font-size: ${(props) => 9 / props.boardSize}rem;
  @media (min-width: 800px) {
    font-size: ${(props) => 24 / props.boardSize}rem;
  }
  @media (min-width: 1000px) {
    font-size: ${(props) => 30 / props.boardSize}rem;
  }
  grid-column-start: ${(props) => props.column || 1};
  grid-column-end: ${(props) => (props.column || 1) + (props.size || 0)};
  grid-row-start: ${(props) => props.row || 1};
  grid-row-end: ${(props) => (props.row || 1) + (props.size || 0)};
`;
