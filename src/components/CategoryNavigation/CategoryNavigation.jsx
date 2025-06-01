import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./CategoryNavigation.module.css";

const CategoryIcon = ({ name, normalIcon, hoverIcon, link = "#" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={link}
      className={`${styles.categoryItem} flex flex-col items-center`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`${styles.categoryCircle} w-20 h-20 rounded-full bg-white border border-gray-100 ${
          isHovered ? "shadow-md" : ""
        } flex items-center justify-center mb-3 transition-all`}
      >
        <img
          src={isHovered && hoverIcon ? hoverIcon : normalIcon}
          alt={name}
          className="w-10 h-10"
        />
      </div>
      <span
        className={`text-base font-medium ${
          isHovered ? "text-pink-600" : "text-gray-600"
        } transition-colors duration-200`}
      >
        {name}
      </span>
    </Link>
  );
};

const CategoryNavigation = ({ categories = [] }) => {
  const defaultCategories = [
    {
      id: 1,
      name: "Camisetas",
      normalIcon: "/icons/icon-category-tshirt.svg",
      hoverIcon: "/icons/icon-category-tshirt.mim.svg", // Caminho confirmado pelo usuário
      link: "/produtos?categoria=camisetas",
    },
    {
      id: 2,
      name: "Calças",
      normalIcon: "/icons/icon-category-pants.svg",
      hoverIcon: "/icons/icon-category-pants.min.svg", 
      link: "/produtos?categoria=calcas",
    },
    {
      id: 3,
      name: "Bonés",
      normalIcon: "/icons/icon-category-cap.svg",
      hoverIcon: "/icons/icon-category-cap.min.svg", 
      link: "/produtos?categoria=bones",
    },
    {
      id: 4,
      name: "Headphones",
      normalIcon: "/icons/icon-category-headphones.svg",
      hoverIcon: "/icons/icon-category-headphones.min.svg", 
      link: "/produtos?categoria=headphones",
    },
    {
      id: 5,
      name: "Tênis",
      normalIcon: "/icons/icon-category-sneakers.svg",
      hoverIcon: "/icons/icon-category-sneakers.min.svg", 
      link: "/produtos?categoria=tenis",
    },
  ];

  const categoriesToRender =
    categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="flex justify-center gap-x-8 gap-y-10 md:gap-x-20 flex-wrap py-10">
      {categoriesToRender.map((category) => (
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