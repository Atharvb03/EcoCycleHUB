import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { products , search , showSearch } = useContext(ShopContext);
  const [filterProducts,setFilterProducts] = useState([]);

  const applyFilter = () => {
    let productsCopy = products.slice();

    // Apply search only
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilterProducts(productsCopy);
  }

  useEffect(()=>{
    applyFilter();
  },[products, search, showSearch])

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 pt-10'>
      {/* Animated Background Circles */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-center text-base sm:text-2xl mb-8 animate-fade-in-up'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {filterProducts.length > 0 && (
            <div className='text-sm text-gray-600 dark:text-gray-100 bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg'>
              {filterProducts.length} Products
            </div>
          )}
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8'>
          {
            filterProducts.map((item,index)=>(
              <div key={index} className='animate-fade-in-up' style={{ animationDelay: `${index * 0.05}s` }}>
                <ProductItem name={item.name} id={item._id} price={item.price} image={item.image} />
              </div>
            ))
          }
        </div>

        {filterProducts.length === 0 && (
          <div className='text-center py-20 animate-fade-in-up'>
            <div className='text-6xl mb-4'>🔍</div>
            <p className='text-xl text-gray-600 dark:text-gray-100'>No products found</p>
            <p className='text-sm text-gray-500 dark:text-gray-100 mt-2'>Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection
