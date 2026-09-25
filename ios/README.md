# 🍎 Nina Kurain iOS Secure Application Architecture

This iOS Xcode project provides **hardware-enforced screenshot and screen recording blocking** on iPhone and iPad, serving as the iOS equivalent to Android's `FLAG_SECURE`.

---

## 🔒 How iOS Hardware Protection Works

In iOS, there is no direct `FLAG_SECURE` constant, but Apple's QuartzCore rendering pipeline provides an exact hardware equivalent:

### 1. `UITextField.isSecureTextEntry = true` Layer Embedding
Inside [`ViewController.swift`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/ios/NinaKurainApp/ViewController.swift):
```swift
let field = UITextField()
field.isSecureTextEntry = true
view.addSubview(field)

// Embed WKWebView into the secure sublayer of the secure textfield
if let secureCanvas = field.subviews.first {
    secureCanvas.addSubview(webView)
}
```
**Why this works:**  
When an element is rendered inside the secure layer of a `UITextField(isSecureTextEntry = true)`, the iOS graphics server (`renderServer`) flags the display surface as secure. Whenever the user attempts a hardware screenshot (**Power + Volume Up** on iPhone), iOS automatically records **pure blackness** with zero millisecond delay.

---

### 2. Screen Recording & AirPlay Detection
iOS triggers `UIScreen.capturedDidChangeNotification` whenever:
- iOS Control Center Screen Recording starts
- AirPlay screen mirroring starts
- An external HDMI capture card or monitor is connected

```swift
@objc private func handleScreenRecordingState() {
    if UIScreen.main.isCaptured {
        webView.alpha = 0.0 // Blank the web view completely
    } else {
        webView.alpha = 1.0
    }
}
```

---

### 3. iOS Multitasking / App Switcher Obfuscation
Inside [`AppDelegate.swift`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/ios/NinaKurainApp/AppDelegate.swift), `applicationWillResignActive` immediately overlays a security shield so that iOS cannot capture a thumbnail preview when the user enters the app carousel.

---

### 4. Screenshot Event & Clipboard Poisoning
When a screenshot notification fires (`UIApplication.userDidTakeScreenshotNotification`), the app immediately poisons the iOS general pasteboard (`UIPasteboard.general.string`) and alerts the user with:
> **"This website does not allow screenshots on mobile or desktop devices. Protected media is confidential."**

---

## 🛠️ How to Open and Build

### Option A: Open Directly in Xcode (macOS)
The ready-to-run Xcode project is already created for you in this directory:
1. Open the project directly:
   Double-click [`ios/NinaKurain.xcodeproj`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/ios/NinaKurain.xcodeproj) in Finder on macOS.
2. In Xcode:
   - Select your team under **Signing & Capabilities** (your free or paid Apple Developer ID).
   - Select your target device (e.g. your physical iPhone or iPad connected via USB).
3. Press **Cmd + R** (Run) to install and launch directly on your device.

---

### Option B: Build from Windows using GitHub Actions (Cloud macOS Runner)
If you are on Windows and don't have a Mac handy:
1. Push this project to your GitHub repository.
2. In GitHub, go to **Actions** -> select **Build iOS App** -> click **Run workflow**.
3. GitHub automatically runs a macOS virtual machine (`macos-14`), compiles `NinaKurain.xcodeproj`, packages the `.ipa`, and gives you a downloadable `NinaKurain-iOS-App.zip` containing the compiled IPA artifact!
4. Install the `.ipa` onto your iPhone using:
   - **AltStore** (free PC/Mac sideloading tool)
   - **Sideloadly** (drag-and-drop IPA installer from Windows)
   - Or upload to **Apple TestFlight** via App Store Connect.

### Verification on Physical iPhone:
1. Navigate through any page containing protected photos or videos.
2. Press **Power Button + Volume Up** simultaneously:
   - The captured photo in Apple Photos will be **completely pitch black**.
3. Open Control Center and tap **Screen Recording**:
   - The screen recording output will record only a black canvas (`alpha = 0.0`).
4. Swipe up to the App Switcher:
   - The preview card displays the privacy shield: `"🔒 NINA KURAIN · PROTECTED SECURE CONTENT"`.
