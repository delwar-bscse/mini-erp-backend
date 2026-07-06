import { model, Schema } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { IUser, TUserModal } from "./user.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";

const userSchema = new Schema<IUser, TUserModal>(
    {
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: false,
            select: 0,
            minlength: 4,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        authentication: {
            type: {
                isResetPassword: {
                    type: Boolean,
                    default: false,
                },
                oneTimeCode: {
                    type: Number,
                    default: null,
                },
                expireAt: {
                    type: Date,
                    default: null,
                },
            },
            select: 0
        }
    },
    {
        timestamps: true
    }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
    const isExist = await UserModel.findById(id);
    return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
    const isExist = await UserModel.findOne({ email });
    return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (password: string, hashPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {

    //check user
    if (this.email) {
        const isExist = await UserModel.findOne({ email: this.email, _id: { $ne: this._id } });
        if (isExist) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
    }

    //password hash
    if (this.password) {
        this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
    }
    next();
});

export const UserModel = model<IUser, TUserModal>("User", userSchema);