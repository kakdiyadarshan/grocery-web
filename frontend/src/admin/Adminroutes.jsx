import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'

const Adminroutes = () => {

    return (
        <Routes>
            {/* <Route
                path="/"
                element={
                    isAuthenticated && user?.role === 'admin'
                        ? <Navigate to="/admin/dashboard" replace />
                        : <Login />
                }
            /> */}

            <Route>
                <Route element={<Layout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    
                </Route>
            </Route>
        </Routes>
    )
}


export default Adminroutes
