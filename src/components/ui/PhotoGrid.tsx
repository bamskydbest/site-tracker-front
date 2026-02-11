import type { Photo } from '../../types/index.js';

interface PhotoGridProps {
  photos: Photo[];
  title?: string;
}

export default function PhotoGrid({ photos, title }: PhotoGridProps) {
  if (!photos.length) return null;

  return (
    <div>
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <a
            key={photo._id}
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img
              src={photo.url}
              alt={`${photo.type} photo`}
              className="w-full h-full object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
