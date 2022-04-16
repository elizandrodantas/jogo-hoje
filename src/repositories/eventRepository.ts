import { Event } from "@prisma/client";
import { Prisma } from "../database";

export type iPayloadCreateEvent = {
    title: string;
    description?: string;
    userId: string;
    event: {
        date: number;
        location: string;
        min_person?: number;
        max_person?: number;
    }
}

export class EventsRepository {
    private controller: Events = new Events();
    util: util = new util();

    lastData: Event | undefined;
    lastDataMany: Event[] | undefined;

    async create({ title, event, userId, description }: iPayloadCreateEvent){
        if(!title || !event || !userId) return new Error("parameteres invalid");

        let { date, location, max_person, min_person } = event;
        if(!date || !location) return new Error("data event required");

        let create = await this.controller.new({ title, event, userId, description });
        if(create instanceof Error) return new Error(create.message);

        return this.lastData = create, create;
    }

    async listEventsUser({ userId}: { userId: string }){
        if(!userId) return new Error("client id required");

        let list = await this.controller.listUser(userId);
        if(list instanceof Error) return new Error(list.message);

        return list;
    }
}

class Events {
    new({ title, event, userId, description }: iPayloadCreateEvent): Promise<Error | Event>{
        return new Promise(async resolve => {
            try{
                let create = await Prisma.event.create({
                    data: {
                        title,
                        event_user_created: userId,
                        description,
                        event_date: event.date,
                        event_location: event.location,
                        event_max_person: event.max_person,
                        event_min_person: event.min_person,
                    }
                });

                if(!create) return resolve(new Error("error create new event, try again"));

                return resolve(create);
            }catch(e){ resolve(new Error("error create new event, try again")) }
        });
    }

    listUser(userId: string): Promise<Error | Event[]>{
        return new Promise(async resolve => {
            try{
                let list = await Prisma.event.findMany({
                    where: { event_user_created: userId },
                    include: { persons: true }
                });

                return resolve(list);
            }catch(e){ resolve(new Error("error get events")) }
        });
    }
}

class util {
    justNumber(string: string){
        return parseInt(string.replace(/[^0-9]/g, ''));
    }
}