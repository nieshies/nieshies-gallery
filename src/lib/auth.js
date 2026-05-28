import Google from "next-auth/providers/google";
import { isEditor, isOwnerEmail, recordSignIn } from "./editorAccess";
import { prisma } from "./prisma";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    // First-time sign-in (and every subsequent one) — drop a row in
    // EditorAccess so the owner sees this person in the pending list.
    async signIn({ user }) {
      await recordSignIn({
        email: user?.email,
        name:  user?.name,
        image: user?.image,
      });
      return true;
    },

    // Backup hook: jwt() fires on initial sign-in with `account` set. If the
    // signIn callback above missed (stale prisma client, transient DB error,
    // etc.), this catches it on the same request.
    async jwt({ token, account, user }) {
      if (account && user?.email) {
        await recordSignIn({
          email: user.email,
          name:  user.name,
          image: user.image,
        });
      }
      return token;
    },

    async session({ session }) {
      const email = session?.user?.email;
      if (email) {
        session.user.isOwner  = isOwnerEmail(email);
        session.user.isEditor = await isEditor(email);
        try {
          const profile = await prisma.profile.upsert({
            where: { email },
            update: { name: session.user.name, image: session.user.image },
            create: { email, name: session.user.name, image: session.user.image },
          });
          session.user.id = profile.id;
        } catch {
          // best-effort
        }
      }
      return session;
    },
  },
};
