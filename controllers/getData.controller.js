const { getAndReadXLS } = require("../modules/kma");
// const User = require("../models/users");

const getData = async (req, res) => {
  try {
    let { fullInfo } = await getAndReadXLS();
    res.status(200).json({ success: true, message: fullInfo });
  } catch (error) {
    // console.log(error);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = getData;
