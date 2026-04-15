const prisma = require('../config/db');
const { calculateProgress, getProjectHealth } = require('../services/progressService');

const getClientProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: userId }
    });

    if (!clientProfile) {
      return res.status(404).json({ error: 'Client profile not found. Please onboard first.' });
    }

    // Fetch projects strictly where the client's explicit interest was APPROVED
    const rawProjects = await prisma.project.findMany({
      where: {
        projectInterests: {
          some: {
            clientId: clientProfile.id,
            status: 'APPROVED'
          }
        }
      },
      include: {
        checkpoints: true // Fetched internally only for algorithmic computation
      }
    });

    // DTO Translation: Safely strip checkpoints before transmitting payload
    const projectDTOs = rawProjects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.longDescription,
      overallTargetDate: project.overallTargetDate,
      overallStatus: getProjectHealth(project),
      progressPercentage: calculateProgress(project.checkpoints)
    }));

    res.json(projectDTOs);
  } catch (error) {
    console.error('Get client active projects error:', error);
    res.status(500).json({ error: 'Internal server error while fetching client dashboard' });
  }
};

module.exports = {
  getClientProjects
};
