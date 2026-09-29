import { TemplateItem } from '../types';

// Model 1: Aarav (Male)
import aaravBefore from '../assets/images/aarav_before_1790227490151.jpg';
import aaravExecAfter from '../assets/images/aarav_exec_after_1790227502899.jpg';
import aaravNoirAfter from '../assets/images/aarav_noir_after_1790227515442.jpg';
import aaravRoyalAfter from '../assets/images/aarav_royal_after_1790227528118.jpg';
import aaravPenthouseAfter from '../assets/images/aarav_penthouse_after_1790227608456.jpg';

// Model 2: Aditi (Female)
import aditiBefore from '../assets/images/aditi_before_1790227539553.jpg';
import aditiRoyalAfter from '../assets/images/aditi_royal_after_1790227553057.jpg';
import aditiSantoriniAfter from '../assets/images/aditi_santorini_1790227566396.jpg';
import aditiVogueAfter from '../assets/images/aditi_vogue_1790227580130.jpg';
import aditiCafeAfter from '../assets/images/aditi_cafe_1790227595453.jpg';
import aditiBeachAfter from '../assets/images/aditi_beach_after_1790227622384.jpg';

// Model 3: Vikram (Male)
import vikramBefore from '../assets/images/vikram_before_1790252169550.jpg';
import vikramLuxuryAfter from '../assets/images/vikram_after_luxury_1790252183641.jpg';
import vikramCyberAfter from '../assets/images/vikram_cyber_after_1790252198290.jpg';

// Model 4: Ananya (Female)
import ananyaBefore from '../assets/images/ananya_before_1790252210668.jpg';
import ananyaBridalAfter from '../assets/images/ananya_after_bridal_1790252223298.jpg';
import ananyaInstaAfter from '../assets/images/ananya_after_insta_1790252236897.jpg';

// Model 5: Kabir (Male)
import kabirBefore from '../assets/images/kabir_before_1790252273376.jpg';
import kabirViralAfter from '../assets/images/kabir_after_viral_1790252286512.jpg';
import kabirFitnessAfter from '../assets/images/kabir_fitness_after_1790252301524.jpg';

// Model 6: Meera (Female)
import meeraBefore from '../assets/images/meera_before_1790252314279.jpg';
import meeraTempleAfter from '../assets/images/meera_temple_after_1790252326870.jpg';
import meeraOldMoneyAfter from '../assets/images/meera_oldmoney_after_1790252340767.jpg';

/**
 * Clean, data-driven single template registry.
 * Each template has its own unique before and after transformation (no duplicates).
 */
export const TEMPLATES: TemplateItem[] = [
  // 1. Black Luxury Portrait (Aarav - Noir)
  {
    id: 'black-luxury-portrait',
    name: 'Black Luxury Portrait',
    category: 'royal',
    subCategory: 'Luxury & Rich Look',
    gender: 'male',
    description: 'Jet black silk background with rim lighting, tailored bespoke black tuxedo, and subtle golden highlights.',
    badge: '👑 Billionaire',
    personName: 'Aarav',
    promptSuggestion: 'Ultra-luxury black portrait photography, tailored jet black designer tuxedo, subtle warm gold rim light, cinematic studio bokeh',
    beforeImage: aaravBefore,
    afterImage: aaravNoirAfter,
    likesCount: 38400,
    likesDisplay: '38.4K',
    tags: ['luxury', 'black suit', 'rich look', 'boys', 'men', 'gold lighting'],
  },

  // 2. Billionaire Office Look (Aarav - Exec)
  {
    id: 'billionaire-office-look',
    name: 'Billionaire Office Look',
    category: 'professional',
    subCategory: 'Professional & Career',
    gender: 'male',
    description: 'High-rise executive corner office overlooking glass skyscrapers with charcoal pin-striped suit and luxury watch.',
    badge: '💼 Forbes Cover',
    personName: 'Aarav',
    promptSuggestion: 'Billionaire CEO executive portrait, bespoke charcoal tailored pinstripe suit, floor-to-ceiling Manhattan financial view, power stance',
    beforeImage: aaravBefore,
    afterImage: aaravExecAfter,
    likesCount: 29800,
    likesDisplay: '29.8K',
    tags: ['billionaire', 'office', 'ceo', 'suit', 'professional', 'men'],
  },

  // 3. Royal Indian Darbar (Aarav - Royal)
  {
    id: 'royal-indian-portrait',
    name: 'Royal Indian Darbar',
    category: 'royal',
    subCategory: 'Indian & Desi',
    gender: 'male',
    description: 'Grand royal palace court with antique sandstone arches, royal silk achkan, and majestic Rajput aura.',
    badge: '👑 Royal Darbar',
    personName: 'Aarav',
    promptSuggestion: 'Majestic Rajput royal king portrait in Udaipur palace courtyard, antique carved sandstone, handcrafted silk sherwani, uncut polki jewelry',
    beforeImage: aaravBefore,
    afterImage: aaravRoyalAfter,
    likesCount: 57800,
    likesDisplay: '57.8K',
    tags: ['royal', 'indian', 'desi', 'sherwani', 'rajasthani', 'palace'],
  },

  // 4. Penthouse Night Portrait (Aarav - Penthouse)
  {
    id: 'penthouse-night-portrait',
    name: 'Penthouse Night Portrait',
    category: 'creative',
    subCategory: 'Luxury & Rich Look',
    gender: 'male',
    description: 'Private penthouse balcony overlooking an illuminated neon cityscape at midnight with designer casual blazer.',
    badge: '🌃 Penthouse',
    personName: 'Aarav',
    promptSuggestion: 'Ultra-luxury penthouse balcony portrait at midnight, panoramic glass city skyline, warm architectural lighting, bespoke turtleneck',
    beforeImage: aaravBefore,
    afterImage: aaravPenthouseAfter,
    likesCount: 46200,
    likesDisplay: '46.2K',
    tags: ['penthouse', 'night', 'balcony', 'cityscape', 'boys'],
  },

  // 5. Royal Rajputana Princess (Aditi - Royal)
  {
    id: 'royal-rajputana-princess',
    name: 'Royal Rajputana Princess',
    category: 'royal',
    subCategory: 'Indian & Desi',
    gender: 'female',
    description: 'Palace courtyard portrait with hand-woven royal silk poshak, jadau jewelry, and ethereal royal radiance.',
    badge: '👑 Royal Princess',
    personName: 'Aditi',
    promptSuggestion: 'Grand Rajasthani royal princess portrait in heritage palace jharokha, pure silk embroidered poshak, antique kundan jewelry, soft palace golden light',
    beforeImage: aditiBefore,
    afterImage: aditiRoyalAfter,
    likesCount: 52400,
    likesDisplay: '52.4K',
    tags: ['royal', 'princess', 'rajputana', 'palace', 'heritage', 'girls'],
  },

  // 6. Santorini Island Cliff (Aditi - Santorini)
  {
    id: 'santorini-greek-island',
    name: 'Santorini Island Cliff',
    category: 'travel',
    subCategory: 'Lifestyle & Location',
    gender: 'female',
    description: 'Iconic white-washed Santorini cliffside with deep Aegean blue sea, azure domes, and radiant Mediterranean sun.',
    badge: '🇬🇷 Santorini',
    personName: 'Aditi',
    promptSuggestion: 'Pristine Santorini cliffside portrait, white Cycladic architecture, Aegean Sea horizon, elegant linen resort dress',
    beforeImage: aditiBefore,
    afterImage: aditiSantoriniAfter,
    likesCount: 53400,
    likesDisplay: '53.4K',
    tags: ['santorini', 'travel', 'vacation', 'location', 'greece'],
  },

  // 7. Haute Couture Vogue Cover (Aditi - Vogue)
  {
    id: 'haute-couture-vogue',
    name: 'Haute Couture Vogue Cover',
    category: 'fashion',
    subCategory: 'Artistic & AI Transformation',
    gender: 'female',
    description: 'Front-cover editorial studio portrait with striking directional beauty dish lighting and emerald gown.',
    badge: 'Vogue Cover',
    personName: 'Aditi',
    promptSuggestion: 'Vogue magazine cover fashion editorial portrait, high contrast beauty dish studio lighting, designer emerald green gown',
    beforeImage: aditiBefore,
    afterImage: aditiVogueAfter,
    likesCount: 47200,
    likesDisplay: '47.2K',
    tags: ['vogue', 'editorial', 'haute couture', 'fashion', 'magazine'],
  },

  // 8. Parisian Café Chic (Aditi - Cafe)
  {
    id: 'paris-cafe-aesthetic',
    name: 'Parisian Café Chic',
    category: 'social',
    subCategory: 'Lifestyle & Location',
    gender: 'female',
    description: 'Effortless Parisian sidewalk bistro marble table with warm morning latte and chic trench coat.',
    badge: '🥐 Paris Café',
    personName: 'Aditi',
    promptSuggestion: 'Effortless lifestyle portrait seated at vintage Parisian sidewalk cafe, soft morning dappled sunlight, stylish trench coat',
    beforeImage: aditiBefore,
    afterImage: aditiCafeAfter,
    likesCount: 49800,
    likesDisplay: '49.8K',
    tags: ['paris', 'cafe', 'lifestyle', 'travel', 'europe'],
  },

  // 9. Goa Beach Sunset (Aditi - Beach)
  {
    id: 'goa-beach-sunset',
    name: 'Goa Beach Sunset',
    category: 'travel',
    subCategory: 'Lifestyle & Location',
    gender: 'female',
    description: 'Warm golden sunset on Goa beach, palm trees gently swaying, gentle ocean surf, and relaxed vacation style.',
    badge: '🏖️ Goa Beach',
    personName: 'Aditi',
    promptSuggestion: 'Standing on Goa beach during sunset, golden hour warm rim light, gentle ocean waves crashing, relaxed coastal vacation outfit',
    beforeImage: aditiBefore,
    afterImage: aditiBeachAfter,
    likesCount: 71200,
    likesDisplay: '71.2K',
    tags: ['goa beach', 'beach', 'sunset', 'vacation', 'travel', 'location'],
  },

  // 10. Black Suit Gold Lighting & Supercar (Vikram - Luxury)
  {
    id: 'black-suit-gold-lighting',
    name: 'Black Suit — Gold Lighting',
    category: 'royal',
    subCategory: 'Luxury & Rich Look',
    gender: 'male',
    description: 'Editorial black suit styling illuminated by warm honey-gold volumetric light with high-end supercar backdrop.',
    badge: '💎 Gold Light',
    personName: 'Vikram',
    promptSuggestion: 'High fashion editorial male portrait in bespoke black three-piece suit, amber gold rim lighting, exotic matte black supercar background, 85mm lens',
    beforeImage: vikramBefore,
    afterImage: vikramLuxuryAfter,
    likesCount: 42100,
    likesDisplay: '42.1K',
    tags: ['black suit', 'gold lighting', 'boys', 'luxury', 'supercar', 'men'],
  },

  // 11. Cyber Future 2077 (Vikram - Cyberpunk)
  {
    id: 'cyberpunk-future-city',
    name: 'Cyber Future 2077',
    category: 'creative',
    subCategory: 'Artistic & AI Transformation',
    gender: 'male',
    description: 'Futuristic sci-fi mega-city with holographic billboards, neon rain reflections, and high-tech styling.',
    badge: '⚡ Cyberpunk',
    personName: 'Vikram',
    promptSuggestion: 'Futuristic cyberpunk neon metropolis portrait, holographic reflections, sleek high-tech jacket, cinematic blade runner aesthetic',
    beforeImage: vikramBefore,
    afterImage: vikramCyberAfter,
    likesCount: 56700,
    likesDisplay: '56.7K',
    tags: ['cyberpunk', 'futuristic', 'sci-fi', 'neon', 'artistic'],
  },

  // 12. Royal Sabyasachi Palace Bride (Ananya - Bridal)
  {
    id: 'sabyasachi-palace-bride',
    name: 'Royal Sabyasachi Palace Bride',
    category: 'wedding',
    subCategory: 'Wedding & Groom',
    gender: 'female',
    description: 'Majestic crimson red bridal lehenga with heavy antique gold zardozi embroidery and royal polki diamond choker.',
    badge: '👰 Royal Bride',
    personName: 'Ananya',
    promptSuggestion: 'Regal Indian bride portrait in grand palace courtyard, ruby red and antique gold zardozi embroidered lehenga, uncut diamond polki',
    beforeImage: ananyaBefore,
    afterImage: ananyaBridalAfter,
    likesCount: 65100,
    likesDisplay: '65.1K',
    tags: ['wedding', 'bride', 'lehenga', 'sabyasachi', 'royal'],
  },

  // 13. Golden Hour Sunset Profile (Ananya - Instagram)
  {
    id: 'golden-hour-cafe-profile',
    name: 'Golden Hour Sunset Profile',
    category: 'social',
    subCategory: 'Social Media & Profile',
    gender: 'female',
    description: 'Glowing warm golden hour sunset light kissing hair and skin at a sunlit aesthetic cafe.',
    badge: '✨ Golden Hour',
    personName: 'Ananya',
    promptSuggestion: 'Sun-drenched golden hour rooftop cafe lifestyle portrait, warm backlit glow through hair, effortless ivory linen shirt',
    beforeImage: ananyaBefore,
    afterImage: ananyaInstaAfter,
    likesCount: 58900,
    likesDisplay: '58.9K',
    tags: ['golden hour', 'instagram', 'profile', 'aesthetic', 'sunset'],
  },

  // 14. Urban Street King (Kabir - Viral)
  {
    id: 'urban-street-king',
    name: 'Urban Street King',
    category: 'trending',
    subCategory: 'Streetwear',
    gender: 'male',
    description: 'Raw city street vibe with oversized streetwear, retro chunky sneakers, and confident urban king demeanor.',
    badge: '🔥 Street King',
    personName: 'Kabir',
    promptSuggestion: 'Urban street king portrait on Mumbai promenade, oversized streetwear jacket, vintage shades, golden hour bokeh',
    beforeImage: kabirBefore,
    afterImage: kabirViralAfter,
    likesCount: 39100,
    likesDisplay: '39.1K',
    tags: ['streetwear', 'street king', 'urban', 'boys', 'oversized'],
  },

  // 15. Cricket Matchday Portrait (Kabir - Fitness)
  {
    id: 'cricket-matchday-portrait',
    name: 'Cricket Matchday Portrait',
    category: 'fitness',
    subCategory: 'Sports & Motorsport',
    gender: 'male',
    description: 'Heroic cricket athlete portrait under floodlights with official jersey look and roaring stadium atmosphere.',
    badge: '🏏 Cricket Star',
    personName: 'Kabir',
    promptSuggestion: 'Indian cricket athlete hero portrait under bright stadium floodlights, national athletic jersey, mist and bokeh',
    beforeImage: kabirBefore,
    afterImage: kabirFitnessAfter,
    likesCount: 62800,
    likesDisplay: '62.8K',
    tags: ['cricket', 'sports', 'matchday', 'athlete', 'stadium', 'boys'],
  },

  // 16. Temple Kanjeevaram Heritage (Meera - Temple)
  {
    id: 'temple-kanjeevaram-heritage',
    name: 'Temple Kanjeevaram Heritage',
    category: 'royal',
    subCategory: 'Indian & Desi',
    gender: 'female',
    description: 'Pure woven gold zari Kanjeevaram silk saree with ancient temple pillars and warm ceremonial diya bokeh.',
    badge: '🪔 Temple Heritage',
    personName: 'Meera',
    promptSuggestion: 'Grand temple corridor portrait, pure mulberry silk Kanjeevaram saree with rich gold zari border, antique temple jewelry',
    beforeImage: meeraBefore,
    afterImage: meeraTempleAfter,
    likesCount: 48300,
    likesDisplay: '48.3K',
    tags: ['temple', 'kanjeevaram', 'saree', 'desi', 'heritage'],
  },

  // 17. Old-Money Classic (Meera - Old Money)
  {
    id: 'old-money-classic',
    name: 'Old-Money Classic',
    category: 'fashion',
    subCategory: 'Luxury & Rich Look',
    gender: 'female',
    description: 'Timeless quiet luxury aesthetic featuring cream cashmere knit, vintage polo club lawn, and aristocratic poise.',
    badge: 'Old Money',
    personName: 'Meera',
    promptSuggestion: 'Old-money quiet luxury female aesthetic portrait, cream cashmere sweater, heritage country club estate, soft afternoon natural light',
    beforeImage: meeraBefore,
    afterImage: meeraOldMoneyAfter,
    likesCount: 41800,
    likesDisplay: '41.8K',
    tags: ['old money', 'classic', 'luxury', 'girls', 'quiet luxury'],
  },
];
