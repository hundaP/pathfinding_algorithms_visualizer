#!/bin/bash
set -e

# Install dependencies
sudo apt update
sudo apt install -y software-properties-common

# Add Neovim PPA and install the latest version
sudo add-apt-repository ppa:neovim-ppa/stable
sudo apt update
sudo apt install -y neovim

# Clone the Neovim configuration repository
rm -rf ~/.config/nvim
git clone https://github.com/TheCowPlays/kickstart.nvim.git ~/.config/nvim

# Optional: Install Neovim plugins (assuming you use a plugin manager like vim-plug)
nvim +PlugInstall +qa

