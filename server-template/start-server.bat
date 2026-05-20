@echo off
REM Skyforge server launcher (Windows). Requires Java 21 on PATH.
REM Auto-updates from GitHub (packwiz) on every start, then launches
REM with Aikar's flags + 12 GB heap. Adjust SKYFORGE_RAM if you have
REM more or less RAM available.
REM
REM To disable auto-update (testing): set SKYFORGE_AUTOUPDATE=0

set SKYFORGE_RAM=12G
set SKYFORGE_NEOFORGE=21.1.228
set SKYFORGE_PACK_URL=https://raw.githubusercontent.com/TZUAE86/skyforge/main/pack.toml
if "%SKYFORGE_AUTOUPDATE%"=="" set SKYFORGE_AUTOUPDATE=1

REM === sanity checks ===
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java not on PATH. Install Java 21 from https://adoptium.net/
    pause & exit /b 1
)
if not exist run.bat (
    echo [ERROR] run.bat not found. Run the NeoForge installer first:
    echo        java -jar neoforge-%SKYFORGE_NEOFORGE%-installer.jar --installServer
    echo        See README.md for full setup.
    pause & exit /b 1
)

REM === auto-update from GitHub (packwiz) ===
if "%SKYFORGE_AUTOUPDATE%"=="1" (
    if not exist packwiz-installer-bootstrap.jar (
        echo [Skyforge] packwiz-installer-bootstrap.jar missing - fetching latest...
        curl -fsSL -o packwiz-installer-bootstrap.jar ^
            https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar
    )
    echo [Skyforge] syncing from %SKYFORGE_PACK_URL% (server side)...
    java -jar packwiz-installer-bootstrap.jar -g --side server "%SKYFORGE_PACK_URL%"
)

REM === Aikar's flags (G1GC tuned for modded Minecraft) ===
set JVM_FLAGS=-Xms%SKYFORGE_RAM% -Xmx%SKYFORGE_RAM% ^
 -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 ^
 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch ^
 -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M ^
 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 ^
 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 ^
 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 ^
 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 ^
 -Daikars.new.flags=true -Dusing.aikars.flags=https://mcflags.emc.gs

REM Inject the flags into the run.bat NeoForge generated, then exec it.
REM run.bat reads user_jvm_args.txt for extra args.
> user_jvm_args.txt echo %JVM_FLAGS%
echo Starting Skyforge server with %SKYFORGE_RAM% heap...
call run.bat nogui
