import axios from 'axios';
import { woocommerceConfig } from '../config/woocommerce.js';


// Helper for retry logic and error handling
async function wooRequest(method, endpoint, data = null, params = null) {
    const { url, key, secret } = woocommerceConfig;
    const fullUrl = `${url}/wp-json/wc/v3${endpoint}`;
    const auth = { username: key, password: secret };
    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;
    while (attempt < maxRetries) {
        try {
            const response = await axios({
                method,
                url: fullUrl,
                auth,
                data,
                params,
            });
            return response.data;
        } catch (error) {
            attempt++;
            lastError = error;
            if (error.response) {
                const status = error.response.status;
                if (status >= 500 && status < 600 && attempt < maxRetries) {
                    await new Promise(res => setTimeout(res, 1000 * attempt));
                    continue;
                }
                if (status >= 400 && status < 500) {
                    throw new Error(`WooCommerce API error (${status}): ${error.response.data.message || 'Request failed.'}`);
                }
            } else if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
                if (attempt < maxRetries) {
                    await new Promise(res => setTimeout(res, 1000 * attempt));
                    continue;
                }
            }
            break;
        }
    }
    throw new Error(`Failed WooCommerce request after ${maxRetries} attempts. ${lastError?.message || ''}`);
}

// CREATE product
export const createWooProduct = async (product) => {
    const wooProduct = {
        name: product.name,
        type: 'simple',
        regular_price: product.price.toString(),
        description: product.description,
        images: product.imageUrl ? [{ src: product.imageUrl }] : [],
    };
    return wooRequest('post', '/products', wooProduct);
};

// READ product by ID
export const getWooProduct = async (productId) => {
    return wooRequest('get', `/products/${productId}`);
};

// UPDATE product by ID
export const updateWooProduct = async (productId, updates) => {
    return wooRequest('put', `/products/${productId}`, updates);
};

// DELETE product by ID
export const deleteWooProduct = async (productId, force = true) => {
    // force=true will permanently delete, not just move to trash
    return wooRequest('delete', `/products/${productId}`, null, { force });
};