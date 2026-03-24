import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import DataTable from './component/DataTable'

const Adminroutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route element={<Layout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<DataTable />} />
                <Route path="categories" element={<DataTable />} />
                <Route path="orders" element={<DataTable />} />
                <Route path="customers" element={<DataTable />} />
                <Route path="vendors" element={<DataTable />} />

                <Route path="settings" element={<div className="p-6 h-full flex items-center justify-center text-gray-400 font-medium">Coming Soon</div>} />
            </Route>
        </Routes>
    )
}

export default Adminroutes
