import {model, Schema, Document} from 'mongoose';

export interface IDialog extends Document{
    author: string;
    partner: string;
    lastMessage: string;
}

const DialogSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    partner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    }
}, {
    timestamps: true
});

const DialogModel = model<IDialog>('Dialog', DialogSchema);

export default  DialogModel;