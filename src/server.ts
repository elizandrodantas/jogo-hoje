import express, { NextFunction, Request, Response } from 'express';
import { config } from 'dotenv';

import { RouterIndex } from './routers/index.routes';
import { RouterSecure } from './routers/secure.routes';

var app = express();
          config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', RouterIndex);
app.use('/api', RouterSecure)

app.use((error: any, request: Request, response: Response, next: NextFunction) => {
    if(error) return response.status(500).json({error: "error request, try again"});

    return response.status(404).json({ error: "page not found" });
});

app.listen(3000, () => console.log(`✅ SERVER STARTING SUCCESSFUL`))