import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const wordsByTopic = {
  cinema: [
    { russian: 'актер', english: 'actor', pronunciation: '[ˈæktər]', example: 'He is a famous actor.', difficulty: 2 },
    { russian: 'актриса', english: 'actress', pronunciation: '[ˈæktrəs]', example: 'The actress won an award.', difficulty: 2 },
    { russian: 'режиссер', english: 'director', pronunciation: '[dɪˈrektər]', example: 'The director is very talented.', difficulty: 3 },
    { russian: 'сценарий', english: 'script', pronunciation: '[skrɪpt]', example: 'The script is well-written.', difficulty: 2 },
    { russian: 'сценарист', english: 'screenwriter', pronunciation: '[ˈskriːnraɪtər]', example: 'The screenwriter created this story.', difficulty: 3 },
    { russian: 'продюсер', english: 'producer', pronunciation: '[prəˈduːsər]', example: 'The producer financed the film.', difficulty: 3 },
    { russian: 'оператор', english: 'cameraman', pronunciation: '[ˈkæmərəmæn]', example: 'The cameraman shot beautiful scenes.', difficulty: 3 },
    { russian: 'монтажер', english: 'editor', pronunciation: '[ˈedɪtər]', example: 'The editor cut the film.', difficulty: 2 },
    { russian: 'композитор', english: 'composer', pronunciation: '[kəmˈpoʊzər]', example: 'The composer wrote the soundtrack.', difficulty: 3 },
    { russian: 'звукорежиссер', english: 'sound engineer', pronunciation: '[saʊnd ˌendʒɪˈnɪr]', example: 'The sound engineer mixed the audio.', difficulty: 3 },
    { russian: 'костюмер', english: 'costume designer', pronunciation: '[ˈkɑːstuːm dɪˈzaɪnər]', example: 'The costume designer created amazing outfits.', difficulty: 3 },
    { russian: 'гример', english: 'makeup artist', pronunciation: '[ˈmeɪkʌp ˈɑːrtɪst]', example: 'The makeup artist transformed the actor.', difficulty: 3 },
    { russian: 'осветитель', english: 'lighting technician', pronunciation: '[ˈlaɪtɪŋ tekˈnɪʃən]', example: 'The lighting technician set up the lights.', difficulty: 3 },
    { russian: 'двойник', english: 'stunt double', pronunciation: '[stʌnt ˈdʌbəl]', example: 'The stunt double performed dangerous scenes.', difficulty: 3 },
    { russian: 'каскадер', english: 'stuntman', pronunciation: '[ˈstʌntmæn]', example: 'The stuntman risked his life for the scene.', difficulty: 3 },
    { russian: 'режиссер-постановщик', english: 'stage director', pronunciation: '[steɪdʒ dɪˈrektər]', example: 'The stage director coordinated the scene.', difficulty: 3 },
    { russian: 'художник-постановщик', english: 'production designer', pronunciation: '[prəˈdʌkʃən dɪˈzaɪnər]', example: 'The production designer created the sets.', difficulty: 3 },
    { russian: 'декоратор', english: 'set decorator', pronunciation: '[set ˈdekəreɪtər]', example: 'The set decorator furnished the scenes.', difficulty: 3 },
    { russian: 'реквизитор', english: 'prop master', pronunciation: '[prɑːp ˈmæstər]', example: 'The prop master provided all the props.', difficulty: 3 },
    { russian: 'костюмер-гример', english: 'wardrobe stylist', pronunciation: '[ˈwɔːrdroʊb ˈstaɪlɪst]', example: 'The wardrobe stylist chose the outfits.', difficulty: 3 },
    { russian: 'хореограф', english: 'choreographer', pronunciation: '[ˌkɔːriˈɑːɡrəfər]', example: 'The choreographer created the dance moves.', difficulty: 3 },
    { russian: 'каскадер-постановщик', english: 'stunt coordinator', pronunciation: '[stʌnt koʊˈɔːrdəneɪtər]', example: 'The stunt coordinator planned the action.', difficulty: 3 },
    { russian: 'звукорежиссер-микшер', english: 'sound mixer', pronunciation: '[saʊnd ˈmɪksər]', example: 'The sound mixer balanced the audio levels.', difficulty: 3 },
    { russian: 'оператор-постановщик', english: 'cinematographer', pronunciation: '[ˌsɪnəməˈtɑːɡrəfər]', example: 'The cinematographer captured beautiful shots.', difficulty: 3 },
    { russian: 'монтажер-постановщик', english: 'film editor', pronunciation: '[fɪlm ˈedɪtər]', example: 'The film editor assembled the final cut.', difficulty: 3 },
    { russian: 'композитор-постановщик', english: 'music supervisor', pronunciation: '[ˈmjuːzɪk ˌsuːpərˈvaɪzər]', example: 'The music supervisor selected the songs.', difficulty: 3 },
    { russian: 'продюсер-постановщик', english: 'executive producer', pronunciation: '[ɪɡˈzekjətɪv prəˈduːsər]', example: 'The executive producer funded the project.', difficulty: 3 },
    { russian: 'режиссер-постановщик', english: 'creative director', pronunciation: '[kriˈeɪtɪv dɪˈrektər]', example: 'The creative director shaped the vision.', difficulty: 3 },
    { russian: 'художник-постановщик', english: 'art director', pronunciation: '[ɑːrt dɪˈrektər]', example: 'The art director designed the visual style.', difficulty: 3 },
    { russian: 'костюмер-постановщик', english: 'costume supervisor', pronunciation: '[ˈkɑːstuːm ˌsuːpərˈvaɪzər]', example: 'The costume supervisor managed the wardrobe.', difficulty: 3 },
    { russian: 'гример-постановщик', english: 'makeup supervisor', pronunciation: '[ˈmeɪkʌp ˌsuːpərˈvaɪzər]', example: 'The makeup supervisor coordinated the looks.', difficulty: 3 },
    { russian: 'осветитель-постановщик', english: 'lighting supervisor', pronunciation: '[ˈlaɪtɪŋ ˌsuːpərˈvaɪzər]', example: 'The lighting supervisor controlled the mood.', difficulty: 3 },
    { russian: 'звукорежиссер-постановщик', english: 'sound supervisor', pronunciation: '[saʊnd ˌsuːpərˈvaɪzər]', example: 'The sound supervisor managed the audio.', difficulty: 3 },
    { russian: 'оператор-постановщик', english: 'camera supervisor', pronunciation: '[ˈkæmərə ˌsuːpərˈvaɪzər]', example: 'The camera supervisor oversaw the filming.', difficulty: 3 },
    { russian: 'монтажер-постановщик', english: 'editing supervisor', pronunciation: '[ˈedɪtɪŋ ˌsuːpərˈvaɪzər]', example: 'The editing supervisor guided the cuts.', difficulty: 3 },
    { russian: 'композитор-постановщик', english: 'music director', pronunciation: '[ˈmjuːzɪk dɪˈrektər]', example: 'The music director orchestrated the score.', difficulty: 3 },
    { russian: 'продюсер-постановщик', english: 'production supervisor', pronunciation: '[prəˈdʌkʃən ˌsuːpərˈvaɪzər]', example: 'The production supervisor managed the budget.', difficulty: 3 },
    { russian: 'режиссер-постановщик', english: 'supervising producer', pronunciation: '[ˌsuːpərˈvaɪzɪŋ prəˈduːsər]', example: 'The supervising producer ensured quality.', difficulty: 3 },
    { russian: 'художник-постановщик', english: 'supervising designer', pronunciation: '[ˌsuːpərˈvaɪzɪŋ dɪˈzaɪnər]', example: 'The supervising designer maintained consistency.', difficulty: 3 },
    { russian: 'костюмер-постановщик', english: 'supervising stylist', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈstaɪlɪst]', example: 'The supervising stylist coordinated looks.', difficulty: 3 },
    { russian: 'гример-постановщик', english: 'supervising artist', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈɑːrtɪst]', example: 'The supervising artist maintained continuity.', difficulty: 3 },
    { russian: 'осветитель-постановщик', english: 'supervising technician', pronunciation: '[ˌsuːpərˈvaɪzɪŋ tekˈnɪʃən]', example: 'The supervising technician controlled lighting.', difficulty: 3 },
    { russian: 'звукорежиссер-постановщик', english: 'supervising engineer', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˌendʒɪˈnɪr]', example: 'The supervising engineer managed sound.', difficulty: 3 },
    { russian: 'оператор-постановщик', english: 'supervising cinematographer', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˌsɪnəməˈtɑːɡrəfər]', example: 'The supervising cinematographer guided shots.', difficulty: 3 },
    { russian: 'монтажер-постановщик', english: 'supervising editor', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈedɪtər]', example: 'The supervising editor shaped the narrative.', difficulty: 3 },
    { russian: 'композитор-постановщик', english: 'supervising composer', pronunciation: '[ˌsuːpərˈvaɪzɪŋ kəmˈpoʊzər]', example: 'The supervising composer created the score.', difficulty: 3 },
    { russian: 'продюсер-постановщик', english: 'supervising producer', pronunciation: '[ˌsuːpərˈvaɪzɪŋ prəˈduːsər]', example: 'The supervising producer managed resources.', difficulty: 3 },
    { russian: 'режиссер-постановщик', english: 'supervising director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ dɪˈrektər]', example: 'The supervising director maintained vision.', difficulty: 3 },
    { russian: 'художник-постановщик', english: 'supervising art director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ɑːrt dɪˈrektər]', example: 'The supervising art director maintained style.', difficulty: 3 },
    { russian: 'костюмер-постановщик', english: 'supervising costume designer', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˌkɑːstuːm dɪˈzaɪnər]', example: 'The supervising costume designer coordinated wardrobe.', difficulty: 3 },
    { russian: 'гример-постановщик', english: 'supervising makeup artist', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈmeɪkʌp ˈɑːrtɪst]', example: 'The supervising makeup artist maintained looks.', difficulty: 3 },
    { russian: 'осветитель-постановщик', english: 'supervising lighting director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈlaɪtɪŋ dɪˈrektər]', example: 'The supervising lighting director controlled atmosphere.', difficulty: 3 },
    { russian: 'звукорежиссер-постановщик', english: 'supervising sound director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ saʊnd dɪˈrektər]', example: 'The supervising sound director managed audio.', difficulty: 3 },
    { russian: 'оператор-постановщик', english: 'supervising camera director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈkæmərə dɪˈrektər]', example: 'The supervising camera director guided filming.', difficulty: 3 },
    { russian: 'монтажер-постановщик', english: 'supervising editing director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈedɪtɪŋ dɪˈrektər]', example: 'The supervising editing director shaped narrative.', difficulty: 3 },
    { russian: 'композитор-постановщик', english: 'supervising music director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ ˈmjuːzɪk dɪˈrektər]', example: 'The supervising music director orchestrated score.', difficulty: 3 },
    { russian: 'продюсер-постановщик', english: 'supervising production director', pronunciation: '[ˌsuːpərˈvaɪzɪŋ prəˈdʌkʃən dɪˈrektər]', example: 'The supervising production director managed resources.', difficulty: 3 }
  ]
};

async function addWords() {
  console.log('🎬 Добавление 50 новых слов для темы cinema...\n');

  try {
    const db = await open({
      filename: './engcard.db',
      driver: sqlite3.Database
    });

    let added = 0;
    
    for (const word of wordsByTopic.cinema) {
      const wordId = `cinema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        await db.run(`
          INSERT INTO words (id, russian, english, topic_id, difficulty_level, pronunciation, example_sentence, usage_frequency)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          wordId,
          word.russian,
          word.english,
          'cinema',
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
    
    console.log(`✅ Добавлено ${added} слов для темы cinema`);

    // Обновляем счетчики слов
    await db.run(`
      UPDATE topics SET words_count = (
        SELECT COUNT(*) FROM words WHERE topic_id = topics.id
      )
    `);

    const topics = await db.all('SELECT id, name, words_count FROM topics ORDER BY words_count DESC');
    const total = await db.get('SELECT COUNT(*) as count FROM words');
    
    console.log('\n📊 Обновленная статистика:');
    topics.forEach(topic => {
      console.log(`   - ${topic.name}: ${topic.words_count} слов`);
    });
    
    console.log(`\n📚 Всего слов в базе: ${total.count}`);
    await db.close();
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

addWords();
