interface UserLists {
  list_id: number;
  list_name: string;
  list_description: string;
  total_item_count: number;
}

interface Userlist {
  created_at: string;
  item_id: number;
  list_item_id: number;
  list_type: string;
  beer: Beer;
  brewery: Brewery;
}
