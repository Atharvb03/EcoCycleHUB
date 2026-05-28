import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'>
      {/* Animated Background */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        <div className='text-2xl text-center pt-12 pb-8 animate-fade-in-up'>
          <Title text1={'ABOUT'} text2={'US'} />
        </div>

        <div className='my-10 flex flex-col md:flex-row gap-16 items-center'>
          <div className='w-full md:max-w-[450px] animate-fade-in-up group'>
            <div className='relative overflow-hidden rounded-3xl shadow-2xl'>
              <img className='w-full transform group-hover:scale-110 transition-transform duration-700' 
                   src={assets.about_img} 
                   alt="About EcoCycleHub" />
              <div className='absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
            </div>
          </div>
          
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-700 animate-fade-in-up' 
               style={{ animationDelay: '0.2s' }}>
            <p className='leading-relaxed'>
              EcoCycleHub was born out of a passion for environmental sustainability and a desire to revolutionize 
              the way people approach recycling. Our journey began with a simple idea: to provide a platform where 
              individuals and businesses can easily discover, connect, and collaborate with recycling centers to 
              create a meaningful impact on our planet.
            </p>
            <p className='leading-relaxed'>
              Since our inception, we've worked tirelessly to build a comprehensive network of verified recycling 
              facilities that handle diverse materials responsibly. From plastics and paper to electronics and 
              hazardous waste, we offer an extensive directory of trusted recycling partners committed to proper 
              waste management and circular economy principles.
            </p>
            <div className='bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-100'>
              <b className='text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
                Our Mission
              </b>
              <p className='mt-3 leading-relaxed'>
                Our mission at EcoCycleHub is to empower communities with knowledge, accessibility, and impact. 
                We're dedicated to providing a seamless recycling experience that exceeds expectations, from 
                discovering the right recycling center and scheduling pickups to tracking your environmental 
                contribution and beyond.
              </p>
            </div>
          </div>
        </div>

        <div className='text-xl py-8 text-center animate-fade-in-up' style={{ animationDelay: '0.4s' }}>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 animate-fade-in-up' 
             style={{ animationDelay: '0.6s' }}>
          <div className='group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-100
                         hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 
                         transition-all duration-500 hover:-rotate-1'>
            <div className='text-5xl mb-4 animate-bounce-slow'>✓</div>
            <b className='text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
              Verified Network
            </b>
            <p className='text-gray-600 mt-3 leading-relaxed'>
              We meticulously select and vet each recycling center to ensure they meet our stringent 
              environmental and operational standards.
            </p>
          </div>
          
          <div className='group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100
                         hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 
                         transition-all duration-500 hover:rotate-1'>
            <div className='text-5xl mb-4 animate-bounce-slow' style={{ animationDelay: '0.5s' }}>⚡</div>
            <b className='text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Convenience
            </b>
            <p className='text-gray-600 mt-3 leading-relaxed'>
              With our user-friendly interface and hassle-free recycling process, responsible waste management 
              has never been easier.
            </p>
          </div>
          
          <div className='group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100
                         hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 
                         transition-all duration-500 hover:-rotate-1'>
            <div className='text-5xl mb-4 animate-bounce-slow' style={{ animationDelay: '1s' }}>💚</div>
            <b className='text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Exceptional Support
            </b>
            <p className='text-gray-600 mt-3 leading-relaxed'>
              Our team of dedicated environmental professionals is here to assist you every step of the way, 
              ensuring your positive impact is our top priority.
            </p>
          </div>
        </div>

        <div className='animate-fade-in-up' style={{ animationDelay: '0.8s' }}>
          <NewsletterBox/>
        </div>
      </div>
    </div>
  )
}

export default About
