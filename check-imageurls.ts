import { supabase } from './lib/supabase';

async function checkImageUrls() {
  // Get a product that was just updated
  const { data, error } = await supabase
    .from('Product')
    .select('id, name, thumbnailUrl, imageUrls')
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Products in database:');
    data.forEach(p => {
      console.log({
        id: p.id,
        name: p.name,
        imageUrls: p.imageUrls,
        imageUrlsType: typeof p.imageUrls,
        imageUrlsLength: p.imageUrls?.length
      });
    });
  }
}

checkImageUrls();
