import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { NextArrow, PrevArrow } from './Arrows';

import React from 'react';
import Slider from 'react-slick';

const ImageSlider = ({ images }) => {

  const settings = {
    dots: true,
    infinite: true,
    speed: 1500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <img key={index} src={image.slice(0, 27) + ("240x240") + image.slice(33)} alt={`Slide ${index + 1}`} style={{ border: '3px solid white' }}/>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;