export const metadata = {
  title: "Privacy Policy — nom8",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-nom8-text mb-2">Privacy Policy</h1>
      <p className="text-nom8-text-muted text-sm mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-nom8-text text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. What we collect</h2>
          <p className="text-nom8-text-muted">
            When you create an account, we collect your email address and any information you provide (e.g. favourite heroes). When you vote on matchups, we record the matchup result anonymously. We do not collect or sell personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. How we use it</h2>
          <p className="text-nom8-text-muted">
            Your data is used solely to power the nom8 experience — personalised counter recommendations, mains tracking, and aggregate vote statistics. Email is used for account authentication and optional password recovery only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Authentication</h2>
          <p className="text-nom8-text-muted">
            Authentication is handled by Supabase, which stores credentials securely using industry-standard encryption. You can sign in via email/password or Google OAuth. We never store your Google password.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Cookies</h2>
          <p className="text-nom8-text-muted">
            We use session cookies strictly for authentication purposes. No advertising or tracking cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Data retention</h2>
          <p className="text-nom8-text-muted">
            You can delete your account at any time by contacting us. Upon deletion, all personal data associated with your account is removed within 30 days. Anonymised vote data (no user identifier) may be retained to preserve community statistics.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Third-party services</h2>
          <p className="text-nom8-text-muted">
            nom8 uses <strong>Supabase</strong> for database and authentication and <strong>Vercel</strong> for hosting. These services have their own privacy policies which we encourage you to review.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Contact</h2>
          <p className="text-nom8-text-muted">
            Questions about this policy? Reach out via the{" "}
            <a href="/roadmap" className="text-nom8-orange hover:underline">
              roadmap page
            </a>{" "}
            or open an issue on GitHub.
          </p>
        </section>
      </div>
    </div>
  );
}
