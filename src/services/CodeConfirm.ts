import { Confirmation, User } from "@prisma/client";
import moment from "moment";
import { ConfirmationRepository } from "../repositories/ConfirmationRepo";
import { OtpCodeRespository } from "../repositories/OtpRepository";
import { UserBasicRepository } from "../repositories/UserBasicRepository";

type iPayloadMailConfirmation = {
    code: string;
    userId: string;
    type: "mail-code" | "mail-url";
}

export class CodeConfirm {
    async mail({ code, userId, type }: iPayloadMailConfirmation){
        if(!code || !userId) return new Error("code and client id required");

        let controller = new OtpCodeRespository(),
        controllerConfirmation = new ConfirmationRepository(),
        data = type === "mail-url" ? await controller.findByCodeUrl({ code }) : await controller.findByCode({ code });

        if(data instanceof Error) return new Error(data.message);

        if(!controller.util.compareUserId(data, userId)) return new Error("try another code");

        let { expireIn, status, id } = data;
        
        if(!status) return new Error("code already confirm");
        if(moment().unix() > expireIn) return new Error("expired code");

        let { email, confirmations } = await new UserBasicRepository().findById(userId, { confirmations: true }) as User & { confirmations: Confirmation[] }

        if(controllerConfirmation.util.alreadyConfirmation(confirmations, "email", email)) return new Error("mail already confirmed");

        Promise.all([
            controller.invalidateCode({ id }),
            controllerConfirmation.create({
                userId,
                type: "email",
                description: email
            })
        ]);

        return { 
            status: true,
            confirmed: moment().toISOString()
        }
    }
}