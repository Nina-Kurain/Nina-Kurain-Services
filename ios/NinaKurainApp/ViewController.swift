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

        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.backgroundColor = .clear
        webView.isOpaque = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.customUserAgent = "Mozilla/5.0 NinaKurainApp/1.0 (iOS; SecureNative)"
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

        // 4. Load the official secure website
        if let url = URL(string: "https://ninakurainservices.in") {
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
