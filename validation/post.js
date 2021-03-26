const Validator = require('validator');

const isEmpty = require('./isEmpty');


module.exports = function validatePostInput(data){
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';


    if(Validator.isEmpty(data.text)){
        errors.text = 'Text Field is required';
    }

    if(!Validator.isLength(data.text, { min: 1, max: 300})){
        errors.text = 'Post must be between 1 and 300 characters!';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};

