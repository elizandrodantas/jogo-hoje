import { User } from "@prisma/client";

import { decode, sign } from 'jsonwebtoken';

export class JsonWebToken {
    token: string = "";
    refresh: string = "";

    signIn(data: User){
        let { id } = data;
    }

    createRefreshToken(){}

    decode(token: string): any | null
    decode(token?: string): any | null{
        let t = token && !this.token ? token : this.token ? this.token : !token && !this.token ? null : token; 
        if(!t) return null;

        if(t.indexOf('eyJ') !== 0 || t.split('.').length !== 3) return null;

        return decode(t);
    }

    setToken(token: string){
        return this.token = token, this;
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
}