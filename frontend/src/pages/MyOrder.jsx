import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrder = () => {
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'In Progress', 'Delivered', 'Cancelled'];

    const orders = [
        {
            id: "ABC-6457321",
            status: "In progress",
            date: "10 May 2021",
            image: "https://doughandcream.com/cdn/shop/files/Chocolate_Truffle_Pastry_1080x.jpg?v=1732651787",
            title: "pastry - 1 pc , Chocolate Truffle Cake - 1 pc",
            price: "50",
        },
        {
            id: "ABC-6457322",
            status: "Delivered",
            date: "10 May 2021",
            image: "https://nomoneynotime.com.au/imager/uploads/articles/21698/shutterstock_2096143354-1_374635aacd4cafccef5bb0653ee5dedb.jpeg",
            title: "Watermelon - 1 pc ",
            price: "70",
        },
        {
            id: "ABC-6457323",
            status: "Delivered",
            date: "10 May 2021",
            image: "https://t3.ftcdn.net/jpg/03/18/95/26/360_F_318952671_NFmUcJX4ukGb1a2kgtTak6PcFHjDmaOz.jpg",
            title: "pineapple - 1 pc ",
            price: "100",
        },
        {
            id: "ABC-6457325",
            status: "Cancelled",
            date: "10 May 2021",
            image: "https://images-cdn.ubuy.com.sa/6932d2c1b7e76cab500b4ea5-lays-potato-chip-variety-pack-snack.jpg",
            title: "Lays Chips - 10 Packet ",
            price: "120",
        }
    ];

    const filteredOrders = activeTab === 'All'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className=" py-8">
                <div className=" mx-auto px-4 lg:px-6">
                    <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1e5066] mb-3">My Orders</h1>
                    <div className="flex items-center gap-1 text-[14px] text-gray-500 font-medium">
                        <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link to="/" className="hover:text-[var(--primary)] transition-colors">My Account</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-[var(--primary)] font-bold">My Orders</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                {/* Tabs */}
                <div className="flex space-x-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full border text-sm font-medium transition-colors ${activeTab === tab
                                ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]'
                                : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                    <Link 
                        to="/order-tracking"
                        state={{ order }}
                        key={index} 
                        className="border border-gray-200 rounded-2xl p-4 md:p-6 bg-white hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-2 md:gap-4 w-full block"
                    >
                        <div className="flex-1 min-w-0">
                            {/* Header Info */}
                            <div className="flex items-center gap-3 mb-4 text-sm">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${order.status.toLowerCase() === 'in progress' ? 'bg-orange-50 text-orange-600' :
                                    order.status.toLowerCase() === 'delivered' ? 'bg-[#f4f8ec] text-[#6b9b3e]' :
                                        'bg-red-50 text-red-600'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${order.status.toLowerCase() === 'in progress' ? 'bg-orange-500' :
                                        order.status.toLowerCase() === 'delivered' ? 'bg-[#6b9b3e]' :
                                            'bg-red-500'
                                        }`}></span>
                                    {order.status}
                                </span>
                                {order.status.toLowerCase() === 'in progress' && (
                                    <span className="bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm border border-[var(--primary)]/10">
                                        2hr Express
                                    </span>
                                )}
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-600 font-medium">{order.date}</span>
                            </div>

                            {/* Order Details */}
                            <div className="flex gap-4 items-start md:items-center">
                                <div className="relative shrink-0 mt-1 md:mt-0">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                                        <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[var(--primary)] font-bold text-sm mb-1">Order ID: {order.id}</h4>
                                    <p className="text-gray-600 text-sm mb-2 md:mb-1 break-words">
                                        {order.title}
                                    </p>
                                    <p className="font-bold text-gray-900 text-sm">$ {order.price}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 ml-2 md:ml-4 items-center justify-center">
                            <ChevronRight className="text-[var(--primary)] w-5 h-5" />
                        </div>
                    </Link>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-2xl bg-gray-50">
                        No orders found for this status.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrder; 