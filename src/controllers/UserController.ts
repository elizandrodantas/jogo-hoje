import { Request, Response } from "express";
import { UserServices } from "../services/UserService";

export class UserController {
    async UserInfo(request: Request, response: Response){
        let { client_id } = request.decoded as { client_id: string };

        let get = await new UserServices().getInfo(client_id);
        if(get instanceof Error) return response.status(400).json({ error: get.message });

        return response.status(200).json(get);
    }
}