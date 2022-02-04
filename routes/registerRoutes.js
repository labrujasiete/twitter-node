const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');

app.set('view engine', 'pug');
app.set("viewa", "views");
app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    res.status(200).render("register");
});

router.post("/", async(req, res, next) => {

    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password){
        let user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .catch((err)=>{
            console.log(`error message from db: ${err}`);
            payload.errorMessage = "DB Error.";        
        res.status(200).render("register", payload);
        })

        if(user == null){
            //No user found
            let data = req.body;

            data.password = await bcrypt.hash(password, 10);

            User.create(data)
            .then((user) => {
                req.session.user = user;
                return res.redirect("/");
            })
        }else{
            //User found
            if(email == user.email){
                payload.errorMessage = "Email already in use";
            }else{
                payload.errorMessage = "Username already in use";
            }
            res.status(200).render("register", payload);
        }
        
    }else{
        payload.errorMessage = "Please check your information.";        
        res.status(200).render("register", payload);
    }

    
});

module.exports = router;