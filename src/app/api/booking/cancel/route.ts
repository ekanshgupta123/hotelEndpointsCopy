import dotenv from 'dotenv';
dotenv.config({ path: "/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/Hotel-Booking-Checkin/src/app/api/reservation/.env" });

const credentials = `${process.env.KEY_ID}:${process.env.API_KEY}`;
const authHeader = 'Basic ' + Buffer.from(credentials).toString('base64');
const headers = new Headers({
    'Authorization': `${authHeader}`, 
    'Content-Type': 'application/json'
    });

export async function POST(req: Request): Promise<Response> {
    const data = await req.json()
    const pID = await data.pid
    const cancelResponse: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/cancel/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ "partner_order_id": pID })
    });
    const confirmation = await cancelResponse.json()
    const cancelStatus = await confirmation.status
    return new Response(JSON.stringify({ status: cancelStatus }))
}