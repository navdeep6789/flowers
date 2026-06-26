import Image from "next/image";

interface MessageCardProps {
  message: string;
  photoSrc?: string;
  signature?: string;
}

export default function MessageCard({ message, photoSrc, signature }: MessageCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-xl max-w-xl mx-auto my-12 relative overflow-hidden border border-white/50">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blush via-coral to-lavender"></div>
      
      {photoSrc && (
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
            <Image 
              src={photoSrc} 
              alt="Profile" 
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
      
      <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-serif italic text-center">
        "{message}"
      </p>
      
      {signature && (
        <p className="mt-8 text-3xl text-coral font-script text-right">
          — {signature}
        </p>
      )}
    </div>
  );
}
