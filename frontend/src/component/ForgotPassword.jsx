import { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, forgotVerifyOtp, resetPassword } from '../redux/slice/auth.slice';
import { Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    // Formik for Step 1: Send OTP
    const emailFormik = useFormik({
        initialValues: { email: '' },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email Address is required'),
        }),
        onSubmit: async (values) => {
            try {
                await dispatch(forgotPassword(values)).unwrap();

                setEmail(values.email);
                setStep(2);
                setTimer(300);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);

            } catch (error) {
                console.error("Forgot Password Error:", error);
            }
        },
    });

    // Formik for Step 3: Reset Password
    const resetFormik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            newPassword: Yup.string().required('New password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                .required('Confirm password is required'),
        }),
        onSubmit: async (values) => {
            try {
                await dispatch(resetPassword({ email, newPassword: values.newPassword, confirmPassword: values.confirmPassword })).unwrap();
                navigate('/login');
            } catch (error) {
                console.error("Reset Password Error:", error);
            }
        },
    });

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (step === 2 && timer === 0) {
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
            await dispatch(forgotVerifyOtp({ email, otp: otpValue })).unwrap();
            setStep(3);
        } catch (error) {
            console.error("OTP Verification Error:", error);
        }
    };

    const handleResendOtp = async () => {
        try {
            await dispatch(forgotPassword({ email })).unwrap();

            setTimer(300);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);

        } catch (error) {
            console.error("Resend OTP Error:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-md bg-white rounded-[4px] shadow-xl p-6 sm:p-8 md:p-10 border border-gray-100 transform transition-all">

                {/* ---------- STEP 1: Request Password Reset ---------- */}
                {step === 1 && (
                    <>
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-2 flex items-center justify-center gap-2">
                                Forgot Password
                            </h2>
                            <p className="text-xs sm:text-sm text-textSecondary px-2">
                                Enter your email below to receive a password reset code.
                            </p>
                        </div>
                        <form onSubmit={emailFormik.handleSubmit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-textPrimary block mb-1.5 sm:mb-2">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    onChange={emailFormik.handleChange}
                                    onBlur={emailFormik.handleBlur}
                                    value={emailFormik.values.email}
                                    className={`block w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${emailFormik.touched.email && emailFormik.errors.email
                                        ? 'border-red-500 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                        }`}
                                    placeholder="Enter your email"
                                />
                                {emailFormik.touched.email && emailFormik.errors.email && (
                                    <p className="mt-1 text-xs text-red-500">{emailFormik.errors.email}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primaryHover text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 px-4 rounded-[4px] transition-all duration-300 shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Send OTP'
                                )}
                            </button>
                        </form>
                        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm font-semibold text-gray-800 px-4">
                            Remember your password?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline transition">
                                Log In
                            </Link>
                        </div>
                    </>
                )}

                {/* ---------- STEP 2: Verify OTP ---------- */}
                {step === 2 && (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-2 px-2">
                                Please Check your Email
                            </h2>
                            <p className="text-xs sm:text-sm text-textSecondary break-all px-2">
                                We sent a reset OTP to {email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp1 + gp2.replace(/./g, '*'))}
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs sm:text-sm font-semibold text-textPrimary block mb-3">
                                OTP <span className="text-red-500">*</span>
                            </label>
                            <div className="flex justify-center gap-1.5 sm:gap-3 md:gap-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        maxLength="1"
                                        className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 border border-gray-300 rounded-[8px] text-center text-base sm:text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-sm transition-all flex-shrink-0"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm font-medium">
                            <span className="text-gray-500">
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="text-primary hover:underline font-semibold touch-manipulation"
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
                            className="w-full bg-primary hover:bg-primaryHover text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 px-4 rounded-[4px] transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 touch-manipulation"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Verify OTP'
                            )}
                        </button>
                    </>
                )}

                {/* ---------- STEP 3: Reset Password ---------- */}
                {step === 3 && (
                    <>
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-2 flex items-center justify-center gap-2">
                                New Password
                            </h2>
                            <p className="text-xs sm:text-sm text-textSecondary px-2">
                                Please create a new password that you don't use on any other site.
                            </p>
                        </div>
                        <form onSubmit={resetFormik.handleSubmit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-textPrimary block mb-1.5 sm:mb-2">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        onChange={resetFormik.handleChange}
                                        onBlur={resetFormik.handleBlur}
                                        value={resetFormik.values.newPassword}
                                        className={`block w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 pr-10 ${resetFormik.touched.newPassword && resetFormik.errors.newPassword
                                            ? 'border-red-500 focus:ring-red-100'
                                            : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                            }`}
                                        placeholder="Your new password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-textSecondary hover:text-textPrimary transition"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <Eye size={18} className="sm:w-5 sm:h-5" /> : <EyeOff size={18} className="sm:w-5 sm:h-5" />}
                                    </button>
                                </div>
                                {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                                    <p className="mt-1 text-xs text-red-500">{resetFormik.errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs sm:text-sm font-medium text-textPrimary block mb-1.5 sm:mb-2">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        onChange={resetFormik.handleChange}
                                        onBlur={resetFormik.handleBlur}
                                        value={resetFormik.values.confirmPassword}
                                        className={`block w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 pr-10 ${resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword
                                            ? 'border-red-500 focus:ring-red-100'
                                            : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                            }`}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-textSecondary hover:text-textPrimary transition"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <Eye size={18} className="sm:w-5 sm:h-5" /> : <EyeOff size={18} className="sm:w-5 sm:h-5" />}
                                    </button>
                                </div>
                                {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">{resetFormik.errors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primaryHover text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 px-4 rounded-[4px] transition-all duration-300 shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;