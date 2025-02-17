declare const umami: {
  identify: (data: { userId: number; email: string; username: string }) => void;
};
