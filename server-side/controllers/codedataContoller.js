const dmsModel = require('../models/codedataModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseHandler');
const {fetchStationIdForUnit} = require('../functions/Functions');


// Main Device List
exports.MainCodeData = (req, res) => {
    const table = req.query.table;
    dmsModel.MainCodeData(table, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Main Device List
exports.StationCodeData = (req, res) => {
    dmsModel.StationCodeData((err, result) => {
        sendResponse(res, err, result);
    });
};

// Category List
exports.DeviceTypeList = (req, res) => {
    const CategoryID = req.params.cat_id;
    dmsModel.DeviceTypeList(CategoryID, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Category List
exports.ModalList = (req, res) => {
    const TypeID = req.body.type_id;
    const BrandID = req.body.brand_id;
    dmsModel.ModalList(TypeID, BrandID, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Editing Code table
exports.EditCodeTable = (req, res) => {
    const CodeTB = req.body.code_table;
    dmsModel.EditCodeTable(CodeTB, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Code Table Data Fetch
exports.CodeTableDataFetch = (req, res) => {
    const code_id = req.body.code_id;
    const code_name = req.body.code_name;
    const codetable_name = req.body.codetable_name;
    dmsModel.CodeTableDataFetch(code_id, code_name, codetable_name, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Dynamic Insert 
exports.DynamicInsert = (req, res) => {
    const table_name = req.body.table;
    const data = req.body.data;

    dmsModel.DynamicInsert(table_name, data, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Dynamic Update
exports.DynamicUpdate = (req, res) => {
    const table_name = req.body.table;
    const id = req.body.id;
    const data = req.body.data;

    dmsModel.DynamicUpdate(table_name, id, data, (err, result) => {
        sendResponse(res, err, result);
    });
};

// Dynamic Delete
exports.DynamicDelete = (req, res) => {
    const table_name = req.body.table;
    const id = req.body.id;

    dmsModel.DynamicDelete(table_name, id, (err, result) => {
        sendResponse(res, err, result);
    });
};