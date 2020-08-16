import { verifyJWT } from "../utils";
import express, {Request} from 'express';

// export type RequestType =  Request & { user: IUser}

export default (req: express.Request, res: any, next: any) => {
    if (req.path === "/user/login" || req.path === "/user/registration" || req.path === "/user/verify" ) {

        return next();
    }

    const token = String(req.headers.token);
    verifyJWT(token)
        .then((user: any) => {
            req.user = user.data._doc;
            next();
        })
        .catch(() => {
            res.status(403).json({ message: "Invalid auth token provided." });
        });
};