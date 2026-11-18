#!/usr/bin/env bash
set -e

echo "1. Configuring postgresql.conf and pg_hba.conf..."
sudo sed -i "s/port = 5432/port = 5433/" /etc/postgresql/14/main/postgresql.conf
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/14/main/postgresql.conf
echo 'host all all 0.0.0.0/0 md5' | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
echo 'host all all ::0/0 md5' | sudo tee -a /etc/postgresql/14/main/pg_hba.conf

echo "2. Restarting postgresql..."
sudo service postgresql restart

echo "3. Creating user and database..."
sudo -u postgres psql -p 5433 -tc "SELECT 1 FROM pg_user WHERE usename = 'inventory_admin'" | grep -q 1 || \
sudo -u postgres psql -p 5433 -c "CREATE USER inventory_admin WITH PASSWORD '@Ndreas120981' SUPERUSER;"

sudo -u postgres psql -p 5433 -tc "SELECT 1 FROM pg_database WHERE datname = 'aicms'" | grep -q 1 || \
sudo -u postgres psql -p 5433 -c "CREATE DATABASE aicms OWNER inventory_admin;"

echo "4. Importing schema and seed data..."
PGPASSWORD='@Ndreas120981' psql -h 127.0.0.1 -p 5433 -U inventory_admin -d aicms -f /mnt/c/Users/admin/kantor-ai-10-agen/data/schema.sql
PGPASSWORD='@Ndreas120981' psql -h 127.0.0.1 -p 5433 -U inventory_admin -d aicms -f /mnt/c/Users/admin/kantor-ai-10-agen/data/seed.sql

echo "5. PostgreSQL setup completed successfully!"
