import Image from "next/image";

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  image?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="py-16 md:py-24 max-w-4xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-16">
        Our Memories
      </h2>
      
      <div className="relative border-l-2 border-blush md:border-l-0 md:flex md:justify-center md:items-center md:space-x-8">
        {events.map((event, index) => (
          <div key={index} className="mb-10 ml-6 md:mb-0 md:ml-0 md:flex-1 relative group">
            {/* Dot */}
            <div className="absolute w-4 h-4 bg-coral rounded-full -left-[1.65rem] top-1.5 md:left-1/2 md:-ml-2 md:-top-10 md:static md:mx-auto md:mb-6 shadow-[0_0_0_4px_var(--color-cream)]"></div>
            
            {/* Desktop connecting line (hidden on mobile) */}
            {index !== events.length - 1 && (
              <div className="hidden md:block absolute h-0.5 bg-blush w-full left-1/2 -top-4 -z-10"></div>
            )}
            
            <div className="bg-white p-6 rounded-2xl shadow-md border border-blush/20 hover:shadow-xl transition-shadow">
              <span className="text-sm font-bold text-mint uppercase tracking-wider block mb-2">
                {event.date}
              </span>
              <h3 className="text-xl font-serif text-gray-800 mb-2">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-gray-600 font-sans mb-4">
                  {event.description}
                </p>
              )}
              {event.image && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image 
                    src={event.image} 
                    alt={event.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
