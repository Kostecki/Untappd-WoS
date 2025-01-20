interface Pagination {
  next_url: string;
  offset: number;
  max_id: number | null;
}

interface Sorting {
  sort_key: string;
  sort_name: string;
}
