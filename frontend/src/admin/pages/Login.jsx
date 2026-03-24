import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../../redux/slice/auth.slice';
// import loginlogo from '../../Img/loginlogo1.svg';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) return;

        const redirectPath =
            user?.role === 'admin'
                ? '/admin/dashboard'
                : '/';

        navigate(redirectPath, { replace: true });
    }, [isAuthenticated, user, navigate]);

    const validationSchema = useMemo(() =>
        Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .min(6, 'Password must be at least 6 characters')
                .required('Password is required'),
        }), []
    );

    const handleSubmit = useCallback((values) => {
        dispatch(loginUser(values));
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <div className="min-h-screen bg-bg-color flex items-center justify-center p-4 font-jost relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-100 opacity-20 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white rounded-[4px] shadow-xl w-full max-w-md p-5 md:p-12 relative z-10 border border-gray-100">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-2 w-full">
                        <div className='mt-[-17px]'>
                            {/* <img src={loginlogo} alt="" /> */}
                        </div>
                        <h1 className="text-3xl font-bold text-primary">Grocery</h1>
                    </div>
                    <p className="text-textSecondary text-sm">Welcome back! Please login to your account.</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="">
                    <div className="my-3">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className={`transition-colors ${formik.touched.email && formik.errors.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`} />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                className={`block w-full pl-10 pr-3 py-3 border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-color placeholder-gray-400 ${formik.touched.email && formik.errors.email
                                    ? 'border-red-500 focus:ring-red-100'
                                    : 'border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-primary'
                                    }`}
                                placeholder="Email"
                            />
                        </div>
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                        ) : null}
                    </div>

                    <div className="my-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700 mb-2">Password</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className={`transition-colors ${formik.touched.password && formik.errors.password ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`} />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className={`block w-full pl-10 pr-3 py-3 border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-color placeholder-gray-400 ${formik.touched.password && formik.errors.password
                                    ? 'border-red-500 focus:ring-red-100'
                                    : 'border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-primary'
                                    }`}
                                placeholder="Password"
                            />
                        </div>
                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                        ) : null}
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
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

