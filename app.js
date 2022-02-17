const express = require('express');
const app = express();
const port = 3000;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('./database');
const session = require('express-session');


const server = app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})

app.set('view engine', 'pug');
app.set("viewa", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'bbq chips',
    resave: true,
    saveUninitialized: false
}));

//Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const postRoute = require('./routes/postRoutes');
const logoutRoute = require('./routes/logout');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
//API Routes
const postApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');

//when user acces $ page it will be handle by $
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/posts', middleware.requireLogin, postRoute);
app.use('/profile', middleware.requireLogin, profileRoute);
app.use('/uploads', uploadRoute);
app.use('/search', middleware.requireLogin, searchRoute);

app.use('/logout', logoutRoute);

app.use('/api/posts', postApiRoute);
app.use('/api/users', usersApiRoute);


app.get("/", middleware.requireLogin, (req, res, next) => {
    let payload = {
        pageTitle: "home",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
    }

    res.status(200).render("home", payload); 
});