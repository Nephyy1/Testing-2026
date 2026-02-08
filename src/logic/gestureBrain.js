const dist = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectGesture = (landmarks) => {
  if (!landmarks) return { type: 'NONE', point: null };

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  const pinchDistance = dist(thumbTip, indexTip);
  
  const middleFolded = middleTip.y > landmarks[10].y; 
  const ringFolded = ringTip.y > landmarks[14].y;

  if (pinchDistance < 0.05 && middleFolded && ringFolded) {
    return { 
      type: 'HEART', 
      point: { 
        x: (thumbTip.x + indexTip.x) / 2, 
        y: (thumbTip.y + indexTip.y) / 2 
      } 
    };
  }

  const tips = [indexTip, middleTip, ringTip, pinkyTip];
  const extendedCount = tips.filter(t => dist(t, wrist) > 0.3).length;

  if (extendedCount >= 4) {
    return { type: 'OPEN_PALM', point: landmarks[9] };
  }

  return { type: 'INDEX', point: indexTip };
};
