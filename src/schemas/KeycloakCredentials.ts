import * as Joi from 'joi';

const KEYCLOAK_CREDENTIALS_SCHEMA = Joi.object({
    grantType: Joi.string().required(),
    clientId: Joi.string().required(),

    username: Joi.string(),
    password: Joi.string(),
    clientSecret: Joi.string(),

    baseUrl: Joi.string().uri({
        scheme: ['http', 'https'],
    }),
    realmName: Joi.string(),

    requestConfig: Joi.object({
        timeout: Joi.number().min(1),
    }),
}).options({ abortEarly: true });

export { KEYCLOAK_CREDENTIALS_SCHEMA };
