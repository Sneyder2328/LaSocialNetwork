import uuid from "uuid";
import bcrypt from "bcryptjs";

/**
 * gen hex(uuid) for user,post,comment,etc
 */
export const genUUID = (): string => uuid.v4();

export const hashPassword = async (saltRounds = 10, password): Promise<string> => {
    return await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err);
            resolve(hash)
        });
    });
};

export const verifyPassword = async (password, hashedPassword): Promise<boolean> => {
    return await new Promise(((resolve) => {
        bcrypt.compare(password, hashedPassword, (err, success) => {
            if (err || !success) resolve(false);
            resolve(true);
        });
    }));
};

export type HasDate = {
    createdAt: string;
};

export const compareByDateDesc = (one: HasDate, two: HasDate): number => new Date(one.createdAt).getTime() - new Date(two.createdAt).getTime();
export const compareByDateAsc = (one: HasDate, two: HasDate): number => new Date(two.createdAt).getTime() - new Date(one.createdAt).getTime();