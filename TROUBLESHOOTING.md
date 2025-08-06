# TurfX Application Troubleshooting Guide

## Common Issues and Solutions

### MongoDB Connection Issues

1. **MongoDB Not Running**
   - Ensure MongoDB is installed and running on your system
   - For Windows: Check if MongoDB service is running in Services
   - For manual MongoDB installation: Start MongoDB using `mongod` command

2. **Connection String Issues**
   - The application now uses `127.0.0.1` instead of `localhost` to avoid DNS resolution issues
   - The connection has retry logic to handle temporary connection failures
   - If using MongoDB Atlas, update the connection string in `.env` file

### Python Dependencies for AI Matchmaking

1. **Python Not Installed**
   - Ensure Python 3.8+ is installed and available in your PATH
   - Verify with `python --version` or `python3 --version`

2. **Missing Requirements**
   - The application will now handle missing Python dependencies more gracefully
   - If you want to run without the AI service, the server will still function

### Port Conflicts

1. **Port Already in Use**
   - The default port is 5000, which might be used by other applications
   - Change the PORT in `.env` file if needed
   - Use the cleanup script to ensure no conflicting processes are running

## Quick Start Guide

### Step 1: Clean Up Existing Processes

Run the cleanup script to stop any running server instances:

```bash
node cleanup.js
```

### Step 2: Start the Server

You have multiple options to start the server:

1. **Full Application (Node.js + AI Service)**
   ```bash
   npm run start
   ```

2. **Node.js Server Only (without AI)**
   ```bash
   npm run server
   ```

3. **AI Service Only**
   ```bash
   npm run ai
   ```

### Step 3: Verify the Server is Running

Open your browser and navigate to:
```
http://localhost:5000
```

You should see "Welcome to TurfX API" if the server is running correctly.

## Advanced Troubleshooting

### Database Issues

If you're still experiencing database connection issues:

1. **Check MongoDB Logs**
   - Look for error messages in MongoDB logs
   - Verify MongoDB is listening on the expected port (default: 27017)

2. **Try Alternative Connection**
   - Consider using MongoDB Atlas (cloud-hosted MongoDB)
   - Update your `.env` file with the new connection string

### AI Service Issues

If the AI matchmaking service is not working:

1. **Check Python Environment**
   - Verify Python and pip are correctly installed
   - Try manually installing requirements: `pip install -r ai_matchmaking/requirements.txt`

2. **Check FastAPI Service**
   - The FastAPI service should be running on port 8000
   - Verify with: `http://localhost:8000/docs`

### Still Having Issues?

If you're still experiencing problems:

1. Check the application logs for specific error messages
2. Try running the server in development mode for more detailed logs
3. Ensure all required environment variables are set in the `.env` file