const Validator = require('validator');

const isEmpty = require('./isEmpty');


module.exports = function validateProfileInput(data){
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';

    if(!Validator.isLength(data.handle, { min: 2, max: 40 })){
        errors.hanlde = 'handle needs to be between 2 and 40 chars';
    }

    if(Validator.isEmpty(data.handle)){
        errors.hanlde = 'handle field is required';
    }

    if(Validator.isEmpty(data.status)){
        errors.status = 'status field is required';
    }

    if(Validator.isEmpty(data.skills)){
        errors.skills = 'skills field is required';
    }

    if(!isEmpty(data.website)){
        if(!Validator.isURL(data.website)){
            errors.website = 'not a valid url';
        }
    }

    if(!isEmpty(data.youtube)){
        if(!Validator.isURL(data.youtube)){
            errors.youtube = 'Not a valid url';
        }
    }
    if(!isEmpty(data.facebook)){
        if(!Validator.isURL(data.facebook)){
            errors.facebook = 'Not a valid url';
        }
    }
    if(!isEmpty(data.twitter)){
        if(!Validator.isURL(data.twitter)){
            errors.twitter = 'Not a valid url';
        }
    }
    if(!isEmpty(data.linkedin)){
        if(!Validator.isURL(data.linkedin)){
            errors.linkedin = 'Not a valid url';
        }
    }
    if(!isEmpty(data.instgram)){
        if(!Validator.isURL(data.instgram)){
            errors.instgram = 'Not a valid url';
        }
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};

