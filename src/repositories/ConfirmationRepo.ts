import { Prisma } from "../database";
import { Confirmation } from '@prisma/client';

type iPayloadConfirmationNew = {
    userId: string;
    type: string;
    description: string;
}

export class ConfirmationRepository {
    private controller: ConfirmationUser = new ConfirmationUser();
    util: util = new util();

    lastData: Confirmation | undefined;
    lastDataMany: Confirmation[] | undefined;

    async create({ userId, type, description }: iPayloadConfirmationNew){
        if(!userId) return new Error("user not defined");

        let create = this.controller.new({ userId, type, description });
        if(create instanceof Error) return new Error(create.message);

        return create;
    }

    async alreadyConfirmation({ userId }: {userId: string}){
        if(!userId) return new Error("user not defined");

        return await this.controller.already(userId);
    }
}

class ConfirmationUser {
    new({ userId, type, description }: iPayloadConfirmationNew){
        return new Promise(async resolve => {
            try{
                let create = await Prisma.confirmation.create({
                    data: { userId, type, description }
                });
                
                if(!create) return resolve(new Error("error create new confirmation"));

                return resolve(create);
            }catch(e){ resolve(new Error("error create new confirmation")) }
        });
    }
    
    already(userId: string){
        return new Promise(async resolve => {
            let get = await Prisma.confirmation.findMany({ 
                where: { userId }
            });

            return resolve(get);
        });
    }
}

class util {
    duplicationVerify(data: Confirmation[], type: string, meta: string){
        return data.find(e => e.type === type && e.description?.includes(meta));
    }
}