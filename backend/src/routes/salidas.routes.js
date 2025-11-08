import { Router } from 'express';
import { getSalidas, getSalidaOptions, getSalidaById, createSalida, updateSalida, toggleSalidaStatus } from '../controllers/salidas.controller.js';

export const salidasRouter = Router();

// v1/salidas
salidasRouter.get('/', getSalidas);
salidasRouter.get('/options', getSalidaOptions);
salidasRouter.get('/:id', getSalidaById);
salidasRouter.post('/', createSalida);
salidasRouter.put('/:id', updateSalida);
salidasRouter.patch('/:id/toggle-status', toggleSalidaStatus);