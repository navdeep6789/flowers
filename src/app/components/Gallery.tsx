import Image from "next/image";

interface GalleryItem {
  src: string;
  caption?: string;
}

interface GalleryProps {
  items: GalleryItem[];
}

export default function Gallery({ items }: GalleryProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-12">
        Captured Moments
      </h2>
      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
        {items.map((item, index) => (
          <div key={index} className="break-inside-avoid relative rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all">
            <Image 
              src={item.src}
              alt={item.caption || `Gallery image ${index + 1}`}
              width={800}
              height={600}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-sans">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
