const { login } = require('../modules/kma');
const User = require('../models/users');

const jwt = require('jsonwebtoken');

const loginController = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing username and/or password'
            });
        }
        let { schedule } = await login(username, password);

        const student_id = schedule.fullInfo.student_id;
        
        const findUser = await User.findOne({ username });

        if (!findUser) {
            const newUser = new User({ username });
            newUser.save();
        }

        //sign jwt
        const accessToken = jwt.sign(
            { user: username },
            process.env.ACCESS_TOKEN_SECRET
            // { expiresIn: "1h" }
        );

        if (student_id == username) {
            return res.status(200).json({
                success: true,
                message: schedule,
                accessToken
            });
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
};

module.exports = loginController;
