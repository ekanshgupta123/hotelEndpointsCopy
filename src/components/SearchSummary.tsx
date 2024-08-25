import React from 'react';

interface SearchSummaryProps {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    rooms: number;
    guests: {
        adults: number;
        children: {
            age: number;
        }[];
    }[];
    onEdit: () => void;
}


const SearchSummary: React.FC<SearchSummaryProps> = ({ destination, checkInDate, checkOutDate, rooms, guests, onEdit }) => {
    const totalAdults = guests.reduce((sum, guest) => sum + guest.adults, 0);
    const totalChildren = guests.reduce((sum, guest) => sum + guest.children.length, 0);
    const totalGuests = totalAdults + totalChildren;

    return (
        <div className="search-summary" onClick={onEdit} style={summaryContainerStyle}>
            <div style={summaryTextContainerStyle}>
                <div style={destinationStyle}>{destination}</div>
                <div style={dateStyle}>{`${checkInDate} — ${checkOutDate}`}</div>
                <div style={guestsStyle}>{`${rooms} room for ${totalGuests} guest${totalGuests > 1 ? 's' : ''}`}</div>
            </div>
            <div style={searchIconContainerStyle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 3C14.0844 3 17 5.91557 17 9.5C17 11.209 16.4031 12.7895 15.3984 14.0002L20.7071 19.309C21.0976 19.6996 21.0976 20.3327 20.7071 20.7232C20.3166 21.1138 19.6834 21.1138 19.2929 20.7232L13.9842 15.4145C12.7734 16.4192 11.1929 17.0161 9.48395 17.0161C5.89951 17.0161 3 14.1005 3 10.5161C3 6.93167 5.89951 3 9.48395 3C9.98316 3 10.4747 3.07395 10.9531 3.21753L10.5 3ZM5 10.5C5 13.2614 7.23957 15.5 10.001 15.5C12.7624 15.5 15.001 13.2614 15.001 10.5C15.001 7.73857 12.7624 5.5 10.001 5.5C7.23957 5.5 5 7.73857 5 10.5Z" fill="#0A66C2"/>
                </svg>
            </div>
        </div>
    );
};

// Styles (inline for simplicity)
const summaryContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '8px 16px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer'
};

const summaryTextContainerStyle = {
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
};

const destinationStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0A66C2',
};

const dateStyle = {
    fontSize: '14px',
    color: '#5f6368',
};

const guestsStyle = {
    fontSize: '14px',
    color: '#5f6368',
};

const searchIconContainerStyle = {
    marginLeft: '16px',
    display: 'flex',
    alignItems: 'center',
};

export default SearchSummary;
