const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const { calculateProgress, getProjectHealth } = require('../services/progressService');

// Helper to verify if user has permission to manage a project
const checkProjectAdminAccess = async (projectId, userId, role) => {
  if (role === 'ADMIN') return true;

  const project = await prisma.project.findUnique({
    where: { id: parseInt(projectId) },
    select: { managerId: true }
  });

  if (!project) return false;
  return project.managerId === userId;
};

const createClientBase = async (req, res) => {
  try {
    const { email, password, legalName } = req.body;

    if (!email || !password || !legalName) {
      return res.status(400).json({ error: 'Email, password, and legalName are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'CLIENT'
        }
      });

      const profile = await tx.clientProfile.create({
        data: {
          userId: user.id,
          legalName,
          onboardingStatus: 'PENDING_ONBOARDING'
        }
      });

      return { user, profile };
    });

    const { password: _, ...userWithoutPassword } = result.user;
    res.status(201).json({ 
      message: 'Client account created successfully. Awaiting onboarding.',
      user: userWithoutPassword,
      profile: result.profile
    });
  } catch (error) {
    console.error('Create client base error:', error);
    res.status(500).json({ error: 'Internal server error while creating client base' });
  }
};

const getOnboardingApprovals = async (req, res) => {
  try {
    const pendingClients = await prisma.clientProfile.findMany({
      where: { onboardingStatus: 'PENDING_APPROVAL' },
      include: {
        user: { select: { email: true } },
        documents: true
      }
    });
    res.json(pendingClients);
  } catch (error) {
    console.error('Get onboarding approvals error:', error);
    res.status(500).json({ error: 'Internal server error fetching onboarding requests' });
  }
};

const approveClientOnboarding = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be APPROVE or REJECT' });
    }

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updatedProfile = await prisma.clientProfile.update({
      where: { id: parseInt(profileId) },
      data: { onboardingStatus: status }
    });

    res.json({ message: `Client onboarding ${status.toLowerCase()} successfully`, profile: updatedProfile });
  } catch (error) {
    console.error('Approve onboarding error:', error);
    res.status(500).json({ error: 'Internal server error while processing onboarding approval' });
  }
};

const approveInterest = async (req, res) => {
  try {
    const interestId = parseInt(req.params.id);

    const interest = await prisma.projectInterest.findUnique({
      where: { id: interestId }
    });

    if (!interest) {
      return res.status(404).json({ error: 'Interest record not found' });
    }

    if (interest.status === 'APPROVED') {
      return res.status(400).json({ error: 'Interest is already approved' });
    }

    const hasAccess = await checkProjectAdminAccess(interest.projectId, req.user.userId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: You do not manage this project' });
    }

    // Wrap in transaction: update interest status AND strictly assign project to client
    const updatedData = await prisma.$transaction(async (prisma) => {
      const updatedInterest = await prisma.projectInterest.update({
        where: { id: interestId },
        data: { status: 'APPROVED' }
      });

      const updatedProject = await prisma.project.update({
        where: { id: interest.projectId },
        data: { clientId: interest.clientId }
      });

      return { updatedInterest, updatedProject };
    });

    res.json({ message: 'Interest officially approved and project assigned', data: updatedData });
  } catch (error) {
    console.error('Approve interest error:', error);
    res.status(500).json({ error: 'Internal server error while approving interest' });
  }
};

const rejectInterest = async (req, res) => {
  try {
    const interestId = parseInt(req.params.id);

    const interest = await prisma.projectInterest.findUnique({
      where: { id: interestId }
    });

    if (!interest) {
      return res.status(404).json({ error: 'Interest record not found' });
    }

    if (interest.status === 'REJECTED') {
      return res.status(400).json({ error: 'Interest is already rejected' });
    }

    const hasAccess = await checkProjectAdminAccess(interest.projectId, req.user.userId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: You do not manage this project' });
    }

    const updatedInterest = await prisma.projectInterest.update({
      where: { id: interestId },
      data: { status: 'REJECTED' }
    });

    res.json({ message: 'Interest rejected', data: updatedInterest });
  } catch (error) {
    console.error('Reject interest error:', error);
    res.status(500).json({ error: 'Internal server error while rejecting interest' });
  }
};

const getPendingInterests = async (req, res) => {
  try {
    const where = { status: 'PENDING' };
    
    // Managers only see interests for their own projects
    if (req.user.role === 'MANAGER') {
      where.project = { managerId: req.user.userId };
    }

    const interests = await prisma.projectInterest.findMany({
      where,
      include: {
        project: { select: { title: true } },
        client: { select: { id: true, legalName: true } }
      }
    });
    res.json(interests);
  } catch (error) {
    console.error('Get pending interests error:', error);
    res.status(500).json({ error: 'Internal server error fetching pending interests' });
  }
};

const getManagerStats = async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        email: true,
        managedProjects: {
          include: { checkpoints: true }
        }
      }
    });

    const performanceStats = managers.map(manager => {
      const totalProjects = manager.managedProjects.length;
      let totalProgress = 0;
      let delayedCount = 0;
      let onTrackCount = 0;
      let atRiskCount = 0;

      manager.managedProjects.forEach(proj => {
        totalProgress += calculateProgress(proj.checkpoints);
        const status = getProjectHealth(proj);
        if (status === 'DELAYED') delayedCount++;
        else if (status === 'ON TRACK') onTrackCount++;
        else if (status === 'AT RISK') atRiskCount++;
      });

      const averageProgress = totalProjects === 0 ? 0 : Math.round(totalProgress / totalProjects);

      return {
        managerId: manager.id,
        managerEmail: manager.email,
        totalProjects,
        averageProgress,
        statusCounts: {
          delayed: delayedCount,
          onTrack: onTrackCount,
          atRisk: atRiskCount
        }
      };
    });

    res.json(performanceStats);
  } catch (error) {
    console.error('Get manager stats error:', error);
    res.status(500).json({ error: 'Internal server error fetching manager stats' });
  }
};

const reassignProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { newManagerId } = req.body;

    if (!newManagerId) {
      return res.status(400).json({ error: 'newManagerId is required in request body' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const newManager = await prisma.user.findUnique({ where: { id: parseInt(newManagerId) } });
    if (!newManager || newManager.role !== 'MANAGER') {
      return res.status(400).json({ error: 'Target user does not exist or lacks MANAGER role' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { managerId: parseInt(newManagerId) }
    });

    res.json({ message: 'Project successfully reassigned', project: updatedProject });
  } catch (error) {
    console.error('Reassign project error:', error);
    res.status(500).json({ error: 'Internal server error during project reassignment' });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search = '' } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const skip = (p - 1) * l;

    const where = {};
    if (role) {
      where.role = role.toUpperCase();
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        {
          clientProfile: {
            legalName: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: l,
        include: {
          clientProfile: {
            include: { documents: true }
          }
        },
        orderBy: { id: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const sanitizedUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });

    res.json({
      users: sanitizedUsers,
      total,
      pages: Math.ceil(total / l),
      currentPage: p
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error while fetching users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Security check: Managers can only update CLIENT users and cannot change roles
    if (req.user.role === 'MANAGER') {
      if (user.role !== 'CLIENT') {
        return res.status(403).json({ error: 'Access denied: Managers can only update clients' });
      }
      if (role && role !== 'CLIENT') {
        return res.status(403).json({ error: 'Access denied: Managers cannot modify user roles' });
      }
    }

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email already in use' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        ...(email && { email }),
        ...(role && { role })
      }
    });

    const { password: _, ...result } = updatedUser;
    res.json({ message: 'User updated successfully', user: result });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error while updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        managedProjects: { select: { id: true } },
        clientProfile: {
          include: {
            projects: { select: { id: true } },
            projectInterests: { 
              where: { status: 'APPROVED' },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Safety checks
    if (user.role === 'MANAGER' && user.managedProjects.length > 0) {
      return res.status(400).json({ 
        error: 'Reassign projects before deleting manager', 
        activeProjectCount: user.managedProjects.length 
      });
    }

    if (user.role === 'CLIENT' && user.clientProfile) {
      const activeAssignments = user.clientProfile.projects.length + user.clientProfile.projectInterests.length;
      if (activeAssignments > 0) {
        return res.status(400).json({ 
          error: 'Unassign projects/interests before deleting client',
          activeAssignments
        });
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error while deleting user' });
  }
};

const getAssignedClients = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    const hasAccess = await checkProjectAdminAccess(projectId, req.user.userId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: You do not manage this project' });
    }

    const assignments = await prisma.projectInterest.findMany({
      where: {
        projectId,
        status: 'APPROVED'
      },
      include: {
        client: {
          include: {
            user: { select: { email: true } }
          }
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assigned clients error:', error);
    res.status(500).json({ error: 'Internal server error fetching assigned clients' });
  }
};

const assignClientDirectly = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required in request body' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const hasAccess = await checkProjectAdminAccess(projectId, req.user.userId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: You do not manage this project' });
    }

    const client = await prisma.clientProfile.findUnique({ where: { id: parseInt(clientId) } });
    if (!client) return res.status(404).json({ error: 'Client profile not found' });

    const result = await prisma.$transaction(async (prisma) => {
      // Upsert ProjectInterest to APPROVED
      const interest = await prisma.projectInterest.upsert({
        where: {
          projectId_clientId: {
            projectId,
            clientId: parseInt(clientId)
          }
        },
        update: { status: 'APPROVED' },
        create: {
          projectId,
          clientId: parseInt(clientId),
          status: 'APPROVED'
        }
      });

      // Update primary clientId on Project
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { clientId: parseInt(clientId) }
      });

      return { interest, updatedProject };
    });

    res.json({ message: 'Client directly assigned successfully', data: result });
  } catch (error) {
    console.error('Assign client directly error:', error);
    res.status(500).json({ error: 'Internal server error while assigning client directly' });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, utilityFocus, optimizationDetails, longDescription, overallTargetDate, managerId } = req.body;

    if (!title || !utilityFocus || !optimizationDetails || !longDescription || !overallTargetDate) {
      return res.status(400).json({ error: 'title, utilityFocus, optimizationDetails, longDescription, and overallTargetDate are required' });
    }

    if (managerId) {
      const manager = await prisma.user.findUnique({ where: { id: parseInt(managerId) } });
      if (!manager || manager.role !== 'MANAGER') {
        return res.status(400).json({ error: 'managerId must belong to a user with MANAGER role' });
      }
    }

    const project = await prisma.project.create({
      data: {
        title,
        utilityFocus,
        optimizationDetails,
        longDescription,
        overallTargetDate: new Date(overallTargetDate),
        managerId: managerId ? parseInt(managerId) : null
      }
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error while creating project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { title, utilityFocus, optimizationDetails, longDescription, overallTargetDate, managerId } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (managerId) {
      const manager = await prisma.user.findUnique({ where: { id: parseInt(managerId) } });
      if (!manager || manager.role !== 'MANAGER') {
        return res.status(400).json({ error: 'managerId must belong to a user with MANAGER role' });
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title }),
        ...(utilityFocus && { utilityFocus }),
        ...(optimizationDetails && { optimizationDetails }),
        ...(longDescription && { longDescription }),
        ...(overallTargetDate && { overallTargetDate: new Date(overallTargetDate) }),
        ...(managerId !== undefined && { managerId: managerId ? parseInt(managerId) : null })
      }
    });

    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error while updating project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    await prisma.$transaction([
      prisma.checkpoint.deleteMany({ where: { projectId } }),
      prisma.projectInterest.deleteMany({ where: { projectId } }),
      prisma.project.delete({ where: { id: projectId } })
    ]);

    res.json({ message: 'Project and all related data (checkpoints, interests) deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error while deleting project' });
  }
};

module.exports = {
  approveClientOnboarding,
  getOnboardingApprovals,
  createClientBase,
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
  deleteProject
};
