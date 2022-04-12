import { NextFunction, Request, Response } from "express";

import { iDecodedJsonWebToken, JsonWebToken } from "../core/JsonWebToken";

let { 
    VERIFY_SESSION,
    VERIFY_REALTIME_ACCOUNT_STATUS
 } = process.env;

export class ensuredAuthenticated {
    async middler(request: Request, response: Response, next: NextFunction){
        let { authorization } = request.headers, JWT = new JsonWebToken();

        if(!authorization) return response.status(401).json({ error: "authorization token missing" });

        JWT.setToken(authorization);

        let verifyJWT = JWT.verifyJWT();
        if(verifyJWT instanceof Error) return response.status(401).json({ error: verifyJWT.message });

        request.decoded = verifyJWT;

        return next();
    }

    async session(request: Request, response: Response, next: NextFunction){
        let { client_id, jti  } = request.decoded as iDecodedJsonWebToken, JWT = new JsonWebToken();

        JWT.setClientId(client_id);
        await JWT.setUserInfo();
        
        if(VERIFY_SESSION){
            let vSession = JWT.verifySessionUser(jti);
            if(vSession instanceof Error) return response.status(403).json({ error: vSession.message });
        }

        if(VERIFY_REALTIME_ACCOUNT_STATUS){
            let vRealTime = JWT.verifyAccountStatus();
            if(vRealTime instanceof Error) return response.status(403).json({ error: vRealTime.message });
        }

        return next();
    }
}