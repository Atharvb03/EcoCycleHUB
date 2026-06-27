import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import PricePredictor from '../services/pricePredictor'

// Cloud upload icon for electronics slots
const UploadCloudIcon = () => (
  <svg className="w-8 h-8 text-gray-400 dark:text-gray-100 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const Add = ({ token, isSeller = false }) => {
  // ========== MODE: Clothing vs Electronics ==========
  const [addMode, setAddMode] = useState('clothing') // 'clothing' | 'electronics'

  // ========== SHARED IMAGE STATE (clothing uses 4, electronics uses 3) ==========
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  // ========== CLOTHING FORM STATE ==========
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Men")
  const [subCategory, setSubCategory] = useState("Topwear")
  const fashionSubCategories = ["Topwear", "Bottomwear", "Winterwear"]
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictedPrice, setPredictedPrice] = useState(null)
  const [showPrediction, setShowPrediction] = useState(false)

  const onCategoryChange = (value) => {
    setCategory(value)
    setSubCategory(fashionSubCategories.includes(subCategory) ? subCategory : "Topwear")
  }

  const pricePredictor = new PricePredictor(backendUrl)

  const predictPriceHandlerClothing = async () => {
    if (!name || !description || !category || !subCategory) {
      toast.error('Please fill in product name, description, category, and sub-category')
      return
    }
    setIsPredicting(true)
    setShowPrediction(true)
    try {
      const productData = {
        name,
        description,
        category,
        subCategory,
        bestseller,
        sizes,
        image1: image1 || null,
        image2: image2 || null,
        image3: image3 || null,
        image4: image4 || null
      }
      const prediction = await pricePredictor.predictPrice(productData, token)
      if (prediction.success) {
        setPredictedPrice(prediction.predictedPrice)
        toast.success(`Price predicted: ₹${Number(prediction.predictedPrice).toFixed(2)}`)
      } else {
        toast.error(prediction.message || 'Price prediction failed')
      }
    } catch (error) {
      console.error('Prediction error:', error)
      toast.error('Failed to predict price. Please try again.')
    } finally {
      setIsPredicting(false)
    }
  }

  const usePredictedPrice = () => {
    if (predictedPrice) {
      setPrice(predictedPrice.toString())
      toast.success('Predicted price applied!')
    }
  }

  const onSubmitClothing = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))
      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const addUrl = isSeller ? backendUrl + "/api/product/seller/add" : backendUrl + "/api/product/add";
      const response = await axios.post(addUrl, formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setName(''); setDescription(''); setPrice('')
        setImage1(false); setImage2(false); setImage3(false); setImage4(false)
        setCategory('Men'); setSubCategory('Topwear'); setBestseller(false); setSizes([])
        setPredictedPrice(null); setShowPrediction(false)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // ========== ELECTRONICS FORM STATE ==========
  const [eName, setEName] = useState("")
  const [eBrand, setEBrand] = useState("")
  const [eDescription, setEDescription] = useState("")
  const [eCondition, setECondition] = useState("New")
  const [eOriginalPrice, setEOriginalPrice] = useState("")
  const [eFinalPrice, setEFinalPrice] = useState("")
  const [ePredicting, setEPredicting] = useState(false)

  const electronicsConditions = ["New", "Like New", "Good", "Fair", "Poor"]

  const predictPriceHandlerElectronics = async () => {
    if (!eName || !eDescription) {
      toast.error('Please fill in Product Name and Description')
      return
    }
    setEPredicting(true)
    try {
      const desc = [eBrand, eDescription, `Condition: ${eCondition}`].filter(Boolean).join('. ')
      const productData = {
        name: eName,
        description: desc,
        category: 'Electronics',
        subCategory: 'Other', // Default subcategory since Product Type is removed
        image1: image1 || null,
        image2: image2 || null,
        image3: image3 || null
      }
      const prediction = await pricePredictor.predictPrice(productData, token)
      if (prediction.success) {
        setEFinalPrice(Number(prediction.predictedPrice).toFixed(2))
        toast.success(`Price predicted: ₹${prediction.predictedPrice}`)
      } else {
        toast.error(prediction.message || 'Price prediction failed')
      }
    } catch (error) {
      toast.error('Failed to predict price. Please try again.')
    } finally {
      setEPredicting(false)
    }
  }

  const onSubmitElectronics = async (e) => {
    e.preventDefault()
    const finalPrice = eFinalPrice || eOriginalPrice
    if (!finalPrice || Number(finalPrice) <= 0) {
      toast.error('Please enter or predict a valid Final Price')
      return
    }
    try {
      const desc = [eBrand, eDescription, `Condition: ${eCondition}`].filter(Boolean).join('. ')
      const formData = new FormData()
      formData.append("name", eName)
      formData.append("description", desc)
      formData.append("price", finalPrice)
      formData.append("category", "Electronics")
      formData.append("subCategory", "Other") // Default subcategory since Product Type is removed
      formData.append("bestseller", false)
      formData.append("sizes", "[]")
      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)

      const addUrl = isSeller ? backendUrl + "/api/product/seller/add" : backendUrl + "/api/product/add";
      const response = await axios.post(addUrl, formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setEName(''); setEBrand(''); setEDescription(''); setECondition('New')
        setEOriginalPrice(''); setEFinalPrice('')
        setImage1(false); setImage2(false); setImage3(false)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // ========== RENDER: MODE CHOICE ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 p-6 relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-up">
          Add Items
        </h1>

        {/* Option: Clothing | Electronics */}
        <div className="flex gap-3 w-full max-w-[500px] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            type="button"
            onClick={() => setAddMode('clothing')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-center font-medium transition-all duration-300 transform hover:scale-105 ${
              addMode === 'clothing' 
                ? 'border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:border-gray-700'
            }`}
          >
            👕 Clothing
          </button>
          <button
            type="button"
            onClick={() => setAddMode('electronics')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-center font-medium transition-all duration-300 transform hover:scale-105 ${
              addMode === 'electronics' 
                ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:border-gray-700'
            }`}
          >
            📱 Electronics
          </button>
        </div>

      {/* ---------- CLOTHING FORM (unchanged layout) ---------- */}
      {addMode === 'clothing' && (
        <form onSubmit={onSubmitClothing} className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div>
            <p className="mb-2 font-medium">Upload Image</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => {
                const img = [image1, image2, image3, image4][i - 1]
                const setImg = [setImage1, setImage2, setImage3, setImage4][i - 1]
                return (
                  <label key={i} htmlFor={`img${i}`} className="cursor-pointer group">
                    <img className="w-20 h-20 object-cover border-2 border-gray-300 dark:border-gray-700 rounded-xl group-hover:border-green-500 transition-all duration-300 group-hover:scale-105" src={!img ? assets.upload_area : URL.createObjectURL(img)} alt="" />
                    <input onChange={(e) => setImg(e.target.files[0])} type="file" id={`img${i}`} hidden accept="image/*" />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="w-full mt-4">
            <p className="mb-2 font-medium">Product name</p>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full max-w-[500px] px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" type="text" placeholder="e.g. Cotton T-Shirt, Denim Jeans" required />
          </div>
          <div className="w-full mt-4">
            <p className="mb-2 font-medium">Product description</p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full max-w-[500px] px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" rows={3} placeholder="Material, color, condition..." required />
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div>
              <p className="mb-2 font-medium">Product category</p>
              <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
            <div>
              <p className="mb-2 font-medium">Sub category</p>
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                {fashionSubCategories.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-2 font-medium">Product Price (₹)</p>
              <div className="flex gap-2 items-center">
                <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-28 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" type="number" placeholder="499" step="0.01" min="0" />
                <button type="button" onClick={predictPriceHandlerClothing} disabled={isPredicting} className="px-3 py-2 text-sm rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50 disabled:bg-gray-300 transition-all duration-300 transform hover:-translate-y-1">
                  {isPredicting ? 'Predicting...' : 'Predict Price'}
                </button>
              </div>
            </div>
          </div>

          {showPrediction && (
            <div className={`p-3 rounded-xl max-w-[500px] mt-4 animate-scale-in ${predictedPrice ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
              <span className="font-semibold">Price Prediction: </span>
              {predictedPrice ? (
                <span className="text-green-700">₹{parseFloat(predictedPrice).toFixed(2)}</span>
              ) : (
                <span className="text-yellow-700">Fill details and click Predict Price</span>
              )}
              {predictedPrice && (
                <button type="button" onClick={usePredictedPrice} className="ml-2 px-2 py-1 bg-green-50 dark:bg-green-900/40 text-white text-sm rounded-lg hover:bg-green-600 transition-all">Use This Price</button>
              )}
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 font-medium">Product Sizes</p>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <button key={s} type="button" onClick={() => setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className={`px-3 py-1 border-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${sizes.includes(s) ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg shadow-pink-500/50' : 'bg-slate-100 dark:bg-slate-800 border-gray-300 dark:border-gray-700 hover:border-pink-300'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <input type="checkbox" id="bestseller" checked={bestseller} onChange={() => setBestseller(prev => !prev)} className="w-4 h-4" />
            <label htmlFor="bestseller" className="font-medium">Add to bestseller</label>
          </div>
          <button type="submit" className="mt-6 w-full max-w-xs py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300">ADD PRODUCT</button>
        </form>
      )}

      {/* ---------- ELECTRONICS FORM (as per image) ---------- */}
      {addMode === 'electronics' && (
        <form onSubmit={onSubmitElectronics} className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl max-w-[500px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">+ Add Electronics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-100 mb-3 font-medium">Upload Images</p>
          <div className="flex gap-3 mb-4">
            {[1, 2, 3].map((i) => {
              const img = [image1, image2, image3][i - 1]
              const setImg = [setImage1, setImage2, setImage3][i - 1]
              return (
                <label key={i} htmlFor={`eimg${i}`} className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:bg-blue-900/20 transition-all duration-300 transform hover:scale-105">
                  {img ? (
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <UploadCloudIcon />
                      <span className="text-xs text-gray-500 dark:text-gray-100">Upload</span>
                    </>
                  )}
                  <input type="file" id={`eimg${i}`} hidden accept="image/*" onChange={(e) => setImg(e.target.files[0])} />
                </label>
              )
            })}
          </div>

          <div className="w-full mb-4">
            <p className="mb-1 text-sm font-medium">Product Name</p>
            <input value={eName} onChange={(e) => setEName(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" type="text" placeholder="Product Name" required />
          </div>
          <div className="w-full mb-4">
            <p className="mb-1 text-sm font-medium">Brand</p>
            <input value={eBrand} onChange={(e) => setEBrand(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" type="text" placeholder="Brand" />
          </div>
          <div className="w-full mb-4">
            <p className="mb-1 text-sm font-medium">Description</p>
            <textarea value={eDescription} onChange={(e) => setEDescription(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" rows={3} placeholder="Description" required />
          </div>

          <div className="w-full mb-4">
            <p className="mb-1 text-sm font-medium">Condition</p>
            <select value={eCondition} onChange={(e) => setECondition(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              {electronicsConditions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap items-end gap-3 w-full mb-4">
            <div>
              <p className="mb-1 text-sm font-medium">Original Price</p>
              <input value={eOriginalPrice} onChange={(e) => setEOriginalPrice(e.target.value)} className="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" type="number" placeholder="Original Price" min="0" step="0.01" />
            </div>
            <button type="button" onClick={predictPriceHandlerElectronics} disabled={ePredicting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 disabled:bg-gray-300 transition-all duration-300 transform hover:-translate-y-1">
              {ePredicting ? 'Predicting...' : 'Predict Price'}
            </button>
            <div>
              <p className="mb-1 text-sm font-medium">Final Price (₹)</p>
              <input value={eFinalPrice} onChange={(e) => setEFinalPrice(e.target.value)} className="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" type="number" placeholder="Final Price" min="0" step="0.01" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300">
            Add Electronics
          </button>
        </form>
      )}
      </div>
    </div>
  )
}

export default Add
