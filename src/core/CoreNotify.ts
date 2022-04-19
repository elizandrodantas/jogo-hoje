import { Event } from "@prisma/client";

import bodyIntUpdate from "../interfaces/updateEventNotify";
import bodyIntRemove from "../interfaces/removeEventNotify";
import config from '../config/mail';
import { SendMailCore } from "./SendMail";
import moment from "moment";

export class CoreNotify {
    async eventUpdate(event: Event, persons: any[]): Promise<void>{
        try{
            let controllerMail = new SendMailCore(),
            { title, event_date, event_location } = event,
            createBody = bodyIntUpdate({ 
                event_date: moment.unix(event_date).format('DD:MM:YYYY - hh:mm'),
                event_location,
                event_title: title
            });

            for(let indice of persons){
                let { id, user } = indice, { email, name, username } = user;
                if(id && email && username){
                    controllerMail.setParams({
                        body: createBody.body,
                        subject: config.update_event.subject,
                        to: {
                            email,
                            name
                        },
                        taskId: ""
                    }).setInfo({
                        name,
                        username,
                        code: "",
                        codeUrl: ""
                    });

                    await controllerMail.send();
                }
            }
        }catch(e){}
    }

    async eventRemove(event: Event, persons: any[]): Promise<void>{
        try{
            let controllerMail = new SendMailCore(),
            { title, event_date, event_location } = event,
            createBody = bodyIntRemove({ 
                event_date: moment.unix(event_date).format('DD:MM:YYYY - hh:mm'),
                event_location,
                event_title: title
            });

            for(let indice of persons){
                let { id, user } = indice, { email, name, username } = user;
                if(id && email && username){
                    controllerMail.setParams({
                        body: createBody.body,
                        subject: config.remove_event.subject,
                        to: {
                            email,
                            name
                        },
                        taskId: ""
                    }).setInfo({
                        name,
                        username,
                        code: "",
                        codeUrl: ""
                    });

                    await controllerMail.send();
                }
            }
        }catch(e){}
    }
}