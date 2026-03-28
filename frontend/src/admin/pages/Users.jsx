import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../../redux/slice/auth.slice';
import DataTable from '../component/DataTable';

const Users = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.auth);

    console.log(users);

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
            render: (user) => <span className="text-gray-600 font-medium">{user.email || 'N/A'}</span>,
            searchKey: (user) => user.email
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (user) => (
                <span className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase tracking-wider border ${
                    user.role === 'admin' 
                    ? 'bg-purple-50 text-purple-600 border-purple-200' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                    {user.role || 'user'}
                </span>
            ),
        },
        {
            header: 'Mobile',
            accessor: 'mobileno',
            render: (user) => {
                const mobile = user.mobileno || user.mobile || user.phone || user.phoneNumber || user.addresses?.[0]?.phone || 'N/A';
                return <span className="text-gray-600">{mobile}</span>;
            },
            searchKey: (user) => user.mobileno || user.mobile || user.phone || user.phoneNumber || user.addresses?.[0]?.phone
        },
        {
            header: 'Joined',
            accessor: 'createdAt',
            render: (user) => (
                <span className="text-gray-500 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
            ),
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-full font-['Inter',sans-serif]">
            <div className="mb-6 flex flex-col justify-start">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage all registered platform users</p>
            </div>
            
            <div className="bg-white rounded-[4px] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-16 flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-[#228B22] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <DataTable
                        data={users || []}
                        columns={columns}
                        allowExport={true}
                        exportFileName="Platform_Users"
                    />
                )}
            </div>
        </div>
    );
};

export default Users;
