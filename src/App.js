import React, {useReducer} from 'react';
import './App.css';
import styled from 'styled-components';

const clicksToSolve = 3;

const MainGrid = styled.div`
  padding: 20px;
  display: grid;
  height: calc(100vh - 100px);
  width: calc(100vw - 40px);
  gap: 3px;
  grid-template-columns: repeat(${props => props.numberOfColumns}, 1fr);
  grid-template-rows: repeat(${props => props.numberOfRows}, 1fr);
`;

const Cell = styled.div`
  height: 1fr;
  width: 1fr;
  box-shadow: 0 0 20px rgba(0,0,0,0.9);
  background: ${props => {
    if(props.cell.clicks % (clicksToSolve + 1) === 0) {
      return (
      "linear-gradient(to bottom, #434343, #000000)");
    }
    if((props.cell.clicks - 1) % (clicksToSolve + 1) === 0) {
      return ("linear-gradient(to top, #fffc00, #fff)");
    }
    if((props.cell.clicks - 2) % (clicksToSolve + 1) === 0) {
      return ("linear-gradient(to bottom, #fc6767, #ec008c)");
    }
    if((props.cell.clicks - 3) % (clicksToSolve + 1) === 0) {
      return ("linear-gradient(to bottom, #56ccf2, #2f80ed)");
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
  let numberOfColumns = 10;
  let numberOfRows = 10;
  let cells = [];
  // let cells = [...Array((numberOfRows * numberOfColumns)).keys()];
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
  let positionsArray = [...Array((numberOfRows * numberOfColumns)).keys()]
  let litCells = shuffle([...positionsArray]).slice(0, numberLit);
  let boardLightMap = positionsArray.map(position => (
    litCells.includes(position) ? 1 : 0
    ));
  const gauss = (lightMap) => {
    let n = lightMap.length;

    for (let i=0; i<n; i++) {
        // Search for maximum in this column
        let maxEl = Math.abs(lightMap[i][i]);
        let maxRow = i;
        for(let k=i+1; k<n; k++) {
            if (Math.abs(lightMap[k][i]) > maxEl) {
                maxEl = Math.abs(lightMap[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (let k=i; k<n+1; k++) {
            let tmp = lightMap[maxRow][k];
            lightMap[maxRow][k] = lightMap[i][k];
            lightMap[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k=i+1; k<n; k++) {
            let c = -lightMap[k][i]/lightMap[i][i];
            for(let j=i; j<n+1; j++) {
                if (i==j) {
                    lightMap[k][j] = 0;
                } else {
                    lightMap[k][j] += c * lightMap[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A
    let x= new Array(n);
    for (let i=n-1; i>-1; i--) {
        x[i] = lightMap[i][n]/lightMap[i][i];
        for (let k=i-1; k>-1; k--) {
            lightMap[k][n] -= lightMap[k][i] * x[i];
        }
    }
    return x;
}
gauss(boardLightMap);
  // const litCellsAreValid = () => {
  //   let positionArray = [...Array((numberOfRows * numberOfColumns)).keys()];
  //   let boardMap = positionArray.map(position => litCells.includes(position) ? 1 : 0);
  //   let i;
  //   // check Rows
  //   for(i=0; i < boardMap.length; i += numberOfColumns) {
  //     let row = boardMap.slice(i, i + numberOfColumns + 1);
  //     // if the total number of lights in the row is not even, this board is invalid
  //     if (row.reduce((a,b) => a + b, 0) % 2 !== 0) {
  //       return false;
  //     }
  //   }
  //   //check columns
  //   for(i=Number(numberOfColumns); i > 0; i--) {
  //     let column = boardMap.filter((_on, index) => index % (numberOfColumns - i))
  //     if (column.reduce((a,b) => a + b, 0) % 2 !== 0) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }
  // if (litCellsAreValid()) {
    let rowCount;
    for(rowCount = 0; rowCount < numberOfRows; rowCount++) {
      let columnCount;
      for(columnCount = 0; columnCount < numberOfColumns; columnCount++) {
        cells.push(
          {
            id: (rowCount * numberOfColumns + columnCount) , 
            position: {column: columnCount, row:rowCount},
            clicks: litCells.includes(rowCount * numberOfColumns + columnCount) ? 1 : 0,
          }
        );
      }
    }
    return({
      numberOfColumns: numberOfColumns, 
      numberOfRows: numberOfRows, 
      cells: cells,
    });
  // } else {
  //   initialState();
  // }
};

const App = () => {
  const [{
    numberOfColumns, 
    numberOfRows,
    cells,
  }, dispatch] = useReducer(reducer, initialState());
  return(
    <>
      <MainGrid numberOfColumns={numberOfColumns} numberOfRows={numberOfRows} >
        {cells.map(cell => (
          <Cell key={cell.id} cell={cell} onClick={() => dispatch({type: "handleCellClick", payload: cell})} />
        ))}
      </MainGrid>
      
    </>
  );
}

export default App;
