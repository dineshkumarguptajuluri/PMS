const prisma = require('../config/db');

const onboardClient = async (req, res) => {
  try {
    let { 
      userId, 
      company, 
      location, 
      contacts, 
      legal 
    } = req.body;

    // Parse JSON strings if they come from FormData
    if (typeof company === 'string') company = JSON.parse(company);
    if (typeof location === 'string') location = JSON.parse(location);
    if (typeof contacts === 'string') contacts = JSON.parse(contacts);
    if (typeof legal === 'string') legal = JSON.parse(legal);

    if (!userId || !company) {
      return res.status(400).json({ error: 'userId and company data are required' });
    }

    // Verify profile exists
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!profile) {
      return res.status(404).json({ error: 'ClientProfile not found for this user' });
    }

    // Prisma transaction to update profile and insert documents
    const updatedProfile = await prisma.$transaction(async (prisma) => {
      // Helper to extract first number from size string (e.g. "50-100" -> 50)
      const parseEmployeeCount = (sizeStr) => {
        if (!sizeStr) return null;
        const match = sizeStr.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      };

      const clientProfile = await prisma.clientProfile.update({
        where: { userId: parseInt(userId) },
        data: {
          companyData: company,
          locationData: location,
          contactsData: contacts,
          legalData: legal,
          // Sync indexed columns for visibility in lists
          legalName: company?.name || undefined,
          industryType: company?.industry || null,
          employeeCount: parseEmployeeCount(company?.size),
          gstNumber: legal?.gst || null,
          panNumber: legal?.pan || null,
          cinNumber: legal?.cin || null,
          onboardingStatus: 'PENDING_APPROVAL' // Wait for admin review
        }
      });

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const documentData = req.files.map(file => ({
          clientProfileId: clientProfile.id,
          fileUrl: `/uploads/${file.filename}`,
          docType: file.fieldname 
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

    res.status(200).json({ 
      message: 'Onboarding data submitted for review', 
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Onboard client submit error:', error);
    res.status(500).json({ error: 'Internal server error processing onboarding' });
  }
};

const getPendingClients = async (req, res) => {
  try {
    const pendingClients = await prisma.clientProfile.findMany({
      where: {
        onboardingStatus: 'PENDING_APPROVAL'
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
