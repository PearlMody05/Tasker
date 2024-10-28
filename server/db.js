const mongoose = require('mongoose')

const connectToMongoDb = ()=> {
    mongoose.connect("mongodb+srv://PearlMody:freshoutofSlammer@tasker.7vj9s.mongodb.net/?retryWrites=true&w=majority&appName=tasker")
    .then(()=>{
        console.log("Connected to database");
    })
    .catch(()=>{
        console.log("Oops there was some error");
    });
}

module.exports = connectToMongoDb; //this exports the function and u can use it in any file to connect to database