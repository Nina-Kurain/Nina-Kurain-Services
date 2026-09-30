import UIKit
import WebKit

/**
 * ============================================================================
 * NINA STUDIO - OFFICIAL CREATOR STUDIO IOS APPLICATION
 * PATH: /ios/NinaKurainStudioApp/ViewController.swift
 * 
 * Tailored for admin creator management, direct 4K video uploads, media
 * editing, subscriber analytics, and camera roll access on iPhone & iPad.
 * ============================================================================
 */
class ViewController: UIViewController {

    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.05, green: 0.02, blue: 0.04, alpha: 1.0)
        setupStudioWebView()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }

    private func setupStudioWebView() {
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
        webView.customUserAgent = "Mozilla/5.0 NinaKurainApp/2.1.0 (iOS; NinaStudioApp; v=2.1.0)"
        webView.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        // Load Creator Studio admin portal directly
        if let url = URL(string: "https://vip.ninakurainservices.in/admin/login") {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }
}

// MARK: - WKUIDelegate (Mobile Media Permissions, File Picker & Dialogs)
extension ViewController: WKUIDelegate {

    /**
     * Automatically grants camera and microphone capture permissions for creator media recording (iOS 15.0+)
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
        let alert = UIAlertController(title: "Nina Studio", message: message, preferredStyle: .alert)
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
        let alert = UIAlertController(title: "Nina Studio", message: message, preferredStyle: .alert)
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
        if urlString.contains(".mobileconfig") || urlString.contains(".ipa") || urlString.contains(".apk") || urlString.contains("/downloads/") || urlString.contains("/api/downloads/") {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Ready
    }
}
