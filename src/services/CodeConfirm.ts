import { Confirmation, User } from "@prisma/client";
import moment from "moment";
import { ConfirmationRepository } from "../repository/ConfirmationRepo";
import { OtpCodeRespository } from "../repository/OtpRepository";
import { UserBasicRepository } from "../repository/UserBasicRepository";

type iPayloadMailConfirmation = {
    code: string;
    userId: string;
}

export class CodeConfirm {
    async mail({ code, userId }: iPayloadMailConfirmation){
        if(!code || !userId) return new Error("code or user not defined");

        let controller = new OtpCodeRespository(),
        controllerConfirmation = new ConfirmationRepository(),
        data = await controller.findByCode({ code });

        if(data instanceof Error) return new Error(data.message);

        if(!controller.util.compareUserId(data, userId)) return new Error("try another code");

        let { expireIn, status, id } = data;
        
        if(!status) return new Error("code already confirm");
        if(moment().unix() > expireIn) return new Error("expired code");

        let { email, confirmations } = await new UserBasicRepository().findById(userId, { confirmations: true }) as User & { confirmations: Confirmation[] }

        if(controllerConfirmation.util.duplicationVerify(confirmations, "email", email)) return new Error("mail already confirmed");

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