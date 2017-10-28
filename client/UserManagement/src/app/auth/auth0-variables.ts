interface AuthConfig {
    clientID: string;
    domain: string;
    callbackURL: string;
    apiUrl: string;
    silentCallbackURL: string;
  }
  
  export const AUTH_CONFIG: AuthConfig = {
    clientID: 'xXc6pKEQKetCQnv29587aZrKTL1YzoYv',
    domain: 'vivenda.auth0.com',
    callbackURL: 'http://localhost:3000/callback',
    apiUrl: 'http://localhost:3000/api',
    silentCallbackURL : 'http://localhost:3000/silent'
  };
  