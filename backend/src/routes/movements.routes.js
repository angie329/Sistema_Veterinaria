import { Router } from 'express';
import { getMovements, getMovementById, updateMovement, createMovement, getMovementOptions } from '../controllers/movements.controller.js';

export const movementsRouter = Router();

// v1/movements
movementsRouter.get('/', getMovements);
movementsRouter.get('/options', getMovementOptions);
movementsRouter.get('/:id', getMovementById);
movementsRouter.post('/', createMovement);
movementsRouter.put('/:id', updateMovement);