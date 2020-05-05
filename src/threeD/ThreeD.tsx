import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { OrbitControls, StandardEffects } from "drei";
import * as THREE from "three";
import { Object3D } from "three";
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
  position: [number, number, number];
  cube: Cube;
  cubeIndex: number;
  scaleFactor: number;
  onClick: (arg0: Cube) => void;
};
const Box: React.FC<BoxProps> = ({ cube, scaleFactor, onClick }) => {
  const { x, y, z } = cube.position;
  const mesh = useRef<Object3D>();
  const geometry = useRef<THREE.BoxBufferGeometry>();
  useFrame(() => {
    if (mesh.current) {
      geometry.current!.computeBoundingBox();
      return (mesh.current.rotation.x = mesh.current.rotation.y += 0.01);
    }
  });

  return (
    <mesh position={[x, y, z]} ref={mesh} onClick={(e) => onClick(cube)}>
      <boxBufferGeometry ref={geometry} attach="geometry" args={[1, 1, 1]} />
      <meshPhysicalMaterial
        attach="material"
        color={cube.flips % 2 ? "orange" : "gray"}
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
  const [scaleFactor, setScaleFactor] = useState(2);
  const [puzzleSize, setPuzzleSize] = useState(4);
  const [cubes, setCubes] = useState<Cube[]>(
    getBlankPuzzle(puzzleSize, scaleFactor)
  );
  console.warn({ cubes });
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
  }, []);

  return (
    <Canvas
      style={{ height: "100vh", width: "100vw" }}
      camera={{ position: [0, 5, 10], near: 1, far: 40 }}
    >
      <ambientLight />
      <OrbitControls />
      <pointLight position={[5, 5, 5]} />
      <group position={translation}>
        {cubes.map((cube, cubeIndex) => (
          <Box
            key={`cube${cubeIndex}`}
            position={[cube.position.x, cube.position.y, cube.position.z]}
            cube={cube}
            cubeIndex={cube.index}
            scaleFactor={scaleFactor}
            onClick={handleCubeClick}
          />
        ))}
      </group>
    </Canvas>
  );
};
