require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const checkpointRoutes = require('./routes/checkpointRoutes');
const clientDashboardRoutes = require('./routes/clientDashboardRoutes');
const managerRoutes = require('./routes/managerRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const port = process.env.PORT || 3001;

// --- Security Hardening ---

// Helmet: Sets secure HTTP headers (XSS protection, content-type sniffing, etc.)
app.use(helmet());

// CORS: Only allow requests from whitelisted frontend origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// --- Body Parsing ---
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Main API routes
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/client', clientDashboardRoutes);
app.use('/api/manager', managerRoutes);

app.get('/', (req, res) => {
  res.send('Project Management System API is running.');
});

// Global error handler — MUST be registered after all routes
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
