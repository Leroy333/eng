import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const travelWords = [
  { russian: 'путешествие', english: 'journey', pronunciation: '[ˈdʒɜːrni]', example: 'The journey was amazing.', difficulty: 2 },
  { russian: 'багаж', english: 'luggage', pronunciation: '[ˈlʌɡɪdʒ]', example: 'Pack your luggage carefully.', difficulty: 2 },
  { russian: 'чемодан', english: 'suitcase', pronunciation: '[ˈsuːtkeɪs]', example: 'The suitcase is heavy.', difficulty: 1 },
  { russian: 'рюкзак', english: 'backpack', pronunciation: '[ˈbækpæk]', example: 'I carry a backpack when hiking.', difficulty: 1 },
  { russian: 'билет', english: 'ticket', pronunciation: '[ˈtɪkɪt]', example: 'Buy your ticket online.', difficulty: 1 },
  { russian: 'виза', english: 'visa', pronunciation: '[ˈviːzə]', example: 'You need a visa to enter.', difficulty: 2 },
  { russian: 'граница', english: 'border', pronunciation: '[ˈbɔːrdər]', example: 'Cross the border safely.', difficulty: 2 },
  { russian: 'таможня', english: 'customs', pronunciation: '[ˈkʌstəmz]', example: 'Declare items at customs.', difficulty: 3 },
  { russian: 'аэропорт', english: 'airport', pronunciation: '[ˈerpɔːrt]', example: 'The airport is busy today.', difficulty: 1 },
  { russian: 'вокзал', english: 'station', pronunciation: '[ˈsteɪʃən]', example: 'Meet me at the station.', difficulty: 1 },
  { russian: 'автовокзал', english: 'bus station', pronunciation: '[bʌs ˈsteɪʃən]', example: 'The bus station is crowded.', difficulty: 2 },
  { russian: 'порт', english: 'port', pronunciation: '[pɔːrt]', example: 'Ships arrive at the port.', difficulty: 2 },
  { russian: 'пристань', english: 'pier', pronunciation: '[pɪr]', example: 'Walk along the pier.', difficulty: 2 },
  { russian: 'причал', english: 'dock', pronunciation: '[dɑːk]', example: 'The boat is at the dock.', difficulty: 2 },
  { russian: 'терминал', english: 'terminal', pronunciation: '[ˈtɜːrmɪnəl]', example: 'Find gate 5 in terminal B.', difficulty: 2 },
  { russian: 'выход', english: 'gate', pronunciation: '[ɡeɪt]', example: 'Boarding at gate 12.', difficulty: 1 },
  { russian: 'посадка', english: 'boarding', pronunciation: '[ˈbɔːrdɪŋ]', example: 'Boarding starts at 3 PM.', difficulty: 2 },
  { russian: 'взлет', english: 'takeoff', pronunciation: '[ˈteɪkɔːf]', example: 'The takeoff was smooth.', difficulty: 2 },
  { russian: 'посадка', english: 'landing', pronunciation: '[ˈlændɪŋ]', example: 'The landing was perfect.', difficulty: 2 },
  { russian: 'рейс', english: 'flight', pronunciation: '[flaɪt]', example: 'My flight is delayed.', difficulty: 1 },
  { russian: 'маршрут', english: 'route', pronunciation: '[ruːt]', example: 'Plan your route carefully.', difficulty: 2 },
  { russian: 'расписание', english: 'schedule', pronunciation: '[ˈskedʒuːl]', example: 'Check the train schedule.', difficulty: 2 },
  { russian: 'задержка', english: 'delay', pronunciation: '[dɪˈleɪ]', example: 'There is a 30-minute delay.', difficulty: 2 },
  { russian: 'отмена', english: 'cancellation', pronunciation: '[ˌkænsəˈleɪʃən]', example: 'Flight cancellation is announced.', difficulty: 3 },
  { russian: 'пересадка', english: 'transfer', pronunciation: '[ˈtrænsfər]', example: 'You have a transfer in Paris.', difficulty: 2 },
  { russian: 'прямой', english: 'direct', pronunciation: '[dɪˈrekt]', example: 'Take a direct flight.', difficulty: 1 },
  { russian: 'туда-обратно', english: 'round trip', pronunciation: '[raʊnd trɪp]', example: 'Buy a round trip ticket.', difficulty: 2 },
  { russian: 'в одну сторону', english: 'one way', pronunciation: '[wʌn weɪ]', example: 'I need a one way ticket.', difficulty: 2 },
  { russian: 'бронирование', english: 'booking', pronunciation: '[ˈbʊkɪŋ]', example: 'Confirm your booking online.', difficulty: 2 },
  { russian: 'резервация', english: 'reservation', pronunciation: '[ˌrezərˈveɪʃən]', example: 'Make a hotel reservation.', difficulty: 3 },
  { russian: 'отель', english: 'hotel', pronunciation: '[hoʊˈtel]', example: 'The hotel is luxurious.', difficulty: 1 },
  { russian: 'мотель', english: 'motel', pronunciation: '[moʊˈtel]', example: 'Stay at a roadside motel.', difficulty: 2 },
  { russian: 'хостел', english: 'hostel', pronunciation: '[ˈhɑːstəl]', example: 'Hostels are budget-friendly.', difficulty: 2 },
  { russian: 'гостиница', english: 'inn', pronunciation: '[ɪn]', example: 'The country inn is cozy.', difficulty: 2 },
  { russian: 'пансион', english: 'guesthouse', pronunciation: '[ˈɡesthaʊs]', example: 'Stay at a family guesthouse.', difficulty: 2 },
  { russian: 'курорт', english: 'resort', pronunciation: '[rɪˈzɔːrt]', example: 'The beach resort is beautiful.', difficulty: 2 },
  { russian: 'кемпинг', english: 'campsite', pronunciation: '[ˈkæmpsaɪt]', example: 'Set up camp at the campsite.', difficulty: 2 },
  { russian: 'палатка', english: 'tent', pronunciation: '[tent]', example: 'Sleep in a tent under stars.', difficulty: 1 },
  { russian: 'спальный мешок', english: 'sleeping bag', pronunciation: '[ˈsliːpɪŋ bæɡ]', example: 'Bring a warm sleeping bag.', difficulty: 2 },
  { russian: 'костер', english: 'campfire', pronunciation: '[ˈkæmpfaɪər]', example: 'Gather around the campfire.', difficulty: 2 },
  { russian: 'поход', english: 'hike', pronunciation: '[haɪk]', example: 'Go for a mountain hike.', difficulty: 1 },
  { russian: 'тропа', english: 'trail', pronunciation: '[treɪl]', example: 'Follow the hiking trail.', difficulty: 2 },
  { russian: 'компас', english: 'compass', pronunciation: '[ˈkʌmpəs]', example: 'Use a compass for navigation.', difficulty: 2 },
  { russian: 'карта', english: 'map', pronunciation: '[mæp]', example: 'Study the map carefully.', difficulty: 1 },
  { russian: 'GPS', english: 'GPS', pronunciation: '[ˌdʒiː piː ˈes]', example: 'GPS helps with navigation.', difficulty: 2 },
  { russian: 'путеводитель', english: 'guidebook', pronunciation: '[ˈɡaɪdbʊk]', example: 'Buy a travel guidebook.', difficulty: 2 },
  { russian: 'экскурсия', english: 'tour', pronunciation: '[tʊr]', example: 'Join a city tour.', difficulty: 1 },
  { russian: 'гид', english: 'guide', pronunciation: '[ɡaɪd]', example: 'The guide knows the area well.', difficulty: 1 },
  { russian: 'туристический', english: 'tourist', pronunciation: '[ˈtʊrɪst]', example: 'Visit the tourist attractions.', difficulty: 2 },
  { russian: 'достопримечательность', english: 'attraction', pronunciation: '[əˈtrækʃən]', example: 'This is a popular attraction.', difficulty: 3 }
];

async function addTravelWords() {
  console.log('🚂 Добавление 50 новых слов для темы travel...\n');

  try {
    const db = await open({
      filename: './engcard.db',
      driver: sqlite3.Database
    });

    let added = 0;
    
    for (const word of travelWords) {
      const wordId = `travel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        await db.run(`
          INSERT INTO words (id, russian, english, topic_id, difficulty_level, pronunciation, example_sentence, usage_frequency)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          wordId,
          word.russian,
          word.english,
          'travel',
          word.difficulty,
          word.pronunciation,
          word.example,
          Math.floor(Math.random() * 100) + 1
        ]);
        
        added++;
      } catch (error) {
        console.error(`❌ Ошибка при добавлении слова "${word.russian}":`, error.message);
      }
    }
    
    console.log(`✅ Добавлено ${added} слов для темы travel`);

    // Обновляем счетчики слов
    await db.run(`
      UPDATE topics SET words_count = (
        SELECT COUNT(*) FROM words WHERE topic_id = topics.id
      )
    `);

    await db.close();
    console.log('🎉 Готово!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

addTravelWords();
