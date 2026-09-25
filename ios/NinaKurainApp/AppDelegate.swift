import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var securityCurtainView: UIView?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = ViewController()
        window?.makeKeyAndVisible()
        return true
    }

    /**
     * When user enters iOS App Switcher (multitasking carousel),
     * immediately overlay a blackout curtain so iOS cannot snapshot the screen.
     */
    func applicationWillResignActive(_ application: UIApplication) {
        guard let window = self.window else { return }
        
        let curtain = UIView(frame: window.bounds)
        curtain.backgroundColor = UIColor(red: 0.04, green: 0.02, blue: 0.04, alpha: 1.0)
        curtain.tag = 9999
        
        let label = UILabel()
        label.text = "🔒 NINA KURAIN · PROTECTED SECURE CONTENT"
        label.textColor = UIColor(red: 0.9, green: 0.4, blue: 0.5, alpha: 1.0)
        label.font = UIFont.systemFont(ofSize: 13, weight: .bold)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        curtain.addSubview(label)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: curtain.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: curtain.centerYAnchor)
        ])
        
        window.addSubview(curtain)
        self.securityCurtainView = curtain
    }

    /**
     * When user returns to the app, remove the blackout curtain.
     */
    func applicationDidBecomeActive(_ application: UIApplication) {
        self.securityCurtainView?.removeFromSuperview()
        self.securityCurtainView = nil
    }
}
