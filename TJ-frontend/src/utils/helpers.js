export const formatImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    
    // ✅ حول http لـ https
    if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }
    
    // ✅ ضغط تلقائي لصور Cloudinary
    if (url.includes('cloudinary.com')) {
        url = url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
    }
    
    if (url.startsWith('https://')) {
        return url;
    }
    
    return `https://tresjolie-shop.com${url}`;
};
