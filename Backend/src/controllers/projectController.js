const prisma = require('../config/db');

const getDiscoveryProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        utilityFocus: true,
        optimizationDetails: true,
        longDescription: true,
      }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching discovery projects:', error);
    res.status(500).json({ error: 'Internal server error while fetching projects' });
  }
};

const expressInterest = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.userId;

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: userId }
    });

    if (!clientProfile) {
      return res.status(404).json({ error: 'Client profile not found. Please onboard first.' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingInterest = await prisma.projectInterest.findFirst({
      where: { projectId, clientId: clientProfile.id }
    });

    if (existingInterest) {
      return res.status(400).json({ error: 'Interest already expressed for this project' });
    }

    const interest = await prisma.projectInterest.create({
      data: {
        projectId,
        clientId: clientProfile.id,
        status: 'PENDING'
      }
    });

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const message = `Client ${clientProfile.legalName} has expressed interest in project ${project.title}`;
    const notificationData = admins.map(a => ({ userId: a.id, message }));

    if (project.managerId && !admins.some(a => a.id === project.managerId)) {
      notificationData.push({ userId: project.managerId, message });
    }

    if (notificationData.length > 0) {
      await prisma.notification.createMany({ data: notificationData });
    }

    res.status(201).json({ message: 'Interest expressed successfully', interest });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ error: 'Internal server error while expressing interest' });
  }
};

const getMyActiveProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: userId }
    });

    if (!clientProfile) {
      return res.status(404).json({ error: 'Client profile not found. Please onboard first.' });
    }

    // Projects where this specific client has been officially linked via assignment
    const activeProjects = await prisma.project.findMany({
      where: { clientId: clientProfile.id }
    });

    res.json(activeProjects);
  } catch (error) {
    console.error('Get active projects error:', error);
    res.status(500).json({ error: 'Internal server error fetching active projects' });
  }
};


module.exports = {
  getDiscoveryProjects,
  expressInterest,
  getMyActiveProjects
};
