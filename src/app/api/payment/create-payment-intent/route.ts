import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

require('dotenv').config({ path: "/Users/ekanshgupta/testHotel/hotelEndpoints/src/app/api/backend/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(req: NextRequest) {
  const { amount } = await req.json();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual',
    });
    console.log(paymentIntent);
    return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentID: paymentIntent.id }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(error, {
      status: 400,
    });
  }
};