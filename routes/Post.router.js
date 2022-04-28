const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require("cors");

const loginController = require("../controllers/Login.controller");
const getDataController = require("../controllers/getData.controller");
const verifyToken = require("../middleware/authUser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.all("*", cors());

router.get("/", verifyToken, getDataController);
router.post("/login", loginController);

module.exports = router;
