export interface Product {
  id: string;
  nameEn: string;
  nameNp: string;
  category: string;
  units: string[];
  inStock: boolean;
  imageUrl: string; // <-- New field for images
}

export const ALL_PRODUCTS: Product[] = [
  {
    id: "p1",
    nameEn: "Sona Mansuli Rice",
    nameNp: "सोना मन्सुली चामल",
    category: "Grains/Dal",
    units: ["25kg Sack", "50kg Sack"],
    inStock: true,
    imageUrl: "/images/pic1.png", 
  },
  {
    id: "p2",
    nameEn: "Fortune Mustard Oil",
    nameNp: "फॉर्च्यून तोरीको तेल",
    category: "Oil/Ghee",
    units: ["1L Pouch", "15L Tin"],
    inStock: false,
    imageUrl: "/images/pic2.png",
  },
  {
    id: "p3",
    nameEn: "Cumin Seeds (Jeera)",
    nameNp: "जिरा",
    category: "Spices",
    units: ["1kg Packet", "5kg Sack"],
    inStock: true,
    imageUrl: "/images/pic3.png",
  }
];