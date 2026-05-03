export const convertCurrency = (price: number) => {
    return Number(price).toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
};

export const calculateDiscountPrice = (price: number, discountPercentage: number) => {
    return Number(price) * Number(discountPercentage) / 100;
};

export const calculateCheckoutTotalPrice = (subtotal: number, shippingFee: number, discountPercentage: number) => {
    return Number(subtotal) + Number(shippingFee) - calculateDiscountPrice(subtotal, discountPercentage);
};