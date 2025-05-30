import React from 'react';
import Layout from '../../components/layout/Layout';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import CollectionCards from '../../components/CollectionCards/CollectionCards';
import CategoryNavigation from '../../components/CategoryNavigation/CategoryNavigation';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import SpecialOffer from '../../components/SpecialOffer/SpecialOffer';

const customSlides = [];
const Home = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 w-full overflow-hidden">
        <section className="mb-12">
          <HeroBanner slides={customSlides} />
        </section>

        <section className="container mx-auto px-4 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Coleções em destaque</h2>
          </div>
          <CollectionCards />
        </section>

        <section className="container mx-auto px-4 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Navegue por categoria</h2>
          </div>
          <CategoryNavigation />
        </section>

        <FeaturedProducts limit={4} />

        <section className="container mx-auto px-4 mb-16 max-w-full">
          <div className="w-full">
            <SpecialOffer />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;