import ListCategories from '@/features/products/components/ListCategories';
import ListProduct from '@/features/products/components/ListProduct';
import Banner from '@/shared/layouts/Banner';

const HomePage = () => {
  return (
    <>
      <Banner />
      <ListCategories />
      <ListProduct />
    </>
  );
};

export default HomePage;
