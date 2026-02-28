const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

router.get('/mark', auth, attendanceController.getMarkAttendancePage);
router.post('/mark', auth, attendanceController.markAttendance);
router.get('/view', auth, attendanceController.getAttendance);
router.get('/stats', auth, attendanceController.getStats);
router.put('/:id', auth, attendanceController.updateAttendance);
router.delete('/:id', auth, attendanceController.deleteAttendance);

module.exports = router;
