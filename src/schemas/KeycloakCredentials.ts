import * as Joi from 'joi';

const KEYCLOAK_CREDENTIALS_SCHEMA = Joi.object({
    grantType: Joi.string().required(),

    clientId: Joi.string().required(),
    clientSecret: Joi.string(),

    username: Joi.string(),
    password: Joi.string(),

    baseUrl: Joi.string().uri({
        scheme: ['http', 'https'],
    }),
    realmName: Joi.string(),

    requestConfig: Joi.object({
        timeout: Joi.number().min(1),
        userAgent: Joi.string().min(1),
    }).options({
        abortEarly: true,
        allowUnknown: false,
    }),
}).options({
    abortEarly: true,
    allowUnknown: false,
});

export { KEYCLOAK_CREDENTIALS_SCHEMA };
