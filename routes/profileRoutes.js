const express = require('express');
const app = express();
const middleware = require('../middleware');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {

    let payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render("profilePage", payload); 
});

router.get("/:username", async (req, res, next) => {
    let payload = await getPayload(req.params.username, req.session.user);
    res.status(200).render("profilePage", payload); 
});

async function getPayload(username, userLoggedIn){
    let user =  await User.findOne({username: username})
    if(user == null){
        user =  await User.findById(username)
        if(user == null){
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJS: JSON.stringify(userLoggedIn),
            }
        }
    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJS: JSON.stringify(userLoggedIn),
        profileUser: user
    }

}


module.exports = router;