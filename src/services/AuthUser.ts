import { Prisma } from "../database";
import { UserBasicRepository } from "../repository/UserBasicRepository";

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

        let { password: hash, active } = user;

        if(!new UserBasicRepository().compareHashPassword(password, hash)) return new Error("username or password invalid");
        if(!active) return new Error("user blocked");

        return user

    }

    async already({ key, type }: iPayloadAlready){
        if(!key || !type) return new Error("user not register");

        let controller = new UserBasicRepository();

        let find = type === "email" ? await controller.getUserByEmail(key) : type === "username" ? await controller.getUserByUsername(key) : null;

        if(!find) return new Error("user not register");

        return controller.transformSecureShowDataUser({ mask: true })
    }
}