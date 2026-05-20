#!/usr/bin/env bash
# Skyforge server launcher (Linux / WSL / macOS). Requires Java 21 on PATH.
# Auto-updates from GitHub (packwiz) on every start, then launches with
# Aikar's flags + 12 GB heap. Adjust SKYFORGE_RAM below if you have more
# or less RAM available.
#
# To disable auto-update (e.g. testing): SKYFORGE_AUTOUPDATE=0 ./start-server.sh

set -euo pipefail

SKYFORGE_RAM="${SKYFORGE_RAM:-12G}"
SKYFORGE_NEOFORGE="${SKYFORGE_NEOFORGE:-21.1.228}"
SKYFORGE_PACK_URL="${SKYFORGE_PACK_URL:-https://raw.githubusercontent.com/TZUAE86/skyforge/main/pack.toml}"
SKYFORGE_AUTOUPDATE="${SKYFORGE_AUTOUPDATE:-1}"

# === sanity checks ===
command -v java >/dev/null 2>&1 || {
    echo "[ERROR] Java not on PATH. Install Java 21 (e.g. apt install openjdk-21-jre-headless)."
    exit 1
}
[[ -f run.sh ]] || {
    echo "[ERROR] run.sh not found. Run the NeoForge installer first:"
    echo "        java -jar neoforge-${SKYFORGE_NEOFORGE}-installer.jar --installServer"
    echo "        See README.md for full setup."
    exit 1
}

# === auto-update from GitHub (packwiz) ===
if [[ "$SKYFORGE_AUTOUPDATE" == "1" ]]; then
    if [[ ! -f packwiz-installer-bootstrap.jar ]]; then
        echo "[Skyforge] packwiz-installer-bootstrap.jar missing — fetching latest..."
        curl -fsSL -o packwiz-installer-bootstrap.jar \
            https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar
    fi
    echo "[Skyforge] syncing from ${SKYFORGE_PACK_URL} (server side)..."
    java -jar packwiz-installer-bootstrap.jar -g --side server "${SKYFORGE_PACK_URL}"
fi

# === Aikar's flags (G1GC tuned for modded Minecraft) ===
read -r -d '' JVM_FLAGS <<EOF || true
-Xms${SKYFORGE_RAM} -Xmx${SKYFORGE_RAM}
-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200
-XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch
-XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M
-XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4
-XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90
-XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32
-XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1
-Daikars.new.flags=true -Dusing.aikars.flags=https://mcflags.emc.gs
EOF

# Inject flags into the run.sh NeoForge generated. run.sh reads user_jvm_args.txt.
echo "$JVM_FLAGS" > user_jvm_args.txt
echo "Starting Skyforge server with ${SKYFORGE_RAM} heap..."
chmod +x run.sh
exec ./run.sh nogui
