import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const wordsByTopic = {
  animals: [
    { russian: 'кот', english: 'cat', pronunciation: '[kæt]', example: 'The cat is sleeping.', difficulty: 1 },
    { russian: 'собака', english: 'dog', pronunciation: '[dɔːɡ]', example: 'My dog is friendly.', difficulty: 1 },
    { russian: 'птица', english: 'bird', pronunciation: '[bɜːrd]', example: 'Birds can fly.', difficulty: 1 },
    { russian: 'рыба', english: 'fish', pronunciation: '[fɪʃ]', example: 'Fish live in water.', difficulty: 1 },
    { russian: 'лошадь', english: 'horse', pronunciation: '[hɔːrs]', example: 'The horse is running.', difficulty: 1 },
    { russian: 'корова', english: 'cow', pronunciation: '[kaʊ]', example: 'The cow gives milk.', difficulty: 1 },
    { russian: 'свинья', english: 'pig', pronunciation: '[pɪɡ]', example: 'Pigs are intelligent.', difficulty: 1 },
    { russian: 'овца', english: 'sheep', pronunciation: '[ʃiːp]', example: 'Sheep eat grass.', difficulty: 1 },
    { russian: 'коза', english: 'goat', pronunciation: '[ɡoʊt]', example: 'The goat is climbing.', difficulty: 1 },
    { russian: 'курица', english: 'chicken', pronunciation: '[ˈtʃɪkən]', example: 'Chickens lay eggs.', difficulty: 1 },
    { russian: 'утка', english: 'duck', pronunciation: '[dʌk]', example: 'Ducks swim in ponds.', difficulty: 1 },
    { russian: 'гусь', english: 'goose', pronunciation: '[ɡuːs]', example: 'The goose is honking.', difficulty: 1 },
    { russian: 'индейка', english: 'turkey', pronunciation: '[ˈtɜːrki]', example: 'Turkey is delicious.', difficulty: 1 },
    { russian: 'кролик', english: 'rabbit', pronunciation: '[ˈræbɪt]', example: 'Rabbits hop quickly.', difficulty: 1 },
    { russian: 'хомяк', english: 'hamster', pronunciation: '[ˈhæmstər]', example: 'The hamster runs in a wheel.', difficulty: 2 },
    { russian: 'мышь', english: 'mouse', pronunciation: '[maʊs]', example: 'The mouse is small.', difficulty: 1 },
    { russian: 'крыса', english: 'rat', pronunciation: '[ræt]', example: 'Rats are very smart.', difficulty: 1 },
    { russian: 'белка', english: 'squirrel', pronunciation: '[ˈskwɜːrəl]', example: 'Squirrels climb trees.', difficulty: 2 },
    { russian: 'ёжик', english: 'hedgehog', pronunciation: '[ˈhedʒhɑːɡ]', example: 'Hedgehogs have spikes.', difficulty: 2 },
    { russian: 'лиса', english: 'fox', pronunciation: '[fɑːks]', example: 'The fox is cunning.', difficulty: 1 },
    { russian: 'волк', english: 'wolf', pronunciation: '[wʊlf]', example: 'Wolves hunt in packs.', difficulty: 1 },
    { russian: 'медведь', english: 'bear', pronunciation: '[ber]', example: 'Bears sleep in winter.', difficulty: 1 },
    { russian: 'лев', english: 'lion', pronunciation: '[ˈlaɪən]', example: 'The lion is the king.', difficulty: 1 },
    { russian: 'тигр', english: 'tiger', pronunciation: '[ˈtaɪɡər]', example: 'Tigers have stripes.', difficulty: 1 },
    { russian: 'леопард', english: 'leopard', pronunciation: '[ˈlepərd]', example: 'Leopards are fast.', difficulty: 2 },
    { russian: 'слон', english: 'elephant', pronunciation: '[ˈeləfənt]', example: 'Elephants are huge.', difficulty: 2 },
    { russian: 'жираф', english: 'giraffe', pronunciation: '[dʒəˈræf]', example: 'Giraffes have long necks.', difficulty: 2 },
    { russian: 'зебра', english: 'zebra', pronunciation: '[ˈziːbrə]', example: 'Zebras have stripes.', difficulty: 1 },
    { russian: 'носорог', english: 'rhino', pronunciation: '[ˈraɪnoʊ]', example: 'Rhinos have thick skin.', difficulty: 2 },
    { russian: 'бегемот', english: 'hippo', pronunciation: '[ˈhɪpoʊ]', example: 'Hippos live in water.', difficulty: 2 },
    { russian: 'крокодил', english: 'crocodile', pronunciation: '[ˈkrɑːkədaɪl]', example: 'Crocodiles are dangerous.', difficulty: 2 },
    { russian: 'змея', english: 'snake', pronunciation: '[sneɪk]', example: 'Snakes slither quietly.', difficulty: 1 },
    { russian: 'ящерица', english: 'lizard', pronunciation: '[ˈlɪzərd]', example: 'Lizards love the sun.', difficulty: 2 },
    { russian: 'лягушка', english: 'frog', pronunciation: '[frɑːɡ]', example: 'Frogs live near water.', difficulty: 1 },
    { russian: 'паук', english: 'spider', pronunciation: '[ˈspaɪdər]', example: 'Spiders spin webs.', difficulty: 1 },
    { russian: 'жук', english: 'beetle', pronunciation: '[ˈbiːtəl]', example: 'Beetles are colorful.', difficulty: 1 },
    { russian: 'бабочка', english: 'butterfly', pronunciation: '[ˈbʌtərflaɪ]', example: 'Butterflies are beautiful.', difficulty: 2 },
    { russian: 'муха', english: 'fly', pronunciation: '[flaɪ]', example: 'Flies are annoying.', difficulty: 1 },
    { russian: 'пчела', english: 'bee', pronunciation: '[biː]', example: 'Bees make honey.', difficulty: 1 },
    { russian: 'муравей', english: 'ant', pronunciation: '[ænt]', example: 'Ants work together.', difficulty: 1 },
    { russian: 'червь', english: 'worm', pronunciation: '[wɜːrm]', example: 'Worms help plants grow.', difficulty: 1 },
    { russian: 'улитка', english: 'snail', pronunciation: '[sneɪl]', example: 'Snails move slowly.', difficulty: 1 },
    { russian: 'краб', english: 'crab', pronunciation: '[kræb]', example: 'Crabs live in shells.', difficulty: 1 },
    { russian: 'креветка', english: 'shrimp', pronunciation: '[ʃrɪmp]', example: 'Shrimp live in the ocean.', difficulty: 2 },
    { russian: 'медуза', english: 'jellyfish', pronunciation: '[ˈdʒelifɪʃ]', example: 'Jellyfish can sting.', difficulty: 2 },
    { russian: 'звезда', english: 'starfish', pronunciation: '[ˈstɑːrfɪʃ]', example: 'Starfish have five arms.', difficulty: 2 },
    { russian: 'дельфин', english: 'dolphin', pronunciation: '[ˈdɑːlfən]', example: 'Dolphins are intelligent.', difficulty: 2 },
    { russian: 'кит', english: 'whale', pronunciation: '[weɪl]', example: 'Whales are enormous.', difficulty: 1 },
    { russian: 'акула', english: 'shark', pronunciation: '[ʃɑːrk]', example: 'Sharks are predators.', difficulty: 1 },
    { russian: 'морской котик', english: 'sea lion', pronunciation: '[siː ˈlaɪən]', example: 'Sea lions bark loudly.', difficulty: 2 },
    { russian: 'пингвин', english: 'penguin', pronunciation: '[ˈpeŋɡwən]', example: 'Penguins live in Antarctica.', difficulty: 2 },
    { russian: 'морж', english: 'walrus', pronunciation: '[ˈwɔːlrəs]', example: 'Walruses have long tusks.', difficulty: 2 },
    { russian: 'тюлень', english: 'seal', pronunciation: '[siːl]', example: 'Seals are graceful swimmers.', difficulty: 1 },
    { russian: 'выдра', english: 'otter', pronunciation: '[ˈɑːtər]', example: 'Otters play in water.', difficulty: 2 },
    { russian: 'бобр', english: 'beaver', pronunciation: '[ˈbiːvər]', example: 'Beavers build dams.', difficulty: 2 },
    { russian: 'енот', english: 'raccoon', pronunciation: '[rəˈkuːn]', example: 'Raccoons are clever.', difficulty: 2 }
  ],
  
  hobby: [
    { russian: 'чтение', english: 'reading', pronunciation: '[ˈriːdɪŋ]', example: 'Reading is relaxing.', difficulty: 1 },
    { russian: 'рисование', english: 'drawing', pronunciation: '[ˈdrɔːɪŋ]', example: 'Drawing is creative.', difficulty: 2 },
    { russian: 'письмо', english: 'writing', pronunciation: '[ˈraɪtɪŋ]', example: 'Writing helps express ideas.', difficulty: 1 },
    { russian: 'фотография', english: 'photography', pronunciation: '[fəˈtɑːɡrəfi]', example: 'Photography captures moments.', difficulty: 3 },
    { russian: 'музыка', english: 'music', pronunciation: '[ˈmjuːzɪk]', example: 'Music brings joy.', difficulty: 1 },
    { russian: 'спорт', english: 'sport', pronunciation: '[spɔːrt]', example: 'Sport keeps you healthy.', difficulty: 1 },
    { russian: 'бег', english: 'running', pronunciation: '[ˈrʌnɪŋ]', example: 'Running is good exercise.', difficulty: 1 },
    { russian: 'плавание', english: 'swimming', pronunciation: '[ˈswɪmɪŋ]', example: 'Swimming is refreshing.', difficulty: 1 },
    { russian: 'велосипед', english: 'cycling', pronunciation: '[ˈsaɪklɪŋ]', example: 'Cycling is eco-friendly.', difficulty: 2 },
    { russian: 'йога', english: 'yoga', pronunciation: '[ˈjoʊɡə]', example: 'Yoga improves flexibility.', difficulty: 1 },
    { russian: 'танцы', english: 'dancing', pronunciation: '[ˈdænsɪŋ]', example: 'Dancing is expressive.', difficulty: 2 },
    { russian: 'кулинария', english: 'cooking', pronunciation: '[ˈkʊkɪŋ]', example: 'Cooking is an art.', difficulty: 2 },
    { russian: 'выпечка', english: 'baking', pronunciation: '[ˈbeɪkɪŋ]', example: 'Baking requires precision.', difficulty: 2 },
    { russian: 'садоводство', english: 'gardening', pronunciation: '[ˈɡɑːrdənɪŋ]', example: 'Gardening connects with nature.', difficulty: 3 },
    { russian: 'вязание', english: 'knitting', pronunciation: '[ˈnɪtɪŋ]', example: 'Knitting is calming.', difficulty: 2 },
    { russian: 'шитье', english: 'sewing', pronunciation: '[ˈsoʊɪŋ]', example: 'Sewing is practical.', difficulty: 2 },
    { russian: 'лепка', english: 'sculpting', pronunciation: '[ˈskʌlptɪŋ]', example: 'Sculpting is artistic.', difficulty: 3 },
    { russian: 'коллекционирование', english: 'collecting', pronunciation: '[kəˈlektɪŋ]', example: 'Collecting is fascinating.', difficulty: 3 },
    { russian: 'игры', english: 'gaming', pronunciation: '[ˈɡeɪmɪŋ]', example: 'Gaming is entertaining.', difficulty: 1 },
    { russian: 'шахматы', english: 'chess', pronunciation: '[tʃes]', example: 'Chess is strategic.', difficulty: 2 },
    { russian: 'головоломки', english: 'puzzles', pronunciation: '[ˈpʌzəlz]', example: 'Puzzles challenge the mind.', difficulty: 2 },
    { russian: 'складывание пазлов', english: 'puzzle solving', pronunciation: '[ˈpʌzəl ˈsɑːlvɪŋ]', example: 'Puzzle solving is rewarding.', difficulty: 3 },
    { russian: 'оригами', english: 'origami', pronunciation: '[ˌɔːrɪˈɡɑːmi]', example: 'Origami is peaceful.', difficulty: 2 },
    { russian: 'каллиграфия', english: 'calligraphy', pronunciation: '[kəˈlɪɡrəfi]', example: 'Calligraphy is beautiful.', difficulty: 3 },
    { russian: 'кожевенное дело', english: 'leatherwork', pronunciation: '[ˈleðərwɜːrk]', example: 'Leatherwork is traditional.', difficulty: 3 },
    { russian: 'гончарное дело', english: 'pottery', pronunciation: '[ˈpɑːtəri]', example: 'Pottery is therapeutic.', difficulty: 2 },
    { russian: 'деревообработка', english: 'woodworking', pronunciation: '[ˈwʊdwɜːrkɪŋ]', example: 'Woodworking is skillful.', difficulty: 3 },
    { russian: 'резьба по дереву', english: 'wood carving', pronunciation: '[wʊd ˈkɑːrvɪŋ]', example: 'Wood carving is detailed.', difficulty: 3 },
    { russian: 'металлообработка', english: 'metalworking', pronunciation: '[ˈmetəlwɜːrkɪŋ]', example: 'Metalworking requires tools.', difficulty: 3 },
    { russian: 'стеклодувство', english: 'glassblowing', pronunciation: '[ˈɡlæsbloʊɪŋ]', example: 'Glassblowing is hot work.', difficulty: 3 },
    { russian: 'вышивание', english: 'embroidering', pronunciation: '[ɪmˈbrɔɪdərɪŋ]', example: 'Embroidering is delicate.', difficulty: 2 },
    { russian: 'вышивание крестом', english: 'cross-stitch', pronunciation: '[ˈkrɔːs stɪtʃ]', example: 'Cross-stitch is traditional.', difficulty: 2 },
    { russian: 'кружевоплетение', english: 'lace making', pronunciation: '[leɪs ˈmeɪkɪŋ]', example: 'Lace making is intricate.', difficulty: 3 },
    { russian: 'макраме', english: 'macrame', pronunciation: '[məˈkrɑːmi]', example: 'Macrame creates patterns.', difficulty: 2 },
    { russian: 'плетение корзин', english: 'basket weaving', pronunciation: '[ˈbæskət ˈwiːvɪŋ]', example: 'Basket weaving is crafty.', difficulty: 3 },
    { russian: 'ткачество', english: 'weaving', pronunciation: '[ˈwiːvɪŋ]', example: 'Weaving creates fabric.', difficulty: 2 },
    { russian: 'валяние шерсти', english: 'felting', pronunciation: '[ˈfeltɪŋ]', example: 'Felting uses wool.', difficulty: 2 },
    { russian: 'спиннинг', english: 'spinning', pronunciation: '[ˈspɪnɪŋ]', example: 'Spinning makes yarn.', difficulty: 2 },
    { russian: 'крашение тканей', english: 'dyeing', pronunciation: '[ˈdaɪɪŋ]', example: 'Dyeing adds color.', difficulty: 2 },
    { russian: 'батик', english: 'batik', pronunciation: '[ˈbætɪk]', example: 'Batik is artistic.', difficulty: 2 },
    { russian: 'шелкография', english: 'screen printing', pronunciation: '[skriːn ˈprɪntɪŋ]', example: 'Screen printing is versatile.', difficulty: 3 },
    { russian: 'гравюра', english: 'engraving', pronunciation: '[ɪnˈɡreɪvɪŋ]', example: 'Engraving is permanent.', difficulty: 3 },
    { russian: 'литография', english: 'lithography', pronunciation: '[lɪˈθɑːɡrəfi]', example: 'Lithography prints images.', difficulty: 3 },
    { russian: 'офорт', english: 'etching', pronunciation: '[ˈetʃɪŋ]', example: 'Etching creates prints.', difficulty: 3 },
    { russian: 'сухая игла', english: 'drypoint', pronunciation: '[ˈdraɪpɔɪnt]', example: 'Drypoint scratches metal.', difficulty: 3 },
    { russian: 'монотипия', english: 'monotype', pronunciation: '[ˈmɑːnotaɪp]', example: 'Monotype is unique.', difficulty: 3 },
    { russian: 'коллаж', english: 'collage', pronunciation: '[kəˈlɑːʒ]', example: 'Collage combines materials.', difficulty: 2 },
    { russian: 'ассамбляж', english: 'assemblage', pronunciation: '[əˈsemblɪdʒ]', example: 'Assemblage uses found objects.', difficulty: 3 },
    { russian: 'инсталляция', english: 'installation', pronunciation: '[ˌɪnstəˈleɪʃən]', example: 'Installation fills space.', difficulty: 3 },
    { russian: 'перформанс', english: 'performance', pronunciation: '[pərˈfɔːrməns]', example: 'Performance is live art.', difficulty: 3 },
    { russian: 'хеппенинг', english: 'happening', pronunciation: '[ˈhæpənɪŋ]', example: 'Happening is spontaneous.', difficulty: 3 }
  ],
  
  weather: [
    { russian: 'солнце', english: 'sun', pronunciation: '[sʌn]', example: 'The sun is bright.', difficulty: 1 },
    { russian: 'дождь', english: 'rain', pronunciation: '[reɪn]', example: 'Rain makes plants grow.', difficulty: 1 },
    { russian: 'снег', english: 'snow', pronunciation: '[snoʊ]', example: 'Snow covers the ground.', difficulty: 1 },
    { russian: 'ветер', english: 'wind', pronunciation: '[wɪnd]', example: 'Wind blows the leaves.', difficulty: 1 },
    { russian: 'облако', english: 'cloud', pronunciation: '[klaʊd]', example: 'Clouds cover the sky.', difficulty: 1 },
    { russian: 'туман', english: 'fog', pronunciation: '[fɑːɡ]', example: 'Fog makes visibility poor.', difficulty: 1 },
    { russian: 'гроза', english: 'thunderstorm', pronunciation: '[ˈθʌndərstɔːrm]', example: 'Thunderstorms are loud.', difficulty: 2 },
    { russian: 'молния', english: 'lightning', pronunciation: '[ˈlaɪtnɪŋ]', example: 'Lightning strikes quickly.', difficulty: 2 },
    { russian: 'гром', english: 'thunder', pronunciation: '[ˈθʌndər]', example: 'Thunder rumbles loudly.', difficulty: 1 },
    { russian: 'град', english: 'hail', pronunciation: '[heɪl]', example: 'Hail damages crops.', difficulty: 1 },
    { russian: 'гололед', english: 'ice', pronunciation: '[aɪs]', example: 'Ice is slippery.', difficulty: 1 },
    { russian: 'мороз', english: 'frost', pronunciation: '[frɔːst]', example: 'Frost covers the ground.', difficulty: 1 },
    { russian: 'жара', english: 'heat', pronunciation: '[hiːt]', example: 'Heat makes you sweat.', difficulty: 1 },
    { russian: 'холод', english: 'cold', pronunciation: '[koʊld]', example: 'Cold air is crisp.', difficulty: 1 },
    { russian: 'тепло', english: 'warm', pronunciation: '[wɔːrm]', example: 'Warm weather is pleasant.', difficulty: 1 },
    { russian: 'прохлада', english: 'cool', pronunciation: '[kuːl]', example: 'Cool air is refreshing.', difficulty: 1 },
    { russian: 'влажность', english: 'humidity', pronunciation: '[hjuːˈmɪdəti]', example: 'Humidity makes air sticky.', difficulty: 3 },
    { russian: 'давление', english: 'pressure', pronunciation: '[ˈpreʃər]', example: 'Pressure affects weather.', difficulty: 2 },
    { russian: 'температура', english: 'temperature', pronunciation: '[ˈtemprətʃər]', example: 'Temperature changes daily.', difficulty: 2 },
    { russian: 'климат', english: 'climate', pronunciation: '[ˈklaɪmət]', example: 'Climate varies by region.', difficulty: 2 },
    { russian: 'сезон', english: 'season', pronunciation: '[ˈsiːzən]', example: 'Each season is different.', difficulty: 1 },
    { russian: 'весна', english: 'spring', pronunciation: '[sprɪŋ]', example: 'Spring brings new growth.', difficulty: 1 },
    { russian: 'лето', english: 'summer', pronunciation: '[ˈsʌmər]', example: 'Summer is warm.', difficulty: 1 },
    { russian: 'осень', english: 'autumn', pronunciation: '[ˈɔːtəm]', example: 'Autumn leaves are colorful.', difficulty: 1 },
    { russian: 'зима', english: 'winter', pronunciation: '[ˈwɪntər]', example: 'Winter is cold.', difficulty: 1 },
    { russian: 'буря', english: 'storm', pronunciation: '[stɔːrm]', example: 'Storms can be dangerous.', difficulty: 1 },
    { russian: 'ураган', english: 'hurricane', pronunciation: '[ˈhɜːrəkən]', example: 'Hurricanes are powerful.', difficulty: 2 },
    { russian: 'торнадо', english: 'tornado', pronunciation: '[tɔːrˈneɪdoʊ]', example: 'Tornadoes are destructive.', difficulty: 2 },
    { russian: 'туман', english: 'mist', pronunciation: '[mɪst]', example: 'Mist creates atmosphere.', difficulty: 1 },
    { russian: 'дымка', english: 'haze', pronunciation: '[heɪz]', example: 'Haze reduces visibility.', difficulty: 1 },
    { russian: 'рос', english: 'dew', pronunciation: '[duː]', example: 'Dew forms in morning.', difficulty: 1 },
    { russian: 'иней', english: 'hoarfrost', pronunciation: '[ˈhɔːrfroʊst]', example: 'Hoarfrost is beautiful.', difficulty: 2 },
    { russian: 'слякоть', english: 'slush', pronunciation: '[slʌʃ]', example: 'Slush is messy.', difficulty: 1 },
    { russian: 'грязь', english: 'mud', pronunciation: '[mʌd]', example: 'Mud sticks to shoes.', difficulty: 1 },
    { russian: 'лужа', english: 'puddle', pronunciation: '[ˈpʌdəl]', example: 'Puddles form after rain.', difficulty: 1 },
    { russian: 'засуха', english: 'drought', pronunciation: '[draʊt]', example: 'Drought dries the land.', difficulty: 2 },
    { russian: 'наводнение', english: 'flood', pronunciation: '[flʌd]', example: 'Floods cause damage.', difficulty: 2 },
    { russian: 'лавина', english: 'avalanche', pronunciation: '[ˈævəlæntʃ]', example: 'Avalanches are deadly.', difficulty: 3 },
    { russian: 'землетрясение', english: 'earthquake', pronunciation: '[ˈɜːrθkweɪk]', example: 'Earthquakes shake the ground.', difficulty: 3 },
    { russian: 'цунами', english: 'tsunami', pronunciation: '[suːˈnɑːmi]', example: 'Tsunamis are destructive.', difficulty: 3 },
    { russian: 'извержение', english: 'eruption', pronunciation: '[ɪˈrʌpʃən]', example: 'Volcanic eruptions are dangerous.', difficulty: 3 },
    { russian: 'вулкан', english: 'volcano', pronunciation: '[vɑːlˈkeɪnoʊ]', example: 'Volcanoes emit lava.', difficulty: 2 },
    { russian: 'извержение вулкана', english: 'volcanic eruption', pronunciation: '[vɑːlˈkænɪk ɪˈrʌpʃən]', example: 'Volcanic eruptions are spectacular.', difficulty: 3 },
    { russian: 'лава', english: 'lava', pronunciation: '[ˈlɑːvə]', example: 'Lava is molten rock.', difficulty: 2 },
    { russian: 'пепел', english: 'ash', pronunciation: '[æʃ]', example: 'Ash covers everything.', difficulty: 1 },
    { russian: 'дым', english: 'smoke', pronunciation: '[smoʊk]', example: 'Smoke rises from fires.', difficulty: 1 },
    { russian: 'огонь', english: 'fire', pronunciation: '[ˈfaɪər]', example: 'Fire spreads quickly.', difficulty: 1 },
    { russian: 'пламя', english: 'flame', pronunciation: '[fleɪm]', example: 'Flames dance in wind.', difficulty: 1 },
    { russian: 'искра', english: 'spark', pronunciation: '[spɑːrk]', example: 'Sparks fly upward.', difficulty: 1 },
    { russian: 'углекислый газ', english: 'carbon dioxide', pronunciation: '[ˈkɑːrbən daɪˈɑːksaɪd]', example: 'Carbon dioxide affects climate.', difficulty: 3 },
    { russian: 'кислород', english: 'oxygen', pronunciation: '[ˈɑːksɪdʒən]', example: 'Oxygen is essential.', difficulty: 2 },
    { russian: 'азот', english: 'nitrogen', pronunciation: '[ˈnaɪtrədʒən]', example: 'Nitrogen is abundant.', difficulty: 3 },
    { russian: 'водород', english: 'hydrogen', pronunciation: '[ˈhaɪdrədʒən]', example: 'Hydrogen is lightest.', difficulty: 3 },
    { russian: 'пар', english: 'steam', pronunciation: '[stiːm]', example: 'Steam rises from boiling water.', difficulty: 1 },
    { russian: 'влажность', english: 'moisture', pronunciation: '[ˈmɔɪstʃər]', example: 'Moisture causes humidity.', difficulty: 2 },
    { russian: 'испарение', english: 'evaporation', pronunciation: '[ɪˌvæpəˈreɪʃən]', example: 'Evaporation cools water.', difficulty: 3 },
    { russian: 'конденсация', english: 'condensation', pronunciation: '[ˌkɑːndenˈseɪʃən]', example: 'Condensation forms droplets.', difficulty: 3 }
  ]
};

async function addPopularWords() {
  console.log('🎯 Добавление популярных слов для animals, hobby, weather...\n');

  try {
    const db = await open({
      filename: './engcard.db',
      driver: sqlite3.Database
    });

    let totalAdded = 0;

    for (const [topicId, words] of Object.entries(wordsByTopic)) {
      console.log(`📚 Добавляем слова для темы "${topicId}"...`);
      
      let topicAdded = 0;
      
      for (const word of words) {
        const wordId = `${topicId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          await db.run(`
            INSERT INTO words (id, russian, english, topic_id, difficulty_level, pronunciation, example_sentence, usage_frequency)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            wordId,
            word.russian,
            word.english,
            topicId,
            word.difficulty,
            word.pronunciation,
            word.example,
            Math.floor(Math.random() * 100) + 1
          ]);
          
          topicAdded++;
          totalAdded++;
        } catch (error) {
          console.error(`❌ Ошибка при добавлении слова "${word.russian}":`, error.message);
        }
      }
      
      console.log(`✅ Добавлено ${topicAdded} слов для темы "${topicId}"`);
    }

    // Обновляем счетчики слов
    await db.run(`
      UPDATE topics SET words_count = (
        SELECT COUNT(*) FROM words WHERE topic_id = topics.id
      )
    `);

    // Проверяем результат
    const topics = await db.all('SELECT id, name, words_count FROM topics ORDER BY words_count DESC');
    const totalWords = await db.get('SELECT COUNT(*) as count FROM words');
    
    console.log('\n📊 Итоговая статистика:');
    console.log(`   - Всего слов в базе: ${totalWords.count}`);
    console.log(`   - Добавлено новых слов: ${totalAdded}`);
    console.log('\n📚 Слов по темам:');
    topics.forEach(topic => {
      console.log(`   - ${topic.name}: ${topic.words_count} слов`);
    });

    await db.close();
    console.log('\n🎉 Популярные слова успешно добавлены!');

  } catch (error) {
    console.error('❌ Ошибка при добавлении слов:', error.message);
  }
}

addPopularWords();
