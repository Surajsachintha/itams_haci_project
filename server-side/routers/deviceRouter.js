// routers/deviceRouter.js
const express = require('express')
const router = express.Router();
const dmsController = require('../controllers/deviceContoller');
const { verifyTokenAndGetRole } = require('../middleware/authMiddleware'); 

const  notificationController = require('../controllers/notificationController'); 


router.get('/device-list', verifyTokenAndGetRole, dmsController.MainDeviceList);
router.post('/device', verifyTokenAndGetRole, dmsController.InsertMainDevice);
router.put('/device/:id', verifyTokenAndGetRole, dmsController.UpdateMainDevice);
router.delete('/device/:id', verifyTokenAndGetRole, dmsController.DeleteMainDevice);

router.get('/device-last-id', verifyTokenAndGetRole, dmsController.DeviceLastId);

router.post('/send', notificationController.sendNotificationToUser);

module.exports = router;