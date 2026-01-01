const db = require('../config/db');

// fetch all computers
exports.MainComputerList = (callback) =>{
    const qry = `SELECT * FROM view_computer_devices`;
    db.query(qry, (err, result)=>{
        callback(err, result);
    })
}

// Insert computer spec
exports.InsertComputerSpec = (Data, UserID, callback) => {
    const qry = `INSERT INTO dms_computer_details 
    (device_id, ip_address, anydesk_id, operating_system, processor_spec, ram_bus_type, ram_spec, hdd_capacity, ssd_capacity, vga_spec, user_id, create_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
        Data.device_id,
        Data.ip_address,
        Data.anydesk_id,
        Data.operating_system,
        Data.processor_spec,
        Data.ram_bus_type,
        Data.ram_spec,
        Data.hdd_capacity,
        Data.ssd_capacity,
        Data.vga_spec,
        UserID
    ];

    db.query(qry, params, (err, result) => {
        callback(err, result);
    });
};

// Update computer spec
exports.UpdateComputerSpec = (Data, RecodeID, UserID, callback) => {
    const qry = `UPDATE dms_computer_details SET 
        ip_address = ?, 
        anydesk_id = ?, 
        operating_system = ?, 
        processor_spec = ?, 
        ram_bus_type = ?, 
        ram_spec = ?, 
        hdd_capacity = ?, 
        ssd_capacity = ?, 
        vga_spec = ?, 
        user_id = ?, 
        update_date = NOW() 
    WHERE id = ?`;

    const params = [
        Data.ip_address,
        Data.anydesk_id,
        Data.operating_system,
        Data.processor_spec,
        Data.ram_bus_type,
        Data.ram_spec,
        Data.hdd_capacity,
        Data.ssd_capacity,
        Data.vga_spec,
        UserID,
        RecodeID
    ];

    db.query(qry, params, (err, result) => {
        callback(err, result);
    });
};