/**
 * Image utilities for compressing photos before AI analysis.
 * Mobile cameras produce 5-10MB images that can timeout the Gemini API.
 * This compresses them to ~200KB via Canvas API.
 */

/**
 * Compress a base64 image to a target max dimension and quality.
 * @param {string} base64Data - Full data URI or raw base64
 * @param {number} maxWidth - Max width in pixels (default 1024)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<{base64: string, mimeType: string, originalSizeKB: number, compressedSizeKB: number}>}
 */
export function compressImage(base64Data, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        // Also cap height
        const maxHeight = 1024;
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = Math.round(width * ratio);
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedBase64 = compressedDataUrl.replace(/^data:image\/\w+;base64,/, '');

        // Calculate sizes
        const originalSizeKB = Math.round((base64Data.length * 3) / 4 / 1024);
        const compressedSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);

        resolve({
          base64: compressedBase64,
          dataUrl: compressedDataUrl,
          mimeType: 'image/jpeg',
          width,
          height,
          originalSizeKB,
          compressedSizeKB,
        });
      } catch (err) {
        reject(new Error('Falha ao comprimir imagem: ' + err.message));
      }
    };

    img.onerror = () => {
      reject(new Error('Falha ao carregar imagem para compressão'));
    };

    // Ensure data URL format
    if (base64Data.startsWith('data:')) {
      img.src = base64Data;
    } else {
      img.src = `data:image/jpeg;base64,${base64Data}`;
    }
  });
}

/**
 * Extract the real MIME type from a data URI.
 * @param {string} dataUri
 * @returns {string}
 */
export function getImageMimeType(dataUri) {
  if (!dataUri || typeof dataUri !== 'string') return 'image/jpeg';
  const match = dataUri.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

/**
 * Get raw base64 data from a data URI (strips the prefix).
 * @param {string} dataUri
 * @returns {string}
 */
export function stripBase64Prefix(dataUri) {
  if (!dataUri) return '';
  return dataUri.replace(/^data:image\/\w+;base64,/, '');
}
