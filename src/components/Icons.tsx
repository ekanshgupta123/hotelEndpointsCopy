import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, 
    faUtensils, 
    faUndo, 
    faMagicWandSparkles, 
    faWifi, 
    faParking, 
    faSmokingBan,
    faBath } from '@fortawesome/free-solid-svg-icons';

export const MealIcon = <FontAwesomeIcon icon={faUtensils} className={'icon'} style={{ fontSize: '14px'}}/> 

export const RefundIcon = <FontAwesomeIcon icon={faUndo} className={'icon'} style={{ fontSize: '14px'}}/> 

export const SparkleIcon = <FontAwesomeIcon icon={faMagicWandSparkles} className={'icon'} style={{ fontSize: '14px'}}/> 

export const WifiIcon = <FontAwesomeIcon icon={faWifi} className={'icon'} style={{ fontSize: '14px'}}/> 

export const ParkingIcon = <FontAwesomeIcon icon={faParking} className={'icon'} style={{ fontSize: '14px'}}/>

export const SmokingIcon = <FontAwesomeIcon icon={faSmokingBan} className={'icon'} style={{ fontSize: '14px'}}/>

export const BathIcon = <FontAwesomeIcon icon={faBath} className={'icon'} style={{ fontSize: '14px'}}/>

const BedIcon = <FontAwesomeIcon icon={faBed} className={'icon'} style={{ fontSize: '14px'}} />

export default BedIcon;