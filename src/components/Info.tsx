import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/HotelDisplay.css';

const InfoIcon = ({ infoText }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className={'infoIconContainer'}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <FontAwesomeIcon icon={faInfoCircle} className={'icon'} />
      {showInfo && <div className='infoText' style={{ width: '440px', display: 'flex', flexDirection: 'column' }}>
          {infoText.split('\n').map(opt => <label style={{ whiteSpace: 'pre-wrap' }}>▮ {opt}</label>)}
        </div>}
    </div>
  );
};

export default InfoIcon;

// {infoText.includes('\n') && infoText.split('\n').map((opt, index) => <div style={{ whiteSpace: 'pre-wrap' }}>{opt}</div>)
//                                                 || (<div className={'infoText'}>{infoText}</div>)}