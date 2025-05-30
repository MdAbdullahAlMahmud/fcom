# Cursor MCP Server Configuration

This directory contains the configuration for the Model Context Protocol (MCP) server that enables Cursor to understand and interact with your database.

## Setup

1. Start the MCP server:
```bash
npm run mcp:start
```

2. The server will run on `http://localhost:3009`

3. Cursor will automatically detect and use the MCP server configuration from `.cursor/settings.json`

## Features

The MCP server provides:

- Database schema information
- Table relationships
- Column types and constraints
- Index information
- Foreign key relationships
- Query execution capabilities

## Usage in Cursor

Once the MCP server is running, Cursor will:

1. Show database schema in the sidebar
2. Provide code suggestions based on your database structure
3. Help with SQL query writing
4. Show table relationships
5. Display column information

## Configuration

The MCP server configuration is in `.cursor/settings.json`. You can modify:

- Server URL
- Enabled features
- Security settings
- Endpoints

## Troubleshooting

If you encounter issues:

1. Check if the MCP server is running:
```bash
curl http://localhost:3009/schema
```

2. Restart the MCP server:
```bash
npm run mcp:start
```

3. Check Cursor's connection to the MCP server in the settings 