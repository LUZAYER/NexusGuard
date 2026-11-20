'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

const NODE_COUNT = 320;
const CONNECTION_DISTANCE = 110;
const FIELD_SIZE = 650;
const PULSE_COUNT = 36;

interface FinancialNode {
  position: THREE.Vector3;
  basePosition: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;
  speed: number;
  isMuleNode: boolean;
  tier: number; // 0: Normal, 1: High Velocity, 2: Flagged Mule
}

interface PulsePacket {
  startNode: number;
  endNode: number;
  progress: number;
  speed: number;
  color: THREE.Color;
}

export default function NeuralBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const scrollYRef = useRef(0);
  const targetScrollFraction = useRef(0);
  const currentScrollFraction = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const timeRef = useRef(0);

  const handleScroll = useCallback(() => {
    const scrollMax = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    scrollYRef.current = window.scrollY;
    targetScrollFraction.current = Math.min(Math.max(window.scrollY / scrollMax, 0), 1);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // ── WebGL Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ──────────────────────────────────────────────
    const isLightMode = () => document.documentElement.classList.contains('light');

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isLightMode() ? 0xfbfcfd : 0x050608, 0.0012);
    scene.fog = new THREE.FogExp2(0x020617, 0.0012);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      2500
    );
    camera.position.set(0, 20, 520);

    // ── Color Palette: FinTech Threat & Compliance Colors ───────────
    const colorNormal = new THREE.Color(0x06b6d4); // Cyan-500 (Verified clearing)
    const colorRelay = new THREE.Color(0x6366f1);  // Indigo-500 (Interbank relay)
    const colorAnomaly = new THREE.Color(0xf59e0b); // Amber-500 (Velocity anomaly)
    const colorMule = new THREE.Color(0xef4444);    // Crimson-500 (Mule syndicate)
    const colorCore = new THREE.Color(0x10b981);    // Emerald-500 (Core settlement)

    // ── 3D Financial Nodes ──────────────────────────────────────────
    const nodes: FinancialNode[] = [];
    const posArray = new Float32Array(NODE_COUNT * 3);
    const colorArray = new Float32Array(NODE_COUNT * 3);
    const sizeArray = new Float32Array(NODE_COUNT);

    for (let i = 0; i < NODE_COUNT; i++) {
      // 15% of nodes form suspicious clustered money mule rings
      const isMule = i < 45;
      const isAnomaly = !isMule && i < 90;
      const tier = isMule ? 2 : isAnomaly ? 1 : 0;

      let x: number, y: number, z: number;
      if (isMule) {
        // Clustered off-center in a tight high-risk ring
        const angle = (i / 45) * Math.PI * 2;
        const radius = 90 + (Math.random() - 0.5) * 40;
        x = Math.cos(angle) * radius + 140;
        y = Math.sin(angle) * radius - 40;
        z = (Math.random() - 0.5) * 80 + 30;
      } else {
        // Distributed institutional financial lattice
        x = (Math.random() - 0.5) * FIELD_SIZE;
        y = (Math.random() - 0.5) * (FIELD_SIZE * 0.85);
        z = (Math.random() - 0.5) * (FIELD_SIZE * 0.6);
      }

      nodes.push({
        position: new THREE.Vector3(x, y, z),
        basePosition: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.15
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        isMuleNode: isMule,
        tier,
      });

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      let nodeColor = colorNormal;
      let nodeSize = 3.2;

      if (isMule) {
        nodeColor = colorMule;
        nodeSize = 4.8;
      } else if (isAnomaly) {
        nodeColor = colorAnomaly;
        nodeSize = 3.8;
      } else if (i % 7 === 0) {
        nodeColor = colorCore;
        nodeSize = 4.2;
      } else if (i % 3 === 0) {
        nodeColor = colorRelay;
        nodeSize = 3.4;
      }

      colorArray[i * 3] = nodeColor.r;
      colorArray[i * 3 + 1] = nodeColor.g;
      colorArray[i * 3 + 2] = nodeColor.b;
      sizeArray[i] = nodeSize;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    nodeGeo.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

    const nodeMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const nodePoints = new THREE.Points(nodeGeo, nodeMat);

    // ── 3D Financial Filaments (Transaction Links) ──────────────────
    const maxLines = NODE_COUNT * 6;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.42,
    });

    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);

    // ── Central Decision Polyhedron (Holographic Cryptographic Core) ──
    const coreGroup = new THREE.Group();

    // Outer wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(75, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    coreGroup.add(icoMesh);

    // Inner glowing settlement nucleus
    const innerGeo = new THREE.SphereGeometry(32, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 3 Concentric Orbital Compliance Rings
    const ringGroup = new THREE.Group();
    const ringColors = [0x06b6d4, 0x818cf8, 0x10b981];
    const ringRadii = [110, 145, 185];

    ringRadii.forEach((radius, idx) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.7, radius + 0.7, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[idx],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2 + idx * 0.35;
      ringMesh.rotation.y = idx * 0.4;
      ringGroup.add(ringMesh);
    });

    // ── 3D Flow Packets (Luminous Transaction Pulses) ───────────────
    const pulses: PulsePacket[] = [];
    for (let p = 0; p < PULSE_COUNT; p++) {
      const start = Math.floor(Math.random() * NODE_COUNT);
      let end = Math.floor(Math.random() * NODE_COUNT);
      if (end === start) end = (start + 1) % NODE_COUNT;
      pulses.push({
        startNode: start,
        endNode: end,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.012,
        color: nodes[start].isMuleNode ? colorMule : colorNormal,
      });
    }

    const pulseGeo = new THREE.BufferGeometry();
    const pulsePositions = new Float32Array(PULSE_COUNT * 3);
    const pulseColors = new Float32Array(PULSE_COUNT * 3);
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    pulseGeo.setAttribute('color', new THREE.BufferAttribute(pulseColors, 3));

    const pulseMat = new THREE.PointsMaterial({
      size: 5.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat);

    // ── Assemble Master Hierarchy ───────────────────────────────────
    const masterWorld = new THREE.Group();
    masterWorld.add(nodePoints);
    masterWorld.add(lineSegments);
    masterWorld.add(coreGroup);
    masterWorld.add(ringGroup);
    masterWorld.add(pulsePoints);
    scene.add(masterWorld);

    // ── Window Resize ───────────────────────────────────────────────
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll();

    // ── Main Animation & Scroll Interpolation Loop ──────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.009;
      const t = timeRef.current;

      // Mouse smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Scroll interpolation (critically damped for silky response)
      currentScrollFraction.current +=
        (targetScrollFraction.current - currentScrollFraction.current) * 0.06;
      const sf = currentScrollFraction.current;

      // ── Multi-Stage 3D Camera Path on Scroll ───────────────────────
      // Stage 0 (Hero: 0.0 - 0.25): Centered panoramic perspective
      // Stage 1 (Features & Radar: 0.25 - 0.5): Deep descent into high-speed financial grid
      // Stage 2 (Graph & Mule Rings: 0.5 - 0.75): Elevated orbital focus on high-risk cluster
      // Stage 3 (AI Investigation & Docs: 0.75 - 1.0): Expansive wide-angle command overview
      let targetCamX = 0;
      let targetCamY = 20;
      let targetCamZ = 520;

      if (sf < 0.25) {
        const u = sf / 0.25;
        targetCamX = THREE.MathUtils.lerp(0, -90, u);
        targetCamY = THREE.MathUtils.lerp(20, -40, u);
        targetCamZ = THREE.MathUtils.lerp(520, 380, u);
      } else if (sf < 0.6) {
        const u = (sf - 0.25) / 0.35;
        targetCamX = THREE.MathUtils.lerp(-90, 130, u);
        targetCamY = THREE.MathUtils.lerp(-40, 110, u);
        targetCamZ = THREE.MathUtils.lerp(380, 420, u);
      } else {
        const u = (sf - 0.6) / 0.4;
        targetCamX = THREE.MathUtils.lerp(130, 0, u);
        targetCamY = THREE.MathUtils.lerp(110, 10, u);
        targetCamZ = THREE.MathUtils.lerp(420, 560, u);
      }

      // Add smooth mouse parallax
      targetCamX += mouseRef.current.x * 45;
      targetCamY -= mouseRef.current.y * 35;

      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);

      // ── Spatial Mesh Transformation ───────────────────────────────
      masterWorld.rotation.y = sf * Math.PI * 1.8 + t * 0.04;
      masterWorld.rotation.x = sf * 0.5 + Math.sin(t * 0.15) * 0.06;

      // Core rotation
      icoMesh.rotation.x = t * 0.2;
      icoMesh.rotation.y = t * 0.35;
      innerMesh.rotation.y = -t * 0.4;

      // Ring pulsation & slow orbit
      ringGroup.children.forEach((ring, idx) => {
        ring.rotation.z = t * (0.1 + idx * 0.08) * (idx % 2 === 0 ? 1 : -1);
      });

      // ── Dynamic Node Breathing & Drift ────────────────────────────
      const posAttr = nodeGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < NODE_COUNT; i++) {
        const node = nodes[i];
        const breathe = Math.sin(t * node.speed + node.phase) * (node.isMuleNode ? 12 : 7);

        const nx = node.basePosition.x + Math.sin(t * 0.3 + node.phase) * 12 + breathe * 0.4;
        const ny = node.basePosition.y + Math.cos(t * 0.25 + node.phase) * 12 + breathe * 0.8;
        const nz = node.basePosition.z + Math.sin(t * 0.2 + node.phase) * 10;

        node.position.set(nx, ny, nz);
        posAttr.setXYZ(i, nx, ny, nz);
      }
      posAttr.needsUpdate = true;

      // ── Financial Link Calculation & Dynamic Edges ────────────────
      let lineIdx = 0;
      const linePosAttr = lineGeo.attributes.position as THREE.BufferAttribute;
      const lineColorAttr = lineGeo.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < NODE_COUNT && lineIdx < maxLines; i++) {
        for (let j = i + 1; j < NODE_COUNT && lineIdx < maxLines; j++) {
          const dist = nodes[i].position.distanceTo(nodes[j].position);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = 1 - dist / CONNECTION_DISTANCE;

            linePosAttr.setXYZ(
              lineIdx * 2,
              nodes[i].position.x,
              nodes[i].position.y,
              nodes[i].position.z
            );
            linePosAttr.setXYZ(
              lineIdx * 2 + 1,
              nodes[j].position.x,
              nodes[j].position.y,
              nodes[j].position.z
            );

            // Color-code link by threat level
            let edgeR = 0.02 + alpha * 0.35;
            let edgeG = 0.5 + alpha * 0.4;
            let edgeB = 0.8;

            if (nodes[i].isMuleNode || nodes[j].isMuleNode) {
              edgeR = 0.95;
              edgeG = 0.15;
              edgeB = 0.2;
            } else if (nodes[i].tier === 1 || nodes[j].tier === 1) {
              edgeR = 0.9;
              edgeG = 0.6;
              edgeB = 0.1;
            }

            lineColorAttr.setXYZ(lineIdx * 2, edgeR * alpha, edgeG * alpha, edgeB * alpha);
            lineColorAttr.setXYZ(
              lineIdx * 2 + 1,
              edgeR * alpha * 0.6,
              edgeG * alpha * 0.6,
              edgeB * alpha * 0.8
            );

            lineIdx++;
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx * 2);
      linePosAttr.needsUpdate = true;
      lineColorAttr.needsUpdate = true;

      // ── Animate Luminous Transaction Pulses ─────────────────────────
      const pulsePosAttr = pulseGeo.attributes.position as THREE.BufferAttribute;
      const pulseColorAttr = pulseGeo.attributes.color as THREE.BufferAttribute;

      for (let p = 0; p < PULSE_COUNT; p++) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.startNode = Math.floor(Math.random() * NODE_COUNT);
          pulse.endNode = (pulse.startNode + 1 + Math.floor(Math.random() * 8)) % NODE_COUNT;
        }

        const startPos = nodes[pulse.startNode].position;
        const endPos = nodes[pulse.endNode].position;

        const curX = THREE.MathUtils.lerp(startPos.x, endPos.x, pulse.progress);
        const curY = THREE.MathUtils.lerp(startPos.y, endPos.y, pulse.progress);
        const curZ = THREE.MathUtils.lerp(startPos.z, endPos.z, pulse.progress);

        pulsePosAttr.setXYZ(p, curX, curY, curZ);

        const pColor = nodes[pulse.startNode].isMuleNode ? colorMule : colorNormal;
        pulseColorAttr.setXYZ(p, pColor.r, pColor.g, pColor.b);
      }
      pulsePosAttr.needsUpdate = true;
      pulseColorAttr.needsUpdate = true;

      const light = isLightMode();
      nodeMat.opacity = light ? 0.6 : 0.9;
      lineMat.opacity = light ? 0.25 : 0.42;
      scene.fog = new THREE.FogExp2(light ? 0xf8fafc : 0x050608, 0.0012);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);

      renderer.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleScroll, handleMouseMove]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
