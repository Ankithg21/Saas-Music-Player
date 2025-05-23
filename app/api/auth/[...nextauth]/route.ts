import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/lib/db";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              provider: "Google"
            }
          });
        }
      } catch (e) {
        console.error("Error in signIn callback:", e);
        return false;
      }

      return true;
    },
  },
});

export { handler as GET, handler as POST };
