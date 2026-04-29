import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiCamera, FiBriefcase } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile, changePassword, updateBusinessProfile } from '../../redux/slice/auth.slice';
import { setAlert } from '../../redux/slice/alert.slice';
import { IMAGE_URL } from '../../utils/baseUrl';
import CustomSelect from '../../admin/component/CustomSelect';
import Breadcrumb from '../../admin/component/Breadcrumb';

const Profile = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('overview');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileData, setProfileData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobileno: '',
        gender: ''
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [businessData, setBusinessData] = useState({
        brandDetails: {
            storeName: '',
            ownerName: '',
            storeDescription: ''
        },
        pickupAddress: {
            flatHouse: '',
            street: '',
            landmark: '',
            pincode: '',
            city: '',
            state: ''
        }
    });

    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            setProfileData({
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                email: user.email || '',
                mobileno: user.mobileno || '',
                gender: user.gender || ''
            });
            if (user.photo && user.photo.url) {
                setPreviewImage(user.photo.url);
            }
            if (user.role === 'seller') {
                setBusinessData({
                    brandDetails: {
                        storeName: user.brandDetails?.storeName || '',
                        ownerName: user.brandDetails?.ownerName || '',
                        storeDescription: user.brandDetails?.storeDescription || ''
                    },
                    pickupAddress: {
                        flatHouse: user.pickupAddress?.flatHouse || '',
                        street: user.pickupAddress?.street || '',
                        landmark: user.pickupAddress?.landmark || '',
                        pincode: user.pickupAddress?.pincode || '',
                        city: user.pickupAddress?.city || '',
                        state: user.pickupAddress?.state || ''
                    }
                });
            }
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('firstname', profileData.firstname);
        formData.append('lastname', profileData.lastname);
        formData.append('mobileno', profileData.mobileno);
        formData.append('gender', profileData.gender);
        if (profileImage) {
            formData.append('photo', profileImage);
        }

        await dispatch(updateUserProfile(formData));
        await dispatch(fetchUserProfile());
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const { oldPassword, newPassword, confirmPassword } = passwordData;
        const trimmedNewPassword = newPassword.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (trimmedNewPassword !== trimmedConfirmPassword) {
            dispatch(setAlert({ text: 'New passwords do not match', type: 'error' }));
            return;
        }

        if (trimmedNewPassword.length < 8) {
            dispatch(setAlert({ text: 'Password must be at least 8 characters long', type: 'error' }));
            return;
        }

        const result = await dispatch(changePassword({
            oldPassword: oldPassword.trim(),
            newPassword: trimmedNewPassword,
            confirmPassword: trimmedConfirmPassword
        }));

        if (changePassword.fulfilled.match(result)) {
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    };

    const handleBusinessChange = (section, e) => {
        const { name, value } = e.target;
        setBusinessData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value
            }
        }));
    };

    const handleBusinessSubmit = async (e) => {
        e.preventDefault();
        await dispatch(updateBusinessProfile({
            brandDetails: businessData.brandDetails,
            pickupAddress: businessData.pickupAddress
        }));
        await dispatch(fetchUserProfile());
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiUser },
        { id: 'edit-profile', label: 'Edit Profile', icon: FiUser },
        ...(user?.role === 'seller' ? [{ id: 'business-details', label: 'Business Profile', icon: FiBriefcase }] : []),
        { id: 'change-password', label: 'Change Password', icon: FiLock }
    ];

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">My Profile</h2>
                    <Breadcrumb />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-lg shadow-custom p-4 sm:p-6 lg:sticky lg:top-24">
                        <div className="mt-2 lg:mt-6 mb-6">
                            <div className="text-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-primary to-primaryLight p-1">
                                    <div className="w-full h-full rounded-full bg-white overflow-hidden shadow-inner flex items-center justify-center">
                                        {user?.photo ? (
                                            <img src={`${IMAGE_URL}/${user?.photo?.public_id}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <FiUser className="text-primary" size={40} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-bold text-textPrimary text-lg px-1 overflow-wrap-break-word break-words">
                                    {user?.firstname} {user?.lastname}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 px-1 break-all">
                                    {user?.email}
                                </p>
                                <div className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                                    <FiCheckCircle size={14} className="flex-shrink-0" />
                                    {user?.isVerified ? 'Verified' : 'Not Verified'}
                                </div>
                            </div>
                        </div>
                        <nav className="flex flex-row lg:flex-col justify-start md:justify-center  gap-2 lg:gap-0 overflow-x-auto pb-3 lg:pb-0 lg:space-y-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 snap-center ${activeTab === tab.id
                                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary border lg:border-transparent border-gray-200'
                                            }`}
                                    >
                                        <Icon size={18} className="flex-shrink-0" />
                                        <span className="font-medium text-sm lg:whitespace-normal whitespace-nowrap text-left">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-8 xl:col-span-9">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="bg-white rounded-lg shadow-custom p-5 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-6">Account Overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">First Name</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-[4px] text-textPrimary font-medium">
                                        {user?.firstname || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-[4px] text-textPrimary font-medium">
                                        {user?.lastname || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-[4px] text-textPrimary font-medium">
                                        {user?.email || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-[4px] text-textPrimary font-medium">
                                        {user?.mobileno || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Gender</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-[4px] text-textPrimary font-medium">
                                        {user?.gender || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Account Type</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-[4px] text-textPrimary font-medium capitalize">
                                        {user?.role || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                                    <div className="flex items-center gap-2">
                                        <div className={`px-4 py-3 rounded-[4px] font-medium flex items-center gap-2 ${user?.isVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                            }`}>
                                            <FiCheckCircle size={18} />
                                            {user?.isVerified ? 'Verified' : 'Pending Verification'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-[4px] text-textPrimary font-medium">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Profile Tab */}
                    {activeTab === 'edit-profile' && (
                        <div className="bg-white rounded-lg shadow-custom p-5 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-6">Edit Profile</h2>

                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="flex flex-col items-center justify-center mb-8">
                                    <div className="relative group">
                                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-primary to-primaryLight p-1 shadow-md transition-transform group-hover:scale-105">
                                            <div className="w-full h-full rounded-full bg-white overflow-hidden shadow-inner flex items-center justify-center bg-gray-50">
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser className="text-gray-400" size={50} />
                                                )}
                                            </div>
                                        </div>
                                        <label className="absolute bottom-1 right-1 p-2 sm:p-2.5 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-primaryHover transition-all hover:scale-110 border-2 sm:border-4 border-white" title="Upload New Photo">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <FiCamera size={16} />
                                        </label>
                                    </div>
                                    <p className="mt-4 text-xs sm:text-sm text-gray-500 font-medium">Allowed JPG, GIF or PNG. Max size of 2MB.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            name="firstname"
                                            value={profileData.firstname}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            value={profileData.lastname}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-gray-50"
                                            placeholder="Enter email address"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="mobileno"
                                            value={profileData.mobileno}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Gender</label>
                                        <CustomSelect
                                            searchable={false}
                                            label=""
                                            options={[
                                                { value: 'Male', label: 'Male' },
                                                { value: 'Female', label: 'Female' },
                                                { value: 'Other', label: 'Other' }
                                            ]}
                                            value={profileData.gender || ''}
                                            onChange={(value) => {
                                                setProfileData(prev => ({
                                                    ...prev,
                                                    gender: value
                                                }));
                                            }}
                                            placeholder="Select Gender"
                                            required={false}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3.5 bg-primary text-white rounded-[4px] font-medium hover:bg-primaryHover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                                    >
                                        {loading ? 'Updating...' : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Business Details Tab */}
                    {activeTab === 'business-details' && user?.role === 'seller' && (
                        <div className="bg-white rounded-lg shadow-custom p-5 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-6">Business Profile</h2>

                            <form onSubmit={handleBusinessSubmit} className="space-y-8">
                                
                                {/* Brand Details Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Brand Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Store Name</label>
                                            <input
                                                type="text"
                                                name="storeName"
                                                value={businessData.brandDetails.storeName}
                                                onChange={(e) => handleBusinessChange('brandDetails', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter store name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Owner Name</label>
                                            <input
                                                type="text"
                                                name="ownerName"
                                                value={businessData.brandDetails.ownerName}
                                                onChange={(e) => handleBusinessChange('brandDetails', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter owner name"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Store Description</label>
                                            <textarea
                                                name="storeDescription"
                                                value={businessData.brandDetails.storeDescription}
                                                onChange={(e) => handleBusinessChange('brandDetails', e)}
                                                rows="3"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                                                placeholder="Enter store description"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Address Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Pickup Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Flat / House / Building</label>
                                            <input
                                                type="text"
                                                name="flatHouse"
                                                value={businessData.pickupAddress.flatHouse}
                                                onChange={(e) => handleBusinessChange('pickupAddress', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter flat / house / building"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Street / Area</label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={businessData.pickupAddress.street}
                                                onChange={(e) => handleBusinessChange('pickupAddress', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter street / area"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Landmark</label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={businessData.pickupAddress.landmark}
                                                onChange={(e) => handleBusinessChange('pickupAddress', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter landmark"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Pincode</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={businessData.pickupAddress.pincode}
                                                onChange={(e) => handleBusinessChange('pickupAddress', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter pincode"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={businessData.pickupAddress.city}
                                                onChange={(e) => handleBusinessChange('pickupAddress', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter city"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={businessData.pickupAddress.state}
                                                onChange={(e) => handleBusinessChange('pickupAddress', e)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Enter state"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3.5 bg-primary text-white rounded-[4px] font-medium hover:bg-primaryHover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                                    >
                                        {loading ? 'Updating...' : 'Update Business Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Change Password Tab */}
                    {activeTab === 'change-password' && (
                        <div className="bg-white rounded-lg shadow-custom p-5 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-2">Change Password</h2>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Current Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                                        >
                                            {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">New Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                                        >
                                            {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Confirm New Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="Re-enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3.5 bg-primary text-white rounded-[4px] font-medium hover:bg-primaryHover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                                    >
                                        {loading ? 'Changing Password...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Profile;