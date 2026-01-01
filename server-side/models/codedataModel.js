const db = require('../config/db');

// fetch user credentils
exports.MainCodeData = (table, callback) =>{
    const qry = `SELECT * FROM ${table}`;
    db.query(qry, (err, result)=>{
        callback(err, result);
    })
}

// fetch stations list
exports.StationCodeData = (callback) =>{
    const qry = `SELECT * FROM code_stations ORDER BY station_name`;
    db.query(qry, (err, result)=>{
        callback(err, result);
    })
}

// code device type list
exports.DeviceTypeList = (CategoryID, callback) =>{
    const qry = `SELECT id, device_short_name, device_name FROM code_device_types WHERE category_id = ?`;
    db.query(qry, [CategoryID], (err, result)=>{
        callback(err, result);
    })
}

// code device modal list
exports.ModalList = (TypeID, BrandID, callback) =>{
    const qry = `SELECT id, model_name FROM code_models WHERE device_types_id = ? AND brand_id = ?`;
    db.query(qry, [TypeID, BrandID,], (err, result)=>{
        callback(err, result);
    })
}


exports.EditCodeTable = (CodeTB, callback) => {
    const qry = `SELECT * FROM dms_codedata_editing WHERE table_name = ? AND auto_tab != 1`;
    db.query(qry, [CodeTB], (err, result)=>{
        callback(err, result);
    })
}

// code table data fetch
exports.CodeTableDataFetch = (code_id, code_name, codetable_name, callback) =>{
    const qry = `SELECT ${code_id}, ${code_name} FROM ${codetable_name}`;
    db.query(qry, (err, result)=>{
        callback(err, result);
    })
}

exports.DynamicInsert = (table_name, data, callback) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const columns = keys.join(', ');
    
    const placeholders = keys.map(() => '?').join(', ');

    const qry = `INSERT INTO ${table_name} (${columns}) VALUES (${placeholders})`;

    db.query(qry, values, (err, result) => {
        callback(err, result);
    });
}

exports.DynamicUpdate = (table_name, id, data, callback) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map(key => `${key} = ?`).join(', ');

    values.push(id);

    const qry = `UPDATE ${table_name} SET ${setClause} WHERE id = ?`;

    db.query(qry, values, (err, result) => {
        callback(err, result);
    });
}

exports.DynamicDelete = (table_name, id, callback) => {
    const qry = `DELETE FROM ${table_name} WHERE id = ?`;

    db.query(qry, [id], (err, result) => {
        callback(err, result);
    });
}