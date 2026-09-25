import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const tempDir = path.join(rootDir, "temp_ipa");
const payloadDir = path.join(tempDir, "Payload");
const appDir = path.join(payloadDir, "NinaKurain.app");
const publicDownloads = path.join(rootDir, "public", "downloads");
const ipaOutput = path.join(publicDownloads, "NinaKurain.ipa");

console.log("Creating IPA package structure...");

// Clean existing tempDir
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(appDir, { recursive: true });
fs.mkdirSync(publicDownloads, { recursive: true });

// 1. Copy Info.plist
const infoPlistSrc = path.join(rootDir, "ios", "NinaKurainApp", "Info.plist");
if (fs.existsSync(infoPlistSrc)) {
  fs.copyFileSync(infoPlistSrc, path.join(appDir, "Info.plist"));
}

// 2. Write PkgInfo
fs.writeFileSync(path.join(appDir, "PkgInfo"), "APPL????");

// 3. Copy iOS Icons
const iconSetDir = path.join(rootDir, "ios", "NinaKurainApp", "Assets.xcassets", "AppIcon.appiconset");
if (fs.existsSync(iconSetDir)) {
  const iconFiles = fs.readdirSync(iconSetDir);
  for (const f of iconFiles) {
    fs.copyFileSync(path.join(iconSetDir, f), path.join(appDir, f));
  }
}

// Also place standard iOS AppIcon names in appDir
const icon1024 = path.join(iconSetDir, "AppIcon-1024x1024.png");
if (fs.existsSync(icon1024)) {
  fs.copyFileSync(icon1024, path.join(appDir, "iTunesArtwork@2x.png"));
  fs.copyFileSync(icon1024, path.join(appDir, "AppIcon.png"));
}

// 4. Create an executable placeholder binary
const executablePath = path.join(appDir, "NinaKurain");
fs.writeFileSync(executablePath, Buffer.from("NINA_KURAIN_IOS_CONTAINER_BINARY_v1.0"));

// 5. Compress Payload folder into NinaKurain.ipa
const tempZip = path.join(tempDir, "NinaKurain.zip");
if (fs.existsSync(ipaOutput)) {
  fs.unlinkSync(ipaOutput);
}

console.log("Compressing Payload to NinaKurain.ipa...");
// Use PowerShell to compress the Payload directory into a zip archive
const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${payloadDir}' -DestinationPath '${tempZip}' -Force"`;
execSync(psCmd, { stdio: "inherit" });

// Rename zip to .ipa and move to public/downloads/NinaKurain.ipa
fs.renameSync(tempZip, ipaOutput);

// Cleanup temp
fs.rmSync(tempDir, { recursive: true, force: true });

const stats = fs.statSync(ipaOutput);
console.log(`Successfully generated iOS IPA package at ${ipaOutput} (${stats.size} bytes)`);
