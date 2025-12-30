import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

// UC04: Đăng ký tài khoản
export const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');
        }, 1500);
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md animate-fade-in">
                <h1 className="text-2xl font-bold text-center mb-2">Tạo tài khoản</h1>
                <p className="text-center text-gray-500 mb-8">Trở thành thành viên của SportHub</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary outline-none" placeholder="Nguyễn Văn A" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary outline-none" placeholder="name@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input type="tel" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary outline-none" placeholder="0909xxxxxx" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input type="password" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                        <input type="password" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary outline-none" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-70 shadow-lg shadow-blue-500/30"
                    >
                        {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Đã có tài khoản? <Link to="/login" className="text-secondary hover:underline font-bold">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

// UC00: Quên mật khẩu
export const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md animate-fade-in">
                {step === 1 ? (
                    <>
                        <div className="flex items-center mb-6">
                            <Link to="/login" className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></Link>
                            <h1 className="text-2xl font-bold ml-2">Quên mật khẩu?</h1>
                        </div>
                        <p className="text-gray-500 mb-8">Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng ký</label>
                                <input type="email" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary outline-none" placeholder="name@example.com" />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition disabled:opacity-70"
                            >
                                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Đã gửi email!</h2>
                        <p className="text-gray-500 mb-8">Vui lòng kiểm tra hộp thư đến của bạn để thực hiện đặt lại mật khẩu.</p>
                        <Link to="/login" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};