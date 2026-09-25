$ErrorActionPreference = "Stop"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$gradleBat = "C:\Users\sarha\.gradle\wrapper\dists\gradle-8.5-bin\5t9huq95ubn472n8rpzujfbqh\gradle-8.5\bin\gradle.bat"

Write-Host "Building Android Release APK targeting https://vip.ninakurainservices.in ..."
Set-Location -Path (Join-Path $PSScriptRoot "..\android")
& $gradleBat assembleRelease

$outputApk = Join-Path $PSScriptRoot "..\android\app\build\outputs\apk\release\NinaKurain_Signature_Services_release.apk"
if (Test-Path $outputApk) {
    $dest1 = Join-Path $PSScriptRoot "..\public\downloads\NinaKurain.apk"
    $dest2 = Join-Path $PSScriptRoot "..\public\downloads\Nina-Kurain-Signature-Edition.apk"
    Copy-Item -Path $outputApk -Destination $dest1 -Force
    Copy-Item -Path $outputApk -Destination $dest2 -Force
    Write-Host "Successfully copied newly compiled APK to public/downloads/NinaKurain.apk"
} else {
    Write-Error "Release APK not found at $outputApk"
}
