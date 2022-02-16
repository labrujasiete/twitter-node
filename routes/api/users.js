//POST API ROUTES

const express = require('express');
const app = express();
//const middleware = require('../middleware');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.put("/:userId/follow", async(req, res, next) => {
    let userId = req.params.userId
    let user = await User.findById(userId)
    if(user == null){
        return res.sendStatus(404)
    }
    let isFollowing = user.followers && user.followers.includes(req.session.user._id)
    let option = isFollowing ? "$pull" : "$addToSet";

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId} }, {new: true})
    .catch((err)=>{
        console.log(err);
        res.sendStatus(400);
    })

    User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id} })
    .catch((err)=>{
        console.log(err);
        res.sendStatus(400);
    })

    res.status(200).send(req.session.user)
});

router.get("/:userId/following", async(req, res, next) => {
    User.findById(req.params.userId)
    .populate("following")
    .then(results => {
        res.status(200).send(results)
    })
    .catch(error => {
        console.log(error => {
            console.log(error);
            res.sendStatus(400)
        });
    })
});

router.get("/:userId/followers", async(req, res, next) => {
    User.findById(req.params.userId)
    .populate("followers")
    .then(results => {
        res.status(200).send(results)
    })
    .catch(error => {
        console.log(error => {
            console.log(error);
            res.sendStatus(400)
        });
    })
});


router.post("/profilePicture", upload.single("croppedImage"), async(req, res, next) => {
    if(!req.file){
        console.log("n/a");
        return res.sendStatus(400);
    }
    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path;
    let targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath,async error => {
        if(error != null){
            console.log("BRUJA>>>>");
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true })
        res.sendStatus(204)

    })

});

router.post("/coverPhoto", upload.single("croppedImage"), async(req, res, next) => {
    if(!req.file){
        console.log("n/a");
        return res.sendStatus(400);
    }
    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path;
    let targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath,async error => {
        if(error != null){
            console.log("BRUJA>>>>");
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true })
        res.sendStatus(204)

    })

});




module.exports = router;
    
