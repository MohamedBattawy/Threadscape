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
        { url: 'https://images.unsplash.com/photo-1510598195-cfbd96836797' },
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
  ]);

  console.log('Adding ratings...');
  // Add some ratings to products
  const allProducts = [...mensProducts, ...womensProducts, ...accessories];
  const allUsers = [...users, admin];
  
  for (const product of allProducts) {
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

  console.log('Adding items to carts...');
  // Add items to carts
  for (const user of [...users, admin]) {
    const numCartItems = Math.floor(Math.random() * 3);
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

  console.log('Database seeded successfully!');
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