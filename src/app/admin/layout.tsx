import { auth, signOut } from "@/lib/auth";import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/projects", label: "Projects", icon: "◈" },
  { href: "/admin/skills", label: "Skills", icon: "◎" },
  { href: "/admin/experience", label: "Experience", icon: "◐" },
  { href: "/admin/messages", label: "Messages", icon: "◻" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const session = await auth();

  // Only redirect from protected pages — login page handles its own rendering
  // Middleware already blocks unauthenticated access to non-login admin routes
  // We only run the full sidebar layout when session exists
  if (!session) {
    return <>{children}</>;
  }

  const unreadCount = await prisma.contactMessage.count({
    where: { isRead: false, isArchived: false },
  });

  const badgeLabel = unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
          {/* Sidebar */}
          <aside
            style={{
              width: "240px",
              minWidth: "240px",
              backgroundColor: "var(--color-bg-secondary)",
              borderRight: "1px solid var(--color-border-default)",
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 0,
              height: "100vh",
              overflowY: "auto",
            }}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "24px 20px 16px",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: "4px",
                }}
              >
                Admin Panel
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {SITE_NAME}
              </div>
            </div>

            {/* Navigation */}
            <nav
              style={{
                padding: "12px 0",
                flex: 1,
              }}
              aria-label="Admin navigation"
            >
              {NAV_LINKS.map(({ href, label, icon }) => {
                const isMessages = label === "Messages";
                return (
                  <a
                    key={href}
                    href={href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 20px",
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 400,
                      transition: "color 150ms, background-color 150ms",
                      borderLeft: "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--color-text-primary)";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                        "var(--color-bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--color-text-secondary)";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                        "transparent";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--color-text-tertiary)",
                          fontFamily: "var(--font-mono)",
                        }}
                        aria-hidden="true"
                      >
                        {icon}
                      </span>
                      {label}
                    </span>
                    {isMessages && badgeLabel !== null && (
                      <span
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-bg-primary)",
                          fontSize: "10px",
                          fontWeight: 600,
                          fontFamily: "var(--font-mono)",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          lineHeight: "1.4",
                          minWidth: "18px",
                          textAlign: "center",
                        }}
                        aria-label={`${badgeLabel} unread messages`}
                      >
                        {badgeLabel}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Sidebar bottom: user info + sign out */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono)",
                }}
                title={session.user?.email ?? ""}
              >
                {session.user?.email ?? "admin"}
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/admin/login" });
                }}
              >
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "transparent",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: "8px",
                    color: "var(--color-text-secondary)",
                    fontSize: "13px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "color 150ms, border-color 150ms",
                    fontFamily: "var(--font-display)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--color-text-primary)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--color-accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--color-text-secondary)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--color-border-strong)";
                  }}
                >
                  Sign Out
                </button>
              </form>
            </div>
          </aside>

          {/* Main area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Top bar */}
            <header
              style={{
                height: "56px",
                borderBottom: "1px solid var(--color-border-subtle)",
                display: "flex",
                alignItems: "center",
                padding: "0 32px",
                backgroundColor: "var(--color-bg-primary)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {SITE_NAME} <span style={{ color: "var(--color-border-strong)" }}>/</span>{" "}
                <span style={{ color: "var(--color-text-secondary)" }}>admin</span>
              </span>
            </header>

            {/* Page content */}
            <main
              style={{
                flex: 1,
                padding: "32px",
                overflowY: "auto",
              }}
            >
              {children}
            </main>
          </div>
    </div>
  );
}