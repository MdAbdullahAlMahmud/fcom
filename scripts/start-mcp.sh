#!/bin/bash

# Kill any existing process on port 3009
echo "Checking for existing MCP server..."
if lsof -i :3009 > /dev/null; then
    echo "Found existing MCP server, stopping it..."
    lsof -ti :3009 | xargs kill -9
    sleep 1
fi

# Start the MCP server
echo "Starting MCP server..."
tsx lib/db/mcp-server.ts &

# Wait for the server to start
sleep 2

# Check if the server is running
if curl -s http://localhost:3009/schema > /dev/null; then
    echo "MCP server is running on port 3009"
    echo "Cursor can now access the database schema and execute queries"
else
    echo "Failed to start MCP server"
    exit 1
fi 