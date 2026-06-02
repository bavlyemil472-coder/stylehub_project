import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, ShieldCheck, Truck, Star, X, ZoomIn } from 'lucide-react';
import { formatImageUrl } from '../utils/helpers';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef(null);
  const autoPlayRef = useRef(null);

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
        setActiveIndex(0);
        if (res.data.variants && res.data.variants.length > 0) {
          const firstAvailable = res.data.variants.find(v => Number(v.stock) > 0);
          setSelectedVariant(firstAvailable || res.data.variants[0]);
        }
      })
      .catch(() => toast.error("فشل في تحميل تفاصيل المنتج"));
  }, [id]);

  const getAllImages = () => {
    if (!product) return [];
    const imgs = [{ url: product.image }];
    if (product.p_images) {
      product.p_images.forEach(img => imgs.push({ url: img.image }));
    }
    return imgs;
  };

  const allImages = getAllImages();

  useEffect(() => {
    if (allImages.length <= 1 || lightbox) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex(i => (i === allImages.length - 1 ? 0 : i + 1));
    }, 3000);
    return () => clearInterval(autoPlayRef.current);
  }, [allImages.length, lightbox, product]);

  const prevImage = () => {
    clearInterval(autoPlayRef.current);
    setActiveIndex(i => (i === 0 ? allImages.length - 1 : i - 1));
  };

  const nextImage = () => {
    clearInterval(autoPlayRef.current);
    setActiveIndex(i => (i === allImages.length - 1 ? 0 : i + 1));
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
    touchStartX.current = null;
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) { toast.error("يرجى اختيار المقاس أولاً"); return; }
    if (Number(selectedVariant.stock) <= 0) { toast.error("هذا المقاس غير متوفر حالياً"); return; }
    try {
      await api.post('/cart/add/', { variant_id: selectedVariant.id, quantity });
      toast.success(`${product.name} أضيف إلى سلتك`, {
        style: { border: '1px solid #D4AF37', padding: '12px', color: '#FFF', background: '#0B0B0B', fontSize: '13px' },
        iconTheme: { primary: '#D4AF37', secondary: '#0B0B0B' },
      });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء الإضافة");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-white" dir="rtl">

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-brand-gold transition-colors z-10" onClick={() => setLightbox(false)}>
            <X className="w-8 h-8" />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 w-12 h-12 flex items-center justify-center transition-all rounded-full"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 w-12 h-12 flex items-center justify-center transition-all rounded-full"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          <img
            src={formatImageUrl(allImages[activeIndex]?.url)}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      <div className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate('/shop')} className="hover:text-brand-dark transition-colors">المنتجات</button>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-brand-dark font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ===== قسم الصور ===== */}
          <div className="space-y-3">
            <div
              className="relative overflow-hidden bg-gray-50 aspect-[3/4] cursor-zoom-in group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setLightbox(true)}
            >
              <img
                src={formatImageUrl(allImages[activeIndex]?.url)}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />

              {/* ✅ Badge الخصم */}
              {product.discount > 0 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 z-10 shadow-md">
                  -{product.discount}%
                </div>
              )}

              <div className="absolute top-3 left-3 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-brand-dark" />
              </div>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 flex items-center justify-center shadow-md transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-brand-dark" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 flex items-center justify-center shadow-md transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-brand-dark" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                        className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-brand-gold w-5' : 'bg-white/60 w-2'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-all ${i === activeIndex ? 'border-brand-dark' : 'border-transparent opacity-50 hover:opacity-80'}`}
                  >
                    <img src={formatImageUrl(img.url)} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== قسم التفاصيل ===== */}
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark mb-3 leading-snug">{product.name}</h1>

              {/* ✅ السعر مع الخصم */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-bold text-brand-gold">
                    {product.price} <span className="text-sm font-normal text-gray-400">EGP</span>
                  </p>
                  {/* السعر الأصلي مشطوب */}
                  {product.original_price && (
                    <p className="text-base text-gray-400 line-through">
                      {product.original_price} EGP
                    </p>
                  )}
                  {/* بادج نسبة الخصم جنب السعر */}
                  {product.discount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5">
                      وفّر {product.discount}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.average_rating || 5) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-400 mr-1">({product.review_count || 0})</span>
                </div>
              </div>

              {product.total_sold > 0 && (
                <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                  🛍️ تم بيع
                  <span className="font-bold text-brand-dark">{product.total_sold}</span>
                  قطعة
                </p>
              )}
            </div>

            <hr className="border-gray-100" />

            {product.other_colors && product.other_colors.length > 0 && (
              <div>
                <p className="text-sm font-bold text-brand-dark mb-3">اللون</p>
                <div className="flex flex-wrap gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-dark" style={{ backgroundColor: product.color_hex }} />
                  {product.other_colors.map((variant) => (
                    <Link key={variant.id} to={`/product/${variant.id}`}
                      className="w-8 h-8 rounded-full border border-gray-200 hover:border-brand-dark transition-all"
                      style={{ backgroundColor: variant.color_hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-brand-dark">المقاس</p>
                {selectedVariant && <span className="text-sm text-gray-400">المختار: {selectedVariant.size_name}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => {
                  const isOutOfStock = Number(v.stock) <= 0;
                  return (
                    <button key={v.id} type="button" disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && setSelectedVariant(v)}
                      className={`min-w-[52px] h-12 px-3 border text-sm font-medium transition-all
                        ${isOutOfStock
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : selectedVariant?.id === v.id
                            ? 'border-brand-dark bg-brand-dark text-white'
                            : 'border-gray-200 text-brand-dark hover:border-brand-dark'
                        }`}
                    >
                      {v.size_name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center border border-gray-200">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-gray-50 text-lg">−</button>
                <span className="px-6 py-3 font-bold text-base border-x border-gray-200">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 hover:bg-gray-50 text-lg">+</button>
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

            {product.description && (
              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm font-bold text-brand-dark mb-2">وصف المنتج</p>
                <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="border border-gray-100 p-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand-dark">شحن سريع</p>
                  <p className="text-xs text-gray-400">خلال 48 ساعة</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand-dark">ضمان الجودة</p>
                  <p className="text-xs text-gray-400">قطن بريميوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== التقييمات ===== */}
        <div className="mt-16 border-t border-gray-100 pt-12">
          <h3 className="text-xl font-bold text-brand-dark mb-8">آراء العملاء ({product.review_count || 0})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-brand-dark">{rev.user_name || 'زائر'}</p>
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

            <div className="bg-gray-50 p-8">
              <h4 className="text-base font-bold text-brand-dark mb-6">أضف تقييمك</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <p className="text-sm text-gray-400 mb-2">تقييمك</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} onClick={() => setRating(star)}
                        className={`w-7 h-7 cursor-pointer transition-all ${star <= rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">تعليقك</p>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} required
                    className="w-full border border-gray-200 p-3 text-sm outline-none focus:border-brand-dark transition-all min-h-[100px]"
                    placeholder="شاركنا رأيك..."
                  />
                </div>
                <button type="submit"
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
