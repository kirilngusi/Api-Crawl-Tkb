const User = require('../models/users');

//auth user
const getData = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.userId });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not defined'
            });
        }
        res.status(200).json({ success: true, student_id: req.userId });
    } catch (error) {
        // console.log(error);
        res.status(401).json({ success: false, message: 'User not defined' });
    }
};

module.exports = getData;
