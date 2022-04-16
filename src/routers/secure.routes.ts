import { Router } from "express";
import { EventController } from "../controllers/EventController";

import { UserController } from "../controllers/UserController";
import { ensuredAuthenticated } from "../middleware/ensuredAuthenticated";

const app = Router();


app.get('/user-info',
    [ new ensuredAuthenticated().middler ],
    new UserController().UserInfo);

app.post('/event/create', 
    [ new ensuredAuthenticated().middler, new ensuredAuthenticated().session ],
    new EventController().create);
app.get('/event/list', 
    [ new ensuredAuthenticated().middler, new ensuredAuthenticated().session ],
    new EventController().list);


export { app as RouterSecure }