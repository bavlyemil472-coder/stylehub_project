import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, ArrowRight, ShieldCheck, Truck, Star, ChevronLeft } from 'lucide-react';
import { formatImageUrl } from '../utils/helpers';

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
    if (window.fbq && product) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'EGP'
      });
    }
  }, [product]);

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(res => {
        setProduct(res.data);
        setActiveImage(res.data.image);
        if (res.data.variants && res.data.variants.length > 0) {
          const firstAvailable = res.data.variants.find(v => Number(v.stock) > 0);
          setSelectedVariant(firstAvailable || res.data.variants[0]);
        }
      })
      .catch(() => toast.error("فشل في تحميل تفاصيل المنتج"));
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("يرجى اختيار المقاس أولاً");
      return;
    }
    if (Number(selectedVariant.stock) <= 0) {
      toast.error("عذراً، هذا المقاس غير متوفر حالياً");
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
          fontSize: '12px',
        },
        iconTheme: { primary: '#D4AF37', secondary: '#0B0B0B' },
      });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء الإضافة");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم");
      navigate('/login');
      return;
    }
    try {
      await api.post(`/products/${id}/add-review/`, { rating, comment });
      toast.success("تم إضافة تقييمك بنجاح");
      const res = await api.get(`/products/${id}/`);
      setProduct(res.data);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error("فشل إضافة التقييم");
    }
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate('/shop')} className="hover:text-brand-dark transition-colors">
            المنتجات
          </button>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-brand-dark truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* الصور — يمين */}
          <div className="space-y-4">
            {/* الصورة الرئيسية */}
            <div className="aspect-square overflow-hidden bg-gray-50">
              <img
                src={formatImageUrl(activeImage)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* الصور الصغيرة */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveImage(product.image)}
                className={`w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-brand-dark' : 'border-transparent opacity-60'}`}
              >
                <img src={formatImageUrl(product.image)} className="w-full h-full object-cover" alt="main" />
              </button>
              {product.p_images && product.p_images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-all ${activeImage === img.image ? 'border-brand-dark' : 'border-transparent opacity-60'}`}
                >
                  <img src={formatImageUrl(img.image)} className="w-full h-full object-cover" alt="gallery" />
                </button>
              ))}
            </div>
          </div>

          {/* التفاصيل — شمال */}
          <div className="flex flex-col gap-6">
            
            {/* اسم المنتج والسعر */}
            <div>
              <h1 className="text-2xl font-bold text-brand-dark mb-3 leading-snug">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-brand-gold">
                  {product.price} <span className="text-sm font-normal text-gray-400">EGP</span>
                </p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.average_rating || 5) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-400 mr-1">({product.review_count || 0})</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* الألوان */}
            {product.other_colors && product.other_colors.length > 0 && (
              <div>
                <p className="text-sm font-bold text-brand-dark mb-3">اللون</p>
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-brand-dark"
                      style={{ backgroundColor: product.color_hex }}
                    />
                  </div>
                  {product.other_colors.map((variant) => (
                    <Link
                      key={variant.id}
                      to={`/product/${variant.id}`}
                      className="w-8 h-8 rounded-full border border-gray-200 hover:border-brand-dark transition-all"
                      style={{ backgroundColor: variant.color_hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* المقاسات */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-brand-dark">المقاس</p>
                {selectedVariant && (
                  <span className="text-sm text-gray-400">— {selectedVariant.size_name}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => {
                  const isOutOfStock = Number(v.stock) <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && setSelectedVariant(v)}
                      className={`min-w-[52px] h-12 px-3 border text-sm font-medium transition-all relative
                        ${isOutOfStock 
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                          : selectedVariant?.id === v.id 
                            ? 'border-brand-dark bg-brand-dark text-white' 
                            : 'border-gray-200 text-brand-dark hover:border-brand-dark'
                        }`}
                    >
                      {isOutOfStock ? (
                        <span className="line-through opacity-50">{v.size_name}</span>
                      ) : v.size_name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* الكمية وزر الإضافة */}
            <div className="flex gap-3">
              <div className="flex items-center border border-gray-200">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-bold text-sm border-x border-gray-200">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)} 
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || Number(selectedVariant?.stock) <= 0}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                  ${(!selectedVariant || Number(selectedVariant?.stock) <= 0)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-dark text-white hover:bg-brand-gold hover:text-brand-dark'
                  }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {(!selectedVariant || Number(selectedVariant?.stock) <= 0) ? 'غير متوفر' : 'أضف إلى السلة'}
              </button>
            </div>

            {/* الوصف */}
            {product.description && (
              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-bold text-brand-dark mb-2">وصف المنتج</p>
                <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* الشحن والضمان */}
            <div className="border border-gray-100 p-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-brand-dark">شحن سريع</p>
                  <p className="text-xs text-gray-400">خلال 48 ساعة</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-brand-dark">ضمان الجودة</p>
                  <p className="text-xs text-gray-400">قطن بريميوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* التقييمات */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <h3 className="text-xl font-bold text-brand-dark mb-10">آراء العملاء ({product.review_count || 0})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* قائمة التقييمات */}
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-brand-dark">{rev.user_name}</p>
                        <div className="flex text-brand-gold mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-300">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
              )}
            </div>

            {/* فورم التقييم */}
            <div className="bg-gray-50 p-8">
              <h4 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-6">أضف تقييمك</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <p className="text-xs text-gray-400 mb-2">تقييمك</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => setRating(star)}
                        className={`w-6 h-6 cursor-pointer transition-all ${star <= rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">تعليقك</p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full border border-gray-200 p-3 text-sm outline-none focus:border-brand-dark transition-all min-h-[100px]"
                    placeholder="شاركنا رأيك..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-dark text-white py-3 text-sm font-bold uppercase tracking-wider hover:bg-brand-gold hover:text-brand-dark transition-all"
                >
                  إرسال التقييم
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
