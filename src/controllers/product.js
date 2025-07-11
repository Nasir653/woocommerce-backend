import Product from '../models/product.js';
import { createWooProduct, getWooProduct, updateWooProduct, deleteWooProduct } from '../services/woocommerce.js';
import { v2 as cloudinary } from 'cloudinary';
export const createProduct = async (req, res, next) => {
    try {
        const { name, description, price } = req.body;
        const userId = req.user.id;
        const imageUrl = await cloudinary.uploader.upload(req.file.path, {
            folder: 'dply_uploads',
        });

        const product = await Product.create({ name, description, price, imageUrl: imageUrl.secure_url, userId });

        try {
            const wooProduct = await createWooProduct(product);
            product.status = 'Synced to WooCommerce';
            product.wooProductId = wooProduct.id;
            await product.save();
        } catch (err) {
            product.status = 'Sync Failed';
            await product.save();
            console.log('WooCommerce sync failed:', {
                error: err.message,
                productId: product.id,
            });
        }

        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

// Get a single product (local DB and WooCommerce)
export const getProduct = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const product = await Product.findOne({ where: { id, userId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        let wooProduct = null;
        if (product.wooProductId) {
            try {
                wooProduct = await getWooProduct(product.wooProductId);
            } catch (err) {
                wooProduct = { error: 'Not found in WooCommerce' };
            }
        }
        res.json({ product, wooProduct });
    } catch (err) {
        next(err);
    }
};

// Update a product (local DB and WooCommerce)
export const updateProduct = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const product = await Product.findOne({ where: { id, userId } });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, description, price } = req.body;
        if (req.file) {
            const uploaded = await cloudinary.uploader.upload(req.file.path, {
                folder: 'dply_uploads',
            });
            product.imageUrl = uploaded.secure_url;
        }
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;

        await product.save();

        let wooResult = null;

        if (product.wooProductId) {
            try {
                wooResult = await updateWooProduct(product.wooProductId, {
                    name: product.name,
                    description: product.description,
                    regular_price: product.price.toString(),
                    images: product.imageUrl ? [{ src: product.imageUrl }] : [],
                });
                product.status = 'Updated in WooCommerce';
                await product.save();
            } catch (err) {
                product.status = 'WooCommerce Update Failed';
                await product.save();
            }
        }

        res.json({ product, wooResult });
    } catch (err) {
        next(err);
    }
};

// Delete a product (local DB and WooCommerce)
export const deleteProduct = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const product = await Product.findOne({ where: { id, userId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        let wooResult = null;
        if (product.wooProductId) {
            try {
                wooResult = await deleteWooProduct(product.wooProductId);
            } catch (err) {
                wooResult = { error: 'WooCommerce delete failed' };
            }
        }
        await product.destroy();
        res.json({ message: 'Product deleted', wooResult });
    } catch (err) {
        next(err);
    }
};

export const getMyProducts = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const products = await Product.findAll({ where: { userId } });
        res.json(products);
    } catch (err) {
        next(err);
    }
};