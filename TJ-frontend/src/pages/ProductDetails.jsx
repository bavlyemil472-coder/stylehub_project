import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, ArrowLeft, ShieldCheck, Truck, Star } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get(`/products/${id}/`) 
      .then(res => {
        setProduct(res.data);
        setActiveImage(res.data.image); 
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
      })
      .catch(() => toast.error("فشل في تحميل تفاصيل المنتج"));
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتجات للسلة 🛍️");
      navigate('/login');
      return;
    }
    // ------------------------------------

    if (!selectedVariant) {
        toast.error("يرجى اختيار المقاس أولاً");
        return;
    }

    try {
      await api.post('/cart/add/', {
        variant_id: selectedVariant.id,
        quantity: quantity
      });
      
      toast.success(`${product.name} أضيف إلى سلتك`, {
        style: {
          border: '1px solid #D4AF37',
          padding: '12px',
          color: '#FFF',
          background: '#0B0B0B',
          fontSize: '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        },
        iconTheme: { primary: '#D4AF37', secondary: '#0B0B0B' },
      });
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول أولاً");
        navigate('/login');
      } else {
        toast.error(err.response?.data?.error || "حدث خطأ أثناء الإضافة");
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error("عذراً، يجب تسجيل الدخول لتتمكن من إضافة تقييمك");
      navigate('/login');
      return;
    }
    // -------------------------------------------

    try {
      await api.post(`/products/${id}/add-review/`, { rating, comment });
      toast.success("تم إضافة تقييمك بنجاح");
      const res = await api.get(`/products/${id}/`);
      setProduct(res.data);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error("فشل إضافة التقييم، يرجى التأكد من تسجيل الدخول");
    }
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-brand-gold mb-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> العودة للمتجر
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-brand-gray/30 rounded-[3rem] overflow-hidden aspect-[4/5] relative group shadow-sm">
                <img 
                  src={activeImage} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
              <button 
                onClick={() => setActiveImage(product.image)}
                className={`w-20 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300 border-2 ${activeImage === product.image ? 'border-brand-gold scale-95 shadow-lg' : 'border-transparent opacity-50'}`}
              >
                <img src={product.image} className="w-full h-full object-cover" alt="main" />
              </button>

              {product.p_images && product.p_images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300 border-2 ${activeImage === img.image ? 'border-brand-gold scale-95 shadow-lg' : 'border-transparent opacity-50'}`}
                >
                  <img src={img.image} className="w-full h-full object-cover" alt="gallery" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col pt-4">
            <span className="text-brand-gold font-black uppercase tracking-[0.4em] text-[9px] mb-4">Tri Jolie Premium</span>
            
            <h1 className="text-4xl font-bold text-brand-dark italic font-display uppercase tracking-tighter mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
                <p className="text-2xl font-bold text-brand-dark font-display italic">{product.price} EGP</p>
                <div className="flex text-brand-gold items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.round(product.average_rating || 5) ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-[10px] text-gray-400 font-black ml-2">({product.review_count || 0})</span>
                </div>
            </div>

            <p className="text-gray-500 text-[11px] leading-relaxed mb-8 font-medium italic">
              {product.description}
            </p>

            {product.other_colors && product.other_colors.length > 0 && (
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark mb-5 flex items-center gap-2">
                  الألوان المتاحة <span className="w-1 h-1 bg-brand-gold rounded-full"></span>
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="relative group">
                    <div 
                      className="w-10 h-10 rounded-full border-2 border-brand-gold p-1 shadow-lg shadow-brand-gold/20"
                      style={{ backgroundColor: product.color_hex }}
                    >
                      <div className="w-full h-full rounded-full border border-white/20"></div>
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-tighter text-brand-gold whitespace-nowrap">Current</span>
                  </div>

                  {product.other_colors.map((variant) => (
                    <Link 
                      key={variant.id}
                      to={`/product/${variant.id}`}
                      className="w-10 h-10 rounded-full border border-gray-100 p-1 hover:border-brand-gold hover:scale-110 transition-all duration-300 group relative"
                      style={{ backgroundColor: variant.color_hex }}
                    >
                      <div className="w-full h-full rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-dark mb-5">المقاسات</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    disabled={v.stock === 0}
                    onClick={() => setSelectedVariant(v)}
                    className={`min-w-[60px] px-5 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all duration-500 border-2 ${
                      v.stock === 0 ? 'bg-gray-50 text-gray-200 border-gray-100 cursor-not-allowed' :
                      selectedVariant?.id === v.id 
                      ? 'border-brand-dark bg-brand-dark text-white shadow-xl' 
                      : 'border-gray-100 text-gray-400 hover:border-brand-gold'
                    }`}
                  >
                    {v.size_name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 mt-auto">
              <div className="flex items-center gap-6">
                <div className="flex items-center border-2 border-gray-100 rounded-2xl px-3 py-2 bg-gray-50/50">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="p-2 hover:text-brand-gold"><Minus className="w-4 h-4" /></button>
                  <span className="px-8 font-black text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)} className="p-2 hover:text-brand-gold"><Plus className="w-4 h-4" /></button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-dark text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-dark transition-all duration-700 shadow-2xl shadow-brand-dark/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" /> أضف إلى السلة
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-brand-gold mt-1" />
                  <div>
                    <span className="block text-[9px] font-black text-brand-dark uppercase tracking-widest">شحن سريع</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase italic">خلال 48 ساعة</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-gold mt-1" />
                  <div>
                    <span className="block text-[9px] font-black text-brand-dark uppercase tracking-widest">ضمان الجودة</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase italic">قطن بريميوم</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 border-t border-gray-100 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            <div className="lg:col-span-7">
              <h3 className="text-2xl font-bold text-brand-dark italic font-display uppercase tracking-tighter mb-12">آراء العملاء</h3>
              <div className="space-y-8">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 transition-all hover:shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-widest text-brand-dark mb-1">{rev.user_name}</span>
                          <div className="flex text-brand-gold">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[8px] text-gray-300 font-bold uppercase">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-500 text-[11px] leading-relaxed italic">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs italic tracking-widest uppercase">لا توجد تقييمات لهذا المنتج بعد.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-brand-dark rounded-[3rem] p-10 text-white sticky top-24">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 text-brand-gold">شاركنا تجربتك</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest mb-4 opacity-60">التقييم</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          onClick={() => setRating(star)}
                          className={`w-6 h-6 cursor-pointer transition-all ${star <= rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-600 hover:text-gray-400'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest mb-4 opacity-60">تعليقك</span>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-brand-gold transition-all min-h-[120px] placeholder:text-gray-600"
                      placeholder="كيف كانت جودة الخامة والمقاس؟"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-brand-gold text-brand-dark py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95"
                  >
                    إرسال التقييم
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;