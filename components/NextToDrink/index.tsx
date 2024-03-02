import { Box, Divider, Paper, Typography } from "@mui/material";
import BeerPanel from "../BeerPanel";
import { useSession } from "next-auth/react";
import { useSettings } from "@/context/settings";
import { useEffect, useState } from "react";
import BeerPanelBestBefore from "../BeerPanelBestBefore";

export default function NextToDrink() {
  const { data: session } = useSession();
  const { stockList: settingsStockList } = useSettings();

  const [nextBeer, setNextBeer] = useState<FullBeer>();

  useEffect(() => {
    const fetchNextBeer = async () => {
      if (session?.user) {
        const { apiBase, accessToken, wosBadgeId } = session.user;

        await fetch(
          `${apiBase}/badges/view/${wosBadgeId}?access_token=${accessToken}`
        )
          .then((response) => response.json())
          .then((data) => {
            const styleIds =
              data.response.badge.special_status_list.items[0].items.map(
                (style: BadgeStyle) => style.item_id
              );

            fetch(
              `${apiBase}/custom_lists/view/${settingsStockList?.listId}?sort=best_by_date_asc&hasNotHadBefore=true&mode=v2&access_token=${accessToken}`
            )
              .then((response) => response.json())
              .then((data) => {
                const beer = data.response.items.filter(
                  (beer: FullBeer) =>
                    !styleIds.includes(beer.beer.beer_style_id) &&
                    beer.best_by_date_iso !== "0000-00-00"
                )[0];

                setNextBeer(beer);
              });
          });
      }
    };

    fetchNextBeer();
  }, [session?.user, settingsStockList]);

  return (
    <>
      {settingsStockList?.listId && nextBeer && (
        <Paper sx={{ mb: 2, p: 2 }}>
          <Box>
            <Typography variant="h5">Next to drink</Typography>
          </Box>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Divider />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {<BeerPanelBestBefore beer={nextBeer} />}
          </Box>
        </Paper>
      )}
    </>
  );
}
