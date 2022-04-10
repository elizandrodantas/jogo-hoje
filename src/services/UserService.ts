
import { UserBasicRepository } from "../repository/UserBasicRepository";

export class UserServices {
    async getInfo(userId: string){
        if(!userId) return new Error("account not found");
     
        let controllerRepository = new UserBasicRepository();

        let info = await controllerRepository.getUserById(userId);
        if(info instanceof Error) return new Error("account not found");

        return controllerRepository.transformSecureShowDataUser({ trust: true });
    }
}