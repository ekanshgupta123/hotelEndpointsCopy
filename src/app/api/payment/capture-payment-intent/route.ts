import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

require('dotenv').config({ path: "/Users/ekanshgupta/testHotel/hotelEndpoints/src/app/api/backend/.env" });
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`, {
  typescript: true,
});

export async function POST(req: NextRequest) {
    const { paymentID } = await req.json();
    try {
      const captureObject = await stripe.paymentIntents.capture(paymentID);
      return NextResponse.json(captureObject, { status: 200 });
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(error, {
        status: 400,
      });
    }
  }; 