import { Request, Response } from "express";
import { CodeConfirm } from "../services/CodeConfirm";

export class CodeConfirmController {
    async mail(request: Request, response: Response){
        let { mailCode } = request.body as { mailCode: string },
        { mailUrl } = request.params as { mailUrl: string },
        client_id = request.headers['client-id'] as any,
        type: "mail-url" | "mail-code" = mailUrl ? "mail-url" : "mail-code",
        code = type === "mail-url" ? mailUrl : mailCode;

        let execute = await new CodeConfirm().mail({ code, userId: client_id, type});
        if(execute instanceof Error) return response.status(400).json({ error: execute.message });

        return response.status(200).json(execute);
    }
}