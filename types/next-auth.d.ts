import "next-auth";

declare module "next-auth" {
  interface User {
    accessToken: string;
    id: number;
    username: string;
    image: string;
    firstName: string;
    lastName: string;
    isSupporter: boolean;
    untappdUrl: string;
    stats: {
      totalBadges: number;
      totalFriends: number;
      totalCheckins: number;
      totalBeers: number;
      totalCreatedBeers: number;
      totalFollowing: number;
      totalPhotos: number;
    };
    dateJoined: string;
    wosBadgeId?: number;
  }
  export interface Session {
    user: User;
  }
}
