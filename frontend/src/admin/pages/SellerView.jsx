import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSellers, approveRejectSeller } from '../../redux/slice/seller.slice';
import { getAllProducts } from '../../redux/slice/product.slice';
import { Package, Building2, CreditCard, User, AlertCircle, X, Store, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../component/Breadcrumb';
import DataTable from '../component/DataTable';
import AdminLoader from '../component/AdminLoader';
import { FiShoppingCart } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const SellerView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sellers, loading } = useSelector((state) => state.seller);
    const { allProducts, loading: productLoading } = useSelector((state) => state.product);

    const [activeTab, setActiveTab] = useState('profile');
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        if (!sellers || sellers.length === 0) {
            dispatch(fetchAllSellers());
        }
    }, [dispatch, sellers]);

    useEffect(() => {
        if (id) {
            dispatch(getAllProducts({ seller: id, paginate: false }));
        }
    }, [dispatch, id]);

    const viewSeller = sellers?.find((s) => s._id === id);

    const handleApprove = () => {
        if (!viewSeller) return;
        dispatch(approveRejectSeller({ userId: viewSeller._id, status: 'approved' }));
    };

    const handleReject = () => {
        if (!viewSeller) return;
        if (!rejectionReason) return alert("Please enter a rejection reason");
        dispatch(approveRejectSeller({ userId: viewSeller._id, status: 'rejected', rejectionReason }));
        setShowRejectInput(false);
    };

    const renderStars = (reviews) => {
        if (!reviews || reviews.length === 0) {
            return (
                <div className="flex items-center gap-1.5 opacity-40">
                    <div className="flex text-gray-300">
                        {[...Array(5)].map((_, i) => <FaStar key={i} size={12} />)}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">(0)</span>
                </div>
            );
        }

        const avgRating = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / reviews.length;
        const roundedRating = Math.round(avgRating * 2) / 2;

        return (
            <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        if (starValue <= roundedRating) return <FaStar key={i} size={12} />;
                        if (starValue - 0.5 === roundedRating) return <FaStarHalfAlt key={i} size={12} />;
                        return <FaStar key={i} size={12} className="text-gray-200" />;
                    })}
                </div>
                <span className="text-[10px] font-bold text-gray-500">
                    {avgRating.toFixed(1)} <span className="text-gray-400">({reviews.length})</span>
                </span>
            </div>
        );
    };

    const productColumns = [
        {
            header: 'Image',
            accessor: 'images',
            exportValue: (row) => `${row.images[0]?.url}`,
            render: (row) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                    <img
                        src={row.images[0]?.url || 'https://via.placeholder.com/50'}
                        alt={row.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        },
        { header: 'Product', accessor: 'name', sortable: true },
        {
            header: 'SKU',
            accessor: 'sku',
            render: (row) => <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase">{row.sku || '-'}</span>,
            sortable: true
        },
        { header: 'Category', accessor: 'category.categoryName', exportValue: (row) => `${row.category?.categoryName}` || '-', render: (row) => row.category?.categoryName || '-', searchKey: (row) => `${row.category?.categoryName}`.trim() },
        {
            header: 'Price Range',
            accessor: 'weighstWise',
            searchKey: (row) => `${row.weighstWise.map(w => w.price)}`.trim(),
            exportValue: (row) => {
                const variantPrices = row.weighstWise.map(v => `${v.weight}${v.unit}: $${v.price}`).join(', ');
                const prices = row.weighstWise.map(w => w.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const range = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
                return `${range} (${variantPrices})`;
            },
            render: (row) => {
                const prices = row.weighstWise.map(w => w.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
            }
        },
        {
            header: 'Rating',
            accessor: 'reviews',
            searchKey: (row) => `${row.reviews.map(r => r.rating)}`.trim(),
            exportValue: (row) => {
                if (!row.reviews || row.reviews.length === 0) return '0.0';
                const avgRating = row.reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / row.reviews.length;
                return avgRating.toFixed(1);
            },
            render: (row) => renderStars(row.reviews),
            sortable: true
        },
        {
            header: 'Stock Status',
            accessor: 'weighstWise',
            exportValue: (row) => {
                const variantDetails = row.weighstWise.map(v => `${v.weight}${v.unit}: ${v.stock}`).join(', ');
                return variantDetails;
            },
            render: (row) => {
                const lowStocks = row.weighstWise
                    .filter(v => v.stock <= 10)
                    .map(v => Number(v.stock));

                if (lowStocks.length === 0) {
                    return <span className="text-green-600 font-bold text-xs tracking-wider">In Stock</span>;
                }

                const minStock = Math.min(...lowStocks);
                const maxStock = Math.max(...lowStocks);

                return (
                    <span className="font-bold text-red-500 text-xs">
                        {minStock === maxStock ? minStock : `${minStock} - ${maxStock}`}
                    </span>
                );
            }
        },
        {
            header: 'Total Stock',
            accessor: 'weighstWise',
            hideInTable: true,
            exportValue: (row) => row.weighstWise.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
        },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-[4px] border border-green-200">Approved</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-[4px] border border-red-200">Rejected</span>;
            case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-[4px] border border-yellow-200">Pending</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-[4px] border border-gray-200">{status || 'Unknown'}</span>;
        }
    };

    const handleView = (product) => {
        navigate(`/admin/products/view/${product._id}`);
    };

    if (loading && !viewSeller) {
        return (
            <div className="w-full flex justify-center items-center h-64">
                <AdminLoader message="Loading Sellers..." icon={FiShoppingCart} />
            </div>
        );
    }

    if (!viewSeller) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">Seller Not Found</h3>
                <button onClick={() => navigate('/admin/sellers')} className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Sellers
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 md:my-6 my-4">
                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => navigate('/admin/sellers')} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200 touch-manipulation">
                        <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-gray-700" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">Seller Details</h2>
                        <Breadcrumb />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[4px] shadow-sm border border-gray-200 w-full overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 gap-3 sm:gap-4">
                    <div className="mb-2 sm:mb-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                            <Store className="text-primary" size={24} />
                            {viewSeller.brandDetails?.storeName || 'Store Details'}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1.5 sm:mt-2 break-all">{viewSeller.email} &bull; {viewSeller.mobileno}</p>
                    </div>
                    <div>
                        {getStatusBadge(viewSeller.status)}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-3 sm:px-6 border-b border-gray-200 bg-white overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        Profile & Onboarding
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        Assigned Products
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-3 sm:p-6 bg-gray-50/30">
                    {activeTab === 'profile' && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Action Banner if pending */}
                            {viewSeller.status === 'pending' && (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 sm:p-4 rounded-[4px] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-start gap-2 sm:gap-3 text-yellow-800">
                                        <AlertCircle size={20} className="sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
                                        <span className="font-medium text-xs sm:text-sm md:text-base leading-snug">This seller has completed onboarding and is awaiting your approval.</span>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        {!showRejectInput ? (
                                            <>
                                                <button onClick={() => setShowRejectInput(true)} className="flex-1 md:flex-none px-3 sm:px-4 py-2 border border-red-200 text-red-600 bg-white hover:bg-red-50 font-bold rounded-[4px] text-xs sm:text-sm transition-colors touch-manipulation">Reject</button>
                                                <button onClick={handleApprove} className="flex-1 md:flex-none px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-[4px] text-xs sm:text-sm transition-colors shadow-sm touch-manipulation">Approve Account</button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 w-full">
                                                <input
                                                    type="text"
                                                    placeholder="Reason for rejection..."
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="flex-1 px-2 sm:px-3 py-2 border border-red-300 rounded-[4px] outline-none text-xs sm:text-sm focus:border-red-500 shadow-sm"
                                                    autoFocus
                                                />
                                                <button onClick={handleReject} className="px-3 sm:px-4 py-2 bg-red-600 text-white font-bold rounded-[4px] text-xs sm:text-sm hover:bg-red-700 shadow-sm touch-manipulation">Confirm</button>
                                                <button onClick={() => setShowRejectInput(false)} className="px-2 sm:px-3 py-2 text-gray-500 hover:bg-gray-200 bg-white border border-gray-200 rounded-[4px] shadow-sm touch-manipulation"><X size={14} className="sm:w-4 sm:h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                                {/* Business & GST */}
                                <div className="bg-white border border-gray-100 shadow-sm rounded-[4px] p-4 sm:p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-50">
                                        <Building2 className="text-primary" size={18} />
                                        <h3 className="font-bold text-base sm:text-lg">GST & Business Auth</h3>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        <InfoRow label="Legal Name" value={viewSeller.gstDetails?.businessName} />
                                        <InfoRow label="GSTIN" value={viewSeller.gstDetails?.gstin} badge />
                                        <InfoRow label="PAN Number" value={viewSeller.gstDetails?.panNumber} badge />
                                        <InfoRow label="Business Type" value={viewSeller.gstDetails?.businessType?.[0]} />
                                        <InfoRow label="Registered Addr" value={viewSeller.gstDetails?.address?.fullAddress} />
                                    </div>
                                </div>

                                {/* Brand Details */}
                                <div className="bg-white border border-gray-100 shadow-sm rounded-[4px] p-4 sm:p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-50">
                                        <User className="text-primary" size={18} />
                                        <h3 className="font-bold text-base sm:text-lg">Brand Details</h3>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        <InfoRow label="Store Name" value={viewSeller.brandDetails?.storeName} />
                                        <InfoRow label="Owner Name" value={viewSeller.brandDetails?.ownerName} />
                                        <InfoRow label="Description" value={viewSeller.brandDetails?.storeDescription} />
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="bg-white border border-gray-100 shadow-sm rounded-[4px] p-4 sm:p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-50">
                                        <CreditCard className="text-primary" size={18} />
                                        <h3 className="font-bold text-base sm:text-lg">Banking Settlement</h3>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        <InfoRow label="Account Holder" value={viewSeller.bankDetails?.accountHolderName} />
                                        <InfoRow label="Account No." value={viewSeller.bankDetails?.accountNumber} secure />
                                        <InfoRow label="IFSC Code" value={viewSeller.bankDetails?.ifscCode} badge />
                                    </div>
                                </div>

                                {/* Pickup Address */}
                                <div className="bg-white border border-gray-100 shadow-sm rounded-[4px] p-4 sm:p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-50">
                                        <MapPin className="text-primary" size={18} />
                                        <h3 className="font-bold text-base sm:text-lg">Pickup Logistics</h3>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        <InfoRow label="Flat / Building" value={viewSeller.pickupAddress?.flatHouse} />
                                        <InfoRow label="Street / Locality" value={viewSeller.pickupAddress?.street} />
                                        <InfoRow label="City & State" value={`${viewSeller.pickupAddress?.city || ''}, ${viewSeller.pickupAddress?.state || ''}`} />
                                        <InfoRow label="Pincode" value={viewSeller.pickupAddress?.pincode} badge />
                                        <InfoRow label="Landmark" value={viewSeller.pickupAddress?.landmark} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <>
                            {productLoading ? (
                                <div className="p-8 sm:p-12 text-center text-gray-400">
                                    <AdminLoader message="Loading Products..." icon={FiShoppingCart} />
                                </div>
                            ) : (
                                <DataTable
                                    data={allProducts || []}
                                    onView={handleView}
                                    columns={productColumns}
                                    allowExport={true}
                                    exportFileName={`${viewSeller.brandDetails?.storeName || 'Seller'}_Products`}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Component for Details
const InfoRow = ({ label, value, badge, secure }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm items-start">
        <div className="col-span-1 text-gray-500 font-medium">{label}</div>
        <div className="col-span-1 sm:col-span-2 font-semibold text-gray-800 flex flex-wrap">
            {!value ? <span className="text-gray-300 italic">Not provided</span> :
                secure ? <span className="tracking-[0.15em] sm:tracking-[0.2em] break-all">{value.replace(/\d(?=\d{4})/g, "*")}</span> :
                    badge ? <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 text-[10px] sm:text-xs tracking-wider uppercase inline-block font-bold break-all">{value}</span> :
                        <span className="break-all">{value}</span>}
        </div>
    </div>
);

export default SellerView;