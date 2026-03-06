#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "  RHEL 10 Setup — Part 1 of 4"
echo "  System update, EPEL, Build Tools,"
echo "  Monitoring, Python"
echo "=========================================="

# =============================================================================
# System update
# =============================================================================
sudo dnf update -y
sudo dnf upgrade -y

# =============================================================================
# Enable EPEL
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

# Development libraries
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
  cockpit

sudo systemctl enable --now cockpit.socket
sudo systemctl enable --now tuned
sudo tuned-adm profile throughput-performance

# =============================================================================
# Python
# =============================================================================
sudo dnf install -y \
  python3 python3-pip python3-devel \
  python3-virtualenv python3-setuptools python3-wheel

python3 -m pip install --upgrade pip

pip3 install --user \
  virtualenv pipenv poetry \
  ipython httpie \
  ansible black flake8 mypy

echo ""
echo "=========================================="
echo "  Part 1 complete!"
echo "  Run rhel10-setup-part2.sh next."
echo "=========================================="
