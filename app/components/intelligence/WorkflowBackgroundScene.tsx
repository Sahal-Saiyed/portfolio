"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  workflowParticleFragmentShader,
  workflowParticleVertexShader,
} from "./workflowBackgroundShaders";

type WorkflowBackgroundSceneProps = {
  interactive: boolean;
  reducedMotion: boolean;
};

const TAU = Math.PI * 2;
const stageDuration = 6.5;
const stageCount = 7;

const networkColumns = [
  Array.from({ length: 5 }, (_, i) => new THREE.Vector3(-1.8, (i - 2) * 0.7, 0)),
  Array.from({ length: 8 }, (_, i) => new THREE.Vector3(-0.6, (i - 3.5) * 0.5, 0)),
  Array.from({ length: 8 }, (_, i) => new THREE.Vector3(0.6, (i - 3.5) * 0.5, 0)),
  Array.from({ length: 4 }, (_, i) => new THREE.Vector3(1.8, (i - 1.5) * 0.8, 0)),
];
const networkNodes = networkColumns.flat();

function seeded(index: number, offset = 0) {
  const value = Math.sin((index + offset) * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function stageAt(time: number) {
  return ((time / stageDuration) % stageCount + stageCount) % stageCount;
}

function stageWeight(stage: number, target: number) {
  const direct = Math.abs(stage - target);
  const distance = Math.min(direct, stageCount - direct);
  return Math.exp(-distance * distance * 3.8);
}

function cubePoint(index: number) {
  const face = Math.floor(seeded(index, 37) * 6);
  const u = (seeded(index, 41) - 0.5) * 2.2;
  const v = (seeded(index, 43) - 0.5) * 2.2;
  const edge = 1.12;
  if (face === 0) return [edge, u, v];
  if (face === 1) return [-edge, u, v];
  if (face === 2) return [u, edge, v];
  if (face === 3) return [u, -edge, v];
  if (face === 4) return [u, v, edge];
  return [u, v, -edge];
}

function makeLifecycleGeometry(count: number) {
  const geometry = new THREE.BufferGeometry();
  const raw = new Float32Array(count * 3);
  const stream = new Float32Array(count * 3);
  const neural = new Float32Array(count * 3);
  const embedding = new Float32Array(count * 3);
  const core = new Float32Array(count * 3);
  const inference = new Float32Array(count * 3);
  const agent = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const seedOffset = index * 4;
    const angle = seeded(index, 2) * TAU;
    const rawRadius = 2.0 + Math.pow(seeded(index, 5), 0.8) * 4.0;
    const rawY = (seeded(index, 7) - 0.5) * 7.0;
    raw[offset] = Math.cos(angle * 3.0 + rawY * 0.5) * rawRadius;
    raw[offset + 1] = rawY;
    raw[offset + 2] = Math.sin(angle * 3.0 + rawY * 0.5) * rawRadius * 0.5 + (seeded(index, 11) - 0.5) * 2.0;

    const gridDim = Math.ceil(Math.pow(count, 1/3));
    const gx = (index % gridDim) - gridDim / 2;
    const gy = (Math.floor(index / gridDim) % gridDim) - gridDim / 2;
    const gz = Math.floor(index / (gridDim * gridDim)) - gridDim / 2;
    stream[offset] = gx * 0.35;
    stream[offset + 1] = gy * 0.35;
    stream[offset + 2] = gz * 0.35;

    const isEdge = seeded(index, 21) > 0.3;
    if (isEdge && networkColumns.length > 1) {
       const col = Math.floor(seeded(index, 22) * (networkColumns.length - 1));
       const fromNode = networkColumns[col][Math.floor(seeded(index, 23) * networkColumns[col].length)];
       const toNode = networkColumns[col+1][Math.floor(seeded(index, 24) * networkColumns[col+1].length)];
       const t = seeded(index, 25);
       neural[offset] = fromNode.x + (toNode.x - fromNode.x) * t + (seeded(index, 26)-0.5)*0.08;
       neural[offset + 1] = fromNode.y + (toNode.y - fromNode.y) * t + (seeded(index, 27)-0.5)*0.08;
       neural[offset + 2] = fromNode.z + (toNode.z - fromNode.z) * t + (seeded(index, 28)-0.5)*0.08;
    } else {
       const node = networkNodes[Math.floor(seeded(index, 23) * networkNodes.length)];
       const nodeAngle = seeded(index, 29) * TAU;
       const nodeRadius = Math.pow(seeded(index, 31), 1.5) * 0.18;
       neural[offset] = node.x + Math.cos(nodeAngle) * nodeRadius;
       neural[offset + 1] = node.y + Math.sin(nodeAngle) * nodeRadius;
       neural[offset + 2] = node.z + (seeded(index, 34) - 0.5) * 0.18;
    }

    const cube = cubePoint(index);
    embedding[offset] = cube[0] * 0.8;
    embedding[offset + 1] = cube[1] * 0.8;
    embedding[offset + 2] = cube[2] * 0.8;

    const coreY = 1 - (index / Math.max(1, count - 1)) * 2;
    const coreRadius = Math.sqrt(Math.max(0, 1 - coreY * coreY));
    const coreAngle = index * Math.PI * (1 + Math.sqrt(5));
    const coreScale = 0.8;
    core[offset] = Math.cos(coreAngle) * coreRadius * coreScale;
    core[offset + 1] = coreY * coreScale;
    core[offset + 2] = Math.sin(coreAngle) * coreRadius * coreScale;

    const inferenceRadius = 0.85 + seeded(index, 53) * 2.05;
    const inferenceAngle = seeded(index, 59) * TAU;
    inference[offset] = Math.cos(inferenceAngle) * inferenceRadius;
    inference[offset + 1] = Math.sin(inferenceAngle) * inferenceRadius * 0.58;
    inference[offset + 2] = (seeded(index, 61) - 0.5) * 0.5;

    const orbit = Math.floor(seeded(index, 67) * 3);
    const agentAngle = seeded(index, 71) * TAU;
    const agentRadius = 1.35 + orbit * 0.43 + (seeded(index, 73) - 0.5) * 0.1;
    agent[offset] = Math.cos(agentAngle) * agentRadius;
    agent[offset + 1] = Math.sin(agentAngle) * agentRadius * (0.52 + orbit * 0.06);
    agent[offset + 2] = Math.sin(agentAngle * 2 + orbit) * 0.28;

    seeds[seedOffset] = seeded(index, 79);
    seeds[seedOffset + 1] = seeded(index, 83);
    seeds[seedOffset + 2] = seeded(index, 89);
    seeds[seedOffset + 3] = seeded(index, 97);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(raw, 3));
  geometry.setAttribute("aStream", new THREE.BufferAttribute(stream, 3));
  geometry.setAttribute("aNeural", new THREE.BufferAttribute(neural, 3));
  geometry.setAttribute("aEmbedding", new THREE.BufferAttribute(embedding, 3));
  geometry.setAttribute("aCore", new THREE.BufferAttribute(core, 3));
  geometry.setAttribute("aInference", new THREE.BufferAttribute(inference, 3));
  geometry.setAttribute("aAgent", new THREE.BufferAttribute(agent, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
  return geometry;
}

function makeNetworkGeometry() {
  const vertices: number[] = [];
  for (let column = 0; column < networkColumns.length - 1; column += 1) {
    networkColumns[column].forEach((from) => {
      networkColumns[column + 1].forEach((to) => {
        vertices.push(from.x, from.y, from.z, to.x, to.y, to.z);
      });
    });
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

function LifecycleParticles({ interactive, reducedMotion }: WorkflowBackgroundSceneProps) {
  const width = useThree((state) => state.size.width);
  const count = width < 620 ? 720 : width < 980 ? 1150 : 1650;
  const geometry = useMemo(() => makeLifecycleGeometry(count), [count]);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointerRef = useRef(new THREE.Vector2());
  const uniforms = useMemo(() => ({
    uTime: { value: reducedMotion ? 18.2 : 0 },
    uStage: { value: reducedMotion ? 4.3 : 0 },
    uPixelRatio: { value: 1 },
    uInteraction: { value: interactive ? 1 : 0 },
    uPointer: { value: new THREE.Vector2() },
  }), [interactive, reducedMotion]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const time = reducedMotion ? 18.2 : state.clock.elapsedTime;
    pointerRef.current.lerp(state.pointer, 0.045);
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uStage.value = stageAt(time);
    materialRef.current.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.6);
    materialRef.current.uniforms.uInteraction.value = interactive ? 1 : 0;
    materialRef.current.uniforms.uPointer.value.copy(pointerRef.current);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={workflowParticleVertexShader}
        fragmentShader={workflowParticleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function NeuralStructure({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const nodeMeshRef = useRef<THREE.InstancedMesh>(null);
  const lineGeometry = useMemo(() => makeNetworkGeometry(), []);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  
  const nodeLayers = useMemo(() => {
    const layers: number[] = [];
    networkColumns.forEach((col, layerIdx) => {
      col.forEach(() => layers.push(layerIdx));
    });
    return layers;
  }, []);
  
  const nodePhases = useMemo(() => networkNodes.map((_, i) => seeded(i * 11) * Math.PI * 2), []);

  useEffect(() => () => {
    lineGeometry.dispose();
  }, [lineGeometry]);

  useFrame((state) => {
    const time = reducedMotion ? 10.4 : state.clock.elapsedTime;
    const energy = stageWeight(stageAt(time), 2);
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.18) * 0.13;
      groupRef.current.rotation.x = -0.08 + Math.cos(time * 0.14) * 0.04;
    }
    
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = energy * 0.12;
    }
    
    if (nodeMeshRef.current) {
      const activeColor = new THREE.Color("#ffffff");
      const baseColor = new THREE.Color("#56d3b0");
      
      networkNodes.forEach((node, i) => {
        const layer = nodeLayers[i];
        const phase = nodePhases[i];
        
        const wave = (time * 1.5 - layer * 1.2 + phase * 0.3) % (Math.PI * 2);
        let activation = 0;
        if (wave > 0 && wave < Math.PI) {
           activation = Math.sin(wave);
        }
        
        const scale = 0.04 + activation * 0.045;
        
        dummy.position.copy(node);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        nodeMeshRef.current!.setMatrixAt(i, dummy.matrix);
        
        color.copy(baseColor).lerp(activeColor, activation * 0.8);
        nodeMeshRef.current!.setColorAt(i, color);
      });
      
      nodeMeshRef.current.instanceMatrix.needsUpdate = true;
      if (nodeMeshRef.current.instanceColor) {
        nodeMeshRef.current.instanceColor.needsUpdate = true;
      }
      (nodeMeshRef.current.material as THREE.MeshBasicMaterial).opacity = energy * 0.95;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial ref={lineMaterialRef} color="#8beacb" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <instancedMesh
        ref={nodeMeshRef}
        args={[undefined as any, undefined as any, networkNodes.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  );
}

function EmbeddingAndCore({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const cubeMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const shellMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = reducedMotion ? 18.2 : state.clock.elapsedTime;
    const stage = stageAt(time);
    const embeddingEnergy = stageWeight(stage, 3);
    const coreEnergy = Math.max(stageWeight(stage, 4), stageWeight(stage, 5) * 0.72, stageWeight(stage, 6) * 0.78);
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.09;
      groupRef.current.rotation.x = -0.13 + Math.sin(time * 0.16) * 0.08;
    }
    if (cubeMaterialRef.current) cubeMaterialRef.current.opacity = embeddingEnergy * 0.36 + coreEnergy * 0.08;
    if (coreMaterialRef.current) coreMaterialRef.current.opacity = coreEnergy * 0.72;
    if (shellMaterialRef.current) shellMaterialRef.current.opacity = coreEnergy * 0.2;
    if (lightRef.current) lightRef.current.intensity = coreEnergy * 2.8;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[2.25, 2.25, 2.25, 2, 2, 2]} />
        <meshBasicMaterial ref={cubeMaterialRef} color="#64d9b4" wireframe transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.72, 3]} />
        <meshBasicMaterial ref={coreMaterialRef} color="#78e4be" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={1.34}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial ref={shellMaterialRef} color="#bfd37e" wireframe transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight ref={lightRef} color="#68dfb8" intensity={0} distance={5} />
    </group>
  );
}

function InferenceWaves({ reducedMotion }: { reducedMotion: boolean }) {
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const time = reducedMotion ? 22.4 : state.clock.elapsedTime;
    const energy = Math.max(stageWeight(stageAt(time), 5), stageWeight(stageAt(time), 6) * 0.35);
    ringRefs.current.forEach((ring, index) => {
      if (!ring) return;
      const progress = (time * 0.16 + index * 0.22) % 1;
      ring.scale.setScalar(0.75 + progress * 3.2);
      ring.rotation.x = Math.PI / 2 + Math.sin(time * 0.12 + index) * 0.11;
      ring.rotation.y = index * 0.42;
      (ring.material as THREE.MeshBasicMaterial).opacity = energy * (1 - progress) * 0.19;
    });
  });

  return (
    <group>
      {Array.from({ length: 4 }, (_, index) => (
        <mesh key={index} ref={(node) => { ringRefs.current[index] = node; }}>
          <ringGeometry args={[0.98, 1, 96]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#60dfba" : "#b9cf79"} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function AgentOrbit({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const nodeMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const nodes = useMemo(() => Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * TAU;
    const radius = 1.72 + (index % 2) * 0.32;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.56, Math.sin(angle * 2) * 0.2] as [number, number, number];
  }), []);

  useFrame((state) => {
    const time = reducedMotion ? 26.4 : state.clock.elapsedTime;
    const energy = stageWeight(stageAt(time), 6);
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.025;
      groupRef.current.rotation.y = Math.sin(time * 0.12) * 0.14;
    }
    ringMaterialRefs.current.forEach((material, index) => {
      if (material) material.opacity = energy * (0.1 + index * 0.035);
    });
    nodeMaterialRefs.current.forEach((material, index) => {
      if (material) material.opacity = energy * (0.52 + (index % 3) * 0.12);
    });
  });

  return (
    <group ref={groupRef}>
      {[1.45, 1.78, 2.08].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.2, index * 0.32, 0]}>
          <torusGeometry args={[radius, 0.008, 8, 112]} />
          <meshBasicMaterial ref={(material) => { ringMaterialRefs.current[index] = material; }} color={index === 1 ? "#bfcf7c" : "#68dfb8"} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {nodes.map((position, index) => (
        <mesh position={position} key={index}>
          {index % 3 === 0 ? <boxGeometry args={[0.13, 0.13, 0.13]} /> : index % 3 === 1 ? <octahedronGeometry args={[0.1, 0]} /> : <sphereGeometry args={[0.085, 14, 14]} />}
          <meshBasicMaterial ref={(material) => { nodeMaterialRefs.current[index] = material; }} color={index % 2 === 0 ? "#93edcb" : "#cbd98a"} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function WorkflowRig(props: WorkflowBackgroundSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const width = useThree((state) => state.size.width);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const compact = width < 720;
    const pointerX = props.interactive ? state.pointer.x : 0;
    const pointerY = props.interactive ? state.pointer.y : 0;
    const targetX = compact ? 1.02 : 2.08;
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 2.4, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, compact ? 0.15 : 0, 2.4, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, pointerX * 0.035, 2.2, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -pointerY * 0.022, 2.2, delta);
    groupRef.current.scale.setScalar(compact ? 0.76 : 0.94);
  });

  return (
    <group ref={groupRef} position={[2.08, 0, 0]}>
      <LifecycleParticles {...props} />
      <NeuralStructure reducedMotion={props.reducedMotion} />
      <EmbeddingAndCore reducedMotion={props.reducedMotion} />
      <InferenceWaves reducedMotion={props.reducedMotion} />
      <AgentOrbit reducedMotion={props.reducedMotion} />
    </group>
  );
}

function CameraDrift({ interactive, reducedMotion }: WorkflowBackgroundSceneProps) {
  const targetRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const time = reducedMotion ? 18.2 : state.clock.elapsedTime;
    const pointerX = interactive ? state.pointer.x : 0;
    const pointerY = interactive ? state.pointer.y : 0;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, pointerX * 0.06, 1.8, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, pointerY * 0.04 + Math.sin(time * 0.08) * 0.025, 1.8, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, 7.4 + Math.sin(time * 0.055) * 0.06, 1.6, delta);
    targetRef.current.set(pointerX * 0.025, pointerY * 0.02, 0);
    state.camera.lookAt(targetRef.current);
  });

  return null;
}

export function WorkflowBackgroundScene(props: WorkflowBackgroundSceneProps) {
  return (
    <>
      <color attach="background" args={["#050b09"]} />
      <fog attach="fog" args={["#050b09", 6.5, 12]} />
      <ambientLight intensity={0.13} color="#a9e3d2" />
      <pointLight position={[2.6, 2.4, 2.8]} color="#69e0bb" intensity={1.25} distance={8} />
      <pointLight position={[-2.2, -1.6, 1.6]} color="#8fa34e" intensity={0.85} distance={7} />
      <WorkflowRig {...props} />
      <CameraDrift {...props} />
    </>
  );
}
