import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import {
    verifyGst, sendOnboardingOtp, verifyOnboardingOtp,
    updateBrandDetails, updateBankDetails, updatePickupAddress,
    submitAgreement
} from '../redux/slice/seller.slice';
import { fetchUserProfile } from '../redux/slice/auth.slice';
import {
    Check, ChevronRight, Upload, Building2, Smartphone,
    User, CreditCard, MapPin, FileText, AlertCircle, Loader2,
    Store, Info, Lock, ShieldCheck, ArrowRight, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import CustomStepper from '../component/CustomStepper';
import { motion, AnimatePresence } from 'framer-motion';

const BecomeSeller = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: userLoading } = useSelector((state) => state.auth);
    const { loading: sellerLoading, error } = useSelector((state) => state.seller);
    const loading = sellerLoading || userLoading;

    // Form States
    const [activeStep, setActiveStep] = useState(1);
    const [gstin, setGstin] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);

    const [brandDetails, setBrandDetails] = useState({
        storeName: '',
        ownerName: '',
        storeDescription: ''
    });

    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: ''
    });

    const [pickupAddress, setPickupAddress] = useState({
        flatHouse: '',
        street: '',
        landmark: '',
        pincode: '',
        city: '',
        state: ''
    });

    const [isAccepted, setIsAccepted] = useState(false);

    // Initial Load
    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    // Timer logic for OTP
    useEffect(() => {
        let interval;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    // Sync active step
    useEffect(() => {
        if (user) {
            let step = user.onboardingStep || 1;
            if (user.isOnboardingCompleted) {
                step = 7;
            }
            setActiveStep(step);
        }
    }, [user]);

    const steps = [
        { id: 1, title: 'GST Verification', icon: Building2 },
        { id: 2, title: 'Phone Verification', icon: Smartphone },
        { id: 3, title: 'Brand Details', icon: User },
        { id: 4, title: 'Bank Details', icon: CreditCard },
        { id: 5, title: 'Pickup Address', icon: MapPin },
        { id: 6, title: 'Agreement', icon: FileText },
    ];

    const gstValidationSchema = Yup.object().shape({
        gstNumber: Yup.string()
            .required("GST Number is required")
            .matches(
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                "Invalid GST Number"
            ),
        businessName: Yup.string().required("Business Name is required"),
        panNumber: Yup.string()
            .required("PAN Number is required")
            .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN Number"),
        businessType: Yup.string().required("Business Type is required"),
        businessAddress: Yup.string().required("Business Address is required"),
    });

    const handleGstVerify = async (values, { setSubmitting }) => {
        try {
            const payload = {
                userId: user?._id,
                gstin: values.gstNumber,
                businessName: values.businessName,
                panNumber: values.panNumber,
                businessType: values.businessType,
                businessAddress: values.businessAddress
            };
            const result = await dispatch(verifyGst(payload)).unwrap();
            dispatch(fetchUserProfile());
        } catch (err) {
            toast.error(err || 'GST Verification failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendOtp = async () => {
        try {
            const result = await dispatch(sendOnboardingOtp({ userId: user?._id })).unwrap();
            setOtpSent(true);
            setTimer(300);
            setCanResend(false);
        } catch (err) {
            toast.error(err || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error('Please enter OTP');
        try {
            const result = await dispatch(verifyOnboardingOtp({ userId: user?._id, otp })).unwrap();
            dispatch(fetchUserProfile());
        } catch (err) {
            toast.error(err || 'OTP Verification failed');
        }
    };

    const handleBrandSubmit = async (e) => {
        e.preventDefault();
        const { storeName, ownerName, storeDescription } = brandDetails;
        if (!storeName || !ownerName || !storeDescription) return toast.error('All fields are required');
        try {
            const result = await dispatch(updateBrandDetails({ userId: user?._id, ...brandDetails })).unwrap();
            dispatch(fetchUserProfile());
        } catch (err) {
            toast.error(err || 'Failed to update brand details');
        }
    };

    const handleBankSubmit = async (e) => {
        e.preventDefault();
        const { accountHolderName, accountNumber, ifscCode } = bankDetails;
        if (!accountHolderName || !accountNumber || !ifscCode) return toast.error('All fields are required');
        try {
            const result = await dispatch(updateBankDetails({ userId: user?._id, ...bankDetails })).unwrap();
            dispatch(fetchUserProfile());
        } catch (err) {
            toast.error(err || 'Failed to update bank details');
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(pickupAddress).some(val => !val)) return toast.error('All fields are required');
        try {
            const result = await dispatch(updatePickupAddress({ userId: user?._id, ...pickupAddress })).unwrap();
            dispatch(fetchUserProfile());
        } catch (err) {
            toast.error(err || 'Failed to update address');
        }
    };

    const handleSubmitAgreement = async (e) => {
        e.preventDefault();
        if (!isAccepted) return toast.error('Please accept the agreement');
        try {
            const result = await dispatch(submitAgreement({ userId: user?._id, isAccepted })).unwrap();
            dispatch(fetchUserProfile());
        } catch (err) {
            toast.error(err || 'Submission failed');
        }
    };

    const inputClasses = "block w-full px-4 py-3 border border-gray-200 rounded-[4px] outline-none transition-all bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 focus:border-primary disabled:bg-gray-100 disabled:text-gray-500";
    const labelClasses = "text-sm font-medium text-textPrimary block mb-2";
    const buttonClasses = "px-6 py-3 rounded-[4px] font-medium text-sm bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primaryHover transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed";

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">GST Verification</h2>
                        </div>
                        <Formik
                            initialValues={{
                                gstNumber: gstin || '',
                                businessName: '',
                                panNumber: '',
                                businessType: '',
                                businessAddress: ''
                            }}
                            validationSchema={gstValidationSchema}
                            onSubmit={handleGstVerify}
                        >
                            {({ isSubmitting, touched, errors }) => (
                                <Form className="grid grid-cols-1 md:grid-cols-2 gap-5 p-3">
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>GST Identification Number (GSTIN)</label>
                                        <Field
                                            type="text"
                                            name="gstNumber"
                                            className={`${inputClasses} uppercase tracking-wider ${touched.gstNumber && errors.gstNumber ? 'border-red-400 focus:ring-red-100' : ''}`}
                                            placeholder="e.g. 22AAAAA0000A1Z5"
                                        />
                                        <ErrorMessage name="gstNumber" component="div" className="text-red-500 text-[10px] font-bold mt-1" />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Legal Business Name</label>
                                        <Field
                                            type="text"
                                            name="businessName"
                                            className={`${inputClasses} ${touched.businessName && errors.businessName ? 'border-red-400 focus:ring-red-100' : ''}`}
                                            placeholder="As per GST registry"
                                        />
                                        <ErrorMessage name="businessName" component="div" className="text-red-500 text-[10px] font-bold mt-1" />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>PAN Card Number</label>
                                        <Field
                                            type="text"
                                            name="panNumber"
                                            className={`${inputClasses} uppercase tracking-widest ${touched.panNumber && errors.panNumber ? 'border-red-400 focus:ring-red-100' : ''}`}
                                            placeholder="ABCDE1234F"
                                        />
                                        <ErrorMessage name="panNumber" component="div" className="text-red-500 text-[10px] font-bold mt-1" />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Business Category</label>
                                        <Field
                                            as="select"
                                            name="businessType"
                                            className={`${inputClasses} cursor-pointer ${touched.businessType && errors.businessType ? 'border-red-400 focus:ring-red-100' : ''}`}
                                        >
                                            <option value="">Choose your type</option>
                                            <option value="proprietorship">Individual / Proprietorship</option>
                                            <option value="partnership">Partnership Firm</option>
                                            <option value="llp">LLP (Limited Liability Partnership)</option>
                                            <option value="pvtLtd">Private Limited Company</option>
                                        </Field>
                                        <ErrorMessage name="businessType" component="div" className="text-red-500 text-[10px] font-bold mt-1" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Registered Office Address</label>
                                        <Field
                                            as="textarea"
                                            name="businessAddress"
                                            rows="3"
                                            className={`${inputClasses} resize-none ${touched.businessAddress && errors.businessAddress ? 'border-red-400 focus:ring-red-100' : ''}`}
                                            placeholder="Enter complete office address..."
                                        />
                                        <ErrorMessage name="businessAddress" component="div" className="text-red-500 text-[10px] font-bold mt-1" />
                                    </div>

                                    <div className="md:col-span-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || loading}
                                            className={`${buttonClasses} w-full py-4 text-base`}
                                        >
                                            {(isSubmitting || loading) ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                            Verify & Next
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center py-4">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-[4px] flex items-center justify-center mx-auto mb-5">
                            <Smartphone size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Mobile Number</h2>
                        <p className="text-gray-500 text-sm mb-8">
                            A verification code will be sent to <span className="text-gray-900 font-bold">{user?.mobileno}</span>
                        </p>

                        {!otpSent ? (
                            <button
                                onClick={handleSendOtp}
                                disabled={loading}
                                className={`${buttonClasses} w-full py-4`}
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                Send Verification OTP
                            </button>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div className="space-y-2">
                                    <label className={labelClasses}>Enter 6-digit Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="000000"
                                        className={`${inputClasses} text-center text-2xl tracking-[0.5em] font-bold`}
                                        maxLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`${buttonClasses} w-full py-4 text-base`}
                                >
                                    {loading && <Loader2 className="animate-spin" size={20} />}
                                    Verify Code
                                </button>
                                
                                <div className="flex justify-between items-center text-xs mt-4 font-medium px-1">
                                    <span className="text-gray-500">Didn't receive it?</span>
                                    {canResend ? (
                                        <button 
                                            type="button" 
                                            onClick={handleSendOtp} 
                                            className="text-primary font-bold hover:underline"
                                            disabled={loading}
                                        >
                                            Resend Now
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 font-bold">
                                            Resend in {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                                        </span>
                                    )}
                                </div>
                            </form>
                        )}
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                                <Store size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Store Branding</h2>
                        </div>
                        <form onSubmit={handleBrandSubmit} className="space-y-5 p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Display Store Name</label>
                                    <input
                                        type="text"
                                        value={brandDetails.storeName}
                                        onChange={(e) => setBrandDetails({ ...brandDetails, storeName: e.target.value })}
                                        className={inputClasses}
                                        placeholder="e.g. Fresh Daily Market"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Owner Full Name</label>
                                    <input
                                        type="text"
                                        value={brandDetails.ownerName}
                                        onChange={(e) => setBrandDetails({ ...brandDetails, ownerName: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Legal owner name"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Brand Description</label>
                                    <textarea
                                        value={brandDetails.storeDescription}
                                        onChange={(e) => setBrandDetails({ ...brandDetails, storeDescription: e.target.value })}
                                        className={`${inputClasses} resize-none`}
                                        rows={4}
                                        placeholder="Briefly describe your products and specialty..."
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${buttonClasses} w-full py-4 mt-4`}
                            >
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                Save & Continue
                            </button>
                        </form>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                                <CreditCard size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Bank Settlement Account</h2>
                        </div>
                        <form onSubmit={handleBankSubmit} className="space-y-5 p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Account Holder Legal Name</label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountHolderName}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                                        className={inputClasses}
                                        placeholder="As per bank records"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Bank Account Number</label>
                                    <input
                                        type="password"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                        className={`${inputClasses} tracking-widest`}
                                        placeholder="Enter account number"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Bank IFSC Code</label>
                                    <input
                                        type="text"
                                        value={bankDetails.ifscCode}
                                        onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                                        className={`${inputClasses} uppercase tracking-wider`}
                                        placeholder="e.g. SBIN0001234"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${buttonClasses} w-full py-4 mt-4`}
                            >
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                Save Bank Details
                            </button>
                        </form>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                                <MapPin size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Pickup & Logistics Address</h2>
                        </div>
                        <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 p-3">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Building / Flat / House No</label>
                                <input
                                    type="text"
                                    value={pickupAddress.flatHouse}
                                    onChange={(e) => setPickupAddress({ ...pickupAddress, flatHouse: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Complete door details"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Street / Locality / Sector</label>
                                <input
                                    type="text"
                                    value={pickupAddress.street}
                                    onChange={(e) => setPickupAddress({ ...pickupAddress, street: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Enter street name"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Pincode</label>
                                <input
                                    type="text"
                                    value={pickupAddress.pincode}
                                    onChange={(e) => setPickupAddress({ ...pickupAddress, pincode: e.target.value })}
                                    className={`${inputClasses} font-bold`}
                                    maxLength={6}
                                    placeholder="654321"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Nearby Landmark</label>
                                <input
                                    type="text"
                                    value={pickupAddress.landmark}
                                    onChange={(e) => setPickupAddress({ ...pickupAddress, landmark: e.target.value })}
                                    className={inputClasses}
                                    placeholder="e.g. Opp Royal Mall"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Town / City</label>
                                <input
                                    type="text"
                                    value={pickupAddress.city}
                                    onChange={(e) => setPickupAddress({ ...pickupAddress, city: e.target.value })}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>State / Province</label>
                                <input
                                    type="text"
                                    value={pickupAddress.state}
                                    onChange={(e) => setPickupAddress({ ...pickupAddress, state: e.target.value })}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`${buttonClasses} w-full py-4`}
                                >
                                    {loading && <Loader2 className="animate-spin" size={20} />}
                                    Verify Address & Proced
                                </button>
                            </div>
                        </form>
                    </motion.div>
                );
            case 6:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Review Policies</h2>
                        </div>
                        <div className="bg-gray-50 rounded-[4px] border border-gray-200 p-3 max-h-[300px] overflow-y-auto no-scrollbar prose prose-primary prose-sm">
                            <p className="font-bold text-gray-800 mb-2 underline tracking-tight">Standard Terms of Service:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 font-medium leading-relaxed">
                                <li><strong>Listing Policy:</strong> All products must be authentic and accurately described.</li>
                                <li><strong>Shipping:</strong> Orders must be handled as per logistics guidelines.</li>
                                <li><strong>Service Fees:</strong> Commissions are automatically deducted from settlements.</li>
                                <li><strong>Purity Guarantee:</strong> Sellers agree to supply organic produce as certified.</li>
                            </ul>
                        </div>

                        <label className="flex items-center gap-3 p-4 bg-primary/5 rounded-[4px] cursor-pointer group hover:bg-primary/10 transition-colors">
                            <input
                                type="checkbox"
                                checked={isAccepted}
                                onChange={(e) => setIsAccepted(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                            />
                            <span className="text-sm font-semibold text-gray-700 leading-snug">
                                I confirm all details are correct and I accept Grocery's <span className="text-primary underline decoration-primary/30 underline-offset-4">Merchant Service Agreement</span>.
                            </span>
                        </label>

                        <button
                            onClick={handleSubmitAgreement}
                            disabled={!isAccepted || loading}
                            className={`${buttonClasses} w-full text-base`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={22} /> : <Check size={22} strokeWidth={3} />}
                            Submit Registration
                        </button>
                    </motion.div>
                );
            case 7:
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center px-3 py-4">
                        <div className="relative inline-block mb-10">
                            <div className="w-24 h-24 bg-primary/20 text-primary rounded-[4px] flex items-center justify-center shadow-lg shadow-primary/20 relative z-10">
                                <Check size={48} strokeWidth={3} />
                            </div>
                            <div className="absolute -inset-3 bg-primary/10 rounded-[4px] animate-pulse -z-0"></div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Registration Successful!</h2>
                        <p className="text-gray-500 font-medium px-4 mb-10 leading-relaxed">
                            Your application is being reviewed. Our onboarding team will contact you within <span className="text-gray-900 font-bold">24-48 business hours</span>.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-900 text-white py-4 rounded-[4px] font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-md"
                        >
                            Back to Dashboard
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Validating...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] pb-10">
            <div className="container mx-auto px-4 pt-10">
                <div className="max-w-6xl mx-auto">

                    {/* Unified Dashboard Container */}
                    <div className="bg-white rounded-[4px] shadow-lg border border-gray-100 overflow-hidden">
                        {/* 2. Focused Stepper Area */}
                        <div className="pt-5  bg-gray-50/50 border-b border-gray-100">
                            <CustomStepper steps={steps} activeStep={activeStep} />
                        </div>

                        {/* 3. Main Content Area */}
                        <div className="">
                            <div className="max-w-3xl mx-auto my-5">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {renderStepContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomeSeller;