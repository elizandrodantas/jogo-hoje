import { UserBasicRepository } from "../repositories/UserBasicRepository";
import interfaceBodySendMailRegister, { iResponseSendMailRegister } from '../interfaces/SendMailRegister';
import { OtpCore } from "../core/CoreOtp";

import { v4 as uuidv4 } from 'uuid';
import { SendMailCore } from "../middleware/SendMail";

import config from '../config/mail';

type iPayloadExecRegisterUser = {
    name: string,
    username: string,
    password: string,
    email: string
}

export class RegisterUser {
    async execute(params: iPayloadExecRegisterUser) {
        let validation = this.validateRegisterUser(params);
        if(validation instanceof Error) return new Error(`error at register new user: ${validation.message}`);

        let { email, username, name, password } = validation, id = uuidv4();

        let controller = new UserBasicRepository();

        // if(!(await controller.findByUsername(username) instanceof Error)) return new Error("username already register");
        // if(!(await controller.findByEmail(email) instanceof Error)) return new Error("email already register");

        let createBodySendMail = interfaceBodySendMailRegister({ email, name });

        let controllerOTP = new OtpCore('mail');

        controllerOTP.createOtp().createCodeUrl().setUserId(id);
        password = controller.util.createHashPassword(password);

        let register = await controller.create({ id, username, password, email, name});
        if(register instanceof Error) return new Error("error register user, try again");

        Promise.all([
            this.jobFinishCreateUser({
                email,
                name,
                username
            }, controllerOTP, createBodySendMail)
        ]);

        return controller.util.hide(register, { all_null: true, password: true });
    }

    private async jobFinishCreateUser( 
        { email, name, username }: { email: string, name: string, username: string, },
        otp: OtpCore,
        bodyMail: iResponseSendMailRegister ): Promise<void>{

        let controllerMail = new SendMailCore(), { body } = bodyMail;

        await otp.save();

        let idOtpSave = otp.getIdSave();

        if(!idOtpSave) return console.log(`[CRITICAL] ERROR SAVE OTP !!!!`);

        controllerMail.setParams({
            body,
            subject: config.register.subject,
            taskId: otp.getTaskId(),
            to: {
                name,
                email
            }
        }).setInfo({
            code: otp.getCode(),
            codeUrl: otp.getCodeUrl(),
            name,
            username
        });

        let send = await controllerMail.send();

        if(send instanceof Error) return console.log(`[CRITICAL] ERROR SENDO MAIL !!!!`);

        let idMessage = controllerMail.getIdMailTask();

        otp.updateStatus(idOtpSave, idMessage);
    }

    private validateRegisterUser({ email, password, username, name }: iPayloadExecRegisterUser): Error | iPayloadExecRegisterUser {
        let errors: string[] = [];
        
        if(!email) errors.push("email not defined");
        if(!password) errors.push("password not defined");
        if(!username) errors.push("username not defined");
        if(!name) errors.push("name not defined");

        if(errors.length > 0) return new Error(JSON.stringify(errors));
        
        if(username.length < 3) errors.push("username must contain 6 characters or more");
        if(password.length < 6) errors.push("password must contain 6 characters or more");
        if(/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/i.test(email) === false) errors.push("Invalid email, please correct and try again");

        if(errors.length > 0) return new Error(JSON.stringify(errors));

        return { email, password, username, name }
    }
}