import dotenv from 'dotenv';
// import fs from 'fs';

dotenv.config({ path: __dirname + '/.env' });

interface Guests {
    age: null,
      first_name: string,
      first_name_original: string,
      is_child: boolean,
      last_name: string,
      last_name_original: string
}

interface GuestData {
  adults_number: number,
  children_number: number,
  guests: Guests[]
}

interface RoomData {
    bedding_name: Array<string>,
    guest_data: GuestData,
    meal_name: string,
    room_idx: number,
    room_name: string
}

interface Policies {
    end_at: null,
    penalty: { amount: string, amount_info: null, currency_code: string },
    start_at: null
}

interface TaxAmount {
    amount_tax: { amount: string, currency_code: string }, 
    is_included: boolean, 
    name: string 
}

interface Components {
    agreement_number: string,
    amount_payable: { amount: string, currency_code: string },
    amount_payable_vat: { amount: string, currency_code: string },
    amount_payable_with_upsells: { amount: string, currency_code: string },
    amount_refunded: { amount: string, currency_code: string },
    amount_sell: { amount: string, currency_code: string },
    amount_sell_b2b2c: { amount: string, currency_code: string },
    api_auth_key_id: null,
    cancellation_info: { free_cancellation_before: null, policies: Policies[] },
    cancelled_at: null,
    checkin_at: string,
    checkout_at: string,
    contract_slug: string,
    created_at: string,
    has_tickets: boolean,
    hotel_data: { id: string, order_id: null },
    invoice_id: string,
    is_cancellable: boolean,
    is_checked: boolean,
    meta_data: { voucher_order_comment: null },
    modified_at: string,
    nights: number,
    order_id: number,
    order_type: string,
    partner_data: { order_comment: null, order_id: string },
    payment_data: {
      invoice_id: number,
      invoice_id_v2: string,
      paid_at: null,
      payment_by: null,
      payment_due: string,
      payment_pending: string,
      payment_type: string
    },
    roomnights: number,
    rooms_data: RoomData[],
    source: string,
    status: string,
    supplier_data: { confirmation_id: null, name: null, order_id: string },
    taxes: TaxAmount[],
    total_vat: { amount: string, currency_code: string, included: boolean },
    upsells: [],
    user_data: { arrival_datetime: null, email: string, user_comment: null }
  }

interface Orders {
    orders: Array<Components> 
}

export async function POST(req: FormData): Promise<object> {
    try {
        const userName = req.get('name')?.toString().toLowerCase()
        const credentials = `${process.env['KEY_ID']}:${process.env['API_KEY']}`;
        const authHeader = 'Basic ' + Buffer.from(credentials).toString('base64');
        const headers = new Headers({
            'Authorization': `${authHeader}`, 
            'Content-Type': 'application/json'
            });
        const bodyData = {
            "ordering": {
                "ordering_type": "desc",
                "ordering_by": "created_at"
            },
            "pagination": {
                "page_size": "50",
                "page_number": "1"
            }, 
            "search": {
                "created_at": {
                  "from_date": "2023-12-31T00:00"
                }
            },
          "language":"en"
        };
        const formName = (order: Components): string => {
            const guestInfo = order.rooms_data[0].guest_data.guests[0];
            return `${guestInfo.first_name} ${guestInfo.last_name}`.toLowerCase();
        }
        let storeArray: Components[] = [];
        const retrieve = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/info/", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bodyData)
        });
        const newData = await retrieve.json();
        const records: Orders = await newData.data;
        for await (const order of records.orders) {
            const fullName = formName(order);
            if (fullName == userName) {
                storeArray.push(order);
            }
        }
        return {'result': storeArray};
    } catch (e) {
        console.error(e);
        return {}
    }
}

