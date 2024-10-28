const express= require('express')
const app = express();
var cors = require('cors');
app.use(cors());
app.use(express.json());
const connecttoMongoDb = require('./db');
connecttoMongoDb();
app.use('/tasker/auth',require('./routes/auth'));



const PORT = 8080;
app.listen(PORT,()=>{
    console.log("Server connected!")
})