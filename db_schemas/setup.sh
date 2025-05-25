#!/bin/bash

# Database configuration
DB_USER="root"
DB_PASS=""
DB_NAME="fcommerce"

# Create database if it doesn't exist
mysql -u$DB_USER ${DB_PASS:+-p$DB_PASS} -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Execute all SQL files in order
for file in $(ls -v *.sql); do
  echo "Executing $file..."
  mysql -u$DB_USER ${DB_PASS:+-p$DB_PASS} $DB_NAME < $file
done

echo "Database setup completed!" 