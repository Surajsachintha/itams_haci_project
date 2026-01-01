const dmsModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../functions/mailer');
const { sendResponse } = require('../utils/responseHandler');
const {fetchStationIdForUnit} = require('../functions/Functions');

exports.login = (req, res) => {
    const {username , password, fcmToken } = req.body;

    dmsModel.loginUser(username, fcmToken, async (err, result)=>{
        if (err || !result) return res.status(401).json({ message: 'Invalid credentials' });

        const valid = bcrypt.compareSync(password, result.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        if (fcmToken) {
            dmsModel.updateFcmToken(result.id, fcmToken, (updateErr) => {
                if (updateErr) console.error("Failed to update FCM token", updateErr);
            });
        }

        const token = jwt.sign({id: result.id, username: result.username, name: result.full_name, role: result.role, unit: result.unit_id}, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    })
}

exports.updatePassword = (req, res) => {
    const { username, password } = req.body;
    
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: "Error hashing password" });

        dmsModel.updatePassword(username, hashedPassword, (err, message) => {
            if (err) return res.status(400).json({ message: err });
            res.status(200).json({ message: message });
        });
    });
};

// View user List
exports.userListView = async (req, res) => {
  const role = req.user.role;
  const unit = req.user.unit;

  const stations = await  fetchStationIdForUnit(unit)

  dmsModel.userListView((err, result) => {
        sendResponse(res, err, result);
  });
}

// INSERT User
exports.userInsert = (req, res) => {
    const userData = req.body;

    dmsModel.userInsert(userData, async (err, result) => {
        if (err) {
            return sendResponse(res, err, null);
        }
        const newUserId = result.insertId || result.id; 

        try {
            const payload = {
                id: newUserId,
                email: userData.email,
                username: userData.username,
                scope: 'account_setup'
            };
            const setupToken = jwt.sign(
                payload, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );

            const setupLink = `${process.env.FRONTEND_URL || 'https://ams.ceyloniq.lk'}/set-password?token=${setupToken}`;

            const htmlBody = `
                <h3>Welcome to the IT Asset Management System</h3>
                <p>Hello ${userData.full_name || userData.username},</p>
                <p>Your account has been created. Please click the link below to set your password:</p>
                <a href="${setupLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Set Password</a>
                <p>Or copy this link: ${setupLink}</p>
                <p>This link will expire in 24 hours.</p>
            `;

            await sendEmail(
                userData.email,
                'Account Setup - IT Division', 
                `Please set your password here: ${setupLink}`, 
                htmlBody                 
            );

            console.log(`Setup email sent to ${userData.email}`);

        } catch (emailError) {
            console.error("Failed to send setup email:", emailError);
        }

        sendResponse(res, null, result);
    });
}

// UPDATE User
exports.userUpdate = (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    dmsModel.userUpdate(userData, userId, (err, result) => {
        sendResponse(res, err, result);
    });
}

// Active/Deactivate User  
exports.userStatusUpdate = (req, res) => {
    const userId = req.params.id;
    const status = req.body.status;
    dmsModel.userStatusUpdate(status, userId,(err, result) => {
        sendResponse(res, err, result);
    });
}

// Set New Password
exports.userSetNewPassword = (req, res) => {
    const { token, password } = req.body;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(400).json({ message: 'Invalid or expired token' });
        if (decoded.scope !== 'account_setup') return res.status(400).json({ message: 'Invalid token scope' });
        const username = decoded.username;

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: "Error hashing password" });
            dmsModel.setNewPassword(username, hashedPassword, (err, message) => {
                if (err) return res.status(400).json({ message: err });
                res.status(200).json({ message: 'Password set successfully' });
            });
        });
    });
}

//Forgot Password
exports.userForgotPassword = (req, res) => {
    const { username } = req.body;
    dmsModel.forgotPassword(username, (err, user) => {
        if (err || !user) return res.status(404).json({ message: 'User not found' });
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            scope: 'password_reset'
        };
        const resetToken = jwt.sign(   
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );
        const resetLink = `${process.env.FRONTEND_URL || 'https://ams.ceyloniq.lk'}/set-password?token=${resetToken}`;

        const htmlBody = ` 
            <h3>Password Reset Request</h3>
            <p>Hello ${user.full_name || user.username},</p>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or copy this link: ${resetLink}</p>
            <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        `;
        sendEmail(
            user.email,
            'Password Reset - IT Division',
            `Reset your password here: ${resetLink}`,
            htmlBody
        ).then(() => {
            res.status(200).json({ message: 'Password reset email sent', email: user.email });
        }).catch((emailError) => {
            console.error("Failed to send password reset email:", emailError);
            res.status(500).json({ message: 'Failed to send password reset email' });
        });
    });
}





exports.testData = async (req, res) => {
  const role = req.user.role;
  const unit = req.user.unit;

  const stations = await  fetchStationIdForUnit(unit)

   res.status(200).json({ role: role, unit: unit, stations: stations });
}