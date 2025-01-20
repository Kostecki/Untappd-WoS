interface UserListItemImage {
  count: number;
  items: [{ beer_label: string }];
}

interface UserLists {
  list_id: number;
  list_name: string;
  list_description: string;
  total_item_count: number;
  list_image: UserListItemImage;
  is_wish_list: boolean;
  is_public: number;
  is_notes: boolean;
  is_quantity: boolean;
  is_photos: boolean;
  is_serving_style: boolean;
  is_remove_checkin: boolean;
  is_purchase_date: boolean;
  is_purchase_price: boolean;
  is_purchase_location: boolean;
  is_bottled_date: boolean;
  is_best_by_date: boolean;
  edit_item_view: boolean;
  updated_at: string;
  created_at: string;
  unix_updated_at: number;
}
