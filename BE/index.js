const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const pr = require('dotenv').config();
const PORT = process.env.PORT || 7040;
const router = require('./router')

app.use(cors());
app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use('/', router)

app.listen(PORT, ()=>{
    console.log(`The listening port is ${PORT}`);
})
