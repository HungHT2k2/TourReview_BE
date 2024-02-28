import express from 'express';
import commentController from '../controllers/commentController.js';
import middlewareController from '../controllers/middlewareController.js';
const commentRouter = express.Router();

commentRouter.post('/',middlewareController.verifyToken,commentController.createComment)
commentRouter.get('/:recipeId',commentController.getCommentsForRecipe)
commentRouter.delete('/:commentId', middlewareController.verifyToken, commentController.deleteComment);
commentRouter.put('/:commentId', middlewareController.verifyToken, commentController.editComment);
commentRouter.post('/:commentId/report', middlewareController.verifyToken, commentController.reportComment);


export default commentRouter;