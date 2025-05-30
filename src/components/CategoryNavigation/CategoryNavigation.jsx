// src/components/CategoryNavigation/CategoryNavigation.jsx
import React, { useState } from 'react';
import './CategoryNavigation.css';

const CategoryIcon = ({ name, normalIcon, hoverIcon, link = "#" }) => {
  // Estado para controlar o hover
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link}
      className="category-item flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`category-circle w-20 h-20 rounded-full bg-white border border-gray-100 ${
          isHovered ? 'shadow-md' : ''
        } flex items-center justify-center mb-3 transition-all`}
      >
        {/* Mostra o ícone normal ou o ícone hover com base no estado */}
        <img
          src={isHovered ? hoverIcon : normalIcon}
          alt={name}
          className="w-10 h-10"
        />
      </div>
      <span
        className={`text-base font-medium ${
          isHovered ? 'text-pink-600' : 'text-gray-600'
        } transition-colors duration-200`}
      >
        {name}
      </span>
    </a>
  );
};

const CategoryNavigation = ({ categories = [] }) => {
  // Categorias padrão caso não sejam fornecidas
  const defaultCategories = [
    {
      id: 1,
      name: "Camisetas",
      normalIcon: "/icons/icon-category-tshirt.svg",
      hoverIcon: "/icons/icon-category-tshirt.mim.svg", // SVG já colorido em rosa
      link: "/categorias/camisetas"
    },
    {
      id: 2,
      name: "Calças",
      normalIcon: "/icons/icon-category-pants.svg",
      hoverIcon: "/icons/icon-category-pants.min.svg", // SVG já colorido em rosa
      link: "/categorias/calcas"
    },
    {
      id: 3,
      name: "Bonés",
      normalIcon: "/icons/icon-category-cap.svg",
      hoverIcon: "/icons/icon-category-cap.min.svg", // SVG já colorido em rosa
      link: "/categorias/bones"
    },
    {
      id: 4,
      name: "Headphones",
      normalIcon: "/icons/icon-category-headphones.svg",
      hoverIcon: "/icons/icon-category-headphones.min.svg", // SVG já colorido em rosa
      link: "/categorias/headphones"
    },
    {
      id: 5,
      name: "Tênis",
      normalIcon: "/icons/icon-category-sneakers.svg",
      hoverIcon: "/icons/icon-category-sneakers.min.svg", // SVG já colorido em rosa
      link: "/categorias/tenis"
    }
  ];

  // Usa as categorias fornecidas ou as padrão
  const categoriesToRender = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="flex justify-center gap-20 flex-wrap py-10">
      {categoriesToRender.map(category => (
        <CategoryIcon
          key={category.id}
          name={category.name}
          normalIcon={category.normalIcon}
          hoverIcon={category.hoverIcon}
          link={category.link}
        />
      ))}
    </div>
  );
};

export default CategoryNavigation;