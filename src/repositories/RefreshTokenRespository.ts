import { refresh } from "@prisma/client";
import { Prisma } from "../database";

type iCreateRefreshToken = {
    token: string;
    expireIn: number;
    userId: string;
    session: string;
}

export class RefreshTokenRepository {
    private controller: RefreshToken = new RefreshToken();
    lastData: refresh | undefined;
    lastDataMany: refresh[] | undefined;

    async create({ token, expireIn, userId, session}: iCreateRefreshToken){
        if(!token || !expireIn || !userId || !session) return new Error("error create new refresh_token");

        let create = await this.controller.new({ token, session, expireIn, userId });
        if(create instanceof Error) return new Error(create.message);

        return this.lastData = create, create;
    }

    async invalidateToken({ id }: { id: string }){
        if(!id) return new Error("id not defined");

        let invalidate = await this.controller.break(id);
        if(invalidate instanceof Error) return new Error(invalidate.message);

        return this.lastData = invalidate, invalidate;
    }

    async findById({ id }: { id: string }){
        if(!id) return new Error("id not defined");

        let find = await this.controller.byId(id);
        if(find instanceof Error) return new Error(find.message);

        return this.lastData = find, find;
    }

    async findByUserId({ id }: { id: string }){
        if(!id) return new Error("id not defined");

        let find = await this.controller.byUserIdFirsh(id);
        if(find instanceof Error) return new Error(find.message);

        return this.lastData = find, find;
    }

    async findByToken({ token }: { token: string }){
        if(!token) return new Error("token not defined");

        let find = await this.controller.byToken(token);
        if(find instanceof Error) return new Error(find.message);

        return this.lastData = find, find;
    }

    async findByUserIdMany({ id }: { id: string }){
        if(!id) return new Error("id not defined");

        let find = await this.controller.byUserIdMany(id);

        return this.lastDataMany = find, find;
    }
}

class RefreshToken {
    new({ token, expireIn, userId, session }: iCreateRefreshToken): Promise<Error | refresh>{
        return new Promise(async resolve => {
            try{
                let create = await Prisma.refresh.create({
                    data: {
                        token,
                        expireIn,
                        session,
                        userId
                    }
                });

                if(!create) return resolve(new Error("erro create new refresh_token"));

                return resolve(create);
            }catch(e){ resolve(new Error("error create new refresh_token")) }
        });
    }

    break(id: string): Promise<Error | refresh>{
        return new Promise(async resolve => {
            try{
                let update = await Prisma.refresh.update({
                    where: { id },
                    data: { status: false, expireIn: 0 }
                });

                return resolve(update);
            }catch(e){ resolve(new Error("error update session")) }
        });
    }

    byId(id: string): Promise<Error | refresh>{
        return new Promise(async resolve => {
            let get = await Prisma.refresh.findFirst({ where: { id }});

            if(!get) return resolve(new Error("token not found"));

            return resolve(get);
        });
    }

    byUserIdFirsh(userId: string): Promise<Error | refresh>{
        return new Promise(async resolve => {
            let get = await Prisma.refresh.findFirst({ where: { userId }});

            if(!get) return resolve(new Error("token not found"));

            return resolve(get);
        });
    }

    byUserIdMany(userId: string): Promise<refresh[]>{
        return new Promise(async resolve => {
            let get = await Prisma.refresh.findMany({ where: { userId }});

            return resolve(get);
        });
    }

    byToken(token: string): Promise<Error | refresh>{
        return new Promise(async resolve => {
            let get = await Prisma.refresh.findFirst({ where: { token }});

            if(!get) return resolve(new Error("token not found"));

            return resolve(get);
        });
    }
}