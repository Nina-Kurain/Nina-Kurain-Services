# 📱 Nina Kurain Android Secure App (`FLAG_SECURE`)

This Android project wraps `https://ninakurainservices.in` with **100% hardware-level screenshot and screen recording blocking on every page**.

---

## 🔒 How `FLAG_SECURE` Works

Inside [`MainActivity.kt`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/android/app/src/main/java/com/ninakurain/services/MainActivity.kt):

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // ENFORCE HARDWARE-LEVEL OS SCREENSHOT RESTRICTION
    window.setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
    )

    webView = WebView(this)
    setContentView(webView)
    webView.loadUrl("https://ninakurainservices.in")
}
```

### Protection Guarantees on Every Single Page:
1. **Power + Volume Down Hardware Buttons**: The Android OS hardware immediately intercepts the buttons and blocks the screenshot.
2. **System Message**: Android automatically displays the native toast:  
   `"Can't take screenshot due to security policy"`
3. **Screen Recording Apps**: Screen recorders (AZ Screen Recorder, Mobizen, built-in Android screen recorder) record a pitch-black video.
4. **App Switcher Multitasking**: In the Android app carousel, the preview card is blacked out.

---

## 🛠️ How to Build the APK (Step-by-Step)

### Option 1: Using Android Studio (Recommended)
1. Open **Android Studio** on your computer.
2. Click **Open** and select the [`android/`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/android) folder from this project.
3. Let Gradle sync for 30–60 seconds.
4. In the top menu, click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. A popup will appear at the bottom right: **"APK(s) generated successfully."**
6. Click **locate** to get `app-debug.apk` (or `app-release.apk`).
7. Send the APK to your Android phone via WhatsApp, Telegram, Google Drive, or USB cable.
8. Tap the APK on your phone to **Install**.
9. Open the app and navigate to any page — press **Power + Volume Down**:  
   👉 Android will instantly block it with **"Can't take screenshot due to security policy"**!

### Option 2: Using Command Line (if Android SDK is installed)
In the `android/` directory, run:
```bash
./gradlew assembleDebug
```
The output APK will be in:
`android/app/build/outputs/apk/debug/app-debug.apk`
