"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Shape,
  Vector3,
} from "three";

export type StudioStationId =
  | "intake"
  | "orchestration"
  | "context"
  | "reasoning"
  | "assembly"
  | "validation"
  | "shipping";

type StudioProps = {
  active: boolean;
  reduceMotion: boolean;
  selected: StudioStationId | null;
  resetSignal: number;
  onSelect: (station: StudioStationId | null) => void;
  onStageChange: (station: StudioStationId) => void;
};

type Point2 = [number, number];

const arcPoints = (center: Point2, radius: number, angles: number[]): Point2[] =>
  angles.map((angle) => [
    center[0] + Math.cos(angle) * radius,
    center[1] + Math.sin(angle) * radius,
  ]);

const C = {
  ink: "#10212a",
  navy: "#182b34",
  graphite: "#46555b",
  track: "#26373f",
  paper: "#f3efe4",
  warmWhite: "#fffaf0",
  olive: "#a7b264",
  oliveBright: "#d9e49f",
  amber: "#bd873d",
  line: "#c9c5b9",
};

const inputToContext: Point2[] = [[6.15, 3.35], [2.35, 3.35]];
const contextToCore: Point2[] = [[2.35, 3.35], [2.35, 0.78], [0, 0.78]];
const coreToReason: Point2[] = [[0, 0.78], [-4.35, 0.78]];
const reasonToCore: Point2[] = [[-4.35, 0.78], [0, 0.78]];
const coreToBuild: Point2[] = [
  [0, 0.78],
  [1.82, 0.78],
  [3.2, 0.78],
  ...arcPoints([3.2, 0.03], 0.75, [Math.PI / 2, Math.PI * 5 / 12, Math.PI / 3, Math.PI / 4, Math.PI / 6, Math.PI / 12, 0]).slice(1),
  [3.95, -3.18],
];
const buildToValidate: Point2[] = [[3.95, -3.18], [-1.2, -3.18]];
const validateToBuild: Point2[] = [[-1.2, -3.18], [3.95, -3.18]];
const validateToPortal: Point2[] = [[-1.2, -3.18], [-6.2, -3.18]];

const pulsePath: Point2[] = [
  ...inputToContext,
  ...contextToCore.slice(1),
  ...coreToReason.slice(1),
  ...reasonToCore.slice(1),
  ...coreToBuild.slice(1),
  ...buildToValidate.slice(1),
  ...validateToPortal.slice(1),
];

const stationTargets: Record<StudioStationId, [number, number, number]> = {
  intake: [6.15, 0.9, 3.35],
  context: [2.35, 0.9, 3.35],
  orchestration: [0, 1.1, 0.78],
  reasoning: [-4.35, 0.9, 0.78],
  assembly: [3.95, 0.9, -3.18],
  validation: [-1.2, 0.9, -3.18],
  shipping: [-6.2, 1.1, -3.18],
};

function segmentLengths(points: Point2[]) {
  return points.slice(1).map((point, index) =>
    Math.hypot(point[0] - points[index][0], point[1] - points[index][1]),
  );
}

function pointOnPath(points: Point2[], progress: number) {
  const lengths = segmentLengths(points);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = MathUtils.clamp(progress, 0, 1) * total;

  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index] || index === lengths.length - 1) {
      const amount = lengths[index] === 0 ? 0 : remaining / lengths[index];
      return {
        x: MathUtils.lerp(points[index][0], points[index + 1][0], amount),
        z: MathUtils.lerp(points[index][1], points[index + 1][1], amount),
        angle: -Math.atan2(
          points[index + 1][1] - points[index][1],
          points[index + 1][0] - points[index][0],
        ),
      };
    }
    remaining -= lengths[index];
  }

  return { x: points[0][0], z: points[0][1], angle: 0 };
}

const smooth = (value: number) => {
  const x = MathUtils.clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
};

function TrackSegment({ from, to, rework = false }: { from: Point2; to: Point2; rework?: boolean }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const angle = -Math.atan2(dz, dx);
  const slats = Math.max(2, Math.floor(length / 0.48));

  return (
    <group position={[(from[0] + to[0]) / 2, rework ? 0.2 : 0.42, (from[1] + to[1]) / 2]} rotation={[0, angle, 0]}>
      <RoundedBox args={[length, rework ? 0.17 : 0.25, rework ? 0.82 : 1.22]} radius={0.1} smoothness={3} receiveShadow castShadow>
        <meshStandardMaterial color={rework ? "#3b332a" : C.track} metalness={0.25} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[length - 0.1, 0.055, rework ? 0.88 : 1.28]} />
        <meshBasicMaterial color={rework ? C.amber : C.olive} transparent opacity={rework ? 0.42 : 0.36} />
      </mesh>
      {Array.from({ length: slats }, (_, index) => {
        const x = -length / 2 + ((index + 0.5) / slats) * length;
        return (
          <mesh key={index} position={[x, 0.145, 0]}>
            <boxGeometry args={[0.055, 0.025, rework ? 0.65 : 1.0]} />
            <meshStandardMaterial color={index % 4 === 0 ? (rework ? C.amber : C.olive) : C.graphite} roughness={0.65} />
          </mesh>
        );
      })}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0.24, side * (rework ? 0.39 : 0.6)]} castShadow>
          <boxGeometry args={[length, 0.14, 0.07]} />
          <meshStandardMaterial color={rework ? C.amber : C.paper} metalness={0.15} roughness={0.58} />
        </mesh>
      ))}
    </group>
  );
}

function CurvedTrack({ center, radius, startAngle, endAngle }: { center: Point2; radius: number; startAngle: number; endAngle: number }) {
  const width = 1.22;
  const shape = useMemo(() => {
    const nextShape = new Shape();
    const outerRadius = radius + width / 2;
    const innerRadius = radius - width / 2;

    nextShape.moveTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
    nextShape.absarc(0, 0, outerRadius, startAngle, endAngle, false);
    nextShape.lineTo(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius);
    nextShape.absarc(0, 0, innerRadius, endAngle, startAngle, true);
    nextShape.closePath();
    return nextShape;
  }, [endAngle, radius, startAngle]);

  const segmentCount = 12;
  const angleStep = (endAngle - startAngle) / segmentCount;
  const railRadii = [radius - width / 2, radius + width / 2];

  return (
    <group>
      <mesh position={[center[0], 0.545, center[1]]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth: 0.25, bevelEnabled: false, curveSegments: 18 }]} />
        <meshStandardMaterial color={C.track} metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh position={[center[0], 0.29, center[1]]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.055, bevelEnabled: false, curveSegments: 18 }]} />
        <meshBasicMaterial color={C.olive} transparent opacity={0.36} />
      </mesh>

      {railRadii.flatMap((railRadius, railIndex) => Array.from({ length: segmentCount }, (_, index) => {
        const angle = startAngle + (index + 0.5) * angleStep;
        return (
          <mesh
            key={`rail-${railIndex}-${index}`}
            position={[center[0] + Math.cos(angle) * railRadius, 0.66, center[1] + Math.sin(angle) * railRadius]}
            rotation={[0, -(angle + Math.PI / 2), 0]}
            castShadow
          >
            <boxGeometry args={[Math.abs(railRadius * angleStep) + 0.035, 0.14, 0.07]} />
            <meshStandardMaterial color={C.paper} metalness={0.15} roughness={0.58} />
          </mesh>
        );
      }))}

      {Array.from({ length: 8 }, (_, index) => {
        const angle = startAngle + ((index + 0.5) / 8) * (endAngle - startAngle);
        return (
          <mesh
            key={`slat-${index}`}
            position={[center[0] + Math.cos(angle) * radius, 0.57, center[1] + Math.sin(angle) * radius]}
            rotation={[0, -(angle + Math.PI / 2), 0]}
          >
            <boxGeometry args={[0.055, 0.025, 1.0]} />
            <meshStandardMaterial color={index % 4 === 0 ? C.olive : C.graphite} roughness={0.65} />
          </mesh>
        );
      })}
    </group>
  );
}

function TrackNetwork() {
  return (
    <group>
      <TrackSegment from={inputToContext[0]} to={inputToContext[1]} />
      <TrackSegment from={contextToCore[0]} to={[2.35, 1.39]} />

      <TrackSegment from={[-1.82, 0.78]} to={coreToReason[1]} />
      <TrackSegment from={[1.82, 0.78]} to={[3.2, 0.78]} />
      <CurvedTrack center={[3.2, 0.03]} radius={0.75} startAngle={0} endAngle={Math.PI / 2} />
      <TrackSegment from={[3.95, 0.03]} to={[3.95, -3.18]} />

      <TrackSegment from={buildToValidate[0]} to={validateToPortal[1]} />
    </group>
  );
}

function PhysicalLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Html transform sprite distanceFactor={7.6} position={[0, 0, 0.02]} style={{ pointerEvents: "none" }}>
      <div className="orchestration-screen">
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
    </Html>
  );
}

function StationShell({
  id,
  label,
  descriptor,
  position,
  selected,
  active,
  onSelect,
  children,
}: {
  id: StudioStationId;
  label: string;
  descriptor?: string;
  position: [number, number, number];
  selected: boolean;
  active: boolean;
  onSelect: (id: StudioStationId) => void;
  children: React.ReactNode;
}) {
  return (
    <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(id); }}>
      <RoundedBox args={[2.3, 0.28, 1.85]} radius={0.16} smoothness={4} position={[0, 0.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={C.paper}
          emissive={active || selected ? C.olive : C.paper}
          emissiveIntensity={active || selected ? 0.16 : 0}
          roughness={0.7}
        />
      </RoundedBox>
      <mesh position={[0, 0.34, 0.88]}>
        <boxGeometry args={[1.75, 0.055, 0.08]} />
        <meshBasicMaterial color={active || selected ? C.olive : C.line} />
      </mesh>
      {children}
      <group position={[0, 1.45, 0.9]}>
        <PhysicalLabel
          title={label}
          subtitle={active ? `${descriptor ?? "PROCESS"} · ACTIVE` : descriptor ?? "STANDBY"}
        />
      </group>
      <mesh position={[0, 0.9, 0]} visible={false}>
        <boxGeometry args={[2.65, 2.25, 2.15]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function InputStation(props: Omit<React.ComponentProps<typeof StationShell>, "children" | "label" | "id" | "position">) {
  return (
    <StationShell {...props} id="intake" label="INPUT" descriptor="RAW SIGNALS" position={[6.15, 0, 3.35]}>
      <RoundedBox args={[1.8, 0.75, 1.35]} radius={0.14} smoothness={3} position={[0, 0.75, 0]} castShadow>
        <meshStandardMaterial color={C.navy} roughness={0.46} />
      </RoundedBox>
      {[-0.55, 0, 0.55].map((x, index) => (
        <group key={x} position={[x, 1.15, 0]}>
          <RoundedBox args={[0.36, 0.16 + index * 0.07, 0.48]} radius={0.05} smoothness={2} castShadow>
            <meshStandardMaterial color={index === 1 ? C.olive : C.warmWhite} emissive={index === 1 ? C.olive : C.warmWhite} emissiveIntensity={index === 1 ? 0.34 : 0} />
          </RoundedBox>
        </group>
      ))}
      <mesh position={[0, 0.86, 0.69]}>
        <planeGeometry args={[1.42, 0.32]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
    </StationShell>
  );
}

function ContextStation(props: Omit<React.ComponentProps<typeof StationShell>, "children" | "label" | "id" | "position">) {
  return (
    <StationShell {...props} id="context" label="CONTEXT" descriptor="EVIDENCE + DATA" position={[2.35, 0, 3.35]}>
      {[-0.68, 0, 0.68].map((x, column) => (
        <group key={x} position={[x, 0.66, -0.08]}>
          {[0, 1, 2].map((level) => (
            <RoundedBox key={level} args={[0.48, 0.3, 1.05]} radius={0.06} smoothness={2} position={[0, level * 0.35, 0]} castShadow>
              <meshStandardMaterial color={level === column ? C.olive : C.navy} roughness={0.5} />
            </RoundedBox>
          ))}
        </group>
      ))}
      <mesh position={[0, 1.08, 0.54]}>
        <planeGeometry args={[1.75, 0.56]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
    </StationShell>
  );
}

function MSCore({ active, selected, onSelect, reduceMotion }: { active: boolean; selected: boolean; onSelect: (id: StudioStationId) => void; reduceMotion: boolean }) {
  const dieRef = useRef<Mesh>(null);
  const signalRefs = useRef<Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = reduceMotion ? 8 : clock.elapsedTime;
    if (dieRef.current) {
      (dieRef.current.material as MeshStandardMaterial).emissiveIntensity = active
        ? 0.8 + Math.sin(t * 4.2) * 0.18
        : 0.22;
    }
    signalRefs.current.forEach((signal, index) => {
      (signal.material as MeshStandardMaterial).emissiveIntensity = active
        ? 0.35 + Math.max(0, Math.sin(t * 5 - index * 0.9)) * 0.8
        : 0.1;
    });
  });

  const pinOffsets = [-0.72, -0.48, -0.24, 0, 0.24, 0.48, 0.72];

  return (
    <group position={[0, 0, 0.78]} onClick={(event) => { event.stopPropagation(); onSelect("orchestration"); }}>
      <RoundedBox args={[3.65, 0.28, 2.9]} radius={0.14} smoothness={4} position={[0, 0.26, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.ink} metalness={0.32} roughness={0.48} />
      </RoundedBox>
      <RoundedBox args={[3.28, 0.16, 2.52]} radius={0.1} smoothness={4} position={[0, 0.47, 0]} castShadow>
        <meshStandardMaterial color={C.navy} metalness={0.18} roughness={0.5} />
      </RoundedBox>

      {[
        [-1.34, -1.0], [-1.34, 1.0], [1.34, -1.0], [1.34, 1.0],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.59, z]} castShadow>
          <boxGeometry args={[0.26, 0.08, 0.26]} />
          <meshStandardMaterial color={C.olive} metalness={0.58} roughness={0.35} />
        </mesh>
      ))}

      {pinOffsets.flatMap((offset, index) => [-1, 1].map((side) => (
        <mesh key={`z-${side}-${offset}`} position={[offset, 0.72, side * 1.02]} castShadow>
          <boxGeometry args={[0.13, 0.09, 0.52]} />
          <meshStandardMaterial color={index % 2 === 0 ? C.oliveBright : C.line} metalness={0.62} roughness={0.3} />
        </mesh>
      )))}
      {pinOffsets.flatMap((offset, index) => [-1, 1].map((side) => (
        <mesh key={`x-${side}-${offset}`} position={[side * 1.19, 0.72, offset]} castShadow>
          <boxGeometry args={[0.52, 0.09, 0.13]} />
          <meshStandardMaterial color={index % 2 === 0 ? C.oliveBright : C.line} metalness={0.62} roughness={0.3} />
        </mesh>
      )))}

      {[
        { position: [0, 0.625, -0.98] as [number, number, number], size: [0.08, 0.025, 0.78] as [number, number, number] },
        { position: [0, 0.625, 0.98] as [number, number, number], size: [0.08, 0.025, 0.78] as [number, number, number] },
        { position: [-1.12, 0.625, 0] as [number, number, number], size: [0.78, 0.025, 0.08] as [number, number, number] },
        { position: [1.12, 0.625, 0] as [number, number, number], size: [0.78, 0.025, 0.08] as [number, number, number] },
      ].map((trace, index) => (
        <mesh key={index} ref={(node) => { if (node) signalRefs.current[index] = node; }} position={trace.position}>
          <boxGeometry args={trace.size} />
          <meshStandardMaterial color={C.olive} emissive={C.olive} emissiveIntensity={active ? 0.55 : 0.1} />
        </mesh>
      ))}

      <RoundedBox args={[2.05, 0.38, 1.78]} radius={0.1} smoothness={4} position={[0, 0.79, 0]} castShadow>
        <meshStandardMaterial color="#22333b" metalness={0.46} roughness={0.38} />
      </RoundedBox>
      <RoundedBox ref={dieRef} args={[1.36, 0.2, 1.12]} radius={0.07} smoothness={4} position={[0, 1.07, 0]} castShadow>
        <meshStandardMaterial color={C.ink} emissive={C.olive} emissiveIntensity={active ? 0.8 : 0.22} metalness={0.34} roughness={0.3} />
      </RoundedBox>

      <group position={[0, 1.2, 0]}>
        <Html transform center distanceFactor={5.2} rotation={[-Math.PI / 2, 0, 0]} style={{ pointerEvents: "none" }}>
          <div className="ms-chip-mark">MS</div>
        </Html>
      </group>
      <pointLight position={[0, 1.65, 0]} color={C.oliveBright} intensity={active ? 2.4 : 0.5} distance={4.5} />
      <mesh position={[0, 0.95, 0]} visible={false}>
        <boxGeometry args={[4.0, 2.8, 3.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {(active || selected) && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[3.78, 0.035, 3.02]} />
          <meshBasicMaterial color={C.olive} transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

function ReasoningStation({ reduceMotion, ...props }: Omit<React.ComponentProps<typeof StationShell>, "children" | "label" | "id" | "position"> & { reduceMotion: boolean }) {
  const tileRefs = useRef<Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = reduceMotion ? 14 : clock.elapsedTime % 46;
    tileRefs.current.forEach((tile, index) => {
      const activeMotion = t >= 11 && t < 19 ? 1 : 0;
      tile.position.x = -0.62 + index * 0.42 + Math.sin(t * 2 + index) * 0.12 * activeMotion;
      tile.position.z = Math.cos(t * 1.8 + index) * 0.16 * activeMotion;
    });
  });
  return (
    <StationShell {...props} id="reasoning" label="REASON" descriptor="TRADE-OFF MATRIX" position={[-4.35, 0, 0.78]}>
      <RoundedBox args={[1.9, 0.62, 1.3]} radius={0.12} smoothness={3} position={[0, 0.72, 0]} castShadow>
        <meshStandardMaterial color={C.navy} roughness={0.48} />
      </RoundedBox>
      {[-0.62, -0.2, 0.22, 0.64].map((x, index) => (
        <mesh key={x} ref={(node) => { if (node) tileRefs.current[index] = node; }} position={[x, 1.08, 0]} castShadow>
          <boxGeometry args={[0.28, 0.13, 0.4]} />
          <meshStandardMaterial color={index === 1 ? C.amber : C.oliveBright} emissive={index === 1 ? C.amber : C.olive} emissiveIntensity={0.36} />
        </mesh>
      ))}
    </StationShell>
  );
}

function RobotTool({ side, reduceMotion }: { side: -1 | 1; reduceMotion: boolean }) {
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!shoulder.current || !elbow.current) return;
    const t = reduceMotion ? 23 : clock.elapsedTime % 46;
    const moving = (t >= 19 && t < 28) || (t >= 31 && t < 40) ? 1 : 0;
    shoulder.current.rotation.z = side * (0.42 + Math.sin(t * 2.1 + side) * 0.2 * moving);
    elbow.current.rotation.z = side * (-0.78 + Math.cos(t * 2.4 + side) * 0.28 * moving);
  });
  return (
    <group position={[side * 0.68, 0.56, side * 0.46]}>
      <RoundedBox args={[0.48, 0.32, 0.48]} radius={0.08} smoothness={3} castShadow>
        <meshStandardMaterial color={C.ink} />
      </RoundedBox>
      <group ref={shoulder} position={[0, 0.2, 0]}>
        <RoundedBox args={[0.24, 1.05, 0.28]} radius={0.07} smoothness={3} position={[0, 0.52, 0]} castShadow>
          <meshStandardMaterial color={C.paper} />
        </RoundedBox>
        <RoundedBox args={[0.42, 0.34, 0.42]} radius={0.08} smoothness={3} position={[0, 1.02, 0]} castShadow>
          <meshStandardMaterial color={C.olive} />
        </RoundedBox>
        <group ref={elbow} position={[0, 1.03, 0]}>
          <RoundedBox args={[0.2, 0.86, 0.24]} radius={0.06} smoothness={3} position={[0, 0.42, 0]} castShadow>
            <meshStandardMaterial color={C.navy} />
          </RoundedBox>
          <RoundedBox args={[0.48, 0.18, 0.22]} radius={0.05} smoothness={3} position={[0, 0.88, 0]} castShadow>
            <meshStandardMaterial color={C.oliveBright} emissive={C.olive} emissiveIntensity={0.4} />
          </RoundedBox>
        </group>
      </group>
    </group>
  );
}

function AssemblyStation({ reduceMotion, ...props }: Omit<React.ComponentProps<typeof StationShell>, "children" | "label" | "id" | "position"> & { reduceMotion: boolean }) {
  return (
    <StationShell {...props} id="assembly" label="BUILD" descriptor="SYSTEM ASSEMBLY" position={[3.95, 0, -3.18]}>
      <RoundedBox args={[1.45, 0.28, 1.15]} radius={0.1} smoothness={3} position={[0, 0.58, 0]} castShadow>
        <meshStandardMaterial color={C.ink} roughness={0.5} />
      </RoundedBox>
      <RobotTool side={-1} reduceMotion={reduceMotion} />
      <RobotTool side={1} reduceMotion={reduceMotion} />
    </StationShell>
  );
}

function ValidationStation({ scanRef, ...props }: Omit<React.ComponentProps<typeof StationShell>, "children" | "label" | "id" | "position"> & { scanRef: React.RefObject<Mesh | null> }) {
  return (
    <StationShell {...props} id="validation" label="VALIDATE" descriptor="TEST / REVIEW" position={[-1.2, 0, -3.18]}>
      {[-0.82, 0.82].map((z) => (
        <RoundedBox key={z} args={[0.34, 1.82, 0.34]} radius={0.07} smoothness={3} position={[0, 1.12, z]} castShadow>
          <meshStandardMaterial color={C.paper} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.38, 0.3, 1.98]} radius={0.07} smoothness={3} position={[0, 2.05, 0]} castShadow>
        <meshStandardMaterial color={C.navy} />
      </RoundedBox>
      <mesh ref={scanRef} position={[0, 1.0, 0]}>
        <boxGeometry args={[0.12, 1.45, 1.45]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.25} />
      </mesh>
    </StationShell>
  );
}

function Portal({ active, selected, onSelect, doorRefs, surfaceRef }: { active: boolean; selected: boolean; onSelect: (id: StudioStationId) => void; doorRefs: React.MutableRefObject<Mesh[]>; surfaceRef: React.RefObject<Mesh | null> }) {
  return (
    <group position={[-6.2, 0.16, -3.18]} onClick={(event) => { event.stopPropagation(); onSelect("shipping"); }}>
      {[-1.12, 1.12].map((z) => (
        <RoundedBox key={z} args={[0.48, 3.1, 0.42]} radius={0.1} smoothness={3} position={[0, 1.58, z]} castShadow>
          <meshStandardMaterial color={C.paper} emissive={active || selected ? C.olive : C.paper} emissiveIntensity={active || selected ? 0.18 : 0} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.48, 0.42, 2.65]} radius={0.1} smoothness={3} position={[0, 3.02, 0]} castShadow>
        <meshStandardMaterial color={C.navy} />
      </RoundedBox>
      <mesh ref={surfaceRef} position={[0.04, 1.58, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 2.45, 14, 18]} />
        <meshBasicMaterial color={C.oliveBright} side={DoubleSide} transparent opacity={0} />
      </mesh>
      {[-1, 1].map((side, index) => (
        <mesh key={side} ref={(node) => { if (node) doorRefs.current[index] = node; }} position={[-0.08, 1.58, side * 0.48]} castShadow>
          <boxGeometry args={[0.3, 2.42, 0.96]} />
          <meshStandardMaterial color={C.ink} roughness={0.4} />
        </mesh>
      ))}
      <group position={[-0.27, 2.72, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <PhysicalLabel title="SHIP" subtitle={active ? "GATEWAY OPEN" : "GATEWAY READY"} />
      </group>
      <pointLight position={[-0.8, 1.55, 0]} color={C.oliveBright} intensity={active ? 4.5 : 0.4} distance={5} />
    </group>
  );
}

function Carrier({ carrierRef, rawRef, productRef, warningRef }: { carrierRef: React.RefObject<Group | null>; rawRef: React.RefObject<Group | null>; productRef: React.RefObject<Group | null>; warningRef: React.RefObject<Mesh | null> }) {
  return (
    <group ref={carrierRef}>
      <RoundedBox args={[1.15, 0.18, 0.82]} radius={0.11} smoothness={3} castShadow>
        <meshStandardMaterial color={C.ink} roughness={0.44} />
      </RoundedBox>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.94, 0.06, 0.66]} />
        <meshBasicMaterial color={C.olive} />
      </mesh>
      <group ref={rawRef} position={[0, 0.32, 0]}>
        <RoundedBox args={[0.28, 0.3, 0.28]} radius={0.05} smoothness={2} position={[-0.27, 0, 0.1]} castShadow>
          <meshStandardMaterial color={C.warmWhite} />
        </RoundedBox>
        <RoundedBox args={[0.24, 0.2, 0.35]} radius={0.05} smoothness={2} position={[0.12, 0.03, -0.12]} rotation={[0.2, 0.3, 0.1]} castShadow>
          <meshStandardMaterial color={C.oliveBright} emissive={C.olive} emissiveIntensity={0.28} />
        </RoundedBox>
        <RoundedBox args={[0.18, 0.38, 0.18]} radius={0.04} smoothness={2} position={[0.34, 0, 0.18]} rotation={[0.1, -0.25, 0.15]} castShadow>
          <meshStandardMaterial color={C.amber} />
        </RoundedBox>
      </group>
      <group ref={productRef} visible={false} position={[0, 0.35, 0]}>
        <RoundedBox args={[0.72, 0.48, 0.6]} radius={0.12} smoothness={4} castShadow>
          <meshStandardMaterial color={C.paper} roughness={0.52} />
        </RoundedBox>
        <RoundedBox args={[0.34, 0.28, 0.34]} radius={0.07} smoothness={3} position={[0, 0.28, 0]} castShadow>
          <meshStandardMaterial color={C.ink} emissive={C.olive} emissiveIntensity={0.55} />
        </RoundedBox>
        <mesh ref={warningRef} position={[0.38, 0.1, 0.18]}>
          <boxGeometry args={[0.12, 0.18, 0.12]} />
          <meshStandardMaterial color={C.olive} emissive={C.olive} emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function MovingProcess({ active, reduceMotion, onStageChange, scanRef, doorRefs, surfaceRef }: { active: boolean; reduceMotion: boolean; onStageChange: (id: StudioStationId) => void; scanRef: React.RefObject<Mesh | null>; doorRefs: React.MutableRefObject<Mesh[]>; surfaceRef: React.RefObject<Mesh | null> }) {
  const carrierRef = useRef<Group>(null);
  const rawRef = useRef<Group>(null);
  const productRef = useRef<Group>(null);
  const warningRef = useRef<Mesh>(null);
  const pulseRefs = useRef<Mesh[]>([]);
  const lastStage = useRef<StudioStationId>("intake");

  useFrame(({ clock }, delta) => {
    if (!active || !carrierRef.current) return;
    const t = reduceMotion ? 41 : clock.elapsedTime % 46;
    let stage: StudioStationId = "intake";
    let position = pointOnPath(inputToContext, 0);
    const travel = (path: Point2[], start: number, end: number) => pointOnPath(path, smooth((t - start) / (end - start)));

    if (t < 3) {
      stage = "intake";
      position = travel(inputToContext, 0, 3);
    } else if (t < 5) {
      stage = "context";
      position = pointOnPath(inputToContext, 1);
    } else if (t < 8) {
      stage = "context";
      position = travel(contextToCore, 5, 8);
    } else if (t < 11) {
      stage = "orchestration";
      position = pointOnPath(contextToCore, 1);
    } else if (t < 14) {
      stage = "reasoning";
      position = travel(coreToReason, 11, 14);
    } else if (t < 16) {
      stage = "reasoning";
      position = pointOnPath(coreToReason, 1);
    } else if (t < 19) {
      stage = "orchestration";
      position = travel(reasonToCore, 16, 19);
    } else if (t < 22) {
      stage = "assembly";
      position = travel(coreToBuild, 19, 22);
    } else if (t < 25) {
      stage = "assembly";
      position = pointOnPath(coreToBuild, 1);
    } else if (t < 28) {
      stage = "validation";
      position = travel(buildToValidate, 25, 28);
    } else if (t < 31) {
      stage = "validation";
      position = pointOnPath(buildToValidate, 1);
    } else if (t < 34) {
      stage = "assembly";
      position = travel(validateToBuild, 31, 34);
    } else if (t < 37) {
      stage = "assembly";
      position = pointOnPath(validateToBuild, 1);
    } else if (t < 40) {
      stage = "validation";
      position = travel(buildToValidate, 37, 40);
    } else if (t < 43) {
      stage = "validation";
      position = pointOnPath(buildToValidate, 1);
    } else {
      stage = "shipping";
      position = travel(validateToPortal, 43, 46);
    }

    if (stage !== lastStage.current) {
      lastStage.current = stage;
      onStageChange(stage);
    }

    carrierRef.current.position.set(position.x, 0.83, position.z);
    carrierRef.current.rotation.y = position.angle;

    if (rawRef.current && productRef.current) {
      rawRef.current.visible = t < 22.2;
      productRef.current.visible = t >= 21.7;
      const buildScale = smooth((t - 21.7) / 2.1);
      productRef.current.scale.setScalar(buildScale);
    }

    if (warningRef.current) {
      const failing = t >= 25 && t < 37;
      const material = warningRef.current.material as MeshStandardMaterial;
      material.color.set(failing ? C.amber : C.olive);
      material.emissive.set(failing ? C.amber : C.olive);
      material.emissiveIntensity = failing ? 1.2 + Math.sin(t * 8) * 0.35 : 0.7;
    }

    if (scanRef.current) {
      const scanning = stage === "validation";
      scanRef.current.visible = scanning;
      scanRef.current.position.x = scanning ? Math.sin(t * 3.6) * 0.68 : 0;
      const material = scanRef.current.material as MeshStandardMaterial;
      material.opacity = scanning ? 0.22 + Math.sin(t * 6) * 0.08 : 0;
      material.color.set(t < 37 ? C.amber : C.olive);
    }

    const portalOpening = smooth((t - 42.7) / 0.8) * (1 - smooth((t - 45.45) / 0.5));
    doorRefs.current.forEach((door, index) => {
      door.position.z = (index === 0 ? -1 : 1) * (0.48 + portalOpening * 0.62);
    });
    if (surfaceRef.current) {
      const material = surfaceRef.current.material as MeshStandardMaterial;
      material.opacity = portalOpening * 0.72;
      surfaceRef.current.scale.y = 0.12 + portalOpening * 0.88;
    }

    pulseRefs.current.forEach((pulse, index) => {
      const pulsePosition = pointOnPath(pulsePath, (t * 0.038 + index * 0.29) % 1);
      pulse.position.set(pulsePosition.x, 0.62, pulsePosition.z);
      pulse.rotation.y = pulsePosition.angle;
      pulse.visible = !reduceMotion;
    });

    if (t > 45.25 && carrierRef.current.position.x < -5.65) {
      carrierRef.current.scale.setScalar(Math.max(0, 1 - (t - 45.25) / 0.65));
    } else {
      carrierRef.current.scale.setScalar(MathUtils.lerp(carrierRef.current.scale.x, 1, delta * 5));
    }
  });

  return (
    <group>
      <Carrier carrierRef={carrierRef} rawRef={rawRef} productRef={productRef} warningRef={warningRef} />
      {[0, 1, 2].map((index) => (
        <mesh key={index} ref={(node) => { if (node) pulseRefs.current[index] = node; }}>
          <boxGeometry args={[0.65, 0.035, 0.44]} />
          <meshBasicMaterial color={C.oliveBright} transparent opacity={0.54} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ active, reduceMotion, selected, resetSignal, onSelect, onStageChange }: StudioProps) {
  const controlsRef = useRef<any>(null);
  const scanRef = useRef<Mesh>(null);
  const doorRefs = useRef<Mesh[]>([]);
  const surfaceRef = useRef<Mesh>(null);
  const [stage, setStage] = useState<StudioStationId>("intake");
  const target = selected ? stationTargets[selected] : [0, 0.8, 0] as [number, number, number];

  useEffect(() => {
    controlsRef.current?.reset();
  }, [resetSignal]);

  const setActiveStage = (id: StudioStationId) => {
    setStage(id);
    onStageChange(id);
  };

  return (
    <>
      <ResponsiveCamera />
      <ambientLight intensity={1.45} />
      <hemisphereLight color="#fff8e9" groundColor="#bcc1b4" intensity={1.75} />
      <directionalLight castShadow position={[-5, 12, 9]} color="#fff8e9" intensity={3.6} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={9} shadow-camera-bottom={-8} />
      <pointLight position={[0, 5.5, 2.5]} color={C.oliveBright} intensity={1.5} distance={12} />

      <group position={[0, -0.15, 0]}>
        <TrackNetwork />
        <InputStation active={stage === "intake"} selected={selected === "intake"} onSelect={onSelect} />
        <ContextStation active={stage === "context"} selected={selected === "context"} onSelect={onSelect} />
        <MSCore active={stage === "orchestration"} selected={selected === "orchestration"} onSelect={onSelect} reduceMotion={reduceMotion} />
        <ReasoningStation active={stage === "reasoning"} selected={selected === "reasoning"} onSelect={onSelect} reduceMotion={reduceMotion} />
        <AssemblyStation active={stage === "assembly"} selected={selected === "assembly"} onSelect={onSelect} reduceMotion={reduceMotion} />
        <ValidationStation active={stage === "validation"} selected={selected === "validation"} onSelect={onSelect} scanRef={scanRef} />
        <Portal active={stage === "shipping"} selected={selected === "shipping"} onSelect={onSelect} doorRefs={doorRefs} surfaceRef={surfaceRef} />
        <MovingProcess active={active} reduceMotion={reduceMotion} onStageChange={setActiveStage} scanRef={scanRef} doorRefs={doorRefs} surfaceRef={surfaceRef} />
      </group>

      <ContactShadows position={[0, -0.24, 0]} opacity={0.25} scale={24} blur={2.8} far={11} color="#10212a" />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={target}
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.07}
        minDistance={12}
        maxDistance={30}
        minPolarAngle={0.58}
        maxPolarAngle={1.38}
        autoRotate={false}
      />
    </>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (size.width < 700) {
      camera.position.set(-15, 19, -27);
    } else if (size.width < 900) {
      camera.position.set(-13, 18, -25);
    } else {
      camera.position.set(-10, 16, -22);
    }
    camera.lookAt(0, 0.8, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width]);

  return null;
}

export function AppliedIntelligenceStudio(props: StudioProps) {
  const cameraPosition = useMemo(() => new Vector3(-10, 16, -22), []);
  return (
    <Canvas
      shadows
      dpr={[1, 1.65]}
      camera={{ position: cameraPosition, fov: 20, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <Scene {...props} />
    </Canvas>
  );
}
