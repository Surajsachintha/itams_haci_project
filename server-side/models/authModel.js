const db = require('../config/db');

// fetch user credentils
exports.loginUser = (username, fcmToken, callback) =>{
    const login = `SELECT * FROM dms_users WHERE username = ? AND status = 1`;
    db.query(login, [username], (err, result)=>{
        callback(err, result[0]);
    })
}

// update fcm token
exports.updateFcmToken = (userId, token, callback) => {
    const query = `UPDATE dms_users SET fcm_token = ? WHERE id = ?`;
    db.query(query, [token, userId], (err, result) => {
        if (callback) callback(err, result);
    });
};

// update password model
exports.updatePassword = (username, hashedPassword, callback) => {
    const sql = `UPDATE dms_users SET password = ? WHERE username = ? AND status = 1`;
    db.query(sql, [hashedPassword, username], (err, result) => {
        if (err) return callback(err, null);
        if (result.affectedRows === 0) {
            return callback("User not found or inactive", null);
        }
        callback(null, "Password updated successfully");
    });
};

//SetNewPassword
exports.setNewPassword = (username, hashedPassword, callback) => {
    const sql = `UPDATE dms_users SET password = ? WHERE username = ? AND status = 1`;
    db.query(sql, [hashedPassword, username], (err, result) => {
        if (err) return callback(err, null);
        if (result.affectedRows === 0) {
            return callback("User not found or inactive", null);
        }
        callback(null, "Password set successfully");
    });
}
// Forgot Password - get user by username
exports.forgotPassword = (username, callback) => {
    const sql = `SELECT * FROM dms_users WHERE username = ? AND status = 1`;
    db.query(sql, [username], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result[0]);
    });
}

// VIEW User List
exports.userListView = (callback) =>{
    const qry = `SELECT * FROM view_users_list`;
    db.query(qry, (err, result)=>{
        callback(err, result);
    })
}

// INSERT User
exports.userInsert = (Data, callback) =>{
    const qry = `INSERT INTO dms_users (username, rank_id, reg_no, full_name, contact_number, email, unit_id, role, create_date) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const params = [
        Data.username,
        Data.rank_id,
        Data.reg_no,
        Data.full_name,
        Data.contact_number,
        Data.email,
        Data.unit_id,
        Data.role
    ];

    db.query(qry, params, (err, result)=>{
        callback(err, result);
    })
}

// UPDATE User
exports.userUpdate = (Data, UserID, callback) =>{
    const qry = `UPDATE dms_users SET username = ?, rank_id = ?, reg_no = ?, full_name = ?, contact_number = ?, email = ?, unit_id = ?, role = ?, status = ?, update_date = NOW() WHERE id = ?`;
    const params = [
        Data.username,
        Data.rank_id,
        Data.reg_no,
        Data.full_name,
        Data.contact_number,
        Data.email,
        Data.unit_id,
        Data.role,
        Data.status,
        UserID
    ];   
    db.query(qry, params, (err, result)=>{
        callback(err, result);
    })
}

// ACTIVE User
exports.userStatusUpdate = (Status, userID ,callback) =>{
    const qry = `UPDATE dms_users SET status = ? WHERE id = ?`;
    db.query(qry, [Status, userID], (err, result)=>{
        callback(err, result);
    })
}