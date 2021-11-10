const { login } = require("../modules/kma");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

const loginController = async (req, res) => {
  const { username, password } = req.body;
  // console.log(username, password);
  if (username && password) {
    try {
      let { success } = await login(username, password);

      //save username in db
      const newUser = new User({ username });
      newUser.save();

      //sign jwt
      const accessToken = jwt.sign(
        { user: username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // console.log(accessToken);
      return res
        .status(200)
        .json({ success: true, message: success.loginSuccess, accessToken });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Missing username and/or password" });
  }
};

module.exports = loginController;
