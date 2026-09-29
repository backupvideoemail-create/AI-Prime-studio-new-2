import { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹499',
    credits: 50,
    period: 'one-time',
    badge: 'Beginner',
    features: [
      '50 High-Res AI Portrait Generations',
      'All 12+ Premium Photo Studio Templates',
      'Custom Prompt AI Re-styling',
      'Unlimited AI Character Chats',
      'Standard Processing Queue',
    ],
  },
  {
    id: 'popular',
    name: 'Popular Creator',
    price: '₹999',
    credits: 150,
    period: 'monthly',
    popular: true,
    badge: 'Most Popular',
    features: [
      '150 Ultra-HD 4K Studio Generations',
      'All Current & Upcoming Templates',
      'Exclusive AI Character VIP Personas',
      'Priority High-Speed Server GPU Queue',
      'Commercial Usage License',
      'Early Access to Video Face Swap (Beta)',
    ],
  },
  {
    id: 'premium',
    name: 'Royal Elite Studio',
    price: '₹2,499',
    credits: 500,
    period: 'quarterly',
    badge: 'Studio Pro',
    features: [
      '500 Maximum-Fidelity Studio Renders',
      'Infinite Persona Customizations',
      'Lossless TIFF & PNG Master Downloads',
      'Instant Zero-Wait GPU Pipeline',
      'Dedicated 1-on-1 Creative Support',
      'Future Live Voice Integration Included',
    ],
  },
];
