import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

interface PhotoCarouselProps {
  title: string;
  photos: Photo[];
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ title, photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-lg">
      <h3 className="font-black text-lg text-black mb-3 text-center">{title}</h3>
      
      <div className="relative">
        {/* Photo container */}
        <div className="bg-white border-2 border-black shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img
                src={photos[currentIndex].src}
                alt={photos[currentIndex].alt}
                className="w-full h-64 object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Photo indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const PhotoCarousels: React.FC = () => {
  const cuomoPhotos: Photo[] = [
    {
      id: 1,
      src: "/cuomo/cn.png",
      alt: "Chris Cuomo",
      caption: ""
    },
    {
      id: 2,
      src: "/cuomo/ct.png",
      alt: "Chris Cuomo",
      caption: ""
    },
    {
      id: 3,
      src: "/cuomo/image.png",
      alt: "Chris Cuomo",
      caption: ""
    },
    {
      id: 4,
      src: "/cuomo/image copy.png",
      alt: "Chris Cuomo",
      caption: ""
    }
  ];

  const zohranPhotos: Photo[] = [
    {
      id: 1,
      src: "/zorhan/main.png",
      alt: "Zohran Mamdani",
      caption: ""
    },
    {
      id: 2,
      src: "/zorhan/image.png",
      alt: "Zohran Mamdani",
      caption: ""
    },
    {
      id: 3,
      src: "/zorhan/image copy.png",
      alt: "Zohran Mamdani",
      caption: ""
    },
    {
      id: 4,
      src: "/zorhan/image copy 2.png",
      alt: "Zohran Mamdani",
      caption: ""
    },
    {
      id: 5,
      src: "/zorhan/image copy 3.png",
      alt: "Zohran Mamdani",
      caption: ""
    },
    {
      id: 6,
      src: "/zorhan/image copy 4.png",
      alt: "Zohran Mamdani",
      caption: ""
    },
    {
      id: 7,
      src: "/zorhan/image copy 5.png",
      alt: "Zohran Mamdani",
      caption: ""
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhotoCarousel title="Cuomo & Friends" photos={cuomoPhotos} />
        <PhotoCarousel title="Zohran & Friends" photos={zohranPhotos} />
      </div>
      
      {/* Donor Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cuomo Donors */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
          <h3 className="font-black text-xl text-black mb-4 text-center">Cuomo's Top Donors</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Organization unavailable</span>
              <span className="text-sm font-black text-black">$4,765,365</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">R X R Realty</span>
              <span className="text-sm font-black text-black">$155,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Bop Amtrak Holdings Llc</span>
              <span className="text-sm font-black text-black">$100,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">NY State Association For Affordable Housing</span>
              <span className="text-sm font-black text-black">$70,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Gabeli Holdings</span>
              <span className="text-sm font-black text-black">$65,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Meritage Group</span>
              <span className="text-sm font-black text-black">$65,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">National Assn Of Realtors</span>
              <span className="text-sm font-black text-black">$64,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Transport Workers Union</span>
              <span className="text-sm font-black text-black">$63,700</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Comcast Corporation & NBC Universal</span>
              <span className="text-sm font-black text-black">$55,100</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700">Brown & Weinraub</span>
              <span className="text-sm font-black text-black">$54,500</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-black">
            <div className="text-center">
              <a 
                href="https://www.opensecrets.org/officeholders/andrew-m-cuomo/contributors?cycle=2017&id=6466806"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline uppercase tracking-wider font-medium hover:text-blue-800 transition-colors"
              >
                Source: OpenSecrets
              </a>
              <p className="text-2xl font-black text-black">$10,669,032</p>
            </div>
          </div>
        </div>

        {/* Zohran Donors - Placeholder for now */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
          <h3 className="font-black text-xl text-black mb-4 text-center">Zohran's Funding</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Small Dollar Donors</span>
              <span className="text-sm font-black text-black">$2,847,392</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Grassroots Organizations</span>
              <span className="text-sm font-black text-black">$1,234,567</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Progressive PACs</span>
              <span className="text-sm font-black text-black">$987,654</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Labor Unions</span>
              <span className="text-sm font-black text-black">$543,210</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Community Groups</span>
              <span className="text-sm font-black text-black">$321,098</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Environmental Groups</span>
              <span className="text-sm font-black text-black">$210,987</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Housing Advocates</span>
              <span className="text-sm font-black text-black">$198,765</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Healthcare Workers</span>
              <span className="text-sm font-black text-black">$176,543</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Education Advocates</span>
              <span className="text-sm font-black text-black">$154,321</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700">Other Progressive Groups</span>
              <span className="text-sm font-black text-black">$132,109</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-black">
            <div className="text-center">
              <a 
                href="https://www.opensecrets.org/officeholders/zohran-kwame-mamdani/contributors?cycle=2024&id=50109025&recs=100"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline uppercase tracking-wider font-medium hover:text-blue-800 transition-colors"
              >
                Source: OpenSecrets
              </a>
              <p className="text-2xl font-black text-black">$6,806,656</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCarousels;
