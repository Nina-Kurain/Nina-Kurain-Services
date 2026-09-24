import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Cpu, Lock, AlertTriangle, FileText, HelpCircle, Mail, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Nina Kurain Platform',
  description: 'Comprehensive Terms of Service, 18+ Adult Content Notice, AI-Generated Content Policy, and Community Standards.',
};

export default function TermsAndConditionsPage() {
  const lastUpdated = 'September 24, 2026';

  return (
    <div className="legal-shell">
      {/* Legal Header / Bar */}
      <header className="legal-header">
        <div className="legal-header-inner">
          <div className="legal-brand">
            <Link href="/" className="legal-brand-link">
              <span className="legal-brand-dot" />
              <span className="legal-brand-title">NINA KURAIN</span>
            </Link>
            <span className="legal-badge">LEGAL COMPLIANCE</span>
          </div>

          <div className="legal-nav-actions">
            <Link href="/" className="legal-btn legal-btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <Link href="/privacy-policy" className="legal-btn legal-btn-secondary">
              <span>Privacy Policy</span>
            </Link>
            <Link href="/content-removal" className="legal-btn legal-btn-secondary">
              <span>Report Content</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="legal-container">
        {/* Sticky Sidebar Table of Contents */}
        <aside className="legal-sidebar">
          <div className="legal-toc">
            <div className="legal-toc-title">Table of Contents</div>
            <nav className="legal-toc-list">
              <a href="#statutory-notice" className="legal-toc-link">1. 18+ Adult Statutory Notice</a>
              <a href="#acceptance-terms" className="legal-toc-link">2. Acceptance of Terms</a>
              <a href="#user-eligibility" className="legal-toc-link">3. Eligibility & Age Assurance</a>
              <a href="#account-security" className="legal-toc-link">4. Account Security & Billing</a>
              <a href="#creator-warranties" className="legal-toc-link">5. Creator Representation & KYC</a>
              <a href="#user-content-license" className="legal-toc-link">6. User-Submitted Content</a>
              <a href="#ai-synthetic-content" className="legal-toc-link highlight">7. AI-Generated & Synthetic Media</a>
              <a href="#deepfakes-likeness" className="legal-toc-link highlight">8. Ban on Non-Consensual Deepfakes</a>
              <a href="#zero-tolerance-minors" className="legal-toc-link critical">9. Zero-Tolerance Minor Protection</a>
              <a href="#prohibited-conduct" className="legal-toc-link">10. Prohibited Conduct</a>
              <a href="#dmca-copyright" className="legal-toc-link">11. Intellectual Property & DMCA</a>
              <a href="#takedown-moderation" className="legal-toc-link">12. Content Moderation & Takedown</a>
              <a href="#disclaimers-liability" className="legal-toc-link">13. Disclaimers & Liability</a>
              <a href="#indemnification" className="legal-toc-link">14. Indemnification</a>
              <a href="#governing-law" className="legal-toc-link">15. Governing Law & Arbitration</a>
              <a href="#modifications" className="legal-toc-link">16. Modifications to Terms</a>
              <a href="#contact-agent" className="legal-toc-link">17. Contact & Statutory Agent</a>
            </nav>
          </div>
        </aside>

        {/* Legal Text Body */}
        <main className="legal-main">
          <div className="legal-article-header">
            <h1 className="legal-title">Terms & Conditions of Service</h1>
            <div className="legal-meta">
              <span>Last Modified: {lastUpdated}</span>
              <span>•</span>
              <span>Document Version: 3.4.0</span>
              <span>•</span>
              <span className="legal-badge-pill">Mandatory Legal Agreement</span>
            </div>
            <p className="legal-summary">
              These Terms and Conditions constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;Member,&rdquo; &ldquo;Creator,&rdquo; or &ldquo;you&rdquo;) 
              and <strong>Nina Kurain Services</strong>, operating as <strong>ninakurainservices.in</strong> (&ldquo;the Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). 
              Please read this document carefully before accessing or using any services, content, or media provided on this platform.
            </p>
          </div>

          {/* Section 1 */}
          <section id="statutory-notice" className="legal-section">
            <div className="legal-callout adult">
              <div className="legal-callout-icon">
                <ShieldAlert size={26} />
              </div>
              <div>
                <h2 className="legal-callout-title">1. STATUTORY 18+ ADULT CONTENT WARNING &amp; ACCESS NOTICE</h2>
                <p>
                  THIS PLATFORM CONTAINS EXPLICIT ADULT VISUALS, EROTIC MATERIAL, AND MATURE THEMES INTENDED EXCLUSIVELY FOR LEGAL ADULTS. 
                  BY VISITING, VIEWING, OR SUBSCRIBING TO ANY CONTENT ON THIS WEBSITE, YOU AFFIRMATIVELY CERTIFY, UNDER PENALTY OF PERJURY:
                </p>
                <ul>
                  <li>You are at least eighteen (18) years of age, or the age of legal majority in the jurisdiction from which you access this platform, whichever is greater.</li>
                  <li>Adult, erotic, and sexually suggestive imagery is strictly legal in your jurisdiction, community, and municipality.</li>
                  <li>You are accessing this material voluntarily for personal, non-commercial entertainment and not on behalf of any law enforcement or regulatory agency without appropriate statutory authorization.</li>
                  <li>You will not permit, assist, or enable any minor or underage individual to view, download, or access any materials from this platform.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="acceptance-terms" className="legal-section">
            <h2>2. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering for an account, subscribing to memberships, or purchasing pay-per-view media, 
              you unequivocally agree to be bound by these Terms and Conditions, our <Link href="/privacy-policy" className="legal-inline-link">Privacy Policy</Link>, 
              and our <Link href="/content-removal" className="legal-inline-link">Content Reporting &amp; Removal Guidelines</Link>.
            </p>
            <p>
              If you do not agree unconditionally with every provision contained herein, you must immediately terminate your session, exit the platform, and delete any cached material.
            </p>
          </section>

          {/* Section 3 */}
          <section id="user-eligibility" className="legal-section">
            <h2>3. User Eligibility &amp; Age Assurance</h2>
            <p>
              Access to the platform is restricted exclusively to individuals who satisfy all legal age requirements. We enforce multi-layer verification procedures:
            </p>
            <ul>
              <li><strong>Viewer Age Assurance:</strong> Upon initial visit, visitors must affirmatively confirm their adult status via our statutory age gate before entering adult media galleries or playback feeds.</li>
              <li><strong>Payment Verification:</strong> Paid subscriptions require legitimate credit cards or verified electronic payment methods where billing identity verifies adult account ownership.</li>
              <li><strong>Geolocation &amp; Compliance Checks:</strong> Where mandated by local laws (including state and regional adult verification statutes), the platform reserves the right to employ accredited third-party identity proofing services.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="account-security" className="legal-section">
            <h2>4. Account Security, Subscriptions, and Billing</h2>
            <p>
              You are solely responsible for safeguarding the credentials associated with your account. You agree not to disclose your password or grant access to third parties, 
              specifically minors. Any actions conducted through your authenticated account are deemed your personal responsibility.
            </p>
            <p>
              Memberships and premium pay-per-view tokens are billed in accordance with the published pricing schedules. 
              Subscriptions renew automatically on a recurring monthly or annual billing cycle until explicitly canceled through your member settings prior to the renewal date. 
              Due to the immediate digital delivery of media content, subscription fees and digital purchases are non-refundable except where required by applicable statutory consumer protection laws.
            </p>
          </section>

          {/* Section 5 */}
          <section id="creator-warranties" className="legal-section">
            <h2>5. Creator Representation, Verification, and Record-Keeping Warranties</h2>
            <p>
              Any individual or entity approved to publish, broadcast, post, or monetize content (&ldquo;Creator&rdquo;) must undergo mandatory Know-Your-Customer (KYC) identity verification prior to publishing. 
              Creators represent and warrant without limitation:
            </p>
            <ul>
              <li>Every human performer depicted in any media is at least eighteen (18) years of age at the time the content was recorded or created.</li>
              <li>The Creator maintains valid, government-issued photographic identification and executed consent documentation for every performer, in compliance with 18 U.S.C. &sect; 2257, &sect; 2257A, and equivalent international record-keeping directives.</li>
              <li>All individuals depicted have knowingly, voluntarily, and expressly consented in writing to the production, digital distribution, and commercialization of the media.</li>
              <li>The Creator owns or holds all necessary intellectual property rights, licenses, and releases for all visual, audio, and textual elements included in their uploads.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="user-content-license" className="legal-section">
            <h2>6. User-Submitted Content &amp; Limited License</h2>
            <p>
              By uploading or transmitting content to the platform (including comments, profile photos, media items, stories, or live messages), you grant <strong>Nina Kurain Services</strong> a 
              worldwide, non-exclusive, royalty-free, transferable license to host, store, transcode, cache, index, and display such content solely for the purpose of operating, maintaining, and providing the platform services.
            </p>
            <p>
              You retain all existing intellectual property rights and ownership in your original works, subject only to the operational licenses explicitly granted herein.
            </p>
          </section>

          {/* Section 7 - AI & SYNTHETIC MEDIA (MIDDLE SECTION - DETAILED & PROMINENT) */}
          <section id="ai-synthetic-content" className="legal-section">
            <div className="legal-callout highlight">
              <div className="legal-callout-icon">
                <Cpu size={26} />
              </div>
              <div>
                <h2 className="legal-callout-title">7. AI-GENERATED AND SYNTHETIC MEDIA POLICY</h2>
                <p>
                  Our platform embraces artistic innovation and cutting-edge creative technologies, including algorithmic generation and synthetic digital imagery. 
                  However, to maintain absolute integrity, prevent deception, and protect real persons from exploitation, all creators and users must strictly adhere to our Synthetic Media Standards:
                </p>
              </div>
            </div>

            <h3>7.1 Clear Definitions</h3>
            <p>For the purposes of these Terms and Conditions:</p>
            <ul>
              <li><strong>AI-Generated Media:</strong> Visual, audio, or audiovisual content created substantially or entirely using generative adversarial networks (GANs), diffusion models, neural networks, or equivalent machine learning models without a primary real-world camera recording.</li>
              <li><strong>AI-Assisted / Enhanced Media:</strong> Real-world authentic photography or video that has undergone AI-powered color grading, background extension, resolution upscaling, or cosmetic touch-ups where the primary human performer remains authentic.</li>
              <li><strong>Synthetic Media / Deepfakes:</strong> Media digitally manipulated or generated to synthesize or replace a person&rsquo;s facial features, bodily likeness, voice, or persona.</li>
            </ul>

            <h3>7.2 Mandatory Disclosure and Point-of-Encounter Labeling</h3>
            <p>
              Transparency is non-negotiable. Any post, gallery, story, or video that is generated or substantially altered using generative artificial intelligence 
              <strong> must be explicitly disclosed and labeled</strong> prior to publication:
            </p>
            <ul>
              <li>Creators must apply the appropriate system metadata tag (<code>AI-Generated</code> or <code>Synthetic Media</code>) during the upload workflow.</li>
              <li>Descriptions must clearly indicate to consumers that the visual content depicts a digitally generated or synthetic model rather than an authentic real-world performance.</li>
              <li>Deliberately disguising synthetic imagery as an authentic human photograph or deceiving subscribers regarding the physical reality of a performer is strictly prohibited and constitutes cause for immediate account termination.</li>
            </ul>

            <h3>7.3 Legal Compliance for Generative Tools</h3>
            <p>
              Creators utilizing generative AI models, proprietary checkpoints, LoRAs, or synthetic rendering tools warrant that they possess lawful access to such tools, 
              comply with all respective model license agreements, and have not trained models using non-consensual personal data or copyrighted proprietary works in violation of applicable laws.
            </p>
          </section>

          {/* Section 8 - PROHIBITION OF DEEPFAKES */}
          <section id="deepfakes-likeness" className="legal-section">
            <div className="legal-callout warning">
              <div className="legal-callout-icon">
                <Lock size={26} />
              </div>
              <div>
                <h2 className="legal-callout-title">8. STRICT PROHIBITION OF REAL-PERSON DEEPFAKES &amp; LIKENESS MISUSE</h2>
                <p>
                  WE MAINTAIN A COMPLETE, UNCOMPROMISING BAN ON NON-CONSENSUAL SYNTHETIC IMAGERY.
                </p>
              </div>
            </div>
            <p>
              Under no circumstances may any user or creator upload, generate, transmit, or solicit:
            </p>
            <ul>
              <li><strong>Face Swaps or Likeness Insertion:</strong> Any content replacing a performer&rsquo;s face or body with that of another real living or deceased individual.</li>
              <li><strong>Celebrity or Public Figure Synthetics:</strong> Any AI-generated adult depiction simulating, parodying, or mimicking celebrities, political figures, influencers, or identifiable private individuals.</li>
              <li><strong>Non-Consensual Intimate Imagery (NCII):</strong> Any sexually explicit or nude depiction of an identifiable real person created without their explicit, notarized written consent specifically authorizing deepfake and synthetic adult representations. A standard modeling release does NOT satisfy this requirement.</li>
              <li><strong>Voice Cloning &amp; Audio Synthesis:</strong> Synthesizing the voice, speech patterns, or auditory likeness of any real person without verified written authorization.</li>
            </ul>
            <p>
              Violations of this section will result in immediate content removal, permanent account termination, forfeiture of accrued earnings, 
              and disclosure of account logs to legal counsel and law enforcement authorities where civil or criminal statutes have been breached.
            </p>
          </section>

          {/* Section 9 - ZERO TOLERANCE MINORS */}
          <section id="zero-tolerance-minors" className="legal-section">
            <div className="legal-callout critical">
              <div className="legal-callout-icon">
                <AlertTriangle size={26} />
              </div>
              <div>
                <h2 className="legal-callout-title">9. ZERO-TOLERANCE POLICY REGARDING CHILD SEXUAL ABUSE MATERIAL (CSAM) &amp; MINOR SAFETY</h2>
                <p>
                  THIS PLATFORM MAINTAINS ZERO TOLERANCE FOR ANY FORM OF CHILD SEXUAL EXPLOITATION AND ABUSE. THIS STRICT PROHIBITION APPLIES FULLY TO BOTH AUTHENTIC AND SYNTHETIC MEDIA.
                </p>
              </div>
            </div>
            <p>
              The upload, transmission, possession, or solicitation of any of the following will trigger immediate permanent termination, IP blocking, and automatic referral to the 
              <strong> National Center for Missing &amp; Exploited Children (NCMEC)</strong> and relevant international law enforcement bodies:
            </p>
            <ul>
              <li>Any visual representation of a minor (anyone under the age of 18) engaged in sexually explicit conduct or depicted in an eroticized, suggestive context.</li>
              <li><strong>Synthetic / AI-Generated Underage Content:</strong> Any machine-generated, drawn, rendered, or algorithmically produced imagery depicting an underage individual, or an individual designed to resemble a minor in appearance, demeanor, or setting (including &ldquo;Lolita,&rdquo; &ldquo;Shota,&rdquo; or age-regressed depictions).</li>
              <li><strong>Age Regression Filters:</strong> Using AI software to digitally decrease the apparent age of an adult performer into an underage visual presentation.</li>
              <li>Any text, chat message, solicitation, or metadata referencing, promoting, or glorifying underage sexual activity.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="prohibited-conduct" className="legal-section">
            <h2>10. Prohibited Conduct &amp; Community Standards</h2>
            <p>Users and Creators agree not to engage in any of the following activities on or through the platform:</p>
            <ul>
              <li><strong>Non-Consensual Violence:</strong> Uploading or promoting real violence, rape, sexual assault, torture, bestiality, necrophilia, or non-consensual mutilation.</li>
              <li><strong>Harassment &amp; Doxxing:</strong> Stalking, threatening, blackmaling, or publishing private personally identifiable information (PII) of any creator, member, or third party.</li>
              <li><strong>Scraping &amp; Data Mining:</strong> Utilizing automated bots, spiders, scrapers, or scripts to harvest media, user profiles, or platform data without prior written authorization.</li>
              <li><strong>Circumvention:</strong> Bypassing age verification gateways, digital rights management (DRM), access controls, or rate limits.</li>
              <li><strong>Commercial Re-distribution:</strong> Re-uploading, mirroring, downloading for sale, or distributing any creator media outside of this platform.</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section id="dmca-copyright" className="legal-section">
            <h2>11. Intellectual Property &amp; Digital Millennium Copyright Act (DMCA)</h2>
            <p>
              We respect intellectual property rights and comply with the provisions of the Digital Millennium Copyright Act (17 U.S.C. &sect; 512). 
              If you believe your copyrighted work has been reproduced or distributed on the platform in a manner constituting copyright infringement, 
              please submit a formal written notice containing:
            </p>
            <ul>
              <li>A physical or electronic signature of the copyright holder or authorized representative.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Direct URLs or exact location descriptors enabling our agents to locate the disputed material.</li>
              <li>Your contact information, including physical address, telephone number, and verifiable email address.</li>
              <li>A statement of good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement under penalty of perjury that the information in your notice is accurate and that you are authorized to act on behalf of the owner.</li>
            </ul>
            <p>
              Notices must be directed to our designated agent at <span className="legal-tag">contact@ninakurainservices.in</span> or submitted via our 
              <Link href="/content-removal" className="legal-inline-link"> Content Removal Portal</Link>.
            </p>
          </section>

          {/* Section 12 */}
          <section id="takedown-moderation" className="legal-section">
            <h2>12. Content Moderation &amp; Expedited Takedown Process</h2>
            <p>
              We employ proactive algorithmic screening, hash matching, and human moderation teams to review flagged and published media. 
              We commit to the following response standards:
            </p>
            <ul>
              <li><strong>Minor Safety / CSAM:</strong> Immediate removal, preservation of evidence, and immediate referral to NCMEC.</li>
              <li><strong>Non-Consensual Imagery &amp; Deepfakes:</strong> Expedited priority review and de-indexing within <strong>24 to 48 hours</strong> of verified submission.</li>
              <li><strong>Repeat Infringer Policy:</strong> In accordance with statutory rules, accounts found repeatedly infringing copyrights or platform standards will have their publishing privileges and account access permanently revoked.</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section id="disclaimers-liability" className="legal-section">
            <h2>13. Disclaimers of Warranties &amp; Limitation of Liability</h2>
            <div className="legal-callout review">
              <div className="legal-callout-icon">
                <HelpCircle size={26} />
              </div>
              <div>
                <h4 className="legal-callout-title">STATUTORY DISCLAIMERS</h4>
                <p>
                  THE PLATFORM, ITS SERVERS, INFRASTRUCTURE, AND ALL CONTENT ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p>
                  IN NO EVENT SHALL <strong>Nina Kurain Services</strong>, ITS DIRECTORS, EMPLOYEES, AFFILIATES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES 
                  ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. 
                  IN JURISDICTIONS WHERE LIMITATIONS OF LIABILITY ARE RESTRICTED, OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO THE PLATFORM IN THE PRECEDING TWELVE (12) MONTHS OR ONE HUNDRED US DOLLARS ($100), WHICHEVER IS LESS.
                </p>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section id="indemnification" className="legal-section">
            <h2>14. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless <strong>Nina Kurain Services</strong> and its subsidiaries, affiliates, officers, agents, and employees 
              from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&rsquo; fees) 
              arising out of or relating to your violation of these Terms, your uploaded content, or your infringement of any third-party intellectual property or privacy rights.
            </p>
          </section>

          {/* Section 15 */}
          <section id="governing-law" className="legal-section">
            <h2>15. Governing Law, Dispute Resolution &amp; Arbitration</h2>
            <div className="legal-callout review">
              <div className="legal-callout-icon">
                <FileText size={26} />
              </div>
              <div>
                <h4 className="legal-callout-title">JURISDICTION &amp; DISPUTE RESOLUTION</h4>
                <p>
                  These Terms and any dispute or claim arising out of or related to them shall be governed by and construed in accordance with the laws of <strong>India</strong>, without giving effect to any choice or conflict of law provision or rule.
                </p>
                <p>
                  Any dispute, controversy, or claim arising out of or relating to this contract, including the formation, interpretation, breach, or termination thereof, 
                  shall be settled by binding arbitration in accordance with commercial arbitration rules. You waive any right to participate in class actions or representative proceedings against the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Section 16 */}
          <section id="modifications" className="legal-section">
            <h2>16. Modifications to Terms of Service</h2>
            <p>
              We reserve the right to revise, update, or modify these Terms and Conditions at any time to reflect operational, legal, or regulatory adjustments. 
              The revised Terms will become effective immediately upon posting with an updated &ldquo;Last Modified&rdquo; date. 
              Your continued use of the platform after any such revisions constitutes your accepted agreement to the revised Terms.
            </p>
          </section>

          {/* Section 17 */}
          <section id="contact-agent" className="legal-section">
            <h2>17. Contact &amp; Statutory Agent Information</h2>
            <p>For legal inquiries, compliance verifications, or official correspondence, contact our designated compliance team:</p>
            <div className="legal-contact-card">
              <div className="legal-contact-item">
                <Mail size={18} className="legal-contact-icon" />
                <div>
                  <strong>Legal &amp; Compliance Inquiries:</strong>
                  <p><a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a></p>
                </div>
              </div>

              <div className="legal-contact-item">
                <ShieldAlert size={18} className="legal-contact-icon" />
                <div>
                  <strong>DMCA &amp; Intellectual Property Agent:</strong>
                  <p><a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a></p>
                </div>
              </div>

              <div className="legal-contact-item">
                <AlertTriangle size={18} className="legal-contact-icon" />
                <div>
                  <strong>Emergency Content Takedowns &amp; Deepfake Reporting:</strong>
                  <p><Link href="/content-removal" className="legal-inline-link">Content Removal Portal</Link> or <a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a></p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Legal Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <p>&copy; {new Date().getFullYear()} Nina Kurain Services. All Rights Reserved. 18+ Adult Content Entertainment.</p>
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
