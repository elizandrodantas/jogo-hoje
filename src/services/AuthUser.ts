import { JsonWebToken } from "../core/JsonWebToken";
import { Prisma } from "../database";
import { UserBasicRepository } from "../repository/UserBasicRepository";

import moment from "moment";
import { User } from "@prisma/client";

type iPayloadAuth = {
    username: string;
    password: string;
}

type iPayloadAlready = {
    key: string;
    type: "email" | "username"
}

export class AuthUser {
    async auth({ username, password}: iPayloadAuth){
        if(!username || !password) return new Error("username or password not found");

        if(username.length < 3) return new Error("username must contain 6 characters or more");
        if(password.length < 6) return new Error("password must contain 6 characters or more");

        let user = await Prisma.user.findFirst({
            where: { username }
        });
        if(!user) return new Error("username or password invalid");

        let { password: hash, account_active, name, id } = user;

        if(!new UserBasicRepository().util.compareHashPassword(password, hash)) return new Error("username or password invalid");
        if(!account_active) return new Error("account blocked");

        let JWT = new JsonWebToken();

        JWT.signIn(user);
        await JWT.createRefreshToken();

        JWT.setClientId(id);

        Promise.all([
            JWT.updateLastSeenUser(),
            JWT.updateSessionUser()
        ]);

        return {
            username,
            name,
            token: JWT.token,
            refresh_token: JWT.refresh,
            token_type: "bearer",
            expire: JWT.token_expire
        };
    }

    async refresh(token: string){
        if(!token) return new Error("unauthorized");

        let JWT = new JsonWebToken();

        JWT.setRefresh(token);

        let refreshData = await JWT.verifyRefreshToken();
        if(refreshData instanceof Error) return new Error(refreshData.message);

        let { expireIn, userId, id: refresh_id, status: refresh_status, session: refresh_session } = refreshData;

        if(!refresh_status) return new Error("refresh_token already used");
        if(moment().unix() > expireIn) return new Error("token expired");

        JWT.setClientId(userId);
        await JWT.setUserInfo();

        let userInfo = JWT.getUserInfo();
        if(!userInfo) return new Error("unauthorized");

        let { username, name, account_active, session } = userInfo;

        if(!account_active) return new Error("account blocked");
        if(session !== refresh_session){
            Promise.all([
                JWT.updateBreakRefreshToken(refresh_id)
            ]);
            return new Error("token unsigned in last session");
        };

        JWT.signIn(userInfo);
        await JWT.createRefreshToken();

        Promise.all([
            JWT.updateLastSeenUser(),
            JWT.updateSessionUser(),
            JWT.updateBreakRefreshToken(refresh_id)
        ]);

        return {
            username,
            name,
            token: JWT.token,
            refresh_token: JWT.refresh,
            token_type: "bearer",
            expire: JWT.token_expire
        };
    }

    async already({ key, type }: iPayloadAlready){
        if(!key || !type) return new Error("user not register");

        let controller = new UserBasicRepository();

        let find = type === "email" ? await controller.findByEmail(key) : type === "username" ? await controller.findByUsername(key) : null;

        if(!find) return new Error("user not register");

        return controller.util.transformSecureShowDataUser(controller.lastData as User, { mask: true })
    }
}