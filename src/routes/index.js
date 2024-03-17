import user from './user.js';
import tour from './tour.js';
import comment from './comment.js';
import admin from './admin.js';

function router(app){
    app.use('/user',user);
    app.use('/tour',tour);
    app.use('/comment',comment);
    app.use('/admin',admin);
}

export default router;