let uploadedImage = null;
let transformType = 'grayscale';

// Function to navigate to result page with data
function navigateToResult() {
  const imageData = uploadedImage.toDataURL();
  localStorage.setItem('originalImage', imageData);
  localStorage.setItem('transformType', transformType);
  window.location.href = 'result.html';
}

// Function to apply grayscale transformation
function applyGrayscale(imageData) {
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }
}

// Function to apply blur transformation
function applyBlur(imageData, width, height) {
  const pixels = imageData.data;
  const copy = new Uint8ClampedArray(pixels);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          sumR += copy[idx];
          sumG += copy[idx + 1];
          sumB += copy[idx + 2];
          count++;
        }
      }
      const idx = (y * width + x) * 4;
      pixels[idx] = sumR / count;
      pixels[idx + 1] = sumG / count;
      pixels[idx + 2] = sumB / count;
    }
  }
}

// Upload page functionality
if (window.location.pathname.endsWith('index.html')) {
  const imageUpload = document.getElementById('imageUpload');
  const processButton = document.getElementById('processButton');
  const transformSelect = document.getElementById('transformType');
  
  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      uploadedImage = document.createElement('canvas');
      const ctx = uploadedImage.getContext('2d');
      uploadedImage.width = img.width;
      uploadedImage.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  });

  processButton.addEventListener('click', () => {
    transformType = transformSelect.value;
    navigateToResult();
  });
}

// Result page functionality
if (window.location.pathname.endsWith('result.html')) {
  const canvasOriginal = document.getElementById('canvasOriginal');
  const canvasEdited = document.getElementById('canvasEdited');
  const backButton = document.getElementById('backButton');
  
  const originalImageData = localStorage.getItem('originalImage');
  const selectedTransform = localStorage.getItem('transformType');
  
  const img = new Image();
  img.src = originalImageData;
  img.onload = () => {
    canvasOriginal.width = img.width;
    canvasOriginal.height = img.height;
    canvasEdited.width = img.width;
    canvasEdited.height = img.height;

    const ctxOriginal = canvasOriginal.getContext('2d');
    const ctxEdited = canvasEdited.getContext('2d');
    ctxOriginal.drawImage(img, 0, 0);

    const imageData = ctxOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height);

    if (selectedTransform === 'grayscale') {
      applyGrayscale(imageData);
    } else if (selectedTransform === 'blur') {
      applyBlur(imageData, canvasEdited.width, canvasEdited.height);
    }

    ctxEdited.putImageData(imageData, 0, 0);
  };

  backButton.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });
}
