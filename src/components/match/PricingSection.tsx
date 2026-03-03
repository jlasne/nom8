export default function PricingSection() {
  return (
    <div className="mt-16 text-center">
      <h2 className="text-2xl font-bold text-nom8-text mb-2">
        Climb faster with smarter picks
      </h2>
      <p className="text-nom8-text-muted mb-8">
        Turn teammate chaos into easy wins.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free tier */}
        <div className="bg-nom8-card rounded-xl border border-white/5 p-6 text-left">
          <h3 className="text-lg font-bold text-nom8-text mb-1">Free</h3>
          <p className="text-sm text-nom8-text-muted mb-4">Get started</p>
          <ul className="space-y-2 text-sm text-nom8-text-muted">
            <li className="flex items-center gap-2">
              <span className="text-verdict-counter">{"\u2713"}</span>
              Vote on matchups
            </li>
            <li className="flex items-center gap-2">
              <span className="text-verdict-counter">{"\u2713"}</span>
              Browse your counters
            </li>
            <li className="flex items-center gap-2">
              <span className="text-verdict-counter">{"\u2713"}</span>
              1 recommendation per role
            </li>
          </ul>
        </div>

        {/* Pro tier */}
        <div className="bg-nom8-card rounded-xl border border-nom8-orange/30 p-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-nom8-orange text-white text-xs font-bold px-3 py-1 rounded-bl">
            PRO
          </div>
          <h3 className="text-lg font-bold text-nom8-text mb-1">Pro</h3>
          <p className="text-sm text-nom8-text-muted mb-4">Win more games</p>
          <ul className="space-y-2 text-sm text-nom8-text-muted">
            <li className="flex items-center gap-2">
              <span className="text-nom8-orange">{"\u2713"}</span>
              Everything in Free
            </li>
            <li className="flex items-center gap-2">
              <span className="text-nom8-orange">{"\u2713"}</span>
              Unlimited AI match helper
            </li>
            <li className="flex items-center gap-2">
              <span className="text-nom8-orange">{"\u2713"}</span>
              Personalized pick suggestions based on your mains
            </li>
            <li className="flex items-center gap-2">
              <span className="text-nom8-orange">{"\u2713"}</span>
              Best overall pick highlights
            </li>
          </ul>

          <button className="mt-6 w-full bg-nom8-orange hover:bg-nom8-orange-light text-white font-semibold py-2.5 rounded-lg transition-colors">
            Upgrade and start locking smarter
          </button>
        </div>
      </div>
    </div>
  );
}
