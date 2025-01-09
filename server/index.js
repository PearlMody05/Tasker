const express= require('express')
const app = express();
var cors = require('cors');
app.use(cors());
app.use(express.json());
const connecttoMongoDb = require('./db');
connecttoMongoDb();
const fetchUser = require('./middleware/fetchUser')

app.use('/tasker/auth',require('./routes/auth'));
app.use('/tasker/teams',fetchUser,require('./routes/Team'));
app.use('/tasker/tasks',fetchUser,require('./routes/Tasks'));
app.use('/tasker/checklist',fetchUser,require('./routes/Checklist'));
app.use('/tasker/comment',fetchUser,require('./routes/Comments'));

const PORT = 8080;
app.listen(PORT,()=>{
    console.log("Server connected!")
})