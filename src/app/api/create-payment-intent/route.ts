import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

require('dotenv').config({ path: "/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/Hotel-Booking-Checkin/src/app/api/backend/.env" });
// require('dotenv').config({ path: "../backend/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(req: NextRequest) {
  const { amount } = await req.json();
  console.log(process.env.STRIPE_SECRET_KEY);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log(paymentIntent);
    return new NextResponse(paymentIntent.client_secret, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(error, {
      status: 400,
    });
  }
}


// {
//     id: 'pi_3PfULDLv44uqD0Xk1b8zggAE',
//     object: 'payment_intent',
//     amount: 10000,
//     amount_capturable: 0,
//     amount_details: { tip: {} },
//     amount_received: 0,
//     application: null,
//     application_fee_amount: null,
//     automatic_payment_methods: { allow_redirects: 'always', enabled: true },
//     canceled_at: null,
//     cancellation_reason: null,
//     capture_method: 'automatic_async',
//     client_secret: 'pi_3PfULDLv44uqD0Xk1b8zggAE_secret_mvwwDVDon2Jgi2oLZSt6VlfCl',
//     confirmation_method: 'automatic',
//     created: 1721685863,
//     currency: 'usd',
//     customer: null,
//     description: null,
//     invoice: null,
//     last_payment_error: null,
//     latest_charge: null,
//     livemode: false,
//     metadata: {},
//     next_action: null,
//     on_behalf_of: null,
//     payment_method: null,
//     payment_method_configuration_details: { id: 'pmc_1MZgxBLv44uqD0XkHNXyffxc', parent: null },
//     payment_method_options: {
//       affirm: {},
//       afterpay_clearpay: { reference: null },
//       card: {
//         installments: null,
//         mandate_options: null,
//         network: null,
//         request_three_d_secure: 'automatic'
//       },
//       cashapp: {},
//       klarna: { preferred_locale: null },
//       link: { persistent_token: null }
//     },
//     payment_method_types: [
//       'card',
//       'afterpay_clearpay',
//       'klarna',
//       'link',
//       'affirm',
//       'cashapp'
//     ],
//     processing: null,
//     receipt_email: null,
//     review: null,
//     setup_future_usage: null,
//     shipping: null,
//     source: null,
//     statement_descriptor: null,
//     statement_descriptor_suffix: null,
//     status: 'requires_payment_method',
//     transfer_data: null,
//     transfer_group: null
//   }


//   pi_3PfULDLv44uqD0Xk1b8zggAE_secret_mvwwDVDon2Jgi2oLZSt6VlfCl