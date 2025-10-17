import express from 'express';
import { login, logout, signUp } from '../controllers/Auth.Controller.js';

const AuthRoute = express.Router();

AuthRoute.post("/signUp", signUp);
AuthRoute.post("/login", login);
AuthRoute.post("/logout", logout);

export default AuthRoute;