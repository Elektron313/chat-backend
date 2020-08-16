import { check, oneOf } from 'express-validator';

export default oneOf([check('email').isEmail(), check('password').isLength({ min: 8 })]);