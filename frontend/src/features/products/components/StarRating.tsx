import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating = ({ rating, size = 'sm' }: StarRatingProps) => {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex text-amber-500">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${sizeClass} ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}`} />
      ))}
    </div>
  );
};

export default StarRating;
