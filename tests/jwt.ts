import { JsonWebToken } from "../src/core/JsonWebToken";

let controller = new JsonWebToken();

controller.setToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OGVkYmU2MS1lYTA5LTQ2Y2QtOTYyNi1jNDA5N2IzZmE0OTAiLCJhdWQiOiJvSk1rbWFHWThYd1ZtT1NwR2lRa2g3MUhxNDI1eUVZUSIsImNsaWVudF9pZCI6IjBkYjE3M2E5LTgxNmEtNGRmYi05ZWU0LTk2MmQxODM1YjU3NyIsInVzZXJuYW1lIjoiYWRtaW4iLCJpc3MiOiJhcHA6Ly9qb2dvLWhvamUiLCJpYXQiOjE2NDk2MjYzOTEsImV4cCI6MTY0OTYyNjk5MX0.SjNQKQM9rg_iFVHrND7GMWMnI41U3P53a2bWvQdKBoA");

// controller.verifyJWT().then(e => console.log(e))