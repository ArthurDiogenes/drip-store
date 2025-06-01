import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { getHeroBannerProducts } from '../../services/productService';

import 'swiper/css';
import 'swiper/css/pagination';
import './HeroBanner.module.css';

const HeroBannerSlide = ({
    title,
    description,
    imageUrl,
    buttonText,
    buttonLink,
    discount
}) => (
    <div className="bg-gray-100 rounded-lg relative overflow-hidden">
        {discount > 0 && (
            <div className="absolute top-4 right-4 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                {discount}% OFF
            </div>
        )}

        <div className="md:hidden mobile-banner-container px-4 py-8">
            <div className="w-full flex justify-center mb-8">
                <img 
                    src={imageUrl} 
                    alt="Produto em destaque" 
                    className="hero-banner-image-mobile"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '../images/products/produc-image-0.png';
                    }}
                />
            </div>
            
            <div className="w-full z-10 text-center">
                <span className="text-pink-600 font-medium text-sm">
                    {discount > 0 ? `Oferta especial - ${discount}% OFF` : 'Melhores ofertas personalizadas'}
                </span>
                <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-4">{title}</h1>
                <p className="text-gray-600 mb-8 mx-auto max-w-md">{description}</p>
                <a
                    href={buttonLink}
                    className="bg-pink-600 text-white py-3 px-8 rounded-md font-medium inline-block hover:bg-pink-700 transition-colors"
                >
                    {buttonText}
                </a>
            </div>
            
            <div className="mobile-pattern-dots"></div>
        </div>
        
        <div className="hidden md:block">
            <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 z-10">
                    <span className="text-amber-500 font-medium text-sm">
                        {discount > 0 ? `Desconto especial - ${discount}% OFF` : 'Melhores ofertas personalizadas'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-4">{title}</h1>
                    <p className="text-gray-600 mb-8 max-w-md">{description}</p>
                    <a
                        href={buttonLink}
                        className="bg-pink-600 text-white py-3 px-8 rounded-md font-medium inline-block hover:bg-pink-700 transition-colors"
                    >
                        {buttonText}
                    </a>
                </div>

                <div className="md:w-1/2 flex justify-center">
                    <img 
                        src={imageUrl} 
                        alt="Produto em destaque" 
                        className="max-h-80 object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '../images/products/produc-image-0.png';
                        }}
                    />
                </div>

                <div className="absolute top-8 right-8 w-24 h-24 bg-yellow-100 rounded-full opacity-50"></div>
                <div className="absolute bottom-8 right-32 w-12 h-12 bg-yellow-100 rounded-full opacity-50"></div>
            </div>
        </div>
    </div>
);

const HeroBanner = ({ slides = [] }) => {
    const [bannerSlides, setBannerSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBannerData = async () => {
            try {
                setLoading(true);
                
                if (slides && slides.length > 0) {
                    setBannerSlides(slides);
                } else {
                    const dynamicSlides = await getHeroBannerProducts(8);
                    
                    if (dynamicSlides && dynamicSlides.length > 0) {
                        setBannerSlides(dynamicSlides);
                    } else {
                        setBannerSlides(getDefaultSlides());
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar slides do banner:', error);
                setBannerSlides(getDefaultSlides());
            } finally {
                setLoading(false);
            }
        };

        loadBannerData();
    }, [slides]);

    const getDefaultSlides = () => [
        {
            id: 1,
            title: "Queima de estoque Nike 🔥",
            description: "Consequat culpa exercitation mollit nisi excepteur do do tempor labore eiusmod irure consectetur.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Ver Ofertas",
            buttonLink: "/produtos?marca=nike",
            discount: 50
        },
        {
            id: 2,
            title: "Adidas Ultraboost 22 ⚡",
            description: "A tecnologia de amortecimento mais avançada da Adidas para máximo conforto e performance.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Descobrir",
            buttonLink: "/produto/tenis-adidas-ultraboost-22",
            discount: 30
        },
        {
            id: 3,
            title: "Puma Suede Classic 🎨",
            description: "O clássico reinventado com estilo moderno e cores vibrantes para todas as ocasiões.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Ver Coleção",
            buttonLink: "/produtos?marca=puma",
            discount: 25
        },
        {
            id: 4,
            title: "K-Swiss Performance 💪",
            description: "Tênis de alta performance para treinos intensos e atividades esportivas.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Treinar Agora",
            buttonLink: "/produtos?categoria=tenis&tipo=esporte",
            discount: 40
        },
        {
            id: 5,
            title: "Headphones Premium 🎵",
            description: "Som de alta qualidade com cancelamento de ruído para sua experiência musical perfeita.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Ouvir Mais",
            buttonLink: "/produtos?categoria=headphones",
            discount: 35
        },
        {
            id: 6,
            title: "Coleção Streetwear 👕",
            description: "Roupas urbanas com estilo único para você expressar sua personalidade.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Explorar",
            buttonLink: "/produtos?categoria=camisetas",
            discount: 20
        },
        {
            id: 7,
            title: "Calças Esportivas 🏃‍♂️",
            description: "Conforto e estilo para seus treinos e atividades do dia a dia.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Conferir",
            buttonLink: "/produtos?categoria=calcas",
            discount: 15
        },
        {
            id: 8,
            title: "Bonés e Acessórios 🧢",
            description: "Complete seu visual com nossos bonés e acessórios exclusivos.",
            imageUrl: '../images/home-slides/White-Sneakers-PNG-Clipart 1.png',
            buttonText: "Ver Tudo",
            buttonLink: "/produtos?categoria=bones",
            discount: 10
        }
    ];

    if (loading) {
        return (
            <div className="bg-gray-100 rounded-lg p-8 animate-pulse">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet custom-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active',
            }}
            autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            }}
            loop={bannerSlides.length > 1}
            speed={800}
            className="hero-banner-swiper"
            onSlideChange={(swiper) => {
                console.log('Banner slide changed to:', swiper.activeIndex);
            }}
        >
            {bannerSlides.map((slide) => (
                <SwiperSlide key={slide.id}>
                    <HeroBannerSlide
                        title={slide.title}
                        description={slide.description}
                        imageUrl={slide.imageUrl}
                        buttonText={slide.buttonText}
                        buttonLink={slide.buttonLink}
                        discount={slide.discount}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default HeroBanner;