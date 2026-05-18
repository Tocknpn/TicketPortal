import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAllUsers } from "./sheets";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as User & { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const users = await getAllUsers();
        const user = users.find((u) => u.email === credentials.username);
        if (!user) return null;
        const passwordMatch = user.password.startsWith("$2b$")
          ? await bcrypt.compare(credentials.password, user.password)
          : user.password === credentials.password;
        if (!passwordMatch) return null;
        return { id: user.email, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
};
