// "http://localhost:5001/hotels/search"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse, all } from "axios";
import { useEffect, useState } from "react";

const body = {
    "checkin": "2024-07-22",
    "checkout": "2024-07-23",
    "residency": "us",
    "language": "en",
    "guests": [
        {
            "adults": 1,
            "children": []
        }
    ],
    "region_id": 2114,
    "currency": "USD"
};

const FetchInfiniteQuery = () => {

    const { data, 
        isLoading, 
        isFetching } = useInfiniteQuery({
            queryKey: ['searchResults'],
            queryFn: async ({ pageParam }) => {
                const response: AxiosResponse = await axios.post('http://localhost:5001/hotels/search', 
                body,
                { headers: {'Content-Type': 'application/json' }, 
                withCredentials: true });
                return response.data.data.hotels;
            },
            initialPageParam: 0,
            getNextPageParam: (lastPage) => 1
        });
    
        console.log(data);

    return  (
        <div>
            {/* <div>
                {data?.pages.map((page, pageIndex) => (
                    <div key={pageIndex}>
                        {page.data.map((order, orderIndex) => (
                            <div key={orderIndex}>{order.hotel_data.id}</div>
                        ))}
                    </div>
                ))}
            </div>
            {show && <MoreComponent info={data?.pages} />}
            {<button onClick={() => setShow(true)}>Show More...</button>} */}
            {data && data.pages[0].map(hotel => (
                <div>
                    {hotel.id}
                </div>
            ))}
        </div>
    );
};

export default FetchInfiniteQuery;
