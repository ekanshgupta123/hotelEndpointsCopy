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

(async function () {
    return
})