// controllers/deviceContoller.js
const dmsModel = require('../models/deviceModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHandler');
const {fetchStationIdForUnit} = require('../functions/Functions');


// Main Device List
exports.MainDeviceList = (req, res) => {
    const unitID = req.user.unit;
    const roleID = req.user.role;

    dmsModel.MainDeviceList(unitID, roleID, (err, result) => {
        sendResponse(res, err, result);
    });
};
// INSERT Main deivice
exports.InsertMainDevice = (req, res) => {
    const userID = req.user.id;
    const data = req.body;
    dmsModel.InsertMainDevice(data, userID, (err, result) => {
        sendResponse(res, err, result);
    });
};

// UPDATE Main deivice
exports.UpdateMainDevice = (req, res) => {
    const userID = req.user.id;
    const recodeID = req.params.id;
    const data = req.body;
    dmsModel.UpdateMainDevice(data, recodeID, userID, (err, result) => {
        sendResponse(res, err, result);
    });
};

// DELETE Main deivice
exports.DeleteMainDevice = (req, res) => {
    const userID = req.user.id;
    const recodeID = req.params.id;
    dmsModel.DeleteMainDevice(recodeID, userID, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Device Last ID
exports.DeviceLastId = (req, res) => {
    dmsModel.DeviceLastId((err, result) => {
        sendResponse(res, err, result);
    });
};
