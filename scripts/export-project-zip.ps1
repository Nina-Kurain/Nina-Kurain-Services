# Export script for Nina Kurain Membership project
# Ensures build/ (sites-vite-plugin) is included while excluding node_modules, .git, and local build artifacts.

$ErrorActionPreference = "Stop"

$workspaceRoot = $PSScriptRoot | Split-Path -Parent
$parentDir = $workspaceRoot | Split-Path -Parent
$tempExportDir = Join-Path $env:TEMP ("nina-export-" + [System.Guid]::NewGuid().ToString().Substring(0, 8))
$targetFolder = Join-Path $tempExportDir "nina-kurain-membership"

Write-Host "Creating clean export directory at $targetFolder..."
New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null

$itemsToCopy = @(
    ".env.example",
    ".github",
    ".gitignore",
    ".npmrc",
    ".openai",
    "android",
    "app",
    "build",
    "cloudflare-env.d.ts",
    "components",
    "components.json",
    "db",
    "drizzle",
    "drizzle.config.ts",
    "eslint.config.mjs",
    "hooks",
    "ios",
    "lib",
    "next-env.d.ts",
    "next.config.ts",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "postcss.config.mjs",
    "public",
    "README.md",
    "scripts",
    "security",
    "securty",
    "sites",
    "tsconfig.json",
    "vendor",
    "vite.config.ts"
)

foreach ($item in $itemsToCopy) {
    $src = Join-Path $workspaceRoot $item
    if (Test-Path $src) {
        $dest = Join-Path $targetFolder $item
        Write-Host "Copying $item..."
        Copy-Item -Path $src -Destination $dest -Recurse -Force
    } else {
        Write-Warning "Item not found: $item"
    }
}

# Clean out android build caches if present in the copied folder
$androidBuild = Join-Path $targetFolder "android\app\build"
if (Test-Path $androidBuild) {
    Write-Host "Removing android/app/build from export..."
    Remove-Item -Path $androidBuild -Recurse -Force
}
$androidGradle = Join-Path $targetFolder "android\.gradle"
if (Test-Path $androidGradle) {
    Remove-Item -Path $androidGradle -Recurse -Force
}

# Destinations to create
$zipNames = @("nina-kurain-membership-fixed.zip", "nina-kurain-membership-clean.zip", "nina-kurain-membership-latest.zip")

$outputLocations = @($workspaceRoot, $parentDir)
if (Test-Path "C:\Users\sarha\Downloads") {
    $outputLocations += "C:\Users\sarha\Downloads"
}

$primaryZip = Join-Path $workspaceRoot "nina-kurain-membership-fixed.zip"
Write-Host "Compressing to $primaryZip..."
if (Test-Path $primaryZip) { Remove-Item $primaryZip -Force }

Compress-Archive -Path $targetFolder -DestinationPath $primaryZip -CompressionLevel Optimal

# Copy to other filenames and directories
foreach ($loc in $outputLocations) {
    foreach ($name in $zipNames) {
        $destPath = Join-Path $loc $name
        if ($destPath -ne $primaryZip) {
            Write-Host "Writing $destPath..."
            Copy-Item -Path $primaryZip -Destination $destPath -Force
        }
    }
}

# Clean up temp
Remove-Item -Path $tempExportDir -Recurse -Force
Write-Host "Export complete! Zip contains build/sites-vite-plugin and photo canvas fix."
