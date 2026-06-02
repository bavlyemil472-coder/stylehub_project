import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { formatImageUrl } from '../utils/helpers';

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden">
        <img
          src={formatImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500'; }}
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />

        {/* ✅ Badge الخصم */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-1 z-10">
            -{product.discount}%
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-1">
          {product.category?.name || "New Collection"}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-brand-dark font-medium text-lg hover:text-brand-gold transition-colors mb-2 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between border-t pt-3">
          {/* ✅ السعر مع الخصم */}
          <div className="flex flex-col">
            <span className="text-brand-dark font-bold">
              {product.price} <span className="text-[10px] ml-0.5">EGP</span>
            </span>
            {product.original_price && (
              <span className="text-[11px] text-gray-400 line-through">
                {product.original_price} EGP
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.id}`}
            className="text-brand-dark hover:text-brand-gold transition-colors flex items-center gap-2 group/btn"
          >
            <span className="text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover/btn:opacity-100 transition-opacity">View</span>
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
