import user from './user.js';
import recipe from './recipe.js';
import comment from './comment.js';
import admin from './admin.js';

function router(app){
    app.use('/user',user);
    app.use('/recipe',recipe);
    app.use('/comment',comment);
    app.use('/admin',admin);
}

export default router;