$ErrorActionPreference = "Stop"
if (Test-Path "C:\Users\sarha\.jdks\jbr-21.0.11") {
    $env:JAVA_HOME = "C:\Users\sarha\.jdks\jbr-21.0.11"
} else {
    $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
}
$gradleBat = "C:\Users\sarha\.gradle\wrapper\dists\gradle-8.5-bin\5t9huq95ubn472n8rpzujfbqh\gradle-8.5\bin\gradle.bat"

Write-Host "Cleaning and building fresh Android Release APKs (v2.1.0)..."
Set-Location -Path (Join-Path $PSScriptRoot "..\android")
& $gradleBat clean assembleRelease

$memberApk = Join-Path $PSScriptRoot "..\android\app\build\outputs\apk\member\release\NinaKurain_VIP_release.apk"
$adminApk = Join-Path $PSScriptRoot "..\android\app\build\outputs\apk\admin\release\NinaKurain_Studio_release.apk"

# Delete any old legacy named APKs
$legacyMember = Join-Path $PSScriptRoot "..\public\downloads\Nina-Kurain-Signature-Edition.apk"
$legacyAdmin = Join-Path $PSScriptRoot "..\public\downloads\Nina-Kurain-Admin-Studio.apk"
if (Test-Path $legacyMember) { Remove-Item -Force $legacyMember }
if (Test-Path $legacyAdmin) { Remove-Item -Force $legacyAdmin }

if (Test-Path $memberApk) {
    $dest1 = Join-Path $PSScriptRoot "..\public\downloads\NinaKurain.apk"
    Copy-Item -Path $memberApk -Destination $dest1 -Force
    Write-Host "Successfully generated NEW VIP Member APK: public/downloads/NinaKurain.apk"
} else {
    Write-Warning "Member Release APK not found at $memberApk"
}

if (Test-Path $adminApk) {
    $adminDest1 = Join-Path $PSScriptRoot "..\public\downloads\NinaKurainStudio.apk"
    Copy-Item -Path $adminApk -Destination $adminDest1 -Force
    Write-Host "Successfully generated NEW Creator Studio APK: public/downloads/NinaKurainStudio.apk"
} else {
    Write-Warning "Admin Release APK not found at $adminApk"
}
