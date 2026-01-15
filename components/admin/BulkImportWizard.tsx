import React, { useState, useCallback, useMemo } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Check,
  XCircle,
  Package,
  Edit3,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { api } from "../../services";
import { Category, Brand } from "../../types";
import { useAuth } from "../../context/AuthContext";

// Types
interface ProductImportRow {
  rowIndex: number;
  productCode: string;
  name: string;
  description: string;
  basePrice: number;
  costPrice?: number;
  promotionalPrice?: number;
  categorySlug: string;
  brandSlug: string;
  thumbnailUrl: string;
  imageUrls?: string;
  freeShipping: boolean;
  allowReturn: boolean;
  returnPeriod: number;
  status: string;
  // Validation
  errors: string[];
  isValid: boolean;
}

interface VariantImportRow {
  rowIndex: number;
  productCode: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  priceAdjustment: number;
  imageUrl?: string;
  errors: string[];
  isValid: boolean;
}

interface ValidationResult {
  products: ProductImportRow[];
  variants: VariantImportRow[];
  totalErrors: number;
  validProducts: number;
  validVariants: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

interface BulkImportWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  brands: Brand[];
}

// Step indicator
const StepIndicator = ({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              idx < currentStep
                ? "bg-green-500 text-white"
                : idx === currentStep
                ? "bg-blue-600 text-white ring-4 ring-blue-100"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {idx < currentStep ? <Check size={18} /> : idx + 1}
          </div>
          <span
            className={`text-xs mt-2 font-medium ${
              idx <= currentStep ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {step}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div
            className={`w-16 h-1 mx-2 rounded ${
              idx < currentStep ? "bg-green-500" : "bg-gray-200"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

export const BulkImportWizard: React.FC<BulkImportWizardProps> = ({
  onClose,
  onSuccess,
  categories,
  brands,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  const steps = ["Tải file", "Xác thực", "Xem trước", "Import"];

  // Category & Brand maps for validation
  const categoryMap = useMemo(() => {
    const map = new Map(categories.map((c) => [c.slug, c]));
    console.log("[BulkImport] Categories loaded:", categories.length);
    console.log("[BulkImport] Category slugs:", Array.from(map.keys()));
    return map;
  }, [categories]);

  const brandMap = useMemo(() => {
    const map = new Map(brands.map((b) => [b.slug, b]));
    console.log("[BulkImport] Brands loaded:", brands.length);
    console.log("[BulkImport] Brand slugs:", Array.from(map.keys()));
    return map;
  }, [brands]);

  // Parse Excel/CSV file
  const parseFile = useCallback(
    async (file: File): Promise<{ products: any[]; variants: any[] }> => {
      return new Promise((resolve, reject) => {
        const isExcel =
          file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

        if (isExcel) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: "array" });

              // Sheet 1: Products
              const productsSheet = workbook.Sheets[workbook.SheetNames[0]];
              const products = XLSX.utils.sheet_to_json(productsSheet);

              // Sheet 2: Variants (optional)
              let variants: any[] = [];
              if (workbook.SheetNames.length > 1) {
                const variantsSheet = workbook.Sheets[workbook.SheetNames[1]];
                variants = XLSX.utils.sheet_to_json(variantsSheet);
              }

              resolve({ products, variants });
            } catch (err) {
              reject(new Error("Không thể đọc file Excel"));
            }
          };
          reader.onerror = () => reject(new Error("Lỗi đọc file"));
          reader.readAsArrayBuffer(file);
        } else {
          // CSV - only products
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              resolve({ products: results.data, variants: [] });
            },
            error: (err) => reject(new Error(err.message)),
          });
        }
      });
    },
    []
  );

  // Validate data
  const validateData = useCallback(
    (rawProducts: any[], rawVariants: any[]): ValidationResult => {
      const products: ProductImportRow[] = [];
      const variants: VariantImportRow[] = [];
      const productCodes = new Set<string>();

      console.log("[BulkImport] Validating products:", rawProducts.length);
      if (rawProducts.length > 0) {
        console.log(
          "[BulkImport] First row keys:",
          Object.keys(rawProducts[0])
        );
        console.log(
          "[BulkImport] First row categorySlug:",
          rawProducts[0].categorySlug
        );
        console.log(
          "[BulkImport] First row brandSlug:",
          rawProducts[0].brandSlug
        );
      }

      // Validate products
      rawProducts.forEach((row, idx) => {
        const errors: string[] = [];

        // Required fields
        if (!row.productCode?.toString().trim()) {
          errors.push("Thiếu mã sản phẩm");
        } else if (productCodes.has(row.productCode)) {
          errors.push("Mã sản phẩm trùng lặp");
        } else {
          productCodes.add(row.productCode);
        }

        if (!row.name?.toString().trim()) {
          errors.push("Thiếu tên sản phẩm");
        }

        const basePrice = parseFloat(row.basePrice);
        if (isNaN(basePrice) || basePrice <= 0) {
          errors.push("Giá gốc không hợp lệ");
        }

        if (!row.categorySlug?.toString().trim()) {
          errors.push("Thiếu danh mục");
        } else if (!categoryMap.has(row.categorySlug)) {
          errors.push(`Danh mục "${row.categorySlug}" không tồn tại`);
        }

        if (!row.brandSlug?.toString().trim()) {
          errors.push("Thiếu thương hiệu");
        } else if (!brandMap.has(row.brandSlug)) {
          errors.push(`Thương hiệu "${row.brandSlug}" không tồn tại`);
        }

        if (!row.thumbnailUrl?.toString().trim()) {
          errors.push("Thiếu URL ảnh đại diện");
        }

        products.push({
          rowIndex: idx + 2, // Excel row (1-indexed + header)
          productCode: row.productCode?.toString().trim() || "",
          name: row.name?.toString().trim() || "",
          description: row.description?.toString().trim() || "",
          basePrice: basePrice || 0,
          costPrice: parseFloat(row.costPrice) || undefined,
          promotionalPrice: parseFloat(row.promotionalPrice) || undefined,
          categorySlug: row.categorySlug?.toString().trim() || "",
          brandSlug: row.brandSlug?.toString().trim() || "",
          thumbnailUrl: row.thumbnailUrl?.toString().trim() || "",
          imageUrls: row.imageUrls?.toString().trim() || "",
          freeShipping:
            row.freeShipping === true ||
            row.freeShipping?.toString().toLowerCase() === "true",
          allowReturn:
            row.allowReturn !== false &&
            row.allowReturn?.toString().toLowerCase() !== "false",
          returnPeriod: parseInt(row.returnPeriod) || 7,
          status: row.status?.toString().toUpperCase() || "ACTIVE",
          errors,
          isValid: errors.length === 0,
        });
      });

      // Validate variants
      rawVariants.forEach((row, idx) => {
        const errors: string[] = [];

        if (!row.productCode?.toString().trim()) {
          errors.push("Thiếu mã sản phẩm");
        } else if (!productCodes.has(row.productCode)) {
          errors.push(
            `Mã sản phẩm "${row.productCode}" không có trong danh sách`
          );
        }

        if (!row.sku?.toString().trim()) {
          errors.push("Thiếu SKU");
        }

        if (!row.size?.toString().trim()) {
          errors.push("Thiếu size");
        }

        if (!row.color?.toString().trim()) {
          errors.push("Thiếu màu");
        }

        const qty = parseInt(row.stockQuantity);
        if (isNaN(qty) || qty < 0) {
          errors.push("Số lượng không hợp lệ");
        }

        variants.push({
          rowIndex: idx + 2,
          productCode: row.productCode?.toString().trim() || "",
          sku: row.sku?.toString().trim() || "",
          size: row.size?.toString().trim() || "",
          color: row.color?.toString().trim() || "",
          stockQuantity: qty || 0,
          priceAdjustment: parseFloat(row.priceAdjustment) || 0,
          imageUrl: row.imageUrl?.toString().trim() || undefined,
          errors,
          isValid: errors.length === 0,
        });
      });

      return {
        products,
        variants,
        totalErrors:
          products.filter((p) => !p.isValid).length +
          variants.filter((v) => !v.isValid).length,
        validProducts: products.filter((p) => p.isValid).length,
        validVariants: variants.filter((v) => v.isValid).length,
      };
    },
    [categoryMap, brandMap]
  );

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const { products, variants } = await parseFile(selectedFile);
      const result = validateData(products, variants);
      setValidationResult(result);
      setStep(1); // Move to validation step
    } catch (err: any) {
      alert(err.message || "Lỗi đọc file");
    } finally {
      setLoading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const productsData = [
      {
        productCode: "SP001",
        name: "Áo Manchester United Home 24/25",
        description: "Áo đấu chính hãng...",
        basePrice: 890000,
        costPrice: 600000,
        promotionalPrice: 790000,
        categorySlug: "ao-bong-da",
        brandSlug: "nike",
        thumbnailUrl: "https://example.com/img.jpg",
        imageUrls: "https://example.com/img1.jpg,https://example.com/img2.jpg",
        freeShipping: false,
        allowReturn: true,
        returnPeriod: 7,
        status: "ACTIVE",
      },
    ];

    const variantsData = [
      {
        productCode: "SP001",
        sku: "SP001-S-RED",
        size: "S",
        color: "Đỏ",
        stockQuantity: 50,
        priceAdjustment: 0,
        imageUrl: "",
      },
      {
        productCode: "SP001",
        sku: "SP001-M-RED",
        size: "M",
        color: "Đỏ",
        stockQuantity: 30,
        priceAdjustment: 10000,
        imageUrl: "",
      },
    ];

    const wb = XLSX.utils.book_new();
    const wsProducts = XLSX.utils.json_to_sheet(productsData);
    const wsVariants = XLSX.utils.json_to_sheet(variantsData);

    XLSX.utils.book_append_sheet(wb, wsProducts, "Products");
    XLSX.utils.book_append_sheet(wb, wsVariants, "Variants");

    XLSX.writeFile(wb, "template-import-san-pham.xlsx");
  };

  // Import products to database
  const handleImport = async () => {
    if (!validationResult) return;

    const validProducts = validationResult.products.filter((p) => p.isValid);
    if (validProducts.length === 0) {
      alert("Không có sản phẩm hợp lệ để import");
      return;
    }

    setLoading(true);
    setStep(3);
    setImportProgress(0);

    const results: ImportResult = { success: 0, failed: 0, errors: [] };
    const BATCH_SIZE = 5;

    try {
      // Group variants by productCode
      const variantsByProduct = new Map<string, VariantImportRow[]>();
      validationResult.variants
        .filter((v) => v.isValid)
        .forEach((v) => {
          const existing = variantsByProduct.get(v.productCode) || [];
          existing.push(v);
          variantsByProduct.set(v.productCode, existing);
        });

      // Import products in batches
      for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
        const batch = validProducts.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (product) => {
            try {
              // Get category and brand IDs
              const category = categoryMap.get(product.categorySlug);
              const brand = brandMap.get(product.brandSlug);

              if (!category || !brand) {
                throw new Error("Category hoặc Brand không tồn tại");
              }

              // Create product
              const productData = {
                productCode: product.productCode,
                name: product.name,
                slug: product.productCode
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "-"),
                description: product.description,
                basePrice: product.basePrice,
                costPrice: product.costPrice,
                promotionalPrice: product.promotionalPrice,
                categoryId: category.id,
                brandId: brand.id,
                thumbnailUrl: product.thumbnailUrl,
                imageUrls: product.imageUrls
                  ? product.imageUrls.split(",").map((u) => u.trim())
                  : [],
                freeShipping: product.freeShipping,
                allowReturn: product.allowReturn,
                returnPeriod: product.returnPeriod,
                status: product.status as any,
              };

              const createdProduct = await api.products.create(
                productData,
                user!
              );

              // Create variants
              const variants = variantsByProduct.get(product.productCode) || [];
              for (const variant of variants) {
                await api.products.createVariant({
                  productId: createdProduct.id,
                  sku: variant.sku,
                  size: variant.size,
                  color: variant.color,
                  stockQuantity: variant.stockQuantity,
                  priceAdjustment: variant.priceAdjustment,
                  imageUrl: variant.imageUrl || null,
                  status: "active",
                });
              }

              results.success++;
            } catch (err: any) {
              results.failed++;
              results.errors.push({
                row: product.rowIndex,
                error: err.message || "Lỗi không xác định",
              });
            }
          })
        );

        setImportProgress(
          Math.round(((i + batch.length) / validProducts.length) * 100)
        );
      }

      setImportResult(results);
    } catch (err: any) {
      console.error("Import error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                Kéo thả file hoặc click để chọn
              </h3>
              <p className="text-sm text-gray-500">
                Hỗ trợ file Excel (.xlsx, .xls) hoặc CSV
              </p>
            </div>

            {/* Template Download */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileSpreadsheet size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">Tải file mẫu</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    File Excel mẫu với 2 sheet: Products và Variants. Bao gồm
                    hướng dẫn điền từng cột.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition font-medium text-sm"
                  >
                    <Download size={16} />
                    Tải Template
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 rounded-2xl p-6">
              <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-amber-700 space-y-2">
                <li>• Sheet 1 chứa thông tin sản phẩm (bắt buộc)</li>
                <li>• Sheet 2 chứa biến thể (tùy chọn)</li>
                <li>
                  • categorySlug và brandSlug phải khớp với dữ liệu có sẵn
                </li>
                <li>• Mã sản phẩm (productCode) phải là duy nhất</li>
                <li>• URL ảnh phải là đường dẫn công khai có thể truy cập</li>
              </ul>
            </div>

            {/* Available Slugs Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h5 className="font-bold text-gray-700 text-sm mb-2">
                  📁 categorySlug có sẵn:
                </h5>
                <div className="flex flex-wrap gap-1">
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <code
                        key={c.id}
                        className="text-xs bg-white px-2 py-1 rounded border text-blue-600"
                      >
                        {c.slug}
                      </code>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Đang tải...</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <h5 className="font-bold text-gray-700 text-sm mb-2">
                  🏷️ brandSlug có sẵn:
                </h5>
                <div className="flex flex-wrap gap-1">
                  {brands.length > 0 ? (
                    brands.map((b) => (
                      <code
                        key={b.id}
                        className="text-xs bg-white px-2 py-1 rounded border text-green-600"
                      >
                        {b.slug}
                      </code>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Đang tải...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-gray-800">
                  {validationResult?.products.length || 0}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Tổng sản phẩm
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-green-600">
                  {validationResult?.validProducts || 0}
                </div>
                <div className="text-xs text-green-600 font-medium">Hợp lệ</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-red-600">
                  {(validationResult?.products.length || 0) -
                    (validationResult?.validProducts || 0)}
                </div>
                <div className="text-xs text-red-600 font-medium">Có lỗi</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-blue-600">
                  {validationResult?.variants.length || 0}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  Biến thể
                </div>
              </div>
            </div>

            {/* Error List */}
            {validationResult &&
              validationResult.products.some((p) => !p.isValid) && (
                <div className="bg-red-50 rounded-2xl p-6">
                  <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <XCircle size={18} />
                    Danh sách lỗi ({validationResult.totalErrors})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {validationResult.products
                      .filter((p) => !p.isValid)
                      .map((p) => (
                        <div
                          key={p.rowIndex}
                          className="bg-white rounded-lg p-3 text-sm"
                        >
                          <span className="font-medium text-red-700">
                            Dòng {p.rowIndex}
                          </span>
                          <span className="text-gray-600">
                            {" "}
                            ({p.productCode || "N/A"}):
                          </span>
                          <span className="text-red-600 ml-2">
                            {p.errors.join(", ")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Success message */}
            {validationResult?.totalErrors === 0 && (
              <div className="bg-green-50 rounded-2xl p-6 flex items-center gap-4">
                <CheckCircle2 size={32} className="text-green-500" />
                <div>
                  <h4 className="font-bold text-green-800">
                    Tất cả dữ liệu hợp lệ!
                  </h4>
                  <p className="text-sm text-green-600">
                    Bấm "Tiếp tục" để xem trước và import.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="font-bold text-gray-800">
              Xem trước {validationResult?.validProducts || 0} sản phẩm sẽ được
              import
            </h4>

            {/* Preview Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Mã SP
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Tên sản phẩm
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Giá gốc
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Danh mục
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Thương hiệu
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Biến thể
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {validationResult?.products
                      .filter((p) => p.isValid)
                      .map((product, idx) => {
                        const variantCount = validationResult.variants.filter(
                          (v) =>
                            v.productCode === product.productCode && v.isValid
                        ).length;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                              {product.productCode}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {product.name.substring(0, 40)}
                              {product.name.length > 40 ? "..." : ""}
                            </td>
                            <td className="px-4 py-3">
                              {product.basePrice.toLocaleString()}đ
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {product.categorySlug}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {product.brandSlug}
                            </td>
                            <td className="px-4 py-3">
                              {variantCount > 0 ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {variantCount}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw
                  size={48}
                  className="mx-auto text-blue-500 animate-spin mb-4"
                />
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  Đang import sản phẩm...
                </h4>
                <p className="text-gray-500 mb-6">
                  Vui lòng không đóng cửa sổ này
                </p>

                {/* Progress bar */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tiến độ</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : importResult ? (
              <div className="text-center py-12">
                {importResult.failed === 0 ? (
                  <CheckCircle2
                    size={64}
                    className="mx-auto text-green-500 mb-4"
                  />
                ) : (
                  <AlertTriangle
                    size={64}
                    className="mx-auto text-amber-500 mb-4"
                  />
                )}

                <h4 className="text-2xl font-bold text-gray-800 mb-2">
                  Import hoàn tất!
                </h4>

                <div className="flex justify-center gap-8 my-6">
                  <div className="text-center">
                    <div className="text-4xl font-black text-green-600">
                      {importResult.success}
                    </div>
                    <div className="text-sm text-gray-500">Thành công</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-red-600">
                      {importResult.failed}
                    </div>
                    <div className="text-sm text-gray-500">Thất bại</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 max-w-md mx-auto text-left">
                    <h5 className="font-bold text-red-800 mb-2">
                      Chi tiết lỗi:
                    </h5>
                    <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
                      {importResult.errors.map((err, idx) => (
                        <div key={idx} className="text-red-600">
                          Dòng {err.row}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Hoàn tất
                </button>
              </div>
            ) : null}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-gray-50 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              Import Sản Phẩm Hàng Loạt
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Thêm nhiều sản phẩm cùng lúc từ file Excel/CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-white px-8 py-4 border-b">
          <StepIndicator currentStep={step} steps={steps} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">{renderStep()}</div>

        {/* Footer */}
        {step < 3 && (
          <div className="bg-white px-8 py-4 border-t flex justify-between">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
              className="flex items-center gap-2 px-5 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium"
            >
              <ArrowLeft size={18} />
              {step > 0 ? "Quay lại" : "Hủy"}
            </button>

            {step === 2 && (
              <button
                onClick={handleImport}
                disabled={
                  !validationResult || validationResult.validProducts === 0
                }
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package size={18} />
                Import {validationResult?.validProducts || 0} sản phẩm
              </button>
            )}

            {step === 1 && validationResult && (
              <button
                onClick={() => setStep(2)}
                disabled={validationResult.validProducts === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
