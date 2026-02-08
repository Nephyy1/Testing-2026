import React, { useRef, useEffect, useMemo } from 'react';
import { Container, Sprite, useTick, useApp } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { sampleTextCoordinates } from '../logic/textSampler';

const COUNT = 2000; 

const ParticleSystem = ({ gestureRef, width, height, isRunning }) => {
  const app = useApp();
  const containerRef = useRef(null);
  
  // Data fisik partikel (velocity, target, dll) disimpan di ref, bukan state
  const physicsData = useRef(new Float32Array(COUNT * 6)); // x, y, vx, vy, baseX, baseY
  const spritesRef = useRef([]);
  const textCoords = useRef([]);

  const texture = useMemo(() => {
    const g = new PIXI.Graphics();
    g.beginFill(0xFFFFFF);
    g.drawCircle(0, 0, 2); 
    g.endFill();
    return app.renderer.generateTexture(g);
  }, [app]);

  useEffect(() => {
    if (!isRunning) return;

    textCoords.current = sampleTextCoordinates("I LOVE YOU", width, height);
    
    // Inisialisasi posisi acak
    for (let i = 0; i < COUNT; i++) {
      const idx = i * 6;
      physicsData.current[idx] = Math.random() * width;      // x
      physicsData.current[idx + 1] = Math.random() * height; // y
      physicsData.current[idx + 2] = 0;                      // vx
      physicsData.current[idx + 3] = 0;                      // vy
      physicsData.current[idx + 4] = physicsData.current[idx]; // baseX
      physicsData.current[idx + 5] = physicsData.current[idx + 1]; // baseY
    }
  }, [width, height, isRunning]);

  useTick((delta) => {
    if (!isRunning || !containerRef.current) return;

    const { type, point } = gestureRef.current;
    const data = physicsData.current;
    const sprites = containerRef.current.children;
    const coords = textCoords.current;
    const coordsLen = coords.length;

    let targetX = -5000;
    let targetY = -5000;
    
    if (point) {
      targetX = (1 - point.x) * width;
      targetY = point.y * height;
    }

    const isLove = type === 'HEART';
    const isOpen = type === 'OPEN_PALM';
    const isIndex = type === 'INDEX';

    // Loop optimasi tinggi tanpa alokasi memori baru
    for (let i = 0; i < COUNT; i++) {
      const sprite = sprites[i];
      if (!sprite) continue;

      const idx = i * 6;
      let px = data[idx];
      let py = data[idx + 1];
      let vx = data[idx + 2];
      let vy = data[idx + 3];
      const bx = data[idx + 4];
      const by = data[idx + 5];

      let fx = 0;
      let fy = 0;
      let friction = 0.92;

      if (isLove && coordsLen > 0) {
        const tIdx = i % coordsLen;
        const tx = coords[tIdx].x;
        const ty = coords[tIdx].y;
        
        fx = (tx - px) * 0.08;
        fy = (ty - py) * 0.08;
        friction = 0.80;
        
        sprite.tint = 0xFF69B4; 
      } else {
        const dx = px - targetX;
        const dy = py - targetY;
        const distSq = dx*dx + dy*dy;
        
        // Optimasi: Hindari Math.sqrt jika tidak perlu
        if (isOpen) {
           if (distSq < 90000) { // 300^2
             const dist = Math.sqrt(distSq);
             const force = (300 - dist) / 300;
             fx = (dx / dist) * force * 5;
             fy = (dy / dist) * force * 5;
           }
        } else if (isIndex) {
           if (distSq < 40000) { // 200^2
             const dist = Math.sqrt(distSq);
             fx = -(dx / dist) * 2;
             fy = -(dy / dist) * 2;
           }
        }

        if (!isLove && !isOpen && !isIndex) {
           fx += (bx - px) * 0.002;
           fy += (by - py) * 0.002;
           sprite.tint = 0x88CCFF; 
        } else {
           sprite.tint = 0x88CCFF;
        }
      }

      vx += fx;
      vy += fy;
      vx *= friction;
      vy *= friction;
      px += vx * delta;
      py += vy * delta;

      // Simpan kembali ke array
      data[idx] = px;
      data[idx + 1] = py;
      data[idx + 2] = vx;
      data[idx + 3] = vy;

      // Update Sprite Langsung (Bypass React)
      sprite.x = px;
      sprite.y = py;
    }
  });

  // Render awal sprite statis. React hanya render ini SEKALI.
  const initialSprites = useMemo(() => {
    return Array.from({ length: COUNT }).map((_, i) => (
      <Sprite
        key={i}
        texture={texture}
        x={-100} // Spawn di luar layar dulu
        y={-100}
        anchor={0.5}
        scale={Math.random() * 0.5 + 0.5}
        alpha={Math.random() * 0.6 + 0.2}
      />
    ));
  }, [texture]);

  return (
    <Container ref={containerRef}>
      {initialSprites}
    </Container>
  );
};

export default ParticleSystem;
          
