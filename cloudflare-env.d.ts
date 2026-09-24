declare namespace Cloudflare {
  interface Env {
    APP_ENV?: string;
    APP_URL?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD_HASH?: string;
    MAIL_API_KEY?: string;
    MAIL_FROM?: string;
    MEDIA_SIGNING_SECRET?: string;
    GOOGLE_DRIVE_CLIENT_ID?: string;
    GOOGLE_DRIVE_CLIENT_SECRET?: string;
    GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY?: string;
    ENABLE_TEST_ACCOUNTS?: string;
    PAYMENT_MODE?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
    RAZORPAY_KEY_ID?: string;
    RAZORPAY_KEY_SECRET?: string;
    RAZORPAY_WEBHOOK_SECRET?: string;
    RAZORPAY_PLAN_INSIDER?: string;
    RAZORPAY_PLAN_PREMIUM?: string;
    RAZORPAY_PLAN_VIP?: string;
    CRON_SECRET?: string;
    PINTEREST_SITE_VERIFICATION?: string;
    GOOGLE_ADSENSE_CLIENT?: string;
  }
}
