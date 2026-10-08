import React, { useState, useEffect, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { products, categories, Product } from './data/products';
import { Search, ShoppingCart, Heart, User, Menu, X, Star, ChevronRight, Filter, SlidersHorizontal, Truck, Shield, Headphones, MessageCircle, Send, Bot, Minus, Plus, Trash2, Package, LogOut, Check, ArrowLeft, Home, Tag, TrendingUp, Zap } from 'lucide-react';

// ===== HEADER =====
function Header({ onNavigate, currentPage, searchQuery, setSearchQuery }: any) {
  const { user, cart, logout } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">TechZone</span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); onNavigate('catalog'); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => onNavigate('favorites')} className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors relative">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => onNavigate('cart')} className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">{cartCount}</span>
              )}
            </button>
            {user ? (
              <div className="relative group">
                <button onClick={() => onNavigate('profile')} className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{user.name[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                </button>
              </div>
            ) : (
              <button onClick={() => onNavigate('login')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                Войти
              </button>
            )}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2.5 rounded-xl hover:bg-gray-50 lg:hidden">
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Categories bar */}
        <div className="hidden lg:flex items-center gap-1 pb-2 overflow-x-auto">
          <button onClick={() => onNavigate('catalog')} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap">
            Все товары
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => onNavigate('catalog', cat.id)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1">
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="lg:hidden border-t bg-white p-4 space-y-2">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => { onNavigate('catalog', cat.id); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ===== PRODUCT CARD =====
function ProductCard({ product, onNavigate }: { product: Product; onNavigate: any }) {
  const { addToCart, toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite(product.id);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg">-{discount}%</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className={`absolute top-2 right-2 p-2 rounded-full transition-all ${fav ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500'}`}>
          <Heart className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
          <span className="text-xs font-medium text-gray-600">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>
        <button onClick={() => onNavigate('product', product.id)} className="text-sm font-medium text-gray-800 line-clamp-2 text-left hover:text-blue-600 transition-colors mb-2 min-h-[2.5rem]">
          {product.name}
        </button>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">{product.price.toLocaleString()} ₽</div>
            {product.oldPrice && (
              <div className="text-xs text-gray-400 line-through">{product.oldPrice.toLocaleString()} ₽</div>
            )}
          </div>
          <button onClick={() => addToCart(product.id)} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== HOME PAGE =====
function HomePage({ onNavigate }: any) {
  const featured = products.filter(p => p.oldPrice).slice(0, 8);
  const popular = products.filter(p => p.reviews > 1000).slice(0, 8);
  const newProducts = products.slice(-8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Технологии будущего<br />уже сегодня</h1>
          <p className="text-blue-100 text-lg mb-6 max-w-lg">Более 150 товаров электроники от ведущих мировых брендов. Быстрая доставка и гарантия качества.</p>
          <button onClick={() => onNavigate('catalog')} className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
            Перейти в каталог
          </button>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=800')] bg-cover bg-center rounded-3xl" />
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Truck className="w-6 h-6" />, title: 'Быстрая доставка', desc: 'От 1 дня' },
          { icon: <Shield className="w-6 h-6" />, title: 'Гарантия', desc: 'До 3 лет' },
          { icon: <Headphones className="w-6 h-6" />, title: 'Поддержка 24/7', desc: 'Всегда на связи' },
          { icon: <Tag className="w-6 h-6" />, title: 'Лучшие цены', desc: 'Гарантия цены' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <div className="text-blue-600">{item.icon}</div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{item.title}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => onNavigate('catalog', cat.id)} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all">
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Deals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-red-500" /> Скидки</h2>
          <button onClick={() => onNavigate('catalog')} className="text-sm text-blue-600 font-medium hover:underline">Все акции →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
        </div>
      </div>

      {/* Popular */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Star className="w-6 h-6 text-amber-400" /> Популярное</h2>
          <button onClick={() => onNavigate('catalog')} className="text-sm text-blue-600 font-medium hover:underline">Смотреть все →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popular.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
        </div>
      </div>

      {/* New */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Новинки</h2>
          <button onClick={() => onNavigate('catalog')} className="text-sm text-blue-600 font-medium hover:underline">Все новинки →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newProducts.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
        </div>
      </div>
    </div>
  );
}

// ===== CATALOG PAGE =====
function CatalogPage({ onNavigate, initialCategory, searchQuery }: any) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const brands = useMemo(() => {
    const filtered = selectedCategory ? products.filter(p => p.category === selectedCategory) : products;
    return [...new Set(filtered.map(p => p.brand))].sort();
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
    if (selectedBrand) result = result.filter(p => p.brand === selectedBrand);
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'popular': result.sort((a, b) => b.reviews - a.reviews); break;
    }
    return result;
  }, [selectedCategory, selectedBrand, priceRange, sortBy, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button onClick={() => onNavigate('home')} className="hover:text-blue-600">Главная</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Каталог'}</span>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <div className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} lg:block lg:static lg:w-64 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-bold text-lg">Фильтры</h3>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm text-gray-800 mb-2">Категория</h4>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 border rounded-xl text-sm">
                <option value="">Все категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-800 mb-2">Бренд</h4>
              <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="w-full p-2 border rounded-xl text-sm">
                <option value="">Все бренды</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-800 mb-2">Цена</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="От" value={priceRange[0] || ''} onChange={e => setPriceRange([+e.target.value || 0, priceRange[1]])} className="w-1/2 p-2 border rounded-xl text-sm" />
                <input type="number" placeholder="До" value={priceRange[1] === 500000 ? '' : priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value || 500000])} className="w-1/2 p-2 border rounded-xl text-sm" />
              </div>
            </div>

            <button onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setPriceRange([0, 500000]); }} className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors">
              Сбросить фильтры
            </button>
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 px-3 py-2 border rounded-xl text-sm">
                <SlidersHorizontal className="w-4 h-4" /> Фильтры
              </button>
              <span className="text-sm text-gray-500">{filtered.length} товаров</span>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-2 border rounded-xl text-sm">
              <option value="popular">По популярности</option>
              <option value="price_asc">Сначала дешёвые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="rating">По рейтингу</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Товары не найдены</p>
              <p className="text-gray-400 text-sm mt-2">Попробуйте изменить параметры фильтра</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== PRODUCT PAGE =====
function ProductPage({ productId, onNavigate }: any) {
  const { addToCart, toggleFavorite, isFavorite } = useApp();
  const product = products.find(p => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><p className="text-gray-400 text-lg">Товар не найден</p></div>;

  const fav = isFavorite(product.id);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-blue-600">Главная</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => onNavigate('catalog', product.category)} className="hover:text-blue-600">{categories.find(c => c.id === product.category)?.name}</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {discount > 0 && <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-xl">-{discount}%</span>}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-blue-600 font-medium mb-1">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" />)}
            </div>
            <span className="text-sm text-gray-500">{product.rating} ({product.reviews} отзывов)</span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">{product.price.toLocaleString()} ₽</span>
            {product.oldPrice && <span className="text-lg text-gray-400 line-through">{product.oldPrice.toLocaleString()} ₽</span>}
          </div>

          <p className="text-gray-600">{product.description}</p>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
              <span className="px-4 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={() => { for (let i = 0; i < quantity; i++) addToCart(product.id); }} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> В корзину
            </button>
            <button onClick={() => toggleFavorite(product.id)} className={`p-3 border rounded-xl transition-colors ${fav ? 'border-red-200 text-red-500 bg-red-50' : 'hover:bg-gray-50'}`}>
              <Heart className="w-5 h-5" fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Truck className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className="text-xs text-gray-600">Доставка</p>
              <p className="text-xs font-medium">1-3 дня</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <p className="text-xs text-gray-600">Гарантия</p>
              <p className="text-xs font-medium">1 год</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Check className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <p className="text-xs text-gray-600">В наличии</p>
              <p className="text-xs font-medium">Да</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {[{ id: 'specs', label: 'Характеристики' }, { id: 'desc', label: 'Описание' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'specs' && (
        <div className="grid md:grid-cols-2 gap-3 mb-10">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">{key}</span>
              <span className="text-sm font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'desc' && (
        <div className="mb-10 text-gray-600 leading-relaxed">
          <p>{product.description}</p>
          <p className="mt-4">Товар сертифицирован и имеет официальную гарантию производителя. Доставка по всей России.</p>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CART PAGE =====
function CartPage({ onNavigate }: any) {
  const { cart, cartTotal, updateQuantity, removeFromCart, user } = useApp();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">Войдите, чтобы просмотреть корзину</p>
        <button onClick={() => onNavigate('login')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Войти</button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">Корзина пуста</p>
        <button onClick={() => onNavigate('catalog')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Перейти в каталог</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Корзина ({cart.length})</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.product.id} className="flex gap-4 p-4 bg-white border rounded-2xl">
              <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <button onClick={() => onNavigate('product', item.product.id)} className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2 text-left">{item.product.name}</button>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{(item.product.price * item.quantity).toLocaleString()} ₽</div>
                <div className="text-xs text-gray-400">{item.product.price.toLocaleString()} ₽/шт</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Итого</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Товары ({cart.reduce((s, i) => s + i.quantity, 0)})</span><span>{cartTotal.toLocaleString()} ₽</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Доставка</span><span className="text-green-600">Бесплатно</span></div>
          </div>
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between"><span className="font-bold">Итого</span><span className="font-bold text-xl">{cartTotal.toLocaleString()} ₽</span></div>
          </div>
          <button onClick={() => onNavigate('checkout')} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== CHECKOUT PAGE =====
function CheckoutPage({ onNavigate }: any) {
  const { cart, cartTotal, placeOrder, user } = useApp();
  const [address, setAddress] = useState(user?.address || '');
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [comment, setComment] = useState('');
  const [orderPlaced, setOrderPlaced] = useState<number | null>(null);

  if (!user) return null;

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ оформлен!</h1>
        <p className="text-gray-500 mb-2">Номер заказа: #{orderPlaced}</p>
        <p className="text-gray-500 mb-6">Мы свяжемся с вами для подтверждения</p>
        <button onClick={() => onNavigate('profile')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Мои заказы</button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!address.trim()) return alert('Укажите адрес доставки');
    const orderId = placeOrder(address, deliveryMethod, paymentMethod, comment);
    if (orderId) setOrderPlaced(orderId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Оформление заказа</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Город, улица, дом, квартира" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Способ доставки</label>
            <div className="space-y-2">
              {[{ id: 'courier', label: 'Курьер', desc: '1-3 дня', price: 'Бесплатно' }, { id: 'pickup', label: 'Самовывоз', desc: 'Сегодня', price: 'Бесплатно' }, { id: 'post', label: 'Почта России', desc: '5-10 дней', price: 'Бесплатно' }].map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${deliveryMethod === m.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <input type="radio" name="delivery" value={m.id} checked={deliveryMethod === m.id} onChange={e => setDeliveryMethod(e.target.value)} className="text-blue-600" />
                  <div className="flex-1"><span className="text-sm font-medium">{m.label}</span><span className="text-xs text-gray-500 ml-2">{m.desc}</span></div>
                  <span className="text-sm text-green-600">{m.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Способ оплаты</label>
            <div className="space-y-2">
              {[{ id: 'card', label: 'Банковская карта' }, { id: 'cash', label: 'Наличные при получении' }, { id: 'sbp', label: 'СБП' }].map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${paymentMethod === m.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={e => setPaymentMethod(e.target.value)} className="text-blue-600" />
                  <span className="text-sm font-medium">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Пожелания к заказу" className="w-full p-3 border rounded-xl text-sm h-20 resize-none" />
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Ваш заказ</h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-auto">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">{item.product.name} ×{item.quantity}</span>
                <span className="font-medium whitespace-nowrap">{(item.product.price * item.quantity).toLocaleString()} ₽</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Итого</span>
              <span>{cartTotal.toLocaleString()} ₽</span>
            </div>
          </div>
          <button onClick={handleSubmit} className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Подтвердить заказ
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== LOGIN PAGE =====
function LoginPage({ onNavigate }: any) {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      if (login(email, password)) {
        onNavigate('home');
      } else {
        setError('Неверный email или пароль');
      }
    } else {
      if (!name || !email || !password) {
        setError('Заполните все обязательные поля');
        return;
      }
      if (register(email, password, name, phone)) {
        onNavigate('home');
      } else {
        setError('Пользователь с таким email уже существует');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Имя *" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </>
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль *" className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-4 text-sm text-blue-600 font-medium hover:underline">
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
}

// ===== PROFILE PAGE =====
function ProfilePage({ onNavigate }: any) {
  const { user, orders, logout, updateProfile } = useApp();
  const [tab, setTab] = useState('orders');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saved, setSaved] = useState(false);

  if (!user) {
    onNavigate('login');
    return null;
  }

  const handleSave = () => {
    updateProfile({ name, phone, address });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
        <button onClick={() => { logout(); onNavigate('home'); }} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600">
          <LogOut className="w-4 h-4" /> Выйти
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ id: 'orders', label: 'Заказы' }, { id: 'profile', label: 'Профиль' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user.email} disabled className="w-full p-3 border rounded-xl text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 border rounded-xl text-sm" />
          </div>
          <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
            {saved ? '✓ Сохранено' : 'Сохранить'}
          </button>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">У вас пока нет заказов</p>
            </div>
          ) : (
            orders.map((order: any) => (
              <div key={order.id} className="bg-white border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-gray-900">Заказ #{order.id}</span>
                    <span className="text-sm text-gray-500 ml-3">{new Date(order.created_at).toLocaleDateString('ru')}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {order.status === 'pending' ? 'В обработке' : 'Доставлен'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span>Сумма: <strong>{order.total_amount.toLocaleString()} ₽</strong></span>
                  <span className="ml-4">Доставка: {order.delivery_method === 'courier' ? 'Курьер' : order.delivery_method === 'pickup' ? 'Самовывоз' : 'Почта'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ===== FAVORITES PAGE =====
function FavoritesPage({ onNavigate }: any) {
  const { favorites, user } = useApp();
  const favProducts = products.filter(p => favorites.includes(p.id));

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">Войдите, чтобы видеть избранное</p>
        <button onClick={() => onNavigate('login')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">Войти</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Избранное ({favProducts.length})</h1>
      {favProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Добавляйте товары в избранное</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {favProducts.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
  );
}

// ===== AI ASSISTANT =====
function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: 'Привет! 👋 Я AI-ассистент TechZone. Помогу подобрать товар, расскажу о характеристиках или сравню модели. Что вас интересует?' }
  ]);
  const [input, setInput] = useState('');

  const getResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('смартфон') || q.includes('телефон')) {
      if (q.includes('лучш') || q.includes('топ') || q.includes('флагман')) {
        return '🏆 Лучшие смартфоны 2024:\n\n1. **iPhone 15 Pro Max** — лучший для экосистемы Apple\n2. **Samsung Galaxy S24 Ultra** — лучший Android с AI-функциями\n3. **Xiaomi 14 Pro** — лучшее соотношение цена/качество\n\nДля какого бюджета подбираем?';
      }
      if (q.includes('бюджет') || q.includes('дёшев') || q.includes('недорог')) {
        return '💰 Лучшие бюджетные смартфоны:\n\n1. **Samsung Galaxy A15** (14 990₽) — AMOLED экран\n2. **Xiaomi Redmi Note 13** (17 990₽) — 108 МП камера\n3. **realme C67** (14 990₽) — хорошая батарея\n\nЧто важнее: камера, батарея или производительность?';
      }
      if (q.includes('камер')) {
        return '📸 Лучшие камерофоны:\n\n1. **Samsung Galaxy S24 Ultra** — 200 МП + зум 100x\n2. **Google Pixel 8 Pro** — лучшая обработка фото\n3. **vivo X100 Pro** — оптика Zeiss\n4. **iPhone 15 Pro Max** — лучшее видео\n\nЧто снимаете чаще: фото или видео?';
      }
      return '📱 У нас более 30 смартфонов! Могу помочь с выбором. Что важно: бюджет, камера, батарея, производительность? Или интересуете конкретный бренд?';
    }

    if (q.includes('ноутбук')) {
      if (q.includes('игр') || q.includes('игров')) {
        return '🎮 Лучшие игровые ноутбуки:\n\n1. **ASUS ROG Strix G18 RTX 4070** (179 990₽) — топ за свои деньги\n2. **Lenovo Legion Pro 5 RTX 4070** (159 990₽) — отличный баланс\n3. **MSI Katana 15 RTX 4050** (79 990₽) — бюджетный гейминг\n\nВ какие игры планируете играть и какой бюджет?';
      }
      if (q.includes('работ') || q.includes('офис')) {
        return '💼 Лучшие ноутбуки для работы:\n\n1. **MacBook Air M3 13"** (119 990₽) — идеален для задач\n2. **Lenovo ThinkPad X1 Carbon** (169 990₽) — бизнес-класс\n3. **ASUS ZenBook 14 OLED** (84 990₽) — красивый OLED\n\nКакие программы будете использовать?';
      }
      return '💻 У нас 25 ноутбуков! Подберу идеальный. Для каких задач: работа, игры, учёба? Какой бюджет?';
    }

    if (q.includes('телевизор') || q.includes('тв')) {
      if (q.includes('oled')) {
        return '📺 Лучшие OLED телевизоры:\n\n1. **LG OLED C3 65"** (179 990₽) — лучший для кино и игр\n2. **Sony BRAVIA XR A95L** (349 990₽) — QD-OLED премиум\n3. **LG OLED B3 55"** (99 990₽) — доступный OLED\n\nКакая диагональ нужна?';
      }
      return '📺 Подберу телевизор! Какой размер комнаты? Бюджет? Важнее качество картинки или Smart TV?';
    }

    if (q.includes('наушник')) {
      if (q.includes('tws') || q.includes('беспровод') || q.includes('внутриканальн')) {
        return '🎧 Лучшие TWS наушники:\n\n1. **AirPods Pro 2** (24 990₽) — для iPhone\n2. **Sony WF-1000XM5** (24 990₽) — лучший звук\n3. **Samsung Galaxy Buds3 Pro** (19 990₽) — для Samsung\n\nКакой у вас смартфон?';
      }
      return '🎧 Лучшие полноразмерные:\n\n1. **Sony WH-1000XM5** (29 990₽) — лучший ANC\n2. **Bose QC Ultra** (34 990₽) — комфорт\n3. **Sennheiser Momentum 4** (29 990₽) — 60ч батареи\n\nЧто важнее: шумоподавление, звук или комфорт?';
    }

    if (q.includes('консол') || q.includes('playstation') || q.includes('xbox') || q.includes('nintendo')) {
      return '🎮 Игровые консоли:\n\n1. **PS5 Slim** (54 990₽) — эксклюзивы Sony\n2. **Xbox Series X** (49 990₽) — Game Pass\n3. **Nintendo Switch OLED** (34 990₽) — портативность\n4. **Steam Deck OLED** (59 990₽) — ПК игры на ходу\n\nВо что любите играть?';
    }

    if (q.includes('доставк')) {
      return '🚚 Варианты доставки:\n\n• **Курьер** — 1-3 дня, бесплатно от 5000₽\n• **Самовывоз** — сегодня, бесплатно\n• **Почта России** — 5-10 дней, бесплатно\n\nВсе заказы страхуются!';
    }

    if (q.includes('гарант')) {
      return '🛡️ Гарантия:\n\n• На всю технику — от 1 года\n• На Apple — 1 год официальная\n• Расширенная гарантия до 3 лет\n• Бесплатная диагностика\n• Обмен/возврат в течение 14 дней';
    }

    if (q.includes('привет') || q.includes('здравств') || q.includes('хай') || q.includes('hello')) {
      return 'Привет! 👋 Рад помочь! Могу подсказать по:\n\n• 📱 Смартфонам\n• 💻 Ноутбукам\n• 📺 Телевизорам\n• 🎧 Аудио\n• 🎮 Консолям\n• 🏠 Умному дому\n\nЧто интересует?';
    }

    if (q.includes('сравн') || q.includes('отличи') || q.includes('разниц')) {
      return '📊 Могу сравнить любые товары! Напишите какие модели вас интересуют, например:\n\n• iPhone 15 Pro vs Samsung S24 Ultra\n• PS5 vs Xbox Series X\n• MacBook Air vs MacBook Pro\n\nЧто сравниваем?';
    }

    return '🤔 Интересный вопрос! Я могу помочь с:\n\n• Подбором товара по бюджету и задачам\n• Сравнением моделей\n• Рекомендациями по категориям\n• Информацией о доставке и гарантии\n\nУточните, что именно вас интересует?';
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: getResponse(userMsg) }]);
    }, 500);
  };

  return (
    <>
      {/* Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI-ассистент</span>
            </div>
            <p className="text-xs text-blue-100 mt-1">Помогу выбрать идеальный товар</p>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3 max-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Спросите что-нибудь..." className="flex-1 p-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleSend} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {['Лучший смартфон', 'Игровой ноутбук', 'Телевизор OLED', 'Наушники'].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200">{q}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== FOOTER =====
function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">TechZone</span>
            </div>
            <p className="text-sm text-gray-400">Лучший интернет-магазин электроники с 2024 года</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Каталог</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Смартфоны</li><li>Ноутбуки</li><li>Телевизоры</li><li>Аудио</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Покупателям</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Доставка</li><li>Гарантия</li><li>Возврат</li><li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>8 (800) 123-45-67</li><li>info@techzone.ru</li><li>Пн-Вс: 9:00 - 21:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 TechZone. Все права защищены. База данных: SQLite (sql.js)</p>
        </div>
      </div>
    </footer>
  );
}

// ===== MAIN APP =====
function AppContent() {
  const [page, setPage] = useState('home');
  const [pageData, setPageData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = (newPage: string, data?: any) => {
    setPage(newPage);
    setPageData(data || null);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage onNavigate={navigate} />;
      case 'catalog': return <CatalogPage onNavigate={navigate} initialCategory={pageData} searchQuery={searchQuery} />;
      case 'product': return <ProductPage productId={pageData} onNavigate={navigate} />;
      case 'cart': return <CartPage onNavigate={navigate} />;
      case 'checkout': return <CheckoutPage onNavigate={navigate} />;
      case 'login': return <LoginPage onNavigate={navigate} />;
      case 'profile': return <ProfilePage onNavigate={navigate} />;
      case 'favorites': return <FavoritesPage onNavigate={navigate} />;
      default: return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <Header onNavigate={navigate} currentPage={page} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main>{renderPage()}</main>
      <Footer />
      <AIAssistant />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
