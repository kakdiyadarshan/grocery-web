import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from '../component/DataTable';
import { FiPlus } from 'react-icons/fi';
import { fetchBanners, deleteBanner } from '../../redux/slice/banner.slice';
import Breadcrumb from '../component/Breadcrumb';

const Banners = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { banners, loading } = useSelector((state) => state.banner);

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    const handleEdit = useCallback((banner) => {
        navigate(`/admin/banners/edit/${banner._id}`);
    }, [navigate]);

    const handleDelete = useCallback((banner) => {
        dispatch(deleteBanner(banner._id));
    }, [dispatch]);

    const handleCreate = useCallback(() => {
        navigate('/admin/banners/create');
    }, [navigate]);

    const columns = useMemo(() => [
        {
            header: 'Image',
            accessor: 'image',
            hideInExport: true,
            render: (item) => (
                <div className="w-24 h-16 rounded overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                        src={item.image?.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        },
        {
            header: 'Title',
            accessor: 'title',
            render: (item) => (
                <span className="font-semibold text-gray-800">
                    {item.title}
                </span>
            )
        },
        {
            header: 'Order',
            accessor: 'order',
            render: (item) => (
                <span className="text-gray-600 font-medium">
                    #{item.order}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'isActive',
            exportValue: (item) => item.isActive ? 'Active' : 'Inactive',
            render: (item) => (
                <span
                    className={`px-2 py-1 rounded-[4px] text-xs font-bold uppercase ${item.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                >
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Link',
            accessor: 'link',
            render: (item) => (
                <span className="text-primary text-sm">
                    {item.link}
                </span>
            )
        }
    ], []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center md:my-6 my-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Banners</h2>
                    <Breadcrumb />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                    >
                        <FiPlus size={16} />
                        Add Banner
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={banners || []}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                itemsPerPage={10}
                exportFileName="Website_Banners"
                allowExport={false}
            />
        </div>
    );
};

export default Banners;