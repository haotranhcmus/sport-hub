import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { api } from "../../services";
import { StatCard } from "./SharedUI";

export const ReportsManager = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

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
    <div className="space-y-10 animate-in fade-in pb-20">
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
