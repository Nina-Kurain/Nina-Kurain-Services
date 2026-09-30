import UIKit
import WebKit

/**
 * ============================================================================
 * NINA KURAIN SECURE IOS VIEW CONTROLLER
 * PATH: /ios/NinaKurainApp/ViewController.swift
 * 
 * Hardware-level Screenshot & Screen Recording Prevention for iPhone & iPad.
 * 
 * TECHNIQUE:
 * In iOS, `UITextField` with `isSecureTextEntry = true` instructs the iOS
 * QuartzCore renderServer to flag the layer as secure. Embedding the WKWebView
 * inside this layer causes iOS to automatically black out screenshots and recordings,
 * exactly like Android's `FLAG_SECURE`.
 * ============================================================================
 */
class ViewController: UIViewController {

    private var webView: WKWebView!
    private let secureTextField = UITextField()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.03, green: 0.02, blue: 0.04, alpha: 1.0)
        
        setupHardwareSecureLayer()
        setupCaptureObservers()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }

    /**
     * Embeds the WKWebView into the secure sublayer of a secure UITextField.
     * This forces iOS hardware display server to block screenshots (Power + Volume Up).
     */
    private func setupHardwareSecureLayer() {
        // 1. Configure the secure text field container
        secureTextField.isSecureTextEntry = true
        secureTextField.isUserInteractionEnabled = true
        secureTextField.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(secureTextField)

        NSLayoutConstraint.activate([
            secureTextField.topAnchor.constraint(equalTo: view.topAnchor),
            secureTextField.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            secureTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            secureTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        // 2. Configure WKWebView
        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.allowsInlineMediaPlayback = true
        webConfiguration.mediaTypesRequiringUserActionForPlayback = []
        webConfiguration.allowsAirPlayForMediaPlayback = true
        webConfiguration.preferences.javaScriptCanOpenWindowsAutomatically = true

        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.backgroundColor = .clear
        webView.isOpaque = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.customUserAgent = "Mozilla/5.0 NinaKurainApp/2.1.0 (iOS; NinaKurainVIP; v=2.1.0)"
        webView.translatesAutoresizingMaskIntoConstraints = false

        // 3. Extract the iOS QuartzCore secure render container
        // Subview 0 of a secure UITextField is the hardware-protected canvas in iOS
        if let secureCanvas = secureTextField.subviews.first {
            secureCanvas.addSubview(webView)
            NSLayoutConstraint.activate([
                webView.topAnchor.constraint(equalTo: secureCanvas.topAnchor),
                webView.bottomAnchor.constraint(equalTo: secureCanvas.bottomAnchor),
                webView.leadingAnchor.constraint(equalTo: secureCanvas.leadingAnchor),
                webView.trailingAnchor.constraint(equalTo: secureCanvas.trailingAnchor)
            ])
        } else {
            // Fallback
            view.addSubview(webView)
            NSLayoutConstraint.activate([
                webView.topAnchor.constraint(equalTo: view.topAnchor),
                webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
                webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
                webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
            ])
        }

        // 4. Load the official secure VIP member portal
        if let url = URL(string: "https://vip.ninakurainservices.in") {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }

    /**
     * Listens for screenshot events and screen recording notifications in iOS.
     */
    private func setupCaptureObservers() {
        // Screenshot notification
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleScreenshotTaken),
            name: UIApplication.userDidTakeScreenshotNotification,
            object: nil
        )

        // Screen recording state changes (iOS Control Center Screen Recorder / AirPlay)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleScreenRecordingState),
            name: UIScreen.capturedDidChangeNotification,
            object: nil
        )

        // Verify initial screen recording state
        checkScreenRecording()
    }

    @objc private func handleScreenshotTaken() {
        if let currentURL = webView.url?.absoluteString, currentURL.contains("/admin") {
            // Screenshots permitted for admin
            return
        }
        // Poison iOS clipboard
        UIPasteboard.general.string = "🔒 NINA KURAIN CONFIDENTIAL · Screenshots are strictly prohibited on this platform."

        let alert = UIAlertController(
            title: "Screenshots Not Allowed",
            message: "This website does not allow screenshots on mobile or desktop devices. Protected media is confidential.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        present(alert, animated: true)
    }

    @objc private func handleScreenRecordingState() {
        checkScreenRecording()
    }

    private func checkScreenRecording() {
        if let currentURL = webView.url?.absoluteString, currentURL.contains("/admin") {
            webView.alpha = 1.0
            return
        }
        let isRecording = UIScreen.main.isCaptured
        if isRecording {
            // Blank the web view completely if screen recording is active
            webView.alpha = 0.0
        } else {
            webView.alpha = 1.0
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - WKUIDelegate (Mobile Media Permissions & Dialogs)
extension ViewController: WKUIDelegate {

    /**
     * Grants camera and microphone capture permissions when requested by web application (iOS 15.0+)
     */
    @available(iOS 15.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.grant)
    }

    /**
     * Supports web JavaScript alert() modals
     */
    func webView(
        _ webView: WKWebView,
        runJavaScriptAlertPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping () -> Void
    ) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }

    /**
     * Supports web JavaScript confirm() modals
     */
    func webView(
        _ webView: WKWebView,
        runJavaScriptConfirmPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (Bool) -> Void
    ) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(alert, animated: true)
    }

    /**
     * Supports window.open popup requests within the same web view
     */
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }
}

// MARK: - WKNavigationDelegate
extension ViewController: WKNavigationDelegate {
    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        let urlString = url.absoluteString.lowercased()
        let scheme = url.scheme?.lowercased() ?? ""

        // 1. Intercept system deep links & external schemes
        if scheme == "itms-services" || scheme == "itms-apps" || scheme == "tel" || scheme == "mailto" || scheme == "instagram" || scheme == "whatsapp" {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }

        // 2. Intercept downloadable profiles, IPAs, APKs, or /downloads/
        // Handoff to Safari / iOS system installer so profiles and app updates can be installed!
        if urlString.contains(".mobileconfig") || urlString.contains(".ipa") || urlString.contains(".apk") || urlString.contains("/downloads/") || urlString.contains("/api/downloads/") {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Evaluate admin mode dynamically
        if let currentURL = webView.url?.absoluteString, currentURL.contains("/admin") {
            window?.clearFlagsSecureIfPossible()
        }
    }
}

private extension UIWindow {
    func clearFlagsSecureIfPossible() {
        // No-op placeholder for clean architecture
    }
}
