import { hotp } from 'otplib';
import { random, util as utilNF } from 'node-forge';
import { createHash } from 'crypto';

import uid from 'uid2';
import moment from 'moment';
import { Prisma } from '../database';
import { Otp } from '@prisma/client';

interface iCoreOtp {
    
}

export class OtpCore implements iCoreOtp {
    private userId?: string;
    private code?: string;
    private codeUrl?: string;
    private secret?: string;
    private taskId: string = uid(32);
    private counter?: number;
    private key?: string;
    private expire?: number;

    private idSave: string = "";

    constructor( readonly type: string ){

    }

    setKey(key: string): this{
        return this.key = key, this;
    }

    setCode(code: string): this {
        return this.code = code, this;
    }

    setCodeUrl(code: string): this{
        return this.codeUrl = code, this;
    }

    setUserId(userId: string): this{
        return this.userId = userId, this;
    }

    createOtp(): this {
        this.secret = random.getBytesSync(16);
        this.secret = utilNF.encode64(this.secret);
        this.secret = createHash('sha256').update(this.secret).digest('hex');
        this.counter = Math.floor(Math.random() * 100);
        this.code = hotp.generate(this.secret, this.counter);
        this.secret = utilNF.encode64(`${this.secret}:${this.counter}`);

        return this;
    }

    createCodeUrl(){
        if(!this.code) return this;
        
        this.codeUrl = createHash('sha256').update(this.code).digest('base64');
        this.codeUrl = this.codeUrl.replace('/', '');

        return this;
    }

    verifyOtp(): this | Error {
        try{
            if(!this.key || !this.code) return new Error("code and key not defined");
            let [secret, counter] = utilNF.decode64(this.key).split(":");
            if(!secret || !counter) return new Error("invalid code, try again");

            this.secret = secret;
            this.key = secret;
            this.code = this.key;
            this.counter = +counter;

            let verify = hotp.verify({token: this.code, secret: this.secret, counter: +counter});
            if(!verify) return new Error("invalid code, try again")
            
            return this;
        }catch(_){return new Error("code verify invalid")}
    }

    getCode(){
        return this.code ? this.code : "";
    }

    getCodeUrl(){
        return this.codeUrl ? this.codeUrl : "";
    }

    getTaskId(){
        return this.taskId ? this.taskId : "";
    }

    getUserId(){
        return this.userId ? this.userId : "";
    }

    getIdSave(){
        return this.idSave;
    }

    async save(): Promise<Error | Otp>{
        if(!this.code || !this.secret || !this.userId || !this.codeUrl) return new Error("code or secret not generate");

        this.expire = this.createExpire(20, 'm');

        let { code, secret, codeUrl, type, expire, taskId, userId } = this;

        let save = await Prisma.otp.create({
            data: {
                code,
                codeUrl,
                expireIn: expire,
                secret,
                type,
                taskId,
                userId
            }
        }).catch(e => e);

        if(!save) return new Error("error create new otp");

        let { id } = save;

        this.idSave = id;

        return save;
    }


    async updateStatus(id: string, workId: string | number | object): Promise<void>
    async updateStatus(id: string, workId?: string | number | object): Promise<void>{
        if(id){
            workId = typeof workId === "number" ? String(workId) :
                    typeof workId === "object" ? JSON.stringify(workId) :
                    typeof workId !== "string" ? "" : workId

            await Prisma.otp.update({
                where: { id },
                data: {
                    workStatus: true,
                    workId
                }
            });
        }
    }

    private createExpire(time: number = 1, short: "d" | "h" | "m" | "s" = "m"): number{
        return moment().add(time, short).unix();
    }
}