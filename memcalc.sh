#!/bin/bash

# Collect memory values (in kB)
MEM_TOTAL_KB=$(grep "^MemTotal:" /proc/meminfo | awk '{print $2}')
MEM_AVAILABLE_KB=$(grep "^MemAvailable:" /proc/meminfo | awk '{print $2}')

# Calculate used memory (in kB)
MEM_USED_KB=$((MEM_TOTAL_KB - MEM_AVAILABLE_KB))

# Convert kB to GB (1 GB = 1024^2 kB)
MEM_TOTAL_GB=$(awk "BEGIN {printf \"%.2f\", $MEM_TOTAL_KB/1024/1024}")
MEM_USED_GB=$(awk "BEGIN {printf \"%.2f\", $MEM_USED_KB/1024/1024}")

# Output
echo "MEM: ${MEM_USED_GB}GB / ${MEM_TOTAL_GB}GB"

