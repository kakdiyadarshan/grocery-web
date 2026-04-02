import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews } from '../../redux/slice/review.slice';
import DataTable from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { IMAGE_URL } from '../../utils/baseUrl';
import { deleteReview } from '../../redux/slice/review.slice';
import { FiX, FiStar, FiShoppingCart } from 'react-icons/fi';
import AdminLoader from '../component/AdminLoader';

const Reviews = () => {
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.review);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        dispatch(fetchReviews());
    }, [dispatch]);

    const handleView = useCallback((review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setIsModalOpen(false);
        setSelectedReview(null);
    }, []);

    const columns = useMemo(() => [
        {
            header: "Product",
            accessor: "product",
            searchKey: (row) => row.productId?.name,
            exportValue: (row) => row.productId?.name,
            render: (row) => (
                <div className="flex items-center">
                    <img src={`${IMAGE_URL}/${row.productId?.images?.[0]?.public_id}`} alt={row.productId?.name} className="w-12 h-12 object-cover rounded-lg" />
                    <span className="font-medium text-textPrimary ms-3">
                        {row.productId?.name || 'Unknown Product'}
                    </span>
                </div>
            )
        },
        {
            header: "User",
            accessor: "user",
            searchKey: (row) => row.userId?.firstname + " " + row.userId?.lastname,
            exportValue: (row) => row.userId?.firstname + " " + row.userId?.lastname,
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.userId?.photo?.url ? (
                        <img
                            src={row.userId.photo.url}
                            alt={row.userId.firstname + " " + row.userId.lastname}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {row.userId?.firstname?.[0] + row.userId?.lastname?.[0]}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-textPrimary">
                            {row.userId?.firstname + " " + row.userId?.lastname}
                        </span>
                        <span className="text-xs text-textSecondary">
                            {row.userId?.email}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: "Rating",
            accessor: "rating",
            render: (row) => (
                <div className="flex items-center gap-1">
                    <span className="font-[600] text-textPrimary">{row.rating}</span>
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={i < row.rating ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`w-3 h-3 ${i < row.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.044.80.77.388 1.192l-4.193 4.33a.562.562 0 00-.15.483l1.237 5.396c.143.626-.549 1.127-1.045.833l-4.706-2.825a.562.562 0 00-.585 0l-4.706 2.825c-.496.294-1.188-.207-1.045-.833l1.238-5.396a.562.562 0 00-.15-.483l-4.192-4.33c-.412-.422-.175-1.148.388-1.192l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        ))}
                    </div>
                </div>
            )
        },
        {
            header: "Review",
            accessor: "comment",
            render: (row) => (
                <div
                    className="max-w-xs text-sm text-textSecondary line-clamp-2 truncate "
                    title={row.comment}
                >
                    {row.comment}
                </div>
            )
        },
    ], []);

    if (loading) {
        return <AdminLoader message="Loading reviews..." icon={FiShoppingCart} />;
    }


    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Reviews</h2>
                    <Breadcrumb />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={reviews}
                onView={handleView}
                onDelete={(item) => dispatch(deleteReview(item._id))}
                itemsPerPage={10}
                exportFileName="Reviews"
                allowExport={true}
            />

            {isModalOpen && setSelectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-[4px] shadow-xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between lg:p-6 sm:p-4 p-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Review Details</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="lg:p-6 sm:p-4 p-3 overflow-y-auto max-h-[70vh] space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-textSecondary tracking-wider">
                                    Product Name
                                </span>
                                <div className="text-sm font-medium text-textPrimary break-words">
                                    {selectedReview?.productId?.name}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-textSecondary tracking-wider">
                                    User Name
                                </span>
                                <div className="text-sm font-medium text-textPrimary break-words">
                                    {selectedReview?.userId?.firstname + " " + selectedReview?.userId?.lastname}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-textSecondary tracking-wider">
                                    Email
                                </span>
                                <div className="text-sm font-medium text-textPrimary break-words">
                                    {selectedReview?.userId?.email}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-textSecondary tracking-wider">
                                    Rating
                                </span>
                                <div className="text-sm font-medium text-textPrimary break-words">
                                    {selectedReview?.rating}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-textSecondary tracking-wider">
                                    Comment
                                </span>
                                <div className="text-sm font-medium text-textPrimary break-words">
                                    {selectedReview?.comment}
                                </div>
                            </div>
                            {selectedReview?.images?.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-textSecondary tracking-wider">
                                        Images
                                    </span>
                                    <div className="text-sm font-medium text-textPrimary break-words">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedReview?.images?.map((image, index) => (
                                                <img key={index} src={image.url} alt="" className='w-20 h-20 object-cover rounded-[4px]' />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="lg:p-6 sm:p-4 p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Reviews;
