require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const healthRecordsRoutes = require('./routes/healthRecordsRoutes');
const patientManagementRoutes = require('./routes/patientManagementRoutes');
const diagnosticsRoutes = require('./routes/diagnosticsRoutes');
const medicineRecommendationsRoutes = require('./routes/medicineRecommendationsRoutes');
const doctorSettingsRoutes = require('./routes/doctorSettingsRoutes');
const patientSettingsRoutes = require('./routes/patientSettingsRoutes');

// Create Express app
const app = express();

// Configure CORS to allow credentials and specific origins
const allowedOrigins = [
  'http://localhost:5173',         // Local development frontend
  'http://13.232.90.30',           // AWS IP frontend without port
  'http://13.232.90.30:5173',      // AWS IP frontend with Vite default port
  'http://13.232.90.30:80',        // AWS IP frontend with HTTP port
  'http://13.232.90.30:3000'       // AWS IP frontend with alternate port
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/patient', healthRecordsRoutes);
app.use('/api/doctor/patients', patientManagementRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/medicine-recommendations', medicineRecommendationsRoutes);
app.use('/api/settings', doctorSettingsRoutes);
app.use('/api/patient/settings', patientSettingsRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('AiMediCare API is running!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong on the server',
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;