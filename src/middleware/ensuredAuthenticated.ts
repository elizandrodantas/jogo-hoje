import { NextFunction, Request, Response } from "express";

import { JsonWebToken } from "../core/JsonWebToken";

let { 
    VERIFY_SESSION,
    VERIFY_REALTIME_ACCOUNT_STATUS
 } = process.env;

export class ensuredAuthenticated {
    async middler(request: Request, response: Response, next: NextFunction){
        let { authorization } = request.headers;

        if(!authorization) return response.status(401).json({ error: "authorization token missing" });

        let JWT = new JsonWebToken();

        JWT.setToken(authorization);

        let verifyJWT = JWT.verifyJWT();
        if(verifyJWT instanceof Error) return response.status(401).json({ error: verifyJWT.message });

        let { client_id, jti } = verifyJWT;

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

        request.decoded = verifyJWT;

        return next();
    }
}