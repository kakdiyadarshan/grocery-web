import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllContacts, deleteContact } from '../../redux/slice/contact.slice';
import Table from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { FiMail, FiX, FiUser, FiPhone, FiMessageSquare, FiCalendar } from 'react-icons/fi';

const ContactUs = () => {
    const dispatch = useDispatch();
    const { contacts, loading } = useSelector((state) => state.contact);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        dispatch(getAllContacts());
    }, [dispatch]);

    const handleView = (contact) => {
        setSelectedContact(contact);
        setIsViewModalOpen(true);
    };

    const handleDelete = useCallback(async (contact) => {
        dispatch(deleteContact(contact._id));
    }, [dispatch]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const columns = [
        {
            header: '#',
            accessor: 'index',
            hideInExport: true,
            render: (row, index) => (
                <span className="text-gray-500 font-medium">{index + 1}</span>
            )
        },
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        {
            header: 'Phone',
            accessor: 'phone',
            render: (row) => <span>{row.phone || '-'}</span>
        },
        {
            header: 'Comment',
            accessor: 'comment',
            render: (row) => (
                <span className="text-sm text-gray-500 line-clamp-1 max-w-[200px] block truncate">
                    {row.comment}
                </span>
            )
        },
        {
            header: 'Received At',
            accessor: 'createdAt',
            sortable: true,
            exportValue: (row) => formatDate(row.createdAt),
            render: (row) => (
                <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>
            )
        },
    ];

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Contact Us</h2>
                    <Breadcrumb />
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-600 px-4 py-2 rounded-[4px] text-sm font-semibold">
                    <FiMail size={16} />
                    <span>Total: {contacts.length} enquiries</span>
                </div>
            </div>

            <>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={contacts}
                        onView={handleView}
                        onDelete={handleDelete}
                        itemsPerPage={10}
                        exportFileName="Contact_Enquiries"
                        allowExport={true}
                    />
                )}
            </>



            {/* View Modal */}
            {isViewModalOpen && selectedContact && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsViewModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <FiMail className="text-green-600" size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-[600] text-gray-900">Contact Details</h3>
                                    <p className="text-xs text-gray-400">{formatDate(selectedContact.createdAt)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-100">
                                    <FiUser className="text-green-500 mt-0.5 shrink-0" size={16} />
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Name</p>
                                        <p className="text-sm font-semibold text-gray-800">{selectedContact.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-100">
                                    <FiPhone className="text-green-500 mt-0.5 shrink-0" size={16} />
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Phone</p>
                                        <p className="text-sm font-semibold text-gray-800">{selectedContact.phone || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-100">
                                <FiMail className="text-green-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
                                    <p className="text-sm font-semibold text-gray-800 break-all">{selectedContact.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-100">
                                <FiMessageSquare className="text-green-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Message</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{selectedContact.comment}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-100">
                                <FiCalendar className="text-green-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Received At</p>
                                    <p className="text-sm font-semibold text-gray-800">{formatDate(selectedContact.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleDelete(selectedContact);
                                }}
                                className="px-5 py-2.5 text-xs font-[600] uppercase tracking-wider border border-red-100 text-red-500 hover:bg-red-50 rounded-md transition-all"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-8 py-2.5 bg-primary text-white text-xs font-[600] uppercase tracking-wider rounded-md hover:bg-primaryHover transition-all"
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

export default ContactUs;
