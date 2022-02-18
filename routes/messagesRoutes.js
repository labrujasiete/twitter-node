const express = require('express');
const app = express();
const middleware = require('../middleware');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {
    let payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
    }
    res.status(200).render("inboxPage", payload); 
});

router.get("/new", (req, res, next) => {
    let payload = {
        pageTitle: "New message",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
    }
    res.status(200).render("newMessage", payload); 
});

module.exports = router;