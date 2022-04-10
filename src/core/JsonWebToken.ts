import 'dotenv/config';

import { User } from "@prisma/client";
import { Prisma } from '../database';
import { decode, sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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

        this.token = token;
        this.token_expire = this.createExpire('10', 'm');

        return this;
    }

    async createRefreshToken(){
        let refresh_token = uuidv4();

        if(this.session){
            let save = await Prisma.refresh.create({
                data: {
                    token: refresh_token,
                    expireIn: this.createExpire(this.rt_expire, 'd'),
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

    async updateSessionUser(): Promise<void>{
        if(this.session && this.client_id){
            await Prisma.user.update({
                where: { id: this.client_id },
                data: { session: this.session }
            });
        }
    }

    verifyJWT(): Error | iVerifyAndDecodeJwt{
        if(!this.token) return new Error("token not found");

        let token = "";

        if(this.token.split(' ').length > 1){
            let [token_type, token_split] = this.token.split(' ');

            if(token_type.toLocaleLowerCase() !== "bearer") return new Error("invalid token type");

            token = token_split;
        }

        token = token ? token : this.token;

        if(token.indexOf('eyJ') !== 0) return new Error("invalid token, try again");

        try{
            return verify(token, this.key) as iVerifyAndDecodeJwt;
        }catch(e: any){
            return new Error('unauthorized');
        }
    }

    decode(token: string): iVerifyAndDecodeJwt | null
    decode(token?: string): iVerifyAndDecodeJwt | null{
        let t = token && !this.token ? token : this.token ? this.token : !token && !this.token ? null : token; 
        if(!t) return null;

        if(t.indexOf('eyJ') !== 0 || t.split('.').length !== 3) return null;

        return decode(t) as iVerifyAndDecodeJwt;
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

    private createExpire(expire: string, short: "d" | "h" | "m" | "s" = "m"): number{
        let number = "1", n = expire.match(/\d/g);
		if(n) number = n.join("");

        return moment().add(number, short).unix();
    }
}