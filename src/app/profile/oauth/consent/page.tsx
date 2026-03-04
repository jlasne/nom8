import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConsentActions from "./ConsentActions";

export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const returnTo = encodeURIComponent(
      `/profile/oauth/consent?${new URLSearchParams(params).toString()}`
    );
    redirect(`/login?returnTo=${returnTo}`);
  }

  const authRequestId = params.auth_request_id;
  const clientId = params.client_id;
  const scope = params.scope || "profile email";
  const scopes = scope.split(/[\s,]+/).filter(Boolean);

  if (!authRequestId) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="bg-nom8-card rounded-xl border border-white/5 p-8 max-w-sm w-full text-center space-y-3">
          <p className="text-role-damage font-semibold">Invalid authorization request.</p>
          <a href="/" className="text-nom8-orange hover:underline text-sm">Go home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor" className="text-nom8-orange">
                <polygon points="10,2 19,18 1,18" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-nom8-text">Authorize access</h1>
            <p className="text-sm text-nom8-text-muted">
              {clientId ? (
                <><span className="text-nom8-text font-medium">{clientId}</span> is requesting access to your nom8 account</>
              ) : (
                "An application is requesting access to your nom8 account"
              )}
            </p>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-nom8-orange/20 flex items-center justify-center">
              <span className="text-nom8-orange text-sm font-bold">{user.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-nom8-text text-sm font-medium truncate">{user.email}</p>
              <p className="text-nom8-text-muted text-xs">Signed in</p>
            </div>
          </div>

          {/* Requested scopes */}
          <div>
            <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-2">This will allow access to</p>
            <ul className="space-y-2">
              {scopes.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-nom8-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-nom8-orange shrink-0" />
                  {scopeLabel(s)}
                </li>
              ))}
            </ul>
          </div>

          {/* Allow / Deny */}
          <ConsentActions authRequestId={authRequestId} />
        </div>
      </div>
    </div>
  );
}

function scopeLabel(scope: string): string {
  const labels: Record<string, string> = {
    profile: "Your nom8 profile information",
    email: "Your email address",
    openid: "Verify your identity",
    "read:favorites": "Your favourite heroes",
  };
  return labels[scope] ?? scope;
}
