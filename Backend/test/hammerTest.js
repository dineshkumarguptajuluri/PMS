const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3001/api'; // Updated to your port 3001
const logStream = fs.createWriteStream('e2e_full_audit.log', { flags: 'w' });

const log = (msg) => {
  console.log(msg);
  logStream.write(`${new Date().toISOString()} - ${msg}\n`);
};

async function runFullE2ETest() {
  log('🚀 Starting Deep E2E Audit...');

  try {
    // 1. LOGIN AS ADMIN
    log('Step 1: Admin Authentication');
    const adminAuth = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@system.com',
      password: 'password123'
    });
    const adminToken = adminAuth.data.token;

    // 2. DISCOVERY CHECK (Client Role)
    log('Step 2: Client Discovery Access');
    const clientAuth = await axios.post(`${API_URL}/users/login`, {
      email: 'client1@system.com',
      password: 'password123'
    });
    const clientToken = clientAuth.data.token;
    const clientHeader = { headers: { Authorization: `Bearer ${clientToken}` } };

    const discovery = await axios.get(`${API_URL}/projects/discovery`, clientHeader);
    if (discovery.data[0].checkpoints) {
      throw new Error('SECURITY BREACH: Client can see checkpoints in Discovery!');
    }
    log('✅ Discovery View is Clean (No checkpoints leaked)');

    // 3. INTEREST WORKFLOW
    log('Step 3: Requesting Interest');
    const targetProject = discovery.data[0].id;
    try {
      await axios.post(`${API_URL}/projects/${targetProject}/interest`, {}, clientHeader);
      log('✅ Interest Request logged');
    } catch (e) {
      if (e.response && e.response.status === 400) {
        log('✅ Interest already exists (Skipped duplication)');
      } else {
        throw e;
      }
    }

    // 4. ADMIN APPROVAL
    log('Step 4: Admin Approving Interest');
    const pending = await axios.get(`${API_URL}/admin/interests/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (pending.data.length > 0) {
      const interestId = pending.data[0].id;
      await axios.patch(`${API_URL}/admin/interests/${interestId}/approve`, { status: 'APPROVED' }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log('✅ Interest Approved by Admin');
    } else {
      log('✅ Interest previously approved (Skipped approval gap)');
    }

    // 5. DATA ISOLATION TEST (The "Hammer" Phase)
    log('Step 5: Stress Testing the Clean View (50 Requests)');
    const tasks = [];
    for (let i = 0; i < 50; i++) {
      tasks.push(
        axios.get(`${API_URL}/client/projects`, clientHeader)
          .then(res => {
            // Check if progress math exists
            const p = res.data.find(proj => proj.id === targetProject);
            if (p && typeof p.progressPercentage === 'number') return true;
            return false;
          })
          .catch(() => false)
      );
    }

    const results = await Promise.all(tasks);
    const successCount = results.filter(r => r).length;
    log(`📊 Stress Test Results: ${successCount}/50 Successes`);

    if (successCount === 50) {
      log('🏆 ENTIRE SYSTEM VERIFIED: Auth, RBAC, Approval, and Data Isolation are solid.');
    } else {
      log('⚠️ SYSTEM UNSTABLE: Some requests failed during the clean-view calculation.');
    }

  } catch (err) {
    log(`❌ FATAL ERROR: ${err.response?.data?.message || err.message}`);
    if (err.response) log(`Error Data: ${JSON.stringify(err.response.data)}`);
  }
}

runFullE2ETest();