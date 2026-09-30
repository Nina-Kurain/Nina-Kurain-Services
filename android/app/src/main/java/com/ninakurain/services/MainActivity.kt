package com.ninakurain.services

import android.Manifest
import android.app.Activity
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Message
import android.provider.MediaStore
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

/**
 * Nina Kurain Official Secure Android Application Activity
 * 
 * Hardware-level FLAG_SECURE prevents screenshots and screen recordings for members,
 * while dynamically allowing screenshots when logged in as Admin / Creator.
 * Fully supports media file uploads to Creator Studio and Profile with automated
 * Android runtime permission management (Photos, Videos, Audio, Camera, Microphone).
 * Seamlessly handles Razorpay subscription payments, UPI intent redirects (GPay, PhonePe, Paytm, etc.).
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var isAdminUser = false
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingWebChromePermissionRequest: PermissionRequest? = null

    // ActivityResultLauncher for HTML5 <input type="file"> chooser
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            val clipData = intent?.clipData
            val dataString = intent?.dataString
            val uris = when {
                clipData != null -> {
                    Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                }
                dataString != null -> {
                    arrayOf(Uri.parse(dataString))
                }
                intent?.data != null -> {
                    arrayOf(intent.data!!)
                }
                else -> null
            }
            filePathCallback?.onReceiveValue(uris)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    // ActivityResultLauncher for runtime permissions
    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: (
            ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
        val audioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: (
            ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        )

        // If WebChromeClient was waiting for a camera/mic permission request:
        pendingWebChromePermissionRequest?.let { req ->
            val requestedResources = req.resources
            val grantedResources = mutableListOf<String>()
            for (res in requestedResources) {
                if (res == PermissionRequest.RESOURCE_VIDEO_CAPTURE) {
                    if (cameraGranted) grantedResources.add(res)
                } else if (res == PermissionRequest.RESOURCE_AUDIO_CAPTURE) {
                    if (audioGranted) grantedResources.add(res)
                } else {
                    grantedResources.add(res)
                }
            }
            if (grantedResources.isNotEmpty()) {
                req.grant(grantedResources.toTypedArray())
            } else {
                req.deny()
            }
            pendingWebChromePermissionRequest = null
        }
    }

    /**
     * Request all system permissions required for media access, photos, videos,
     * camera, microphone, notifications, and downloads.
     */
    private fun checkAndRequestAppPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        // 1. Storage & Scoped Media (Android 13+ vs Android 12 and below)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // API 33+
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.READ_MEDIA_IMAGES)
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_VIDEO) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.READ_MEDIA_VIDEO)
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.READ_MEDIA_AUDIO)
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
            if (Build.VERSION.SDK_INT >= 34) { // Android 14+ (API 34+)
                if (ContextCompat.checkSelfPermission(this, "android.permission.READ_MEDIA_VISUAL_USER_SELECTED") != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add("android.permission.READ_MEDIA_VISUAL_USER_SELECTED")
                }
            }
        } else { // Android 12 and below
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            }
        }

        // 2. Camera & Audio (required for Creator Studio media uploads, photo capture & video recording)
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.CAMERA)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionsLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun setAdminMode(isAdmin: Boolean) {
            runOnUiThread {
                isAdminUser = isAdmin
                updateScreenshotSecurity()
            }
        }

        @JavascriptInterface
        fun getAppVersion(): String {
            return BuildConfig.VERSION_NAME
        }
        
        @JavascriptInterface
        fun getAppVersionCode(): Int {
            return BuildConfig.VERSION_CODE
        }

        /**
         * Explicit JavaScript method to request Android media and hardware permissions
         */
        @JavascriptInterface
        fun requestPermissions() {
            runOnUiThread {
                checkAndRequestAppPermissions()
            }
        }

        /**
         * Check if Android media permissions are granted
         */
        @JavascriptInterface
        fun hasMediaPermissions(): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.READ_MEDIA_VIDEO) == PackageManager.PERMISSION_GRANTED
            } else {
                ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
            }
        }

        /**
         * Direct download trigger from JavaScript — bypasses all WebView security restrictions.
         * Called from MobileAppGate download buttons when the user taps "Install".
         */
        @JavascriptInterface
        fun downloadFile(url: String) {
            runOnUiThread {
                try {
                    // First try opening in external browser (most reliable for APK install)
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(intent)
                    Toast.makeText(this@MainActivity, "Opening download...", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    // Fallback: use DownloadManager
                    try {
                        val uri = Uri.parse(url)
                        val dm = getSystemService(DOWNLOAD_SERVICE) as? DownloadManager
                        val req = DownloadManager.Request(uri).apply {
                            val filename = uri.lastPathSegment ?: "NinaKurain-update.apk"
                            setTitle(filename)
                            setDescription("Downloading Nina Kurain update")
                            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                            setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                            setMimeType("application/vnd.android.package-archive")
                        }
                        dm?.enqueue(req)
                        Toast.makeText(this@MainActivity, "Downloading... Check notifications.", Toast.LENGTH_LONG).show()
                    } catch (_: Exception) {
                        Toast.makeText(this@MainActivity, "Please download from Chrome browser.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        /**
         * Opens any URL directly in the system browser (Chrome), bypassing the WebView entirely.
         */
        @JavascriptInterface
        fun openInBrowser(url: String) {
            runOnUiThread {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        // Explicitly try Chrome first
                        setPackage("com.android.chrome")
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    try {
                        // Fallback to default browser
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(intent)
                    } catch (_: Exception) {
                        Toast.makeText(this@MainActivity, "Please open Chrome and visit: $url", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun updateScreenshotSecurity() {
        val isAdminApp = BuildConfig.TARGET_URL.contains("/admin") || BuildConfig.APPLICATION_ID.contains("studio")
        if (isAdminApp || isAdminUser) {
            // Admin authenticated: allow hardware screenshots
            window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        } else {
            // Member: enforce hardware screenshot blocking
            window.setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            )
        }
    }

    /**
     * URL routing for Razorpay, UPI intents, Instagram, file downloads, and web navigation
     */
    private fun handleUrl(view: WebView?, url: String?): Boolean {
        if (url.isNullOrBlank()) return false

        val uri = Uri.parse(url)
        val scheme = uri.scheme?.lowercase() ?: ""

        // 0. Intercept downloadable update packages & files (.apk, .ipa, .mobileconfig, /downloads/)
        val path = uri.path?.lowercase() ?: ""
        val isDownloadable = path.endsWith(".apk") ||
                             path.endsWith(".ipa") ||
                             path.endsWith(".mobileconfig") ||
                             path.startsWith("/downloads/") ||
                             url.contains("/downloads/") ||
                             url.contains("/api/downloads/")

        if (isDownloadable) {
            return try {
                val downloadIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(downloadIntent)
                Toast.makeText(this, "Opening update download...", Toast.LENGTH_SHORT).show()
                true
            } catch (e: Exception) {
                try {
                    val dm = getSystemService(DOWNLOAD_SERVICE) as? DownloadManager
                    val req = DownloadManager.Request(uri).apply {
                        val filename = uri.lastPathSegment ?: "NinaKurain-update.apk"
                        setTitle(filename)
                        setDescription("Downloading Nina Kurain update")
                        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                        setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                    }
                    dm?.enqueue(req)
                    Toast.makeText(this, "Downloading update in background... Check notifications.", Toast.LENGTH_LONG).show()
                } catch (_: Exception) {}
                true
            }
        }

        // 1. Handle UPI payment applications (PhonePe, Google Pay, Paytm, BHIM, Cred, etc.)
        if (scheme == "upi" ||
            scheme == "paytmmp" ||
            scheme == "phonepe" ||
            scheme == "gpay" ||
            scheme == "tez" ||
            scheme == "bhim" ||
            scheme == "credpay"
        ) {
            return try {
                val intent = Intent(Intent.ACTION_VIEW, uri)
                startActivity(intent)
                true
            } catch (e: ActivityNotFoundException) {
                Toast.makeText(this, "No UPI payment app found. Please use Card or Netbanking.", Toast.LENGTH_LONG).show()
                true
            } catch (e: Exception) {
                true
            }
        }

        // 2. Handle Android Intent scheme (used by Razorpay, Instagram applinks, etc.)
        if (scheme == "intent") {
            return handleIntentUrl(url)
        }

        // 3. Handle Instagram direct custom scheme
        if (scheme == "instagram") {
            val instaIntent = Intent(Intent.ACTION_VIEW, uri)
            instaIntent.setPackage("com.instagram.android")
            return try {
                startActivity(instaIntent)
                true
            } catch (e: Exception) {
                try {
                    instaIntent.setPackage("com.instagram.lite")
                    startActivity(instaIntent)
                    true
                } catch (_: Exception) {
                    try {
                        val username = uri.getQueryParameter("username") ?: uri.lastPathSegment ?: "kurain.bae"
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.instagram.com/$username/")))
                    } catch (_: Exception) {}
                    true
                }
            }
        }

        // 4. Handle communication & social schemes (whatsapp, tg, mailto, tel)
        if (scheme == "mailto" || scheme == "tel" || scheme == "whatsapp" || scheme == "tg") {
            return try {
                val intent = Intent(Intent.ACTION_VIEW, uri)
                startActivity(intent)
                true
            } catch (e: Exception) {
                true
            }
        }

        // 5. Handle HTTP/HTTPS URLs
        if (scheme == "http" || scheme == "https") {
            val host = uri.host?.lowercase() ?: ""

            val isInternalOrPayment =
                host == "ninakurainservices.in" ||
                host.endsWith(".ninakurainservices.in") ||
                host == "razorpay.com" ||
                host.endsWith(".razorpay.com") ||
                host == "rzp.io" ||
                host.endsWith(".rzp.io") ||
                host == "accounts.google.com" ||
                host.endsWith(".google.com") ||
                host.contains("bank") ||
                host.contains("card") ||
                host.contains("billdesk") ||
                host.contains("payu") ||
                host.contains("npci")

            if (isInternalOrPayment) {
                // Return false to let the WebView load the URL internally without breaking POST or session data
                return false
            }

            // Handle Instagram web links (e.g. https://www.instagram.com/kurain.bae)
            if (host.contains("instagram.com") || host.contains("instagr.am")) {
                val path = uri.path?.trim('/') ?: ""
                val cleanUser = if (path.isNotEmpty()) path.split('/')[0] else "kurain.bae"
                val webUrl = "https://www.instagram.com/$cleanUser/"

                val appIntent = Intent(Intent.ACTION_VIEW, Uri.parse(webUrl))
                appIntent.setPackage("com.instagram.android")
                try {
                    startActivity(appIntent)
                    return true
                } catch (e: Exception) {
                    try {
                        appIntent.setPackage("com.instagram.lite")
                        startActivity(appIntent)
                        return true
                    } catch (_: Exception) {
                        try {
                            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(webUrl))
                            startActivity(browserIntent)
                            return true
                        } catch (_: Exception) {}
                    }
                }
                return true
            }

            // External non-payment domains open in external browser
            return try {
                val browserIntent = Intent(Intent.ACTION_VIEW, uri)
                startActivity(browserIntent)
                true
            } catch (e: Exception) {
                true
            }
        }

        // Always prevent WebView from attempting to load unknown schemes
        return try {
            val intent = Intent(Intent.ACTION_VIEW, uri)
            startActivity(intent)
            true
        } catch (e: Exception) {
            true
        }
    }

    /**
     * Bulletproof intent:// URL resolver for Android 11+
     * Handles applink.instagram.com, UPI intents, and browser fallback URLs.
     */
    private fun handleIntentUrl(url: String): Boolean {
        try {
            val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME) ?: return true
            intent.addCategory(Intent.CATEGORY_BROWSABLE)
            intent.component = null
            intent.selector = null

            // Special handling for Instagram applinks: intent://applink.instagram.com/...
            val dataUri = intent.data
            val host = dataUri?.host?.lowercase() ?: ""
            if (host.contains("instagram.com") || host.contains("instagr.am") || url.contains("instagram")) {
                val cleanPath = dataUri?.path?.trim('/') ?: "kurain.bae"
                val user = if (cleanPath.isNotEmpty()) cleanPath.split('/')[0] else "kurain.bae"
                val webUrl = "https://www.instagram.com/$user/"

                // Try opening native Instagram app
                val instaIntent = Intent(Intent.ACTION_VIEW, Uri.parse(webUrl)).apply {
                    setPackage("com.instagram.android")
                }
                try {
                    startActivity(instaIntent)
                    return true
                } catch (_: Exception) {
                    try {
                        instaIntent.setPackage("com.instagram.lite")
                        startActivity(instaIntent)
                        return true
                    } catch (_: Exception) {
                        // Open in standard browser
                        try {
                            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(webUrl)))
                            return true
                        } catch (_: Exception) {}
                    }
                }
            }

            // 1. Try launching the intent directly into the destination app
            try {
                startActivity(intent)
                return true
            } catch (_: Exception) {
                // App not installed or restricted by package visibility
            }

            // 2. Check for explicit browser fallback URL
            val fallbackUrl = intent.getStringExtra("browser_fallback_url")
            if (!fallbackUrl.isNullOrBlank()) {
                try {
                    val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl))
                    startActivity(browserIntent)
                    return true
                } catch (_: Exception) {}
            }

            // 3. Fallback to data URI if present (e.g. https://...)
            if (dataUri != null && (dataUri.scheme == "http" || dataUri.scheme == "https")) {
                try {
                    val browserIntent = Intent(Intent.ACTION_VIEW, dataUri)
                    startActivity(browserIntent)
                    return true
                } catch (_: Exception) {}
            }

            // 4. Reconstruct web URL from intent URI if scheme is http/https
            val scheme = intent.scheme
            if (scheme == "https" || scheme == "http") {
                val rawWebUrl = url.replaceFirst("^intent://".toRegex(), "$scheme://")
                    .replaceFirst("#Intent;.*$".toRegex(), "")
                    .replace("applink.instagram.com", "www.instagram.com")
                try {
                    val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(rawWebUrl))
                    startActivity(browserIntent)
                    return true
                } catch (_: Exception) {}
            }

            // 5. If package name is provided and app is not installed, open Google Play Store
            val pkg = intent.`package`
            if (!pkg.isNullOrBlank()) {
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$pkg")))
                    return true
                } catch (_: Exception) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$pkg")))
                        return true
                    } catch (_: Exception) {}
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        // ALWAYS return true for intent:// so the WebView never tries to load it directly
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val isAdminApp = BuildConfig.TARGET_URL.contains("/admin") || BuildConfig.APPLICATION_ID.contains("studio")
        if (isAdminApp) {
            isAdminUser = true
        }
        updateScreenshotSecurity()

        // Check and prompt user for runtime media, camera, and notification permissions
        checkAndRequestAppPermissions()

        webView = WebView(this)
        setContentView(webView)

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.javaScriptCanOpenWindowsAutomatically = true
        settings.setSupportMultipleWindows(true)
        settings.mediaPlaybackRequiresUserGesture = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.userAgentString = settings.userAgentString + " NinaKurainApp/" + BuildConfig.VERSION_NAME + " (Android; SecureNative; v=" + BuildConfig.VERSION_NAME + ")"

        // Add JavaScript interface so web app can dynamically notify Android of admin session and request permissions
        webView.addJavascriptInterface(WebAppInterface(), "AndroidSecurity")

        // Handle file downloads so tapping .apk or update links works reliably
        webView.setDownloadListener { downloadUrl, _, _, _, _ ->
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(intent)
                Toast.makeText(this, "Downloading update package...", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                try {
                    val dm = getSystemService(DOWNLOAD_SERVICE) as? DownloadManager
                    val req = DownloadManager.Request(Uri.parse(downloadUrl)).apply {
                        val filename = Uri.parse(downloadUrl).lastPathSegment ?: "NinaKurain-update.apk"
                        setTitle(filename)
                        setDescription("Downloading update")
                        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                        setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                    }
                    dm?.enqueue(req)
                    Toast.makeText(this, "Downloading update in background... Check notifications.", Toast.LENGTH_LONG).show()
                } catch (_: Exception) {}
            }
        }

        // Support WebChromeClient for HTML5 file inputs (<input type="file">), runtime permissions, and popup windows
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                if (request == null) return
                runOnUiThread {
                    val requestedResources = request.resources
                    val needsCamera = requestedResources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
                    val needsAudio = requestedResources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)

                    val hasCamera = !needsCamera || ContextCompat.checkSelfPermission(
                        this@MainActivity, Manifest.permission.CAMERA
                    ) == PackageManager.PERMISSION_GRANTED

                    val hasAudio = !needsAudio || ContextCompat.checkSelfPermission(
                        this@MainActivity, Manifest.permission.RECORD_AUDIO
                    ) == PackageManager.PERMISSION_GRANTED

                    if (hasCamera && hasAudio) {
                        request.grant(requestedResources)
                    } else {
                        // Request missing OS runtime permissions then grant
                        pendingWebChromePermissionRequest = request
                        val permissions = mutableListOf<String>()
                        if (needsCamera && !hasCamera) permissions.add(Manifest.permission.CAMERA)
                        if (needsAudio && !hasAudio) permissions.add(Manifest.permission.RECORD_AUDIO)
                        requestPermissionsLauncher.launch(permissions.toTypedArray())
                    }
                }
            }

            override fun onShowFileChooser(
                view: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                try {
                    val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                        type = "*/*"
                        addCategory(Intent.CATEGORY_OPENABLE)
                    }
                    fileChooserLauncher.launch(intent)
                } catch (e: Exception) {
                    val fallbackIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        type = "*/*"
                        addCategory(Intent.CATEGORY_OPENABLE)
                        if (fileChooserParams?.mode == FileChooserParams.MODE_OPEN_MULTIPLE) {
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                        }
                    }
                    try {
                        fileChooserLauncher.launch(Intent.createChooser(fallbackIntent, "Select Media"))
                    } catch (e2: Exception) {
                        this@MainActivity.filePathCallback?.onReceiveValue(null)
                        this@MainActivity.filePathCallback = null
                        return false
                    }
                }
                return true
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message?
            ): Boolean {
                val newWebView = WebView(this@MainActivity)
                newWebView.settings.javaScriptEnabled = true
                newWebView.settings.domStorageEnabled = true
                newWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(v: WebView?, request: WebResourceRequest?): Boolean {
                        val targetUrl = request?.url?.toString()
                        if (handleUrl(this@MainActivity.webView, targetUrl)) {
                            return true
                        }
                        if (targetUrl != null && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
                            this@MainActivity.webView.loadUrl(targetUrl)
                        }
                        return true
                    }

                    @Deprecated("Deprecated in Java")
                    override fun shouldOverrideUrlLoading(v: WebView?, targetUrl: String?): Boolean {
                        if (handleUrl(this@MainActivity.webView, targetUrl)) {
                            return true
                        }
                        if (targetUrl != null && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
                            this@MainActivity.webView.loadUrl(targetUrl)
                        }
                        return true
                    }
                }
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = newWebView
                resultMsg?.sendToTarget()
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return handleUrl(view, request?.url?.toString())
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                return handleUrl(view, url)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                if (url != null) {
                    // Check URL for admin paths
                    if (url.contains("/admin") || isAdminApp) {
                        isAdminUser = true
                    } else {
                        // Check cookies for admin session
                        val cookies = CookieManager.getInstance().getCookie(url)
                        if (cookies != null && (cookies.contains("nk_admin=1") || cookies.contains("afterglow_admin="))) {
                            isAdminUser = true
                        }
                    }
                    updateScreenshotSecurity()
                }
            }
        }

        // Load the flavor-targeted URL (Member APK -> VIP portal; Admin APK -> Studio)
        webView.loadUrl(BuildConfig.TARGET_URL)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
