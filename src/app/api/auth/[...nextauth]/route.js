import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../../firebase";

const handler = NextAuth({
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          if (credentials.isFirebaseGoogleUser) {
            return {
              id: credentials.uid,
              email: credentials.email,
              name: credentials.name,
              image: credentials.image,
            };
          }
        
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email || "",
            credentials.password || ""
          );
          
          if (userCredential.user) {
            return {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              name: userCredential.user.displayName,
              image: userCredential.user.photoURL,
            };
          }
          return null;
        } catch (error) {
          console.log("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };