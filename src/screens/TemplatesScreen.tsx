import React, { useState, useMemo, useEffect } from 'react';
import { ScreenRoute, TemplateCategory, TemplateItem } from '../types';
import { useLanguage } from '../i18n';
import { templateLibraryService, DynamicTemplate } from '../services/templateLibraryService';
import { BeforeAfterSlider } from '../components/photo-studio/BeforeAfterSlider';
import { storageService } from '../services/storageService';
import {
  Sparkles,
  ArrowRight,
  Search,
  X,
  Heart,
  Sliders,
  CheckCircle2,
  Tag,
  Wand2,
  RefreshCw,
  TrendingUp,
  Star,
  Clock,
} from 'lucide-react';

interface TemplatesScreenProps {
  onRouteChange: (route: ScreenRoute) => void;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplatesScreen: React.FC<TemplatesScreenProps> = ({
  onRouteChange,
  onSelectTemplate,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'popular' | 'featured'>('priority');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedTemplates, setLikedTemplates] = useState<Record<string, boolean>>(() =>
    storageService.getLikedTemplates()
  );

  // Dynamic Photo Templates from /template-library/photo/
  const [photoTemplates, setPhotoTemplates] = useState<DynamicTemplate[]>(() =>
    templateLibraryService.getPhotoTemplates()
  );

  useEffect(() => {
    templateLibraryService.loadTemplates().then(({ photo }) => {
      if (photo && photo.length > 0) {
        setPhotoTemplates(photo);
      }
    });
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { photo } = await templateLibraryService.loadTemplates(true);
      if (photo && photo.length > 0) {
        setPhotoTemplates(photo);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'all', label: language === 'hi' ? '⭐ सभी स्टाइल्स' : '⭐ All Styles' },
    { id: 'royal', label: language === 'hi' ? '👑 लक्जरी व रॉयल्टी' : '👑 Luxury & Royalty' },
    { id: 'trending', label: language === 'hi' ? '🔥 स्ट्रीटवियर व सुपरकार' : '🔥 Streetwear & Supercar' },
    { id: 'professional', label: language === 'hi' ? '💼 लिंक्डइन व सीईओ' : '💼 LinkedIn & CEO' },
    { id: 'cinematic', label: language === 'hi' ? '🎬 बॉलीवुड व 80s रेट्रो' : '🎬 Bollywood & 80s Retro' },
    { id: 'wedding', label: language === 'hi' ? '💍 शादी व ग्रूम शेरवानी' : '💍 Wedding & Groom' },
    { id: 'travel', label: language === 'hi' ? '🏖️ गोवा बीच व लोकेशन' : '🏖️ Goa Beach & Travel' },
    { id: 'fitness', label: language === 'hi' ? '🏏 स्पोर्ट्स व क्रिकेट' : '🏏 Cricket & Sports' },
    { id: 'social', label: language === 'hi' ? '📸 इंस्टाग्राम प्रोफाइल' : '📸 Instagram Profile' },
    { id: 'creative', label: language === 'hi' ? '✨ साइबर फ्यूचर' : '✨ Cyber Future' },
    { id: 'fashion', label: language === 'hi' ? '🕶️ वोग मैगजीन' : '🕶️ Vogue Fashion' },
  ];

  const suggestedTags = [
    { label: language === 'hi' ? '🏖️ गोवा बीच' : '🏖️ Goa Beach', query: 'goa' },
    { label: language === 'hi' ? '👑 ब्लैक लक्जरी' : '👑 Black Luxury', query: 'black' },
    { label: language === 'hi' ? '🏎️ सुपरकार दुबई' : '🏎️ Supercar', query: 'supercar' },
    { label: language === 'hi' ? '💼 लिंक्डइन हेडशॉट' : '💼 LinkedIn', query: 'linkedin' },
    { label: language === 'hi' ? '📼 1980s रेट्रो' : '📼 1980s Retro', query: '1980s' },
    { label: language === 'hi' ? '🏏 क्रिकेट मैचडे' : '🏏 Cricket', query: 'cricket' },
    { label: language === 'hi' ? '💍 रॉयल ग्रूम' : '💍 Groom', query: 'groom' },
    { label: language === 'hi' ? '🔥 स्ट्रीटवियर किंग' : '🔥 Streetwear', query: 'streetwear' },
    { label: language === 'hi' ? '⚡ साइबरपंक' : '⚡ Cyberpunk', query: 'cyber' },
  ];

  const handleToggleLike = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowLiked = storageService.toggleTemplateLike(templateId);
    setLikedTemplates((prev) => ({ ...prev, [templateId]: isNowLiked }));
  };

  const handleUseTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    onRouteChange('create');
  };

  // Filter templates based on Search query, Gender filter, and Category filter
  const filteredTemplates = useMemo(() => {
    let list = photoTemplates.filter((tmpl) => {
      // Active status check
      if (tmpl.isActive === false) return false;

      // Gender filter
      if (selectedGender !== 'all') {
        if (tmpl.gender && tmpl.gender !== 'unisex' && tmpl.gender !== selectedGender) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (tmpl.category !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = tmpl.name.toLowerCase().includes(q);
        const inDesc = tmpl.description.toLowerCase().includes(q);
        const inSubCat = tmpl.subCategory?.toLowerCase().includes(q) || false;
        const inBadge = tmpl.badge?.toLowerCase().includes(q) || false;
        const inTags = tmpl.tags?.some((tag) => tag.toLowerCase().includes(q)) || false;
        return inName || inDesc || inSubCat || inBadge || inTags;
      }

      return true;
    });

    if (sortBy === 'popular') {
      list = [...list].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortBy === 'featured') {
      list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
      list = [...list].sort((a, b) => (a.sortPriority || 99) - (b.sortPriority || 99));
    }

    return list;
  }, [photoTemplates, searchQuery, selectedGender, selectedCategory, sortBy]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1712] border border-[#d4af37]/30 text-xs font-semibold text-[#fceda7]">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>{language === 'hi' ? '100% असली चेहरा सुरक्षित — सेम पर्सन गारंटी' : '100% Face Consistency Guaranteed'}</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
          {language === 'hi' ? 'प्रीमियम फोटो स्टूडियो टेम्पलेट्स' : 'Premium Photo Studio Templates'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          {language === 'hi'
            ? 'बॉयज, मेंस, रॉयल, स्ट्रीटवियर, शादी, रेट्रो और लोकेशन ट्रांसफॉर्मेशन के सैकड़ों ट्रेंडिंग स्टाइल्स'
            : 'Explore hundreds of trending styles for Men, Luxury, Streetwear, Weddings, Retro & Exotic Locations'}
        </p>
      </div>

      {/* Custom Instruction Shortcut Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1f170c] via-[#15120e] to-[#0d0f14] border border-[#d4af37]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient/20 border border-[#d4af37]/40 flex items-center justify-center shrink-0 text-[#d4af37]">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {language === 'hi' ? 'अपनी मर्जी से कुछ भी एडिट करवाना चाहते हैं?' : 'Want a completely custom transformation?'}
            </h4>
            <p className="text-[11px] text-gray-300">
              {language === 'hi'
                ? 'कस्टम इंस्ट्रक्शन में लिखें: उदा. "मुझे Goa beach पर खड़ा कर दो, ब्लैक सूट पहना दो"'
                : 'Write your custom request: e.g. "Put me on Goa beach in black suit at sunset"'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            onSelectTemplate('');
            onRouteChange('create');
          }}
          className="whitespace-nowrap px-4 py-2 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <span>{language === 'hi' ? 'कस्टम इंस्ट्रक्शन से एडिट करें' : 'Open Custom Edit'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SEARCH BAR WITH LIVE SUGGESTIONS */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4 text-[#d4af37]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'टेम्पलेट खोजें (उदा: Goa Beach, Black Suit, Billionaire, Cricket, Sherwani, Retro)...'
                : 'Search templates (e.g., Goa Beach, Black Suit, Billionaire, Cricket, Sherwani, Retro)...'
            }
            className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-[#0d1017] border border-white/[0.12] focus:border-[#d4af37] text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggested Searches / Trending Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#d4af37]" />
            {language === 'hi' ? 'लोकप्रिय खोजें:' : 'Trending:'}
          </span>
          {suggestedTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(tag.query)}
              className={`whitespace-nowrap px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                searchQuery.toLowerCase() === tag.query.toLowerCase()
                  ? 'bg-gold-gradient text-[#07080a] font-bold'
                  : 'bg-white/[0.04] text-gray-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* GENDER FILTER TABS */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-[#0c0e14] border border-white/[0.08] max-w-md mx-auto">
        <button
          onClick={() => setSelectedGender('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedGender === 'all'
              ? 'bg-gold-gradient text-[#07080a] shadow-md shadow-[#d4af37]/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'hi' ? '⭐ सभी टेम्पलेट्स' : '⭐ All Templates'}
        </button>
        <button
          onClick={() => setSelectedGender('male')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedGender === 'male'
              ? 'bg-gold-gradient text-[#07080a] shadow-md shadow-[#d4af37]/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'hi' ? '👑 बॉयज / लड़के (स्पेशल)' : '👑 Boys / Men (VIP)'}
        </button>
        <button
          onClick={() => setSelectedGender('female')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedGender === 'female'
              ? 'bg-gold-gradient text-[#07080a] shadow-md shadow-[#d4af37]/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'hi' ? '✨ गर्ल्स / लड़कियां' : '✨ Women / Girls'}
        </button>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-gold-gradient text-[#07080a] font-bold shadow-md shadow-[#d4af37]/20'
                : 'bg-white/[0.04] text-gray-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* RESULT COUNT, SORT BY & SYNC BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 px-1 py-1">
        <div className="flex items-center gap-2">
          <span>
            {language === 'hi'
              ? `${filteredTemplates.length} टेम्पलेट्स उपलब्ध`
              : `Showing ${filteredTemplates.length} templates`}
            {searchQuery && (
              <span className="text-[#fceda7] ml-1 font-medium">
                ("{searchQuery}")
              </span>
            )}
          </span>

          {(searchQuery || selectedCategory !== 'all' || selectedGender !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedGender('all');
              }}
              className="text-[#d4af37] hover:underline font-medium text-[11px]"
            >
              {language === 'hi' ? 'फ़िल्टर हटाएं (Reset)' : 'Reset Filters'}
            </button>
          )}
        </div>

        {/* Dynamic Controls: Refresh & Sort */}
        <div className="flex items-center gap-2">
          {/* Refresh/Sync Button for immediate discovery */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 active:scale-95 transition-all"
            title="Sync latest templates from template-library"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#d4af37] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'hi' ? 'रिफ्रेश लाइब्रेरी' : 'Sync Library'}</span>
          </button>

          {/* Sort Controls */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px]">
            <button
              onClick={() => setSortBy('priority')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'priority'
                  ? 'bg-gold-gradient text-[#07080a] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {language === 'hi' ? 'डिफ़ॉल्ट' : 'Default'}
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                sortBy === 'popular'
                  ? 'bg-gold-gradient text-[#07080a] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>{language === 'hi' ? 'पॉपुलर' : 'Popular'}</span>
            </button>
            <button
              onClick={() => setSortBy('featured')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                sortBy === 'featured'
                  ? 'bg-gold-gradient text-[#07080a] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>{language === 'hi' ? 'फीचर्ड' : 'Featured'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEMPLATES GRID WITH BEFORE/AFTER & FAKE LIKES COUNTER */}
      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c0e14] border border-white/[0.06] space-y-3">
          <Search className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">
            {language === 'hi' ? 'कोई टेम्पलेट नहीं मिला' : 'No templates match your search'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {language === 'hi'
              ? 'चिंता न करें! आप कस्टम इंस्ट्रक्शन में अपनी मर्जी से कुछ भी लिखकर एडिट करवा सकते हैं।'
              : 'No worries! You can describe any custom outfit, location, or style in Custom Edit.'}
          </p>
          <button
            onClick={() => {
              onSelectTemplate('');
              onRouteChange('create');
            }}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs inline-flex items-center gap-1.5"
          >
            <span>{language === 'hi' ? 'कस्टम मोड में अपनी पसंद लिखें' : 'Use Custom Mode'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isLiked = !!likedTemplates[template.id];
            // Format fake like count with interactive +1 boost
            const baseLikes = template.likesCount || 24800;
            const displayLikes = isLiked
              ? `${((baseLikes + 1) / 1000).toFixed(1)}K`
              : `${(baseLikes / 1000).toFixed(1)}K`;

            const beforeImg = template.beforePath || template.previewPath;
            const afterImg = template.afterPath || template.previewPath;

            return (
              <div
                key={template.id}
                className="group rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-[#d4af37]/40 p-4 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Interactive Before/After Slider */}
                  <div className="relative">
                    <BeforeAfterSlider
                      beforeImage={beforeImg}
                      afterImage={afterImg}
                      personName="Model"
                      beforeLabel={t.templates.beforeLabel}
                      afterLabel={t.templates.afterLabel}
                      aspectRatio="aspect-[4/5]"
                    />

                    {/* Badge */}
                    {template.badge && (
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-gold-gradient text-[#07080a] text-[10px] font-bold uppercase shadow-lg">
                        {template.badge}
                      </div>
                    )}

                    {/* FAKE LIKES COUNTER BUTTON (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(template.id, e)}
                      className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full backdrop-blur-md border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-90 ${
                        isLiked
                          ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 ring-2 ring-rose-500/30'
                          : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isLiked ? 'fill-rose-500 text-rose-500' : 'text-rose-400'
                        }`}
                      />
                      <span>{displayLikes}</span>
                    </button>
                  </div>

                  {/* Template Info */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#fceda7] transition-colors line-clamp-1">
                        {template.name}
                      </h3>
                      {template.gender && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.05] text-[#fceda7] border border-white/10 shrink-0">
                          {template.gender === 'male' ? '👑 Men' : template.gender === 'female' ? '✨ Women' : 'Unisex'}
                        </span>
                      )}
                    </div>
                    {template.subCategory && (
                      <div className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-wider mt-0.5">
                        {template.subCategory}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#fceda7] border border-[#d4af37]/20 font-medium">
                        💎 {template.creditCost || 50} Credits
                      </span>
                      {template.featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center gap-2">
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full py-2.5 rounded-xl bg-gold-gradient text-[#07080a] font-bold text-xs shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <span>{t.templates.useTemplate}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
