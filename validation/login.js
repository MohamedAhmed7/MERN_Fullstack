const Validator = require('validator');

const isEmpty = value =>
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0);


module.exports = function validateLoginInput(data){
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';


    if(Validator.isEmpty(data.email)){
        errors.email = 'Email Field is required';
    }

    if(!Validator.isEmail(data.email)){
        errors.email = 'Email is not valid';
    }

    if(Validator.isEmpty(data.password)){
        errors.password = 'Password Field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};

