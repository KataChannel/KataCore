#!/bin/bash
# Script to merge two swap files into one on Ubuntu

# Step 1: Check current swap usage
echo "Current swap status:"
swapon --show

# Step 2: Disable all swap files
echo "Disabling all swap files..."
sudo swapoff -a

# Step 3: Remove the unwanted swap file (/swap.img)
echo "Removing /swap.img..."
sudo rm /swap.img

# Step 4: Resize or recreate the remaining swapfile to desired size (e.g., 16G)
echo "Creating new swapfile with 16G size..."
sudo fallocate -l 16G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Step 5: Update /etc/fstab to use only the new swapfile
echo "Updating /etc/fstab..."
sudo sed -i '/swap/d' /etc/fstab
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab

# Step 6: Verify the new swap configuration
echo "Verifying new swap status..."
swapon --show
free -h

echo "Swap merge completed. Only /swapfile is active."