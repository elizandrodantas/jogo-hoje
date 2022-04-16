import moment, { max } from "moment";

import { iPayloadCreateEvent, EventsRepository } from "../repositories/eventRepository";

export class EventService {
    async new({ title, event, userId, description}: iPayloadCreateEvent){
        if(!userId) return new Error("unable to create event");
        if(typeof event !== "object") return new Error("event data required");
        if(!title) return new Error("title event required");

        let { date, location, max_person, min_person } = event, controller = new EventsRepository();
        if(!location || location.length < 3) return new Error("location invalid");
        if(max_person && typeof max_person !== "number") max_person = controller.util.justNumber(max_person);
        if(min_person && typeof min_person !== "number") min_person = controller.util.justNumber(min_person);

        if(!moment(date).isValid()) return new Error("date format invalid");
        if(moment(date).unix() < moment().unix()) return new Error("this date is invalid");

        let create = await controller.create({ title, userId, description, event: {
            date: moment(date).unix(),
            location,
            max_person,
            min_person
        }});

        if(create instanceof Error) return new Error(create.message);

        return create;
    }

    async list(userId: string){
        if(!userId) return new Error("client id required");

        return new EventsRepository().listEventsUser({ userId });
    }
}