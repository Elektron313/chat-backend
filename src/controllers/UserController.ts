import express from 'express'
import { UsersModel } from '../models'
import {IUser} from '../models/User';
import { createJWT } from '../utils';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import {Namespace} from 'socket.io';

class UserController {

    io: Namespace;
    constructor(io: Namespace) {
        this.io = io;
    }

    show = (req: express.Request, res: express.Response) => {
        const id: string = req.params.id;
        UsersModel.findById(id, ((err, user) => {
            if (err) {
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            res.json(user)
        }))
    }
    getMe = (req: any, res: express.Response) => {
        const id: string = req.user._id;
        UsersModel.findById(id, (err, user) => {
            if (err) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            res.json(user);
        });
    };
    create = (req: express.Request, res: express.Response) => {
        const postData = {
            email: req.body.email,
            fullName: req.body.fullName,
            password: req.body.password,
        };

        const user = new UsersModel(postData);
        user.save()
            .then((response) => res.json({ status: 'success', message: '', response}))
            .catch((reason) => res.status(500).json({ status: 'error', message: reason, response: '' }) );
    }
    verify = (req: express.Request, res: express.Response) => {
        const hash = String(req.query.hash);
        if (!hash) {
            res.status(422).json({ message: 'invalid hash', status: 'error' })
        }
        UsersModel.findOne({ confirmed_hash: hash }, (err, user) => {
            if (err || !user) {
                return res.status(404).json({
                    message: "hash not found", status: 'error'
                });
            }

            user.confirmed = true;

            user.save().catch((err: any) => res.status(404).json({status: 'error', message: err }));
            res.json({ status: 'success', message: 'Аккаунт успешно подтвержден!'});
        });
    }
    findUsers = (req: express.Request, res: express.Response) => {
        const query: string = String(req.query.name);
        UsersModel.find().or([{ fullName: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }])
            .then(users => res.json(users))
            .catch( err => res.status(404).json({ message: err, status: 'error'}))
    }
    delete = (req: express.Request, res: express.Response) => {
        const id: string = req.params.id;
        UsersModel.findOneAndDelete({ _id: id }).then(user => {
            if (user) {
                res.json({
                    message: `User ${user.fullName} removed`
                })
            }
        }).catch(() => {
             res.status(404).json({message: 'Not found'})
        })
    }
    login = (req: express.Request, res: express.Response) => {
        const postData = {
            email: req.body.email,
            password: req.body.password
        };
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        UsersModel.findOne({ email: postData.email }, (err, user: IUser) => {
            if (err) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (bcrypt.compareSync(postData.password, user.password)) {
                const token = createJWT(user);
                res.json({
                    status: "success",
                    token,
                    message: 'welcome'
                });
            } else {
                res.json({
                    status: "error",
                    token: '',
                    message: "Incorrect password or email"
                });
            }
        });
    }
}

export default UserController;