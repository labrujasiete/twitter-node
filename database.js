const mongoose = require("mongoose");

class Database {

    constructor(){
        this.connect();
    }

    connect(){
        mongoose.connect("mongodb+srv://bruja:Khamino7@twitterdb.jzf6e.mongodb.net/twitterDB?retryWrites=true&w=majority")
        .then(() => {
            console.log('MongoDB connection successful');
        })
        .catch((err) => {
            console.log('Data connection error mmesage: ' + err);
        })

    }

}

module.exports = new Database();