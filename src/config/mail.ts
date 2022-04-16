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
    url: APP_URL + '/auth/confirm/'
}