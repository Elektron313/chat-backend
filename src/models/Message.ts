import {model, Schema, Document} from 'mongoose';

export interface IMessage extends Document{
    text: string;
    readed: boolean;
    user: string;
    dialog: string;
}


const MessageSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    dialog: {
        type: Schema.Types.ObjectId,
        ref: 'Dialog'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    readed: {
        type: Boolean,
        default: false,
    },
    attachments: [{ type: Schema.Types.ObjectId, ref: 'UploadedFile' }]
},{
    timestamps: true,
    usePushEach: true,
});

const MessageModule = model<IMessage>('Message', MessageSchema);

export default  MessageModule;