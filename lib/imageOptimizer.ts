/**
 * Image Optimizer for SportHub
 *
 * Compresses and resizes images before uploading to Supabase Storage
 * Generates thumbnails for faster loading
 */

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface OptimizedImages {
  original: File;
  thumbnail?: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Optimize image file - compress and resize
 *
 * @param file - Original image file
 * @param options - Optimization options
 * @returns Optimized image and optional thumbnail
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizedImages> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    generateThumbnail = true,
    thumbnailSize = 400,
  } = options;

  const originalSize = file.size;

  // Load image
  const img = await createImageBitmap(file);

  // Calculate dimensions maintaining aspect ratio
  let width = img.width;
  let height = img.height;
  const ratio = Math.min(maxWidth / width, maxHeight / height);

  if (ratio < 1) {
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Create canvas and draw resized image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob with compression
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality)
  );

  const optimizedFile = new File(
    [blob],
    file.name.replace(/\.[^.]+$/, ".jpg"),
    {
      type: "image/jpeg",
    }
  );

  const optimizedSize = optimizedFile.size;
  const compressionRatio = Math.round((1 - optimizedSize / originalSize) * 100);

  const result: OptimizedImages = {
    original: optimizedFile,
    originalSize,
    optimizedSize,
    compressionRatio,
  };

  // Generate thumbnail if requested
  if (generateThumbnail) {
    const thumbCanvas = document.createElement("canvas");
    const thumbRatio = Math.min(thumbnailSize / width, thumbnailSize / height);
    const thumbWidth = Math.round(width * thumbRatio);
    const thumbHeight = Math.round(height * thumbRatio);

    thumbCanvas.width = thumbWidth;
    thumbCanvas.height = thumbHeight;

    const thumbCtx = thumbCanvas.getContext("2d")!;
    thumbCtx.imageSmoothingEnabled = true;
    thumbCtx.imageSmoothingQuality = "high";
    thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

    const thumbBlob = await new Promise<Blob>((resolve) =>
      thumbCanvas.toBlob((b) => resolve(b!), "image/jpeg", 0.7)
    );

    const thumbnail = new File(
      [thumbBlob],
      file.name.replace(/\.[^.]+$/, "_thumb.jpg"),
      { type: "image/jpeg" }
    );

    result.thumbnail = thumbnail;
  }

  // Clean up
  img.close();

  return result;
}

/**
 * Validate image file before optimization
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP",
    };
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Kích thước file quá lớn. Tối đa ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
