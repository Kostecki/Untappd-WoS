interface BadgeMedia {
  badge_image_sm: string;
  badge_image_md: string;
  badge_image_lg: string;
}

interface Badge {
  badge_id: number;
  user_badge_id: number;
  checkin_id: number;
  badge_name: string;
  badge_description: string;
  badge_hint: string;
  badge_active_status: number;
  media: BadgeMedia;
  earned_at: string;
  created_at: string;
  is_level: boolean;
  category_id: number;
}
