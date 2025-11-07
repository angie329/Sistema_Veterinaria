import { Router } from 'express';
import { getMovements, getMovementById, updateMovement } from '../controllers/movements.controller.js';

export const movementsRouter = Router();

// v1/movements
movementsRouter.get('/', getMovements);
movementsRouter.get('/:id', getMovementById);
movementsRouter.put('/:id', updateMovement);