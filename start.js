/**
 * Enhanced startup script for TurfX application
 * Provides a more user-friendly way to start the application with different options
 */

import { spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Run a command and handle its output
 * @param {string} command - The command to run
 * @param {string[]} args - Arguments for the command
 * @param {string} name - Name of the process for logging
 * @returns {Promise<void>}
 */
const runCommand = (command, args, name) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting ${name}...`);
    
    const process = spawn(command, args, { 
      stdio: 'inherit',
      shell: true
    });
    
    process.on('error', (error) => {
      console.error(`Error starting ${name}:`, error.message);
      reject(error);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${name} exited successfully`);
        resolve();
      } else {
        console.error(`${name} exited with code ${code}`);
        reject(new Error(`${name} exited with code ${code}`));
      }
    });
  });
};

/**
 * Check if MongoDB is running
 * @returns {Promise<boolean>}
 */
const checkMongoDB = async () => {
  try {
    // For Windows
    if (process.platform === 'win32') {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('sc query MongoDB');
      return stdout.includes('RUNNING');
    }
    // For Unix-like systems
    else {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('pgrep mongod');
      return stdout.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
};

/**
 * Display the main menu and handle user selection
 */
const showMenu = async () => {
  console.log('\n=== TurfX Application Startup Menu ===');
  console.log('1. Start Full Application (Node.js + AI Service)');
  console.log('2. Start Node.js Server Only');
  console.log('3. Start AI Service Only');
  console.log('4. Clean Up Running Processes');
  console.log('5. Exit');
  
  // Check MongoDB status
  const isMongoDBRunning = await checkMongoDB();
  console.log(`\nMongoDB Status: ${isMongoDBRunning ? 'Running ✅' : 'Not Running ❌'}`);
  
  if (!isMongoDBRunning) {
    console.log('\n⚠️  Warning: MongoDB is not running. Some features may not work properly.');
    console.log('   Please start MongoDB before running the application for full functionality.');
  }
  
  rl.question('\nSelect an option (1-5): ', async (answer) => {
    switch (answer.trim()) {
      case '1':
        // Start full application
        try {
          await runCommand('node', ['start-services.js'], 'Full Application');
        } catch (error) {
          console.error('Failed to start full application:', error.message);
        }
        showMenu();
        break;
        
      case '2':
        // Start Node.js server only
        try {
          await runCommand('node', ['server.js'], 'Node.js Server');
        } catch (error) {
          console.error('Failed to start Node.js server:', error.message);
        }
        showMenu();
        break;
        
      case '3':
        // Start AI service only
        try {
          const aiDir = join(__dirname, 'ai_matchmaking');
          if (existsSync(aiDir)) {
            await runCommand('python', ['main.py'], 'AI Service', { cwd: aiDir });
          } else {
            console.error('AI matchmaking directory not found');
          }
        } catch (error) {
          console.error('Failed to start AI service:', error.message);
        }
        showMenu();
        break;
        
      case '4':
        // Clean up running processes
        try {
          await runCommand('node', ['cleanup.js'], 'Cleanup');
          console.log('Cleanup completed. You can now start the application.');
        } catch (error) {
          console.error('Failed to clean up processes:', error.message);
        }
        showMenu();
        break;
        
      case '5':
        // Exit
        console.log('Exiting...');
        rl.close();
        break;
        
      default:
        console.log('Invalid option. Please try again.');
        showMenu();
        break;
    }
  });
};

// Start the menu
showMenu();

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nExiting...');
  rl.close();
  process.exit(0);
});