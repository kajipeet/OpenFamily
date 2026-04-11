<template>
  <div layout="public">

    <!-- Navigation -->
    <nav class="border-b border-stone-200 sticky top-0 bg-white z-10">
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <a href="/" class="flex items-center gap-2 font-serif font-semibold text-green-900 text-lg tracking-tight">
          🌸 FloraBase
        </a>
        <div class="hidden md:flex items-center gap-6 text-sm text-stone-600">
          <a href="#families" class="hover:text-green-800 transition">Семейства</a>
          <a href="#species" class="hover:text-green-800 transition">Виды</a>
          <a href="#seasonal" class="hover:text-green-800 transition">По сезонам</a>
          <a href="#about" class="hover:text-green-800 transition">О проекте</a>
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
        <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-3">Ботанический справочник</p>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-5 leading-tight">
          Энциклопедия<br class="hidden md:block"> цветковых растений
        </h1>
        <p class="text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
          Справочник для любителей, ботаников и садоводов.
          Поиск по семейству, цвету, сезону и среде обитания среди тысяч документированных видов.
        </p>
        <div class="mt-8 flex flex-wrap gap-3 justify-center text-sm">
          <a href="#families" class="px-5 py-2 bg-green-800 text-white rounded-full hover:bg-green-900 transition">Семейства</a>
          <a href="#species" class="px-5 py-2 border border-stone-300 text-stone-700 rounded-full hover:border-green-700 hover:text-green-800 transition">Избранные виды</a>
        </div>
      </div>
    </header>

    <!-- Stats strip -->
    <div class="border-y border-stone-100 bg-white">
      <div class="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 divide-x divide-stone-100 text-center text-sm">
        <div class="px-4">
          <p class="font-semibold text-stone-900">416</p>
          <p class="text-stone-500 text-xs">Семейств</p>
        </div>
        <div class="px-4">
          <p class="font-semibold text-stone-900">~369 000</p>
          <p class="text-stone-500 text-xs">Известных видов</p>
        </div>
        <div class="px-4">
          <p class="font-semibold text-stone-900">6</p>
          <p class="text-stone-500 text-xs">Континентов</p>
        </div>
      </div>
    </div>

    <!-- Plant Families -->
    <section id="families" class="max-w-6xl mx-auto px-4 py-16">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Классификация</p>
          <h2 class="text-2xl font-serif font-bold text-stone-900">Основные цветковые семейства</h2>
        </div>
        <a href="#species" class="text-sm text-green-800 hover:underline hidden md:block">Все виды →</a>
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
          <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Избранное</p>
          <h2 class="text-2xl font-serif font-bold text-stone-900">Примечательные виды</h2>
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
        <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Индекс</p>
        <h2 class="text-2xl font-serif font-bold text-stone-900">Поиск по цвету</h2>
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
          <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">Фенология</p>
          <h2 class="text-2xl font-serif font-bold text-stone-900">Календарь цветения</h2>
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
        <p class="text-xs font-medium tracking-widest text-green-700 uppercase mb-1">О проекте</p>
        <h2 class="text-2xl font-serif font-bold text-stone-900">О FloraBase</h2>
      </div>
      <div class="text-stone-600 text-sm leading-relaxed space-y-3">
        <p>
          FloraBase — ботанический справочный проект, каталогизирующий разнообразие цветковых растений во всех основных семействах и географических регионах. Материалы основаны на опубликованных гербарных образцах, полевых наблюдениях и рецензируемых таксономических ревизиях.
        </p>
        <p>
          Охват включает покрытосеменные (цветковые) растения от основных эвдикотов — включая Asteraceae, Rosaceae, Fabaceae и Lamiaceae — до однодольных с отдельными разделами для Orchidaceae и Poaceae. Голосеменные и папоротники выходят за рамки проекта.
        </p>
        <p>
          Проект следует системе классификации APG IV. Страницы видов включают синонимы, карты ареалов, фенологию цветения, заметки о среде обитания и охранный статус по оценке Красного списка IUCN.
        </p>
      </div>
    </section>

    <footer class="border-t border-stone-100 py-8 text-center text-xs text-stone-400">
      © {{ new Date().getFullYear() }} FloraBase ·
      <a href="#" class="hover:underline">Индекс видов</a> ·
      <a href="#" class="hover:underline">Список семейств</a> ·
      <a href="#" class="hover:underline">Участвовать</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useSeoMeta({
  title: 'FloraBase — Энциклопедия цветковых растений',
  description:
    'Ботанический справочник по семействам и видам цветковых растений. Поиск по семейству, цвету, сезону и среде обитания.',
  ogTitle: 'FloraBase — Энциклопедия цветковых растений',
  ogDescription:
    'Курируемый ботанический справочник: основные семейства, примечательные виды, фенология цветения и ареалы распространения.',
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
        description: 'Энциклопедия цветковых растений — семейства, виды и фенология.',
        about: { '@type': 'Thing', name: 'Ботаника', sameAs: 'https://ru.wikipedia.org/wiki/Ботаника' },
        inLanguage: 'ru',
      }),
    },
  ],
})

const plantFamilies = [
  {
    latin: 'Rosaceae',
    common: 'Семейство розовых',
    emoji: '🌹',
    description: 'Более 4 800 видов, 91 род. Включает розы, яблони, вишни и землянику. Характерны пятилепестные цветки и гипантий.',
    tags: ['Умеренный пояс', 'Съедобные плоды', 'Декоративные'],
  },
  {
    latin: 'Orchidaceae',
    common: 'Семейство орхидных',
    emoji: '🌸',
    description: 'Крупнейшее семейство цветковых растений — ок. 28 000 видов. Известны двусторонной симметрией цветков и микоризным прорастанием семян.',
    tags: ['Тропики', 'Эпифиты', 'Разнообразие'],
  },
  {
    latin: 'Asteraceae',
    common: 'Семейство астровых',
    emoji: '🌻',
    description: 'Второе по размеру семейство — более 32 000 видов. Отличительны соцветия (капитулы), мимикрирующие единый цветок.',
    tags: ['Космополиты', 'Соцветия', 'Светолюбивые'],
  },
  {
    latin: 'Fabaceae',
    common: 'Семейство бобовых',
    emoji: '🌷',
    description: 'Третье по размеру — ок. 19 500 видов. Ключевая экологическая роль в фиксации азота. Включает горох, фасоль, акации и вистерию.',
    tags: ['Фиксация азота', 'Пантропики', 'Бобовый плод'],
  },
  {
    latin: 'Lamiaceae',
    common: 'Семейство яснотковых',
    emoji: '💐',
    description: 'Ок. 7 000 видов ароматных трав и полукустарников. Четырёхгранные стебли и противоположные листья. Включает лаванду, шалфей и базилик.',
    tags: ['Ароматные', 'Пряные', 'Губовидные цветки'],
  },
  {
    latin: 'Ranunculaceae',
    common: 'Семейство лютиковых',
    emoji: '🌼',
    description: 'Ок. 2 500 видов, в основном травянистые растения с многочисленными свободными тычинками и апокарпными пестиками.',
    tags: ['Умеренный пояс', 'Токсичные алкалоиды', 'Весеннее цветение'],
  },
]

const featuredSpecies = [
  {
    latin: 'Rosa canina',
    common: 'Шиповник обыкновенный',
    emoji: '🌹',
    description: 'Распространённый лазящий кустарник, родной для Европы, Сев. Африки и Зап. Азии. Цветёт пятилепестными розовыми цветками в мае–июле; плоды богаты витамином C.',
    habitat: 'Живые изгороди и кустарники',
    bloom: 'Май – Июль',
  },
  {
    latin: 'Papaver rhoeas',
    common: 'Мак полевой',
    emoji: '🌺',
    description: 'Однолетнее полевое растение нарушенных угодий. Ярко-красные лепестки с тёмным пятном у основания. Широко распространён по Европе и умеренной Азии.',
    habitat: 'Пахотные поля и обочины',
    bloom: 'Июнь – Август',
  },
  {
    latin: 'Lavandula angustifolia',
    common: 'Лаванда узколистная',
    emoji: '💜',
    description: 'Ароматный полукустарник средиземноморских холмов. Густые колоски фиолетовых цветков привлекают опылителей и дают коммерчески ценное эфирное масло.',
    habitat: 'Сухие известняковые склоны',
    bloom: 'Июль – Август',
  },
  {
    latin: 'Helianthus annuus',
    common: 'Подсолнух однолетний',
    emoji: '🌻',
    description: 'Высокое однолетнее растение из зап. Сев. Америки. Соцветия проявляют гелиотропизм в фазе бутона. Семена — важная масличная культура во всём мире.',
    habitat: 'Открытые нарушенные угодья',
    bloom: 'Июль – Октябрь',
  },
  {
    latin: 'Viola odorata',
    common: 'Фиалка душистая',
    emoji: '🪻',
    description: 'Корневищный многолетник вдоль опушек и живых изгородей. Один из самых ранних весенних цветков, сильно ароматный. Исторически применялся в парфюмерии и кулинарии.',
    habitat: 'Тенистые опушки леса',
    bloom: 'Февраль – Апрель',
  },
  {
    latin: 'Convallaria majalis',
    common: 'Ландыш майский',
    emoji: '🌿',
    description: 'Теневыносливый корневищный многолетник, образующий заросли в лиственном лесу. Кисти из поникающих белых колокольчиков отличаются сильным ароматом. Все части ядовиты.',
    habitat: 'Лиственный лес',
    bloom: 'Апрель – Май',
  },
]

const colours = [
  { name: 'Белый', dot: '⚪', cls: 'border-stone-200 text-stone-600 hover:border-stone-400' },
  { name: 'Жёлтый', dot: '🟡', cls: 'border-amber-200 text-amber-700 hover:border-amber-400 bg-amber-50' },
  { name: 'Красный', dot: '🔴', cls: 'border-red-200 text-red-700 hover:border-red-400 bg-red-50' },
  { name: 'Розовый', dot: '🦷', cls: 'border-rose-200 text-rose-700 hover:border-rose-400 bg-rose-50' },
  { name: 'Фиолетовый', dot: '🟣', cls: 'border-purple-200 text-purple-700 hover:border-purple-400 bg-purple-50' },
  { name: 'Синий', dot: '🔵', cls: 'border-blue-200 text-blue-700 hover:border-blue-400 bg-blue-50' },
  { name: 'Оранжевый', dot: '🟠', cls: 'border-orange-200 text-orange-700 hover:border-orange-400 bg-orange-50' },
  { name: 'Зелёный (прицветник)', dot: '🟢', cls: 'border-green-200 text-green-700 hover:border-green-400 bg-green-50' },
]

const seasons = [
  {
    name: 'Весна',
    emoji: '🌱',
    flowers: ['Viola odorata', 'Convallaria majalis', 'Prunus avium', 'Narcissus pseudonarcissus'],
  },
  {
    name: 'Лето',
    emoji: '☀️',
    flowers: ['Lavandula angustifolia', 'Rosa canina', 'Papaver rhoeas', 'Helianthus annuus'],
  },
  {
    name: 'Осень',
    emoji: '🍂',
    flowers: ['Aster amellus', 'Solidago virgaurea', 'Cyclamen hederifolium', 'Colchicum autumnale'],
  },
  {
    name: 'Зима',
    emoji: '❄️',
    flowers: ['Helleborus niger', 'Galanthus nivalis', 'Prunus subhirtella', 'Daphne mezereum'],
  },
]
</script>
