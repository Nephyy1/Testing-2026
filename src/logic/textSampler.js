export const sampleTextCoordinates = (text, width, height) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const fontSize = Math.min(width * 0.2, 200);
  ctx.font = `900 ${fontSize}px "Courier New", monospace`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(text, width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const coordinates = [];
  const gap = 6; 

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const index = (y * width + x) * 4;
      if (data[index] > 128) {
        coordinates.push({ x, y });
      }
    }
  }

  return coordinates;
};
