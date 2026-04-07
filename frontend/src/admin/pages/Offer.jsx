import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../component/DataTable';
import { FiShoppingCart } from 'react-icons/fi';
import { getAllOffers, deleteOffer } from '../../redux/slice/offer.slice';
import AdminLoader from '../component/AdminLoader';
import { IMAGE_URL } from '../../utils/baseUrl';
import Breadcrumb from '../component/Breadcrumb';

const Offers = () => {
    const dispatch = useDispatch();
    const { offers, loading } = useSelector((state) => state.offer);

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
    }, [dispatch]);

    const handleDelete = useCallback(async (offer) => {
        await dispatch(deleteOffer(offer._id));
    }, [dispatch]);

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
                        <div key={i} className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 shadow-sm transition-transform border border-primary" title={prod.name}>
                            {prod.images?.[0] ? (
                                <img src={getImageUrl(prod.images[0])} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 font-bold">{(prod.name || 'P')[0]}</span>
                            )}
                        </div>
                    ))}
                    {item.product_id?.length > 3 && (
                        <div className="relative  h-9 w-9 border border-primary rounded-full ring-2 ring-white  bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
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

    if (loading) {
        return <AdminLoader message="Loading offers..." icon={FiShoppingCart} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">Offers</h2>
                    <Breadcrumb />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={offers || []}
                onDelete={handleDelete}
                itemsPerPage={10}
                exportFileName="Offers"
                allowExport={true}
            />
        </>
    );
};

export default Offers;