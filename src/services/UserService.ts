
import { UserBasicRepository } from "../repositories/UserBasicRepository";

export class UserServices {
    async getInfo(userId: string){
        if(!userId) return new Error("account not found");
     
        let controllerRepository = new UserBasicRepository();

        let info = await controllerRepository.findById(userId);
        if(info instanceof Error) return new Error("account not found");

        return controllerRepository.util.transformSecureShowDataUser(info, { trust: true });
    }
}