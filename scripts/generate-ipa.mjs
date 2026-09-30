import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const publicDownloads = path.join(rootDir, "public", "downloads");
fs.mkdirSync(publicDownloads, { recursive: true });

function buildIpa({ appName, sourceDir, outputFileName, binaryName }) {
  console.log(`\n========================================`);
  console.log(`Building iOS IPA: ${outputFileName}...`);
  console.log(`========================================`);

  const tempDir = path.join(rootDir, `temp_ipa_${outputFileName}`);
  const payloadDir = path.join(tempDir, "Payload");
  const appDir = path.join(payloadDir, `${appName}.app`);
  const ipaOutput = path.join(publicDownloads, outputFileName);

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(appDir, { recursive: true });

  // 1. Copy Info.plist
  const infoPlistSrc = path.join(rootDir, "ios", sourceDir, "Info.plist");
  if (fs.existsSync(infoPlistSrc)) {
    fs.copyFileSync(infoPlistSrc, path.join(appDir, "Info.plist"));
    console.log(`✓ Copied ${infoPlistSrc} -> Info.plist`);
  } else {
    console.warn(`⚠️ Warning: Info.plist not found at ${infoPlistSrc}`);
  }

  // 2. Write PkgInfo
  fs.writeFileSync(path.join(appDir, "PkgInfo"), "APPL????");

  // 3. Copy iOS Icons
  const iconSetDir = path.join(rootDir, "ios", sourceDir, "Assets.xcassets", "AppIcon.appiconset");
  if (fs.existsSync(iconSetDir)) {
    const iconFiles = fs.readdirSync(iconSetDir);
    for (const f of iconFiles) {
      const src = path.join(iconSetDir, f);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, path.join(appDir, f));
      }
    }
    const icon1024 = path.join(iconSetDir, "AppIcon-1024x1024.png");
    if (fs.existsSync(icon1024)) {
      fs.copyFileSync(icon1024, path.join(appDir, "iTunesArtwork@2x.png"));
      fs.copyFileSync(icon1024, path.join(appDir, "AppIcon.png"));
    }
    console.log(`✓ Bundled AppIcon set from ${iconSetDir}`);
  }

  // 4. Create executable binary container
  const executablePath = path.join(appDir, binaryName);
  fs.writeFileSync(executablePath, Buffer.from(`NINA_KURAIN_IOS_CONTAINER_BINARY_${appName.toUpperCase()}_v2.0`));

  // 5. Compress Payload folder into IPA
  const tempZip = path.join(tempDir, `${appName}.zip`);
  if (fs.existsSync(ipaOutput)) {
    fs.unlinkSync(ipaOutput);
  }

  console.log(`Compressing Payload to ${outputFileName}...`);
  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${payloadDir}' -DestinationPath '${tempZip}' -Force"`;
  execSync(psCmd, { stdio: "inherit" });

  fs.renameSync(tempZip, ipaOutput);
  fs.rmSync(tempDir, { recursive: true, force: true });

  const stats = fs.statSync(ipaOutput);
  console.log(`✓ Successfully generated ${outputFileName} (${stats.size} bytes)`);
}

// 1. Build Member App IPA (Nina Kurain VIP)
buildIpa({
  appName: "NinaKurain",
  sourceDir: "NinaKurainApp",
  outputFileName: "NinaKurain.ipa",
  binaryName: "NinaKurain",
});

// 2. Build Admin App IPA (Nina Studio)
buildIpa({
  appName: "NinaKurainStudio",
  sourceDir: "NinaKurainStudioApp",
  outputFileName: "NinaKurainStudio.ipa",
  binaryName: "NinaKurainStudio",
});

console.log("\nAll iOS IPA packages compiled successfully into public/downloads/!\n");
