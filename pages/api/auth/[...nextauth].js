import NextAuth from "next-auth";

export default NextAuth({
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
          name: user.user_name,
          email: user.settings.email_address,
          image: user.user_avatar_hd,
        };
      },
    },
  ],
});
