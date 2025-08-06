/**
 * Script to start both the Node.js backend and FastAPI matchmaking service
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NODE_SERVER_COMMAND = process.platform === 'win32' ? 'node' : 'node';
const PYTHON_COMMAND = process.platform === 'win32' ? 'python' : 'python3';

// Check if Python and required packages are installed
const checkPythonDependencies = () => {
  console.log('Checking Python dependencies...');
  
  const aiMatchmakingDir = path.join(__dirname, 'ai_matchmaking');
  const requirementsPath = path.join(aiMatchmakingDir, 'requirements.txt');
  
  if (!fs.existsSync(requirementsPath)) {
    console.warn('Warning: requirements.txt not found in ai_matchmaking directory');
    return Promise.reject(new Error('requirements.txt not found'));
  }
  
  // Create models directory if it doesn't exist
  const modelsDir = path.join(aiMatchmakingDir, 'models');
  if (!fs.existsSync(modelsDir)) {
    try {
      fs.mkdirSync(modelsDir, { recursive: true });
      console.log('Created models directory');
    } catch (err) {
      console.warn('Warning: Could not create models directory:', err.message);
      // Continue anyway, as this might not be critical
    }
  }
  
  // Check if Python is installed
  try {
    // First check if Python is available
    const pythonCheck = spawn(PYTHON_COMMAND, ['--version']);
    
    return new Promise((resolve, reject) => {
      pythonCheck.on('error', (err) => {
        console.warn(`Python not found: ${err.message}`);
        reject(new Error('Python not found'));
      });
      
      pythonCheck.on('close', (code) => {
        if (code !== 0) {
          console.warn(`Python check failed with code ${code}`);
          reject(new Error(`Python check failed with code ${code}`));
          return;
        }
        
        // Python is available, now install dependencies
        console.log('Installing Python dependencies...');
        const pipInstall = spawn(PYTHON_COMMAND, [
          '-m', 'pip', 'install', '-r', requirementsPath
        ]);
        
        pipInstall.stdout.on('data', (data) => {
          console.log(`pip: ${data}`);
        });
        
        pipInstall.stderr.on('data', (data) => {
          console.error(`pip error: ${data}`);
        });
        
        pipInstall.on('error', (err) => {
          console.warn(`Pip install error: ${err.message}`);
          reject(new Error(`Pip install error: ${err.message}`));
        });
        
        pipInstall.on('close', (code) => {
          if (code === 0) {
            console.log('Python dependencies installed successfully');
            resolve();
          } else {
            console.warn(`pip install failed with code ${code}`);
            reject(new Error(`pip install failed with code ${code}`));
          }
        });
      });
    });
  } catch (err) {
    console.warn('Error checking Python:', err.message);
    return Promise.reject(new Error('Error checking Python'));
  }
};

// Start the Node.js server
const startNodeServer = () => {
  console.log('Starting Node.js server...');
  
  const nodeServer = spawn(NODE_SERVER_COMMAND, ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env, AI_SERVICE_URL: 'http://localhost:8000' }
  });
  
  nodeServer.on('error', (err) => {
    console.error('Failed to start Node.js server:', err);
  });
  
  return nodeServer;
};

// Start the Node.js server without AI service
const startNodeServerOnly = () => {
  console.log('Starting Node.js server without AI service...');
  
  const nodeServer = spawn(NODE_SERVER_COMMAND, ['server.js'], {
    stdio: 'inherit'
  });
  
  nodeServer.on('error', (err) => {
    console.error('Failed to start Node.js server:', err);
  });
  
  return nodeServer;
};

// Start the FastAPI matchmaking service
const startFastAPIService = () => {
  console.log('Starting FastAPI matchmaking service...');
  
  const aiMatchmakingDir = path.join(__dirname, 'ai_matchmaking');
  const fastApiService = spawn(PYTHON_COMMAND, ['main.py'], {
    cwd: aiMatchmakingDir,
    stdio: 'inherit'
  });
  
  fastApiService.on('error', (err) => {
    console.error('Failed to start FastAPI service:', err);
  });
  
  return fastApiService;
};

// Main function to start all services
const startServices = async () => {
  // Set a flag to track if we're running with AI service
  let aiServiceRunning = false;
  let nodeServer = null;
  let fastApiService = null;
  
  try {
    // Try to check Python dependencies
    try {
      await checkPythonDependencies();
      
      // Start FastAPI service
      console.log('Starting AI matchmaking service...');
      fastApiService = startFastAPIService();
      
      // Set up error handler for FastAPI service
      fastApiService.on('error', (err) => {
        console.error('FastAPI service error:', err.message);
        aiServiceRunning = false;
      });
      
      fastApiService.on('exit', (code) => {
        if (code !== 0) {
          console.warn(`FastAPI service exited with code ${code}`);
          aiServiceRunning = false;
        }
      });
      
      // Wait a bit for FastAPI to initialize
      console.log('Waiting for AI service to initialize...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      aiServiceRunning = true;
      console.log('AI matchmaking service started successfully');
      
      // Start Node.js server with AI service URL
      nodeServer = startNodeServer();
      
    } catch (pythonError) {
      console.warn('Warning: Could not start AI matchmaking service:', pythonError.message);
      console.log('Starting Node.js server only...');
      
      // Start Node.js server without AI service
      nodeServer = startNodeServerOnly();
    }
    
    // Set up error handler for Node.js server
    nodeServer.on('error', (err) => {
      console.error('Node.js server error:', err.message);
    });
    
    nodeServer.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Node.js server exited with code ${code}`);
        // If Node.js server exits unexpectedly, kill the FastAPI service if it's running
        if (aiServiceRunning && fastApiService) {
          fastApiService.kill();
        }
        process.exit(code);
      }
    });
    
    // Handle process termination
    const cleanup = () => {
      console.log('Shutting down services...');
      if (aiServiceRunning && fastApiService) {
        fastApiService.kill();
      }
      if (nodeServer) {
        nodeServer.kill();
      }
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    console.log(`Server running on port ${process.env.PORT || 5000}`);
    if (aiServiceRunning) {
      console.log('AI matchmaking service available at http://localhost:8000');
    } else {
      console.log('AI matchmaking service is NOT available - running in limited mode');
    }
    
  } catch (error) {
    console.error('Error starting services:', error);
    process.exit(1);
  }
};

// Start the services
startServices();