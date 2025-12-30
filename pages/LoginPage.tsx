import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password'); // Mặc định để demo
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
        // Giả lập delay và check logic cơ bản
        if (!email || !password) {
            throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
        }
        await login(email, password);
        navigate('/');
    } catch (e: any) {
        setError(e.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 text-secondary mb-4">
                <LogIn size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-500 mt-2">Chào mừng bạn quay trở lại SportHub</p>
        </div>

        {/* Error Message */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-in fade-in">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={20} />
                    </div>
                    <input 
                        type="email" 
                        required
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition bg-gray-50 focus:bg-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                    <Link to="/forgot-password" className="text-xs font-medium text-secondary hover:text-blue-700 hover:underline transition">
                        Quên mật khẩu?
                    </Link>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock size={20} />
                    </div>
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-12 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition bg-gray-50 focus:bg-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-1 italic">* Mật khẩu demo mặc định là 'password'</p>
            </div>
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition duration-200 transform hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xử lý...</span>
                    </>
                ) : (
                    <span>Đăng nhập</span>
                )}
            </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản? <Link to="/register" className="text-secondary hover:text-blue-700 font-bold hover:underline">Đăng ký ngay</Link>
        </div>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-3">Tài khoản Demo (Click để điền nhanh)</p>
             <div className="flex gap-3 justify-center">
                <button 
                    onClick={() => { setEmail('admin@sporthub.vn'); setError(''); }} 
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-600 font-medium transition"
                >
                    Admin
                </button>
                <button 
                    onClick={() => { setEmail('user@gmail.com'); setError(''); }} 
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-600 font-medium transition"
                >
                    Khách hàng
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};