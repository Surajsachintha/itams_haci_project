const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// fetch device list
exports.MainDeviceList = (unitID, roleID, callback) =>{
    const qry = `SELECT * FROM view_device_list`;
    db.query(qry, (err, result)=>{
        callback(err, result);
    })
}

// INSERT Main Device
exports.InsertMainDevice = (data, userID, callback) => {
    const generatedUUID = uuidv4(); 

    const qry = `
        INSERT INTO dms_devices 
        (
            uuid, serial_number, asset_tag_number, qr_code_string,
            category_id, type_id, brand_id, model_id,
            specifications, parent_device_id, station_id,
            status, health_score, purchase_date, warranty_expire_date,
            purchase_value, vendor_id, user_id, created_at
        ) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, NOW())
    `;

    const values = [
        generatedUUID,
        data.serial_number,
        data.asset_tag_number,
        data.qr_code_string,
        data.category_id,
        data.type_id,
        data.brand_id,
        data.model_id,
        data.specifications,
        data.parent_device_id,
        data.station_id,
        data.status,
        data.health_score,
        data.purchase_date,
        data.warranty_expire_date,
        data.purchase_value,
        data.vendor_id,
        userID,
    ];

    db.query(qry, values, (err, result) => {
        const responseData = {
            message: "Device inserted successfully",
            uuid: generatedUUID,
            asset_tag_number: data.asset_tag_number
        };
        callback(err, responseData);
    });
};

// UPDATE
exports.UpdateMainDevice = (data, recodeID, userID, callback) => {
    const qry = `
        UPDATE dms_devices SET
            serial_number = ?, asset_tag_number = ?, qr_code_string = ?,
            category_id = ?, type_id = ?, brand_id = ?, model_id = ?,
            specifications = ?, parent_device_id = ?, station_id = ?,
            status = ?, health_score = ?, purchase_date = ?, warranty_expire_date = ?,
            purchase_value = ?, vendor_id = ?, user_id = ?, updated_at = NOW()
        WHERE id = ? AND is_delete = 0
    `;

    const values = [
        data.serial_number,
        data.asset_tag_number,
        data.qr_code_string,
        data.category_id,
        data.type_id,
        data.brand_id,
        data.model_id,
        data.specifications,
        data.parent_device_id,
        data.station_id,
        data.status,
        data.health_score,
        data.purchase_date,
        data.warranty_expire_date,
        data.purchase_value,
        data.vendor_id,
        userID,
        recodeID
    ];

    db.query(qry, values, callback);
};

// DELETE 
exports.DeleteMainDevice = (recodeID, userID, callback) => {
    const qry = `UPDATE dms_devices SET is_delete = 1, user_id = ?, updated_at = NOW() WHERE id = ?`;
    db.query(qry, [userID, recodeID], callback);
};

// Last Device Id fetch
exports.DeviceLastId = (callback) => {
    const qry = `SELECT id FROM dms_devices ORDER BY id DESC LIMIT 1`;
    db.query(qry, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result[0]);
    });
}
