#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "  RHEL 10 Setup — Part 2 of 4"
echo "  Node.js, Go, Java, Rust, Databases"
echo "=========================================="

# =============================================================================
# Node.js
# =============================================================================
sudo dnf module enable -y nodejs:22
sudo dnf install -y nodejs npm
sudo npm install -g yarn pnpm typescript ts-node nodemon pm2

# =============================================================================
# Go
# =============================================================================
sudo dnf install -y golang

# =============================================================================
# Java (OpenJDK 21 LTS)
# =============================================================================
sudo dnf install -y \
  java-21-openjdk java-21-openjdk-devel \
  maven gradle

# =============================================================================
# Rust
# =============================================================================
if ! command -v rustup &>/dev/null; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env"
fi

# =============================================================================
# Databases
# =============================================================================

# PostgreSQL
sudo dnf module enable -y postgresql:16
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# MariaDB
sudo dnf install -y mariadb-server mariadb
sudo systemctl enable --now mariadb
sudo mysql_secure_installation --non-interactive 2>/dev/null || true

# SQLite
sudo dnf install -y sqlite

# Redis
sudo dnf install -y redis
sudo systemctl enable --now redis

# MongoDB
cat <<'EOF' | sudo tee /etc/yum.repos.d/mongodb-org-7.repo
[mongodb-org-7]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
sudo dnf install -y mongodb-org
sudo systemctl enable --now mongod

echo ""
echo "=========================================="
echo "  Part 2 complete!"
echo "  Run rhel10-setup-part3.sh next."
echo "=========================================="
