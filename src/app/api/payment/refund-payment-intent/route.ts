import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

require('dotenv').config({ path: "/Users/ekanshgupta/testHotel/hotelEndpoints/src/app/api/backend/.env" });
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`, {
  typescript: true,
});

export async function POST(req: NextRequest) {
    const { charge } = await req.json();
    try {
      const currObject = await stripe.refunds.create({
        charge: charge
      });
      return NextResponse.json(currObject, { status: 200 });
    } catch (error: any) {
      console.error(error);
      return new NextResponse(error, {
        status: 400,
      });
    }
  }; 