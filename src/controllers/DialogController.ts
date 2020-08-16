import express from 'express'
import {DialogModel, MessageModel} from '../models'
import {Namespace} from 'socket.io';


class DialogController {
    io: Namespace;
    constructor(io: Namespace) {
        this.io = io;
    }
    index = (req: express.Request, res: express.Response) => {
        const id = req.user?._id;
        DialogModel.find().or([{ author: id}, {partner: id}])
            .populate(['author', 'partner' ])
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'user'
                }
            })
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
        const postData = {
            author: req.user._id,
            partner: req.body.partner,
        };
        const dialog = new DialogModel(postData);
        dialog.save()
            .then((dialogObj) => {
                const message = new MessageModel({
                    text: req.body.text,
                    dialog: dialogObj._id,
                    user: req.user._id,
                });
                message.save()
                    .then(() => {
                        dialogObj.lastMessage = message._id;
                        dialogObj.save().then(() => {
                            res.json(dialogObj);
                            this.io.emit('SERVER:DIALOG_CREATED', { ...postData, dialog: dialogObj })
                        })

                    })
                    .catch((reason) => {
                        res.json(reason);
                    })
            })
            .catch((reason) => res.json(reason) );
    }
    delete = (req: express.Request, res: express.Response) => {
        const author_Id: string = req.params.id;
        DialogModel.findOneAndDelete({ _id: author_Id }).then((dialog) => {
            if (dialog) {
                res.json({
                    message: `Dialog  removed`
                })
            }
        }).catch(() => {
            res.status(404).json({message: 'Not found'})
        })
    }
}

export default DialogController;