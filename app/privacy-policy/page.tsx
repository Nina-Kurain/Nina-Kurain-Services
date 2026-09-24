import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Database, UserX, Cookie, Mail, ArrowLeft, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Nina Kurain Platform',
  description: 'Comprehensive Privacy Policy detailing data collection, age assurance records, creator KYC, cookie usage, and privacy rights.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 24, 2026';

  return (
    <div className="legal-shell">
      {/* Header */}
      <header className="legal-header">
        <div className="legal-header-inner">
          <div className="legal-brand">
            <Link href="/" className="legal-brand-link">
              <span className="legal-brand-dot" />
              <span className="legal-brand-title">NINA KURAIN</span>
            </Link>
            <span className="legal-badge">PRIVACY &amp; COMPLIANCE</span>
          </div>

          <div className="legal-nav-actions">
            <Link href="/" className="legal-btn legal-btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <Link href="/terms-and-conditions" className="legal-btn legal-btn-secondary">
              <span>Terms &amp; Conditions</span>
            </Link>
            <Link href="/content-removal" className="legal-btn legal-btn-secondary">
              <span>Report Content</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="legal-container">
        {/* Sticky Table of Contents */}
        <aside className="legal-sidebar">
          <div className="legal-toc">
            <div className="legal-toc-title">Table of Contents</div>
            <nav className="legal-toc-list">
              <a href="#overview" className="legal-toc-link">1. Privacy Architecture &amp; Scope</a>
              <a href="#data-collection" className="legal-toc-link">2. Information We Collect</a>
              <a href="#age-verification-data" className="legal-toc-link highlight">3. Age Assurance &amp; KYC Data</a>
              <a href="#cookies-storage" className="legal-toc-link">4. Cookies &amp; Local Storage</a>
              <a href="#how-we-use-data" className="legal-toc-link">5. How We Use Information</a>
              <a href="#media-retention" className="legal-toc-link">6. Media Storage &amp; Encryption</a>
              <a href="#data-sharing" className="legal-toc-link">7. Third Parties &amp; Data Sharing</a>
              <a href="#user-rights" className="legal-toc-link">8. Your Privacy Rights (GDPR/CCPA)</a>
              <a href="#children-privacy" className="legal-toc-link critical">9. Children&rsquo;s Privacy Notice</a>
              <a href="#data-security" className="legal-toc-link">10. Data Security Protocols</a>
              <a href="#data-retention" className="legal-toc-link">11. Retention &amp; Deletion Schedules</a>
              <a href="#policy-changes" className="legal-toc-link">12. Changes to this Policy</a>
              <a href="#contact-dpo" className="legal-toc-link">13. Privacy Contact &amp; DPO</a>
            </nav>
          </div>
        </aside>

        {/* Content Body */}
        <main className="legal-main">
          <div className="legal-article-header">
            <h1 className="legal-title">Privacy Policy &amp; Data Practices</h1>
            <div className="legal-meta">
              <span>Last Modified: {lastUpdated}</span>
              <span>•</span>
              <span>Document Version: 2.9.0</span>
              <span>•</span>
              <span className="legal-badge-pill">Compliance Standard</span>
            </div>
            <p className="legal-summary">
              At <strong>Nina Kurain Services</strong> (&ldquo;<strong>ninakurainservices.in</strong>,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), 
              we are committed to maintaining the confidentiality, security, and privacy of your personal data. 
              Because our platform hosts adult content, we employ strict data minimization principles to ensure your viewing habits and sensitive information remain protected.
            </p>
          </div>

          {/* Section 1 */}
          <section id="overview" className="legal-section">
            <div className="legal-callout adult">
              <div className="legal-callout-icon">
                <Shield size={26} />
              </div>
              <div>
                <h2 className="legal-callout-title">1. PRIVACY ARCHITECTURE &amp; SCOPE</h2>
                <p>
                  This Privacy Policy applies to all services, web applications, mobile views, APIs, and media players operating on 
                  <strong> ninakurainservices.in</strong>. We do not sell, rent, or trade your personal information to third-party data brokers or marketing aggregators. 
                  Our technical infrastructure operates on edge servers and isolated media storage designed to keep user identities separate from viewing records.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="data-collection" className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>We collect data under three distinct categories depending on your engagement with the platform:</p>
            
            <h3>A. Information Provided Voluntarily</h3>
            <ul>
              <li><strong>Member Registration:</strong> Username, email address, display name, and password hash (passwords are one-way hashed using high-cost cryptographic algorithms; we never store plain-text passwords).</li>
              <li><strong>Billing &amp; Payment Data:</strong> Payment details (credit card number, expiration, billing address) are collected and processed directly by our PCI-DSS compliant third-party payment gateways. The platform only stores non-sensitive transaction tokens, subscription tiers, and payment status.</li>
              <li><strong>Direct Communications:</strong> Support tickets, emails, or content dispute filings submitted to our staff.</li>
            </ul>

            <h3>B. Creator &amp; Performer KYC Information</h3>
            <ul>
              <li><strong>Identity Proofing:</strong> Government-issued photo identification (passport, driver&rsquo;s license), real legal name, date of birth, proof of age, and liveness selfies required for compliance with 18 U.S.C. &sect; 2257 and anti-money laundering regulations.</li>
              <li><strong>Payout Credentials:</strong> Bank account routing or electronic payout details used exclusively for disbursing creator subscription royalties.</li>
            </ul>

            <h3>C. Automatically Collected Technical Information</h3>
            <ul>
              <li><strong>Connection Telemetry:</strong> Anonymized or truncated IP addresses, user-agent strings, device hardware profiles, browser types, and approximate geographic region (used solely for legal age-gate enforcement and geo-blocking restricted territories).</li>
              <li><strong>Security Logs:</strong> Timestamped logs of authentication attempts, rate-limit counters, and security exception traces stored for denial-of-service prevention and fraud detection.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="age-verification-data" className="legal-section">
            <div className="legal-callout highlight">
              <div className="legal-callout-icon">
                <FileCheck size={26} />
              </div>
              <div>
                <h2 className="legal-callout-title">3. AGE ASSURANCE &amp; VERIFICATION DATA HANDLING</h2>
                <p>
                  To comply with child safety laws and adult entertainment regulations, we implement distinct age assurance procedures:
                </p>
              </div>
            </div>
            <ul>
              <li><strong>Visitor Age Gate:</strong> When you confirm you are 18+ on our entry screen, we store a temporary cookie/session token (<code>adult_age_confirmed=true</code>). This record contains no personal identifying information and merely records that age consent was given for the active browsing session.</li>
              <li><strong>Mandatory Statutory Age Proofing (Where Mandated by Law):</strong> In jurisdictions requiring third-party identity proofing prior to accessing mature media, verification is conducted through independent, certified age-verification providers. The platform does NOT store or have access to your raw biometric scans or government ID documents submitted during automated viewer checks; we only receive an encrypted binary confirmation of adult eligibility.</li>
              <li><strong>Creator &sect; 2257 Identity Records:</strong> Performer identification documents are encrypted at rest using AES-256 and stored in an isolated, access-controlled vault segregated from regular public web application servers. Access is restricted strictly to legal compliance officers.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="cookies-storage" className="legal-section">
            <h2>4. Cookies, Session Tokens &amp; Local Storage</h2>
            <p>Our platform relies primarily on essential technical storage to deliver core functionality. We utilize:</p>
            
            <div className="legal-contact-card">
              <div className="legal-contact-item">
                <Cookie size={20} className="legal-contact-icon" />
                <div>
                  <strong>Essential Session Cookies:</strong>
                  <p><code>adult_age_confirmed</code> (remembers adult status confirmation), <code>afterglow_age_session</code> (ephemeral session gatekeeper), and encrypted session authentication cookies for logged-in members.</p>
                </div>
              </div>
              <div className="legal-contact-item">
                <Database size={20} className="legal-contact-icon" />
                <div>
                  <strong>Browser Local Storage:</strong>
                  <p><code>afterglow_theme</code> (dark/rose theme preference), local draft recovery for studio media editor tools, and video player volume preferences. These keys remain strictly local to your device.</p>
                </div>
              </div>
            </div>
            <p>
              We do not use invasive third-party tracking pixels, Facebook Pixel, or cross-site tracking cookies. You may disable cookies in your browser settings, but doing so will require you to re-confirm the age gate on each navigation and prevent account login.
            </p>
          </section>

          {/* Section 5 */}
          <section id="how-we-use-data" className="legal-section">
            <h2>5. How We Use Your Information</h2>
            <p>We process your personal information strictly for lawful purposes, including:</p>
            <ul>
              <li>Delivering media streaming, studio editing tools, and member community features.</li>
              <li>Validating adult age eligibility and preventing minors from accessing age-restricted media.</li>
              <li>Processing payments, memberships, and creator royalty disbursements.</li>
              <li>Detecting, preventing, and prosecuting fraudulent activity, unauthorized account access, and cybersecurity attacks.</li>
              <li>Enforcing our Terms of Service, responding to copyright takedown requests (DMCA), and removing non-consensual imagery.</li>
              <li>Fulfilling legal and regulatory statutory obligations under applicable local, national, and international laws.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="media-retention" className="legal-section">
            <h2>6. Media Storage, Cloudflare Infrastructure &amp; Encryption</h2>
            <p>
              Media hosted on the platform (photographs, videos, stories, audio clips) is stored within secure, private object storage repositories (including Cloudflare R2 and distributed edge infrastructure). 
              Media objects are served through tokenized, signed edge URLs designed to prevent unauthorized hotlinking and scraping. 
              All data transmissions across the platform are encrypted in transit using Transport Layer Security (TLS 1.3 / HTTPS).
            </p>
          </section>

          {/* Section 7 */}
          <section id="data-sharing" className="legal-section">
            <h2>7. Third-Party Service Providers &amp; Disclosures</h2>
            <p>We do not disclose personal information except to authorized service providers under strict data processing agreements:</p>
            <ul>
              <li><strong>Payment Processors:</strong> Reputable adult-friendly merchant banks and processors handling credit transactions under PCI-DSS compliance.</li>
              <li><strong>Infrastructure &amp; CDN Providers:</strong> Cloudflare edge networks providing DDoS mitigation, CDN caching, and encrypted DNS resolution.</li>
              <li><strong>Legal &amp; Law Enforcement:</strong> We disclose information when required by valid subpoena, court order, or warrant, or where necessary to prevent severe physical harm or investigate violations of Child Sexual Abuse Material (CSAM) laws.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="user-rights" className="legal-section">
            <h2>8. Your Privacy Rights (GDPR, UK-GDPR &amp; CCPA/CPRA)</h2>
            <p>Depending on your geographic residency, you possess statutory rights regarding your personal information:</p>
            <ul>
              <li><strong>Right of Access &amp; Portability:</strong> You may request an export of personal data held about your account.</li>
              <li><strong>Right to Rectification:</strong> You may correct inaccurate or incomplete profile information through your account settings.</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may request permanent deletion of your account and associated personal data, subject to legal record retention requirements (such as tax laws or &sect; 2257 records).</li>
              <li><strong>Right to Restrict or Object:</strong> You have the right to object to automated processing or request limitation of data handling.</li>
              <li><strong>Non-Discrimination:</strong> We will never discriminate against you, alter pricing, or degrade service quality for exercising your privacy rights.</li>
            </ul>
            <p>
              To exercise any of these rights, visit your member settings or contact our Data Protection Officer at <a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a>.
            </p>
          </section>

          {/* Section 9 - CHILDREN'S PRIVACY */}
          <section id="children-privacy" className="legal-section">
            <div className="legal-callout critical">
              <div className="legal-callout-icon">
                <UserX size={26} />
              </div>
              <div>
                <h2 className="legal-callout-title">9. CHILDREN&rsquo;S PRIVACY NOTICE &amp; ZERO-TOLERANCE SAFEGUARDS</h2>
                <p>
                  THIS PLATFORM IS STRICTLY PROHIBITED TO MINORS. WE DO NOT KNOWINGLY SOLICIT, COLLECT, OR MAINTAIN INFORMATION FROM ANYONE UNDER EIGHTEEN (18) YEARS OF AGE.
                </p>
              </div>
            </div>
            <p>
              If we discover or receive notice that an individual under the age of 18 has submitted personal information or created an account, 
              we will immediately lock the account, securely purge all associated data, and, where applicable, report relevant details to law enforcement authorities. 
              Parents, legal guardians, or concerned parties who believe a minor has accessed the platform may contact us immediately at <a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a>.
            </p>
          </section>

          {/* Section 10 */}
          <section id="data-security" className="legal-section">
            <h2>10. Data Security Protocols</h2>
            <p>
              We implement comprehensive physical, organizational, and technical safeguards to protect your personal data against unauthorized access, loss, or alteration. 
              These safeguards include multi-factor authentication for administrative access, role-based database permissions, continuous edge vulnerability scanning, 
              and automated firewall filtering.
            </p>
          </section>

          {/* Section 11 */}
          <section id="data-retention" className="legal-section">
            <h2>11. Data Retention &amp; Deletion Schedules</h2>
            <p>We retain personal information only for as long as necessary to fulfill the operational and legal purposes outlined in this policy:</p>
            <ul>
              <li><strong>Active Accounts:</strong> Retained for the duration of your active subscription and membership.</li>
              <li><strong>Deleted Accounts:</strong> Core personal data is purged within thirty (30) days of account closure, except for financial billing records retained for seven (7) years to comply with statutory accounting and tax laws.</li>
              <li><strong>Performer KYC &amp; &sect; 2257 Records:</strong> Retained for the statutory duration mandated by federal regulations (typically five (5) to seven (7) years post-publication).</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="policy-changes" className="legal-section">
            <h2>12. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When material modifications occur, we will update the &ldquo;Last Modified&rdquo; date at the top of this document 
              and, where appropriate, provide visible notice across our web portal or via electronic notification to registered members.
            </p>
          </section>

          {/* Section 13 */}
          <section id="contact-dpo" className="legal-section">
            <h2>13. Privacy Contact &amp; Data Protection Officer</h2>
            <p>If you have questions, complaints, or wish to submit a data subject access request, contact our Data Protection Office:</p>
            <div className="legal-contact-card">
              <div className="legal-contact-item">
                <Mail size={18} className="legal-contact-icon" />
                <div>
                  <strong>Data Protection Officer (DPO):</strong>
                  <p><a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a></p>
                </div>
              </div>
              <div className="legal-contact-item">
                <Lock size={18} className="legal-contact-icon" />
                <div>
                  <strong>General Privacy Inquiries:</strong>
                  <p><a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a></p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <p>&copy; {new Date().getFullYear()} Nina Kurain Services. All Rights Reserved. Confidential Data Protection Standards.</p>
          <div className="legal-footer-links">
            <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/content-removal">Content Removal</Link>
            <Link href="/about">About Platform</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
