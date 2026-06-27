import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='bg-white dark:bg-gray-950 transition-colors duration-300'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <div className='flex items-center gap-1 mb-5'>
            <img src={assets.logo} className='w-10 h-10 object-contain' alt="" />
            <span className='text-xl font-bold leading-none'>
              <span className='text-black dark:text-white'>EcoCycle</span>
              <span style={{ background: 'linear-gradient(to right, #78e08f, #38d996, #00b894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HUB</span>
            </span>
          </div>
          <p className='w-full md:w-2/3 text-gray-600 dark:text-gray-100 dark:text-gray-100'>
            EcoCycleHub is transforming waste management through innovative recycling solutions. Our platform connects communities with local recycling centers, making it easier than ever to reduce environmental impact. Since our founding, we've helped divert thousands of tons of waste from landfills while building a sustainable future for generations to come.
          </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-900 dark:text-gray-100'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-600 dark:text-gray-100 dark:text-gray-100'>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-900 dark:text-gray-100'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-600 dark:text-gray-100 dark:text-gray-100'>
            <li>8261825587</li>
            <li>rajkadu2700@gmail.com</li>
            <li>8446379837</li>
            <li>atharvb03@gmail.com</li>
          </ul>
        </div>

      </div>

      <div>
        <hr className='border-gray-200 dark:border-gray-700 dark:border-gray-700' />
        <p className='py-5 text-sm text-center text-gray-600 dark:text-gray-100 dark:text-gray-100'>
          Copyright 2024@ EcoCycleHub.com - All Right Reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer
