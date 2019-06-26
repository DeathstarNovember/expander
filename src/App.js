import React, {useReducer} from 'react';
import './App.css';
import styled from 'styled-components';

const MainGrid = styled.div`
  display: grid;
  height: 100vh;
  width: 100vw;
  gap: 3px;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  grid-template-rows: repeat(${props => props.rows}, 1fr);
`;

const Cell = styled.div`
  height: 1fr;
  width: 1fr;
  background-color: ${props => props.cell.lit ? "#ff0" : "#000"};
  border-radius: 5px;
`;


const reducer = (state, {type, payload}) => {
  let columns = state.columns;
  let rows = state.rows;
  switch (type) {
    case "handleCellClick":
      console.warn("payload", payload);
      let clickedCell = state.cells.find(cell => cell.id === payload);
      console.warn("clickedCell", clickedCell);
      let cellsToFlip = []
      cellsToFlip.push(clickedCell.id)
      if(clickedCell.position.column !== columns - 1) {
        cellsToFlip.push(payload + 1)
      }
      if(clickedCell.position.column !== 0) {
        cellsToFlip.push(payload - 1)
      }
      if(clickedCell.position.row !== rows - 1) {
        cellsToFlip.push(payload + columns)
      }
      if(clickedCell.position.row !== 0 ) {
        cellsToFlip.push(payload - columns)
      }
      console.warn("cellsToFlip", cellsToFlip);
      let newCells = [
        ...state.cells.filter(cell => !cellsToFlip.includes(cell.id)),
        ...state.cells.filter(cell => cellsToFlip.includes(cell.id))
        .map(cell => ({...cell, lit: !cell.lit})),
       ].sort((a, b) => a.id - b.id)
       console.warn("newCells", newCells);
       return {...state, cells: newCells};
    default:
      return state;
  }
}



const initialState = () => {
  let columns = 10;
  let rows = 10;
  let cells = [];
  
  const shuffle = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;
      while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
  let numberLit = 25;
  let litCells = shuffle([...Array((rows * columns)).keys()]).slice(0, numberLit);
  let rowCount;
  for(rowCount = 0; rowCount < rows; rowCount++) {
    let columnCount;
    for(columnCount = 0; columnCount < columns; columnCount++) {
      cells.push(
        {
          id: (rowCount * columns + columnCount) , 
          position: {column: columnCount, row:rowCount},
          lit: litCells.includes(rowCount * columns + columnCount),
        }
      );
    }
  }
  return({
    columns: columns, 
    rows: rows, 
    cells: cells,
  });
};

const App = () => {
  const [{
    columns, 
    rows,
    cells,
  }, dispatch] = useReducer(reducer, initialState());
  console.warn(columns, rows, cells);
  const handleClick = (cellId) => {
    dispatch({type: "handleCellClick", payload: cellId})
  }
  return(
    <MainGrid columns={columns} rows={rows} >
      {cells.map(cell => (
        <Cell key={cell.id} cell={cell} onClick={() => handleClick(cell.id)} />
      ))}
    </MainGrid>
  );
}

export default App;
