import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='relative flex flex-col sm:flex-row border border-gray-200 overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 h-screen'>
      {/* Animated Background Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Hero Left Side */}
      <div className='relative z-10 w-full sm:w-1/2 flex items-center justify-center py-20 sm:py-0 px-4'>
            <div className='text-[#414141] max-w-xl'>
                <div className='flex items-center gap-2 animate-fade-in-up'>
                    <p className='w-8 md:w-11 h-[2px] bg-gradient-to-r from-green-500 to-emerald-600'></p>
                    <p className='font-medium text-sm md:text-base bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
                      ♻️ RECYCLE WITH PURPOSE
                    </p>
                </div>
                
                <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x' 
                    style={{ animationDelay: '0.2s' }}>
                  Turn Waste Into Worth
                </h1>
                
                <p className='text-gray-600 text-sm md:text-base mb-6 animate-fade-in-up' style={{ animationDelay: '0.4s' }}>
                  Join thousands making a difference. Recycle, earn rewards, and save the planet! 🌍
                </p>
            </div>
      </div>
      
      {/* Hero Right Side */}
      <div className='relative z-10 w-full sm:w-1/2 flex items-center justify-center p-6 sm:p-10'>
        <div className='relative group max-w-lg w-full'>
          {/* Floating Icons */}
          <div className='absolute -top-4 -left-4 text-4xl animate-bounce-slow'>♻️</div>
          <div className='absolute -bottom-4 -right-4 text-4xl animate-spin-slow'>🌍</div>
          <div className='absolute top-1/2 -left-6 text-3xl animate-bounce' style={{ animationDelay: '0.5s' }}>🌱</div>
          
          {/* Image with hover effect */}
          <img 
            className='w-full rounded-2xl shadow-2xl transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-500' 
            src={assets.hero1} 
            alt="Eco Recycling" 
          />
          
          {/* Glow effect on hover */}
          <div className='absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500' />
        </div>
      </div>
    </div>
  )
}

export default Hero