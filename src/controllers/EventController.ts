import { Request, Response } from "express";
import { iPayloadUpdateEventData } from "../repositories/eventRepository";
import { EventService } from "../services/EventService";

export class EventController {
    async create(request: Request, response: Response){
        let { title, description, event } = request.body,
        { client_id } = request.decoded as { client_id: string };

        let execute = await new EventService().new({ title, description, event, userId: client_id});
        if(execute instanceof Error) return response.status(400).json({ error: execute.message });

        return response.status(200).json(execute);
    }

    async edit(request: Request, response: Response){
        let { event, data } = request.body as { event: string; data: iPayloadUpdateEventData};

        let update = await new EventService().updateEvent(event, data);
        if(update instanceof Error) return new Error("");
    }
    
    async delete(request: Request, response: Response){}

    async list(request: Request, response: Response){
        let { client_id } = request.decoded as { client_id: string };

        let get = await new EventService().list(client_id);
        if(get instanceof Error) return response.status(400).json({ error: get.message });

        return response.status(200).json(get);
    }

    async query(request: Request, response: Response){
        let list = await new EventService().queryEvents(request.query as any);
        if(list instanceof Error) return response.status(400).json({ error: list.message });

        return response.status(200).json(list);
    }

    async eventData(request: Request, response: Response){
        let { id } = request.params;

        let get = await new EventService().details(id);
        if(get instanceof Error) return response.status(400).json({ error: get.message });

        return response.status(200).json(get);
    }

    async watchEvent(request: Request, response: Response){
        let { client_id } = request.decoded as { client_id: string },
        { event, watch_status } = request.body;

        let execute = await new EventService().personAtEvent(client_id, event, watch_status);
        if(execute instanceof Error) return response.status(400).json({ error: execute.message });

        return response.status(200).json(execute);
    }
}