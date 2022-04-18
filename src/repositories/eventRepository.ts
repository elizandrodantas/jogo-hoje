import { Event, EventPersons, Prisma as IPrisma, User } from "@prisma/client";
import moment, { max } from "moment";
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

export type iPayloadAdvanceDataBase = {
    include?: IPrisma.EventInclude;
    select?: IPrisma.EventSelect
}

export type iPayloadQueryAccept = {
    title: string;
    description: string;
    location: string;
    date: string;
}

export type iPayloadUpdateEventData = {
    description: string;
    date: string;
    location: string;
    max_person: number;
    min_person: number;
}

export interface iPayloadPersonWithUser extends Event {
    persons: EventPersons & {user: User}
}

export class EventsRepository {
    private controller: Events = new Events();
    util: util = new util();

    lastData: Event | undefined;
    lastDataMany: Event[] | undefined;

    async create({ title, event, userId, description }: iPayloadCreateEvent){
        if(!title || !event || !userId) return new Error("parameteres invalid");

        let { date, location } = event;
        if(!date || !location) return new Error("data event required");

        let create = await this.controller.new({ title, event, userId, description });
        if(create instanceof Error) return new Error(create.message);

        return this.lastData = create, create;
    }

    async createEventPerson(userId: string, eventId: string){
        if(!userId || !eventId) return new Error("client id and event id required");

        let create = await this.controller.newPersonInEvent(userId, eventId);
        if(create instanceof Error) return new Error(create.message);

        return create;
    }

    async removeEventPerson(userId: string, eventId: string){
        if(!userId || !eventId) return new Error("client id and event id required");

        let remove = await this.controller.removeEventPerson(userId, eventId);
        if(remove instanceof Error) return new Error(remove.message);

        return { status: true, userId, eventId }
    }

    async findById(id: string, includes?: IPrisma.EventInclude){
        if(!id) return new Error("event id required");

        let get = await this.controller.byId(id, includes);
        if(get instanceof Error) return new Error(get.message);

        return this.lastData = get, get;
    }

    async findQuery(where: iPayloadQueryAccept, options?: iPayloadAdvanceDataBase){
        if(!where) return new Error("query required");

        let newWhere = this.util.acceptQuery(where);

        let json = {} as any;

        if(newWhere.title) json.title = { contains: newWhere.title }
        if(newWhere.date){
            let newDate = moment(newWhere.date, 'YYYY-MM-DD hh:mm:ss');
            if(moment(newDate).isValid()) json.event_date = moment(newDate).unix();
        }
        if(newWhere.description) json.description = { contains: newWhere.description }
        if(newWhere.location) json.location = { contains: newWhere.location }
        json.event_status = true;

        let get = await this.controller.queryEvent(json, options);
        if(get instanceof Error) return new Error(get.message);

        return this.lastDataMany = get, get;
    }

    async listEventsUser({ userId, includes }: { userId: string; includes?: IPrisma.EventInclude }){
        if(!userId) return new Error("client id required");

        let list = await this.controller.listEventUser(userId, includes);

        return this.lastDataMany = list, list;
    }

    async update(eventId: string, data: iPayloadUpdateEventData, options?: iPayloadAdvanceDataBase){
        if(!eventId) return new Error("event id required");

        let json = {} as any;

        if(data.description) json.description = data.description;
        if(data.date) 
                json.event_date = moment(data.date).unix();
        if(data.location) json.event_location = data.location
        if(data.min_person && typeof data.min_person === "number") json.event_min_person = data.min_person
        if(data.max_person && typeof data.max_person === "number"){
            if(data.min_person && typeof data.min_person === "number"){
                if(data.max_person > data.min_person) json.event.max_person = data.max_person;
            }else{
                json.event_max_person = data.max_person;
            }
        }

        let update = await this.controller.updateEvent(eventId, json);
        if(update instanceof Error) return new Error(update.message);

        return this.lastData = update, update;
    }

    async desableEvent(eventId: string){
        if(!eventId) return new Error("event id required");

        let remove = await this.controller.depreded(eventId);
        if(remove instanceof Error) return new Error(remove.message);

        return remove;
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

    newPersonInEvent(userId: string, eventId: string): Promise<Error | EventPersons>{
        return new Promise(async resolve => {
            try{
                let create = await Prisma.eventPersons.create({
                    data: {
                        eventId,
                        userId
                    }
                });

                if(!create) return resolve(new Error("error add person in event"));

                return resolve(create);
            }catch(e){ return resolve(new Error("error add person in event")) }
        });
    }

    removeEventPerson(userId: string, eventId: string){
        return new Promise(async resolve => {
            try{
                let remove = await Prisma.eventPersons.deleteMany({
                    where: {
                        userId,
                        eventId
                    }
                });

                if(!remove) return resolve(new Error("error remove event person"));

                return resolve(remove);
            }catch(e){ return resolve(new Error("error remove event person")) }
        });
    }

    listEventUser(userId: string, includes?: IPrisma.EventInclude): Promise<Event[]>{
        return new Promise(async resolve => {
            let list = await Prisma.event.findMany({
                where: { event_user_created: userId, event_status: true },
                include: includes
            });
            return resolve(list);
        });
    }

    byId(id: string, includes?: IPrisma.EventInclude): Promise<Error | Event>{
        return new Promise(async resolve => {
            let get = await Prisma.event.findFirst({ where: { id }, include: includes });
            if(!get) return resolve(new Error("event not found"));

            return resolve(get);
        });
    }

    byName(name: string, includes?: IPrisma.EventInclude): Promise<Event[]>{
        return new Promise(async resolve => {
            try{
                let get = await Prisma.event.findMany({
                    where: {
                        title: { contains: name }
                    },
                    include: includes
                });
                return resolve(get);
            }catch(e){ return [] }
        });
    }

    queryEvent(where: iPayloadQueryAccept, options?: iPayloadAdvanceDataBase): Promise<Error | Event[]>{
        return new Promise(async resolve => {
            try{
                let list = await Prisma.event.findMany({
                    where: where,
                    ...options
                });

                return resolve(list);
            }catch(e){ return resolve(new Error("error query event data")) }
        });
    }

    updateEvent(id: string, data: iPayloadUpdateEventData, options?: iPayloadAdvanceDataBase): Promise<Error | Event>{
        return new Promise(async resolve => {
            try{
                let update = await Prisma.event.update({
                    where: { id },
                    data,
                    ...options
                });

                if(!update) return resolve(new Error("error update event"));

                return resolve(update);
            }catch(e){ return resolve(new Error("error update event")) }
        });
    }

    depreded(id: string): Promise<Error | Event>{
        return new Promise(async resolve => {
            try{
                let depreded = await Prisma.event.update({
                    where: { id },
                    data: { event_status: false }
                });

                if(!depreded) return resolve(new Error("error remove event"));

                return resolve(depreded);
            }catch(e){return resolve(new Error("error remove event"))}
        });
    }
}

class util {
    arrayAcceptQuery = ["title", "description", "location", "date"];
    arrayAcceptUpdate = ["description", "date", "location", "max_person", "min_person"];

    justNumber(string: string){
        return parseInt(string.replace(/[^0-9]/g, ''));
    }

    personInEvent(data: EventPersons[], userId: string){
        try{
            return data.find(e => e.userId === userId);
        }catch(e){ return undefined; }
    }

    acceptQuery(all: any): iPayloadQueryAccept{
        Object.keys(all).forEach(e => {
            if(!this.arrayAcceptQuery.includes(e)){
                delete all[e];
            }
        });

        return all;
    }

    acceptUpdate(all: any): iPayloadUpdateEventData{
        Object.keys(all).forEach(e => {
            if(!this.arrayAcceptUpdate.includes(e)){
                delete all[e];
            }
        })

        return all;
    }
}