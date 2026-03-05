
export const formatImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300"; 

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    return `http://localhost:8000${url}`;
};