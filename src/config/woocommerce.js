import dotenv from 'dotenv';
dotenv.config();

export const woocommerceConfig = {
    url: process.env.WOOCOMMERCE_URL,
    key: process.env.WOOCOMMERCE_KEY,
    secret: process.env.WOOCOMMERCE_SECRET,
};
