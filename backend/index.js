const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes');
const adminRoutes = require('./routes/adminRoute');

const app = express();

app.use(cors({
    credentials:true,
    origin: ['http://localhost:4200']
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api',routes);
app.use('/api/admin',adminRoutes);

app.use('/file',express.static('file'));

mongoose.connect('mongodb://127.0.0.1:27017/userManagmentAngular',{
    useNewUrlParser: true
}).then(()=>{
    console.log("connected to database");
});

app.listen(5000,()=>{
    console.log("Server is running on port 5000")
});