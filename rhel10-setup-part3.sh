#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "  RHEL 10 Setup — Part 3 of 4"
echo "  Web Servers, Docker, Podman, Kubernetes"
echo "=========================================="

# =============================================================================
# Web servers
# =============================================================================

# Nginx
sudo dnf install -y nginx
sudo systemctl enable --now nginx

# Apache
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
# Podman + Buildah + Skopeo
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

# k9s
GOBIN=/usr/local/bin go install github.com/derailed/k9s@latest 2>/dev/null || true

echo ""
echo "=========================================="
echo "  Part 3 complete!"
echo "  Run rhel10-setup-part4.sh next."
echo "=========================================="
