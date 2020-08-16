import express from 'express'
import {DialogModel, MessageModel} from '../models'
import {Namespace} from 'socket.io';

class MessagesController {
    io: Namespace;
    constructor(io: Namespace) {
        this.io = io;
    }

    updateReadedStatus = (res: express.Response, userId: string, dialogId: string) => {
        MessageModel.updateMany(
            { dialog: dialogId, user: { $ne: userId } },
            { $set: { readed: true } },
            (err: any) => {
                if (err) {
                    return res.status(500).json({
                        status: 'error',
                        message: err,
                    });
                }
                this.io.emit('SERVER:MESSAGES_READED', {
                    userId,
                    dialogId,
                });
            },
        );
    };

    index = (req: express.Request, res: express.Response) => {
        const dialog_Id = String(req.query.dialog);
        const userId = req.user._id;

        this.updateReadedStatus(res, userId, dialog_Id)
        MessageModel.find({ dialog: dialog_Id})
            .populate(['author', 'user', 'attachments'])
            .exec(function(err, dialogs) {
                if (err) {
                    return res.status(404).json({
                        message: "Dialogs not found"
                    });
                }
                return res.json(dialogs);
            });
    }
    create = (req: express.Request, res: express.Response) => {
        const user = req.user?._id;
        const postData = {
            text: req.body.text,
            dialog: req.body.dialog_id,
            user,
            attachments: req.body.attachments,
        };
        const message = new MessageModel(postData);
        message
        .save()
        .then((obj: any) => {
            if (req.body.attachments) {

            }
            obj.populate(['dialog', 'user', 'attachments'],(err: any) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: err
                    });
                }

                DialogModel.findOneAndUpdate(
                    { _id: postData.dialog },
                    { lastMessage: message._id },
                    { upsert: true },
                    function(err :any) {
                        if (err) {
                            return res.status(500).json({
                                status: "error",
                                message: err
                            });
                        }
                    }
                );
                res.json(message);
                this.io.emit("SERVER:NEW_MESSAGE", message);
            })});
    };
    delete = (req: express.Request, res: express.Response) => {
        const id: string = String(req.query.id);
        const userId = req.user._id;
        MessageModel.findById( id , (err, message) => {
            if (err) {
                return res.status(404).json({
                    status: 'error',
                    message: 'message not found',
                });
            }
            if (message) {
                if (message.user.toString() === userId) {
                    const dialogId = message.dialog;
                    message?.remove();
                    MessageModel.findOne({ dialog: dialogId })
                        .sort({ createdAt : -1 })
                        .exec((err, lastMessage) => {
                            console.log(lastMessage)
                            if (err) {
                                res.status(500).json({
                                    status: "error",
                                    message: err
                                });
                            }
                            DialogModel.findById(dialogId, (err, dialog: any) => {
                                if (err) {
                                    res.status(500).json({
                                        status: "error",
                                        message: err
                                    });
                                }

                                dialog.lastMessage = lastMessage;
                                dialog.save();
                            });
                    });
                    return res.status(200).json({
                        status: 'success',
                        message: 'message removed'
                    })
                } else {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Not have permission'
                    })
                }
            }
        })
    }
}

export default MessagesController;