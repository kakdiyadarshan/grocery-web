import { Outlet } from "react-router-dom";
import Header from "../component/Header";
import Sidebar from "../component/Sidebar";


const Layout = (() => {
    return (
        <>
            <div className="min-h-screen text-left relative no-scrollbar">
                {/* Sidebar */}
                <Sidebar  />

                {/* Main Content */}
                <div className="flex flex-col min-h-screen transition-all duration-300 ml-0 lg:ml-72 w-auto">

                    {/* Header */}
                    <Header  />

                    {/* Content */}
                    <main className="flex-1 px-4 md:px-8 overflow-x-hidden no-scrollbar">
                        <div>
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
})


export default Layout;
