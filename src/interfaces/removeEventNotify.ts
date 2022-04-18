import config from '../config/mail';

type iPayloadInterfaceUpdateEvent = {
    event_title: string;
    event_location: string;
    event_date: string;
}

type iResponse = { 
    body: string;
}


export default function update({ event_title, event_location, event_date }: iPayloadInterfaceUpdateEvent): iResponse{
    let body: string[] = [];

    body.push("<center>");
    body.push("<h1>Seu evento "+ event_title +" foi removido!</h1>");
    body.push("</br>");
    body.push("<h4>Detalhes:</h4>");
    body.push("<p><b>Nome:</b> "+ event_title +"</p>");
    body.push("<p><b>Local:</b> "+ event_location +"</p>");
    body.push("<p><b>Data:</b> "+ event_date +"</p>");
    body.push("</br>");
    body.push("<small>PARA MAIS INFORMAÇÕES, ACESSE SEU PERFIL!</small>");
    body.push("</br>");
    body.push('<small>'+ config.app_name +' frase final!</small>');

    body.push("</center>");

    return { body: body.join('') }
}