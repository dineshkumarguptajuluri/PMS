const express = require('express');
const { createCheckpoint, getCheckpoints, updateCheckpoint, deleteCheckpoint } = require('../controllers/checkpointController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { checkpointSchema, checkpointUpdateSchema } = require('../validators/checkpointValidator');

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMIN', 'MANAGER']), validate(checkpointSchema), createCheckpoint);
router.get('/project/:projectId', verifyToken, checkRole(['ADMIN', 'MANAGER', 'CLIENT']), getCheckpoints);
router.patch('/:id', verifyToken, checkRole(['ADMIN', 'MANAGER']), validate(checkpointUpdateSchema), updateCheckpoint);
router.delete('/:id', verifyToken, checkRole(['ADMIN', 'MANAGER']), deleteCheckpoint);

module.exports = router;
