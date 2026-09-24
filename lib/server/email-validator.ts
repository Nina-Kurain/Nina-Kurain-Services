import { HttpError } from "./db";

/**
 * Curated blocklist of disposable, temporary, and 10-minute email provider domains.
 * Temp mail services allow anonymous account creation without a permanent inbox,
 * breaking transactional notifications, account recovery, and safety compliance.
 */
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Top global disposable email providers
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minmail.com",
  "10mail.org",
  "20minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.net",
  "tempmailo.com",
  "tempinbox.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamail.info",
  "guerrillamail.de",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "spam4.me",
  "pokemail.net",
  "mailinator.com",
  "mailinator2.com",
  "mailin8r.com",
  "mailinator.net",
  "suremail.info",
  "reconmail.com",
  "safetymail.info",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "trash-mail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "throwawaymail.com",
  "dispostable.com",
  "getairmail.com",
  "airmail.cc",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "emailondeck.com",
  "dropmail.me",
  "mohmal.com",
  "mohmal.im",
  "mohmal.in",
  "crazymailing.com",
  "mailnesia.com",
  "generator.email",
  "byom.de",
  "mytemp.email",
  "inboxkitten.com",
  "maildrop.cc",
  "disposablemail.com",
  "burnermail.io",
  "inboxbear.com",
  "nada.ltd",
  "getnada.com",
  "abcvg.com",
  "fakemail.net",
  "burnermail.org",
  "disposable.com",
  "discard.email",
  "discardmail.com",
  "spambog.com",
  "spambog.de",
  "spambog.ru",
  "mailcatch.com",
  "tmail.ws",
  "mytempemail.com",
  "trashymail.com",
  "mytrashmail.com",
  "harakirimail.com",
  "incognitomail.com",
  "anonymbox.com",
  "kasmail.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "einrot.com",
  "zetmail.com",
  "tempaf.com",
  "minuteinbox.com",
  "crazymail.com",
  "zillamail.com",
  "mailforspam.com",
  "throwawayemailaddress.com",
  "spamavert.com",
  "deadaddress.com",
  "mailfreeonline.com",
  "tempm.com",
  "moakt.com",
  "moakt.ws",
  "disbox.net",
  "disbox.org",
  "tempr.email",
  "emailtemporanea.net",
  "emailtemporaneo.com",
  "boun.cr",
  "getmule.com",
  "yomail.info",
  "emailfake.com",
  "fakemail.com",
  "emltmp.com",
  "tmpbox.net",
  "tmpmail.org",
  "tmpmail.net",
  "wimsg.com",
  "owlymail.com",
  "emailfake.ml",
  "generator-email.com",
  "crazymail.co",
  "throwam.com",
  "trashmail.org",
  "emailondeck.org",
  "tempmailgen.com",
  "emailnator.com",
  "guerrilla.com",
  "sharklaser.com"
]);

/**
 * Regex heuristics detecting throwaway keywords inside the domain host.
 */
const DISPOSABLE_DOMAIN_PATTERNS = [
  /^(temp|tmp)[-_.]?mail/i,
  /mail[-_.]?(temp|fake|trash|drop|dispos)/i,
  /^(throwaway|burner|fake|discard|dispos|junk)[-_.]?mail/i,
  /10min(ute)?[-_.]?mail/i,
  /(guerrilla|sharklaser|trashmail|mailinator)/i,
  /^(spambox|spam4|mytemp|getair)/i,
];

/**
 * Checks if a given email belongs to a disposable or temporary mail service.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return true;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2) return true;

  const domain = parts[1].trim();
  if (!domain || !domain.includes(".")) return true;

  // Direct domain match
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;

  // Subdomain match (e.g., mail.mailinator.com)
  const domainParts = domain.split(".");
  if (domainParts.length > 2) {
    const rootDomain = domainParts.slice(-2).join(".");
    if (DISPOSABLE_EMAIL_DOMAINS.has(rootDomain)) return true;
  }

  // Pattern heuristics
  for (const pattern of DISPOSABLE_DOMAIN_PATTERNS) {
    if (pattern.test(domain)) return true;
  }

  return false;
}

/**
 * Validates that an email is authentic, non-disposable, and RFC-compliant.
 * Throws HttpError(400) if validation fails.
 */
export function validateAuthenticEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new HttpError(400, "Please enter a valid email address.");
  }

  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(clean) || clean.length > 254) {
    throw new HttpError(400, "Please enter a valid, well-formed email address.");
  }

  if (isDisposableEmail(clean)) {
    throw new HttpError(
      400,
      "Disposable and temporary email addresses (e.g. Mailinator, TempMail, GuerrillaMail) are strictly prohibited. Please provide an authentic personal email address."
    );
  }

  return clean;
}
