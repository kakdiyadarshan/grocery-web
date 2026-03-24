import React from 'react'
import Header from '../component/Header'
import Footer from '../component/Footer'

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
      </main>
      <Footer />
    </div>
  )
}

export default Home