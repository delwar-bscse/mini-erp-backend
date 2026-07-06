import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';



interface IAuthenticationProps {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
}

export type IUser = {
    _id?: Types.ObjectId;
    name: string;
    role: USER_ROLES;
    email: string;
    password: string;
    isActive?: boolean;
    authentication?: IAuthenticationProps;
}

export type TUserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;