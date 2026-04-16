const express = require('express');
const { 
  approveInterest, 
  rejectInterest, 
  getPendingInterests, 
  getManagerStats, 
  reassignProject, 
  deleteUser,
  getAssignedClients,
  assignClientDirectly,
  getUsersByRole,
  updateUser,
  createProject,
  updateProject,
  deleteProject,
  createClientBase,
  getOnboardingApprovals,
  approveClientOnboarding
} = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/interests/pending', verifyToken, checkRole(['ADMIN', 'MANAGER']), getPendingInterests);
router.patch('/interests/:id/approve', verifyToken, checkRole(['ADMIN', 'MANAGER']), approveInterest);
router.patch('/interests/:id/reject', verifyToken, checkRole(['ADMIN', 'MANAGER']), rejectInterest);
router.get('/performance', verifyToken, checkRole(['ADMIN']), getManagerStats);
router.patch('/projects/:id/reassign', verifyToken, checkRole(['ADMIN']), reassignProject);

// Project Management Endpoints
router.post('/projects', verifyToken, checkRole(['ADMIN']), createProject);
router.post('/projects/:id/assign-client', verifyToken, checkRole(['ADMIN', 'MANAGER']), assignClientDirectly);
router.patch('/projects/:id', verifyToken, checkRole(['ADMIN']), updateProject);
router.delete('/projects/:id', verifyToken, checkRole(['ADMIN']), deleteProject);

// User Management Endpoints
router.get('/users', verifyToken, checkRole(['ADMIN', 'MANAGER']), getUsersByRole);
router.patch('/users/:id', verifyToken, checkRole(['ADMIN', 'MANAGER']), updateUser);
router.delete('/users/:id', verifyToken, checkRole(['ADMIN']), deleteUser);

// Client Onboarding Endpoints
router.post('/clients', verifyToken, checkRole(['ADMIN']), createClientBase);
router.get('/clients/onboarding-requests', verifyToken, checkRole(['ADMIN']), getOnboardingApprovals);
router.patch('/clients/onboarding/:profileId', verifyToken, checkRole(['ADMIN']), approveClientOnboarding);

module.exports = router;
