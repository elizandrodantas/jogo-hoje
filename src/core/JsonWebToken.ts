import 'dotenv/config';

import { refresh, User } from "@prisma/client";
import { Prisma } from '../database';
import { decode, sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { UserBasicRepository } from '../repository/UserBasicRepository';

import uid from 'uid2';
import moment from 'moment';

type iVerifyAndDecodeJwt = {
    jti: string;
    aud: string;
    client_id: string;
    username: string;
    iss: string
    iat: number
    exp: number
}

var {
    JWT_SECRET_KEY,
    JWT_INFO_ISS,
    JWT_CONF_EXPIRE,
    JWT_CONF_RT_EXPIRE
} = process.env;

export class JsonWebToken {
    token: string = "";
    refresh: string = "";
    last_seen: number = 0;
    client_id: string = "";
    token_expire: number = 0;
    
    private userInfo?: User
    private session: string = uuidv4();
    private key: string = JWT_SECRET_KEY ? JWT_SECRET_KEY : "071df67b02f138e5f1550040392bd";
    private expire: string = JWT_CONF_EXPIRE ? JWT_CONF_EXPIRE : '10m';
    private rt_expire: string = JWT_CONF_RT_EXPIRE ? JWT_CONF_RT_EXPIRE : '1d';

    signIn(data: User){
        let { id, username } = data,
            jti = this.session,
                aud = uid(32),
                    iss = JWT_INFO_ISS ? JWT_INFO_ISS : "app://";

        let token = sign({
            jti,
            aud,
            client_id: id,
            username,
            iss
        }, this.key, {
            expiresIn: this.expire
        });

        this.client_id = id;
        this.token = token;
        this.token_expire = this.createExpire('10', 'm');

        return this;
    }

    async createRefreshToken(){
        let refresh_token = uuidv4();

        if(this.client_id && this.session){
            let save = await Prisma.refresh.create({
                data: {
                    token: refresh_token,
                    expireIn: this.createExpire(this.rt_expire, 'd'),
                    userId: this.client_id,
                    session: this.session
                }
            });
    
            if(save) this.refresh = refresh_token;
        }

        return this;
    }

    async updateLastSeenUser(): Promise<void>{
        if(this.client_id){
            await Prisma.user.update({
                where: { id: this.client_id },
                data: {
                    last_seen: moment().unix()
                }
            });

            this.last_seen = moment().unix();
        }
    }

    async updateBreakRefreshToken(id: string): Promise<void>{
        if(id){
            await Prisma.refresh.update({
                where: { id },
                data: { status: false, expireIn: 0 }
            });
        }
    }

    async updateSessionUser(): Promise<void>{
        if(this.session && this.client_id){
            await Prisma.user.update({
                where: { id: this.client_id },
                data: { session: this.session }
            });
        }
    }

    verifyJWT(token?: string): Error | iVerifyAndDecodeJwt
    verifyJWT(token: string): Error | iVerifyAndDecodeJwt{
        token = token ? token : this.token;

        if(!token) return new Error("token not found");

        if(token.split(' ').length > 1){
            let [token_type, token_split] = token.split(' ');

            if(token_type.toLocaleLowerCase() !== "bearer") return new Error("invalid token type");

            token = token_split;
        }

        if(token.indexOf('eyJ') !== 0) return new Error("invalid token, try again");

        try{
            return verify(token, this.key) as iVerifyAndDecodeJwt;
        }catch(e: any){
            return new Error('unauthorized');
        }
    }

    verifySessionUser(session?: string): Error | boolean
    verifySessionUser(session: string): Error | boolean {
        session = session ? session : this.session;

        if(!session) return new Error("session invalid");
        if(!this.userInfo) return new Error("user info needs to be handled in the previous function");

        let { session: currentSession } = this.userInfo;
    
        if(session !== currentSession) return new Error("session invalid, try signing again");

        return true;
    }

    verifyAccountStatus(): Error | boolean{
        if(!this.userInfo) return new Error("user info needs to be handled in the previous function");

        let { account_active } = this.userInfo;

        if(!account_active) return new Error("account disabled or blocked");

        return true;
    }

    async verifyRefreshToken(token?: string): Promise<Error | refresh>
    async verifyRefreshToken(token: string): Promise<Error | refresh>{
        token = token ? token : this.refresh;

        if(!token) return new Error("token not found");

        if(token.split(' ').length > 1){
            let [token_type, token_split] = token.split(' ');

            if(token_type.toLocaleLowerCase() !== "bearer") return new Error("invalid token type");

            token = token_split;
        }

        if(!validateUUID(token)) return new Error("token format invalid");

        let confirm = await Prisma.refresh.findFirst({
            where: { token }
        });

        if(!confirm) return new Error("unauthorized");
        
        return confirm;
    }

    decode(token: string): iVerifyAndDecodeJwt | null
    decode(token?: string): iVerifyAndDecodeJwt | null{
        let t = token && !this.token ? token : this.token ? this.token : !token && !this.token ? null : token; 
        if(!t) return null;

        if(t.indexOf('eyJ') !== 0 || t.split('.').length !== 3) return null;

        return decode(t) as iVerifyAndDecodeJwt;
    }

    async setUserInfo(): Promise<void>{
        if(this.client_id){
            let user = await new UserBasicRepository().getUserById(this.client_id);
            if(typeof user === "object"){
                this.userInfo = user as any;
            }
        }
    }

    setToken(token: string){
        return this.token = token, this;
    }

    setClientId(id: string): this {
        return this.client_id = id, this;
    }

    setRefresh(token: string){
        return this.refresh = token, this;
    }

    getToken(){
        return this.token
    }

    getRefresh(){
        return this.refresh;
    }

    getSession(){
        return this.session;
    }

    getUserInfo(){
        return this.userInfo;
    }

    private createExpire(expire: string, short: "d" | "h" | "m" | "s" = "m"): number{
        let number = "1", n = expire.match(/\d/g);
		if(n) number = n.join("");

        return moment().add(number, short).unix();
    }
}