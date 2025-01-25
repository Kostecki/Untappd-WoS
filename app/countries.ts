const countryMapping: { [key: string]: string } = {
  afghanistan: "AF",
  "aland islands": "AX",
  albania: "AL",
  algeria: "DZ",
  "american samoa": "AS",
  andorra: "AD",
  angola: "AO",
  anguilla: "AI",
  antarctica: "AQ",
  "antigua and barbuda": "AG",
  argentina: "AR",
  armenia: "AM",
  aruba: "AW",
  australia: "AU",
  austria: "AT",
  azerbaijan: "AZ",
  bahamas: "BS",
  bahrain: "BH",
  bangladesh: "BD",
  barbados: "BB",
  belarus: "BY",
  belgium: "BE",
  belize: "BZ",
  benin: "BJ",
  bermuda: "BM",
  bhutan: "BT",
  bolivia: "BO",
  "bosnia and herzegovina": "BA",
  botswana: "BW",
  "bouvet island": "BV",
  brazil: "BR",
  "british indian ocean territory": "IO",
  "brunei darussalam": "BN",
  bulgaria: "BG",
  "burkina faso": "BF",
  burundi: "BI",
  cambodia: "KH",
  cameroon: "CM",
  canada: "CA",
  "cape verde": "CV",
  "cayman islands": "KY",
  "central african republic": "CF",
  chad: "TD",
  chile: "CL",
  china: "CN",
  "christmas island": "CX",
  "cocos (keeling) islands": "CC",
  colombia: "CO",
  comoros: "KM",
  congo: "CG",
  "congo, democratic republic": "CD",
  "cook islands": "CK",
  "costa rica": "CR",
  "cote d'ivoire": "CI",
  croatia: "HR",
  cuba: "CU",
  cyprus: "CY",
  "czech republic": "CZ",
  denmark: "DK",
  djibouti: "DJ",
  dominica: "DM",
  "dominican republic": "DO",
  ecuador: "EC",
  egypt: "EG",
  "el salvador": "SV",
  "equatorial guinea": "GQ",
  eritrea: "ER",
  estonia: "EE",
  ethiopia: "ET",
  "falkland islands (malvinas)": "FK",
  "faroe islands": "FO",
  fiji: "FJ",
  finland: "FI",
  france: "FR",
  "french guiana": "GF",
  "french polynesia": "PF",
  "french southern territories": "TF",
  gabon: "GA",
  gambia: "GM",
  georgia: "GE",
  germany: "DE",
  ghana: "GH",
  gibraltar: "GI",
  greece: "GR",
  greenland: "GL",
  grenada: "GD",
  guadeloupe: "GP",
  guam: "GU",
  guatemala: "GT",
  guernsey: "GG",
  guinea: "GN",
  "guinea-bissau": "GW",
  guyana: "GY",
  haiti: "HT",
  "heard island & mcdonald islands": "HM",
  "holy see (vatican city state)": "VA",
  honduras: "HN",
  "hong kong": "HK",
  hungary: "HU",
  iceland: "IS",
  india: "IN",
  indonesia: "ID",
  "iran, islamic republic of": "IR",
  iraq: "IQ",
  ireland: "IE",
  "isle of man": "IM",
  israel: "IL",
  italy: "IT",
  jamaica: "JM",
  japan: "JP",
  jersey: "JE",
  jordan: "JO",
  kazakhstan: "KZ",
  kenya: "KE",
  kiribati: "KI",
  korea: "KR",
  kuwait: "KW",
  kyrgyzstan: "KG",
  "lao people's democratic republic": "LA",
  latvia: "LV",
  lebanon: "LB",
  lesotho: "LS",
  liberia: "LR",
  "libyan arab jamahiriya": "LY",
  liechtenstein: "LI",
  lithuania: "LT",
  luxembourg: "LU",
  macao: "MO",
  macedonia: "MK",
  madagascar: "MG",
  malawi: "MW",
  malaysia: "MY",
  maldives: "MV",
  mali: "ML",
  malta: "MT",
  "marshall islands": "MH",
  martinique: "MQ",
  mauritania: "MR",
  mauritius: "MU",
  mayotte: "YT",
  mexico: "MX",
  "micronesia, federated states of": "FM",
  moldova: "MD",
  monaco: "MC",
  mongolia: "MN",
  montenegro: "ME",
  montserrat: "MS",
  morocco: "MA",
  mozambique: "MZ",
  myanmar: "MM",
  namibia: "NA",
  nauru: "NR",
  nepal: "NP",
  netherlands: "NL",
  "netherlands antilles": "AN",
  "new caledonia": "NC",
  "new zealand": "NZ",
  nicaragua: "NI",
  niger: "NE",
  nigeria: "NG",
  niue: "NU",
  "norfolk island": "NF",
  "northern mariana islands": "MP",
  norway: "NO",
  oman: "OM",
  pakistan: "PK",
  palau: "PW",
  "palestinian territory, occupied": "PS",
  panama: "PA",
  "papua new guinea": "PG",
  paraguay: "PY",
  peru: "PE",
  philippines: "PH",
  pitcairn: "PN",
  poland: "PL",
  portugal: "PT",
  "puerto rico": "PR",
  qatar: "QA",
  reunion: "RE",
  romania: "RO",
  "russian federation": "RU",
  rwanda: "RW",
  "saint barthelemy": "BL",
  "saint helena": "SH",
  "saint kitts and nevis": "KN",
  "saint lucia": "LC",
  "saint martin": "MF",
  "saint pierre and miquelon": "PM",
  "saint vincent and grenadines": "VC",
  samoa: "WS",
  "san marino": "SM",
  "sao tome and principe": "ST",
  "saudi arabia": "SA",
  senegal: "SN",
  serbia: "RS",
  seychelles: "SC",
  "sierra leone": "SL",
  singapore: "SG",
  slovakia: "SK",
  slovenia: "SI",
  "solomon islands": "SB",
  somalia: "SO",
  "south africa": "ZA",
  "south georgia and sandwich isl.": "GS",
  spain: "ES",
  "sri lanka": "LK",
  sudan: "SD",
  suriname: "SR",
  "svalbard and jan mayen": "SJ",
  swaziland: "SZ",
  sweden: "SE",
  switzerland: "CH",
  "syrian arab republic": "SY",
  taiwan: "TW",
  tajikistan: "TJ",
  tanzania: "TZ",
  thailand: "TH",
  "timor-leste": "TL",
  togo: "TG",
  tokelau: "TK",
  tonga: "TO",
  "trinidad and tobago": "TT",
  tunisia: "TN",
  turkey: "TR",
  turkmenistan: "TM",
  "turks and caicos islands": "TC",
  tuvalu: "TV",
  uganda: "UG",
  ukraine: "UA",
  "united arab emirates": "AE",
  "united kingdom": "GB",
  "united states": "US",
  "united states outlying islands": "UM",
  uruguay: "UY",
  uzbekistan: "UZ",
  vanuatu: "VU",
  venezuela: "VE",
  "viet nam": "VN",
  "virgin islands, british": "VG",
  "virgin islands, u.s.": "VI",
  "wallis and futuna": "WF",
  "western sahara": "EH",
  yemen: "YE",
  zambia: "ZM",
  zimbabwe: "ZW",
  "north macedonia": "MK",
  češka: "CZ",
};

const brokenCountryMap: { [key: string]: string } = {
  "british virgin islands": "VG",
  brunei: "BN",
  "channel islands - guernsey": "GG",
  "channel islands - jersey": "JE",
  "china / people's republic of china": "CN",
  curacao: "CW",
  "democratic republic of the congo": "CG",
  "east timor": "TL",
  england: "GB-ENG",
  eswatini: "SZ",
  "falkland islands": "FK",
  iran: "IR",
  "ivory coast": "CI",
  kosovo: "XK",
  laos: "LA",
  libya: "LY",
  macau: "MO",
  micronesia: "FM",
  "myanmar (burma)": "MM",
  "north korea": "KP",
  "northern ireland": "GB",
  "palestinian territories": "PS",
  "principality of monaco": "MC",
  "republic of congo": "CD",
  russia: "RU",
  "são tomé and príncipe": "ST",
  scotland: "GB-SCT",
  "sint maarten": "MF",
  "south korea": "KR",
  "south sudan": "SS",
  "st. lucia": "LC",
  "st. vincent &amp; the grenadines": "VC",
  surinam: "SR",
  syria: "SY",
  "united states virgin islands": "VG",
  vietnam: "VN",
  wales: "GB-WLS",
};

const isoToEmoji = (countryCode: string) => {
  if (!countryCode) return "";

  // Special case for non-country countries
  if (countryCode.length > 2) {
    switch (countryCode) {
      case "GB-ENG":
        return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
      case "GB-SCT":
        return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
      case "GB-WLS":
        return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
      default:
        return "🕵️";
    }
  }

  // Convert the country code to flag emoji
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join("");
};

const countryToEmoji = (countryName: string) => {
  const countryNameTrimmed = countryName.trim().toLowerCase();

  if (countryMapping[countryNameTrimmed]) {
    const alpha2 = countryMapping[countryNameTrimmed];
    return isoToEmoji(alpha2);
  } else if (brokenCountryMap[countryNameTrimmed]) {
    const alpha2 = brokenCountryMap[countryNameTrimmed];
    return isoToEmoji(alpha2);
  }

  if (countryNameTrimmed === "other") {
    return "🌍";
  }

  return "🕵️";
};

export default countryToEmoji;
