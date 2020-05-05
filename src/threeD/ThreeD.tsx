import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import { OrbitControls } from "drei";
import * as THREE from "three";
type Cube = {
  position: {
    x: number;
    y: number;
    z: number;
  };
  index: number;
  clicks: number;
  flips: number;
};

type BoxProps = {
  cube: Cube;
  cubeIndex: number;
  handleClick: (arg0: Cube) => void;
};
const Box: React.FC<BoxProps> = ({ cube, handleClick }) => {
  const { x, y, z } = cube.position;
  const mesh = useRef<THREE.Mesh>();
  useFrame(() => {
    if (mesh.current) {
      return (mesh.current.rotation.x = mesh.current.rotation.y += 0.01);
    }
  });

  return (
    <mesh position={[x, y, z]} ref={mesh} onClick={() => handleClick(cube)}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshPhysicalMaterial
        attach="material"
        transparent
        opacity={0.95}
        refractionRatio={0.2}
        color={cube.flips % 2 ? "rgb(200, 150, 55)" : "rgb(150, 150, 150)"}
      />
    </mesh>
  );
};

const get3DPosition = (
  index: number,
  scaleFactor: number,
  puzzleSize: number
) => {
  return {
    x: Math.floor(index % puzzleSize) * scaleFactor,
    y: Math.floor((index / puzzleSize) % puzzleSize) * scaleFactor,
    z: Math.floor(index / (puzzleSize * puzzleSize)) * scaleFactor,
  };
};
const get2DPosition = (puzzleSize: number, x: number, y: number, z: number) => {
  return x + y * puzzleSize + z * puzzleSize * puzzleSize;
};
const getBlankPuzzle = (puzzleSize: number, scaleFactor: number) => {
  const blankArray = new Array(puzzleSize * puzzleSize * puzzleSize)
    .fill(0)
    .map((_cube, cubeIndex) => {
      return {
        position: get3DPosition(cubeIndex, scaleFactor, puzzleSize),
        index: cubeIndex,
        clicks: 0,
        flips: 0,
      };
    });
  return blankArray;
};
const flipCube = (
  cube: Cube,
  cubes: Cube[],
  puzzleSize: number,
  scaleFactor: number
) => {
  const touchPattern = {
    center: cube.index,
    top: cube.index + puzzleSize,
    bottom: cube.index - puzzleSize,
    left: cube.index - 1,
    right: cube.index + 1,
    front: cube.index + puzzleSize * puzzleSize,
    back: cube.index - puzzleSize * puzzleSize,
  };
  const cubeIdsToFlip = [touchPattern.center];
  if (cube.position.x / scaleFactor !== 0) {
    cubeIdsToFlip.push(touchPattern.left);
  }
  if (cube.position.x / scaleFactor !== puzzleSize - 1) {
    cubeIdsToFlip.push(touchPattern.right);
  }
  if (cube.position.y / scaleFactor !== 0) {
    cubeIdsToFlip.push(touchPattern.bottom);
  }
  if (cube.position.y / scaleFactor !== puzzleSize - 1) {
    cubeIdsToFlip.push(touchPattern.top);
  }
  if (cube.position.z / scaleFactor !== 0) {
    cubeIdsToFlip.push(touchPattern.back);
  }
  if (cube.position.z / scaleFactor !== puzzleSize - 1) {
    cubeIdsToFlip.push(touchPattern.front);
  }
  const newCubes = cubes.map((oldCube) => {
    if (cubeIdsToFlip.includes(oldCube.index)) {
      if (oldCube.index === cube.index) {
        return {
          ...oldCube,
          flips: oldCube.flips + 1,
          clicks: oldCube.clicks + 1,
        };
      }
      return { ...oldCube, flips: oldCube.flips + 1 };
    }
    return oldCube;
  });
  return newCubes;
};

const getSolution = (solutionSize: number, puzzleSize: number) => {
  let solution: number[] = [];
  while (solution.length < solutionSize) {
    const randomPosition = Math.floor(Math.random() * Math.pow(puzzleSize, 3));
    if (!solution.includes(randomPosition)) {
      solution.push(randomPosition);
    }
  }
  return solution;
};

const getInitialCubes = (
  solution: number[],
  puzzleSize: number,
  scaleFactor: number
) => {
  let initialCubes: Cube[] = getBlankPuzzle(puzzleSize, scaleFactor);
  solution.forEach(
    (cubeIndex: number) =>
      (initialCubes = flipCube(
        initialCubes[cubeIndex],
        initialCubes,
        puzzleSize,
        scaleFactor
      ))
  );
  return initialCubes;
};

export const ThreeD = () => {
  const scaleFactor = 2;
  const [puzzleSize, setPuzzleSize] = useState(4);
  const [cubes, setCubes] = useState<Cube[]>(
    getBlankPuzzle(puzzleSize, scaleFactor)
  );
  const transDist = -1 * ((puzzleSize - 1) / 2) * scaleFactor;
  const translation: [number, number, number] = [
    transDist,
    transDist,
    transDist,
  ];
  const handleCubeClick = (cube: Cube) => {
    const newCubes = flipCube(cube, cubes, puzzleSize, scaleFactor);
    setCubes(newCubes);
  };

  useEffect(() => {
    const solutionSize = 5;
    const solution = getSolution(solutionSize, puzzleSize);
    const newCubes = getInitialCubes(solution, puzzleSize, scaleFactor);
    setCubes(newCubes);
  }, [puzzleSize]);
  return (
    <Canvas
      style={{
        height: "100vh",
        width: "100vw",
        backgroundImage: `linear-gradient(to top, #09203f 0%, #537895 100%)`,
        backgroundBlendMode: `multiply, multiply`,
      }}
      raycaster={{
        filter: (items) => items.slice(0, 1),
      }}
      camera={{
        position: [0, 0, 20],
        isPerspectiveCamera: true,
        fov: 45,
        near: 1,
        far: 40,
        aspect: window.innerWidth / window.innerHeight,
      }}
    >
      <ambientLight />
      <OrbitControls />
      <pointLight position={[5, 5, 5]} />
      <group position={translation}>
        {cubes.map((cube, cubeIndex) => (
          <Box
            key={`cube${cubeIndex}`}
            cube={cube}
            cubeIndex={cube.index}
            handleClick={handleCubeClick}
          />
        ))}
      </group>
    </Canvas>
  );
};
