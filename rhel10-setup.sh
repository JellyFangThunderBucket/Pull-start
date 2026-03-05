#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# RHEL 10 Full Server Setup Script
# =============================================================================

echo "=========================================="
echo "  RHEL 10 Full Server Setup"
echo "=========================================="

# =============================================================================
# System update
# =============================================================================
sudo dnf update -y
sudo dnf upgrade -y

# =============================================================================
# Enable EPEL (Extra Packages for Enterprise Linux)
# Many tools (htop, ncdu, iftop, etc.) require EPEL on RHEL
# =============================================================================
sudo dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-10.noarch.rpm || \
  sudo dnf install -y epel-release
sudo dnf config-manager --set-enabled epel

# =============================================================================
# Essential build tools and development packages
# =============================================================================
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y \
  gcc gcc-c++ make cmake ninja-build \
  git git-lfs curl wget vim-enhanced nano \
  htop net-tools dnf-plugins-core \
  ca-certificates gnupg2 openssl \
  unzip zip tar gzip bzip2 xz p7zip \
  bash-completion tree rsync \
  jq yq bc patch \
  lsof strace ltrace \
  nmap tcpdump \
  bind-utils telnet \
  tmux screen \
  ripgrep fd-find fzf bat

# Development libraries (needed for compiling most software)
sudo dnf install -y \
  openssl-devel libffi-devel zlib-devel \
  readline-devel sqlite-devel bzip2-devel \
  xz-devel ncurses-devel gdbm-devel \
  libuuid-devel libyaml-devel libxml2-devel \
  libxslt-devel libcurl-devel \
  systemd-devel

# =============================================================================
# System monitoring and performance tools
# =============================================================================
sudo dnf install -y \
  sysstat iotop iftop ncdu \
  dstat glances \
  perf tuned \
  cockpit        # RHEL web console (browser-based system management)

sudo systemctl enable --now cockpit.socket
sudo systemctl enable --now tuned
sudo tuned-adm profile throughput-performance

# =============================================================================
# Python
# =============================================================================
sudo dnf install -y \
  python3 python3-pip python3-devel \
  python3-virtualenv python3-setuptools python3-wheel

# Upgrade pip
python3 -m pip install --upgrade pip

# Common Python tools
pip3 install --user \
  virtualenv pipenv poetry \
  ipython httpie \
  ansible black flake8 mypy

# =============================================================================
# Node.js (LTS via dnf module stream)
# =============================================================================
sudo dnf module enable -y nodejs:22
sudo dnf install -y nodejs npm

# Global Node tools
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
# Database systems
# =============================================================================

# PostgreSQL (latest stream)
sudo dnf module enable -y postgresql:16
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# MariaDB (drop-in MySQL replacement; preferred on RHEL over MySQL Community)
sudo dnf install -y mariadb-server mariadb
sudo systemctl enable --now mariadb
sudo mysql_secure_installation --non-interactive 2>/dev/null || true

# SQLite
sudo dnf install -y sqlite

# Redis
sudo dnf install -y redis
sudo systemctl enable --now redis

# MongoDB (Community Edition via repo)
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

# =============================================================================
# Web servers
# =============================================================================

# Nginx
sudo dnf install -y nginx
sudo systemctl enable --now nginx

# Apache (httpd on RHEL, not apache2)
sudo dnf install -y httpd
sudo systemctl enable --now httpd

# PHP
sudo dnf install -y \
  php php-cli php-fpm php-mysqlnd \
  php-curl php-json php-mbstring \
  php-xml php-zip php-gd php-intl \
  php-opcache php-bcmath
sudo systemctl enable --now php-fpm

# =============================================================================
# Docker CE
# =============================================================================
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y \
  docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

# =============================================================================
# Podman + Buildah + Skopeo (RHEL-native OCI container tools)
# =============================================================================
sudo dnf install -y podman buildah skopeo

# =============================================================================
# Kubernetes tooling
# =============================================================================

# kubectl
cat <<'EOF' | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/repodata/repomd.xml.key
EOF
sudo dnf install -y kubectl

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# k9s (Kubernetes TUI)
GOBIN=/usr/local/bin go install github.com/derailed/k9s@latest 2>/dev/null || true

# =============================================================================
# HashiCorp tools (Terraform, Vault, Packer)
# =============================================================================
sudo dnf config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
sudo dnf install -y terraform vault packer

# =============================================================================
# Security tools
# =============================================================================
sudo dnf install -y \
  fail2ban \
  aide          # Intrusion detection (file integrity)
  # SELinux tools (already included in RHEL base)

sudo systemctl enable --now fail2ban

# Initialize AIDE database
sudo aide --init && sudo mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz || true

# =============================================================================
# Firewall (firewalld — replaces ufw on RHEL)
# =============================================================================
sudo systemctl enable --now firewalld

# Allow SSH only by default
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# =============================================================================
# Chrony (NTP time sync — replaces ntpd on modern RHEL)
# =============================================================================
sudo dnf install -y chrony
sudo systemctl enable --now chronyd

# =============================================================================
# Shell and terminal improvements
# =============================================================================
sudo dnf install -y zsh util-linux-user
# Install Oh My Zsh for current user (optional, comment out if not wanted)
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# =============================================================================
# Version managers (optional convenience)
# =============================================================================

# nvm (manage multiple Node.js versions)
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# pyenv (manage multiple Python versions)
if [ ! -d "$HOME/.pyenv" ]; then
  curl https://pyenv.run | bash
fi

# =============================================================================
# Cleanup
# =============================================================================
sudo dnf autoremove -y
sudo dnf clean all

echo ""
echo "=========================================="
echo "  Setup complete!"
echo ""
echo "  IMPORTANT — next steps:"
echo "  1. Log out and back in (Docker group, Rust PATH, nvm, pyenv)"
echo "  2. Run: sudo mysql_secure_installation  (set MariaDB root password)"
echo "  3. Cockpit web console: https://<your-ip>:9090"
echo "  4. Review firewalld rules before opening additional ports"
echo "  5. Check SELinux status with: getenforce"
echo "=========================================="
