//auth user
const getData = async (req, res) => {
    try {
        res.status(200).json({ success: true });
    } catch (error) {
        // console.log(error);
        res.status(401).json({ success: false, message: "User not defined" });
    }
};

module.exports = getData;
