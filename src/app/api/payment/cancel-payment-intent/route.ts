import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

require('dotenv').config({ path: "/Users/ekanshgupta/testHotel/hotelEndpoints/src/app/api/backend/.env" });
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`, {
  typescript: true,
});

export async function POST(req: NextRequest) {
    const { paymentID } = await req.json();
    try {
      const cancelObject = await stripe.paymentIntents.cancel(paymentID);
      return NextResponse.json(cancelObject, { status: 200 });
    } catch (error: any) {
      console.error(error);
      return new NextResponse(error, {
        status: 400,
      });
    }
  }; 