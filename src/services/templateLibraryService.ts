/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dynamic Template Library Service
 * Loads photo & video templates dynamically from /template-library/
 * Any new folder uploaded with template.json is automatically discovered!
 */

export interface DynamicTemplate {
  id: string;
  type: 'photo' | 'video';
  name: string;
  category: string;
  subCategory?: string;
  gender?: 'male' | 'female' | 'unisex';
  description: string;
  badge?: string;
  previewPath: string;
  coverPath?: string;
  beforePath?: string;
  afterPath?: string;
  videoPath?: string;
  prompt: string;
  creditCost: number;
  featured?: boolean;
  sortPriority?: number;
  isActive: boolean;
  likesCount?: number;
  tags?: string[];
}

export interface TemplateLibraryResponse {
  success: boolean;
  count: number;
  photoTemplates: DynamicTemplate[];
  videoTemplates: DynamicTemplate[];
}

// Fallback static manifest for immediate synchronous availability
export const BUNDLED_PHOTO_TEMPLATES: DynamicTemplate[] = [
  {
    id: 'black-luxury-portrait',
    type: 'photo',
    name: 'Black Luxury Portrait',
    category: 'royal',
    subCategory: 'Luxury & Rich Look',
    gender: 'male',
    description: 'Jet black silk background with rim lighting, tailored bespoke black tuxedo, and subtle golden highlights.',
    badge: '👑 Billionaire',
    previewPath: '/template-library/photo/black-luxury-portrait/preview.jpg',
    beforePath: '/template-library/photo/black-luxury-portrait/before.jpg',
    afterPath: '/template-library/photo/black-luxury-portrait/after.jpg',
    prompt: 'Ultra-luxury black portrait photography, tailored jet black designer tuxedo, subtle warm gold rim light, cinematic studio bokeh',
    creditCost: 50,
    featured: true,
    sortPriority: 1,
    isActive: true,
    likesCount: 38400,
    tags: ['luxury', 'black suit', 'rich look', 'boys', 'men', 'gold lighting'],
  },
  {
    id: 'billionaire-office-look',
    type: 'photo',
    name: 'Billionaire Office Look',
    category: 'professional',
    subCategory: 'Professional & Career',
    gender: 'male',
    description: 'High-rise executive corner office overlooking glass skyscrapers with charcoal pin-striped suit and luxury watch.',
    badge: '💼 Forbes Cover',
    previewPath: '/template-library/photo/billionaire-office-look/preview.jpg',
    beforePath: '/template-library/photo/billionaire-office-look/before.jpg',
    afterPath: '/template-library/photo/billionaire-office-look/after.jpg',
    prompt: 'Billionaire CEO executive portrait, bespoke charcoal tailored pinstripe suit, floor-to-ceiling Manhattan financial view, power stance',
    creditCost: 50,
    featured: false,
    sortPriority: 2,
    isActive: true,
    likesCount: 29800,
    tags: ['billionaire', 'office', 'ceo', 'suit', 'professional', 'men'],
  },
  {
    id: 'royal-indian-portrait',
    type: 'photo',
    name: 'Royal Indian Darbar',
    category: 'royal',
    subCategory: 'Indian & Desi',
    gender: 'male',
    description: 'Grand royal palace court with antique sandstone arches, royal silk achkan, and majestic Rajput aura.',
    badge: '👑 Royal Darbar',
    previewPath: '/template-library/photo/royal-indian-portrait/preview.jpg',
    beforePath: '/template-library/photo/royal-indian-portrait/before.jpg',
    afterPath: '/template-library/photo/royal-indian-portrait/after.jpg',
    prompt: 'Majestic Rajput royal king portrait in Udaipur palace courtyard, antique carved sandstone, handcrafted silk sherwani, uncut polki jewelry',
    creditCost: 50,
    featured: true,
    sortPriority: 3,
    isActive: true,
    likesCount: 57800,
    tags: ['royal', 'indian', 'desi', 'sherwani', 'rajasthani', 'palace'],
  },
  {
    id: 'penthouse-night-portrait',
    type: 'photo',
    name: 'Penthouse Night Portrait',
    category: 'creative',
    subCategory: 'Luxury & Rich Look',
    gender: 'male',
    description: 'Private penthouse balcony overlooking an illuminated neon cityscape at midnight with designer casual blazer.',
    badge: '🌃 Penthouse',
    previewPath: '/template-library/photo/penthouse-night-portrait/preview.jpg',
    beforePath: '/template-library/photo/penthouse-night-portrait/before.jpg',
    afterPath: '/template-library/photo/penthouse-night-portrait/after.jpg',
    prompt: 'Ultra-luxury penthouse balcony portrait at midnight, panoramic glass city skyline, warm architectural lighting, bespoke turtleneck',
    creditCost: 50,
    featured: false,
    sortPriority: 4,
    isActive: true,
    likesCount: 46200,
    tags: ['penthouse', 'night', 'balcony', 'cityscape', 'boys'],
  },
  {
    id: 'royal-rajputana-princess',
    type: 'photo',
    name: 'Royal Rajputana Princess',
    category: 'royal',
    subCategory: 'Indian & Desi',
    gender: 'female',
    description: 'Palace courtyard portrait with hand-woven royal silk poshak, jadau jewelry, and ethereal royal radiance.',
    badge: '👑 Royal Princess',
    previewPath: '/template-library/photo/royal-rajputana-princess/preview.jpg',
    beforePath: '/template-library/photo/royal-rajputana-princess/before.jpg',
    afterPath: '/template-library/photo/royal-rajputana-princess/after.jpg',
    prompt: 'Grand Rajasthani royal princess portrait in heritage palace jharokha, pure silk embroidered poshak, antique kundan jewelry, soft palace golden light',
    creditCost: 50,
    featured: true,
    sortPriority: 5,
    isActive: true,
    likesCount: 52400,
    tags: ['royal', 'princess', 'rajputana', 'palace', 'heritage', 'girls'],
  },
  {
    id: 'santorini-greek-island',
    type: 'photo',
    name: 'Santorini Island Cliff',
    category: 'travel',
    subCategory: 'Lifestyle & Location',
    gender: 'female',
    description: 'Iconic white-washed Santorini cliffside with deep Aegean blue sea, azure domes, and radiant Mediterranean sun.',
    badge: '🇬🇷 Santorini',
    previewPath: '/template-library/photo/santorini-greek-island/preview.jpg',
    beforePath: '/template-library/photo/santorini-greek-island/before.jpg',
    afterPath: '/template-library/photo/santorini-greek-island/after.jpg',
    prompt: 'Pristine Santorini cliffside portrait, white Cycladic architecture, Aegean Sea horizon, elegant linen resort dress',
    creditCost: 50,
    featured: false,
    sortPriority: 6,
    isActive: true,
    likesCount: 53400,
    tags: ['santorini', 'travel', 'vacation', 'location', 'greece'],
  },
  {
    id: 'haute-couture-vogue',
    type: 'photo',
    name: 'Haute Couture Vogue Cover',
    category: 'fashion',
    subCategory: 'Artistic & AI Transformation',
    gender: 'female',
    description: 'Front-cover editorial studio portrait with striking directional beauty dish lighting and emerald gown.',
    badge: 'Vogue Cover',
    previewPath: '/template-library/photo/haute-couture-vogue/preview.jpg',
    beforePath: '/template-library/photo/haute-couture-vogue/before.jpg',
    afterPath: '/template-library/photo/haute-couture-vogue/after.jpg',
    prompt: 'Vogue magazine cover fashion editorial portrait, high contrast beauty dish studio lighting, designer emerald green gown',
    creditCost: 50,
    featured: true,
    sortPriority: 7,
    isActive: true,
    likesCount: 47200,
    tags: ['vogue', 'editorial', 'haute couture', 'fashion', 'magazine'],
  },
  {
    id: 'paris-cafe-aesthetic',
    type: 'photo',
    name: 'Parisian Café Chic',
    category: 'social',
    subCategory: 'Lifestyle & Location',
    gender: 'female',
    description: 'Effortless Parisian sidewalk bistro marble table with warm morning latte and chic trench coat.',
    badge: '🥐 Paris Café',
    previewPath: '/template-library/photo/paris-cafe-aesthetic/preview.jpg',
    beforePath: '/template-library/photo/paris-cafe-aesthetic/before.jpg',
    afterPath: '/template-library/photo/paris-cafe-aesthetic/after.jpg',
    prompt: 'Effortless lifestyle portrait seated at vintage Parisian sidewalk cafe, soft morning dappled sunlight, stylish trench coat',
    creditCost: 50,
    featured: false,
    sortPriority: 8,
    isActive: true,
    likesCount: 49800,
    tags: ['paris', 'cafe', 'lifestyle', 'travel', 'europe'],
  },
  {
    id: 'goa-beach-sunset',
    type: 'photo',
    name: 'Goa Beach Sunset',
    category: 'travel',
    subCategory: 'Lifestyle & Location',
    gender: 'female',
    description: 'Warm golden sunset on Goa beach, palm trees gently swaying, gentle ocean surf, and relaxed vacation style.',
    badge: '🏖️ Goa Beach',
    previewPath: '/template-library/photo/goa-beach-sunset/preview.jpg',
    beforePath: '/template-library/photo/goa-beach-sunset/before.jpg',
    afterPath: '/template-library/photo/goa-beach-sunset/after.jpg',
    prompt: 'Standing on Goa beach during sunset, golden hour warm rim light, gentle ocean waves crashing, relaxed coastal vacation outfit',
    creditCost: 50,
    featured: true,
    sortPriority: 9,
    isActive: true,
    likesCount: 71200,
    tags: ['goa beach', 'beach', 'sunset', 'vacation', 'travel', 'location'],
  },
  {
    id: 'black-suit-gold-lighting',
    type: 'photo',
    name: 'Black Suit — Gold Lighting',
    category: 'royal',
    subCategory: 'Luxury & Rich Look',
    gender: 'male',
    description: 'Editorial black suit styling illuminated by warm honey-gold volumetric light with high-end supercar backdrop.',
    badge: '💎 Gold Light',
    previewPath: '/template-library/photo/black-suit-gold-lighting/preview.jpg',
    beforePath: '/template-library/photo/black-suit-gold-lighting/before.jpg',
    afterPath: '/template-library/photo/black-suit-gold-lighting/after.jpg',
    prompt: 'High fashion editorial male portrait in bespoke black three-piece suit, amber gold rim lighting, exotic matte black supercar background, 85mm lens',
    creditCost: 50,
    featured: true,
    sortPriority: 10,
    isActive: true,
    likesCount: 42100,
    tags: ['black suit', 'gold lighting', 'boys', 'luxury', 'supercar', 'men'],
  },
  {
    id: 'cyberpunk-future-city',
    type: 'photo',
    name: 'Cyber Future 2077',
    category: 'creative',
    subCategory: 'Artistic & AI Transformation',
    gender: 'male',
    description: 'Futuristic sci-fi mega-city with holographic billboards, neon rain reflections, and high-tech styling.',
    badge: '⚡ Cyberpunk',
    previewPath: '/template-library/photo/cyberpunk-future-city/preview.jpg',
    beforePath: '/template-library/photo/cyberpunk-future-city/before.jpg',
    afterPath: '/template-library/photo/cyberpunk-future-city/after.jpg',
    prompt: 'Futuristic cyberpunk neon metropolis portrait, holographic reflections, sleek high-tech jacket, cinematic blade runner aesthetic',
    creditCost: 50,
    featured: false,
    sortPriority: 11,
    isActive: true,
    likesCount: 56700,
    tags: ['cyberpunk', 'futuristic', 'sci-fi', 'neon', 'artistic'],
  },
  {
    id: 'sabyasachi-palace-bride',
    type: 'photo',
    name: 'Royal Sabyasachi Palace Bride',
    category: 'wedding',
    subCategory: 'Wedding & Groom',
    gender: 'female',
    description: 'Majestic crimson red bridal lehenga with heavy antique gold zardozi embroidery and royal polki diamond choker.',
    badge: '👰 Royal Bride',
    previewPath: '/template-library/photo/sabyasachi-palace-bride/preview.jpg',
    beforePath: '/template-library/photo/sabyasachi-palace-bride/before.jpg',
    afterPath: '/template-library/photo/sabyasachi-palace-bride/after.jpg',
    prompt: 'Regal Indian bride portrait in grand palace courtyard, ruby red and antique gold zardozi embroidered lehenga, uncut diamond polki',
    creditCost: 50,
    featured: true,
    sortPriority: 12,
    isActive: true,
    likesCount: 65100,
    tags: ['wedding', 'bride', 'lehenga', 'sabyasachi', 'royal'],
  },
  {
    id: 'golden-hour-cafe-profile',
    type: 'photo',
    name: 'Golden Hour Sunset Profile',
    category: 'social',
    subCategory: 'Social Media & Profile',
    gender: 'female',
    description: 'Glowing warm golden hour sunset light kissing hair and skin at a sunlit aesthetic cafe.',
    badge: '✨ Golden Hour',
    previewPath: '/template-library/photo/golden-hour-cafe-profile/preview.jpg',
    beforePath: '/template-library/photo/golden-hour-cafe-profile/before.jpg',
    afterPath: '/template-library/photo/golden-hour-cafe-profile/after.jpg',
    prompt: 'Sun-drenched golden hour rooftop cafe lifestyle portrait, warm backlit glow through hair, effortless ivory linen shirt',
    creditCost: 50,
    featured: false,
    sortPriority: 13,
    isActive: true,
    likesCount: 58900,
    tags: ['golden hour', 'instagram', 'profile', 'aesthetic', 'sunset'],
  },
  {
    id: 'urban-street-king',
    type: 'photo',
    name: 'Urban Street King',
    category: 'trending',
    subCategory: 'Streetwear',
    gender: 'male',
    description: 'Raw city street vibe with oversized streetwear, retro chunky sneakers, and confident urban king demeanor.',
    badge: '🔥 Street King',
    previewPath: '/template-library/photo/urban-street-king/preview.jpg',
    beforePath: '/template-library/photo/urban-street-king/before.jpg',
    afterPath: '/template-library/photo/urban-street-king/after.jpg',
    prompt: 'Urban street king portrait on Mumbai promenade, oversized streetwear jacket, vintage shades, golden hour bokeh',
    creditCost: 50,
    featured: false,
    sortPriority: 14,
    isActive: true,
    likesCount: 39100,
    tags: ['streetwear', 'street king', 'urban', 'boys', 'oversized'],
  },
  {
    id: 'cricket-matchday-portrait',
    type: 'photo',
    name: 'Cricket Matchday Portrait',
    category: 'fitness',
    subCategory: 'Sports & Motorsport',
    gender: 'male',
    description: 'Heroic cricket athlete portrait under floodlights with official jersey look and roaring stadium atmosphere.',
    badge: '🏏 Cricket Star',
    previewPath: '/template-library/photo/cricket-matchday-portrait/preview.jpg',
    beforePath: '/template-library/photo/cricket-matchday-portrait/before.jpg',
    afterPath: '/template-library/photo/cricket-matchday-portrait/after.jpg',
    prompt: 'Indian cricket athlete hero portrait under bright stadium floodlights, national athletic jersey, mist and bokeh',
    creditCost: 50,
    featured: true,
    sortPriority: 15,
    isActive: true,
    likesCount: 62800,
    tags: ['cricket', 'sports', 'matchday', 'athlete', 'stadium', 'boys'],
  },
  {
    id: 'temple-kanjeevaram-heritage',
    type: 'photo',
    name: 'Temple Kanjeevaram Heritage',
    category: 'royal',
    subCategory: 'Indian & Desi',
    gender: 'female',
    description: 'Pure woven gold zari Kanjeevaram silk saree with ancient temple pillars and warm ceremonial diya bokeh.',
    badge: '🪔 Temple Heritage',
    previewPath: '/template-library/photo/temple-kanjeevaram-heritage/preview.jpg',
    beforePath: '/template-library/photo/temple-kanjeevaram-heritage/before.jpg',
    afterPath: '/template-library/photo/temple-kanjeevaram-heritage/after.jpg',
    prompt: 'Grand temple corridor portrait, pure mulberry silk Kanjeevaram saree with rich gold zari border, antique temple jewelry',
    creditCost: 50,
    featured: false,
    sortPriority: 16,
    isActive: true,
    likesCount: 48300,
    tags: ['temple', 'kanjeevaram', 'saree', 'desi', 'heritage'],
  },
  {
    id: 'old-money-classic',
    type: 'photo',
    name: 'Old-Money Classic',
    category: 'fashion',
    subCategory: 'Luxury & Rich Look',
    gender: 'female',
    description: 'Timeless quiet luxury aesthetic featuring cream cashmere knit, vintage polo club lawn, and aristocratic poise.',
    badge: 'Old Money',
    previewPath: '/template-library/photo/old-money-classic/preview.jpg',
    beforePath: '/template-library/photo/old-money-classic/before.jpg',
    afterPath: '/template-library/photo/old-money-classic/after.jpg',
    prompt: 'Old-money quiet luxury female aesthetic portrait, cream cashmere sweater, heritage country club estate, soft afternoon natural light',
    creditCost: 50,
    featured: false,
    sortPriority: 17,
    isActive: true,
    likesCount: 41800,
    tags: ['old money', 'classic', 'luxury', 'girls', 'quiet luxury'],
  },
];

export const BUNDLED_VIDEO_TEMPLATES: DynamicTemplate[] = [
  {
    id: 'face-swap-bollywood-star',
    type: 'video',
    name: 'Bollywood Star Face-Swap Video',
    category: 'face_swap',
    subCategory: 'Face Swap Video (Photo to Video)',
    description: 'Swap your normal facial photo into a high-octane Bollywood cinematic slow-motion video. Seamless neural face blending.',
    badge: '🎭 Viral Face Swap',
    previewPath: '/template-library/video/face-swap-bollywood-star/cover.jpg',
    coverPath: '/template-library/video/face-swap-bollywood-star/cover.jpg',
    videoPath: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-lights-39878-large.mp4',
    prompt: 'High fidelity face swap into royal Bollywood wedding hero entry video, cinematic slow motion, golden firework bokeh',
    creditCost: 150,
    featured: true,
    sortPriority: 1,
    isActive: true,
    likesCount: 88400,
    tags: ['face swap', 'bollywood', 'video', 'photo to video', 'slow motion'],
  },
  {
    id: 'image-to-cinematic-movie',
    type: 'video',
    name: 'Image to Cinematic Movie Trailer',
    category: 'image_to_video',
    subCategory: 'Image to Video Motion',
    description: 'Turn any static Indian portrait into a Hollywood & Bollywood level cinematic camera push-in movie scene.',
    badge: '🎬 Movie Magic',
    previewPath: '/template-library/video/image-to-cinematic-movie/cover.jpg',
    coverPath: '/template-library/video/image-to-cinematic-movie/cover.jpg',
    videoPath: 'https://assets.mixkit.co/videos/preview/mixkit-girl-walking-on-the-beach-at-sunset-1250-large.mp4',
    prompt: 'Cinematic slow zoom camera push-in, natural facial expressions, subtle blinking, atmospheric haze and warm anamorphic flare',
    creditCost: 120,
    featured: true,
    sortPriority: 2,
    isActive: true,
    likesCount: 76200,
    tags: ['image to video', 'cinematic', 'movie', 'motion', 'animation'],
  },
  {
    id: 'supercar-neon-night-drive',
    type: 'video',
    name: 'Supercar Neon Midnight Chase',
    category: 'video_to_video',
    subCategory: 'Video-to-Video Restyling',
    description: 'Transform regular street driving footage into a fast & furious neon cyber chase with ultra-glossy lighting reflections.',
    badge: '🏎️ Neon Chase',
    previewPath: '/template-library/video/supercar-neon-night-drive/cover.jpg',
    coverPath: '/template-library/video/supercar-neon-night-drive/cover.jpg',
    videoPath: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-at-night-in-a-big-city-4315-large.mp4',
    prompt: 'Midnight Dubai neon highway supercar chase, wet asphalt neon reflections, dynamic motion blur, 4K cinematic 60fps',
    creditCost: 140,
    featured: true,
    sortPriority: 3,
    isActive: true,
    likesCount: 64900,
    tags: ['supercar', 'video to video', 'neon', 'night drive', 'chase'],
  },
  {
    id: 'royal-palace-heritage-drone',
    type: 'video',
    name: 'Royal Palace Heritage Orbit',
    category: 'text_to_video',
    subCategory: 'Text-to-Video Motion',
    description: 'Breathtaking 360-degree drone orbit around a grand Rajasthani illuminated heritage palace at twilight.',
    badge: '👑 Royal Drone',
    previewPath: '/template-library/video/royal-palace-heritage-drone/cover.jpg',
    coverPath: '/template-library/video/royal-palace-heritage-drone/cover.jpg',
    videoPath: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxurious-hotel-at-sunset-41481-large.mp4',
    prompt: 'Smooth 360 drone orbit around illuminated Udaipur Lake Palace at twilight, reflected water ripples, royal festive torches',
    creditCost: 110,
    featured: false,
    sortPriority: 4,
    isActive: true,
    likesCount: 52100,
    tags: ['palace', 'drone', 'heritage', 'text to video', 'rajasthan'],
  },
  {
    id: 'party-glamour-slowmo',
    type: 'video',
    name: 'Party Glamour VIP Slow-Mo',
    category: 'image_to_video',
    subCategory: 'Image to Video Motion',
    description: 'Bring any glamorous party photo to life with slow-motion champagne toast, glittering lights, and joyful smiles.',
    badge: '✨ VIP Party',
    previewPath: '/template-library/video/party-glamour-slowmo/cover.jpg',
    coverPath: '/template-library/video/party-glamour-slowmo/cover.jpg',
    videoPath: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-champagne-glasses-and-toasting-at-a-party-41712-large.mp4',
    prompt: 'Ultra-luxurious VIP lounge party, slow-motion golden confetti falling, soft bokeh lights, stylish toast',
    creditCost: 120,
    featured: false,
    sortPriority: 5,
    isActive: true,
    likesCount: 48700,
    tags: ['party', 'image to video', 'slow motion', 'vip', 'champagne'],
  },
];

class TemplateLibraryService {
  private cache: {
    photo: DynamicTemplate[];
    video: DynamicTemplate[];
    lastFetched: number;
  } = {
    photo: BUNDLED_PHOTO_TEMPLATES,
    video: BUNDLED_VIDEO_TEMPLATES,
    lastFetched: 0,
  };

  /**
   * Automatically queries server for dynamic templates discovered from /template-library/
   */
  async loadTemplates(forceRefresh = false): Promise<{ photo: DynamicTemplate[]; video: DynamicTemplate[] }> {
    const now = Date.now();
    // Cache for 60 seconds unless forceRefresh
    if (!forceRefresh && this.cache.lastFetched > 0 && now - this.cache.lastFetched < 60000) {
      return { photo: this.cache.photo, video: this.cache.video };
    }

    try {
      const res = await fetch('/api/template-library/templates', { cache: 'no-cache' });
      if (res.ok) {
        const data: TemplateLibraryResponse = await res.json();
        if (data.success) {
          if (Array.isArray(data.photoTemplates) && data.photoTemplates.length > 0) {
            this.cache.photo = data.photoTemplates;
          }
          if (Array.isArray(data.videoTemplates) && data.videoTemplates.length > 0) {
            this.cache.video = data.videoTemplates;
          }
          this.cache.lastFetched = now;
        }
      }
    } catch {
      // Fallback remains active
    }

    return { photo: this.cache.photo, video: this.cache.video };
  }

  getPhotoTemplates(): DynamicTemplate[] {
    return this.cache.photo;
  }

  getVideoTemplates(): DynamicTemplate[] {
    return this.cache.video;
  }

  getTemplateById(id: string): DynamicTemplate | undefined {
    return [...this.cache.photo, ...this.cache.video].find((t) => t.id === id);
  }
}

export const templateLibraryService = new TemplateLibraryService();
