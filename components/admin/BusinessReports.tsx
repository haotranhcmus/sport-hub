import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import {
  DollarSign,
  Landmark,
  ShoppingCart,
  RotateCcw,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Package,
  Users,
  Info,
  ChevronRight,
  FileText,
} from "lucide-react";
import { api } from "../../services";
import { StatCard } from "./SharedUI";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper để format tiền VND
const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

// Helper để format ngày
const formatDate = (date: Date) => {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Range labels cho PDF
const RANGE_LABELS: Record<string, string> = {
  today: "Hôm nay",
  "7days": "7 ngày qua",
  month: "Tháng này",
  year: "Năm nay",
};

export const ReportsManager = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    console.log("📊 [ReportsManager] Loading reports for range:", timeRange);
    setLoading(true);
    api.reports
      .getRevenueData({ range: timeRange })
      .then((res) => {
        console.log("✅ [ReportsManager] Data loaded:", res);
        setData(res);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ [ReportsManager] Error loading reports:", error);
        setLoading(false);
      });
  }, [timeRange]);

  // Hàm xuất PDF
  const exportToPDF = useCallback(async () => {
    if (!data) return;

    setExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("BAO CAO KINH DOANH", pageWidth / 2, y, { align: "center" });
      y += 10;

      // Subtitle với thời gian
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Ky bao cao: ${RANGE_LABELS[timeRange] || timeRange}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 6;
      doc.setFontSize(10);
      doc.text(`Ngay xuat: ${formatDate(new Date())}`, pageWidth / 2, y, {
        align: "center",
      });
      y += 15;

      // Metrics Summary
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TONG QUAN", 14, y);
      y += 8;

      // Metrics table
      autoTable(doc, {
        startY: y,
        head: [["Chi tieu", "Gia tri", "Tang truong"]],
        body: [
          [
            "Doanh thu thuan",
            formatVND(data.metrics.netRevenue),
            `${data.metrics.growth.revenue > 0 ? "+" : ""}${
              data.metrics.growth.revenue
            }%`,
          ],
          [
            "Loi nhuan gop",
            formatVND(data.metrics.profit),
            `${data.metrics.growth.profit > 0 ? "+" : ""}${
              data.metrics.growth.profit
            }%`,
          ],
          [
            "Tong don hang",
            data.metrics.orderTotal.toString(),
            `${data.metrics.growth.orders > 0 ? "+" : ""}${
              data.metrics.growth.orders
            }%`,
          ],
          [
            "Don tra hang",
            data.metrics.returnCount.toString(),
            `${data.metrics.returnRate}%`,
          ],
          [
            "Gia tri trung binh/don",
            formatVND(data.metrics.avgOrderValue),
            "-",
          ],
        ],
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      });

      y = (doc as any).lastAutoTable.finalY + 15;

      // Top Products
      if (data.topProducts && data.topProducts.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("TOP SAN PHAM BAN CHAY", 14, y);
        y += 8;

        autoTable(doc, {
          startY: y,
          head: [["#", "Ten san pham", "Da ban", "Doanh thu"]],
          body: data.topProducts
            .slice(0, 10)
            .map((p: any, idx: number) => [
              (idx + 1).toString(),
              p.name.substring(0, 40) + (p.name.length > 40 ? "..." : ""),
              p.sold.toString(),
              formatVND(p.revenue),
            ]),
          theme: "striped",
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 90 },
            2: { cellWidth: 25 },
            3: { cellWidth: 45 },
          },
        });

        y = (doc as any).lastAutoTable.finalY + 15;
      }

      // Category Breakdown
      if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
        if (y > 220) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("DOANH THU THEO DANH MUC", 14, y);
        y += 8;

        const totalCategoryValue = data.categoryBreakdown.reduce(
          (sum: number, c: any) => sum + c.value,
          0
        );
        autoTable(doc, {
          startY: y,
          head: [["Danh muc", "Doanh thu", "Ty le"]],
          body: data.categoryBreakdown.map((c: any) => [
            c.name,
            formatVND(c.value),
            `${
              totalCategoryValue > 0
                ? Math.round((c.value / totalCategoryValue) * 100)
                : 0
            }%`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [245, 158, 11] },
          styles: { fontSize: 10 },
        });

        y = (doc as any).lastAutoTable.finalY + 15;
      }

      // Payment Methods
      if (data.paymentData && data.paymentData.length > 0) {
        if (y > 220) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PHUONG THUC THANH TOAN", 14, y);
        y += 8;

        autoTable(doc, {
          startY: y,
          head: [["Phuong thuc", "So don", "Tong tien"]],
          body: data.paymentData.map((p: any) => [
            p.method,
            p.count.toString(),
            formatVND(p.amount),
          ]),
          theme: "striped",
          headStyles: { fillColor: [139, 92, 246] },
          styles: { fontSize: 10 },
        });

        y = (doc as any).lastAutoTable.finalY + 15;
      }

      // Revenue Chart Data (as table)
      if (data.chartData && data.chartData.length > 0) {
        if (y > 180) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("CHI TIET DOANH THU THEO NGAY", 14, y);
        y += 8;

        autoTable(doc, {
          startY: y,
          head: [["Ngay", "Doanh thu", "So don"]],
          body: data.chartData.map((d: any) => [
            d.date,
            formatVND(d.revenue),
            d.orders.toString(),
          ]),
          theme: "striped",
          headStyles: { fillColor: [6, 182, 212] },
          styles: { fontSize: 9 },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Trang ${i}/${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10
        );
        doc.text(
          "Sport Shop - Bao cao kinh doanh",
          14,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      // Save
      const fileName = `bao-cao-kinh-doanh-${timeRange}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
      console.log("✅ PDF exported:", fileName);
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
      alert("Có lỗi khi xuất PDF. Vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  }, [data, timeRange]);

  if (loading && !data)
    return (
      <div className="py-20 text-center">
        <RefreshCw
          className="animate-spin mx-auto text-secondary mb-4"
          size={32}
        />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Đang tính toán dữ liệu...
        </p>
      </div>
    );

  return (
    <div className="space-y-10 animate-in fade-in pb-20 p-6 md:p-8 w-full">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
            Trung tâm Phân tích
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Dữ liệu kinh doanh thời gian thực
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            {[
              { id: "today", label: "Hôm nay" },
              { id: "7days", label: "7 Ngày" },
              { id: "month", label: "Tháng này" },
              { id: "year", label: "Năm nay" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition ${
                  timeRange === r.id
                    ? "bg-slate-900 text-white shadow-xl"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-secondary transition shadow-sm">
            <Download size={20} />
          </button>
          <button
            onClick={exportToPDF}
            disabled={exporting || !data}
            className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all ${
              exporting
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-blue-700 hover:to-blue-800"
            }`}
            title="Xuất báo cáo PDF"
          >
            {exporting ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <FileText size={18} />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider">
              {exporting ? "Đang xuất..." : "Xuất PDF"}
            </span>
          </button>
        </div>
      </div>

      {data && (
        <div className="space-y-10">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<DollarSign size={24} />}
              title="Doanh thu thuần"
              value={`${data.metrics.netRevenue.toLocaleString()}đ`}
              color="bg-emerald-500"
              trend={{ val: data.metrics.growth.revenue, up: true }}
            />
            <StatCard
              icon={<Landmark size={24} />}
              title="Lợi nhuận gộp"
              value={`${data.metrics.profit.toLocaleString()}đ`}
              color="bg-blue-600"
              trend={{ val: data.metrics.growth.profit, up: true }}
            />
            <StatCard
              icon={<ShoppingCart size={24} />}
              title="Lượng đơn hàng"
              value={data.metrics.orderTotal.toString()}
              color="bg-indigo-600"
              trend={{ val: data.metrics.growth.orders, up: true }}
            />
            <StatCard
              icon={<RotateCcw size={24} />}
              title="Tỷ lệ hoàn hàng"
              value={`${data.metrics.returnCount}%`}
              color="bg-orange-500"
              trend={{ val: "-2.1%", up: false }}
            />
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Revenue Trend Area Chart */}
            <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">
                    Biểu đồ tăng trưởng
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                    Theo dõi biến động doanh thu & đơn hàng
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Doanh thu
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Đơn hàng
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={data.chartData}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                      tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      hide
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "24px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        padding: "20px",
                      }}
                      labelStyle={{
                        fontWeight: 900,
                        marginBottom: "10px",
                        textTransform: "uppercase",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      name="Doanh thu"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="orders"
                      fill="#e2e8f0"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                      name="Đơn hàng"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="lg:col-span-4 bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight mb-2">
                Cơ cấu doanh mục
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-8">
                Tỷ trọng doanh thu theo ngành hàng
              </p>

              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      stroke="none"
                    >
                      {data.categoryBreakdown.map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 mt-8">
                {data.categoryBreakdown.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-800">
                      {((item.value / data.metrics.netRevenue) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Top Products & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Top Selling Products */}
            <div className="lg:col-span-8 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">
                      Top Sản phẩm Bán chạy
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Xếp hạng theo sản lượng tiêu thụ
                    </p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-secondary uppercase hover:underline">
                  Xem báo cáo chi tiết
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-8 py-5">Xếp hạng</th>
                      <th className="px-6 py-5">Tên sản phẩm</th>
                      <th className="px-6 py-5 text-center">Đã bán</th>
                      <th className="px-8 py-5 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topProducts.map((prod: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/50 transition group"
                      >
                        <td className="px-8 py-6">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                              idx === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : idx === 1
                                ? "bg-slate-100 text-slate-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            #{idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="font-black text-sm uppercase text-slate-800">
                            {prod.name}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            SKU: {prod.sku}
                          </p>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="px-4 py-1.5 bg-blue-50 text-secondary rounded-xl text-xs font-black">
                            {prod.sold}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className="font-black text-slate-900">
                            {prod.revenue.toLocaleString()}đ
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight mb-8">
                  Hình thức Thanh toán
                </h3>
                <div className="space-y-6">
                  {data.paymentData.map((pm: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-slate-500">
                          {pm.method}
                        </span>
                        <span className="text-xs font-black text-slate-800">
                          {pm.count} đơn
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              (pm.count /
                                (data.paymentData[0].count +
                                  data.paymentData[1].count +
                                  data.paymentData[2].count)) *
                              100
                            }%`,
                            backgroundColor: pm.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 p-6 bg-slate-900 rounded-[32px] text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <Users size={20} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        Khách hàng mới
                      </p>
                      <p className="text-2xl font-black">+24</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-green-400">
                      <ArrowUpRight size={16} />
                      <span className="text-[10px] font-black">12%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary to-indigo-700 p-8 md:p-10 rounded-[40px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                <TrendingUp
                  size={120}
                  className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition duration-500"
                />
                <div className="relative z-10 space-y-4">
                  <h4 className="text-lg font-black uppercase tracking-tight">
                    Dự báo thông minh
                  </h4>
                  <p className="text-xs font-medium text-blue-100 leading-relaxed">
                    Dựa trên dữ liệu 7 ngày qua, doanh thu tuần tới dự kiến tăng{" "}
                    <b className="text-white">~8.5%</b>. Khuyến nghị nhập thêm
                    hàng Nike Mercurial.
                  </p>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-secondary px-6 py-2.5 rounded-xl shadow-lg hover:bg-blue-50 transition">
                    Xem chi tiết dự báo <ChevronRight size={14} />
                  </button>
                </div>
              </div>
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
