import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarECommerceComponent } from "../../../shared/UI/navbar-e-commerce/navbar-e-commerce.component";

interface ProductImage {
  url: string;
  alt: string;
}

interface ColorOption {
  name: string;
  value: string;
  hex: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule, NavbarECommerceComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  productId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get product ID from route parameters
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      // Here you can load product data based on the ID
      // For now, we'll use static data
      if (this.productId) {
        console.log('Product ID:', this.productId);
        // TODO: Load product data from API based on ID
        // this.loadProductData(this.productId);
      } else {
        console.log('No product ID provided, showing default product');
      }
    });
  }
  // Product data
  product = {
    name: 'Modern Ergonomic Office Chair',
    tagline: 'Experience unparalleled comfort and support for long workdays.',
    rating: 5,
    reviewsCount: 125,
    currentPrice: 349.99,
    originalPrice: 499.00,
    inStock: true,
    stockQuantity: 45,
    description: `Discover the pinnacle of comfort and productivity with our Modern Ergonomic Office Chair. Engineered to provide optimal support for your body, this chair is designed to keep you comfortable and focused throughout your longest workdays. The breathable mesh back promotes air circulation, keeping you cool and comfortable, while the adjustable lumbar support helps maintain a healthy posture.
    
With a full range of adjustments including seat height, armrest position, and tilt tension, you can customize the chair to fit your unique body and preferences. The sturdy five-star base and smooth-rolling casters provide stability and mobility, allowing you to move effortlessly around your workspace. Crafted from high-quality materials, this chair is not only built to last but also adds a touch of modern sophistication to any office environment.`,
    specifications: {
      material: 'Mesh, Metal, Plastic',
      dimensions: '26" W x 26" D x 40-44" H',
      weight: '35 lbs',
      color: 'Charcoal Grey, Light Blue-Grey, Light Blue',
      warranty: '5 years',
      assembly: 'Required'
    }
  };

  // Product images
  productImages: ProductImage[] = [
    {
      url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop',
      alt: 'Modern Ergonomic Office Chair front view'
    },
    {
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop',
      alt: 'Modern Ergonomic Office Chair back view'
    },
    {
      url: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=800&fit=crop',
      alt: 'Modern Ergonomic Office Chair side view'
    },
    {
      url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop',
      alt: 'Modern Ergonomic Office Chair angle view'
    }
  ];

  selectedImageIndex = signal(0);
  selectedColor = signal('Charcoal Grey');
  quantity = signal(1);
  activeTab = signal<'description' | 'specifications' | 'reviews'>('description');

  colorOptions: ColorOption[] = [
    { name: 'Charcoal Grey', value: 'charcoal-grey', hex: '#36454F' },
    { name: 'Light Blue-Grey', value: 'light-blue-grey', hex: '#B0C4DE' },
    { name: 'Light Blue', value: 'light-blue', hex: '#87CEEB' }
  ];

  relatedProducts: RelatedProduct[] = [
    {
      id: 1,
      name: 'Adjustable Standing Desk',
      price: 599.00,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'LED Desk Lamp',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Ergonomic Mouse',
      price: 45.50,
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop'
    },
    {
      id: 4,
      name: 'Cable Management Tray',
      price: 29.00,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
    }
  ];

  get selectedImage() {
    return this.productImages[this.selectedImageIndex()];
  }

  get discountPercentage() {
    return Math.round(((this.product.originalPrice - this.product.currentPrice) / this.product.originalPrice) * 100);
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
  }

  increaseQuantity() {
    this.quantity.update(q => q + 1);
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  setTab(tab: 'description' | 'specifications' | 'reviews') {
    this.activeTab.set(tab);
  }

  addToCart() {
    console.log('Added to cart:', {
      product: this.product.name,
      color: this.selectedColor(),
      quantity: this.quantity(),
      price: this.product.currentPrice
    });
    // TODO: Implement cart functionality
  }

  addToWishlist() {
    console.log('Added to wishlist:', this.product.name);
    // TODO: Implement wishlist functionality
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }
}
