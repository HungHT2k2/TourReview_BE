import express from 'express'; 
const adminRouter = express.Router();
import adminController from '../controllers/adminController.js';
import middlewareController from '../controllers/middlewareController.js';

adminRouter.get('/user',middlewareController.verifyAdmin,adminController.getUsers);
adminRouter.get('/tour',middlewareController.verifyAdmin,adminController.getTours);
adminRouter.get('/dashboard',middlewareController.verifyAdmin,adminController.dashboardDetail);
adminRouter.post('/tour/:id',middlewareController.verifyAdmin,adminController.updateTourStatus);

export default adminRouter;