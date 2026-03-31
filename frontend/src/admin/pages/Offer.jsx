import  { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../component/DataTable';
import { FiPlus, FiX } from 'react-icons/fi';
import { createOffer, getAllOffers, deleteOffer, updateOffer } from '../../redux/slice/offer.slice';
import CustomSelect from '../component/CustomSelect';
import CustomMultiSelect from '../component/CustomMultiSelect';
import { getAllProducts } from '../../redux/slice/product.slice';
import { IMAGE_URL } from '../../utils/baseUrl';
import Breadcrumb from '../component/Breadcrumb';

const Offers = () => {
    const dispatch = useDispatch();
    const { offers, loading } = useSelector((state) => state.offer);
    const { products } = useSelector((state) => state.product);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);

    const [formData, setFormData] = useState({
        product_id: [],
        offer_type: 'Discount',
        offer_value: '',
        offer_start_date: '',
        offer_end_date: ''
    });

    const getImageUrl = useCallback((path) => {
        if (!path) return '';
        if (typeof path === 'object' && path.url) path = path.url;
        if (typeof path !== 'string') return '';
        if (path.startsWith('/img') || path.startsWith('img'))
            return path.startsWith('/') ? path : `/${path}`;
        if (path.startsWith('http') || path.startsWith('https')) return path;

        const baseUrl = IMAGE_URL.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    }, []);

    useEffect(() => {
        dispatch(getAllOffers());
        dispatch(getAllProducts());
    }, [dispatch]);

    const handleInputChange = useCallback((e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }, []);

    const handleProductSelect = useCallback((selectedIds) => {
        setFormData(prev => ({
            ...prev,
            product_id: selectedIds
        }));
    }, []);

    const handleEdit = useCallback((offer) => {
        setCurrentOffer(offer);
        setFormData({
            product_id: offer.product_id?.map(p => p._id || p) || [],
            offer_type: offer.offer_type,
            offer_value: offer.offer_value,
            offer_start_date: offer.offer_start_date?.split('T')[0] || '',
            offer_end_date: offer.offer_end_date?.split('T')[0] || ''
        });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (offer) => {
        await dispatch(deleteOffer(offer._id));
    }, [dispatch]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setCurrentOffer(null);
        setFormData({
            product_id: [],
            offer_type: 'Discount',
            offer_value: '',
            offer_start_date: '',
            offer_end_date: ''
        });
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (currentOffer) {
            await dispatch(updateOffer({ id: currentOffer._id, data: formData }));
        } else {
            await dispatch(createOffer(formData));
        }

        closeModal();
        dispatch(getAllOffers());
    }, [dispatch, currentOffer, formData, closeModal]);

    const columns = useMemo(() => [
        {
            header: 'Offer Type',
            accessor: 'offer_type',
            render: (item) => (
                <span className={`px-2.5 py-1 rounded text-xs font-bold border ${item.offer_type === 'Discount'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : item.offer_type === 'Fixed'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                    {item.offer_type}
                </span>
            )
        },
        {
            header: 'Value',
            accessor: 'offer_value',
            exportValue: (item) => item.offer_type === 'Fixed' ? `$${item.offer_value}` : `${item.offer_value}%`,
            render: (item) => (
                <span className="font-bold text-gray-800">
                    {item.offer_type === 'Fixed'
                        ? `$${item.offer_value}`
                        : `${item.offer_value}%`}
                </span>
            )
        },
        {
            header: 'Products',
            accessor: 'product_id',
            exportValue: (item) => item.product_id?.map(p => p.name).join(', ') || 'No products',
            render: (item) => (
                <div className="flex -space-x-2">
                    {item.product_id?.slice(0, 3).map((prod, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] overflow-hidden shadow-sm" title={prod.name}>
                            {prod.images?.[0] ? (
                                <img src={getImageUrl(prod.images[0])} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 font-bold">{(prod.name || 'P')[0]}</span>
                            )}
                        </div>
                    ))}
                    {item.product_id?.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                            +{item.product_id.length - 3}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Start Date',
            accessor: 'offer_start_date',
            searchKey: (item) => new Date(item.offer_start_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            exportValue: (item) => `${new Date(item.offer_start_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}`,
            render: (item) => (
                <div className="text-xs">
                    <div className="font-medium">
                        {new Date(item.offer_start_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            )
        },
        {
            header: 'Expired Date',
            accessor: 'offer_end_date',
            searchKey: (item) => new Date(item.offer_end_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            exportValue: (item) => `${new Date(item.offer_end_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}`,
            render: (item) => (
                <div className="text-xs">
                    <div className="font-medium">
                        {new Date(item.offer_end_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            searchKey: (item) => {
                const today = new Date();
                const startDate = new Date(item.offer_start_date);
                const endDate = new Date(item.offer_end_date);
                if (today < startDate) return 'Inactive';
                if (today > endDate) return 'Expired';
                return 'Active';
            },
            exportValue: (item) => {
                const today = new Date();
                const startDate = new Date(item.offer_start_date);
                const endDate = new Date(item.offer_end_date);
                if (today < startDate) return 'Inactive';
                if (today > endDate) return 'Expired';
                return 'Active';
            },
            render: (item) => {
                const today = new Date();
                const startDate = new Date(item.offer_start_date);
                const endDate = new Date(item.offer_end_date);

                let status = '';
                let style = '';

                if (today < startDate) {
                    status = 'Inactive';
                    style = 'bg-yellow-50 text-yellow-600 border-yellow-100';
                } else if (today > endDate) {
                    status = 'Expired';
                    style = 'bg-red-50 text-red-600 border-red-100';
                } else {
                    status = 'Active';
                    style = 'bg-green-50 text-green-600 border-green-100';
                }

                return (
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${style}`}>
                        {status}
                    </span>
                );
            }
        }
    ], [getImageUrl]);

    const productOptions = useMemo(() => {
        return products.map(prod => ({
            value: prod._id,
            label: prod.name
        }));
    }, [products]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-color border-t-transparent"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">Offers</h2>
                    <Breadcrumb />
                </div>
                <div className='flex items-center justify-end gap-2 ms-auto'>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                    >
                        <FiPlus size={18} />
                        <span>Create Offer</span>
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={offers || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                itemsPerPage={10}
                exportFileName="Offers"
                allowExport={true}
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-[650px] overflow-hidden transform transition-all">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="text-[20px] font-[800] text-[#1a1a1a]">
                                {currentOffer ? 'Edit Offer' : 'Create New Offer'}
                            </h3>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 pb-6">
                            <div className="space-y-6">
                                <div>
                                    <CustomMultiSelect
                                        label={<span>Target Products <span className="text-primary">*</span></span>}
                                        options={productOptions}
                                        value={formData.product_id}
                                        onChange={handleProductSelect}
                                        placeholder="Select products for this offer"
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <CustomSelect
                                        label={<span>Offer Type <span className="text-primary">*</span></span>}
                                        options={[
                                            { value: 'Discount', label: 'Discount (%)' },
                                            { value: 'Fixed', label: 'Fixed ($)' },
                                        ]}
                                        value={formData.offer_type}
                                        onChange={(val) => setFormData({ ...formData, offer_type: val })}
                                        placeholder="Select..."
                                    />

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Offer Value</label>
                                        <input
                                            type="number"
                                            name="offer_value"
                                            value={formData.offer_value}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-gray-700"
                                            placeholder="10%"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            name="offer_start_date"
                                            value={formData.offer_start_date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-gray-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            name="offer_end_date"
                                            value={formData.offer_end_date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end items-center gap-4 mt-12 mb-2">
                                <button type="button" onClick={closeModal} className="text-[#596985] font-bold text-sm px-4 py-2.5 transition-colors hover:text-[#1a1a1a]">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-[4px] text-sm font-bold shadow-sm hover:bg-primaryHover transition-all active:scale-95">
                                    {currentOffer ? 'Update Campaign' : 'Launch Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Offers;