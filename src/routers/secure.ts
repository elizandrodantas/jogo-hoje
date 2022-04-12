import { Router } from "express";
import { UserController } from "../controllers/UserController";

import { ensuredAuthenticated } from "../middleware/ensuredAuthenticated";

const app = Router();

app.get('/user-info',
    [ new ensuredAuthenticated().middler ],
    new UserController().UserInfo);


export { app as RouterSecure }