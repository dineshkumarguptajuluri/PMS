const prisma = require('../config/db');

const onboardClient = async (req, res) => {
  try {
    const { userId, legalName, gstNumber, industryType, employeeCount } = req.body;

    if (!userId || !legalName) {
      return res.status(400).json({ error: 'userId and legalName are required' });
    }

    // Verify user is a CLIENT
    const clientUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!clientUser || clientUser.role !== 'CLIENT') {
      return res.status(400).json({ error: 'Provided userId does not exist or is not a CLIENT' });
    }

    // Prisma transaction to atomically create the profile and insert documents
    const newProfile = await prisma.$transaction(async (prisma) => {
      const clientProfile = await prisma.clientProfile.create({
        data: {
          userId: parseInt(userId),
          legalName,
          gstNumber: gstNumber || null,
          industryType: industryType || null,
          employeeCount: employeeCount ? parseInt(employeeCount) : null,
          onboardingStatus: 'PENDING',
        }
      });

      // Handle file uploads by linking them via the Document table
      if (req.files && req.files.length > 0) {
        const documentData = req.files.map(file => ({
          clientProfileId: clientProfile.id,
          fileUrl: `/uploads/${file.filename}`,
          docType: file.fieldname // Allows determining the document type based on the form-data key
        }));
        
        await prisma.document.createMany({
          data: documentData
        });
      }

      return await prisma.clientProfile.findUnique({
        where: { id: clientProfile.id },
        include: { documents: true }
      });
    });

    res.status(201).json({ message: 'Client onboarded successfully', profile: newProfile });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A ClientProfile for this user already exists' });
    }
    console.error('Onboard client error:', error);
    res.status(500).json({ error: 'Internal server error processing onboarding' });
  }
};

const getPendingClients = async (req, res) => {
  try {
    const pendingClients = await prisma.clientProfile.findMany({
      where: {
        onboardingStatus: 'PENDING'
      },
      include: {
        user: { select: { email: true } },
        documents: true
      }
    });

    res.json(pendingClients);
  } catch (error) {
    console.error('Get pending clients error:', error);
    res.status(500).json({ error: 'Internal server error while fetching pending clients' });
  }
};

module.exports = {
  onboardClient,
  getPendingClients
};
