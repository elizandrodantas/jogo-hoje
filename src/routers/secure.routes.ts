import { Router } from "express";
import { EventController } from "../controllers/EventController";

import { UserController } from "../controllers/UserController";
import { ensuredAuthenticated } from "../middleware/ensuredAuthenticated";

const app = Router();


app.get('/user-info',
    [ new ensuredAuthenticated().middler ],
    new UserController().UserInfo);

app.post('/event', 
    [ new ensuredAuthenticated().middler, new ensuredAuthenticated().session ],
    new EventController().create);
app.put('/event', 
    [ new ensuredAuthenticated().middler, new ensuredAuthenticated().session ],
    new EventController().edit);
app.delete('/event', 
    [ new ensuredAuthenticated().middler, new ensuredAuthenticated().session ],
    new EventController().delete);
app.get('/event', 
    [ new ensuredAuthenticated().middler ],
    new EventController().list);
app.get('/event/q',
    [ new ensuredAuthenticated().middler ],
    new EventController().query)
app.get('/event/:id', 
    [ new ensuredAuthenticated().middler, new ensuredAuthenticated().session ],
    new EventController().eventData);
app.post('/event/watch',
    [ new ensuredAuthenticated().middler, new ensuredAuthenticated().session ],
    new EventController().watchEvent);  


export { app as RouterSecure }