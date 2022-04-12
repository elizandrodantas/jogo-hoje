declare namespace Express {
  export interface Request {
     decoded?: {
      jti: string;
      aud: string;
      client_id: string;
      username: string;
      iss: string
      iat: number
      exp: number
     }
  }
}