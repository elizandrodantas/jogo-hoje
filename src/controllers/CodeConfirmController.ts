import { Request, Response } from "express";
import { CodeConfirm } from "../services/CodeConfirm";

export class CodeConfirmController {
    async mail(request: Request, response: Response){
        let { code } = request.body as { code: string };
        let client_id = request.headers['client-id'] as any

        let execute = await new CodeConfirm().mail({ code, userId: client_id});
        if(execute instanceof Error) return response.status(400).json({ error: execute.message });

        return response.status(200).json(execute);
    }
}