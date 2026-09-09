// Bound decoding input and canvas work without changing the displayed aspect ratio.
export const IMAGE_LIMITS = Object.freeze({
  fileBytes: 20 * 1024 * 1024,
  sourceDimension: 32768,
  sourcePixels: 64 * 1024 * 1024,
  canvasDimension: 1200,
  canvasPixels: 1200 * 1200
});

const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']);

export function validateImageFile(file) {
  if (!file || !SUPPORTED_TYPES.has(file.type)) {
    throw new Error('지원하는 이미지 파일(JPG, PNG, WebP, GIF, BMP)을 선택해주세요.');
  }
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > IMAGE_LIMITS.fileBytes) {
    throw new Error('이미지 파일은 20MB 이하의 비어 있지 않은 파일을 선택해주세요.');
  }
}

export function boundedImageSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error('이미지 크기를 확인할 수 없습니다. 다른 이미지를 선택해주세요.');
  }
  if (width > IMAGE_LIMITS.sourceDimension || height > IMAGE_LIMITS.sourceDimension ||
      width * height > IMAGE_LIMITS.sourcePixels) {
    throw new Error('이미지 해상도가 너무 큽니다. 크기를 줄인 뒤 다시 선택해주세요.');
  }
  const scale = Math.min(1, IMAGE_LIMITS.canvasDimension / width,
    IMAGE_LIMITS.canvasDimension / height, Math.sqrt(IMAGE_LIMITS.canvasPixels / (width * height)));
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}
