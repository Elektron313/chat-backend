import express from "express";
import { UsersModel } from "../models";

export default (
    req: express.Request,
    __: express.Response,
    next: express.NextFunction
) => {
    if (req.user) {
        UsersModel.findOneAndUpdate(
            { _id: req.user._id },
            {
                last_seen: new Date()
            },
            { new: true },
            () => {}
        );
    }
    next();
};