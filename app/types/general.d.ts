declare global {
	interface StockList {
		listId: string;
		listName: string;
	}

	interface StockListDetails {
		listId: string;
		listName: string;
		listItems: BeerWithBrewery[];
		styles: number[];
	}
}

export {};
