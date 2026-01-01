const dmsModel = require('../models/computterModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHandler');
const {fetchStationIdForUnit} = require('../functions/Functions');


// Main Computers List
exports.MainComputerList = (req, res) => {
    const unitID = req.user.unit;
    const roleID = req.user.role;

    dmsModel.MainComputerList((err, result) => {
        sendResponse(res, err, result);
    });
};

// Insert Computer Spec
exports.InsertComputerSpec = (req, res) => {
    const UserID = req.user.id;
    const Data = req.body;

    dmsModel.InsertComputerSpec(Data, UserID, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Update Computer Spec
exports.UpdateComputerSpec = (req, res) => {
    const UserID = req.user.id;
    const RecodeID = req.params.id;
    const Data = req.body;

    dmsModel.UpdateComputerSpec(Data, RecodeID, UserID, (err, result) => {
        sendResponse(res, err, result);
    });
};