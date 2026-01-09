import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// Breadcrumb component
export const Breadcrumb = ({ items }: { items: string[] }) => (
  <div className="flex items-center gap-2 text-sm mb-6">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
        <span
          className={
            index === items.length - 1
              ? "text-secondary font-bold"
              : "text-gray-500"
          }
        >
          {item}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition ${
      active
        ? "bg-secondary/10 text-secondary"
        : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

// Component cho submenu item
export const SidebarSubItem = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full pl-10 pr-4 py-2.5 rounded-lg text-sm font-medium transition ${
      active
        ? "bg-secondary/10 text-secondary"
        : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

// Component cho module có thể collapse
export const SidebarModule = ({
  icon,
  label,
  children,
  defaultExpanded = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          {icon}
          {label}
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isExpanded && (
        <div className="space-y-1 animate-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </div>
  );
};

export const StatCard = ({
  icon,
  title,
  value,
  color,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  trend?: { val: string; up: boolean };
}) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center hover:shadow-md transition group">
    <div
      className={`p-4 rounded-3xl text-white mr-6 shadow-xl transition-transform group-hover:scale-110 ${color}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className="text-2xl font-black text-gray-800 tracking-tighter">
        {value}
      </p>
      {trend && (
        <div
          className={`flex items-center gap-1 mt-1 text-[10px] font-black uppercase ${
            trend.up ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend.up ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
          {trend.val}
        </div>
      )}
    </div>
  </div>
);

export const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  suffix,
}: any) => (
  <div className="flex-1 min-w-[200px]">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
      {label} {required && "*"}
    </label>
    <div className="relative">
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`w-full border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/10 transition ${
          disabled
            ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-secondary/40"
        }`}
        value={value}
        onChange={(e) =>
          onChange?.(
            type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
          )
        }
      />
      {suffix && (
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export const TabButton = ({
  id,
  active,
  onClick,
  label,
  icon,
}: {
  id: string;
  active: string;
  onClick: any;
  label: string;
  icon: any;
}) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition ${
      active === id
        ? "bg-white text-secondary shadow-md"
        : "text-gray-400 hover:bg-white/50 hover:text-gray-600"
    }`}
  >
    {icon} {label}
  </button>
);
