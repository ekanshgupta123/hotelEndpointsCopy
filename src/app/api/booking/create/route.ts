import dotenv from 'dotenv';
import crypto from "crypto"
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

/*
const hashProvider = async (): Promise<string> => {
    try {
        const testBodyData: HotelPage = {
            "id": "test_hotel",
            "checkin": "2024-06-01",
            "checkout": "2024-06-02",
            "guests": [
                {
                    "adults": 1,
                    "children": []
                }
            ]
          };
        const retrieve: Response = await fetch("https://api.worldota.net/api/b2b/v3/search/hp/", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(testBodyData)
        });
        const newData = await retrieve.json();
        const finalHash = await newData.data.hotels[0].rates[0].book_hash;
        return finalHash ;
    } catch (e) {
        console.error(e);
        return ""
    }
}

const newFunc = async (): Promise<any> => {
    try {
        const hash = await hashProvider()
        const UUID = crypto.randomUUID();
        const finalBodyData = {
            "partner_order_id": UUID,
            "book_hash": hash,
            "language": "en",
            "user_ip": process.env.IP_ADDRESS
        }
        const finalResponse: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/booking/form/", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(finalBodyData)
        });
        const yuh = await finalResponse.json()
        return yuh.data
    } catch (e) {
        console.error(e)
    }
}

(async function (): Promise<object> {
    try {
        const needed = await newFunc()
        const partnerInfo = await needed.partner_order_id
        const paymentInfo = await needed.payment_types[0]
        const bodyData = {
            "language": "en",
            "partner": {
                "partner_order_id": partnerInfo
            },
            "payment_type": paymentInfo,
            "rooms": [
                {
                    "guests": [
                        {
                            "first_name": "Vimal",
                            "last_name": "Ratehawk"
                        }
                    ]
                }
            ],
            "user": {
                "email": "operations@chekins.com",
                "phone": "6503088202"
            }
        }
        const finalResponse: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bodyData)
        });
        const result = await finalResponse.json()
        const statusChecker = async function () {
                const status: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ "partner_order_id": partnerInfo })
            });
            const statuswait = await status.json();
            setTimeout(async () => {
                    if (statuswait.status != 'ok') {
                        statusChecker()
                    } else {
                        const cancellation: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/cancel/", {
                            method: "POST",
                            headers: headers,
                            body: JSON.stringify({ "partner_order_id": partnerInfo })
                        });
                        const cancelResponse = await cancellation.json()
                        console.log(cancelResponse)
                    }
                }, 1000)
        }
        return new Response(JSON.stringify({ result: result, pid: partnerInfo }))
    } catch (e) {
        console.error(e)
        return {}
    }
})()

*/

const bookingForm = async (hash: string): Promise<any> => {
    try {
        const UUID = crypto.randomUUID();
        const bodyData = {
            "partner_order_id": UUID,
            "book_hash": hash,
            "language": "en",
            "user_ip": process.env.IP_ADDRESS
        }
        const res: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/booking/form/", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bodyData)
        });
        const bookingRates = await res.json()
        return bookingRates.data
    } catch (e) {
        console.error(e)
    }
}

const bookingFinish = async function (hash: string): Promise<Response> {
    try {
        const givenRate = await bookingForm(hash)
        const partnerInfo = await givenRate.partner_order_id
        const paymentInfo = await givenRate.payment_types[0]
        const bodyData = {
            "language": "en",
            "partner": {
                "partner_order_id": partnerInfo
            },
            "payment_type": paymentInfo,
            "rooms": [
                {
                    "guests": [
                        {
                            "first_name": "Vimal",
                            "last_name": "Ratehawk" 
                        }
                    ]
                }
            ],
            "user": {
                "email": "operations@chekins.com",
                "phone": "6503088202"
            }
        }
        const res: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bodyData)
        });
        const result = await res.json()
        return new Response(JSON.stringify({ result: result, pid: partnerInfo }))
    } catch (e) {
        console.error(e)
        return new Response(JSON.stringify({ error: e }))
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const newBody = await req.json() 
        const { id, checkin, checkout, guests } = newBody 
        const testBodyData: HotelPage = {
            "id": id,
            "checkin": checkin,
            "checkout": checkout,
            "guests": guests
          };
        const retrieve: Response = await fetch("https://api.worldota.net/api/b2b/v3/search/hp/", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(testBodyData)
        });
        const newData = await retrieve.json();
        const foundHash = await newData.data.hotels[0].rates[0].book_hash;
        const deliver = await bookingFinish(foundHash)
        return deliver
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }))
    }
}

/*
const statusChecker = async function (): Promise<void> {
            const partnerBody = JSON.stringify({ "partner_order_id": partnerInfo })
            const statusResponse: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/", {
                method: "POST",
                headers: headers,
                body: partnerBody
            });
            const statusWait = await statusResponse.json();
            setTimeout(async () => {
                if (statusWait.status !== 'ok') {
                    console.log(statusWait.status)
                    await statusChecker();
                } else {
                    const cancelResponse: Response = await fetch("https://api.worldota.net/api/b2b/v3/hotel/order/cancel/", {
                        method: "POST",
                        headers: headers,
                        body: partnerBody
                    });
                    const confirmation = await cancelResponse.json()
                    console.log(confirmation)
                }
            }, 1000)
        }
        await statusChecker();

*/