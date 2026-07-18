import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "../lib/db";

export const initPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email)
            return done(new Error("No email found in Google profile"), false);

          let account = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: profile.id,
              },
            },
            include: { user: true },
          });

          if (account) return done(null, account.user);

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                avatarUrl: profile.photos?.[0]?.value || null,
                role: "CANDIDATE",
                profile: {
                  create: {
                    version: 0,
                  },
                },
              },
            });
          }

          await prisma.account.create({
            data: {
              userId: user.id,
              provider: "google",
              providerAccountId: profile.id,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: process.env.GITHUB_CALLBACK_URL!,
        scope: ["user:email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          let email = profile.emails?.[0]?.value;

          if (!email) {
            const emailResponse = await fetch(
              "https://api.github.com/user/emails",
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "User-Agent": "cvault-server",
                },
              },
            );

            if (emailResponse.ok) {
              const emails = (await emailResponse.json()) as any[];
              const primaryEmailObj =
                emails.find((e) => e.primary) || emails[0];
              email = primaryEmailObj?.email;
            }
          }

          if (!email) {
            return done(
              new Error("No email associated with this GitHub account"),
              false,
            );
          }

          let account = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "github",
                providerAccountId: profile.id,
              },
            },
            include: { user: true },
          });

          if (account) return done(null, account.user);

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                avatarUrl: profile.photos?.[0]?.value || null,
                role: "CANDIDATE",
                profile: {
                  create: {
                    version: 0,
                  },
                },
              },
            });
          }

          await prisma.account.create({
            data: {
              userId: user.id,
              provider: "github",
              providerAccountId: profile.id,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );
};
