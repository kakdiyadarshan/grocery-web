import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../redux/slice/auth.slice';
import DataTable from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { FiCheckCircle, FiShoppingCart, FiX } from 'react-icons/fi';
import AdminLoader from '../component/AdminLoader';

const Users = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold overflow-hidden shadow-sm border border-emerald-500/20 shrink-0">
                        {user?.photo?.url || user?.profileImage || user?.image ? (
                            <img src={user?.photo?.url || user.profileImage || user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            (user?.firstname?.charAt(0) || user?.name?.charAt(0) || 'U').toUpperCase()
                        )}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-800 tracking-wide block">
                            {`${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name || 'N/A'}
                        </span>
                    </div>
                </div>
            ),
            searchKey: (user) => `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name
        },
        {
            header: 'Email',
            accessor: 'email',
            render: (user) => <span className="text-textPrimary">{user.email || 'N/A'}</span>,
            searchKey: (user) => user.email
        },
        {
            header: 'Mobile',
            accessor: 'mobileno',
            exportValue: (user) => user.mobileno || user.mobile || user.phone || user.phoneNumber || user.addresses?.[0]?.phone,
            render: (user) => {
                const mobile = user.mobileno || user.mobile || user.phone || user.phoneNumber || user.addresses?.[0]?.phone || 'N/A';
                return <span className="text-textPrimary">{mobile}</span>;
            },
            searchKey: (user) => user.mobileno || user.mobile || user.phone || user.phoneNumber || user.addresses?.[0]?.phone
        },
        {
            header: 'Verified',
            accessor: 'isVerified',
            exportValue: (user) => user.isVerified ? 'Yes' : 'No',
            render: (user) => (
                <span className="text-textPrimary">
                    {user?.isVerified ? (
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-500" />
                            <span>Yes</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <FiX className="text-red-500" />
                            <span>No</span>
                        </div>
                    )}
                </span>
            ),
            searchKey: (user) => user.isVerified ? 'Yes' : 'No'
        },
        {
            header: 'Joined',
            accessor: 'createdAt',
            searchKey: (user) => new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            exportValue: (user) => new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            render: (user) => (
                <span className="text-textSecondary text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-In', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </span>
            ),
        }
    ];

    if (loading) {
        return <AdminLoader message="Loading users..." icon={FiShoppingCart} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-textPrimary tracking-tight">Users</h2>
                    <Breadcrumb />
                </div>
            </div>


            <DataTable
                data={users || []}
                columns={columns}
                allowExport={true}
                exportFileName="Platform_Users"
            />
        </>
    );
};

export default Users;
