import User from "@/Models/userModels";
import connection from "@/db/config";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const SALT_ROUNDS = 10;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ msg: "Invalid fields" }, { status: 400 });
        }

        await connection();

        const isUserAlreadyPresent = await User.findOne({ email });
        if (isUserAlreadyPresent) {
            return NextResponse.json({ msg: "User is already present" }, { status: 409 });
        }

        const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({ email, password: hashPassword, name });
        await user.save();

        const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '1h' });
        const response = NextResponse.json({ msg: "ok", success: true }, { status: 201 });
        response.cookies.set("token", token, { httpOnly: true });

        return response;
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message, success: false }, { status: 500 });
    }
}
