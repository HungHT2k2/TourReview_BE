import express from 'express'; 
import recipeController from '../controllers/recipeController.js';
import middlewareController from '../controllers/middlewareController.js';
import adminController from '../controllers/adminController.js';
const recipeRouter = express.Router();


recipeRouter.get("/search", recipeController.search);
recipeRouter.get('/myrecipe',middlewareController.verifyToken,recipeController.getRecipeByOwner)
recipeRouter.get('/',recipeController.getAllrecipe)
recipeRouter.get('/country',recipeController.getAllCountry)
recipeRouter.get('/common',recipeController.getAllCommon)
recipeRouter.post('/common',recipeController.createCommon)
recipeRouter.get('/recipe_favorite', recipeController.getFavorite)
recipeRouter.get('/recipe_new', recipeController.getNew)
recipeRouter.post('/changestatus/:id',middlewareController.verifyToken,adminController.updateRecipeStatus);
recipeRouter.get('/:id',recipeController.getrecipeByID)
recipeRouter.post('/',middlewareController.verifyToken,recipeController.createRecipe)
recipeRouter.put('/:id',recipeController.updateByID)
recipeRouter.delete('/:id',middlewareController.verifyToken,recipeController.deleteByID)



export default recipeRouter;