import React, { useEffect, useRef, useState } from 'react';
import { Stage } from '@pixi/react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import ParticleSystem from './components/ParticleSystem';
import UIOverlay from './components/UIOverlay';
import { detectGesture } from './logic/gestureBrain';

const App = () => {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [permission, setPermission] = useState(false);
  const [gestureType, setGestureType] = useState('NONE');
  const [isRunning, setIsRunning] = useState(false); // State baru untuk kontrol start
  
  const videoRef = useRef(null);
  const gestureStateRef = useRef({ type: 'NONE', point: null });
  const requestRef = useRef(null);

  useEffect(() => {
    const resize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const setupVision = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
      );
      
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: 640, height: 480 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setPermission(true);
            predict(landmarker);
          };
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };

    setupVision();
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const predict = (landmarker) => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const results = landmarker.detectForVideo(videoRef.current, performance.now());
      if (results.landmarks && results.landmarks.length > 0) {
        const detection = detectGesture(results.landmarks[0]);
        gestureStateRef.current = detection;
        setGestureType(detection.type);
      } else {
        gestureStateRef.current = { type: 'NONE', point: null };
        setGestureType('NONE');
      }
    }
    requestRef.current = requestAnimationFrame(() => predict(landmarker));
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />
      
      {/* UI Overlay menangani tombol Start */}
      <UIOverlay 
        activeGesture={gestureType} 
        hasPermission={permission} 
        onStart={() => setIsRunning(true)}
        isRunning={isRunning}
      />
      
      {isRunning && (
        <Stage 
          width={size.w} 
          height={size.h} 
          options={{ 
            backgroundAlpha: 0, 
            antialias: false, // Matikan antialias untuk performa
            resolution: 1, // Hindari retina scaling berlebihan di HP
            autoDensity: true 
          }}
        >
          <ParticleSystem 
            gestureRef={gestureStateRef} 
            width={size.w} 
            height={size.h} 
            isRunning={isRunning}
          />
        </Stage>
      )}
    </div>
  );
};

export default App;
