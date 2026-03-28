import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<{ id: string; email: string; name: string } | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHashedPassword = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminHashedPassword) {
          console.warn(
            "[auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH environment variables are not set. Admin login is disabled."
          );
          return null;
        }

        if (credentials.email !== adminEmail) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          adminHashedPassword
        );

        if (!isValid) {
          return null;
        }

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET ?? 'fallback-secret-change-me',
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (token.role) {
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});