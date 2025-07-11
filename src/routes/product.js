import express from 'express';
import { createProduct, getMyProducts, getProduct, updateProduct, deleteProduct } from '../controllers/product.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// CRUD routes
router.post('/', upload.single('image'), authMiddleware, createProduct);
router.get('/mine', authMiddleware, getMyProducts);
router.get('/:id', authMiddleware, getProduct);
router.put('/:id', upload.single('image'), authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
