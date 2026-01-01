// routers/codedataRouter.js
const express = require('express')
const router = express.Router();
const dmsController = require('../controllers/codedataContoller');
const { verifyTokenAndGetRole } = require('../middleware/authMiddleware'); 

// Authentication
router.get('/code-data', verifyTokenAndGetRole, dmsController.MainCodeData);
router.get('/code-station', verifyTokenAndGetRole, dmsController.StationCodeData);
router.get('/code-device-types/:cat_id', verifyTokenAndGetRole, dmsController.DeviceTypeList);
router.post('/code-models', verifyTokenAndGetRole, dmsController.ModalList);

router.post('/code-table-data', verifyTokenAndGetRole, dmsController.CodeTableDataFetch);
router.post('/code-table-keys', verifyTokenAndGetRole, dmsController.EditCodeTable);

// Dynamic CRUD Routes
router.post('/dynamic-insert', verifyTokenAndGetRole, dmsController.DynamicInsert);
router.put('/dynamic-update', verifyTokenAndGetRole, dmsController.DynamicUpdate);
router.delete('/dynamic-delete', verifyTokenAndGetRole, dmsController.DynamicDelete);




module.exports = router;