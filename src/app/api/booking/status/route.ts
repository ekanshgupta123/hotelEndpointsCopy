import dotenv from 'dotenv';
dotenv.config({ path: "/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/Hotel-Booking-Checkin/src/app/api/reservation/.env" });

interface HotelPage {
    "id": string, 
    "checkin": string, 
    "checkout": string, 
    "guests": [{
        "adults": number,
        "children": [] | [number]
    }],
    "language"?: string,
    "currency"?: string,
    "residency"?: string
}

const credentials = `${process.env.KEY_ID}:${process.env.API_KEY}`;
const authHeader = 'Basic ' + Buffer.from(credentials).toString('base64');
const headers = new Headers({
    'Authorization': `${authHeader}`, 
    'Content-Type': 'application/json'
    });

export async function POST(req: Request): Promise<Response> {
    const data = await req.json()
    const pID = await data.pid
    const statusResponse: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ "partner_order_id": pID })
    });
    const statusWait = await statusResponse.json();
    const statusCode: string = await statusWait.status
    return new Response(JSON.stringify({ result: statusCode }))
}