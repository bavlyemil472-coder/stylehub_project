import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={product.image || 'https://via.placeholder.com/400x500'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
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
          <span className="text-brand-dark font-bold">{product.price} EGP</span>
          <Link 
            to={`/product/${product.id}`}
            className="text-brand-dark hover:text-brand-gold transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;