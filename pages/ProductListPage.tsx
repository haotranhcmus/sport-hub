import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services";
import { Product, Category, Brand, ProductStatus } from "../types";
import { ProductCard } from "../components/features/product/ProductCard";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  XCircle,
  Search,
  X,
  Check,
  Filter,
} from "lucide-react";
import { removeAccents } from "../utils";
import { useProducts } from "../hooks/useProductsQuery";

export const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Use TanStack Query for caching
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.list(),
    staleTime: 10 * 60 * 1000,
  });

  // Tách danh mục cha và danh mục con
  const parentCategories = useMemo(
    () => allCategories.filter((cat) => !cat.parentId),
    [allCategories]
  );

  const subcategories = useMemo(
    () => allCategories.filter((cat) => cat.parentId),
    [allCategories]
  );

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => api.brands.list(),
    staleTime: 10 * 60 * 1000,
  });

  const loading = productsLoading;

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Specific Attributes State
  const [studType, setStudType] = useState<string>("");
  const [line, setLine] = useState<string>("");
  const [club, setClub] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [boneType, setBoneType] = useState<string>("");

  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    const queryCat = searchParams.get("category");
    if (queryCat) setSelectedCategory(queryCat);
    else if (!searchParams.get("category") && selectedCategory)
      setSelectedCategory("");
  }, [searchParams]);

  // Derived Filtered Data
  const filteredProducts = useMemo(() => {
    const normalizedQuery = removeAccents(searchQuery);

    let filtered = allProducts.filter((p) => {
      // 1. Chỉ hiển thị sản phẩm trạng thái ACTIVE
      if (p.status !== ProductStatus.ACTIVE) return false;

      // 2. Chỉ hiển thị sản phẩm còn tồn kho
      const hasStock = p.variants?.some((v) => v.stockQuantity > 0);
      if (!hasStock) return false;

      // 3. Lọc theo Danh mục (bao gồm cả danh mục cha và con)
      if (selectedCategory) {
        const selectedCat = allCategories.find(
          (c) => c.id === selectedCategory
        );
        if (selectedCat && !selectedCat.parentId) {
          const childCategoryIds = subcategories
            .filter((c) => c.parentId === selectedCategory)
            .map((c) => c.id);
          if (!childCategoryIds.includes(p.categoryId)) return false;
        } else {
          if (p.categoryId !== selectedCategory) return false;
        }
      }

      // 4. Tìm kiếm gõ gần đúng không dấu
      if (searchQuery) {
        const normalizedName = removeAccents(p.name);
        const matchesOriginal = p.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesNormalized = normalizedName.includes(normalizedQuery);

        if (!matchesOriginal && !matchesNormalized) return false;
      }

      // 5. Lọc theo Thương hiệu
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brandId))
        return false;

      // 6. Lọc theo Khoảng giá
      const price = p.promotionalPrice || p.basePrice;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      // 7. Lọc theo Màu sắc
      if (selectedColors.length > 0) {
        const matchesColor = p.variants?.some(
          (v) => selectedColors.includes(v.color) && v.stockQuantity > 0
        );
        if (!matchesColor) return false;
      }

      // 8. Lọc Đặc thù
      if (selectedCategory === "c1") {
        if (studType && p.attributes?.studType !== studType) return false;
        if (line && p.attributes?.line !== line) return false;
      } else if (selectedCategory === "c2") {
        if (club && p.attributes?.club !== club) return false;
        if (season && p.attributes?.season !== season) return false;
      } else if (selectedCategory === "c3") {
        if (boneType === "yes" && !p.attributes?.boneSupport) return false;
        if (boneType === "no" && p.attributes?.boneSupport) return false;
      }

      return true;
    });

    // Sorting
    switch (sortBy) {
      case "price-asc":
        filtered.sort(
          (a, b) =>
            (a.promotionalPrice || a.basePrice) -
            (b.promotionalPrice || b.basePrice)
        );
        break;
      case "price-desc":
        filtered.sort(
          (a, b) =>
            (b.promotionalPrice || b.basePrice) -
            (a.promotionalPrice || a.basePrice)
        );
        break;
      case "bestselling":
        filtered.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
    }

    return filtered;
  }, [
    allProducts,
    allCategories,
    subcategories,
    selectedCategory,
    searchQuery,
    selectedBrands,
    priceRange,
    selectedColors,
    studType,
    line,
    club,
    season,
    boneType,
    sortBy,
  ]);

  const resetFilters = () => {
    setPriceRange([0, 10000000]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setStudType("");
    setLine("");
    setClub("");
    setSeason("");
    setBoneType("");
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 px-4 sm:px-6 lg:px-8 pt-6 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Search Result Banner */}
        {searchQuery && (
          <div className="mb-4 bg-white rounded-lg shadow-sm p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-blue-500" />
              <div>
                <span className="text-gray-500 text-sm">
                  Kết quả tìm kiếm cho{" "}
                </span>
                <span className="text-blue-600 font-semibold">
                  '{searchQuery}'
                </span>
              </div>
            </div>
            <button
              onClick={clearSearch}
              className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition"
            >
              <X size={16} /> Xóa
            </button>
          </div>
        )}

        <div className="flex gap-5">
          {/* Sidebar Filter - SportHub Style */}
          <aside className="w-[200px] flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm sticky top-20 border border-gray-100">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-slate-50">
                <Filter size={16} className="text-blue-600" />
                <span className="font-bold text-sm text-gray-800">
                  BỘ LỌC TÌM KIẾM
                </span>
              </div>

              {/* Categories */}
              <div className="px-4 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Theo Danh Mục
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete("category");
                      setSearchParams(newParams);
                    }}
                    className={`block w-full text-left text-sm py-1.5 transition ${
                      !selectedCategory
                        ? "text-[#3b82f6] font-medium"
                        : "text-gray-600 hover:text-[#3b82f6]"
                    }`}
                  >
                    Tất cả sản phẩm
                  </button>
                  {parentCategories.map((parentCat) => {
                    const children = subcategories.filter(
                      (c) => c.parentId === parentCat.id
                    );
                    const isParentSelected = selectedCategory === parentCat.id;
                    const hasSelectedChild = children.some(
                      (c) => c.id === selectedCategory
                    );

                    return (
                      <div key={parentCat.id}>
                        <button
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set("category", parentCat.id);
                            setSearchParams(newParams);
                          }}
                          className={`block w-full text-left text-sm py-1.5 transition ${
                            isParentSelected
                              ? "text-[#3b82f6] font-medium"
                              : "text-gray-600 hover:text-[#3b82f6]"
                          }`}
                        >
                          {parentCat.name}
                        </button>
                        {(isParentSelected || hasSelectedChild) &&
                          children.length > 0 && (
                            <div className="ml-3 mt-1 space-y-1 border-l-2 border-[#3b82f6]/20 pl-3">
                              {children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => {
                                    const newParams = new URLSearchParams(
                                      searchParams
                                    );
                                    newParams.set("category", child.id);
                                    setSearchParams(newParams);
                                  }}
                                  className={`block w-full text-left text-xs py-1 transition ${
                                    selectedCategory === child.id
                                      ? "text-[#3b82f6] font-medium"
                                      : "text-gray-500 hover:text-[#3b82f6]"
                                  }`}
                                >
                                  {child.name}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              <div className="px-3 py-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Thương Hiệu
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() =>
                        setSelectedBrands((prev) =>
                          prev.includes(brand.id)
                            ? prev.filter((id) => id !== brand.id)
                            : [...prev, brand.id]
                        )
                      }
                    >
                      <div
                        className={`w-4 h-4 border rounded flex items-center justify-center transition ${
                          selectedBrands.includes(brand.id)
                            ? "bg-[#3b82f6] border-[#3b82f6]"
                            : "border-gray-300 group-hover:border-[#3b82f6]"
                        }`}
                      >
                        {selectedBrands.includes(brand.id) && (
                          <Check
                            size={12}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm transition ${
                          selectedBrands.includes(brand.id)
                            ? "text-[#3b82f6]"
                            : "text-gray-600"
                        }`}
                      >
                        {brand.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="px-3 py-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Khoảng Giá
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="₫ TỪ"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-[#3b82f6]"
                      value={priceRange[0] || ""}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
                        ])
                      }
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="₫ ĐẾN"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-[#3b82f6]"
                      value={priceRange[1] === 10000000 ? "" : priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          parseInt(e.target.value) || 10000000,
                        ])
                      }
                    />
                  </div>
                  <button className="w-full py-1.5 bg-[#3b82f6] text-white text-sm rounded hover:bg-[#2563eb] transition">
                    ÁP DỤNG
                  </button>
                </div>
              </div>

              {/* Stud Type for Shoes */}
              {selectedCategory === "c1" && (
                <div className="px-3 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Loại Đinh
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "TF", label: "Sân nhân tạo (TF)" },
                      { value: "FG", label: "Sân tự nhiên (FG)" },
                      { value: "IC", label: "Futsal (IC)" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="studType"
                          checked={studType === opt.value}
                          onChange={() => setStudType(opt.value)}
                          className="accent-[#3b82f6]"
                        />
                        <span className="text-sm text-gray-600">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <div className="px-3 py-4">
                <button
                  onClick={resetFilters}
                  className="w-full py-2 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition"
                >
                  XÓA TẤT CẢ
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar - SportHub Style */}
            <div className="bg-white rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">
                  Sắp xếp theo
                </span>
                <div className="flex gap-2">
                  {[
                    { id: "newest", label: "Mới Nhất" },
                    { id: "bestselling", label: "Bán Chạy" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        sortBy === opt.id
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none cursor-pointer hover:border-blue-400 transition"
                >
                  <option value="newest">Giá</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                <span className="text-blue-600 font-semibold">
                  {filteredProducts.length}
                </span>{" "}
                sản phẩm
              </div>
            </div>

            {/* Category Header */}
            {!searchQuery && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800">
                  {selectedCategory
                    ? allCategories.find((c) => c.id === selectedCategory)?.name
                    : "Tất Cả Sản Phẩm"}
                </h1>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm h-[280px] animate-pulse border border-gray-100"
                  >
                    <div className="h-[180px] bg-gray-200 rounded-t-lg"></div>
                    <div className="p-2 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm py-20 text-center border border-gray-100">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={40} className="text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
                </p>
                <button
                  onClick={() => {
                    clearSearch();
                    resetFilters();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition shadow-md hover:shadow-lg font-medium"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
