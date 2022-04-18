let {
    APP_URL,
    APP_NAME
 } = process.env;

export default {
    app_name: APP_NAME,
    name: "Elizandro Api",
    email: "dantaspm@hotmail.com",
    register: {
        subject: "Bem Vindo, {name}"
    },
    update_event: {
        subject: "Seu evento foi atualizado!",
    },
    remove_event: {
        subject: "Seu evento removido!",
    },
    url: APP_URL + '/auth/confirm/'
}