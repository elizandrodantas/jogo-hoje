declare global {
    namespace Express {
      interface Request {
        decoded?: {
          username: string;
          sub: string;
          iss: string;
          aud: string;
          client_id: string;
          iat: number;
          exp: number;
        }
      }
    }
}