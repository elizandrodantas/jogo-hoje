import { User } from "@prisma/client";
import { Prisma } from "../database";

import { hashSync, compareSync } from 'bcrypt';

interface iClassFindUser {
    byUsername(username: string): Promise<User | null>
    byId(username: string): Promise<User | null>
    byEmail(username: string): Promise<User | null>
}

type iPayloadOptionsTransformDataUserSecure = {
    mask?: boolean;
}

type iResponseTransformDataUserSecure = {
    id: string;
    active: boolean;
    username: string;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export class UserBasicRepository {
    lastData?: User
    lastDataMany?: User[]

    async getUserByUsername(username: string): Promise<Error | User>{
        if(!username) return new Error("user not defined");

        let user = await new FindUser().byUsername(username) as any;
        if(!user) return new Error("user not register");

        return this.lastData = user, user;
    }

    async getUserByEmail(email: string): Promise<Error | User>{
        if(!email) return new Error("email not defined");

        let user = await new FindUser().byEmail(email) as any;
        if(!user) return new Error("email not register");

        return this.lastData = user, user;
    }

    createHashPassword(password: string){
        return hashSync(Buffer.from(password), 1);
    }

    compareHashPassword(password: string, hash: string){
        return compareSync(Buffer.from(password), hash);
    }

    transformSecureShowDataUser(options?: iPayloadOptionsTransformDataUserSecure): Error | iResponseTransformDataUserSecure{
        if(!this.lastData) return new Error("user data not found");

        let { active, created_at, email, id, name, username } = this.lastData;

        console.log(this.lastData)

        let res = {
            id,
            name,
        } as any;

        if(options && options.mask){
            res.email = this.hideMaskMail(email);
            res.username = this.hideMaskHalf(username);
        }

        res.active = active;
        res.created_at = created_at;

        return res;
    }

    transformSecureShowDataUserMany(){}
    
    private hideMaskMail(mail: string): string{
        console.log(mail)
        let [user, domain] = mail.split('@'), c = Math.floor(user.length / 2), r = user.substring(0, c), n = "";
    
        for(let i = 0; i < user.length - r.length;i++){
            n+= "*";
        };
    
        return `${user.substring(0, c) + n}@${domain}`;
    }

    private hideMaskHalf(string: string){
        let c = string.length,
            fair = Math.floor(70 * c / 100),
            diff = Math.floor(c - fair),
            i = Math.floor(diff / 2),
            n = "",
            pref = string.substring(0, i),
            suff = string.substring(fair + i, c);
    
        for(let i = 0; i < fair; i++){
            n+= "*";
        }
    
        return `${pref}${n}${suff}`;
    }
}

class FindUser implements iClassFindUser{
    async byUsername(username: string): Promise<User | null>{
        return await Prisma.user.findFirst({
            where: {
                username
            }
        });
    }

    async byId(id: string): Promise<User | null>{
        return await Prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    async byEmail(email: string): Promise<User | null>{
        return await Prisma.user.findFirst({
            where: {
                email
            }
        });
    }
}