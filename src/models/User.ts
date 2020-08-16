import {model, Schema, Document} from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import {generatePasswordHash} from '../utils';
import differenceInMinutes from 'date-fns/differenceInMinutes'

export interface IUser extends Document{
    email: string;
    avatar?: string;
    fullName: string;
    password: string;
    confirmed: boolean;
    confirmed_hash: string;
    last_seen: Date;
}



const UserSchema = new Schema({
    email: {
        type: String,
        required: 'Email address is required',
        validate: [isEmail, 'Invalid email'],
        unique: true ,
    },
    avatar: String,
    fullName: {
        type: String,
        required: 'Fullname  is required',
    },
    password: {
        type: String,
        required: 'password  is required',
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    confirmed_hash: String,
    last_seen: {
        type: Date,
        default: new Date()
    },
}, {
    timestamps: true
});

UserSchema.virtual('isOnline').get(function(this: any) {
    return differenceInMinutes( new Date(), this.last_seen) < 5
});

UserSchema.set("toJSON", {
    virtuals: true
});

UserSchema.pre<IUser>('save', function(next) {
    const user = this;


    if (!user.isModified('password')) return next();

    generatePasswordHash(user.password)
        .then(hash => {
            user.password = String(hash);
            generatePasswordHash(+new Date() + '').then((hash) => {
                user.confirmed_hash = String(hash);
                next();
            })
        })
        .catch(err => {
            next(err);
        });
});

const UsersModel = model<IUser>('User', UserSchema);
export default  UsersModel;