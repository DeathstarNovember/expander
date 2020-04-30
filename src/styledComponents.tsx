import "./App.css";
import styled from "styled-components";

export type ModMode = 2 | 4;
export const Text = styled.div<{ size?: number }>`
  font-size: ${(props) => props.size || 1.25}rem;
  display: flex;
  align-items: center;
`;

type ButtonProps = {
  bg?: string;
};
export const Button = styled.button<ButtonProps>`
  background: ${(props) => props.bg || ""}
  font-size: 1rem;
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
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
  grid-template-columns: 1fr 4fr;
  grid-template-rows: 1fr;
  @media only screen and (orientation: portrait) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 4fr;
  }
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

export const ControlPanel = styled.div<ControlPanelProps>`
  display: grid;
  @media only screen and (orientation: portrait) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
  }
  @media only screen and (orientation: landscape) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  padding: 10px;
  margin: 10px;
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

type SettingsPanelProps = {};
export const SettingsPanel = styled.div<SettingsPanelProps>``;

type StatsPanelProps = {};
export const StatsPanel = styled.div<StatsPanelProps>``;

type MainGridProps = {
  size: number;
};
export const MainGrid = styled.div<MainGridProps>`
  padding: 10px;
  display: grid;
  gap: 10px;
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
