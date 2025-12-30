
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services';
import { Product, Category, Brand, ProductStatus } from '../types';
import { ProductCard } from '../components/features/product/ProductCard';
import { SlidersHorizontal, ChevronDown, ChevronUp, XCircle, Search, X, Check } from 'lucide-react';
import { removeAccents } from '../utils';

export const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  // Specific Attributes State
  const [studType, setStudType] = useState<string>('');
  const [line, setLine] = useState<string>('');
  const [club, setClub] = useState<string>('');
  const [season, setSeason] = useState<string>('');
  const [boneType, setBoneType] = useState<string>('');

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    // Load meta data
    api.categories.list().then(setCategories);
    api.brands.list().then(setBrands);
    
    // Fetch all products initially
    api.products.list().then(data => {
      setAllProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const queryCat = searchParams.get('category');
    if(queryCat) setSelectedCategory(queryCat);
    else if (!searchParams.get('category') && selectedCategory) setSelectedCategory('');
  }, [searchParams]);

  // Derived Filtered Data
  const filteredProducts = useMemo(() => {
    const normalizedQuery = removeAccents(searchQuery);

    return allProducts.filter(p => {
      // 1. Chỉ hiển thị sản phẩm trạng thái ACTIVE
      if (p.status !== ProductStatus.ACTIVE) return false;

      // 2. Chỉ hiển thị sản phẩm còn tồn kho
      const hasStock = p.variants?.some(v => v.stockQuantity > 0);
      if (!hasStock) return false;

      // 3. Lọc theo Danh mục
      if (selectedCategory && p.categoryId !== selectedCategory) return false;

      // 4. Tìm kiếm gõ gần đúng không dấu
      if (searchQuery) {
        const normalizedName = removeAccents(p.name);
        const matchesOriginal = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesNormalized = normalizedName.includes(normalizedQuery);
        
        if (!matchesOriginal && !matchesNormalized) return false;
      }

      // 5. Lọc theo Thương hiệu
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brandId)) return false;

      // 6. Lọc theo Khoảng giá
      const price = p.promotionalPrice || p.basePrice;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      // 7. Lọc theo Màu sắc
      if (selectedColors.length > 0) {
        const matchesColor = p.variants?.some(v => selectedColors.includes(v.color) && v.stockQuantity > 0);
        if (!matchesColor) return false;
      }

      // 8. Lọc Đặc thù
      if (selectedCategory === 'c1') {
        if (studType && p.attributes?.studType !== studType) return false;
        if (line && p.attributes?.line !== line) return false;
      } else if (selectedCategory === 'c2') {
        if (club && p.attributes?.club !== club) return false;
        if (season && p.attributes?.season !== season) return false;
      } else if (selectedCategory === 'c3') {
        if (boneType === 'yes' && !p.attributes?.boneSupport) return false;
        if (boneType === 'no' && p.attributes?.boneSupport) return false;
      }

      return true;
    });
  }, [allProducts, selectedCategory, searchQuery, selectedBrands, priceRange, selectedColors, studType, line, club, season, boneType]);

  const resetFilters = () => {
    setPriceRange([0, 10000000]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setStudType('');
    setLine('');
    setClub('');
    setSeason('');
    setBoneType('');
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Sidebar Filter */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-50">
            <div className="flex items-center gap-2 font-black text-lg text-gray-800 tracking-tight">
              <SlidersHorizontal size={20} className="text-secondary" />
              BỘ LỌC
            </div>
            <button 
                onClick={resetFilters}
                className="text-[10px] font-black text-gray-400 hover:text-secondary uppercase tracking-widest transition"
            >
                Đặt lại
            </button>
          </div>

          <div className="space-y-8 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <FilterSectionTitle label="Danh mục" />
              <div className="space-y-2 mt-3">
                <button 
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition ${!selectedCategory ? 'bg-secondary text-white shadow-lg shadow-blue-500/20' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('category', cat.id);
                        setSearchParams(newParams);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition ${selectedCategory === cat.id ? 'bg-secondary text-white shadow-lg shadow-blue-500/20' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FilterSectionTitle label="Thương hiệu" />
              <div className="space-y-2 mt-3">
                {brands.map(brand => (
                  <button 
                    key={brand.id}
                    onClick={() => setSelectedBrands(prev => 
                      prev.includes(brand.id) ? prev.filter(id => id !== brand.id) : [...prev, brand.id]
                    )}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition ${selectedBrands.includes(brand.id) ? 'bg-secondary text-white shadow-lg shadow-blue-500/20' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <span>{brand.name}</span>
                    {selectedBrands.includes(brand.id) && <Check size={14} strokeWidth={4} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Filters based on category */}
            {selectedCategory === 'c1' && (
                <div className="animate-in slide-in-from-left-4">
                    <FilterSectionTitle label="Đặc thù Giày" />
                    <div className="space-y-4 mt-4">
                        <select className="w-full bg-gray-50 border-none rounded-xl text-xs font-black p-3 outline-none ring-1 ring-gray-100 focus:ring-secondary/20 uppercase" value={studType} onChange={e => setStudType(e.target.value)}>
                            <option value="">Loại đinh</option>
                            <option value="TF">Sân nhân tạo (TF)</option>
                            <option value="FG">Sân tự nhiên (FG)</option>
                            <option value="IC">Futsal (IC)</option>
                        </select>
                    </div>
                </div>
            )}

            <div>
              <FilterSectionTitle label="Khoảng giá" />
              <div className="space-y-4 mt-4">
                <input 
                    type="range" min="0" max="10000000" step="100000" 
                    className="w-full accent-secondary"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                />
                <p className="text-[10px] font-black text-gray-800 uppercase text-center">Dưới: {priceRange[1].toLocaleString()}đ</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Active Search & Clear Button */}
        {searchQuery && (
          <div className="mb-8 p-6 bg-secondary/5 border border-secondary/10 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary text-white rounded-2xl shadow-lg shadow-blue-500/20"><Search size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đang hiển thị kết quả cho</p>
                <h2 className="text-xl font-black text-gray-800 tracking-tight italic">"{searchQuery}"</h2>
              </div>
            </div>
            <button 
              onClick={clearSearch}
              className="px-6 py-3 bg-white border border-gray-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition shadow-sm flex items-center gap-2"
            >
              <X size={16} /> Xóa tìm kiếm
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                    {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'TẤT CẢ SẢN PHẨM'}
                </h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Tìm thấy {filteredProducts.length} sản phẩm</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sắp xếp:</span>
                <select className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none">
                    <option>Mới nhất</option>
                    <option>Bán chạy</option>
                    <option>Giá tăng dần</option>
                    <option>Giá giảm dần</option>
                </select>
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => <div key={i} className="bg-gray-100 animate-pulse h-[400px] rounded-[40px]"></div>)}
            </div>
        ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
        ) : (
            <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle size={40} /></div>
                <h3 className="text-2xl font-black text-gray-800">Không có kết quả</h3>
                <p className="text-gray-500 mt-2 mb-8">Thử điều chỉnh bộ lọc hoặc xóa từ khóa tìm kiếm.</p>
                <button onClick={() => { clearSearch(); resetFilters(); }} className="px-8 py-3 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Xóa tất cả</button>
            </div>
        )}
      </div>
    </div>
  );
};

const FilterSectionTitle = ({ label }: { label: string }) => (
    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</h3>
);
