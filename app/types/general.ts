interface StockList {
  listId: string;
  listName: string;
}

interface StockListDeatils {
  listName: string;
  listItems: BeerWithBrewery[];
  styles: number[];
}
