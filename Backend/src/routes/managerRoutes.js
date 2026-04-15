const express = require('express');
const { getMyManagedProjects, getMyManagedClients, assignClientToMyProject } = require('../controllers/managerController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/projects', verifyToken, checkRole(['MANAGER', 'ADMIN']), getMyManagedProjects);
router.get('/clients', verifyToken, checkRole(['MANAGER', 'ADMIN']), getMyManagedClients);
router.post('/projects/:id/assign-client', verifyToken, checkRole(['MANAGER']), assignClientToMyProject);

module.exports = router;
