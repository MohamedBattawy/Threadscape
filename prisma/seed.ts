import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Define types for our functions
interface ProductCreateInput {
  name: string;
  description: string;
  price: number;
  category: 'MENS' | 'WOMENS' | 'ACCESSORIES';
  inventory: number;
  images: {
    url: string;
    isMain?: boolean;
  }[];
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating users...');
  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@threadscape.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      address: '123 Admin Street',
      city: 'New York',
      country: 'USA',
      role: 'ADMIN'
    }
  });

  // Create regular users
  const userPassword = await bcrypt.hash('Password123!', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        password: userPassword,
        firstName: 'John',
        lastName: 'Doe',
        address: '456 Park Avenue',
        city: 'Boston',
        country: 'USA'
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        password: userPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        address: '789 Oak Road',
        city: 'San Francisco',
        country: 'USA'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        password: userPassword,
        firstName: 'Mike',
        lastName: 'Johnson',
        address: '101 Pine Street',
        city: 'Chicago',
        country: 'USA'
      }
    }),
  ]);

  console.log('Creating products...');
  // Create men's products
  const mensProducts = await Promise.all([
    createProduct({
      name: 'Classic Cotton T-Shirt',
      description: 'A comfortable everyday cotton t-shirt with a relaxed fit. Made from 100% organic cotton.',
      price: 24.99,
      category: 'MENS',
      inventory: 100,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', isMain: true },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a' },
      ]
    }),
    createProduct({
      name: 'Slim Fit Jeans',
      description: 'Modern slim fit jeans in a versatile dark wash. Perfect for casual and semi-formal occasions.',
      price: 59.99,
      category: 'MENS',
      inventory: 75,
      images: [
        { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', isMain: true },
        { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d' },
      ]
    }),
    createProduct({
      name: 'Oxford Button-Down Shirt',
      description: 'A timeless Oxford shirt made from premium cotton. Features a button-down collar and relaxed fit.',
      price: 49.99,
      category: 'MENS',
      inventory: 60,
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c', isMain: true },
        { url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8' },
      ]
    }),
    createProduct({
      name: 'Wool Blend Blazer',
      description: 'A sophisticated wool blend blazer perfect for formal events or business meetings. Tailored fit with modern details.',
      price: 149.99,
      category: 'MENS',
      inventory: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf', isMain: true },
        { url: 'https://images.unsplash.com/photo-1625910513399-f2ef8f69ddcc' },
      ]
    }),
    createProduct({
      name: 'Chino Pants',
      description: 'Versatile chino pants in a comfortable cotton blend. Perfect for casual office days or weekend outings.',
      price: 54.99,
      category: 'MENS',
      inventory: 85,
      images: [
        { url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0', isMain: true },
        { url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea' },
      ]
    }),
    createProduct({
      name: 'Graphic Logo Hoodie',
      description: 'A cozy hoodie featuring our signature logo. Made from soft fleece with a kangaroo pocket.',
      price: 64.99,
      category: 'MENS',
      inventory: 70,
      images: [
        { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7', isMain: true },
        { url: 'https://images.unsplash.com/photo-1565693413579-8a218c607b74' },
      ]
    }),
    createProduct({
      name: 'Leather Bomber Jacket',
      description: 'A classic leather bomber jacket with ribbed cuffs and hem. Timeless style with premium materials.',
      price: 199.99,
      category: 'MENS',
      inventory: 30,
      images: [
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5', isMain: true },
        { url: 'https://images.unsplash.com/photo-1587855049254-351f4e55fe2a' },
      ]
    }),
    createProduct({
      name: 'Slim Fit Polo Shirt',
      description: 'A modern slim fit polo shirt in breathable pique cotton. Perfect for casual and smart-casual looks.',
      price: 39.99,
      category: 'MENS',
      inventory: 90,
      images: [
        { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10', isMain: true },
        { url: 'https://images.unsplash.com/photo-1571455786673-9d9d6c194f90' },
      ]
    }),
    createProduct({
      name: 'Merino Wool Sweater',
      description: 'A luxurious Merino wool sweater with a crew neck. Lightweight yet warm for year-round comfort.',
      price: 79.99,
      category: 'MENS',
      inventory: 55,
      images: [
        { url: 'https://images.unsplash.com/photo-1580331451062-99ff207523b0', isMain: true },
        { url: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788' },
      ]
    }),
    createProduct({
      name: 'Cargo Shorts',
      description: 'Practical cargo shorts with multiple pockets. Perfect for outdoor activities and casual summer days.',
      price: 44.99,
      category: 'MENS',
      inventory: 80,
      images: [
        { url: 'https://images.unsplash.com/photo-1565614824371-06586a8ee66e', isMain: true },
        { url: 'https://images.unsplash.com/photo-1543076659-9380cdf10613' },
      ]
    }),
    createProduct({
      name: 'Quilted Vest',
      description: 'A lightweight quilted vest for layering. Perfect for transitional weather and outdoor activities.',
      price: 69.99,
      category: 'MENS',
      inventory: 50,
      images: [
        { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea', isMain: true },
        { url: 'https://images.unsplash.com/photo-1646536780097-1783087fc240' },
      ]
    }),
    createProduct({
      name: 'Linen Button-Up Shirt',
      description: 'A breathable linen shirt perfect for warm weather. Features a relaxed fit and natural texture.',
      price: 59.99,
      category: 'MENS',
      inventory: 65,
      images: [
        { url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157', isMain: true },
        { url: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388' },
      ]
    }),
    createProduct({
      name: 'Fleece Sweatshirt',
      description: 'A cozy fleece sweatshirt with a crew neck. Perfect for lounging or casual outings.',
      price: 49.99,
      category: 'MENS',
      inventory: 75,
      images: [
        { url: 'https://images.unsplash.com/photo-1611647832580-377268dba7cb', isMain: true },
        { url: 'https://images.unsplash.com/photo-1579572331145-5e53b299c64e' },
      ]
    }),
    createProduct({
      name: 'Rain Jacket',
      description: 'A waterproof rain jacket with sealed seams. Lightweight and packable for unexpected weather.',
      price: 89.99,
      category: 'MENS',
      inventory: 40,
      images: [
        { url: 'https://images.unsplash.com/photo-1520175128829-4ccea1389ba6', isMain: true },
        { url: 'https://images.unsplash.com/photo-1554114892-d507c5c3c4e5' },
      ]
    }),
    createProduct({
      name: 'Henley T-Shirt',
      description: 'A comfortable Henley t-shirt with button placket. A versatile layering piece for any casual outfit.',
      price: 34.99,
      category: 'MENS',
      inventory: 85,
      images: [
        { url: 'https://images.unsplash.com/photo-1586752702338-39b5ec8d555f', isMain: true },
        { url: 'https://images.unsplash.com/photo-1638394282684-de67fff24955' },
      ]
    }),
    createProduct({
      name: 'Tailored Dress Pants',
      description: 'Elegant tailored dress pants with a straight leg. Perfect for formal occasions and business wear.',
      price: 79.99,
      category: 'MENS',
      inventory: 55,
      images: [
        { url: 'https://images.unsplash.com/photo-1580420876816-ac9e5c1f48b4', isMain: true },
        { url: 'https://images.unsplash.com/photo-1617259751379-13ad313b2160' },
      ]
    }),
    createProduct({
      name: 'Lightweight Puffer Jacket',
      description: 'A lightweight puffer jacket for cool weather. Packable and versatile for everyday wear.',
      price: 99.99,
      category: 'MENS',
      inventory: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1604025677169-e7eca4919493', isMain: true },
        { url: 'https://images.unsplash.com/photo-1516826957135-700dedea698c' },
      ]
    }),
    createProduct({
      name: 'Denim Jacket',
      description: 'A classic denim jacket with a vintage wash. A timeless piece that goes with everything.',
      price: 74.99,
      category: 'MENS',
      inventory: 60,
      images: [
        { url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531', isMain: true },
        { url: 'https://images.unsplash.com/photo-1525695230005-efd074980869' },
      ]
    }),
    createProduct({
      name: 'Relaxed Fit Shorts',
      description: 'Comfortable casual shorts with a relaxed fit. Perfect for warm days and leisure activities.',
      price: 39.99,
      category: 'MENS',
      inventory: 80,
      images: [
        { url: 'https://images.unsplash.com/photo-1571450903458-4aa0560d72c4', isMain: true },
        { url: 'https://images.unsplash.com/photo-1549062572-544a64fb0c56' },
      ]
    }),
    createProduct({
      name: 'Quarter-Zip Pullover',
      description: 'A versatile quarter-zip pullover in a soft knit. Perfect for layering in any season.',
      price: 59.99,
      category: 'MENS',
      inventory: 70,
      images: [
        { url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4', isMain: true },
        { url: 'https://images.unsplash.com/photo-1618677831708-0e7fda3148b4' },
      ]
    }),
    createProduct({
      name: 'Corduroy Shirt',
      description: 'A warm corduroy shirt with a button-up front. Adds texture and warmth to any outfit.',
      price: 64.99,
      category: 'MENS',
      inventory: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e', isMain: true },
        { url: 'https://images.unsplash.com/photo-1602810319366-8c1794a7c2d6' },
      ]
    }),
    createProduct({
      name: 'Casual Lounge Pants',
      description: 'Comfortable lounge pants with an elastic waistband. Perfect for relaxing at home.',
      price: 44.99,
      category: 'MENS',
      inventory: 90,
      images: [
        { url: 'https://images.unsplash.com/photo-1606513542745-97629752a537', isMain: true },
        { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80' },
      ]
    }),
    createProduct({
      name: 'Performance Polo',
      description: 'A moisture-wicking performance polo for sports and active days. Keeps you cool and comfortable.',
      price: 49.99,
      category: 'MENS',
      inventory: 70,
      images: [
        { url: 'https://images.unsplash.com/photo-1612722432474-b971cdcea546', isMain: true },
        { url: 'https://images.unsplash.com/photo-1563630423918-b58f07336ac9' },
      ]
    }),
    createProduct({
      name: 'Wool Peacoat',
      description: 'A classic wool peacoat with double-breasted buttons. Timeless style for cold weather.',
      price: 199.99,
      category: 'MENS',
      inventory: 30,
      images: [
        { url: 'https://images.unsplash.com/photo-1556726307-08ba1c3e1f9a', isMain: true },
        { url: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990' },
      ]
    }),
    createProduct({
      name: 'Graphic Print T-Shirt',
      description: 'A cotton t-shirt with an artistic graphic print. Express your style with this unique design.',
      price: 29.99,
      category: 'MENS',
      inventory: 95,
      images: [
        { url: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a', isMain: true },
        { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27' },
      ]
    }),
  ]);

  // Create women's products
  const womensProducts = await Promise.all([
    createProduct({
      name: 'Floral Summer Dress',
      description: 'A lightweight summer dress with a delicate floral pattern. Perfect for warm days and special occasions.',
      price: 79.99,
      category: 'WOMENS',
      inventory: 50,
      images: [
        { url: 'https://images.unsplash.com/photo-1612722432474-b971cdcea546', isMain: true },
        { url: 'https://images.unsplash.com/photo-1618554754947-e01d5ce3c549' },
      ]
    }),
    createProduct({
      name: 'High-Waisted Skinny Jeans',
      description: 'Modern high-waisted skinny jeans with a flattering fit. Made with a touch of stretch for comfort.',
      price: 64.99,
      category: 'WOMENS',
      inventory: 85,
      images: [
        { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', isMain: true },
        { url: 'https://images.unsplash.com/photo-1475178626620-a4d074967452' },
      ]
    }),
    createProduct({
      name: 'Cashmere Sweater',
      description: 'A luxuriously soft cashmere sweater with a relaxed fit. Perfect for staying warm in style.',
      price: 129.99,
      category: 'WOMENS',
      inventory: 40,
      images: [
        { url: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77', isMain: true },
        { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990' },
      ]
    }),
    createProduct({
      name: 'Pleated Midi Skirt',
      description: 'An elegant pleated midi skirt that transitions effortlessly from office to evening events.',
      price: 59.99,
      category: 'WOMENS',
      inventory: 65,
      images: [
        { url: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0', isMain: true },
        { url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa' },
      ]
    }),
    createProduct({
      name: 'Tailored Blazer',
      description: 'A sophisticated tailored blazer perfect for professional settings or dressing up casual outfits.',
      price: 119.99,
      category: 'WOMENS',
      inventory: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', isMain: true },
        { url: 'https://images.unsplash.com/photo-1632149877166-f75d49000351' },
      ]
    }),
    createProduct({
      name: 'Silk Blouse',
      description: 'A luxurious silk blouse with a timeless design. Versatile for both work and special occasions.',
      price: 89.99,
      category: 'WOMENS',
      inventory: 55,
      images: [
        { url: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754', isMain: true },
        { url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea' },
      ]
    }),
    createProduct({
      name: 'Yoga Leggings',
      description: 'High-performance yoga leggings with moisture-wicking fabric. Perfect for workouts or casual wear.',
      price: 49.99,
      category: 'WOMENS',
      inventory: 100,
      images: [
        { url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8', isMain: true },
        { url: 'https://images.unsplash.com/photo-1545442150-d3b0ac351690' },
      ]
    }),
    createProduct({
      name: 'Wrap Dress',
      description: 'A flattering wrap dress in a vibrant pattern. Versatile for both casual and semi-formal occasions.',
      price: 74.99,
      category: 'WOMENS',
      inventory: 60,
      images: [
        { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956', isMain: true },
        { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446' },
      ]
    }),
    createProduct({
      name: 'Denim Shorts',
      description: 'Classic denim shorts with a slightly distressed finish. A summer wardrobe essential.',
      price: 44.99,
      category: 'WOMENS',
      inventory: 80,
      images: [
        { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b', isMain: true },
        { url: 'https://images.unsplash.com/photo-1560243563-062bfc001d68' },
      ]
    }),
    createProduct({
      name: 'Knit Cardigan',
      description: 'A cozy knit cardigan with front pockets. Perfect for layering in any season.',
      price: 69.99,
      category: 'WOMENS',
      inventory: 70,
      images: [
        { url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f', isMain: true },
        { url: 'https://images.unsplash.com/photo-1617258527189-0525a9367655' },
      ]
    }),
    createProduct({
      name: 'Maxi Sundress',
      description: 'A flowy maxi sundress with adjustable straps. Perfect for beach days and summer events.',
      price: 84.99,
      category: 'WOMENS',
      inventory: 50,
      images: [
        { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c', isMain: true },
        { url: 'https://images.unsplash.com/photo-1617551307578-7103f4549488' },
      ]
    }),
    createProduct({
      name: 'Linen Pants',
      description: 'Breathable linen pants with a wide leg. Perfect for hot days and resort wear.',
      price: 69.99,
      category: 'WOMENS',
      inventory: 65,
      images: [
        { url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495', isMain: true },
        { url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea' },
      ]
    }),
    createProduct({
      name: 'Cropped Hoodie',
      description: 'A comfortable cropped hoodie in soft fleece. Perfect for workouts or casual outings.',
      price: 54.99,
      category: 'WOMENS',
      inventory: 75,
      images: [
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', isMain: true },
        { url: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23' },
      ]
    }),
    createProduct({
      name: 'Satin Slip Dress',
      description: 'An elegant satin slip dress with adjustable straps. Versatile for layering or wearing alone.',
      price: 99.99,
      category: 'WOMENS',
      inventory: 40,
      images: [
        { url: 'https://images.unsplash.com/photo-1633370870402-bbbef81a9fd7', isMain: true },
        { url: 'https://images.unsplash.com/photo-1568252542512-9a39a6a3ee8c' },
      ]
    }),
    createProduct({
      name: 'Puffer Jacket',
      description: 'A warm puffer jacket with a fitted silhouette. Provides warmth without bulk for cold days.',
      price: 129.99,
      category: 'WOMENS',
      inventory: 35,
      images: [
        { url: 'https://images.unsplash.com/photo-1548624313-0396284defd7', isMain: true },
        { url: 'https://images.unsplash.com/photo-1614093302611-8efc4de79513' },
      ]
    }),
    createProduct({
      name: 'Workout Tank Top',
      description: 'A lightweight and breathable workout tank with moisture-wicking technology. Perfect for any exercise.',
      price: 34.99,
      category: 'WOMENS',
      inventory: 90,
      images: [
        { url: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d', isMain: true },
        { url: 'https://images.unsplash.com/photo-1592584954744-a58ba5a0ac5e' },
      ]
    }),
    createProduct({
      name: 'Denim Jumpsuit',
      description: 'A stylish denim jumpsuit with a belted waist. A statement piece for casual outings.',
      price: 94.99,
      category: 'WOMENS',
      inventory: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127', isMain: true },
        { url: 'https://images.unsplash.com/photo-1584273143981-41c226a429f8' },
      ]
    }),
    createProduct({
      name: 'Knit Beanie',
      description: 'A soft knit beanie to keep you warm in style. Available in multiple colors.',
      price: 29.99,
      category: 'WOMENS',
      inventory: 85,
      images: [
        { url: 'https://images.unsplash.com/photo-1510598155053-d5c97353fedc', isMain: true },
        { url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531' },
      ]
    }),
    createProduct({
      name: 'Pencil Skirt',
      description: 'A classic pencil skirt for a polished look. Perfect for office wear and professional settings.',
      price: 59.99,
      category: 'WOMENS',
      inventory: 60,
      images: [
        { url: 'https://images.unsplash.com/photo-1554194302-c046abf8a28e', isMain: true },
        { url: 'https://images.unsplash.com/photo-1551048632-6bd0a5b8a850' },
      ]
    }),
    createProduct({
      name: 'Oversized Sweater',
      description: 'A comfortable oversized sweater in a soft knit. Perfect for cozy days and casual styling.',
      price: 74.99,
      category: 'WOMENS',
      inventory: 65,
      images: [
        { url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d993', isMain: true },
        { url: 'https://images.unsplash.com/photo-1597223557154-721c1cecc4b0' },
      ]
    }),
    createProduct({
      name: 'Belted Trench Coat',
      description: 'A timeless belted trench coat for rainy days. Classic style with modern details.',
      price: 149.99,
      category: 'WOMENS',
      inventory: 35,
      images: [
        { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea', isMain: true },
        { url: 'https://images.unsplash.com/photo-1567473810954-507d59716c25' },
      ]
    }),
    createProduct({
      name: 'Cotton Pajama Set',
      description: 'A comfortable cotton pajama set for restful nights. Soft fabric and relaxed fit.',
      price: 49.99,
      category: 'WOMENS',
      inventory: 75,
      images: [
        { url: 'https://images.unsplash.com/photo-1566952585926-9937d8fe272a', isMain: true },
        { url: 'https://images.unsplash.com/photo-1542340916-951bb72c8f74' },
      ]
    }),
    createProduct({
      name: 'Tie-Front Blouse',
      description: 'A chic tie-front blouse in lightweight fabric. Perfect for work or casual styling.',
      price: 54.99,
      category: 'WOMENS',
      inventory: 70,
      images: [
        { url: 'https://images.unsplash.com/photo-1584273143981-41c226a429f8', isMain: true },
        { url: 'https://images.unsplash.com/photo-1552511944-f6675bcbcc8e' },
      ]
    }),
    createProduct({
      name: 'Denim Mini Skirt',
      description: 'A versatile denim mini skirt with a slight A-line shape. A year-round wardrobe essential.',
      price: 49.99,
      category: 'WOMENS',
      inventory: 80,
      images: [
        { url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa', isMain: true },
        { url: 'https://images.unsplash.com/photo-1579675756306-dee5e67c602a' },
      ]
    }),
    createProduct({
      name: 'Ribbed Turtleneck',
      description: 'A fitted ribbed turtleneck in a soft stretch fabric. Perfect for layering or wearing alone.',
      price: 44.99,
      category: 'WOMENS',
      inventory: 65,
      images: [
        { url: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5', isMain: true },
        { url: 'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd' },
      ]
    }),
  ]);

  // Create accessories
  const accessories = await Promise.all([
    createProduct({
      name: 'Leather Belt',
      description: 'A high-quality leather belt with a classic buckle. Versatile and durable for everyday wear.',
      price: 34.99,
      category: 'ACCESSORIES',
      inventory: 120,
      images: [
        { url: 'https://images.unsplash.com/photo-1624624717741-70ea3d4376a8', isMain: true },
        { url: 'https://images.unsplash.com/photo-1611094616687-f8f1ac8c9fd3' },
      ]
    }),
    createProduct({
      name: 'Knitted Beanie',
      description: 'A warm knitted beanie for cold winter days. Made from a soft wool blend for maximum comfort.',
      price: 19.99,
      category: 'ACCESSORIES',
      inventory: 90,
      images: [
        { url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531', isMain: true },
        { url: 'https://images.unsplash.com/photo-1510598155053-d5c97353fedc' },
      ]
    }),
    createProduct({
      name: 'Silk Scarf',
      description: 'A luxurious silk scarf with an elegant pattern. Adds a touch of sophistication to any outfit.',
      price: 44.99,
      category: 'ACCESSORIES',
      inventory: 65,
      images: [
        { url: 'https://images.unsplash.com/photo-1584187839132-aaad17f181a8', isMain: true },
        { url: 'https://images.unsplash.com/photo-1601370552761-d129028bd833' },
      ]
    }),
    createProduct({
      name: 'Aviator Sunglasses',
      description: 'Classic aviator sunglasses with UV protection. Timeless style for any face shape.',
      price: 89.99,
      category: 'ACCESSORIES',
      inventory: 80,
      images: [
        { url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a', isMain: true },
        { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083' },
      ]
    }),
    createProduct({
      name: 'Leather Wallet',
      description: 'A premium leather wallet with multiple card slots and a bill compartment. Slim profile for pocket comfort.',
      price: 49.99,
      category: 'ACCESSORIES',
      inventory: 100,
      images: [
        { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93', isMain: true },
        { url: 'https://images.unsplash.com/photo-1559694097-9180c97f661d' },
      ]
    }),
    createProduct({
      name: 'Canvas Tote Bag',
      description: 'A durable canvas tote bag for everyday use. Spacious and environmentally friendly for shopping or day trips.',
      price: 29.99,
      category: 'ACCESSORIES',
      inventory: 150,
      images: [
        { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1', isMain: true },
        { url: 'https://images.unsplash.com/photo-1597927072430-a5333e074c45' },
      ]
    }),
    createProduct({
      name: 'Woven Straw Hat',
      description: 'A stylish woven straw hat with a wide brim. Perfect for beach days and sun protection.',
      price: 39.99,
      category: 'ACCESSORIES',
      inventory: 70,
      images: [
        { url: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff', isMain: true },
        { url: 'https://images.unsplash.com/photo-1533185924402-62b2b2495d9a' },
      ]
    }),
    createProduct({
      name: 'Leather Gloves',
      description: 'Soft leather gloves with a cozy lining. Elegant and warm for cold weather.',
      price: 59.99,
      category: 'ACCESSORIES',
      inventory: 60,
      images: [
        { url: 'https://images.unsplash.com/photo-1579482170881-f4da8b4cb1a3', isMain: true },
        { url: 'https://images.unsplash.com/photo-1582416465268-14c1804def44' },
      ]
    }),
    createProduct({
      name: 'Patterned Socks',
      description: 'Fun patterned socks in colorful designs. Add a pop of personality to any outfit.',
      price: 12.99,
      category: 'ACCESSORIES',
      inventory: 200,
      images: [
        { url: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82', isMain: true },
        { url: 'https://images.unsplash.com/photo-1618354691229-88d47f285158' },
      ]
    }),
    createProduct({
      name: 'Minimalist Watch',
      description: 'A sleek minimalist watch with a leather strap. Timeless design for everyday wear.',
      price: 99.99,
      category: 'ACCESSORIES',
      inventory: 50,
      images: [
        { url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49', isMain: true },
        { url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6' },
      ]
    }),
    createProduct({
      name: 'Cotton Bandana',
      description: 'A versatile cotton bandana in a classic pattern. Multiple ways to wear for both style and function.',
      price: 14.99,
      category: 'ACCESSORIES',
      inventory: 120,
      images: [
        { url: 'https://images.unsplash.com/photo-1636200580254-e7e61ad4775c', isMain: true },
        { url: 'https://images.unsplash.com/photo-1542272201-b1ca555f8505' },
      ]
    }),
    createProduct({
      name: 'Leather Backpack',
      description: 'A stylish and durable leather backpack with multiple compartments. Perfect for work or travel.',
      price: 149.99,
      category: 'ACCESSORIES',
      inventory: 40,
      images: [
        { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', isMain: true },
        { url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3' },
      ]
    }),
    createProduct({
      name: 'Statement Earrings',
      description: 'Bold statement earrings to elevate any outfit. Lightweight design for comfortable wear.',
      price: 24.99,
      category: 'ACCESSORIES',
      inventory: 80,
      images: [
        { url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59', isMain: true },
        { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908' },
      ]
    }),
    createProduct({
      name: 'Leather Crossbody Bag',
      description: 'A compact leather crossbody bag for essentials. Perfect for days when you want to travel light.',
      price: 79.99,
      category: 'ACCESSORIES',
      inventory: 60,
      images: [
        { url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c', isMain: true },
        { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
      ]
    }),
    createProduct({
      name: 'Classic Necktie',
      description: 'A silk necktie in a timeless pattern. Essential for formal occasions and business attire.',
      price: 49.99,
      category: 'ACCESSORIES',
      inventory: 75,
      images: [
        { url: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e', isMain: true },
        { url: 'https://images.unsplash.com/photo-1588533588400-708d941a47c4' },
      ]
    }),
    createProduct({
      name: 'Winter Scarf',
      description: 'A warm winter scarf in a soft wool blend. Generous length for various styling options.',
      price: 34.99,
      category: 'ACCESSORIES',
      inventory: 90,
      images: [
        { url: 'https://images.unsplash.com/photo-1607736692099-2c0473a38f12', isMain: true },
        { url: 'https://images.unsplash.com/photo-1602464167896-35b9e54462c3' },
      ]
    }),
    createProduct({
      name: 'Baseball Cap',
      description: 'A classic baseball cap with an adjustable strap. Casual style for everyday wear.',
      price: 24.99,
      category: 'ACCESSORIES',
      inventory: 100,
      images: [
        { url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3', isMain: true },
        { url: 'https://images.unsplash.com/photo-1617423283468-86c968b7211a' },
      ]
    }),
    createProduct({
      name: 'Weekender Bag',
      description: 'A spacious weekender bag for short trips. Durable materials and comfortable carry options.',
      price: 89.99,
      category: 'ACCESSORIES',
      inventory: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa', isMain: true },
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62' },
      ]
    }),
    createProduct({
      name: 'Geometric Pendant Necklace',
      description: 'A modern geometric pendant necklace in gold-tone finish. Adds interest to any neckline.',
      price: 29.99,
      category: 'ACCESSORIES',
      inventory: 85,
      images: [
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f', isMain: true },
        { url: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd' },
      ]
    }),
    createProduct({
      name: 'Leather Card Holder',
      description: 'A slim leather card holder for essential cards. Fits perfectly in any pocket.',
      price: 19.99,
      category: 'ACCESSORIES',
      inventory: 150,
      images: [
        { url: 'https://images.unsplash.com/photo-1605932661689-1cfca45c8216', isMain: true },
        { url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d' },
      ]
    }),
    createProduct({
      name: 'Wide-Brim Fedora',
      description: 'A stylish wide-brim fedora hat in wool felt. Adds a touch of sophistication to any outfit.',
      price: 59.99,
      category: 'ACCESSORIES',
      inventory: 50,
      images: [
        { url: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a', isMain: true },
        { url: 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325' },
      ]
    }),
    createProduct({
      name: 'Smartphone Touch Gloves',
      description: 'Warm knit gloves with touchscreen-compatible fingertips. Stay connected without freezing your fingers.',
      price: 22.99,
      category: 'ACCESSORIES',
      inventory: 85,
      images: [
        { url: 'https://images.unsplash.com/photo-1609669371960-a67805bae6fa', isMain: true },
        { url: 'https://images.unsplash.com/photo-1617017603957-67330f57eac5' },
      ]
    }),
    createProduct({
      name: 'Waist Belt Bag',
      description: 'A trendy waist belt bag for hands-free convenience. Perfect for festivals and travel.',
      price: 34.99,
      category: 'ACCESSORIES',
      inventory: 70,
      images: [
        { url: 'https://images.unsplash.com/photo-1585488573448-3a0f838539d3', isMain: true },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7' },
      ]
    }),
    createProduct({
      name: 'Bracelet Set',
      description: 'A set of mixed metal bracelets for stacking. Create your own unique arm party.',
      price: 39.99,
      category: 'ACCESSORIES',
      inventory: 80,
      images: [
        { url: 'https://images.unsplash.com/photo-1620741089258-60c7c908321e', isMain: true },
        { url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed' },
      ]
    }),
    createProduct({
      name: 'Printed Pocket Square',
      description: 'A silk pocket square with a unique printed design. Adds a finishing touch to any suit jacket.',
      price: 24.99,
      category: 'ACCESSORIES',
      inventory: 90,
      images: [
        { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348', isMain: true },
        { url: 'https://images.unsplash.com/photo-1600951778763-7e511a5db2c3' },
      ]
    }),
  ]);

  console.log('Adding ratings...');
  // Add some ratings to products
  const allProducts = [...mensProducts, ...womensProducts, ...accessories];
  const allUsers = [...users, admin];
  
  // Only add ratings to 25% of products to avoid overwhelming the database
  const productsToRate = shuffleArray([...allProducts]).slice(0, Math.floor(allProducts.length * 0.25));
  
  for (const product of productsToRate) {
    // Each product gets 1-3 ratings from random users
    const numRatings = Math.floor(Math.random() * 3) + 1;
    const ratingUsers = shuffleArray([...allUsers]).slice(0, numRatings);
    
    for (const user of ratingUsers) {
      await prisma.rating.create({
        data: {
          value: Math.floor(Math.random() * 5) + 1, // Rating between 1-5
          userId: user.id,
          productId: product.id
        }
      });
    }
  }

  console.log('Creating orders...');
  // Create some orders
  for (const user of users) {
    // Create 1-2 orders per user
    const numOrders = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numOrders; i++) {
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const orderProducts = shuffleArray([...allProducts]).slice(0, numProducts);
      
      let total = 0;
      const orderItems: any[] = [];
      
      for (const product of orderProducts) {
        const quantity = Math.floor(Math.random() * 2) + 1;
        total += parseFloat(product.price.toString()) * quantity;
        
        orderItems.push({
          productId: product.id,
          quantity,
          price: product.price
        });
      }
      
      await prisma.order.create({
        data: {
          userId: user.id,
          total,
          status: getRandomOrderStatus(),
          orderItems: {
            create: orderItems
          }
        }
      });
    }
  }

  console.log('Adding items to carts...');
  // Add items to carts - limit to 1-3 items per user
  for (const user of [...users, admin]) {
    const numCartItems = Math.floor(Math.random() * 3) + 1;
    if (numCartItems === 0) continue;
    
    const cartProducts = shuffleArray([...allProducts]).slice(0, numCartItems);
    
    for (const product of cartProducts) {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 2) + 1
        }
      });
    }
  }

  console.log('Database seeded successfully with 75 products!');
  console.log(`- ${mensProducts.length} men's products`);
  console.log(`- ${womensProducts.length} women's products`);
  console.log(`- ${accessories.length} accessories`);
}

// Helper function to create a product with images
async function createProduct({ name, description, price, category, inventory, images }: ProductCreateInput) {
  return prisma.product.create({
    data: {
      name,
      description,
      price,
      category,
      inventory,
      images: {
        create: images
      }
    }
  });
}

// Helper to get random order status
function getRandomOrderStatus(): 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' {
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Helper to shuffle array (for random selections)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 