const express = require('express');
const { getProfessors, getAllUsers } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/professors', getProfessors);
router.get('/all', getAllUsers);

module.exports = router;
