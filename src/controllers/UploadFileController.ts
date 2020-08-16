import express from 'express'
import {UploadFileModel} from '../models';
import cloudinary from '../core/cloudinary'

class UploadFileController {
    create = (req: express.Request, res: express.Response) => {
        const userId = req.user._id;
        const file = req.file;
        cloudinary.uploader.upload_stream({ resource_type: "auto"},  (error: any, result: any) => {
            if (error) {
                throw new Error(error);
            }
            console.log(result);
            const fileData = {
                fileName: result.original_filename,
                size: result.bytes,
                ext: result.format,
                url: result.url,
                userId
            };
            console.log(fileData);
            const uploadFile = new UploadFileModel(fileData);

            uploadFile
                .save()
                .then((fileObj: any) => {
                    console.log(fileObj)
                    res.json({
                        status: "success",
                        file: fileObj
                    });
                })
                .catch((err: any) => {
                    res.json({
                        status: "error",
                        message: err
                    });
                });
        })
            .end(file.buffer);
    };

    delete = (req: express.Request, res: express.Response) => {

    }
}

export default UploadFileController