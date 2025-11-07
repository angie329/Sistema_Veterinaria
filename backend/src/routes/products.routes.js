import { Router } from 'express';
import { getProducts } from '../controllers/products.controller.js';

export const productsRouter = Router();


// GET /v1/products 
productsRouter.get('/', getProducts);


// router.post('/', createProduct);
// router.get('/:id', getProductById);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);


