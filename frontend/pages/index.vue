<template>
  <div layout="public">

    <!-- Navigation -->
    <nav class="border-b border-stone-200 sticky top-0 bg-white z-10">
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <a href="/" class="flex items-center gap-2 font-serif font-semibold text-green-900 text-lg tracking-tight">
          🌸 FloraBase
        </a>
        <div class="hidden md:flex items-center gap-6 text-sm text-stone-600">
          <a href="#families" class="hover:text-green-800 transition">Families</a>
          <a href="#species" class="hover:text-green-800 transition">Species</a>
          <a href="#seasonal" class="hover:text-green-800 transition">Seasonal</a>
          <a href="#about" class="hover:text-green-800 transition">About</a>
          <NuxtLink
            to="/garden"
            class="text-xs text-stone-400 hover:text-stone-600 transition ml-2"
            title="Member area"
          >
            ⬡
          </NuxtLink>
        </div>
        <NuxtLink to="/garden" class="md:hidden text-xs text-stone-400 hover:text-stone-600 transition" title="Member area">⬡</NuxtLink>
      </div>
    </nav>

    <!-- Hero -->
    <header class="bg-gradient-to-br from-rose-50 via-green-50 to-amber-50 py-20 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-3">Botanical Reference</p>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-5 leading-tight">
          Encyclopedia of<br class="hidden md:block"> Flowering Plants
        </h1>
        <p class="text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
          A curated reference for enthusiasts, botanists, and gardeners.
          Browse by family, colour, season, and habitat across thousands of documented species.
        </p>
        <div class="mt-8 flex flex-wrap gap-3 justify-center text-sm">
          <a href="#families" class="px-5 py-2 bg-green-800 text-white rounded-full hover:bg-green-900 transition">Browse Families</a>
          <a href="#species" class="px-5 py-2 border border-stone-300 text-stone-700 rounded-full hover:border-green-700 hover:text-green-800 transition">Featured Species</a>
        </div>
      </div>
    </header>

    <!-- Stats strip -->
    <div class="border-y border-stone-100 bg-white">
      <div class="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 divide-x divide-stone-100 text-center text-sm">
        <div class="px-4">
          <p class="font-semibold text-stone-900">416</p>
          <p class="text-stone-500 text-xs">Families</p>
        </div>
        <div class="px-4">
          <p class="font-semibold text-stone-900">~369 000</p>
          <p class="text-stone-500 text-xs">Known species</p>
        </div>
        <div class="px-4">
          <p class="font-semibold text-stone-900">6</p>
          <p class="text-stone-500 text-xs">Continents</p>
        </div>
      </div>
    </div>

    <!-- Plant Families -->
    <section id="families" class="max-w-6xl mx-auto px-4 py-16">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Classification</p>
          <h2 class="text-2xl font-serif font-bold text-stone-900">Major Flowering Families</h2>
        </div>
        <a href="#species" class="text-sm text-green-800 hover:underline hidden md:block">See all species →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="family in plantFamilies"
          :key="family.latin"
          class="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md hover:border-green-200 transition cursor-default"
        >
          <div class="text-3xl mb-3">{{ family.emoji }}</div>
          <p class="text-xs text-stone-400 font-medium tracking-wide uppercase mb-0.5">{{ family.latin }}</p>
          <h3 class="font-semibold text-stone-800 mb-1">{{ family.common }}</h3>
          <p class="text-xs text-stone-500 leading-relaxed">{{ family.description }}</p>
          <div class="mt-3 flex flex-wrap gap-1">
            <span v-for="tag in family.tags" :key="tag" class="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">{{ tag }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Species -->
    <section id="species" class="bg-stone-50 py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="mb-8">
          <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Featured</p>
          <h2 class="text-2xl font-serif font-bold text-stone-900">Notable Species</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-5">
          <article
            v-for="species in featuredSpecies"
            :key="species.latin"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex gap-4 p-4 hover:shadow-md transition cursor-default"
          >
            <div class="text-5xl flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl">{{ species.emoji }}</div>
            <div class="min-w-0">
              <p class="text-xs text-stone-400 italic">{{ species.latin }}</p>
              <h3 class="font-bold text-stone-800 text-sm">{{ species.common }}</h3>
              <p class="text-xs text-stone-500 mt-1 leading-relaxed">{{ species.description }}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span class="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{{ species.habitat }}</span>
                <span class="text-xs bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full">{{ species.bloom }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Browse by colour -->
    <section class="max-w-6xl mx-auto px-4 py-16">
      <div class="mb-8">
        <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Index</p>
        <h2 class="text-2xl font-serif font-bold text-stone-900">Browse by Colour</h2>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="col in colours"
          :key="col.name"
          class="flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition hover:shadow-sm"
          :class="col.cls"
        >
          <span>{{ col.dot }}</span> {{ col.name }}
        </button>
      </div>
    </section>

    <!-- Seasonal -->
    <section id="seasonal" class="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="mb-8">
          <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Phenology</p>
          <h2 class="text-2xl font-serif font-bold text-stone-900">Bloom Calendar</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="s in seasons" :key="s.name" class="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 text-center">
            <div class="text-4xl mb-3">{{ s.emoji }}</div>
            <h3 class="font-semibold text-stone-800 text-sm mb-2">{{ s.name }}</h3>
            <ul class="text-xs text-stone-500 space-y-1">
              <li v-for="f in s.flowers" :key="f">{{ f }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="max-w-4xl mx-auto px-4 py-16">
      <div class="mb-6">
        <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">About</p>
        <h2 class="text-2xl font-serif font-bold text-stone-900">About FloraBase</h2>
      </div>
      <div class="text-stone-600 text-sm leading-relaxed space-y-3">
        <p>
          FloraBase is a botanical reference project cataloguing flowering plant diversity across
          all major families and geographic regions. Our entries draw on published herbarium
          specimens, field observations, and peer-reviewed taxonomic revisions.
        </p>
        <p>
          Coverage spans angiosperms (flowering plants) from the core eudicots — including
          Asteraceae, Rosaceae, Fabaceae, and Lamiaceae — through the monocots, with dedicated
          sections for Orchidaceae and Poaceae. Gymnosperms and ferns are outside the project scope.
        </p>
        <p>
          The project follows the APG IV classification system. Species pages include synonyms,
          distribution maps, bloom phenology, habitat notes, and conservation status where assessed
          by the IUCN Red List.
        </p>
      </div>
    </section>

    <footer class="border-t border-stone-100 py-8 text-center text-xs text-stone-400">
      © {{ new Date().getFullYear() }} FloraBase ·
      <a href="#" class="hover:underline">Species Index</a> ·
      <a href="#" class="hover:underline">Family List</a> ·
      <a href="#" class="hover:underline">Contribute</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useSeoMeta({
  title: 'FloraBase — Encyclopedia of Flowering Plants',
  description:
    'A botanical reference for flowering plant families and species. Browse by family, colour, season, and habitat.',
  ogTitle: 'FloraBase — Encyclopedia of Flowering Plants',
  ogDescription:
    'Curated botanical reference covering major angiosperm families, notable species, bloom phenology, and distribution notes.',
  ogType: 'website',
  robots: 'index, follow',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'FloraBase',
        description: 'Encyclopedia of flowering plants — families, species, and phenology.',
        about: { '@type': 'Thing', name: 'Botany', sameAs: 'https://en.wikipedia.org/wiki/Botany' },
        inLanguage: 'en',
      }),
    },
  ],
})

const plantFamilies = [
  {
    latin: 'Rosaceae',
    common: 'Rose Family',
    emoji: '🌹',
    description: 'Over 4 800 species across 91 genera. Includes roses, apples, cherries, and strawberries. Characterised by five-petalled flowers and hypanthia.',
    tags: ['Temperate', 'Edible fruits', 'Ornamental'],
  },
  {
    latin: 'Orchidaceae',
    common: 'Orchid Family',
    emoji: '🌸',
    description: 'The largest flowering plant family with ~28 000 species. Renowned for elaborate bilateral symmetry and mycorrhizal seed germination.',
    tags: ['Tropical', 'Epiphyte', 'Diverse'],
  },
  {
    latin: 'Asteraceae',
    common: 'Daisy Family',
    emoji: '🌻',
    description: 'Second-largest family with over 32 000 species. Distinguishable by composite flower heads (capitula) that mimic single blooms.',
    tags: ['Cosmopolitan', 'Composite head', 'Sun-loving'],
  },
  {
    latin: 'Fabaceae',
    common: 'Legume Family',
    emoji: '🌷',
    description: 'Third-largest family (~19 500 sp.). Key ecological role via nitrogen fixation. Includes peas, beans, acacias, and wisteria.',
    tags: ['Nitrogen fixation', 'Pantropical', 'Pod fruit'],
  },
  {
    latin: 'Lamiaceae',
    common: 'Mint Family',
    emoji: '💐',
    description: 'Around 7 000 species of aromatic herbs and shrubs. Square stems and opposite leaves are diagnostic. Includes lavender, sage, and basil.',
    tags: ['Aromatic', 'Culinary', 'Lipped flowers'],
  },
  {
    latin: 'Ranunculaceae',
    common: 'Buttercup Family',
    emoji: '🌼',
    description: 'Approximately 2 500 species of mostly herbaceous plants characterised by numerous free stamens and apocarpous pistils.',
    tags: ['Temperate', 'Toxic alkaloids', 'Spring bloom'],
  },
]

const featuredSpecies = [
  {
    latin: 'Rosa canina',
    common: 'Dog Rose',
    emoji: '🌹',
    description: 'Widespread scrambling shrub native to Europe, northwest Africa, and western Asia. Bears five-petalled pink flowers May–July and scarlet hips rich in vitamin C.',
    habitat: 'Hedgerows & scrub',
    bloom: 'May – July',
  },
  {
    latin: 'Papaver rhoeas',
    common: 'Common Poppy',
    emoji: '🌺',
    description: 'Annual of disturbed arable land. Brilliant red petals with a dark basal spot. Extensively distributed across Europe and temperate Asia.',
    habitat: 'Arable & disturbed',
    bloom: 'June – August',
  },
  {
    latin: 'Lavandula angustifolia',
    common: 'True Lavender',
    emoji: '💜',
    description: 'Aromatic subshrub from Mediterranean hillsides. Dense spikes of violet-blue flowers attract pollinators and yield commercially important essential oil.',
    habitat: 'Dry calcareous slopes',
    bloom: 'July – August',
  },
  {
    latin: 'Helianthus annuus',
    common: 'Common Sunflower',
    emoji: '🌻',
    description: 'Tall annual from western North America. Capitulate inflorescences exhibit heliotropism in bud stage. Seeds are an important oilseed crop worldwide.',
    habitat: 'Open disturbed ground',
    bloom: 'July – October',
  },
  {
    latin: 'Viola odorata',
    common: 'Sweet Violet',
    emoji: '🪻',
    description: 'Rhizomatous perennial of woodland edges and hedgebanks. One of the earliest spring flowers, strongly fragrant. Used historically in perfumery and confectionery.',
    habitat: 'Shaded woodland edges',
    bloom: 'February – April',
  },
  {
    latin: 'Convallaria majalis',
    common: 'Lily of the Valley',
    emoji: '🌿',
    description: 'Shade-tolerant rhizomatous herb forming spreading colonies in deciduous woodland. Racemes of pendant white bells noted for intense fragrance. All parts toxic.',
    habitat: 'Deciduous woodland',
    bloom: 'April – May',
  },
]

const colours = [
  { name: 'White', dot: '⚪', cls: 'border-stone-200 text-stone-600 hover:border-stone-400' },
  { name: 'Yellow', dot: '🟡', cls: 'border-amber-200 text-amber-700 hover:border-amber-400 bg-amber-50' },
  { name: 'Red', dot: '🔴', cls: 'border-red-200 text-red-700 hover:border-red-400 bg-red-50' },
  { name: 'Pink', dot: '🩷', cls: 'border-rose-200 text-rose-700 hover:border-rose-400 bg-rose-50' },
  { name: 'Purple', dot: '🟣', cls: 'border-purple-200 text-purple-700 hover:border-purple-400 bg-purple-50' },
  { name: 'Blue', dot: '🔵', cls: 'border-blue-200 text-blue-700 hover:border-blue-400 bg-blue-50' },
  { name: 'Orange', dot: '🟠', cls: 'border-orange-200 text-orange-700 hover:border-orange-400 bg-orange-50' },
  { name: 'Green (bract)', dot: '🟢', cls: 'border-green-200 text-green-700 hover:border-green-400 bg-green-50' },
]

const seasons = [
  {
    name: 'Spring',
    emoji: '🌱',
    flowers: ['Viola odorata', 'Convallaria majalis', 'Prunus avium', 'Narcissus pseudonarcissus'],
  },
  {
    name: 'Summer',
    emoji: '☀️',
    flowers: ['Lavandula angustifolia', 'Rosa canina', 'Papaver rhoeas', 'Helianthus annuus'],
  },
  {
    name: 'Autumn',
    emoji: '🍂',
    flowers: ['Aster amellus', 'Solidago virgaurea', 'Cyclamen hederifolium', 'Colchicum autumnale'],
  },
  {
    name: 'Winter',
    emoji: '❄️',
    flowers: ['Helleborus niger', 'Galanthus nivalis', 'Prunus subhirtella', 'Daphne mezereum'],
  },
]
</script>
