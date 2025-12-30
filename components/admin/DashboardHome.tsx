
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Users, AlertCircle } from 'lucide-react';
import { StatCard } from './SharedUI';

export const DashboardView = () => {
    const chartData = [
        { name: 'T2', doanhThu: 4000 },
        { name: 'T3', doanhThu: 3000 },
        { name: 'T4', doanhThu: 2000 },
        { name: 'T5', doanhThu: 2780 },
        { name: 'T6', doanhThu: 1890 },
        { name: 'T7', doanhThu: 2390 },
        { name: 'CN', doanhThu: 3490 },
    ];
    return (
        <div className="space-y-8 animate-in fade-in">
          <h1 className="text-2xl font-bold text-gray-800 hidden md:block uppercase tracking-tight">Tổng quan Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<DollarSign size={24}/>} title="Doanh thu ngày" value="12.500.000đ" color="bg-green-500" trend={{ val: '+12%', up: true }} />
            <StatCard icon={<ShoppingCart size={24}/>} title="Đơn hàng mới" value="15" color="bg-blue-500" />
            <StatCard icon={<Users size={24}/>} title="Khách hàng mới" value="8" color="bg-purple-500" trend={{ val: '-2%', up: false }} />
            <StatCard icon={<AlertCircle size={24}/>} title="Cần xử lý" value="3" color="bg-red-500" />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
            <h2 className="text-lg font-bold mb-4">Biểu đồ doanh thu tuần</h2>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="doanhThu" fill="#3b82f6" name="Doanh thu" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
    );
};
