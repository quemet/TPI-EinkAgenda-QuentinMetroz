export default interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'family-admin' | 'app-admin';
  personType: 'young' | 'elder';
}
