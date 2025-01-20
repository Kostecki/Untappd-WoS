interface Level {
  currentLevel: number;
  progressToNext: number;
  checkInsPerLevel: number;
  maxLevel: number;
}

interface Stats {
  hadCount: number;
  notHadCount: number;
  totalCount: number;
  level: Level;
}
