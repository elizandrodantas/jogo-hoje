import { Router } from "express";
import { AuthUserController } from "../controllers/AuthController";
import { RegisterController } from "../controllers/RegisterController";

var app = Router();


// LOGIN AND REGISTER USER
app.post('/register', new RegisterController().registerUser);
app.post('/auth', new AuthUserController().auth);
app.get('/auth/u', new AuthUserController().already);

export { app as Router_i }