import { check, oneOf  } from 'express-validator';

export default oneOf([
    check('email').isEmail(),
    check('fullName').isLength({ min: 3 }),
    check('password').isLength({ min: 8 })
]);