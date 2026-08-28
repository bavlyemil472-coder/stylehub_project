export const formatImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";

    // ✅ حول http لـ https
    if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }

    // ✅ الباك اند بقى بيضيف تعديلات الصورة (الضغط والجودة) بنفسه في الرابط
    // فمفيش داعي نضيفها تاني هنا، عشان منعملش رابط فيه تعديلات مكررة فوق بعض

    if (url.startsWith('https://')) {
        return url;
    }

    return `https://tresjolie-shop.com${url}`;
};
