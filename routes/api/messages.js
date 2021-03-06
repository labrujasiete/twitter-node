//POST API ROUTES

const express = require('express');
const app = express();
//const middleware = require('../middleware');
const router = express.Router();
const bodyParser = require('body-parser');

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
const Notification = require('../../schemas/NotificationSchema');


app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async(req, res, next) => {
    if(!req.body.content || !req.body.chatId){
        console.log("Invalid data");
        return res.sendStatus(400);
    }
    
    let newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    }

    Message.create(newMessage)
    .then(async message => {

        /*
        https://mongoosejs.com/docs/migrating_to_6.html

        Migrating from 5.x to 6.x 

        Removed `execPopulate()`
        Document#populate() now returns a promise and is now no longer chainable.
        
        !!!   message = await message.populate("sender").execPopulate();   !!!
        */

        message = await message.populate("sender");
        message = await message.populate("chat");
        message = await User.populate(message, { path: "chat.users" });

        let chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        .catch(error => {
            console.log("is an errro: error #A002");
            console.log(error);
        })
        insertNotifications(chat, message);
        res.status(201).send(message);
    })
    .catch(error => {
        console.log("is an errro: error #A001");
        console.log(error);
        res.sendStatus(400)
    })
});

function insertNotifications(chat, message){

    chat.users.forEach(userId => {
        if(userId == message.sender._id.toString())return;
        Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
    });
}


module.exports = router;
    
