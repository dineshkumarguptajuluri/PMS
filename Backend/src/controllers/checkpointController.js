const prisma = require('../config/db');
const { asyncHandler } = require('../utils/asyncHandler');

// Helper to verify permissions for creation/modification (Managers & Admins only)
const checkProjectWriteAccess = async (projectId, userId, role) => {
  if (role === 'ADMIN') return true;

  const project = await prisma.project.findUnique({
    where: { id: parseInt(projectId) },
    select: { managerId: true }
  });

  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  return project.managerId === userId;
};

// Helper to verify permissions for viewing (Admins, Managers, and assigned Clients)
const checkProjectReadAccess = async (projectId, userId, role) => {
  if (role === 'ADMIN') return true;

  const project = await prisma.project.findUnique({
    where: { id: parseInt(projectId) },
    select: { managerId: true, clientId: true }
  });

  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  if (role === 'MANAGER') {
    return project.managerId === userId;
  }

  if (role === 'CLIENT') {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: userId },
      select: { id: true }
    });
    return clientProfile && project.clientId === clientProfile.id;
  }

  return false;
};

const createCheckpoint = asyncHandler(async (req, res) => {
  const { projectId, title, targetDate, order } = req.body;

  const hasAccess = await checkProjectWriteAccess(projectId, req.user.userId, req.user.role);
  if (!hasAccess) {
    const err = new Error('Access denied: You are not the manager for this project');
    err.statusCode = 403;
    throw err;
  }

  const checkpoint = await prisma.checkpoint.create({
    data: {
      projectId: parseInt(projectId),
      title,
      targetDate: new Date(targetDate),
      order: parseInt(order),
      status: req.body.status || 'PENDING'
    }
  });

  res.status(201).json({ message: 'Checkpoint created', checkpoint });
});

const getCheckpoints = asyncHandler(async (req, res) => {
  const projectId = parseInt(req.params.projectId);

  const hasAccess = await checkProjectReadAccess(projectId, req.user.userId, req.user.role);
  if (!hasAccess) {
    const err = new Error('Access denied: You are not authorized to view checkpoints for this project');
    err.statusCode = 403;
    throw err;
  }

  const checkpoints = await prisma.checkpoint.findMany({
    where: { projectId },
    orderBy: { order: 'asc' }
  });

  res.json(checkpoints);
});

const updateCheckpoint = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, targetDate, status, order } = req.body;

  const existing = await prisma.checkpoint.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Checkpoint not found');
    err.statusCode = 404;
    throw err;
  }

  const hasAccess = await checkProjectWriteAccess(existing.projectId, req.user.userId, req.user.role);
  if (!hasAccess) {
    const err = new Error('Access denied: You are not the manager for this project');
    err.statusCode = 403;
    throw err;
  }

  const data = {};
  if (title !== undefined) data.title = title;
  if (targetDate !== undefined) data.targetDate = new Date(targetDate);
  if (status !== undefined) data.status = status;
  if (order !== undefined) data.order = parseInt(order);

  const checkpoint = await prisma.checkpoint.update({ where: { id }, data });

  res.json({ message: 'Checkpoint updated successfully', checkpoint });
});

const deleteCheckpoint = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  const existing = await prisma.checkpoint.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Checkpoint not found');
    err.statusCode = 404;
    throw err;
  }

  const hasAccess = await checkProjectWriteAccess(existing.projectId, req.user.userId, req.user.role);
  if (!hasAccess) {
    const err = new Error('Access denied: You are not the manager for this project');
    err.statusCode = 403;
    throw err;
  }

  await prisma.checkpoint.delete({ where: { id } });

  res.json({ message: 'Checkpoint deleted successfully' });
});

module.exports = {
  createCheckpoint,
  getCheckpoints,
  updateCheckpoint,
  deleteCheckpoint
};
