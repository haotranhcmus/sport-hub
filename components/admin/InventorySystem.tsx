
import React, { useState, useEffect, useMemo } from 'react';
import { Landmark, AlertCircle, Package, FileSpreadsheet, ArrowDownUp, Plus, Eye, X, Info, CheckCircle2, RefreshCw, AlertOctagon, User } from 'lucide-react';
import { api } from '../../services';
import { Category, Stocktake, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from './SharedUI';

export const InventoryReportManager = ({ onGoToStockEntry }: { onGoToStockEntry: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState({ categoryId: '', brandId: '', stockStatus: 'all' });
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'stockQuantity', direction: 'asc' });

    useEffect(() => { api.categories.list().then(setCategories); }, []);
    useEffect(() => { setLoading(true); api.reports.getInventoryData(filters).then(res => { setReportData(res); setLoading(false); }); }, [filters]);

    const sortedList = useMemo(() => {
        if (!reportData?.list) return [];
        const items = [...reportData.list];
        if (sortConfig) {
            items.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? (sortConfig.direction === 'asc' ? -1 : 1) : (sortConfig.direction === 'asc' ? 1 : -1)));
        }
        return items;
    }, [reportData, sortConfig]);

    return (
        <div className="space-y-10 animate-in fade-in text-slate-900">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">Báo cáo tồn kho</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest">Phân tích giá trị & Vốn lưu động</p>
                </div>
                <button onClick={() => alert("Chức năng xuất báo cáo Excel đang được khởi tạo")} className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase shadow-xl flex items-center gap-3 hover:bg-black transition">
                    <FileSpreadsheet size={18}/> Xuất báo cáo
                </button>
            </div>
            {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard icon={<Landmark size={24}/>} title="Tổng giá trị tồn kho" value={`${reportData.metrics.totalValue.toLocaleString()}đ`} color="bg-blue-600" />
                    <StatCard icon={<AlertCircle size={24}/>} title="Sản phẩm sắp hết" value={`${reportData.metrics.lowStockCount} SKU`} color="bg-red-500" />
                    <StatCard icon={<Package size={24}/>} title="Tổng số lượng thực tế" value={`${reportData.metrics.totalItems.toLocaleString()} cái`} color="bg-slate-800" />
                </div>
            )}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-6">Sản phẩm / Biến thể</th>
                            <th className="px-6 py-6 text-center cursor-pointer" onClick={() => setSortConfig({ key: 'stockQuantity', direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc' })}>
                                Tồn thực tế <ArrowDownUp size={12} className="inline ml-1 text-slate-300"/>
                            </th>
                            <th className="px-6 py-6 text-right">Giá vốn (BQ)</th>
                            <th className="px-6 py-6 text-right">Giá trị tồn</th>
                            <th className="px-8 py-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedList.length > 0 ? sortedList.map((item: any, idx: number) => (
                            <tr key={idx} className={`hover:bg-gray-50/50 transition ${item.isLowStock ? 'bg-red-50/30' : ''}`}>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <img src={item.thumbnail} className="w-12 h-12 rounded-xl object-cover border border-gray-100" alt="" />
                                        <div>
                                            <p className="font-black text-sm uppercase text-slate-800">{item.productName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.sku}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-center text-xl font-black text-slate-900">{item.stockQuantity}</td>
                                <td className="px-6 py-6 text-right font-bold text-slate-600 text-xs">{item.costPrice.toLocaleString()}đ</td>
                                <td className="px-6 py-6 text-right font-black text-slate-800">{item.inventoryValue.toLocaleString()}đ</td>
                                <td className="px-8 py-6 text-center">
                                    {item.isLowStock && (
                                        <button onClick={onGoToStockEntry} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-red-500/20 hover:scale-105 transition">
                                            Lập phiếu nhập
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-24 text-center text-slate-300 font-black text-xs uppercase tracking-widest italic">
                                    Chưa có dữ liệu báo cáo
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const StocktakeManager = () => {
    const { user: currentUser } = useAuth();
    const [stocktakes, setStocktakes] = useState<Stocktake[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStocktake, setCurrentStocktake] = useState<Stocktake | null>(null);
    const [isConfirmBalanceOpen, setIsConfirmBalanceOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => { 
        const history = await api.inventory.getStocktakes(); 
        setStocktakes(history); 
    };
    useEffect(() => { fetchData(); }, []);

    // Khởi tạo quy trình kiểm kê nhưng chưa lưu vào API
    const handleStart = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const products = await api.products.list();
            const items: any[] = [];
            products.forEach((p: Product) => p.variants.forEach((v: any) => items.push({ 
                id: `tmp-${Date.now()}-${Math.random()}`, 
                variantId: v.id, 
                productName: p.name, 
                variantName: `${v.color}/${v.size}`, 
                sku: v.sku, 
                systemStock: v.stockQuantity, 
                actualStock: v.stockQuantity, 
                discrepancy: 0 
            })));
            
            // Chỉ set dữ liệu local, không gọi api.inventory.saveStocktake ở đây
            setCurrentStocktake({
                id: 'new', // Chưa có ID thực từ server
                code: `KIEM-KHO-${new Date().getTime().toString().slice(-6)}`,
                date: new Date().toISOString(),
                status: 'draft',
                items,
                totalDiscrepancy: 0,
                auditorName: currentUser.fullName,
                scope: 'Toàn bộ kho'
            });
            setIsModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Chỉ khi cân bằng kho mới thực sự tạo bản ghi
    const handleConfirmBalance = async () => {
        if (!currentStocktake || !currentUser) return;
        setLoading(true);
        try {
            // Gọi API lưu chính thức phiếu kiểm kê với trạng thái completed
            await api.inventory.saveStocktake({...currentStocktake, status: 'completed'}, currentUser);
            setIsConfirmBalanceOpen(false);
            setIsModalOpen(false);
            await fetchData();
            alert("Đã hoàn tất kiểm kê và cập nhật số liệu tồn kho hệ thống.");
        } catch (err) {
            alert("Lỗi khi xử lý cân bằng kho.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = (stk: Stocktake) => {
        setCurrentStocktake(stk);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in text-slate-900">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">Lịch sử kiểm kê</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Danh sách các đợt đã cân bằng kho</p>
                </div>
                <button onClick={handleStart} disabled={loading} className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3 hover:bg-blue-600 transition disabled:opacity-50">
                    {loading ? <RefreshCw className="animate-spin" size={18}/> : <Plus size={18}/>} Tạo phiếu kiểm mới
                </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-10 py-6">Mã Phiếu / Phạm vi</th>
                            <th className="px-6 py-6">Ngày kiểm kê</th>
                            <th className="px-6 py-6">Người thực hiện</th>
                            <th className="px-10 py-6 text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {stocktakes.length > 0 ? stocktakes.map(stk => (
                            <tr key={stk.id} className="hover:bg-gray-50 transition group">
                                <td className="px-10 py-6">
                                    <p className="font-black uppercase text-sm text-secondary tracking-tighter">{stk.code}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{stk.scope}</p>
                                </td>
                                <td className="px-6 py-6 font-bold text-slate-600 text-xs">{new Date(stk.date).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User size={12} className="text-slate-400" />
                                        </div>
                                        <span className="text-xs font-black uppercase text-slate-700 tracking-tight">{stk.auditorName}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <button onClick={() => handleOpenDetail(stk)} className="p-3 text-slate-300 hover:text-secondary transition hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transform group-hover:scale-110">
                                        <Eye size={18}/>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="py-24 text-center text-slate-300 font-black text-xs uppercase tracking-widest italic">
                                    Chưa có dữ liệu kiểm kê nào được lưu chính thức
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT KIỂM KÊ */}
            {isModalOpen && currentStocktake && (
                <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white rounded-[40px] w-full max-w-6xl shadow-2xl overflow-hidden p-0 flex flex-col max-h-[95vh] animate-in zoom-in-95">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">
                                    {currentStocktake.id === 'new' ? 'Đang thực hiện kiểm kê' : `Phiếu kiểm kê: ${currentStocktake.code}`}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">
                                    Nhân viên thực hiện: <span className="text-slate-900">{currentStocktake.auditorName}</span>
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-2xl transition shadow-sm border border-transparent hover:border-gray-100"><X size={24}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-black text-slate-500 uppercase border-b border-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-5">Sản phẩm / SKU</th>
                                        <th className="px-6 py-5 text-center">Tồn hệ thống</th>
                                        <th className="px-6 py-5 text-center">Tồn thực tế</th>
                                        <th className="px-6 py-5 text-center">Chênh lệch</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-slate-900">
                                    {currentStocktake.items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-6">
                                                <p className="font-black uppercase text-xs text-slate-800">{item.productName}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">{item.variantName} • {item.sku}</p>
                                            </td>
                                            <td className="px-6 py-6 text-center font-black text-lg text-slate-400">{item.systemStock}</td>
                                            <td className="px-6 py-6 text-center">
                                                <input 
                                                    type="number" 
                                                    disabled={currentStocktake.id !== 'new'} 
                                                    className="w-24 bg-white border border-gray-200 rounded-xl p-3 text-center font-black text-slate-900 outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition shadow-sm disabled:opacity-50 disabled:bg-gray-50" 
                                                    value={item.actualStock} 
                                                    onChange={e => { 
                                                        const val = parseInt(e.target.value) || 0; 
                                                        const updated = currentStocktake.items.map((i: any) => i.id === item.id ? { ...i, actualStock: val, discrepancy: val - i.systemStock } : i); 
                                                        setCurrentStocktake({...currentStocktake, items: updated}); 
                                                    }} 
                                                />
                                            </td>
                                            <td className={`px-6 py-6 text-center font-black text-lg ${item.discrepancy === 0 ? 'text-slate-200' : item.discrepancy > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy === 0 ? '0' : item.discrepancy}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-3xl shadow-sm text-slate-500 max-w-lg">
                                <Info size={20} className="shrink-0 text-secondary" />
                                <p className="text-[9px] font-bold uppercase leading-relaxed text-slate-400 tracking-tight">
                                    {currentStocktake.id === 'new' 
                                        ? "Chỉ khi nhấn 'XÁC NHẬN CÂN BẰNG KHO', hệ thống mới lưu phiếu vào lịch sử và điều chỉnh tồn thực tế trên website."
                                        : "Phiếu kiểm kê này đã được cân bằng và lưu trữ, dữ liệu chỉ dùng để đối soát."}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-800 transition">Đóng cửa sổ</button>
                                {currentStocktake.id === 'new' && (
                                    <button 
                                        onClick={() => setIsConfirmBalanceOpen(true)} 
                                        className="px-12 py-4 bg-secondary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-600 transition active:scale-95"
                                    >
                                        XÁC NHẬN CÂN BẰNG KHO
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN CÂN BẰNG KHO */}
            {isConfirmBalanceOpen && (
                <div className="fixed inset-0 bg-black/70 z-[400] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                <AlertOctagon size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cân bằng tồn kho?</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Dữ liệu thực tế sẽ được cập nhật lên Website và phiếu này sẽ được lưu vào lịch sử kiểm kê. Bạn chắc chắn muốn tiếp tục?
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button 
                                    onClick={() => setIsConfirmBalanceOpen(false)} 
                                    className="py-4 bg-gray-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
                                >
                                    Quay lại
                                </button>
                                <button 
                                    onClick={handleConfirmBalance}
                                    disabled={loading}
                                    className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={14}/> : 'XÁC NHẬN LƯU'}
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">SportHub Warehouse System v3.5</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
