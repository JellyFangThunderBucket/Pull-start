#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "  RHEL 10 Setup — Part 4 of 4"
echo "  HashiCorp, Security, Firewall,"
echo "  Shell, Version Managers, Cleanup"
echo "=========================================="

# =============================================================================
# HashiCorp tools (Terraform, Vault, Packer)
# =============================================================================
sudo dnf config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
sudo dnf install -y terraform vault packer

# =============================================================================
# Security tools
# =============================================================================
sudo dnf install -y fail2ban aide
sudo systemctl enable --now fail2ban
sudo aide --init && sudo mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz || true

# =============================================================================
# Firewall
# =============================================================================
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# =============================================================================
# Chrony (NTP)
# =============================================================================
sudo dnf install -y chrony
sudo systemctl enable --now chronyd

# =============================================================================
# Shell improvements
# =============================================================================
sudo dnf install -y zsh util-linux-user
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# =============================================================================
# Version managers
# =============================================================================

# nvm
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# pyenv
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
echo "  ALL DONE! Setup complete!"
echo ""
echo "  IMPORTANT — next steps:"
echo "  1. Log out and back in (Docker group, Rust PATH, nvm, pyenv)"
echo "  2. Run: sudo mysql_secure_installation  (set MariaDB root password)"
echo "  3. Cockpit web console: https://<your-ip>:9090"
echo "  4. Review firewalld rules before opening additional ports"
echo "  5. Check SELinux status with: getenforce"
echo "=========================================="
