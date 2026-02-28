const express = require('express');
const router = express.Router();
const multer = require('multer');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, studentController.getAllStudents);
router.post('/', auth, studentController.createStudent);
router.get('/:id', auth, studentController.getStudentById);
router.put('/:id', auth, studentController.updateStudent);
router.delete('/:id', auth, studentController.deleteStudent);
router.post('/import', auth, upload.single('file'), studentController.importStudents);

module.exports = router;
