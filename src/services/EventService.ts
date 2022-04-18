import { Event, EventPersons } from "@prisma/client";
import moment from "moment";

import { iPayloadCreateEvent, EventsRepository, iPayloadQueryAccept, iPayloadUpdateEventData } from "../repositories/eventRepository";

export class EventService {
    async new({ title, event, userId, description}: iPayloadCreateEvent){
        if(!userId) return new Error("unable to create event");
        if(typeof event !== "object") return new Error("event data required");
        if(!title) return new Error("title event required");

        let { date, location, max_person, min_person } = event, controller = new EventsRepository();
        if(!location || location.length < 3) return new Error("location invalid");
        if(max_person && typeof max_person !== "number") max_person = controller.util.justNumber(max_person);
        if(min_person && typeof min_person !== "number") min_person = controller.util.justNumber(min_person);

        if(min_person && min_person < 1) return new Error("min person invalid");
        if(max_person && min_person && min_person > max_person) return new Error("minimum number of people must be less than the maximum number of people"); 

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

        let list = await new EventsRepository().listEventsUser({ userId }) as Event[];
        
        return {
            status: true,
            count: list.length,
            data: list
        }
    }

    async queryEvents(options: iPayloadQueryAccept){
        if(!options) return new Error("query required");

        let controller = new EventsRepository();

        let list = await controller.findQuery(options, { include: {
            userEvent: {
                select: { 
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    account_active: true
                }
            }
        }}) as Event[];

        return {
            status: true,
            count: list.length,
            data: list
        }
    }

    async details(eventId: string){
        if(!eventId) return new Error("event id required");

        let controller = new EventsRepository();

        let get = await controller.findById(eventId, { persons: {
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        account_active: true
                    }}
                }}
            });
        if(get instanceof Error) return new Error(get.message);

        return get;
    }

    async personAtEvent(userId: string, eventId: string, watch: "GOING" | "UNWATCHED" | string){
        if(!userId || !eventId) return new Error(`${!userId ? "client id" : "event id"} required`);

        let controllerEvent = new EventsRepository();

        watch = watch ? watch.toLocaleLowerCase() : 'null';

        let findEvent = await controllerEvent.findById(eventId, { persons: true }) as Event & { persons: EventPersons[]};
        if(findEvent instanceof Error) return new Error(findEvent.message);
        
        let { event_date, event_max_person, event_status, persons } = findEvent;
        if(!event_status) return new Error("canceled event");
        if(event_max_person && persons.length >= event_max_person) return new Error("maximum number of people at the event");
        if(moment().unix() > moment.unix(event_date).unix() ) return new Error("event has already started");
        
        if(watch === "going"){
            if(controllerEvent.util.personInEvent(persons, userId)) return new Error("user is already at the event");
            let agreged = await controllerEvent.createEventPerson(userId, eventId);
            if(agreged instanceof Error) return new Error(agreged.message);

            return { status: true, eventId, userId, action: watch, goinged: moment().toISOString() }
        }

        if(watch === "unwatched"){
            if(!controllerEvent.util.personInEvent(persons, userId)) return new Error("user is not connected to the event");
            let disaggregated = await controllerEvent.removeEventPerson(userId, eventId);
            if(disaggregated instanceof Error) return new Error(disaggregated.message);

            return { status: true, eventId, userId, action: watch, unwatched: moment().toISOString() }
        }

        return { status: false, eventId, userId, error: "action not performed" }
    }

    async updateEvent(eventId: string, data: iPayloadUpdateEventData){
        if(!eventId) return new Error("event id required");

        return eventId
    }
}