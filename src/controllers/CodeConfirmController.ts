import { Request, Response } from "express";
import { CodeConfirm } from "../services/CodeConfirm";

export class CodeConfirmController {
    async mail(request: Request, response: Response){
        let { code: mailCode } = request.body as { code: string },
        code, type: "mail-code" | "mail-url" = "mail-url",
        { mailUrl } = request.params as { mailUrl: string },
        client_id = request.headers["client-id"] as any;

        if(request.method === "POST"){
            code = mailCode;
            type = "mail-code";
        }else{
            code = mailUrl
        }

        let execute = await new CodeConfirm().mail({ code, userId: client_id, type});
        if(execute instanceof Error) return response.status(400).json({ error: execute.message });

        return response.status(200).json(execute);
    }
}