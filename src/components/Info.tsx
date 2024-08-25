import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCheck, faTimes, faUtensils, faBan } from '@fortawesome/free-solid-svg-icons';
import '../styles/HotelDisplay.css';

type information = {
  infoText: { type: string, date: any, refund: number}[] | string | null | undefined;
  flag?: string
}

const InfoIcon: React.FC<information> = ({ infoText, flag }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [deadArray, setDeadArray] = useState<any[]>([]);
  
  useEffect(() => {
    setDeadArray([]);
  }, []);

  const usedArray = ['Today', ...infoText!, 'Check-In'];
  const typeArray = [...infoText!, 'No Refund'];

  const allTypes = (typeof infoText != 'string' && typeof infoText != null) && usedArray.map((obj, index) => {
    if (index == 0 || index == usedArray.length - 1) return <label>{typeof obj == 'string' && obj}</label>
    return <label>{typeof obj != 'string' && obj.date.match(/(.*?)\sat\s/)[1]}</label>
  });
  const timelineDots = typeArray.map((_, index) => 
    <React.Fragment>
      <label>○</label>
      {index < typeArray.length && 
      <hr style={{ width: '100%', border: 'transparent', backgroundColor: 'black' }} />}
      {index == typeArray.length - 1 && <label>○</label>}
    </React.Fragment>
  );

  const marginCase = (idx, len) => {
    return idx == 0 
    ? (len < 3 ? '15%' : '7%')
    : (len < 3 ? '29%' : '11%')
  }

  return (
    <div
      className={'infoIconContainer'}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <FontAwesomeIcon icon={(flag == 'check' && faCheck) || (flag == 'cross' && faTimes) || faInfoCircle} className={'icon'} style={{ color: 'gray' }} />
      {showInfo && flag != 'cross' && <div className='infoText' style={{ width: flag == 'check' && '120px' || '440px' }}>
          {(typeof infoText != 'string' && typeof infoText != null) && infoText?.map((obj, index) => {
            const result = index == 0 
            ? <div>
                {flag != 'remove' && <div style={{ backgroundColor: 'beige', padding: '3%', marginBottom: '5%' }}>
                  {typeArray.map((val, index) => <label style={{ marginLeft: marginCase(index, typeArray.length) }}>{typeof val != 'string' && (val?.type == 'Full Refund' && 'Fully Refunded' || val?.type) || (typeof val == 'string' && val)}</label>)}
                  <div className='timeline-div'>
                    {timelineDots}
                  </div>
                  <div className='timeline-div'>
                    {allTypes}
                  </div>
                </div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '350px', marginBottom: '-18px'  }}> 
                      <label>Before: </label>
                      <label style={{ fontSize: '18px' }}>{obj.date.match(/(.*?)\sat\s/)[1]}</label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '18px', fontWeight: '600' }}>{obj.type}</label>
                      <label style={{ whiteSpace: 'normal'}}>Cancel your reservation before {obj.date}*, and you'll get a full refund of ${obj.refund}.</label>
                    </div>
                </div>
                {infoText.length > 1 && <div style={{ borderTop: '1px solid gray', marginTop: '10px', marginBottom: '-5%' }}></div>}
                <div style={{ marginTop: '5%'}}>
                  {infoText.length == 1 && <label>*Times are based on the property's local time.</label>}
                </div>
              </div>
            : <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '350px' }}>
                      <label>Between: </label>
                      <label style={{ fontSize: '18px'}}>{deadArray.slice(-1)[0].match(/(.*?)\sat\s/)[1]} - </label>
                      <label style={{ fontSize: '18px'}}>{obj.date.match(/(.*?)\sat\s/)[1]}</label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '18px', fontWeight: '600' }}>{obj.type}</label>
                      <label style={{ whiteSpace: 'normal'}}>Cancel your reservation before {obj.date}*, and you'll get a partial refund of ${obj.refund}.</label>
                    </div>
                </div>
                <div style={{ marginTop: '5%'}}>
                  {infoText.length == index + 1 && <label>*Times are based on the property's local time.</label>}
                </div>
              </div>
            deadArray.push(obj.date);
            return result;
          })}
        </div>}
    </div>
  );
};

export default InfoIcon;

// <label style={{ whiteSpace: 'pre-wrap' }}>{flag != 'check' && '▮ '}{opt}</label>