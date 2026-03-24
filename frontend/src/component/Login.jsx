import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../redux/slice/auth.slice';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email Address is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: async (values) => {
            try {
                await dispatch(loginUser(values)).unwrap();
                navigate('/');
            } catch (error) {
                console.error("Login Error:", error);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-[4px] shadow-lg p-8 sm:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-textPrimary mb-2 flex items-center justify-center gap-2">
                        Welcome Back <span>👋</span>
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                        Shop millions of products in one place.
                    </p>
                </div>
                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-textPrimary block mb-2">Email Address <span className="text-red-500">*</span></label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${formik.touched.email && formik.errors.email
                                ? 'border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-primary'
                                }`}
                            placeholder="Enter your email"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-textPrimary block mb-2">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${formik.touched.password && formik.errors.password
                                    ? 'border-red-500 focus:ring-red-100'
                                    : 'border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-primary'
                                    }`}
                                placeholder="Your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-textSecondary hover:text-textPrimary transition"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <Eye size={20} />
                                ) : (
                                    <EyeOff size={20} />
                                )}
                            </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                            <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
                        )}

                        <div className="flex justify-end mt-2">
                            <Link
                                to="/forgot-password"
                                className="text-xs text-[#5a6b82] hover:text-textPrimary font-medium transition"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 px-4 rounded-[4px] transition-all duration-300 shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Log In'
                        )}
                    </button>
                </form>
                <div className="mt-8 text-center text-sm font-semibold text-gray-800">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                        Create Account
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Login;