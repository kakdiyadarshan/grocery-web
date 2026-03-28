import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../redux/slice/address.slice';
import { fetchUserProfile as fetchAuthUserProfile } from '../redux/slice/auth.slice';
import { FiUser, FiSettings, FiLock, FiCheckCircle, FiCamera, FiEye, FiEyeOff, FiChevronRight, FiHome, FiMail, FiPhone, FiList, FiPlus, FiTrash2, FiEdit2, FiMapPin, FiMoreVertical } from 'react-icons/fi';
import { BASE_URL } from '../utils/baseUrl';
import CustomSelect from '../admin/component/CustomSelect';
import MyOrder from './MyOrder';
import { ArrowLeft } from 'lucide-react';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { addresses, loading: addressLoading, submitLoading } = useSelector((state) => state.address);

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' }
    ];
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const fileInputRef = useRef(null);

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const token = localStorage.getItem('token');
    const location = useLocation();

    useEffect(() => {
        fetchUserProfile();
        dispatch(fetchAddresses());
    }, [dispatch]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/getusersById`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const profileSchema = Yup.object().shape({
        firstname: Yup.string().required('First name is required'),
        lastname: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        mobileno: Yup.string().required('Mobile number is required'),
        gender: Yup.string().required('Gender is required'),
    });

    const passwordSchema = Yup.object().shape({
        oldPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string().min(8, 'Must be at least 8 characters').required('New password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Please confirm your new password term'),
    });

    const handleProfileUpdate = async (values, { setSubmitting }) => {
        try {
            const formData = new FormData();
            formData.append('firstname', values.firstname);
            formData.append('lastname', values.lastname);
            formData.append('email', values.email);
            formData.append('mobileno', values.mobileno);
            formData.append('gender', values.gender);

            const response = await axios.put(`${BASE_URL}/update-profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(response.data.data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await axios.put(`${BASE_URL}/update-profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(response.data.data);
            // Refresh redux auth user so the header avatar updates immediately.
            dispatch(fetchAuthUserProfile());
            toast.success("Profile photo updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Photo upload failed");
        }
    };

    const handlePasswordChange = async (values, { resetForm, setSubmitting }) => {
        try {
            const response = await axios.put(`${BASE_URL}/change-password`, values, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Password changed successfully!");
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Password change failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddressSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            if (editingAddress) {
                await dispatch(updateAddress({ addressId: editingAddress._id, addressData: values })).unwrap();
            } else {
                await dispatch(addAddress(values)).unwrap();
            }
            setIsAddressModalOpen(false);
            setEditingAddress(null);
            resetForm();
        } catch (error) {
            // error toast handled by slice
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        dispatch(deleteAddress(id));
    };

    const handleSetDefaultAddress = (id) => {
        dispatch(setDefaultAddress(id));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-b-2"></div>
            </div>
        );
    }

    if (!user) return <div className="text-center py-20">User not found</div>;

    const tabs = [
        { id: 'Overview', icon: FiUser, label: 'Overview' },
        { id: 'Change Password', icon: FiLock, label: 'Change Password' },
        { id: 'Address', icon: FiHome, label: 'Address' },
        { id: 'My Orders', icon: FiList, label: 'My Orders' },
    ];

    return (
        <div className="container pb-12">
            {/* Header / Breadcrumb Area */}
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-textPrimary">My Profile</h1>
                    <nav className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <FiHome size={14} className="text-primary" />
                        <span className="hover:text-primary cursor-pointer transition-colors">Dashboard</span>
                        <FiChevronRight size={12} />
                        <span className="text-gray-500">Profile</span>
                    </nav>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Sidebar Card */}
                    <div className="w-full md:w-[320px] flex-shrink-0">
                        <div className="bg-white rounded-[4px] overflow-hidden p-5 sm:p-8 border border-gray-100">
                            <div className="flex flex-col items-center">
                                {/* Profile Image Container */}
                                <div className="relative group mb-6">
                                    <div className="w-32 h-32 rounded-full border-[3px] border-primary/10 overflow-hidden bg-gray-50">
                                        {user.photo?.url ? (
                                            <img src={user.photo.url} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                                <FiUser size={48} />
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="absolute bottom-1 right-1 p-2.5 bg-white shadow-lg rounded-full text-primary hover:bg-gray-50 transition-all border border-gray-100 animate-in zoom-in duration-200"
                                        >
                                            <FiCamera size={16} />
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                        accept="image/*"
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-textPrimary tracking-tight">{user.firstname ? `${user.firstname} ${user.lastname}` : 'User Profile'}</h2>
                                <p className="text-sm text-gray-400 mt-1 mb-4">{user.email || 'user@example.com'}</p>

                                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-full mb-8">
                                    <FiCheckCircle size={12} />
                                    <span className="text-[10px] font-bold  tracking-widest">Verified</span>
                                </div>

                                {/* Tab Menu */}
                                <div className="w-full space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => { setActiveTab(tab.id); if (tab.id === 'Change Password') setIsEditing(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[4px] transition-all duration-200 text-sm font-bold ${isActive
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                <span>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-grow">
                        <div className="bg-white rounded-[4px] border border-gray-100 p-5 sm:p-8 min-h-[500px]">

                            {/* OVERVIEW / EDIT TAB */}
                            {activeTab === 'Overview' && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-bold text-textPrimary tracking-tight">
                                                {isEditing ? 'Editing Profile' : 'Personal Information'}
                                            </h3>
                                            <p className="text-sm text-gray-400 font-medium">Manage your personal account.</p>
                                        </div>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary/10 text-primary rounded-[4px] font-bold text-[14px] tracking-widest hover:bg-primary/20 transition-all active:scale-95 group"
                                            >
                                                <FiSettings size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="w-full sm:w-auto flex gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 text-gray-500 rounded-[4px] font-bold text-[11px] tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <Formik
                                        initialValues={{
                                            firstname: user.firstname || '',
                                            lastname: user.lastname || '',
                                            email: user.email || '',
                                            mobileno: user.mobileno || '',
                                            gender: user.gender || 'Male',
                                        }}
                                        validationSchema={Yup.object().shape({
                                            firstname: Yup.string().required('First name is required'),
                                            lastname: Yup.string().required('Last name is required'),
                                            email: Yup.string().email('Invalid email').required('Email is required'),
                                            mobileno: Yup.string().required('Mobile number is required'),
                                        })}
                                        onSubmit={handleProfileUpdate}
                                        enableReinitialize
                                    >
                                        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                                            <Form className="space-y-8">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                                    {/* First Name */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-textPrimary block ml-1">First Name</label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                                <FiUser className={`transition-colors ${!isEditing ? 'text-gray-400' : (errors.firstname && touched.firstname ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary')}`} />
                                                            </div>
                                                            <Field
                                                                name="firstname"
                                                                readOnly={!isEditing}
                                                                placeholder="Enter first name"
                                                                className={`block w-full pl-10 pr-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium text-textPrimary ${!isEditing
                                                                    ? 'border-gray-200 cursor-default'
                                                                    : (errors.firstname && touched.firstname
                                                                        ? 'border-red-500 bg-red-50/50 text-red-900'
                                                                        : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'
                                                                    )
                                                                    }`}
                                                            />
                                                        </div>
                                                        {isEditing && errors.firstname && touched.firstname && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.firstname}</div>}
                                                    </div>

                                                    {/* Last Name */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-textPrimary block ml-1">Last Name</label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                                <FiUser className={`transition-colors ${!isEditing ? 'text-gray-400' : (errors.lastname && touched.lastname ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary')}`} />
                                                            </div>
                                                            <Field
                                                                name="lastname"
                                                                readOnly={!isEditing}
                                                                placeholder="Enter last name"
                                                                className={`block w-full pl-10 pr-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium text-textPrimary ${!isEditing
                                                                    ? 'border-gray-200 cursor-default'
                                                                    : (errors.lastname && touched.lastname
                                                                        ? 'border-red-500 bg-red-50/50 text-red-900'
                                                                        : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'
                                                                    )
                                                                    }`}
                                                            />
                                                        </div>
                                                        {isEditing && errors.lastname && touched.lastname && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.lastname}</div>}
                                                    </div>

                                                    {/* Email Address */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-textPrimary block ml-1">Email Address</label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                                <FiMail className={`transition-colors ${!isEditing ? 'text-gray-400' : (errors.email && touched.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary')}`} />
                                                            </div>
                                                            <Field
                                                                name="email"
                                                                readOnly={!isEditing}
                                                                placeholder="Email address"
                                                                className={`block w-full pl-10 pr-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium text-textPrimary ${!isEditing
                                                                    ? 'border-gray-200 cursor-default'
                                                                    : (errors.email && touched.email
                                                                        ? 'border-red-500 bg-red-50/50 text-red-900'
                                                                        : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'
                                                                    )
                                                                    }`}
                                                            />
                                                        </div>
                                                        {isEditing && errors.email && touched.email && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.email}</div>}
                                                    </div>

                                                    {/* Phone Number */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-textPrimary block ml-1">Mobile Number</label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                                <FiPhone className={`transition-colors ${!isEditing ? 'text-gray-400' : (errors.mobileno && touched.mobileno ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary')}`} />
                                                            </div>
                                                            <Field
                                                                name="mobileno"
                                                                readOnly={!isEditing}
                                                                placeholder="Mobile number"
                                                                className={`block w-full pl-10 pr-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium text-textPrimary ${!isEditing
                                                                    ? 'border-gray-200 cursor-default'
                                                                    : (errors.mobileno && touched.mobileno
                                                                        ? 'border-red-500 bg-red-50/50 text-red-900'
                                                                        : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'
                                                                    )
                                                                    }`}
                                                            />
                                                        </div>
                                                        {isEditing && errors.mobileno && touched.mobileno && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.mobileno}</div>}
                                                    </div>

                                                    {/* Gender Selection */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-textPrimary block ml-1">Gender</label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                                <FiUser className={`transition-colors ${!isEditing ? 'text-gray-400' : (errors.gender && touched.gender ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary')}`} />
                                                            </div>
                                                            {!isEditing ? (
                                                                <input
                                                                    value={values.gender}
                                                                    readOnly
                                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-[4px] outline-none text-sm font-medium text-textPrimary cursor-default"
                                                                />
                                                            ) : (
                                                                <CustomSelect
                                                                    options={genderOptions}
                                                                    value={values.gender}
                                                                    onChange={(val) => setFieldValue('gender', val)}
                                                                    searchable={false}
                                                                    placeholder="Select Gender"
                                                                    buttonClassName="pl-10 !bg-gray-50 !border-gray-200 !py-3 focus:!bg-white focus:!border-primary focus:!ring-2 focus:!ring-primary/10"
                                                                />
                                                            )}
                                                            {isEditing && (
                                                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                                                                    <FiChevronRight className="rotate-90" size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isEditing && errors.gender && touched.gender && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.gender}</div>}
                                                    </div>
                                                </div>

                                                {isEditing && (
                                                    <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-center items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 ">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="w-full sm:w-auto px-10 py-3.5 bg-primary text-white rounded-[4px] font-bold text-xs tracking-widest hover:bg-primaryHover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                                                        >
                                                            {isSubmitting ? (
                                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : 'Save'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsEditing(false)}
                                                            className="w-full sm:w-auto px-10 py-3.5 bg-gray-50 text-gray-500 rounded-[4px] font-bold text-xs tracking-widest hover:bg-gray-100 transition-all active:scale-95  border border-gray-200"
                                                        >
                                                            Discard
                                                        </button>
                                                    </div>
                                                )}
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            )}

                            {/* CHANGE PASSWORD TAB */}
                            {activeTab === 'Change Password' && (
                                <div className="animate-in fade-in duration-300">
                                    <h3 className="text-xl font-bold text-textPrimary mb-2 tracking-tight">Security Settings</h3>
                                    <p className="text-sm text-gray-400 mb-8 font-medium">Update your account password to stay secure.</p>

                                    <Formik
                                        initialValues={{
                                            oldPassword: '',
                                            newPassword: '',
                                            confirmPassword: '',
                                        }}
                                        validationSchema={passwordSchema}
                                        onSubmit={handlePasswordChange}
                                    >
                                        {({ isSubmitting, errors, touched }) => (
                                            <Form className="space-y-6 max-w-2xl">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-textPrimary block ml-1">Current Password</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                            <FiLock className={`transition-colors ${errors.oldPassword && touched.oldPassword ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`} />
                                                        </div>
                                                        <Field
                                                            name="oldPassword"
                                                            type={showPasswords.current ? "text" : "password"}
                                                            placeholder="Enter current password"
                                                            className={`block w-full pl-10 pr-12 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 text-textPrimary shadow-sm ${errors.oldPassword && touched.oldPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showPasswords.current ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                                        </button>
                                                    </div>
                                                    {errors.oldPassword && touched.oldPassword && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.oldPassword}</div>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-textPrimary block ml-1">New Password</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                            <FiLock className={`transition-colors ${errors.newPassword && touched.newPassword ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`} />
                                                        </div>
                                                        <Field
                                                            name="newPassword"
                                                            type={showPasswords.new ? "text" : "password"}
                                                            placeholder="Enter new password"
                                                            className={`block w-full pl-10 pr-12 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 text-textPrimary shadow-sm ${errors.newPassword && touched.newPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showPasswords.new ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                                        </button>
                                                    </div>
                                                    {errors.newPassword && touched.newPassword && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.newPassword}</div>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-textPrimary block ml-1">Confirm New Password</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                                            <FiLock className={`transition-colors ${errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`} />
                                                        </div>
                                                        <Field
                                                            name="confirmPassword"
                                                            type={showPasswords.confirm ? "text" : "password"}
                                                            placeholder="Re-enter new password"
                                                            className={`block w-full pl-10 pr-12 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 text-textPrimary shadow-sm ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10'}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showPasswords.confirm ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                                        </button>
                                                    </div>
                                                    {errors.confirmPassword && touched.confirmPassword && <div className="text-red-500 text-[10px] font-bold mt-1 ml-1 ">{errors.confirmPassword}</div>}
                                                </div>

                                                <div className="pt-6 border-t border-gray-50 flex justify-center">
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full sm:w-auto px-10 py-3.5 bg-primary text-white rounded-[4px] font-bold text-xs tracking-widest hover:bg-primaryHover transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : 'Update Password'}
                                                    </button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            )}

                            {/* MY ORDERS TAB */}
                            {activeTab === 'My Orders' && (
                                <div className="animate-in fade-in duration-300">
                                    <MyOrder isEmbedded={true} />
                                </div>
                            )}

                            {/* ADDRESS TAB */}
                            {activeTab === 'Address' && (
                                <div className="animate-in fade-in duration-300">
                                    <Link to="/checkout" className="flex items-center gap-2 text-gray-500 hover:text-[var(--primary)] mb-4 transition-colors">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to CheckOut
                                    </Link>
                                    {/* <Link to="/checkout" className='text-[var(--primary)] text-[12px]' >Back to checkout</Link> */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-bold text-textPrimary tracking-tight">Saved Addresses</h3>
                                            <p className="text-sm text-gray-400 font-medium tracking-tight">Manage your shipping and billing addresses.</p>
                                        </div>
                                        <button
                                            onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-[4px] font-bold text-[14px] tracking-widest hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 active:scale-95 group"
                                        >
                                            <FiPlus size={16} />
                                            Add New Address
                                        </button>
                                    </div>

                                    {addressLoading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-b-2"></div>
                                        </div>
                                    ) : addresses.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-[4px] border border-dashed border-gray-200">
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                                                <FiMapPin size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-textPrimary">No addresses saved</h3>
                                            <p className="text-sm text-gray-500 mt-2 max-w-xs px-4">Add your shipping address to make checkout faster and easier.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr._id}
                                                    className={`relative group p-6 rounded-xl border transition-all duration-300 ${addr.isDefault
                                                        ? 'border-primary bg-primary/[0.02] shadow-sm'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                                        }`}
                                                >
                                                    {addr.isDefault && (
                                                        <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl rounded-tr-[11px] shadow-sm">
                                                            Default
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1 p-2.5 rounded-[4px] ${addr.isDefault ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                                            <FiMapPin size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold text-textPrimary mb-1 truncate pr-8">{addr.address}</h4>
                                                            </div>
                                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                                                {addr.city}, {addr.state} - {addr.zip}<br />
                                                                {addr.country}
                                                            </p>

                                                            <div className="flex flex-wrap gap-4 mt-auto">
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                                    <FiPhone size={12} className="text-primary/60" />
                                                                    {addr.phone}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                                    <FiMail size={12} className="text-primary/60" />
                                                                    {addr.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                                                        {!addr.isDefault ? (
                                                            <button
                                                                onClick={() => handleSetDefaultAddress(addr._id)}
                                                                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                                                            >
                                                                Set as Default
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-[#6b9b3e] uppercase tracking-widest">
                                                                <FiCheckCircle size={10} />
                                                                Active Default
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                                title="Edit Address"
                                                            >
                                                                <FiEdit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr._id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Delete Address"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Address Edit/Add Modal */}
                            {isAddressModalOpen && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)}></div>
                                    <div className="bg-white rounded-[4px] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-textPrimary">
                                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                                            </h3>
                                            <button
                                                onClick={() => setIsAddressModalOpen(false)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                            >
                                                <FiPlus className="rotate-45" size={24} />
                                            </button>
                                        </div>

                                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                            <Formik
                                                initialValues={{
                                                    address: editingAddress?.address || '',
                                                    city: editingAddress?.city || '',
                                                    state: editingAddress?.state || '',
                                                    zip: editingAddress?.zip || '',
                                                    country: editingAddress?.country || 'India',
                                                    phone: editingAddress?.phone || '',
                                                    email: editingAddress?.email || user.email || '',
                                                    isDefault: editingAddress?.isDefault || addresses.length === 0,
                                                }}
                                                validationSchema={Yup.object().shape({
                                                    address: Yup.string().required('Address is required'),
                                                    city: Yup.string().required('City is required'),
                                                    state: Yup.string().required('State is required'),
                                                    zip: Yup.string().required('Zip is required'),
                                                    phone: Yup.string().required('Phone is required'),
                                                    email: Yup.string().email('Invalid email').required('Email is required'),
                                                })}
                                                onSubmit={handleAddressSubmit}
                                            >
                                                {({ isSubmitting, errors, touched }) => (
                                                    <Form className="space-y-6">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div className="md:col-span-2 space-y-2">
                                                                <label className="text-sm font-medium text-textPrimary block mb-2 ml-1">Street Address <span className="text-red-500">*</span></label>
                                                                <Field
                                                                    name="address"
                                                                    placeholder="Suite, building, street, etc."
                                                                    className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${errors.address && touched.address
                                                                        ? 'border-red-500 focus:ring-red-100'
                                                                        : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                                                        }`}
                                                                />
                                                                {errors.address && touched.address && <div className="mt-1 text-xs text-red-500 ml-1">{errors.address}</div>}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-sm font-medium text-textPrimary block mb-2 ml-1">City <span className="text-red-500">*</span></label>
                                                                <Field
                                                                    name="city"
                                                                    placeholder="City"
                                                                    className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${errors.city && touched.city
                                                                        ? 'border-red-500 focus:ring-red-100'
                                                                        : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                                                        }`}
                                                                />
                                                                {errors.city && touched.city && <div className="mt-1 text-xs text-red-500 ml-1">{errors.city}</div>}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-sm font-medium text-textPrimary block mb-2 ml-1">State <span className="text-red-500">*</span></label>
                                                                <Field
                                                                    name="state"
                                                                    placeholder="State"
                                                                    className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${errors.state && touched.state
                                                                        ? 'border-red-500 focus:ring-red-100'
                                                                        : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                                                        }`}
                                                                />
                                                                {errors.state && touched.state && <div className="mt-1 text-xs text-red-500 ml-1">{errors.state}</div>}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-sm font-medium text-textPrimary block mb-2 ml-1">Zip Code <span className="text-red-500">*</span></label>
                                                                <Field
                                                                    name="zip"
                                                                    placeholder="Zip Code"
                                                                    className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${errors.zip && touched.zip
                                                                        ? 'border-red-500 focus:ring-red-100'
                                                                        : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                                                        }`}
                                                                />
                                                                {errors.zip && touched.zip && <div className="mt-1 text-xs text-red-500 ml-1">{errors.zip}</div>}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-sm font-medium text-textPrimary block mb-2 ml-1">Country <span className="text-red-500">*</span></label>
                                                                <Field
                                                                    name="country"
                                                                    placeholder="Country"
                                                                    className="block w-full px-3 py-3 border border-gray-200 rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 focus:ring-2 focus:ring-green-100 focus:border-primary"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-sm font-medium text-textPrimary block mb-2 ml-1">Phone Number <span className="text-red-500">*</span></label>
                                                                <Field
                                                                    name="phone"
                                                                    placeholder="Phone Number"
                                                                    className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${errors.phone && touched.phone
                                                                        ? 'border-red-500 focus:ring-red-100'
                                                                        : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                                                        }`}
                                                                />
                                                                {errors.phone && touched.phone && <div className="mt-1 text-xs text-red-500 ml-1">{errors.phone}</div>}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-sm font-medium text-textPrimary block mb-2 ml-1">Email Address <span className="text-red-500">*</span></label>
                                                                <Field
                                                                    name="email"
                                                                    placeholder="Email for this address"
                                                                    className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-textPrimary placeholder-gray-400 ${errors.email && touched.email
                                                                        ? 'border-red-500 focus:ring-red-100'
                                                                        : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-primary'
                                                                        }`}
                                                                />
                                                                {errors.email && touched.email && <div className="mt-1 text-xs text-red-500 ml-1">{errors.email}</div>}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 pt-2">
                                                            <Field
                                                                type="checkbox"
                                                                name="isDefault"
                                                                id="isDefault"
                                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                            />
                                                            <label htmlFor="isDefault" className="text-sm font-medium text-gray-600 cursor-pointer">Set as default shipping address</label>
                                                        </div>

                                                        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center">
                                                            <button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                className="bg-primary hover:bg-primaryHover text-white font-medium py-3 px-4 rounded-[4px] transition-all duration-300 shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                            >
                                                                {isSubmitting ? (
                                                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                ) : editingAddress ? 'Update Address' : 'Save Address'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsAddressModalOpen(false)}
                                                                className="px-8 py-3 border border-gray-200 text-gray-500 rounded-[4px] font-medium text-sm hover:bg-gray-50 transition-all active:scale-95"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </Form>
                                                )}
                                            </Formik>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

