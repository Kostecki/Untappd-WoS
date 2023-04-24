interface Style {
  had: boolean;
  style_id: number;
  style_name: string;
  onList?: string;
}

interface BadgeStyle {
  item_id: number;
  item_name: string;
}

interface NotHadStyle {
  style_id: number;
  style_name: string;
}

interface CombinedStyle extends NotHadStyle {
  had: boolean;
}
