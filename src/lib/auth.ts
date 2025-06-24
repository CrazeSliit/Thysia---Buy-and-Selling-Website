import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { UserRoleType } from "@/lib/constants"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Authorize called with:", { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            buyerProfile: true,
            sellerProfile: true,
            driverProfile: true
          }
        })

        console.log("👤 User found:", !!user, user ? { id: user.id, email: user.email, role: user.role, isActive: user.isActive } : 'none')

        if (!user || !user.password) {
          console.log("❌ User not found or no password")
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        console.log("🔑 Password valid:", isPasswordValid)

        if (!isPasswordValid) {
          console.log("❌ Invalid password")
          return null
        }

        if (!user.isActive) {
          console.log("❌ User account deactivated")
          throw new Error("Account has been deactivated. Please contact support.")
        }        console.log("✅ Authorization successful");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
          buyerProfile: user.buyerProfile ? {
            id: user.buyerProfile.id
          } : null,
          sellerProfile: user.sellerProfile ? {
            id: user.sellerProfile.id,
            businessName: user.sellerProfile.businessName || '',
            isVerified: user.sellerProfile.isVerified
          } : null,
          driverProfile: user.driverProfile ? {
            id: user.driverProfile.id,
            isAvailable: user.driverProfile.isAvailable
          } : null
        }
      }
    }),  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("🎫 JWT callback:", { hasUser: !!user, trigger, tokenSub: token.sub })
      
      if (user) {
        console.log("👤 Setting user data in token:", { id: user.id, role: user.role, isActive: user.isActive })
        token.role = user.role
        token.isActive = user.isActive
        token.buyerProfile = user.buyerProfile
        token.sellerProfile = user.sellerProfile  
        token.driverProfile = user.driverProfile
      }

      // Handle session update
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRoleType
        session.user.isActive = token.isActive as boolean
        session.user.buyerProfile = token.buyerProfile as any
        session.user.sellerProfile = token.sellerProfile as any
        session.user.driverProfile = token.driverProfile as any
      }
      return session    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Send welcome notification or email
        console.log(`New user signed up: ${user.email}`)
      }
    }
  }
}
