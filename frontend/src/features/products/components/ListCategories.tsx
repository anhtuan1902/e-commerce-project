import { useEffect } from 'react';
import useCategories from '../hooks/useCategories';
import { useCategoriesStore } from '../store/categories.store';
import { useProductsStore } from '../store/products.store';

const ListCategories = () => {
  const categories = useCategoriesStore((s) => s.categories);
  const { mutate, isPending } = useCategories();
  const selectedCategoryId = useProductsStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useProductsStore((s) => s.setSelectedCategoryId);
  const resetProducts = useProductsStore((s) => s.resetProducts);

  useEffect(() => {
    mutate();
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
      resetProducts();
    }
  };

  if (isPending) {
    return <div>Loading categories...</div>;
  }

  return (
    <>
      {categories.length > 0 && (
        <div className='flex space-x-4 overflow-x-auto pb-4 my-6 scrollbar-hide'>
          <button
            type='button'
            onClick={() => handleCategoryClick(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full border ${selectedCategoryId === null ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type='button'
              onClick={() => handleCategoryClick(cat.id.toString())}
              className={`whitespace-nowrap px-4 py-2 rounded-full border ${selectedCategoryId === cat.id.toString() ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default ListCategories;
