const Validator = require('validator');

const isEmpty = value =>
   
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0);


module.exports = function validateRegisterInput(data){
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';


    if(!Validator.isLength(data.name, { min: 2, max: 30 })){
        errors.name = "Name must be between 2 and 30 chars!";
    }
    
    if(Validator.isEmpty(data.name)){
        errors.name = 'Name Field is required';
    }

    if(Validator.isEmpty(data.email)){
        errors.email = 'Email Field is required';
    }

    if(!Validator.isEmail(data.email)){
        errors.email = 'Email is not valid';
    }

    if(Validator.isEmpty(data.password)){
        errors.password = 'password Field is required';
    }

    if(Validator.isEmpty(data.password2)){
        errors.password2 = 'Confirm password Field is required';
    }

    if(!Validator.isLength(data.password, { min: 6, max: 30 })){
        errors.password = "password must be between 6 and 30 chars!";
    }

    if(!Validator.equals(data.password, data.password2)){
        errors.password2 = 'passwords must match';
    }




    return {
        errors,
        isValid: isEmpty(errors)
    }
};

