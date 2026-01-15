import React, { useState, useEffect } from "react";
import { Eye, X, Printer, FileText, Search, PackageOpen } from "lucide-react";
import { api } from "../../services";
import { StockIssue } from "../../types";

export const StockIssueManager = () => {
  const [issueHistory, setIssueHistory] = useState<StockIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<StockIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    console.log("📤 [StockIssueSystem] Fetching stock issues...");
    setLoading(true);
    try {
      const history = await api.inventory.getIssueEntries();
      console.log(
        "✅ [StockIssueSystem] Fetched:",
        history?.length || 0,
        "entries"
      );
      console.log("📦 [StockIssueSystem] Sample data:", history?.slice(0, 2));
      setIssueHistory(history);
    } catch (error) {
      console.error("❌ [StockIssueSystem] Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const filtered = issueHistory.filter(
    (i) =>
      i.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.orderCodes?.some((o) =>
        o.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-8 animate-in fade-in text-slate-900 p-6 md:p-8 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
            Quản lý Xuất kho
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Lịch sử phiếu xuất bán hàng & đối soát vận hành
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition active:scale-95"
        >
          <RefreshCw
            size={20}
            className={`text-slate-400 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
        <Search className="text-slate-300 ml-2" size={24} />
        <input
          type="text"
          placeholder="Tìm theo mã phiếu, mã đơn hàng hoặc tên khách hàng..."
          className="flex-1 bg-transparent border-none outline-none font-black text-sm uppercase text-slate-900 placeholder:text-slate-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
            <PackageOpen size={16} className="text-secondary" /> Danh sách phiếu
            xuất đã lập
          </h4>
          <span className="text-[10px] font-black text-slate-400 uppercase">
            {filtered.length} phiếu
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-10 py-6">Mã phiếu / Đơn hàng</th>
                <th className="px-6 py-6">Ngày xuất</th>
                <th className="px-6 py-6">Khách hàng</th>
                <th className="px-6 py-6 text-center">SL Xuất</th>
                <th className="px-10 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? (
                filtered.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition cursor-pointer group"
                    onClick={() => setViewingIssue(item)}
                  >
                    <td className="px-10 py-6">
                      <p className="font-black uppercase text-sm text-secondary tracking-tighter">
                        {item.code}
                      </p>
                      {item.orderCodes?.[0] && (
                        <p className="text-[9px] text-slate-400 font-black mt-0.5 uppercase tracking-widest">
                          Đơn: {item.orderCodes[0]}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-6 font-bold text-slate-600 text-xs">
                      {new Date(item.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-6 font-black uppercase text-xs text-slate-800">
                      {item.customerName}
                    </td>
                    <td className="px-6 py-6 text-center font-black text-slate-700">
                      {item.items.reduce(
                        (acc: any, i: any) => acc + i.quantity,
                        0
                      )}{" "}
                      cái
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingIssue(item);
                        }}
                        className="p-3 bg-white border border-gray-100 text-slate-400 hover:text-secondary hover:border-secondary hover:shadow-sm rounded-xl transition transform hover:scale-110"
                        title="Xem chi tiết phiếu xuất"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-24 text-center text-slate-300 font-black text-xs uppercase tracking-widest italic"
                  >
                    Trống danh sách phiếu xuất
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingIssue && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                Xem trước phiếu xuất kho chuẩn
              </h3>
              <button
                onClick={() => setViewingIssue(null)}
                className="p-2 bg-white border border-gray-100 text-slate-400 hover:text-red-500 rounded-xl transition transform active:scale-90"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-white custom-scrollbar">
              <div className="border-4 border-slate-900 p-1 font-mono text-slate-900">
                <div className="border border-slate-900 p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                      PHIẾU XUẤT KHO
                    </h1>
                    <div className="h-0.5 bg-slate-900 w-full mx-auto"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-sm text-slate-900">
                    <div className="space-y-1">
                      <p>
                        <span className="font-black">Mã phiếu:</span>{" "}
                        {viewingIssue.code}
                      </p>
                      <p>
                        <span className="font-black">Ngày xuất:</span>{" "}
                        {new Date(viewingIssue.date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                      <p>
                        <span className="font-black">Kho xuất:</span>{" "}
                        {viewingIssue.warehouseName || "Kho Tổng HCM"}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p>
                        <span className="font-black">Đơn hàng:</span>{" "}
                        {viewingIssue.orderCodes?.[0]}
                      </p>
                      <p>
                        <span className="font-black">Khách hàng:</span>{" "}
                        {viewingIssue.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="border-y-2 border-slate-900 border-dashed py-5 space-y-2 text-sm text-slate-900 bg-gray-50/50 px-4">
                    <p>
                      <span className="font-black">Đơn vị vận chuyển:</span>{" "}
                      {viewingIssue.courierName}
                    </p>
                    <p>
                      <span className="font-black">Mã vận đơn:</span>{" "}
                      <span className="font-black text-secondary">
                        {viewingIssue.trackingNumber}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-4 text-slate-900">
                    <p className="font-black text-center text-sm uppercase tracking-widest underline">
                      DANH SÁCH HÀNG XUẤT
                    </p>
                    <div className="border-2 border-slate-900">
                      <table className="w-full text-xs text-left">
                        <thead className="border-b-2 border-slate-900 bg-slate-100 text-slate-900">
                          <tr>
                            <th className="p-3 w-12 text-center border-r-2 border-slate-900">
                              STT
                            </th>
                            <th className="p-3 border-r-2 border-slate-900">
                              Sản phẩm / Phân loại
                            </th>
                            <th className="p-3 border-r-2 border-slate-900">
                              SKU
                            </th>
                            <th className="p-3 text-center border-r-2 border-slate-900">
                              Size
                            </th>
                            <th className="p-3 text-center border-r-2 border-slate-900">
                              Màu
                            </th>
                            <th className="p-3 text-center">SL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-900">
                          {viewingIssue.items.map((item, idx) => (
                            <tr key={idx} className="text-slate-900">
                              <td className="p-3 text-center border-r-2 border-slate-900 font-bold">
                                {idx + 1}
                              </td>
                              <td className="p-3 border-r-2 border-slate-900 font-black uppercase text-[10px]">
                                {item.productName}
                              </td>
                              <td className="p-3 border-r-2 border-slate-900 font-bold">
                                {item.sku}
                              </td>
                              <td className="p-3 text-center border-r-2 border-slate-900 uppercase font-black">
                                {item.size || "-"}
                              </td>
                              <td className="p-3 text-center border-r-2 border-slate-900 uppercase font-black">
                                {item.color || "-"}
                              </td>
                              <td className="p-3 text-center font-black">
                                {item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-right font-black text-sm pt-4 border-t-2 border-slate-900">
                      TỔNG SỐ LƯỢNG XUẤT:{" "}
                      <span className="text-xl ml-2">
                        {viewingIssue.items.reduce(
                          (acc, i) => acc + i.quantity,
                          0
                        )}{" "}
                        cái
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-12 text-sm italic text-slate-900">
                    <div className="space-y-16">
                      <div className="text-center space-y-1">
                        <p className="font-black not-italic text-slate-900 uppercase">
                          Người xuất kho
                        </p>
                        <p className="text-[10px] uppercase opacity-60">
                          (Ký và ghi rõ họ tên)
                        </p>
                      </div>
                      <p className="text-center font-black not-italic text-lg underline decoration-slate-300 decoration-double uppercase">
                        {viewingIssue.actorName}
                      </p>
                    </div>
                    <div className="space-y-16">
                      <div className="text-center space-y-1">
                        <p className="font-black not-italic text-slate-900 uppercase">
                          Người giao hàng
                        </p>
                        <p className="text-[10px] uppercase opacity-60">
                          (Ký và ghi rõ họ tên)
                        </p>
                      </div>
                      <p className="text-center font-black not-italic text-lg uppercase">
                        {viewingIssue.deliveryPerson ||
                          "........................."}
                      </p>
                    </div>
                  </div>

                  <div className="text-center pt-10 opacity-30 text-[8px] uppercase tracking-widest font-black">
                    SportHub - Hệ thống vận hành kho bãi chính hãng v3.5.2025
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => setViewingIssue(null)}
                className="px-10 py-4 font-black text-slate-400 uppercase text-[10px] hover:text-slate-600 transition tracking-widest"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:bg-black transition active:scale-95"
              >
                <Printer size={16} /> IN PHIẾU XUẤT KHO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom RefreshCw icon component
const RefreshCw = ({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);
