import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, toggleProductStatus } from '../controllers/products.controller.js';
import { getProductOptions } from "../controllers/options.controller.js";

export const productsRouter = Router();


// GET /v1/products 
productsRouter.get('/', getProducts);
productsRouter.get("/options", getProductOptions);
productsRouter.get('/:id', getProductById);
productsRouter.post('/', createProduct);
productsRouter.put('/:id', updateProduct);
productsRouter.patch('/:id/toggle-status', toggleProductStatus);
// router.delete('/:id', deleteProduct);
