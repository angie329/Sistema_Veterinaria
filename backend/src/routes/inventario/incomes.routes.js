import { Router } from 'express';
import { getIncomes, getIncomeOptions, getIncomeById, createIncome, updateIncome, toggleIncomeStatus } from '../../controllers/inventario/incomes.controller.js';

export const incomesRouter = Router();


// v1/incomes
incomesRouter.get('/', getIncomes);
incomesRouter.get('/options', getIncomeOptions);
incomesRouter.get('/:id', getIncomeById);
incomesRouter.post('/', createIncome);
incomesRouter.put('/:id', updateIncome);
incomesRouter.patch('/:id/toggle-status', toggleIncomeStatus);
