const express = require('express')
const router = express.Router();
const dmsController = require('../controllers/computerController');
const { verifyTokenAndGetRole } = require('../middleware/authMiddleware'); 


router.get('/computer', verifyTokenAndGetRole, dmsController.MainComputerList);
router.post('/computer-specs', verifyTokenAndGetRole, dmsController.InsertComputerSpec);
router.put('/computer-specs/:id', verifyTokenAndGetRole, dmsController.UpdateComputerSpec);


module.exports = router;