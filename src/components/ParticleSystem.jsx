import React, { useRef, useEffect, useState } from 'react';
import { Container, Sprite, useTick, useApp } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { sampleTextCoordinates } from '../logic/textSampler';

const COUNT = 2500;

const ParticleSystem = ({ gestureRef, width, height }) => {
  const [particles, setParticles] = useState([]);
  const app = useApp();
  const particleData = useRef([]);
  const textureRef = useRef(null);
  const textCoords = useRef([]);

  useEffect(() => {
    const g = new PIXI.Graphics();
    g.beginFill(0xFFFFFF);
    g.drawCircle(0, 0, 3);
    g.endFill();
    textureRef.current = app.renderer.generateTexture(g);

    const initial = [];
    const pData = [];

    for (let i = 0; i < COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      initial.push({ 
        key: i, 
        x, 
        y, 
        alpha: Math.random() * 0.5 + 0.3,
        scale: Math.random() * 0.5 + 0.5
      });
      
      pData.push({
        x, y,
        vx: 0, vy: 0,
        baseX: x, baseY: y,
        friction: 0.95,
        targetX: null, targetY: null
      });
    }

    setParticles(initial);
    particleData.current = pData;
    textCoords.current = sampleTextCoordinates("I LOVE YOU", width, height);

  }, [width, height, app]);

  useTick((delta) => {
    const { type, point } = gestureRef.current;
    const pData = particleData.current;
    
    let targetX = -1000;
    let targetY = -1000;

    if (point) {
      targetX = (1 - point.x) * width;
      targetY = point.y * height;
    }

    const isLove = type === 'HEART';
    const isOpen = type === 'OPEN_PALM';

    pData.forEach((p, i) => {
      let fx = 0;
      let fy = 0;

      if (isLove && textCoords.current.length > 0) {
        const tIndex = i % textCoords.current.length;
        const tx = textCoords.current[tIndex].x;
        const ty = textCoords.current[tIndex].y;
        
        fx = (tx - p.x) * 0.05;
        fy = (ty - p.y) * 0.05;
        p.friction = 0.85;
      } else {
        const dx = p.x - targetX;
        const dy = p.y - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (isOpen) {
          if (dist < 300) {
            const force = (300 - dist) / 300;
            fx = (dx / dist) * force * 3;
            fy = (dy / dist) * force * 3;
          }
        } else if (type === 'INDEX') {
          if (dist < 250) {
            fx = -(dx / dist) * 1.5;
            fy = -(dy / dist) * 1.5;
          }
        }

        if (!isOpen && !isLove && type !== 'INDEX') {
          const homeDx = p.baseX - p.x;
          const homeDy = p.baseY - p.y;
          fx += homeDx * 0.001;
          fy += homeDy * 0.001;
        }
        
        p.friction = 0.95;
      }

      p.vx += fx;
      p.vy += fy;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
    });

    setParticles(prev => prev.map((item, i) => {
      const pd = pData[i];
      return {
        ...item,
        x: pd.x,
        y: pd.y,
        tint: isLove ? 0xFF0055 : 0x88CCFF
      };
    }));
  });

  if (!textureRef.current) return null;

  return (
    <Container>
      {particles.map(p => (
        <Sprite 
          key={p.key}
          texture={textureRef.current}
          x={p.x}
          y={p.y}
          alpha={p.alpha}
          scale={p.scale}
          tint={p.tint}
        />
      ))}
    </Container>
  );
};

export default ParticleSystem;
      
