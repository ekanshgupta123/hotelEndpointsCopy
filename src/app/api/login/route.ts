import User from "@/Models/userModels";
import connection from "@/db/config";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json({ msg: "Invalid fields" }, { status: 400 });
    }

    try {
        await connection();

        const isUserPresent = await User.findOne({ email });
        if (!isUserPresent) {
            return NextResponse.json({ msg: "User is not available" }, { status: 409 });
        }

        const isPasswordMatch = await bcrypt.compare(password, isUserPresent.password);
        if (!isPasswordMatch) {
            return NextResponse.json({ msg: "Invalid Credentials" }, { status: 409 });
        }

        const name = isUserPresent.name;
        const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        const response = NextResponse.json({ msg: "User successful login", success: true }, { status: 200 });
        response.cookies.set("token", token, {
            httpOnly: true,
        });
        return response;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message, success: false }, { status: 500 });
    }
}