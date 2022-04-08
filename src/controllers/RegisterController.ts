import { Request, Response } from "express";
import { RegisterUser } from "../services/RegisterUser";

export class RegisterController {
    async registerUser(request: Request, response: Response){
        let { body: data } = request;

        let register = await new RegisterUser().execute(data);
        if(register instanceof Error) return response.status(400).json({ error: register.message });

        return response.status(200).json(register);
    }
}