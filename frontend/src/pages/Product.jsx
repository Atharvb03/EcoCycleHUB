import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {

  const { productId } = useParams();
  const { products, currency ,addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size,setSize] = useState('')

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })

  }

  useEffect(() => {
    fetchProductData();
  }, [productId,products])

  return productData ? (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 pt-10 pb-20 relative overflow-hidden transition-opacity ease-in duration-500 opacity-100'>
      {/* Animated Background Circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className='max-w-7xl mx-auto px-4 relative z-10'>
        {/*----------- Product Data-------------- */}
        <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row animate-fade-in-up'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full gap-2'>
              {
                productData.image.map((item,index)=>(
                  <div key={index} className='group relative overflow-hidden rounded-xl cursor-pointer'>
                    <img 
                      onClick={()=>setImage(item)} 
                      src={item} 
                      className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-500
                                ${image === item ? 'ring-4 ring-green-500' : ''}`}
                      alt="" 
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                ))
              }
          </div>
          <div className='w-full sm:w-[80%] backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-4 shadow-xl overflow-hidden group'>
              <img 
                className='w-full h-auto rounded-xl transform group-hover:scale-105 transition-transform duration-700' 
                src={image} 
                alt="" 
              />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1 backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl'>
          <h1 className='font-bold text-3xl mt-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
            {productData.name}
          </h1>
          <div className='flex items-center gap-1 mt-3'>
              <img src={assets.star_icon} alt="" className="w-4" />
              <img src={assets.star_icon} alt="" className="w-4" />
              <img src={assets.star_icon} alt="" className="w-4" />
              <img src={assets.star_icon} alt="" className="w-4" />
              <img src={assets.star_dull_icon} alt="" className="w-4" />
              <p className='pl-2 text-gray-600 dark:text-gray-300'>(122)</p>
          </div>
          <p className='mt-5 text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent'>
            {currency}{productData.price}
          </p>
          <p className='mt-5 text-gray-600 dark:text-gray-300 md:w-4/5 leading-relaxed'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p className='font-semibold text-gray-700 dark:text-gray-200'>Select Size</p>
              <div className='flex gap-2 flex-wrap'>
                {productData.sizes.map((item,index)=>(
                  <button 
                    onClick={()=>setSize(item)} 
                    className={`border-2 py-3 px-6 rounded-xl font-medium transition-all duration-300
                              ${item === size 
                                ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 scale-110' 
                                : 'border-gray-300 bg-white hover:border-green-400 hover:scale-105'
                              }`} 
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
          </div>
          <button 
            onClick={()=>addToCart(productData._id,size)} 
            className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 text-sm font-semibold rounded-xl
                     hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300
                     relative overflow-hidden group'
          >
            <span className='relative z-10'>ADD TO CART 🛒</span>
            <div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
          </button>
          <hr className='mt-8 sm:w-4/5 border-gray-300' />
          <div className='text-sm text-gray-600 dark:text-gray-300 mt-5 flex flex-col gap-2'>
              <p className='flex items-center gap-2'>✓ 100% Original product.</p>
              <p className='flex items-center gap-2'>💰 Cash on delivery is available on this product.</p>
              <p className='flex items-center gap-2'>🔄 Easy return and exchange policy within 7 days.</p>
          </div>

          {/* Seller Info */}
          {productData.sellerName && (
            <div className='mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl'>
              <p className='text-xs font-bold text-green-700 mb-2'>🏪 Sold by</p>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0'>
                  {productData.sellerName[0].toUpperCase()}
                </div>
                <div>
                  <p className='font-semibold text-gray-800'>{productData.sellerName}</p>
                  {productData.sellerMobile && (
                    <a href={`tel:${productData.sellerMobile}`}
                       className='text-sm text-green-600 hover:underline flex items-center gap-1 mt-0.5'>
                      📞 {productData.sellerMobile}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20 animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
        <div className='flex'>
          <b className='border-2 border-green-500 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 text-sm rounded-t-xl'>
            Description
          </b>
          <p className='border-2 border-gray-300 px-6 py-3 text-sm bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-xl rounded-t-xl ml-2'>
            Reviews (122)
          </p>
        </div>
        <div className='flex flex-col gap-4 border-2 border-green-500/30 px-6 py-6 text-sm text-gray-600 dark:text-gray-300 backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 rounded-b-xl rounded-tr-xl shadow-xl'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}
      <div className='mt-20'>
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
      </div>

      </div>
    </div>
  ) : <div className='opacity-0'></div>
}

export default Product
