interface StyleItem {
  type_id: number;
  type_name: string;
  total_count: number;
}

interface Style {
  count: number;
  items: StyleItem[];
}
