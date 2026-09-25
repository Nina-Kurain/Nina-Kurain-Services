import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const iconPath = path.join(rootDir, "public", "apple-touch-icon.png");
const outputPath = path.join(rootDir, "public", "downloads", "NinaKurain.mobileconfig");

if (!fs.existsSync(iconPath)) {
  console.error("Icon not found at:", iconPath);
  process.exit(1);
}

const iconBase64 = fs.readFileSync(iconPath).toString("base64");

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${iconBase64}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>Nina Kurain VIP</string>
            <key>PayloadDescription</key>
            <string>Nina Kurain VIP Official App WebClip</string>
            <key>PayloadDisplayName</key>
            <string>Nina Kurain VIP</string>
            <key>PayloadIdentifier</key>
            <string>in.ninakurainservices.vip.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>4e6a8d6e-93b5-4b53-9f37-67c2d790f912</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://vip.ninakurainservices.in/feed</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Nina Kurain Official VIP App</string>
    <key>PayloadIdentifier</key>
    <string>in.ninakurainservices.vip.profile</string>
    <key>PayloadOrganization</key>
    <string>Nina Kurain Services</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>a789ef23-6b12-4f76-bc34-921857ef190a</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
`;

fs.writeFileSync(outputPath, plist.trim() + "\n", "utf8");
console.log(`Generated iOS mobileconfig at ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
