// server.js
// Main Express server setup for Sports Equipment and Monitoring System

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import routes
const equipmentRoutes = require('./routes/equipmentRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// =====================================================
// ROUTES
// =====================================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Sports Equipment API is running',
        timestamp: new Date().toISOString()
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Sports Equipment and Monitoring System API',
        version: '1.0.0',
        description: 'REST API for managing sports equipment inventory with auto-calculation of quantities',
        endpoints: {
            equipment: {
                'GET /api/equipment': 'Get all equipment with auto-calculated quantities',
                'GET /api/equipment/:equipmentId': 'Get single equipment with auto-calculated quantities',
                'POST /api/equipment': 'Create new equipment',
                'PUT /api/equipment/:equipmentId': 'Update equipment',
                'DELETE /api/equipment/:equipmentId': 'Delete equipment (soft delete)'
            },
            borrowing: {
                'POST /api/equipment/borrow': 'Borrow equipment (auto-updates quantities)',
                'PUT /api/equipment/borrow/:borrowId/return': 'Return equipment (auto-updates quantities)',
                'GET /api/equipment/borrow/active': 'Get all active borrow records',
                'GET /api/equipment/:equipmentId/borrow-history': 'Get borrow history for equipment'
            }
        },
        features: [
            'Automatic calculation of Quantity Borrowed from active borrow records',
            'Automatic calculation of Quantity Available (Total - Borrowed)',
            'Real-time stock status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)',
            'Input validation on all operations',
            'Soft delete for equipment (preserves history)',
            'Borrow history tracking'
        ]
    });
});

// Equipment routes
app.use('/api/equipment', equipmentRoutes);

// Serve frontend at root (index.html) and static assets
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));


// =====================================================
// ERROR HANDLING
// =====================================================

// 404 / SPA fallback handler
app.use((req, res) => {
    // If request looks like an API call, return JSON 404
    if (req.path.startsWith('/api') || req.method !== 'GET') {
        return res.status(404).json({
            success: false,
            error: 'Route not found',
            path: req.path,
            method: req.method
        });
    }

    // For all other GET requests, serve the SPA index (so routes like /login load the dashboard)
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html for fallback route:', err);
            res.status(500).send('Server error');
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// =====================================================
// START SERVER (with EADDRINUSE handling and port fallback)
// =====================================================

function printStartupInfo(listenPort) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   SPORTS EQUIPMENT AND MONITORING SYSTEM - API SERVER      ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:${listenPort}

📚 API Documentation: http://localhost:${listenPort}/api
🏥 Health Check: http://localhost:${listenPort}/health

🎯 Auto-Calculation Features Enabled:
   ✓ Quantity Borrowed (auto-updated from borrow records)
   ✓ Quantity Available (auto-calculated: Total - Borrowed)
   ✓ Stock Status (auto-determined based on availability)
   
💾 Database: ${process.env.DB_NAME || 'sports_equipment_system'}
🔌 Port: ${listenPort}

Ready to manage sports equipment! 🏀⚽🎾
    `);
}

// Try listening on PORT; if in use, try the next ports up to +10
function startServer(initialPort, maxAttempts = 10) {
    let attempt = 0;
    const tryListen = (port) => {
        const server = app.listen(port, () => {
            printStartupInfo(port);
        });

        server.on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
                console.warn(`Port ${port} is in use.`);
                attempt += 1;
                if (attempt <= maxAttempts) {
                    const nextPort = initialPort + attempt;
                    console.log(`Trying port ${nextPort}...`);
                    setTimeout(() => tryListen(nextPort), 200);
                    return;
                }
                console.error(`Unable to bind to a port after ${maxAttempts + 1} attempts.`);
                console.error('Please free the port or set a different PORT in your .env file.');
                process.exit(1);
            } else {
                console.error('Server error:', err);
                process.exit(1);
            }
        });
    };

    tryListen(initialPort);
}

startServer(Number(PORT) || 5000, 10);

module.exports = app;

// Global process handlers to prevent crashes from uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
    // Allow nodemon to restart the process
    setTimeout(() => process.exit(1), 100);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Allow nodemon to restart the process
    setTimeout(() => process.exit(1), 100);
});
