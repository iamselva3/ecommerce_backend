import Joi from 'joi';

export const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('user', 'admin'),
        phone: Joi.string().pattern(/^[0-9]{10,15}$/),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            country: Joi.string(),
            zipCode: Joi.string()
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

export const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};


// export const validateOrderCreate = (req, res, next) => {
//     const schema = Joi.object({
//         items: Joi.array().items(
//             Joi.object({
//                 productId: Joi.string().required(),
//                 name: Joi.string().required(),
//                 price: Joi.number().positive().required(),
//                 quantity: Joi.number().integer().min(1).required(),
//                 size: Joi.string(),
//                 color: Joi.string(),
//                 image: Joi.string().required(),
//             })
//         ).min(1).required(),
//         shippingAddress: Joi.object({
//             fullName: Joi.string().min(3).max(50).required(),
//             phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
//             street: Joi.string().required(),
//             city: Joi.string().required(),
//             state: Joi.string().required(),
//             pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
//             country: Joi.string().default('India'),
//             landmark: Joi.string(),
//         }).required(),
//         paymentMethod: Joi.string().valid('cod', 'card', 'upi', 'netbanking').default('cod'),
//         discount: Joi.number().min(0),

//         notes: Joi.string(),
//         isDirectBuy: Joi.boolean().default(false),
//     });

//     const { error } = schema.validate(req.body);
//     if (error) {
//         return res.status(400).json({
//             success: false,
//             message: error.details[0].message,
//         });
//     }
//     next();
// };