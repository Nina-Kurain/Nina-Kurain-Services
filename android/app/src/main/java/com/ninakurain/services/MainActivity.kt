package com.ninakurain.services

import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

/**
 * Nina Kurain Official Secure Android Application Activity
 * 
 * Hardware-level FLAG_SECURE prevents screenshots, screen recordings, 
 * and app-switcher previews across all Android versions.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ENFORCE HARDWARE-LEVEL OS SCREENSHOT RESTRICTION
        // Displays native system toast: "Can't take screenshot due to security policy"
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )

        webView = WebView(this)
        setContentView(webView)

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.userAgentString = settings.userAgentString + " NinaKurainApp/1.0 (Android; SecureNative)"

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null) {
                    if (url.startsWith("https://vip.ninakurainservices.in") ||
                        url.startsWith("https://ninakurainservices.in/api") ||
                        url.contains("razorpay.com") ||
                        url.contains("accounts.google.com")
                    ) {
                        view?.loadUrl(url)
                        return true
                    }
                }
                return false
            }
        }

        // Exclusively wrap the private VIP member portal
        webView.loadUrl("https://vip.ninakurainservices.in")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
