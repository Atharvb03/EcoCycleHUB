import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950'>
      {/* Animated Background */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        <div className='text-center text-2xl pt-12 pb-8 animate-fade-in-up'>
          <Title text1={'CONTACT'} text2={'US'} />
        </div>

        <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
          <div className='w-full md:max-w-[480px] animate-fade-in-up group'>
            <div className='relative overflow-hidden rounded-3xl shadow-2xl'>
              <img className='w-full transform group-hover:scale-110 transition-transform duration-700' 
                   src={assets.contact_img} 
                   alt="Contact Us" />
              <div className='absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
            </div>
          </div>
          
          <div className='flex flex-col justify-center gap-8 animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
            <div className='bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-green-100 dark:border-emerald-900/60
                           hover:scale-105 transition-transform duration-300'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='text-4xl animate-bounce-slow'>🏢</div>
                <p className='font-bold text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
                  Our Store
                </p>
              </div>
              <p className='text-gray-700 dark:text-gray-100 leading-relaxed'>
                Raj Kadu, Atharv Bendkhale <br /> 
                Khed, India
              </p>
            </div>

            <div className='bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/60
                           hover:scale-105 transition-transform duration-300'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='text-4xl animate-bounce-slow' style={{ animationDelay: '0.5s' }}>📞</div>
                <p className='font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                  Get In Touch
                </p>
              </div>
              <div className='space-y-3'>
                <a href='tel:8261825587' 
                   className='flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-green-600 transition-colors'>
                  <span className='text-xl'>📱</span>
                  <span>8261825587</span>
                </a>
                <a href='tel:8446379837' 
                   className='flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-green-600 transition-colors'>
                  <span className='text-xl'>📱</span>
                  <span>8446379837</span>
                </a>
                <a href='mailto:rajkadu2700@gmail.com' 
                   className='flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-blue-600 transition-colors'>
                  <span className='text-xl'>✉️</span>
                  <span>rajkadu2700@gmail.com</span>
                </a>
                <a href='mailto:atharvb03@gmail.com' 
                   className='flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:text-blue-600 transition-colors'>
                  <span className='text-xl'>✉️</span>
                  <span>atharvb03@gmail.com</span>
                </a>
              </div>
            </div>

            <div className='bg-gradient-to-r from-green-500 to-emerald-600 p-8 rounded-2xl shadow-2xl text-white
                           hover:scale-105 hover:shadow-green-500/50 transition-all duration-300'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='text-4xl animate-spin-slow'>🌍</div>
                <p className='font-bold text-2xl'>
                  Making a Difference
                </p>
              </div>
              <p className='leading-relaxed opacity-90'>
                Join us in our mission to create a sustainable future. Every recycling action counts!
              </p>
            </div>
          </div>
        </div>

        <div className='animate-fade-in-up' style={{ animationDelay: '0.4s' }}>
          <NewsletterBox/>
        </div>
      </div>
    </div>
  )
}

export default Contact
