/**
 * Cleanup script to stop all running server processes
 * Run this script before starting a new server instance
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const cleanup = async () => {
  console.log('Cleaning up running server processes...');
  
  try {
    // On Windows, find and kill Node.js processes
    if (process.platform === 'win32') {
      console.log('Stopping Node.js processes...');
      
      // Find all Node.js processes
      const { stdout } = await execAsync('tasklist /fi "imagename eq node.exe" /fo csv');
      
      // Check if any Node.js processes are running
      if (stdout.includes('node.exe')) {
        console.log('Found Node.js processes, stopping them...');
        await execAsync('taskkill /f /im node.exe');
        console.log('Node.js processes stopped');
      } else {
        console.log('No Node.js processes found');
      }
      
      // Find all Python processes (for AI service)
      const pythonResult = await execAsync('tasklist /fi "imagename eq python.exe" /fo csv');
      
      // Check if any Python processes are running
      if (pythonResult.stdout.includes('python.exe')) {
        console.log('Found Python processes, stopping them...');
        await execAsync('taskkill /f /im python.exe');
        console.log('Python processes stopped');
      } else {
        console.log('No Python processes found');
      }
    } else {
      // On Unix-like systems
      console.log('Stopping Node.js and Python processes...');
      await execAsync('pkill -f "node server.js" || true');
      await execAsync('pkill -f "node start-services.js" || true');
      await execAsync('pkill -f "python main.py" || true');
      console.log('Processes stopped');
    }
    
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    console.log('You may need to manually stop the processes');
  }
};

// Run the cleanup
cleanup();