const math = require("mathjs");

const getZeroMatrix = (size) => {
  return new Array(size).fill(new Array(size).fill(0));
};

const getStartingCandidate = (size, density) => {
  return getZeroMatrix(size).map((row) => {
    return row.map((_cell) => {
      return Math.random() < density ? 0 : 1;
    });
  });
};

const addMatrices = (m1, m2) => {
  return m1.map((row, ri) => {
    return row.map((cell, ci) => {
      return cell + m2[ri][ci];
    });
  });
};

const vectorizeMatrix = (matrix) => {
  const vector = [];
  matrix.forEach((row) => row.forEach((cell) => vector.push(cell)));
  return vector;
};

export const getCellId = (size, row, cell) => {
  return row * size + cell + 1;
};

const getTouchMatrix = (size, row, cell) => {
  const id = getCellId(size, row, cell);
  const cellsToFlip = [id];
  if (cell !== size - 1) {
    cellsToFlip.push(id + 1);
  }
  if (cell !== 0) {
    cellsToFlip.push(id - 1);
  }
  if (row !== size - 1) {
    cellsToFlip.push(id + size);
  }
  if (row !== 0) {
    cellsToFlip.push(id - size);
  }
  return getZeroMatrix(size).map((row, ri) => {
    return row.map((_cell, ci) => {
      return cellsToFlip.includes(getCellId(size, ri, ci)) ? 1 : 0;
    });
  });
};

const getSystemMatrix = (size) => {
  const collector = [];
  getZeroMatrix(size).forEach((row, ri) => {
    row.forEach((_cell, ci) => {
      collector.push(vectorizeMatrix(getTouchMatrix(size, ri, ci)));
    });
  });
  return collector;
};

const getCandidateVector = (candidateMatrix) => {
  return vectorizeMatrix(candidateMatrix);
};

const getSolution = (systemMatrix, validCandidate) => {
  const candidateVector = getCandidateVector(validCandidate);
  return math.usolve(systemMatrix, candidateVector);
};

const isCandidateValid = (systemMatrix, candidate) => {
  const systemSolution = getSolution(systemMatrix, candidate);
  console.warn({ systemSolution });
  return !systemSolution.some((sol) => sol < 0);
};

const getValidCandidateMod2 = (size, density) => {
  const cand = getStartingCandidate(size, density);
  const candIsValid = isCandidateValid(getSystemMatrix(size), cand);
  if (candIsValid) {
    return cand;
  } else {
    return getValidCandidateMod2(size, density);
  }
};

const getValidCandidateMod4 = (size, density) => {
  const c1 = getValidCandidateMod2(size, density);
  const s1 = getMod2SolutionVector(size, c1);
  const c2 = getValidCandidateMod2(size, density);
  const s2 = getMod2SolutionVector(size, c2);
  const gameBoard = addMatrices(c1, c2);
  const solution = addMatrices(s1, s2);
  return { gameBoard, solution };
};

export const getValidMod2Vector = (size, density) => {
  const validBoard = getValidCandidateMod2(size, density);
  const gameBoard = vectorizeMatrix(validBoard);
  const solution = getMod2SolutionVector(size, validBoard);
  return { gameBoard, solution };
};

export const getValidMod4Vector = (size, density) => {
  return vectorizeMatrix(getValidCandidateMod4(size, density));
};

export const getMod2SolutionVector = (size, validCandidate) => {
  const solutionVector = vectorizeMatrix(
    getSolution(getSystemMatrix(size), validCandidate)
  );
  return solutionVector;
};
