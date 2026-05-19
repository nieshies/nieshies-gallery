import Google from "next-auth/providers/google";
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
    async session({ session }) {
      if (session.user?.email) {
        try {
          const profile = await prisma.profile.upsert({
            where: { email: session.user.email },
            update: { name: session.user.name, image: session.user.image },
            create: {
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
            },
          });
          session.user.id = profile.id;
        } catch {
          // Profile creation failed (e.g., during build without DB)
        }
      }
      return session;
    },
  },
};
