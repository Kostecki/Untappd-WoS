import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const apiBaseURL = "https://api.untappd.com/v4";

const getBadgeId = async (offset = 0, token) => {
  return await fetch(
    `${apiBaseURL}/user/badges?offset=${offset}&access_token=${token}`
  )
    .then((response) => response.json())
    .then(async (data) => {
      if (!data.response.items) {
        console.error("Couldn't find badge id for wheel of styles");
      } else {
        const badges = data.response.items;
        const wosBadge = badges.find((e) => e.badge_id === 5115);
        if (wosBadge) {
          return wosBadge.user_badge_id;
        } else {
          return getBadgeId(offset + 50, token);
        }
      }
    });
};

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
        token.user.wosBadgeId = await getBadgeId(0, user.accessToken);
      }
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      id: "untappdRaw",
      name: "Untappd",
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const url = `${apiBaseURL}/xauth?client_id=${process.env.UNTAPPD_ID}&client_secret=${process.env.UNTAPPD_SECRET}`;
        const authResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `user_name=${credentials.username}&user_password=${credentials.password}&device_udid=9b5e46525304d62a`,
        });

        if (!authResponse) {
          return null;
        }

        const resp = await authResponse.json();
        const token = resp.response.access_token;

        const user = await fetch(
          `${apiBaseURL}/user/info?access_token=${token}`
        )
          .then((resp) => resp.json())
          .then((data) => data.response.user)
          .catch((err) => console.err(err));

        if (!user) {
          return null;
        }

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
          accessToken: token,
        };
      },
    }),
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
    },
  ],
});
