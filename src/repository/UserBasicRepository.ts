import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import { Prisma as PrismaClient, User } from "@prisma/client";
import { hashSync, compareSync } from 'bcrypt';

import { Prisma } from "../database";

type iPayloadNewUser = {
    id: string;
    name: string;
    password: string;
    email: string;
    username: string;
}

type iPayloadCreateUser = {
    id?: string;
    name: string;
    password: string;
    email: string;
    username: string;
}

type iPayloadOptionsTransformDataUserSecure = {
    mask?: boolean;
    trust?: boolean;
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

type iOptionsHideData = {
    id?: boolean;
    password?: boolean;
    name?: boolean;
    email?: boolean;
    last_seen?: boolean;
    update?: boolean;
    create?: boolean;
    session?: boolean;
    all_null?: boolean;
}

export class UserBasicRepository {
    private controller: UserBasic = new UserBasic();
    util: util = new util();

    lastData?: User
    lastDataMany?: User[]

    _id: string = "";

    constructor(){
        this._id = uuidv4();
    }

    async create({ username, password, email, name, id }: iPayloadCreateUser){
        if(!username || !password || !email || !name) return new Error("parameteres invalid");
        id = id ? id : this._id;

        let create = await this.controller.new({ username, password, email, name, id });
        if(create instanceof Error) return new Error(create.message);

        return create;
    }

    async findByUsername(username: string): Promise<Error | User>{
        if(!username) return new Error("username not defined");

        let user = await this.controller.byUsername(username);
        if(user instanceof Error) return new Error(user.message);

        return this.lastData = user, user;
    }

    async findByEmail(email: string): Promise<Error | User>{
        if(!email) return new Error("email not defined");

        let user = await this.controller.byEmail(email);
        if(user instanceof Error) return new Error(user.message);

        return this.lastData = user, user;
    }

    async findById(id: string, includes?: PrismaClient.UserInclude){
        if(!id) return new Error("id not defined");

        let user = await this.controller.byId(id, includes);
        if(user instanceof Error) return new Error(user.message);

        return this.lastData = user, user;
    }
}

class UserBasic {
    new({ id, name, username, email, password }: iPayloadNewUser): Promise<User | Error>{
        return new Promise(async resolve => {
            try{
                let register = await Prisma.user.create({
                    data: { id, name, username, email, password }
                });

                if(!register) return resolve(new Error("error create new user"));

                return resolve(register);
            }catch(e){ resolve(new Error("error create new user")) }
        });
    }

    byUsername(username: string): Promise<User | Error>{
        return new Promise(async resolve => {
            let get = await Prisma.user.findFirst({ where: { username }});
            if(!get) return resolve(new Error("user not found"));

            return resolve(get);
        });
    }

    byId(id: string, includes?: PrismaClient.UserInclude): Promise<User | Error>{
        return new Promise(async resolve => {
            let get = await Prisma.user.findFirst({ where: { id }, include: includes});
            if(!get) return resolve(new Error("user not found"));

            return resolve(get);
        });
    }

    byEmail(email: string): Promise<User | Error>{
        return new Promise(async resolve => {
            let get = await Prisma.user.findFirst({ where: { email }});
            if(!get) return resolve(new Error("user not found"));

            return resolve(get);
        });
    }
}

class util {
    createHashPassword(password: string){
        return hashSync(Buffer.from(password), 1);
    }

    compareHashPassword(password: string, hash: string){
        return compareSync(Buffer.from(password), hash);
    }

    transformSecureShowDataUser(data: User, options?: iPayloadOptionsTransformDataUserSecure): Error | iResponseTransformDataUserSecure{
        if(!data) return new Error("user data not found");

        let { account_active, created_at, email, id, name, username, last_seen, session } = data as any;

        let res = {
            id,
            name,
            email,
            username
        } as any;

        if(options && options.mask){
            res.email = this.hideMaskMail(email);
            res.username = this.hideMaskHalf(username);
        }else

        if(options && options.trust){
            res.last_seen = moment.unix(last_seen);
            res.session = session;
        }

        res.active = account_active;
        res.created_at = created_at;

        return res;
    }
    
    hide(data: any, options?: iOptionsHideData){
        if(options){
            if(options.id) data.id = undefined;
            if(options.email) data.email = undefined;
            if(options.last_seen) data.last_seen = undefined;
            if(options.password) data.password = undefined;
            if(options.session) data.session = undefined;
            if(options.name) data.name = undefined;
            if(options.create) data.updated_at = undefined;
            if(options.update) data.created_at = undefined;
            if(options.all_null){
                Object.keys(data).forEach((key) => {
                    if (data[key] === null) {
                      delete data[key];
                    }
                });
            }
        }

        return data;
    }

    transformSecureShowDataUserMany(){}
    
    private hideMaskMail(mail: string): string{
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