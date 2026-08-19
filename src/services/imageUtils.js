/**
 * Image utilities for compressing photos before AI analysis.
 * Mobile cameras produce 5-10MB images that can timeout the Gemini API.
 * This compresses them to ~150-250KB (max 1024x1024, JPEG 85%) via Canvas API.
 */

/**
 * Reads a File or Blob as a Data URL.
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Nenhum arquivo fornecido'));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image (File, Blob, Data URI, or raw base64) to a target max dimension and quality.
 * @param {File|Blob|string} imageSource - File, Blob, Data URL or raw base64
 * @param {number} maxWidth - Max width in pixels (default 1024)
 * @param {number} quality - JPEG quality 0-1 (default 0.85)
 * @returns {Promise<{base64: string, dataUrl: string, mimeType: string, width: number, height: number, originalSizeKB: number, compressedSizeKB: number}>}
 */
export async function compressImage(imageSource, maxWidth = 1024, quality = 0.85) {
  let dataUrl = '';

  if (typeof imageSource === 'object' && imageSource instanceof Blob) {
    dataUrl = await readFileAsDataUrl(imageSource);
  } else if (typeof imageSource === 'string') {
    if (imageSource.startsWith('data:')) {
      dataUrl = imageSource;
    } else {
      dataUrl = `data:image/jpeg;base64,${imageSource}`;
    }
  } else {
    throw new Error('Formato de imagem inválido para compressão');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio while bounding within maxWidth x maxWidth
        const maxDimension = maxWidth;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Não foi possível obter contexto 2D do Canvas');
        }

        // Fill background with white in case of transparent PNG/WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedBase64 = compressedDataUrl.replace(/^data:image\/\w+;base64,/, '');

        const originalSizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
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

    img.src = dataUrl;
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
  if (!dataUri || typeof dataUri !== 'string') return '';
  return dataUri.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
}
