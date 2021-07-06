const Joi = require('joi');
const registerValidation = data =>{
    const schema = Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),
        email: Joi.string().required()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string()
            .required()
            .min(6)
            .alphanum()
    });
    return schema.validate(data);

}
const loginValidation = data =>{
    const schema = Joi.object({
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        
    
    });
    return schema.validate(data);

}


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;