import express from 'express';
import { getDashboardStats, getUsers, getUserDetails } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);

export default router;