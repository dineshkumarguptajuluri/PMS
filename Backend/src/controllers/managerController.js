const prisma = require('../config/db');

const getMyManagedProjects = async (req, res) => {
  try {
    const managerId = req.user.userId;

    const projects = await prisma.project.findMany({
      where: { managerId: managerId },
      include: {
        checkpoints: { orderBy: { order: 'asc' } },
        clientProfile: true
      }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get managed projects error:', error);
    res.status(500).json({ error: 'Internal server error while fetching managed projects' });
  }
};

const getMyManagedClients = async (req, res) => {
  try {
    const managerId = req.user.userId;

    const projectsWithClients = await prisma.project.findMany({
      where: { 
        managerId: managerId,
        clientId: { not: null }
      },
      include: {
        clientProfile: {
          include: {
            user: { select: { id: true, email: true } },
            documents: true
          }
        }
      }
    });

    const clientMap = new Map();
    projectsWithClients.forEach(proj => {
      if (proj.clientProfile) {
        clientMap.set(proj.clientProfile.id, proj.clientProfile);
      }
    });

    const uniqueClients = Array.from(clientMap.values());
    res.json(uniqueClients);
  } catch (error) {
    console.error('Get managed clients error:', error);
    res.status(500).json({ error: 'Internal server error while fetching managed clients' });
  }
};

const assignClientToMyProject = async (req, res) => {
  try {
    const managerId = req.user.userId;
    const projectId = parseInt(req.params.id);
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    // 1. Verify project exists AND belongs to this manager
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.managerId !== managerId) {
      return res.status(403).json({ error: 'Access denied: You do not manage this project' });
    }

    // 2. Verify client exists
    const client = await prisma.clientProfile.findUnique({
      where: { id: parseInt(clientId) }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    // 3. Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Upsert interest to APPROVED
      const interest = await tx.projectInterest.upsert({
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
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { clientId: parseInt(clientId) }
      });

      return { interest, updatedProject };
    });

    res.json({ message: 'Client successfully assigned to your project', data: result });
  } catch (error) {
    console.error('Assign client to my project error:', error);
    res.status(500).json({ error: 'Internal server error while assigning client' });
  }
};

module.exports = {
  getMyManagedProjects,
  getMyManagedClients,
  assignClientToMyProject
};
