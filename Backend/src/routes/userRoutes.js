const express = require('express');
const { login, registerTestUser, createUser } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { userSchema, loginSchema } = require('../validators/userValidator');
const { loginLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/register', validate(userSchema), registerTestUser);
router.post('/create', verifyToken, checkRole(['ADMIN', 'MANAGER']), validate(userSchema), createUser);

module.exports = router;
