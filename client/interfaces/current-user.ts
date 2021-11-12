export interface CurrentUser {
  currentUser: { id: string; email: string; iat: string } | null;
}
