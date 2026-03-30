import { useEffect, useMemo, useState } from "react";
import DataTable from "../component/DataTable";
import Breadcrumb from "../component/Breadcrumb";
import { FiPlus, FiX } from "react-icons/fi";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../redux/slice/couponSLice";
import { useDispatch, useSelector } from "react-redux";

const Coupon = () => {

    const dispatch = useDispatch();
    const { coupons, loading } = useSelector(state => state.coupon);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({ code: '', discount: '', expiryDate: '' });

    const columns = useMemo(() => [
        {
            header: 'Coupon Code', accessor: 'code',

        },
        { header: 'Discount (%)', accessor: 'discount', },
        {
            header: 'Expiry Date',
            accessor: 'expiryDate',
            render: (item) => {
                const date = new Date(item.expiryDate);
                return date.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        },
        {
            header: 'Status',
            accessor: 'isActive',
            render: (item) => (
                <span className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold border ${item.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
    ], []);

    useEffect(() => {
        dispatch(getAllCoupons());
    }, [dispatch]);

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discount: coupon.discount,
                expiryDate: coupon.expiryDate.split('T')[0]
            });
        } else {
            setEditingCoupon(null);
            setFormData({ code: '', discount: '', expiryDate: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
        setFormData({ code: '', discount: '', expiryDate: '' });
    };

    const handleFormChange = (e) => {
        const { name, value } =
            e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code || !formData.discount || !formData.expiryDate) {
            alert('Please fill all fields');
            return;
        }

        if (editingCoupon) {
            await dispatch(updateCoupon({ id: editingCoupon._id, couponData: formData }));
        } else {
            await dispatch(createCoupon(formData));
        }
        handleCloseModal();
    };

    const handleDelete = async (coupon) => {
        await dispatch(deleteCoupon(coupon._id));
    };

    return (
        <>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">Coupon</h2>
                    <Breadcrumb />
                </div>
                <div className='flex items-center justify-end gap-2 ms-auto'>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                    >
                        <FiPlus size={18} />
                        <span>Create Coupon</span>
                    </button>
                </div>
            </div>
            <DataTable columns={columns} data={coupons || []} onEdit={handleOpenModal} onDelete={handleDelete} />

            {/* Modal for Create/Edit Coupon */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[4px] max-w-md w-full shadow-lg">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Coupon Code *
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleFormChange}
                                    placeholder="e.g., SAVE20"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-gray-700"
                                    disabled={editingCoupon ? true : false}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount (%) *
                                </label>
                                <input
                                    type="number"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleFormChange}
                                    placeholder="e.g., 20"
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-gray-700"
                                />
                            </div>

                            <div className="flex justify-end items-center gap-4 mt-12 mb-2">
                                <button type="button" onClick={handleCloseModal} className="text-[#596985] font-bold text-sm px-4 py-2.5 transition-colors hover:text-[#1a1a1a]">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="bg-primary text-white px-8 py-2.5 rounded-[4px] text-sm font-[600] shadow-sm hover:bg-primaryHover transition-all active:scale-95">
                                    {loading ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Coupon;