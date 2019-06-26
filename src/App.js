import React, {useReducer} from 'react';
import './App.css';
import styled from 'styled-components';

const clicksToSolve = 2;

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
  background-color: ${props => {
    if(props.cell.clicks % (clicksToSolve + 1) === 0) {
      return ("#000");
    }
    if((props.cell.clicks - 1) % (clicksToSolve + 1) === 0) {
      return ("#ff0");
    }
    if((props.cell.clicks - 2) % (clicksToSolve + 1) === 0) {
      return ("#f0f");
    }
  }};
  border-radius: 5px;
`;


const reducer = (state, {type, payload}) => {
  let columns = state.columns;
  let rows = state.rows;

  switch (type) {
    case "handleCellClick":
      let {position, id} = payload;
      let cellsToFlip = []
      cellsToFlip.push(id)
      if(position.column !== columns - 1) {
        cellsToFlip.push(id + 1)
      }
      if(position.column !== 0) {
        cellsToFlip.push(id - 1)
      }
      if(position.row !== rows - 1) {
        cellsToFlip.push(id + columns)
      }
      if(position.row !== 0 ) {
        cellsToFlip.push(id - columns)
      }
      let newCells = [
        ...state.cells.filter(cell => !cellsToFlip.includes(cell.id)),
        ...state.cells.filter(cell => cellsToFlip.includes(cell.id))
        .map(cell => ({...cell, clicks: cell.clicks + 1 })),
       ].sort((a, b) => a.id - b.id)
       return {...state, cells: newCells};
    default:
      return state;
  }
}



const initialState = () => {
  let columns = 10;
  let rows = 10;
  let cells = [];
  let numberLit = 25;
  
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
  let litCells = shuffle([...Array((rows * columns)).keys()]).slice(0, numberLit);
  
  let rowCount;
  for(rowCount = 0; rowCount < rows; rowCount++) {
    let columnCount;
    for(columnCount = 0; columnCount < columns; columnCount++) {
      cells.push(
        {
          id: (rowCount * columns + columnCount) , 
          position: {column: columnCount, row:rowCount},
          clicks: litCells.includes(rowCount * columns + columnCount) ? 1 : 0,
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
  return(
    <MainGrid columns={columns} rows={rows} >
      {cells.map(cell => (
        <Cell key={cell.id} cell={cell} onClick={() => dispatch({type: "handleCellClick", payload: cell})} />
      ))}
    </MainGrid>
  );
}

export default App;
