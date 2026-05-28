import React, { useContext, useState, useMemo } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { useNavigate } from 'react-router-dom'

const CATEGORY_TREE = {
  'All': [],
  'Clothing': ['All Clothing', 'Men', 'Women', 'Kids'],
  'Electronics': ['All Electronics', 'Mobile', 'Laptop', 'Tablet', 'Camera', 'Audio', 'Other'],
}
const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor']

const BuyerPortal = () => {
  const { products, currency } = useContext(ShopContext)
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')       // 'All' | 'Clothing' | 'Electronics'
  const [subCategory, setSubCategory] = useState('All') // sub under selected category
  const [condition, setCondition] = useState('All')
  const [sort, setSort] = useState('newest')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [showWishlist, setShowWishlist] = useState(false)
  const [selected, setSelected] = useState(null)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const toggleWishlist = (e, id) => {
    e.stopPropagation()
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])
  }

  const clearFilters = () => {
    setCategory('All'); setSubCategory('All'); setCondition('All')
    setPriceMin(''); setPriceMax('')
    setVerifiedOnly(false); setSearch('')
    setShowWishlist(false)
  }

  const activeFilterCount = [
    category !== 'All', subCategory !== 'All', condition !== 'All',
    priceMin !== '', priceMax !== '', verifiedOnly, showWishlist
  ].filter(Boolean).length

  const filtered = useMemo(() => {
    const base = showWishlist ? products.filter(p => wishlist.includes(p._id)) : products
    return base
      .filter(p => {
        // Category: 'All' shows everything, 'Clothing' matches Men/Women/Kids, 'Electronics' matches Electronics
        const matchCat = category === 'All' ||
          (category === 'Clothing' && ['men','women','kids'].includes(p.category?.toLowerCase())) ||
          (category === 'Electronics' && p.category?.toLowerCase() === 'electronics')

        // SubCategory filter
        const matchSub = subCategory === 'All' ||
          subCategory.startsWith('All') ||
          p.category?.toLowerCase() === subCategory.toLowerCase() ||
          p.subCategory?.toLowerCase() === subCategory.toLowerCase()

        const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
        const matchMin = !priceMin || p.price >= Number(priceMin)
        const matchMax = !priceMax || p.price <= Number(priceMax)
        const matchVerified = !verifiedOnly || !!p.sellerName
        const matchCond = condition === 'All' || p.description?.toLowerCase().includes(condition.toLowerCase())
        return matchCat && matchSub && matchSearch && matchMin && matchMax && matchVerified && matchCond
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        return new Date(b.date) - new Date(a.date)
      })
  }, [products, search, category, subCategory, condition, priceMin, priceMax, verifiedOnly, sort, showWishlist, wishlist])

  const SidebarContent = () => (
    <div className="flex flex-col gap-5">

      {/* Wishlist toggle */}
      <button onClick={() => setShowWishlist(w => !w)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
          showWishlist ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-400'
        }`}>
        <span>{showWishlist ? '❤️' : '🤍'}</span>
        My Wishlist
        {wishlist.length > 0 && (
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${showWishlist ? 'bg-white text-pink-500' : 'bg-pink-100 text-pink-600'}`}>
            {wishlist.length}
          </span>
        )}
      </button>

      {/* Category */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</p>
        <div className="flex flex-col gap-0.5">
          {/* All */}
          <button onClick={() => { setCategory('All'); setSubCategory('All') }}
            className={`text-left px-3 py-2 rounded-xl text-sm transition-all ${
              category === 'All' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            All
          </button>

          {/* Clothing + subs */}
          <button onClick={() => { setCategory('Clothing'); setSubCategory('All') }}
            className={`text-left px-3 py-2 rounded-xl text-sm transition-all font-medium ${
              category === 'Clothing' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}>
            👕 Clothing
          </button>
          {category === 'Clothing' && CATEGORY_TREE['Clothing'].map(sub => (
            <button key={sub} onClick={() => setSubCategory(sub)}
              className={`text-left pl-7 pr-3 py-1.5 rounded-xl text-sm transition-all ${
                subCategory === sub ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {sub.startsWith('All') ? '• All' : `• ${sub}`}
            </button>
          ))}

          {/* Electronics + subs */}
          <button onClick={() => { setCategory('Electronics'); setSubCategory('All') }}
            className={`text-left px-3 py-2 rounded-xl text-sm transition-all font-medium ${
              category === 'Electronics' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}>
            📱 Electronics
          </button>
          {category === 'Electronics' && CATEGORY_TREE['Electronics'].map(sub => (
            <button key={sub} onClick={() => setSubCategory(sub)}
              className={`text-left pl-7 pr-3 py-1.5 rounded-xl text-sm transition-all ${
                subCategory === sub ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {sub.startsWith('All') ? '• All' : `• ${sub}`}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price Range (₹)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
          <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Condition</p>
        <div className="flex flex-col gap-0.5">
          {CONDITIONS.map(c => (
            <button key={c} onClick={() => setCondition(c)}
              className={`text-left px-3 py-2 rounded-xl text-sm transition-all ${
                condition === c ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Sellers */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Seller</p>
        <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
          <div onClick={() => setVerifiedOnly(v => !v)}
            className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${verifiedOnly ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${verifiedOnly ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm text-gray-700">Verified sellers only ✅</span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</p>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white">
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {/* Quick Links */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Links</p>
        <div className="flex flex-col gap-0.5">
          {[
            { icon: '♻️', label: 'Recycle a Device', path: '/recycle' },
            { icon: '📍', label: 'Centers Near Me', path: '/centers' },
            { icon: '🏅', label: 'My Rewards', path: '/rewards' },
            { icon: '📦', label: 'My Orders', path: '/orders' },
            { icon: '👤', label: 'My Profile', path: '/profile' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left">
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 text-sm shrink-0">← Home</button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent shrink-0">
            ♻️ Buyers Portal
          </h1>
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <input type="text" placeholder="🔍 Search products..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
          </div>
          {/* Mobile filter button */}
          <button onClick={() => setMobileSidebar(true)}
            className="lg:hidden flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold shrink-0">
            ⚙️ Filters {activeFilterCount > 0 && <span className="bg-white text-green-600 text-xs font-bold px-1.5 rounded-full">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── LEFT PANEL (desktop) ── */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20 bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-5">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">🔧 Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* ── RIGHT: Product Grid ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
            <span>{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</span>
            {showWishlist && <span className="text-pink-500 font-semibold">❤️ Showing wishlist</span>}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-5xl mb-4">{showWishlist ? '🤍' : '🌱'}</p>
              <p className="text-lg">{showWishlist ? 'Your wishlist is empty' : 'No products found'}</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-3 text-sm text-green-600 hover:underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(product => (
                <div key={product._id} onClick={() => setSelected(product)}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative">

                  {/* Wishlist heart */}
                  <button onClick={e => toggleWishlist(e, product._id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-sm hover:scale-110 transition-transform">
                    {wishlist.includes(product._id) ? '❤️' : '🤍'}
                  </button>

                  {/* Verified badge */}
                  {product.sellerName && (
                    <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full">
                      ✓ Verified
                    </div>
                  )}

                  <div className="overflow-hidden h-44">
                    <img src={product.image?.[0]} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                      {product.category}
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-1 line-clamp-2">{product.name}</p>
                    <p className="text-base font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mt-1">
                      {currency}{product.price}
                    </p>
                    {product.sellerName && (
                      <p className="text-[10px] text-gray-400 mt-1 truncate">🏪 {product.sellerName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <div className="relative ml-auto w-72 h-full bg-white shadow-2xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">🔧 Filters</h2>
              <button onClick={() => setMobileSidebar(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => { clearFilters(); setMobileSidebar(false) }}
                className="w-full mb-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors">
                Clear all filters ({activeFilterCount})
              </button>
            )}
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={selected.image?.[0]} alt={selected.name}
                className="w-full h-64 object-cover rounded-t-3xl" />
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white shadow">
                ✕
              </button>
              <button onClick={e => toggleWishlist(e, selected._id)}
                className="absolute top-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow text-sm hover:scale-110 transition-transform">
                {wishlist.includes(selected._id) ? '❤️' : '🤍'}
              </button>
            </div>

            {selected.image?.length > 1 && (
              <div className="flex gap-2 px-5 pt-3 overflow-x-auto">
                {selected.image.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                ))}
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  {selected.category}{selected.subCategory ? ` · ${selected.subCategory}` : ''}
                </span>
                {selected.sellerName && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">✓ Verified Seller</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-2">{selected.name}</h2>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mt-1">
                {currency}{selected.price}
              </p>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">{selected.description}</p>

              {selected.sizes?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Available sizes:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.sizes.map(s => (
                      <span key={s} className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-700">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { setSelected(null); navigate(`/product/${selected._id}`) }}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-all">
                View Full Details & Buy
              </button>

              {selected.sellerName && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <p className="text-xs font-bold text-green-700 mb-2">🏪 Sold by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {selected.sellerName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{selected.sellerName}</p>
                      {selected.sellerMobile && (
                        <a href={`tel:${selected.sellerMobile}`}
                          className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-0.5">
                          📞 {selected.sellerMobile}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerPortal
