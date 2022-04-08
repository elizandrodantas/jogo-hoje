import axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import { util as utilNF } from 'node-forge';

import config from '../config/mail'

type iPayloadParams = {
    body: string;
    subject: string;
    taskId: string;
    to: {
        email: string;
        name: string;
    }
}

type iPayloadInfo = {
    name: string;
    username: string;
    code: string;
    codeUrl: string;
}

let {
    MAILJET_KEY_ONE,
    MAILJET_KEY_TWO
} = process.env;

export class SendMailCore {
    private data?: any;

    private body: string = "";
    private subject: string = "";
    private taskId: string = "";
    private to: {Email: string, Name: string} = {Email: "", Name: ""};

    private name: string = "";
    private username: string = "";
    private code: string = "";
    private codeUrl: string = "";

    setParams({ body, subject, taskId, to }: iPayloadParams): this{
        this.body = body;
        this.subject = subject;
        this.taskId = taskId;
        this.to = {
            Name: to.name,
            Email: to.email
        }

        return this;
    }

    setInfo({ code, codeUrl, name, username }: iPayloadInfo): this{
        this.code = code;
        this.codeUrl = codeUrl;
        this.name = name;
        this.username = username;

        return this;
    }

    getParams(){
        return {
            body: this.body,
            subject: this.subject,
            taskId: this.taskId,
            to: this.to
        };
    }

    getInfo(){
        return {
            code: this.code,
            codeUrl: this.codeUrl,
            name: this.name,
            username: this.username
        }
    }
    
    getData(){
        return this.data;
    }

    getIdMailTask(){
        if(!this.data) return null;

        let { Messages } = this.data, { To } = Messages[0], { MessageID } = To[0];

        return MessageID
    }

    setFormat(body: string): string{
        try{
            let accept = [
                "{name}",
                "{code}",
                "{codeUrl}",
                "{code_url}"
            ];
    
            let info = this.getInfo();
    
            let replace = [
                info.name,
                info.code,
                info.codeUrl,
                info.codeUrl
            ];
    
            let res = body;
    
            accept.map((e, indice) => {
                if(e.match(new RegExp(e, 'gi'))){
                    res = res.replace(new RegExp(e, 'gi'), replace[indice]);
                }
            });
    
            return res
        }catch(e){
            return body;
        }
    }

    async send(){
        try{
            let start = moment().unix();

            let { to, body, subject } = this;

            let { data } = await axios("https://api.mailjet.com/v3.1/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: `Basic ${utilNF.encode64(`${MAILJET_KEY_ONE}:${MAILJET_KEY_TWO}`)}`
              },
              data: JSON.stringify({
                Messages: [
                  {
                    From: {
                      Email: config.email,
                      Name: config.name
                    },
                    To: [to],
                    Subject: this.setFormat(subject),
                    TextPart: this.setFormat(subject),
                    HTMLPart: this.setFormat(body)
                  }
                ]
              })
            });

            if(!data) throw new Error("response data not obtained");

            return this.data = data, {
                send: true,
                "time-service": moment().unix() - start,
                "time-service-type": "s"
            };
        }catch(e){
            return new Error("error send mail");
        }
    }
}