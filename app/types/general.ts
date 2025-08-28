interface StockList {
  listId: string;
  listName: string;
}

interface StockListDetails {
  listName: string;
  listItems: BeerWithBrewery[];
  styles: number[];
}
