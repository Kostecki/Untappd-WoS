import { ReactNode, createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";

const countryBadgesDefault = [
  {
    badgeId: 346018,
    userBadgeId: undefined,
    badgeName: "Baking in Balkan",
    badgeHint:
      "Check-in to 5 different beers from one of the following countries: \r\n\r\nAlbania, Bosnia and Herzegovina, Bulgaria, Croatia, Greece, Kosovo, Montenegro, North Macedonia, Romania, Serbia, or Slovenia.",
    country:
      "Albania, Bosnia and Herzegovina, Bulgaria, Croatia, Greece, Kosovo, Montenegro, North Macedonia, Romania, Serbia, or Slovenia",
    flag: ["🇦🇱", "🇧🇦", "🇧🇬", "🇭🇷", "🇬🇷", "🇽🇰", "🇲🇪", "🇲🇰", "🇷🇴", "🇷🇸", "🇸🇮"],
    level: 0,
  },
  {
    badgeId: 2237,
    userBadgeId: undefined,
    badgeName: "Belgian Holiday",
    badgeHint: "Checkin to 5 different beers from Belgium.",
    country: "Belgium",
    flag: ["🇧🇪"],
    level: 0,
  },
  {
    badgeId: 12208,
    userBadgeId: undefined,
    badgeName: "Beware of the Bison!",
    badgeHint: "Check-in 5 different beers from a brewery from Belarus.",
    country: "Belarus",
    flag: ["🇧🇾"],
    level: 0,
  },
  {
    badgeId: 691,
    userBadgeId: undefined,
    badgeName: "Brew Lagoon ",
    badgeHint: "Check-in 5 different beers from a brewery from Iceland.",
    country: "Iceland",
    flag: ["🇮🇸"],
    level: 0,
  },
  {
    badgeId: 4559,
    userBadgeId: undefined,
    badgeName: "Brew of the Dragon",
    badgeHint: "Check-in to 5 different beers from a brewery from China.",
    country: "China",
    flag: ["🇨🇳"],
    level: 0,
  },
  {
    badgeId: 34505,
    userBadgeId: undefined,
    badgeName: "Budmo",
    badgeHint: "Check-in 5 different beers from a brewery from Ukraine.",
    country: "Ukraine",
    flag: ["🇺🇦"],
    level: 0,
  },
  {
    badgeId: 5813,
    userBadgeId: undefined,
    badgeName: "Call of the Swiss",
    badgeHint: "Check-in 5 different beers from a brewery from Switzerland.",
    country: "Switzerland",
    flag: ["🇨🇭"],
    level: 0,
  },
  {
    badgeId: 10,
    userBadgeId: undefined,
    badgeName: "Cerveza Matador",
    badgeHint: "Hola! Bebe cinco cervezas de Mexico.",
    country: "Mexico",
    flag: ["🇲🇽"],
    level: 0,
  },
  {
    badgeId: 857,
    userBadgeId: undefined,
    badgeName: "Czech It Out",
    badgeHint:
      "Check-in 5 different beers from a brewery from the Czech Republic.",
    country: "Czech Republic",
    flag: ["🇨🇿"],
    level: 0,
  },
  {
    badgeId: 92102,
    userBadgeId: undefined,
    badgeName: "Danish Delight",
    badgeHint: "Check-in 5 different beers from a brewery from Denmark.",
    country: "Denmark",
    flag: ["🇩🇰"],
    level: 0,
  },
  {
    badgeId: 494,
    userBadgeId: undefined,
    badgeName: "Das Boot",
    badgeHint: "Enjoy some German beers. 5 different ones to be exact.",
    country: "Germany",
    flag: ["🇩🇪"],
    level: 0,
  },
  {
    badgeId: 5531,
    userBadgeId: undefined,
    badgeName: "Deep Blue Sea",
    badgeHint:
      "Check-in 5 different beers from a brewery located in the Caribbean (Barbados, Trinidad and Tobago, Jamaica, Bahamas, Dominican Republic, Cuba or Haiti).",
    country:
      "Barbados, Trinidad and Tobago, Jamaica, Bahamas, Dominican Republic, Cuba or Haiti",
    flag: ["🇧🇧", "🇹🇹", "🇯🇲", "🇧🇸", "🇩🇴", "🇨🇺", "🇭🇹"],
    level: 0,
  },
  {
    badgeId: 75,
    userBadgeId: undefined,
    badgeName: "Down Under",
    badgeHint:
      "Are you seeing Kangaroos? Have at least 5 different beers from Australia!",
    country: "Australia",
    flag: ["🇦🇺"],
    level: 0,
  },
  {
    badgeId: 408,
    userBadgeId: undefined,
    badgeName: "Drink Like a Kiwi",
    badgeHint:
      "Check into to 5 different beers from breweries from New Zealand.",
    country: "New Zealand",
    flag: ["🇳🇿"],
    level: 0,
  },
  {
    badgeId: 346118,
    userBadgeId: undefined,
    badgeName: "El Central",
    badgeHint:
      "Check-in 5 different beers from a brewery located in Central America (Belize, Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua and Panama)",
    country:
      "Belize, Costa Rica, El Salvador, Guatemala, Honduras, Nicaragua or Panama",
    flag: ["🇧🇿", "🇨🇷", "🇸🇻", "🇬🇹", "🇭🇳", "🇳🇮", "🇵🇦"],
    level: 0,
  },
  {
    badgeId: 682,
    userBadgeId: undefined,
    badgeName: "Flamenco",
    badgeHint: "Check-in 5 different beers from a brewery from Spain.",
    country: "Spain",
    flag: ["🇪🇸"],
    level: 0,
  },
  {
    badgeId: 6079,
    userBadgeId: undefined,
    badgeName: "Get Them To the Greek",
    badgeHint: "Check-in 5 different beers from a brewery from Greece.",
    country: "Greece",
    flag: ["🇬🇷"],
    level: 0,
  },
  {
    badgeId: 2565,
    userBadgeId: undefined,
    badgeName: "God Save the King",
    badgeHint: "Drink 5 different beers from the United Kingdom or England.",
    country: "UK",
    flag: ["🇬🇧"],
    level: 0,
  },
  {
    badgeId: 673,
    userBadgeId: undefined,
    badgeName: "Going Dutch",
    badgeHint: "Check-in 5 different beers from the Netherlands.",
    country: "Netherlands",
    flag: ["🇳🇱"],
    level: 0,
  },
  {
    badgeId: 5216,
    userBadgeId: undefined,
    badgeName: "Going on Safari",
    badgeHint:
      "Check-in 5 different beers from a brewery located in the continent of Africa.",
    country:
      "Egypt, Kenya, Mauritius, Namibia, Sierra Leone, Togo, Botswana, Cameroon, Eritrea, Ethiopia, Gambia, Ghana, Malawi, Morocco, Niger, Nigeria, Rwanda, South Africa, Swaziland, Sudan, Uganda, Tunisia, Zambia, Zimbabwe, Democratic Republic of the Congo, Mozambique, Tanzania, Liberia, Senegal, Mali, Angola, Burundi, Madagascar, Ivory Coast, Algeria, Cape Verde, Burkina Faso, Benin, Chad, Guinea, São Tomé and Príncipe, Lesotho, Seychelles, Central African Republic, Libya or the Republic of Congo",
    flag: [
      "🇪🇬",
      "🇰🇪",
      "🇲🇺",
      "🇳🇦",
      "🇸🇱",
      "🇹🇬",
      "🇧🇼",
      "🇨🇲",
      "🇪🇷",
      "🇪🇹",
      "🇬🇲",
      "🇬🇭",
      "🇲🇼",
      "🇲🇦",
      "🇳🇪",
      "🇳🇬",
      "🇷🇼",
      "🇿🇦",
      "🇸🇿",
      "🇸🇩",
      "🇺🇬",
      "🇹🇳",
      "🇿🇲",
      "🇿🇼",
      "🇨🇩",
      "🇲🇿",
      "🇹🇿",
      "🇱🇷",
      "🇸🇳",
      "🇲🇱",
      "🇦🇴",
      "🇧🇮",
      "🇲🇬",
      "🇨🇮",
      "🇩🇿",
      "🇨🇻",
      "🇧🇫",
      "🇧🇯",
      "🇹🇩",
      "🇬🇳",
      "🇸🇹",
      "🇱🇸",
      "🇸🇨",
      "🇨🇫",
      "🇱🇾",
      "🇨🇬",
    ],
    level: 0,
  },
  {
    badgeId: 3624,
    userBadgeId: undefined,
    badgeName: "Here Come the Vikings!",
    badgeHint: "Check-in 5 different beers from a brewery from Norway.",
    country: "Norway",
    flag: ["🇳🇴"],
    level: 0,
  },
  {
    badgeId: 3906,
    userBadgeId: undefined,
    badgeName: "Highlander",
    badgeHint: "Check-in 5 different beers from a brewery from Scotland.",
    country: "Scotland",
    flag: ["🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
    level: 0,
  },
  {
    badgeId: 4053,
    userBadgeId: undefined,
    badgeName: "La Crème de la Crème",
    badgeHint:
      "Check-in 5 different beers from a brewery in France or New Caledonia.",
    country: "France or New Caledonia",
    flag: ["🇫🇷", "🇳🇨"],
    level: 0,
  },
  {
    badgeId: 345918,
    userBadgeId: undefined,
    badgeName: "Latitude for Latvia",
    badgeHint: "Check-in 5 different beers from a brewery from Latvia.",
    country: "Latvia",
    flag: ["🇱🇻"],
    level: 0,
  },
  {
    badgeId: 490,
    userBadgeId: undefined,
    badgeName: "Luck of the Irish",
    badgeHint: "Check-in to 5 beers from a brewery from Ireland.",
    country: "Ireland",
    flag: ["🇮🇪"],
    level: 0,
  },
  {
    badgeId: 537444,
    userBadgeId: undefined,
    badgeName: "Na zdravje: Breweries from Slovenia",
    badgeHint: "Check in any beers brewed by a brewery from Slovenia.",
    country: "Slovenia",
    flag: ["🇸🇮"],
    level: 0,
  },
  {
    badgeId: 4609,
    userBadgeId: undefined,
    badgeName: "Never Finnished!",
    badgeHint: "Check-in to 5 different beers from a brewery from Finland.",
    country: "Finland",
    flag: ["🇫🇮"],
    level: 0,
  },
  {
    badgeId: 4336,
    userBadgeId: undefined,
    badgeName: "Pole Position",
    badgeHint: "Check-in to 5 different beers from a brewery from Poland.",
    country: "Poland",
    flag: ["🇵🇱"],
    level: 0,
  },
  {
    badgeId: 73,
    userBadgeId: undefined,
    badgeName: "Rising Sun",
    badgeHint: "Drink 5 different beers from Japan.",
    country: "Japan",
    flag: ["🇯🇵"],
    level: 0,
  },
  {
    badgeId: 417485,
    userBadgeId: undefined,
    badgeName: "Roamin' In Romania",
    badgeHint:
      "Check-in to 5 different beers from a brewery from the country of Romania.",
    country: "Romania",
    flag: ["🇷🇴"],
    level: 0,
  },
  {
    badgeId: 537044,
    userBadgeId: undefined,
    badgeName: "Sláinte: Breweries from Northern Ireland",
    badgeHint: "Check in any beers brewed by a brewery from Northern Ireland.",
    country: "Northern Ireland",
    flag: ["🇬🇧"],
    level: 0,
  },
  {
    badgeId: 243696,
    userBadgeId: undefined,
    badgeName: "Small But Not Forgotten",
    badgeHint:
      "Check-in 5 different beers from a brewery from these countries/territories: Andorra, Channel Islands, Faroe Islands, Gibraltar, Greenland, Isle of Man, Liechtenstein, Malta, Monaco, Cyprus, San Marino, Luxembourg or Åland Islands.",
    country:
      "Andorra, Channel Islands, Faroe Islands, Gibraltar, Greenland, Isle of Man, Liechtenstein, Malta, Monaco, Cyprus, San Marino, Luxembourg or Åland Islands",
    flag: [
      "🇦🇩",
      "🇯🇪",
      "🇫🇴",
      "🇬🇮",
      "🇬🇱",
      "🇮🇲",
      "🇱🇮",
      "🇲🇹",
      "🇲🇨",
      "🇨🇾",
      "🇸🇲",
      "🇱🇺",
      "🇦🇽",
    ],
    level: 0,
  },
  {
    badgeId: 407,
    userBadgeId: undefined,
    badgeName: "Suds Samba",
    badgeHint: "Check in to 5 different beers from breweries from Brazil.",
    country: "Brazil",
    flag: ["🇧🇷"],
    level: 0,
  },
  {
    badgeId: 708,
    userBadgeId: undefined,
    badgeName: "Swedish Brews",
    badgeHint: "Check-in 5 different beers from a brewery from Sweden.",
    country: "Sweden",
    flag: ["🇸🇪"],
    level: 0,
  },
  {
    badgeId: 6129,
    userBadgeId: undefined,
    badgeName: "Terviseks!",
    badgeHint: "Check-in 5 different beers from a brewery from Estonia.",
    country: "Estonia",
    flag: ["🇪🇪"],
    level: 0,
  },
  {
    badgeId: 5863,
    userBadgeId: undefined,
    badgeName: "That's for Sör!",
    badgeHint: "Check-in 5 different beers from a brewery from Hungary.",
    country: "Hungary",
    flag: ["🇭🇺"],
    level: 0,
  },
  {
    badgeId: 12258,
    userBadgeId: undefined,
    badgeName: "The Backpacker",
    badgeHint:
      "Check-in 5 different beers from a brewery from one of the following South East Asian countries: Myanmar, Thailand, Malaysia, Philippines, Singapore, Indonesia, East Timor, Vietnam, Cambodia, Laos, Taiwan or Brunei.",
    country:
      "Myanmar, Thailand, Malaysia, Philippines, Singapore, Indonesia, East Timor, Vietnam, Cambodia, Laos, Taiwan or Brunei",
    flag: ["🇲🇲", "🇹🇭", "🇵🇭", "🇸🇬", "🇮🇩", "🇹🇱", "🇻🇳", "🇰🇭", "🇱🇦", "🇹🇼", "🇧🇳"],
    level: 0,
  },
  {
    badgeId: 288226,
    userBadgeId: undefined,
    badgeName: "The Croats",
    badgeHint: "Check-in 5 different beers from a brewery from Croatia.",
    country: "Croatia",
    flag: ["🇭🇷"],
    level: 0,
  },
  {
    badgeId: 574,
    userBadgeId: undefined,
    badgeName: "The Gondolier",
    badgeHint: "Drink 5 different beers from a brewery from Italy.",
    country: "Italy",
    flag: ["🇮🇹"],
    level: 0,
  },
  {
    badgeId: 409,
    userBadgeId: undefined,
    badgeName: "The Great White North",
    badgeHint: "Drink 5 different beers from a brewery from Canada.",
    country: "Canada",
    flag: ["🇨🇦"],
    level: 0,
  },
  {
    badgeId: 288425,
    userBadgeId: undefined,
    badgeName: "The Sign of Vytis",
    badgeHint:
      "Check-in 5 different beers from a brewery located in Lithuania.",
    country: "Lithuania",
    flag: ["🇱🇹"],
    level: 0,
  },
  {
    badgeId: 5116,
    userBadgeId: undefined,
    badgeName: "Trekking the Alps",
    badgeHint:
      "Check-in to 5 different beers from a brewery located in Austria.",
    country: "Austria",
    flag: ["🇦🇹"],
    level: 0,
  },
  {
    badgeId: 12609,
    userBadgeId: undefined,
    badgeName: "Uma Cerveja",
    badgeHint: "Check-in 5 different beers from a brewery from Portugal.",
    country: "Portugal",
    flag: ["🇵🇹"],
    level: 0,
  },
  {
    badgeId: 6029,
    userBadgeId: undefined,
    badgeName: "Wailing For Wales",
    badgeHint: "Check-in to 5 different beers by a brewery from Wales.",
    country: "Wales",
    flag: ["🏴󠁧󠁢󠁷󠁬󠁳󠁿"],
    level: 0,
  },
  {
    badgeId: 537144,
    userBadgeId: undefined,
    badgeName: "наздраве: Breweries from Bulgaria",
    badgeHint: "Check in any beers brewed by a brewery from Bulgaria.",
    country: "Bulgaria",
    flag: ["🇧🇬"],
    level: 0,
  },
  {
    badgeId: 537244,
    userBadgeId: undefined,
    badgeName: "अच्छी सेहत के लिए: Breweries from India",
    badgeHint: "Check in any beers brewed by a brewery from India.",
    country: "India",
    flag: ["🇮🇳"],
    level: 0,
  },
  {
    badgeId: 537344,
    userBadgeId: undefined,
    badgeName: "건배: Breweries from South Korea",
    badgeHint: "Check in any beers brewed by a brewery from South Korea.",
    country: "South Korea",
    flag: ["🇰🇷"],
    level: 0,
  },
];

type countriesContextType = {
  countryBadges: any[];
  loading: boolean;
  fetchCountries: () => void;
};

const countriesContextValues: countriesContextType = {
  countryBadges: [],
  loading: false,
  fetchCountries: () => {},
};

const CountriesContext = createContext<countriesContextType>(
  countriesContextValues
);

export function useCountries() {
  return useContext(CountriesContext);
}

type Props = {
  children: ReactNode;
};

export function CountriesProvider({ children }: Props) {
  const { data: session } = useSession();

  const [countryBadges, setCountryBadges] = useState(countryBadgesDefault);
  const [loading, setLoading] = useState(false);

  const fetchCountries = () => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      setLoading(true);

      fetch(
        `${apiBase}/user/badges?limit=500&method=full&mode=v2&segment=beer&sort=badge_name&access_token=${accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          const badges = data.response.badges.items;
          const ids = countryBadges.map((e) => e.badgeId);

          const payload = countryBadges;
          badges.forEach((badge: any) => {
            if (ids.includes(badge.badge_id)) {
              const badgeIndex = payload.findIndex(
                (e) => e.badgeId === badge.badge_id
              );

              if (badge.has_badge) {
                payload[badgeIndex].level = badge.level_status;
                payload[badgeIndex].userBadgeId = badge.user_badge_id;
              }
            }
          });

          payload.sort((a, b) => b.level - a.level);

          setCountryBadges(payload);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.error(err);
        });
    }
  };

  const value = {
    countryBadges,
    loading,
    fetchCountries,
  };

  return (
    <CountriesContext.Provider value={value}>
      {children}
    </CountriesContext.Provider>
  );
}
