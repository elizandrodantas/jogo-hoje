import { Otp } from "@prisma/client";
import { Prisma } from "../database";

export class OtpCodeRespository {
    private controller = new OtpCode();
    util: util = new util();

    lastData: Otp | undefined;

    async findByCode({ code }: { code: string }){
        if(!code) return new Error("code required");

        let get = await this.controller.byCode(code);
        if(get instanceof Error) return new Error(get.message);

        return this.lastData = get, get;
    }

    async findByCodeUrl({ code }: { code: string }){
        if(!code) return new Error("code required");

        let get = await this.controller.byCodeUrl(code);
        if(get instanceof Error) return new Error(get.message);

        return this.lastData = get, get;
    }

    async findByUserId({ id }: { id: string }){
        if(!id) return new Error("id required");

        let get = await this.controller.byUserId(id);
        if(get instanceof Error) return new Error(get.message);

        return this.lastData = get, get;
    }

    async findByTaskFirsh({ taskId }: { taskId: string }){
        if(!taskId) return new Error("task required");

        let get = await this.controller.byTask(taskId);
        if(get instanceof Error) return new Error(get.message);

        return this.lastData = get, get;
    }

    async findByTypeMany({ type }: { type: string }){
        return await this.controller.byType(type);
    }

    async invalidateCode({ id }: { id: string }){
        if(!id) return new Error("id required");

        let invalidate = await this.controller.break(id);
        if(invalidate instanceof Error) return new Error(invalidate.message);

        return invalidate;
    }
}

class OtpCode {
    byUserId(userId: string): Promise<Error | Otp>{
        return new Promise(async resolve => {
            let get = await Prisma.otp.findFirst({ where: { userId } });

            if(!get) return resolve(new Error("code not found"));

            return resolve(get);
        });
    }

    byCode(code: string): Promise<Error | Otp>{
        return new Promise(async resolve => {
            let get = await Prisma.otp.findFirst({ where: { code }});

            if(!get) return resolve(new Error("invalid code"));

            return resolve(get);
        });
    }

    byCodeUrl(code: string): Promise<Error | Otp>{
        return new Promise(async resolve => {
            let get = await Prisma.otp.findFirst({ where: { codeUrl: code }});
            if(!get) return resolve(new Error("invalid code"));

            return resolve(get);
        });
    }

    byTask(taskId: string): Promise<Error | Otp>{
        return new Promise(async resolve => {
            let get = await Prisma.otp.findFirst({ where: { taskId }});

            if(!get) return resolve(new Error("invalid task"));

            return resolve(get);
        });
    }

    byType(type: string): Promise<Otp[]>{
        return new Promise(async resolve => {
            let get = await Prisma.otp.findMany({ where: { type }});

            return resolve(get);
        });
    }

    break(id: string){
        return new Promise(async resolve => {
            try{
                let update = await Prisma.otp.update({
                    where: { id },
                    data: {
                        status: false,
                        expireIn: 0
                    }
                });

                return resolve(update);
            }catch(e){ resolve(new Error("error update code")) }
        });
    }
}

class util {
    hideSecret(data: Otp){
        data.secret = undefined as any;

        return data;
    }

    compareUserId(data: Otp, userId: string): boolean{
        let { userId: id } = data;
        if(!id || !userId) return false;

        if(id !== userId) return false;

        return true;
    }
}