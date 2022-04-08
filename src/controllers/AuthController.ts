import { Request, Response } from "express";
import { AuthUser } from "../services/AuthUser";

export class AuthUserController {
    async auth(request: Request, response: Response){
        let { body: data } = request;

        let execute = await new AuthUser().auth(data);
        if(execute instanceof Error) return response.status(401).json({ error: execute.message });

        return response.status(200).json(execute);
    }

    async already(request: Request, response: Response){
        let { username, email } = request.query;

        let key = username ? username : email ? email : null as any;

        if(!key) return response.status(400).json({ error: "" });

        let execute = await new AuthUser().already({ key, type: username ? "username" : "email"});
        if(execute instanceof Error) return response.status(400).json({ error: execute.message });
    
        return response.status(200).json(execute)
    }
}