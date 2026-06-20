import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";
import { env } from "./env";


export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),

    databaseHooks: {
        user: {
            create: {
                after: async (user: any) => {
                    try {
                        const { sendWelcomeEmail } = await import("./mail");
                        await sendWelcomeEmail(user.email, user.name || "there");
                    } catch (error) {
                        console.error("Failed to send welcome email:", error);
                    }
                }
            }
        }
    },

    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
        },

        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET

        }
    }
});