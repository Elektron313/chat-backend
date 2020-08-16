import {model, Schema, Document} from 'mongoose';

interface IUploadedFile extends Document{
    fileName: string;
    size: number;
    url: string;
    ext: string;
    message: string;
    userId: string;
}

const UploadFileSchema = new Schema({
    fileName: String,
    size: Number,
    url: String,
    ext: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
},
{
    timestamps: true,
    }
);

const UploadModel = model<IUploadedFile>('UploadedFile', UploadFileSchema);

export default UploadModel;