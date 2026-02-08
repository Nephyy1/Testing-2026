import React, { useRef, useEffect, useMemo } from 'react';
import { Container, Sprite, useTick, useApp } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { sampleTextCoordinates } from '../logic/textSampler';

const COUNT = 800; // Jumlah dikurangi drastis agar ringan
const TEXT_PHRASE = "I LOVE YOU";

const ParticleSystem = ({ gestureRef, width, height, isRunning }) => {
  const app = useApp();
  const containerRef = useRef(null);
  
  // x, y, vx, vy, originX, originY, currentAlpha
  const physicsData = useRef(new Float32Array(COUNT * 7)); 
  const textCoords = useRef([]);

  const texture = useMemo(() => {
    const g = new PIXI.Graphics();
    g.beginFill(0xFFFFFF);
    g.drawCircle(0, 0, 3); // Ukuran sedikit lebih besar agar jelas
    g.endFill();
    return app.renderer.generateTexture(g);
  }, [app]);

  useEffect(() => {
    if (!isRunning) return;

    textCoords.current = sampleTextCoordinates(TEXT_PHRASE, width, height);
    const data = physicsData.current;

    // Partikel berkumpul di tengah (bukan full screen)
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 7;
      // Posisi awal acak tapi tetap di area tengah (radius 100px)
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 100;

      data[idx] = centerX + Math.cos(angle) * radius;     // x
      data[idx + 1] = centerY + Math.sin(angle) * radius; // y
      data[idx + 2] = 0; // vx
      data[idx + 3] = 0; // vy
      data[idx + 4] = data[idx]; // originX
      data[idx + 5] = data[idx + 1]; // originY
      data[idx + 6] = 0; // alpha mulai dari 0 (invisible)
    }
  }, [width, height, isRunning]);

  useTick((delta) => {
    if (!isRunning || !containerRef.current) return;

    const { type, point } = gestureRef.current;
    const data = physicsData.current;
    const sprites = containerRef.current.children;
    const coords = textCoords.current;
    const len = coords.length;

    let targetX = -5000;
    let targetY = -5000;
    let isHandActive = false;

    if (point) {
      targetX = (1 - point.x) * width;
      targetY = point.y * height;
      isHandActive = true;
    }

    const isLove = type === 'HEART';
    const isOpen = type === 'OPEN_PALM';

    for (let i = 0; i < COUNT; i++) {
      const sprite = sprites[i];
      if (!sprite) continue;

      const idx = i * 7;
      let px = data[idx];
      let py = data[idx + 1];
      let vx = data[idx + 2];
      let vy = data[idx + 3];
      const ox = data[idx + 4];
      const oy = data[idx + 5];
      let alpha = data[idx + 6];

      let fx = 0;
      let fy = 0;
      let targetAlpha = 0.1; // Default redup sekali

      if (isLove && len > 0) {
        // Mode Love: Formasi Teks (Semua menyala)
        const tIdx = i % len;
        const tx = coords[tIdx].x;
        const ty = coords[tIdx].y;
        
        fx = (tx - px) * 0.1; // Tarikan kuat
        fy = (ty - py) * 0.1;
        
        vx *= 0.8; // Redam kecepatan
        vy *= 0.8;
        targetAlpha = 1; // Full bright
        sprite.tint = 0xFF1493; // Deep Pink

      } else {
        // Fisika Interaksi Tangan
        const dx = px - targetX;
        const dy = py - targetY;
        const distSq = dx*dx + dy*dy;

        // Logika Cahaya: Hanya nyala jika dekat tangan
        if (isHandActive && distSq < 90000) { // Radius 300px
             targetAlpha = 1 - (Math.sqrt(distSq) / 300);
        }

        if (isOpen) {
          if (distSq < 40000) { // Repulse
            const dist = Math.sqrt(distSq);
            const force = (200 - dist) / 200;
            fx = (dx / dist) * force * 5;
            fy = (dy / dist) * force * 5;
          }
        } else if (isHandActive) {
          // Mode Magnet (Index Finger)
           if (distSq < 60000) {
             const dist = Math.sqrt(distSq);
             fx = -(dx / dist) * 1.5;
             fy = -(dy / dist) * 1.5;
           }
        }

        // Return to Origin (Floating dust effect)
        if (!isHandActive && !isLove) {
            const homeDx = ox - px;
            const homeDy = oy - py;
            fx += homeDx * 0.005;
            fy += homeDy * 0.005;
        }

        vx *= 0.92;
        vy *= 0.92;
        sprite.tint = 0xAADDFF;
      }

      vx += fx;
      vy += fy;
      px += vx * delta;
      py += vy * delta;

      // Smooth Alpha Transition
      alpha += (targetAlpha - alpha) * 0.1;

      data[idx] = px;
      data[idx + 1] = py;
      data[idx + 2] = vx;
      data[idx + 3] = vy;
      data[idx + 6] = alpha;

      sprite.x = px;
      sprite.y = py;
      sprite.alpha = alpha; // Set transparansi dinamis
    }
  });

  const initialSprites = useMemo(() => {
    return Array.from({ length: COUNT }).map((_, i) => (
      <Sprite
        key={i}
        texture={texture}
        x={width/2} // Awal di tengah
        y={height/2}
        anchor={0.5}
        alpha={0} // Mulai invisible
      />
    ));
  }, [texture, width, height]);

  return (
    <Container ref={containerRef}>
      {initialSprites}
    </Container>
  );
};

export default ParticleSystem;
