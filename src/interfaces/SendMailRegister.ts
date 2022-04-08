import config from '../config/mail';

type iPayloadSendMailRegister = {
    email: string;
    name: string;
}

export type iResponseSendMailRegister = {
    email: string;
    name: string;
    body: string;
}

export default function send({ email, name }: iPayloadSendMailRegister): iResponseSendMailRegister{
    let body: string[] = [];

    body.push("<center>");

    body.push("<h1>Bem vindo, <b>{name}</b></h1>");
    body.push("</br>");

    body.push("<p>para usar os serviços do aplicativo, precisa confirmar o email. use o codigo abaixo ou click no link:</p>");
    body.push('<h3 style="padding: 10px; background-color: #9f9f9f;">{code}</h3>');
    body.push("</br>");
    body.push('<p>click no link para confirmar seu email: <a href="'+ config.url + "{code_url}" +'" target="_blank">confirmar e-mail</a></p>');
    body.push('</br>');
    body.push('</br>');
    body.push('<small>'+ config.app_name +' frase final!</small>');

    body.push("</center>");

    return { 
        email,
        name,
        body: body.join('')
    }
}

