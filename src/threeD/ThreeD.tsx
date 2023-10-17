import React, { useRef, useState, useEffect, Suspense } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  useLoader,
  extend,
  Object3DNode,
} from "@react-three/fiber";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type Position = {
  x: number;
  y: number;
  z: number;
};
type Cube = {
  position: Position;
  index: number;
  clicks: number;
  flips: number;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
      boxGeometry: Object3DNode<BoxLineGeometry, typeof BoxLineGeometry>;
    }
  }
}

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

type HintProps = { number: number; position: Position; hintActive: boolean };

const Hint: React.FC<HintProps> = ({ number, position, hintActive }) => {
  extend({ TextGeometry });
  const { x, y, z } = position;
  const materialRef = useRef<THREE.MeshLambertMaterial>(null);
  const font = useLoader(FontLoader, "helvetiker_bold.typeface.json");
  const emissive = hintActive ? new THREE.Color("white") : undefined;
  useFrame(() => {
    if (materialRef.current) {
      if (hintActive) {
        materialRef.current.emissive = new THREE.Color("white");
        return (materialRef.current.color = new THREE.Color("white"));
      }
      materialRef.current.emissive = new THREE.Color("black");
      return (materialRef.current.color = new THREE.Color("black"));
    }
  });
  return (
    <mesh position={[x - 0.4, y - 0.4, z]}>
      <textGeometry
        attach="geometry"
        args={[
          number.toString(),
          {
            font,
            height: 0.1,
            size: 0.8,
          },
        ]}
      />
      <meshLambertMaterial
        ref={materialRef}
        attach="material"
        emissive={emissive}
      />
    </mesh>
  );
};

type BoxProps = {
  cube: Cube;
  cubeIndex: number;
  handleClick: (arg0: Cube) => void;
  hints: boolean;
  modMode: 2 | 4;
};
const Box: React.FC<BoxProps> = ({ cube, handleClick, hints, modMode }) => {
  extend({ BoxLineGeometry });
  const { flips, position } = cube;
  const { x, y, z } = position;
  const mesh = useRef<THREE.Mesh>(null);
  const [rotationScale, setRotationScale] = useState(0.01);

  const onClick = () => {
    handleClick(cube);
    setRotationScale(rotationScale * -1);
  };
  useFrame(() => {
    if (mesh.current) {
      return (mesh.current.rotation.x = mesh.current.rotation.y +=
        Math.random() * rotationScale);
    }
  });
  const lightIsOut = (flips - 0) % modMode === 0;
  let materialColor = "";
  if (lightIsOut) {
    materialColor = "rgb(50, 50, 50); ";
  } else if ((flips - 1) % modMode === 0) {
    materialColor = "rgb(200, 150, 55)";
  } else if ((flips - 2) % modMode === 0) {
    materialColor = "rgb(206, 10, 110)";
  } else if ((flips - 3) % modMode === 0) {
    materialColor = "rgb(47, 98, 207)";
  }
  return (
    <mesh
      position={[x, y, z]}
      ref={mesh}
      onClick={onClick}
      receiveShadow
      castShadow
    >
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <meshLambertMaterial
        attach="material"
        transparent
        opacity={hints ? 0.5 : 0.75}
        refractionRatio={0.2}
        color={materialColor}
        emissive={
          !lightIsOut ? new THREE.Color("gray") : new THREE.Color("black")
        }
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

export const ThreeD = () => {
  const scaleFactor = 2;
  const [hintsVisible, setHintsVisible] = useState(false);
  const [puzzleSize, setPuzzleSize] = useState<number>(4);
  const [modMode, setModMode] = useState<2 | 4>(4);
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
    const solutionSize = 10;
    const solution = getSolution(solutionSize, puzzleSize);
    const newCubes = getInitialCubes(solution, puzzleSize, scaleFactor);
    setCubes(newCubes);
  }, [puzzleSize]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundImage: `linear-gradient(to top, #09203f 0%, #537895 100%)`,
        backgroundBlendMode: `multiply, multiply`,
      }}
    >
      <div style={{ zIndex: 99, position: "fixed", top: 10, left: 10 }}>
        <button onClick={() => setModMode(modMode === 2 ? 4 : 2)}>Mode</button>
        <button onClick={() => setHintsVisible(!hintsVisible)}>Hints</button>
      </div>
      <Canvas
        gl={{ logarithmicDepthBuffer: true }}
        style={{
          height: "100vh",
          width: "100vw",
          background: "transparent",
        }}
        raycaster={
          {
            // filter: (items) => items.slice(0, 1),
          }
        }
        camera={{
          position: [10, 10, 10],
          isPerspectiveCamera: true,
          fov: 45,
          near: 1,
          far: 40,
          aspect: window.innerWidth / window.innerHeight,
        }}
      >
        <ambientLight />
        <Suspense fallback={null}>
          {/* <StandardEffects
            bloom={true}
            ao={false}
            edgeDetection={0.1}
            smaa={false}
            bloomOpacity={0.5}
          /> */}
          <OrbitControls />
        </Suspense>
        <pointLight position={[5, 5, 5]} />
        <group position={translation}>
          {cubes.map((cube, cubeIndex) => (
            <group key={`cube${cubeIndex}`}>
              <Box
                cube={cube}
                cubeIndex={cube.index}
                handleClick={handleCubeClick}
                hints={hintsVisible}
                modMode={modMode}
              />
              <Suspense fallback={"Loading"}>
                {hintsVisible ? (
                  <Hint
                    number={
                      modMode === 2
                        ? cube.clicks % modMode
                        : (modMode - ((modMode + cube.clicks) % modMode)) %
                          modMode
                    }
                    position={cube.position}
                    hintActive={cube.clicks % modMode !== 0}
                  />
                ) : null}
              </Suspense>
            </group>
          ))}
        </group>
      </Canvas>
    </div>
  );
};
