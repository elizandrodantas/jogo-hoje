import { Router } from "express";
import { AuthUserController } from "../controllers/AuthController";
import { CodeConfirmController } from "../controllers/CodeConfirmController";
import { RegisterController } from "../controllers/RegisterController";
import { UserController } from "../controllers/UserController";

import { ensuredAuthenticated } from "../middleware/ensuredAuthenticated";

const app = Router();

// LOGIN AND REGISTER USER
app.post('/register', new RegisterController().registerUser);
app.post('/auth', new AuthUserController().auth);
app.get('/auth/refresh-token', new AuthUserController().refresh);
app.get('/auth/u', new AuthUserController().already);

// OTP CONFIRM CODE
app.post('/auth/confirm', new CodeConfirmController().mail);
app.get('/auth/confirm/:mailUrl', new CodeConfirmController().mail);

// USER
app.get('/user-info',
    [ new ensuredAuthenticated().middler ],
    new UserController().UserInfo);

export { app as RouterIndex }