import { Router } from "express";
import { AuthUserController } from "../controllers/AuthController";
import { CodeConfirmController } from "../controllers/CodeConfirmController";
import { RegisterController } from "../controllers/RegisterController";

const app = Router();

// LOGIN AND REGISTER USER
app.post('/register', new RegisterController().registerUser);
app.post('/auth', new AuthUserController().auth);
app.get('/auth/refresh-token', new AuthUserController().refresh);
app.get('/auth/u', new AuthUserController().already);


// OTP CONFIRM CODE
app.post('/auth/confirm', new CodeConfirmController().mail);
app.get('/auth/confirm/:url_code', new CodeConfirmController().mail);

export { app as RouterIndex }