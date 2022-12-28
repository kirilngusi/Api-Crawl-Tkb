var express = require('express');
var cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

require('dotenv').config();

var KMA_router = require('./routes/Post.router');

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4ts4p.mongodb.net/dataUsers?retryWrites=true&w=majority`,
            {
                // useNewUrlParser: true,
                useUnifiedTopology: true
                // useCreateIndex: true,
            }
        );
        console.log('DB Connected...');
    } catch (e) {
        console.log(e);
    }
};

connectDB();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/', KMA_router);

app.listen(process.env.PORT, () => {
    console.log(`Sever Connected with port: ${process.env.PORT}`);
});

module.exports = app;
