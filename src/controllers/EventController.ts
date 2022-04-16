import { Request, Response } from "express";
import { EventService } from "../services/EventService";

export class EventController {
    async create(request: Request, response: Response){
        let { title, description, event } = request.body,
        { client_id } = request.decoded as { client_id: string };

        let execute = await new EventService().new({ title, description, event, userId: client_id});
        if(execute instanceof Error) return response.status(400).json({ error: execute.message });

        return response.status(200).json(execute);
    }

    async list(request: Request, response: Response){
        let { client_id } = request.decoded as { client_id: string };

        let get = await new EventService().list(client_id);
        if(get instanceof Error) return response.status(400).json({ error: get.message });

        return response.status(200).json(get);
    }
}