import React, { useState } from 'react';
import { Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import styles from './ProductGallery.module.css';

const ProductGallery = ({ images }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  
  const galleryImages = images?.length 
    ? images 
    : [{ id: 'placeholder', src: '/placeholder.jpg', alt: 'Product image placeholder' }];

  return (
    <div className={styles.productGallery}>
      <div className={styles.mainImageContainer}>
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation={{
            nextEl: `.${styles.swiperButtonNext}`,
            prevEl: `.${styles.swiperButtonPrev}`,
          }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          spaceBetween={10}
          slidesPerView={1}
          className={styles.mainSwiper}
        >
          {galleryImages.map((image) => (
            <SwiperSlide key={image.id}>
              <div className={styles.mainImageWrapper}>
                <img 
                  src={image.src} 
                  alt={image.alt || 'Product image'} 
                  className={styles.mainImage}
                />
              </div>
            </SwiperSlide>
          ))}
          
          <div className={styles.swiperButtonPrev}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </div>
          <div className={styles.swiperButtonNext}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Swiper>
      </div>
      
      <div className={styles.thumbnailContainer}>
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs]}
          spaceBetween={10}
          slidesPerView={5}
          watchSlidesProgress={true}
          className={styles.thumbnailSwiper}
        >
          {galleryImages.map((image) => (
            <SwiperSlide key={`thumb-${image.id}`}>
              <div className={styles.thumbnailWrapper}>
                <img 
                  src={image.src} 
                  alt={`Thumbnail for ${image.alt || 'product'}`} 
                  className={styles.thumbnailImage}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductGallery;