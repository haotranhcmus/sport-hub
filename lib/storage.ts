/**
 * Supabase Storage Helper
 *
 * Provides utilities for uploading and managing images in Supabase Storage
 * Includes automatic image optimization and compression
 */

import { supabase } from "./supabase";
import {
  optimizeImage,
  validateImageFile,
  formatFileSize,
} from "./imageOptimizer";

const STORAGE_BUCKET = "product-images";

/**
 * Upload image to Supabase Storage with automatic optimization
 * @param file - File object from input
 * @param folder - Folder name in bucket (products, brands, categories, etc)
 * @param enableOptimization - Whether to optimize image before upload (default: true)
 * @returns Public URL of uploaded image and optimization stats
 */
export async function uploadImage(
  file: File,
  folder: string = "products",
  enableOptimization: boolean = true
): Promise<{ url: string; stats?: any }> {
  try {
    // Validate file
    const validation = validateImageFile(file, 10);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    let fileToUpload = file;
    let stats = null;

    // Optimize image if enabled
    if (enableOptimization) {
      console.log(`🔧 [OPTIMIZE] Original size: ${formatFileSize(file.size)}`);

      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        generateThumbnail: true,
        thumbnailSize: 400,
      });

      fileToUpload = optimized.original;
      stats = {
        originalSize: formatFileSize(optimized.originalSize),
        optimizedSize: formatFileSize(optimized.optimizedSize),
        compressionRatio: `${optimized.compressionRatio}%`,
      };

      console.log(
        `✅ [OPTIMIZE] Compressed to ${stats.optimizedSize} (saved ${stats.compressionRatio})`
      );

      // Upload thumbnail if generated
      if (optimized.thumbnail) {
        const thumbFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}_thumb.jpg`;
        const thumbPath = `${folder}/${thumbFileName}`;

        await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(thumbPath, optimized.thumbnail, {
            cacheControl: "3600",
            upsert: false,
          });

        console.log(`✅ [THUMBNAIL] Uploaded: ${thumbPath}`);
      }
    }

    // Generate unique filename
    const fileExt = fileToUpload.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`📤 [UPLOAD] Uploading to ${STORAGE_BUCKET}/${filePath}`);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileToUpload, {
        cacheControl: "3600", // CDN cache for 1 hour
        upsert: false,
      });

    if (error) {
      console.error("❌ [UPLOAD] Error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log("✅ [UPLOAD] Success:", data.path);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    return { url: publicUrl, stats };
  } catch (err: any) {
    console.error("❌ [UPLOAD] Exception:", err);
    throw err;
  }
}

/**
 * Delete image from Supabase Storage
 * @param imageUrl - Full URL or path of image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract path from URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/product-images/folder/file.jpg
    const urlParts = imageUrl.split(`${STORAGE_BUCKET}/`);
    if (urlParts.length < 2) {
      console.warn("⚠️ [DELETE] Invalid URL format, skipping:", imageUrl);
      return;
    }

    const filePath = urlParts[1];
    console.log(`🗑️ [DELETE] Deleting ${STORAGE_BUCKET}/${filePath}`);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("❌ [DELETE] Error:", error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log("✅ [DELETE] Success");
  } catch (err: any) {
    console.error("❌ [DELETE] Exception:", err);
    // Don't throw - deletion errors shouldn't block operations
  }
}

/**
 * Upload multiple images
 * @param files - Array of File objects
 * @param folder - Folder name in bucket
 * @returns Array of public URLs
 */
export async function uploadImages(
  files: File[],
  folder: string = "products"
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  const results = await Promise.all(uploadPromises);
  return results.map((r) => r.url);
}

/**
 * Replace existing image (delete old, upload new)
 * @param oldUrl - URL of old image to delete
 * @param newFile - New file to upload
 * @param folder - Folder name
 * @returns Public URL of new image
 */
export async function replaceImage(
  oldUrl: string | null,
  newFile: File,
  folder: string = "products"
): Promise<string> {
  // Upload new image first
  const result = await uploadImage(newFile, folder);

  // Then delete old image (if exists and is from our storage)
  if (oldUrl && oldUrl.includes(STORAGE_BUCKET)) {
    await deleteImage(oldUrl);
  }

  return result.url;
}

/**
 * Check if bucket exists and is accessible
 * Used for setup verification
 */
export async function verifyStorageSetup(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);

    if (error) {
      console.error("❌ [VERIFY] Bucket not found:", error.message);
      return false;
    }

    console.log("✅ [VERIFY] Storage bucket exists:", data.name);
    return true;
  } catch (err) {
    console.error("❌ [VERIFY] Exception:", err);
    return false;
  }
}
