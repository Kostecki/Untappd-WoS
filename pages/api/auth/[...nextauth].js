import NextAuth from "next-auth";

export default NextAuth({
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = token.user;
      }

      return session;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.user = user;
        // token.user.accessToken = account.access_token;
      }
      return token;
    },
  },
  providers: [
    {
      id: "untappd",
      name: "Untappd",
      type: "oauth",
      clientId: process.env.UNTAPPD_ID,
      clientSecret: process.env.UNTAPPD_SECRET,
      authorization: "https://untappd.com/oauth/authenticate",
      token: {
        async request({ params, provider }) {
          const tokenEndpoint = `https://untappd.com/oauth/authorize?${new URLSearchParams(
            {
              ...params,
              client_id: provider.clientId,
              client_secret: provider.clientSecret,
              redirect_url: provider.callbackUrl,
            }
          )}`;
          const response = await fetch(tokenEndpoint);
          const tokens = await response.json();
          return { tokens: tokens.response };
        },
      },
      userinfo: "https://api.untappd.com/v4/user/info",
      profile(profile) {
        const { user } = profile.response;
        return {
          id: user.id,
          username: user.user_name,
          email: user.settings.email_address,
          image: user.user_avatar_hd,
          firstName: user.first_name,
          lastName: user.last_name,
          isSupporter: user.is_supporter,
          untappdUrl: user.untappd_url,
          stats: {
            totalBadges: user.stats.total_badges,
            totalFriends: user.stats.total_friends,
            totalCheckins: user.stats.total_checkins,
            totalBeers: user.stats.total_beers,
            totalCreatedBeers: user.stats.total_created_beers,
            totalFollowing: user.stats.total_followings,
            totalPhotos: user.stats.total_photos,
          },
          dateJoined: user.date_joined,
        };
      },
      style: {
        logo: "/github.svg",
        logoDark: "/github-dark.svg",
        bg: "#fff",
        bgDark: "#000",
        text: "#000",
        textDark: "#fff",
      },
    },
  ],
});
