var express = require("express");
var cookieParser = require("cookie-parser");
var KMA_router = require("./routes/Post.router");
const mongoose = require("mongoose");
var cors = require("cors");

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4ts4p.mongodb.net/dataUsers?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("DB Connected...");
  } catch (e) {
    console.log(e);
  }
};

connectDB();

app.use("/", KMA_router);
app.use(cors());

app.listen(process.env.PORT, () => {
  console.log("Sever Connected...");
});

module.exports = app;
