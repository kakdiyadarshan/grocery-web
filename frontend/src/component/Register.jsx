import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, verifyOtp, resendOtp } from '../redux/slice/auth.slice';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            firstname: Yup.string().required('First Name is required'),
            lastname: Yup.string().required('Last Name is required'),
            email: Yup.string()
                .email('Invalid email address')
                .required('Email Address is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: async (values) => {
            try {
                await dispatch(registerUser(values)).unwrap();

                setEmail(values.email);
                setStep(2);
                setTimer(300);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);

            } catch (error) {
                console.error("Registration Error:", error);
            }
        }
    });

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return;

        try {
            await dispatch(verifyOtp({ email, otp: otpValue })).unwrap();
            navigate('/login');
        } catch (error) {
            console.error("OTP Verification Error:", error);
        }
    };

    const handleResendOtp = async () => {
        try {
            await dispatch(resendOtp({ email })).unwrap();

            setTimer(300);
            setCanResend(false);
        } catch (error) {
            console.error("Resend OTP Error:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-[4px] shadow-lg p-8 sm:p-10 border border-gray-100">
                {step === 1 ? (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-textPrimary mb-2 flex items-center justify-center gap-2">
                                Join Grocery
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">
                                Create your account and start shopping today.
                            </p>
                        </div>
                        <form onSubmit={formik.handleSubmit} className="space-y-5">
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="text-sm font-medium text-textPrimary block mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstname"
                                        type="text"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.firstname}
                                        className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${formik.touched.firstname && formik.errors.firstname
                                            ? 'border-red-500 focus:ring-red-100'
                                            : 'border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-primary'
                                            }`}
                                        placeholder="First name"
                                    />
                                    {formik.touched.firstname && formik.errors.firstname && (
                                        <p className="mt-1 text-xs text-red-500">{formik.errors.firstname}</p>
                                    )}
                                </div>

                                <div className="w-1/2">
                                    <label className="text-sm font-medium text-textPrimary block mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastname"
                                        type="text"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.lastname}
                                        className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${formik.touched.lastname && formik.errors.lastname
                                            ? 'border-red-500 focus:ring-red-100'
                                            : 'border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-primary'
                                            }`}
                                        placeholder="Last name"
                                    />
                                    {formik.touched.lastname && formik.errors.lastname && (
                                        <p className="mt-1 text-xs text-red-500">{formik.errors.lastname}</p>
                                    )}
                                </div>
                            </div>
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
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition"
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
                                    'Create Account'
                                )}
                            </button>
                        </form>
                        <div className="mt-8 text-center text-sm font-semibold text-gray-800">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-800 hover:underline transition"
                            >
                                Log In
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-textPrimary mb-2">
                                Please Check your Email
                            </h2>
                            <p className="text-sm text-textSecondary">
                                We sent the OTP to {email.replace(/(.{2})(.*)(?=@)/,
                                    (gp1, gp2, gp3) => {
                                        return gp2 + gp3.replace(/./g, '*')
                                    }
                                )}
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-textPrimary block mb-3">
                                OTP <span className="text-red-500">*</span>
                            </label>
                            <div className="flex justify-start gap-2 sm:gap-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        maxLength="1"
                                        className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-[8px] text-center text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-sm transition-all"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 mb-6 flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-500">
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="text-primary hover:underline font-semibold"
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    <span className="text-gray-500">
                                        Send OTP again: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                                    </span>
                                )}
                            </span>
                        </div>

                        <button
                            type="button"
                            disabled={loading || otp.join('').length !== 6}
                            onClick={handleVerifyOtp}
                            className="w-full bg-primary hover:bg-75primaryHover text-white font-semibold py-3 px-4 rounded-[6px] transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Verification'
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;