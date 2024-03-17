import express from 'express'; 
import tourController from '../controllers/tourController.js';
import middlewareController from '../controllers/middlewareController.js';
import adminController from '../controllers/adminController.js';
const tourRouter = express.Router();


tourRouter.get("/search", tourController.search);
tourRouter.get('/mytour',middlewareController.verifyToken,tourController.getTourByOwner)
tourRouter.get('/',tourController.getAlltour)
tourRouter.get('/country',tourController.getAllCountry)
tourRouter.get('/common',tourController.getAllCommon)
tourRouter.post('/common',tourController.createCommon)
tourRouter.get('/tour_favorite', tourController.getFavorite)
tourRouter.get('/tour_new', tourController.getNew)
tourRouter.post('/changestatus/:id',middlewareController.verifyToken,adminController.updateTourStatus);
tourRouter.get('/:id',tourController.gettourByID)
tourRouter.post('/',middlewareController.verifyToken,tourController.createTour)
tourRouter.put('/:id',tourController.updateByID)
tourRouter.delete('/:id',middlewareController.verifyToken,tourController.deleteByID)



export default tourRouter;