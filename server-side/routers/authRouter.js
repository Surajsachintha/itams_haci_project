const express = require('express')
const router = express.Router();
const dmsController = require('../controllers/authController');
const { verifyTokenAndGetRole } = require('../middleware/authMiddleware'); 

// Authentication
router.post('/login', dmsController.login);
router.put('/password-change', verifyTokenAndGetRole, dmsController.updatePassword);
router.post('/setup-password', dmsController.userSetNewPassword);
router.post('/forgot-password', dmsController.userForgotPassword);

router.get('/users', verifyTokenAndGetRole, dmsController.userListView);
router.post('/users', verifyTokenAndGetRole, dmsController.userInsert);
router.put('/users/:id', verifyTokenAndGetRole, dmsController.userUpdate);
router.put('/users-status/:id', verifyTokenAndGetRole, dmsController.userStatusUpdate);

router.get('/test', verifyTokenAndGetRole, dmsController.testData);

module.exports = router;

