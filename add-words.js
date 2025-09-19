// Скрипт для добавления новых слов в базу данных
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'engcard.db');

// Словарь новых слов для каждого топика
const newWords = {
  music: [
    { russian: 'мелодия', english: 'melody', pronunciation: '[ˈmelədi]', example: 'The melody is beautiful.', difficulty: 2 },
    { russian: 'ритм', english: 'rhythm', pronunciation: '[ˈrɪðəm]', example: 'I love the rhythm of this song.', difficulty: 3 },
    { russian: 'концерт', english: 'concert', pronunciation: '[ˈkɑːnsərt]', example: 'We went to a rock concert.', difficulty: 2 },
    { russian: 'музыкант', english: 'musician', pronunciation: '[mjuˈzɪʃən]', example: 'He is a talented musician.', difficulty: 2 },
    { russian: 'оркестр', english: 'orchestra', pronunciation: '[ˈɔːrkɪstrə]', example: 'The orchestra played beautifully.', difficulty: 3 },
    { russian: 'скрипка', english: 'violin', pronunciation: '[ˌvaɪəˈlɪn]', example: 'She plays the violin perfectly.', difficulty: 2 },
    { russian: 'труба', english: 'trumpet', pronunciation: '[ˈtrʌmpɪt]', example: 'The trumpet sounds amazing.', difficulty: 2 },
    { russian: 'саксофон', english: 'saxophone', pronunciation: '[ˈsæksəfoʊn]', example: 'Jazz saxophone is my favorite.', difficulty: 3 },
    { russian: 'микрофон', english: 'microphone', pronunciation: '[ˈmaɪkrəfoʊn]', example: 'Please speak into the microphone.', difficulty: 3 },
    { russian: 'динамик', english: 'speaker', pronunciation: '[ˈspiːkər]', example: 'The speakers are very loud.', difficulty: 2 },
    { russian: 'наушники', english: 'headphones', pronunciation: '[ˈhedfoʊnz]', example: 'I use headphones to listen to music.', difficulty: 2 },
    { russian: 'радио', english: 'radio', pronunciation: '[ˈreɪdioʊ]', example: 'I listen to the radio every morning.', difficulty: 1 },
    { russian: 'альбом', english: 'album', pronunciation: '[ˈælbəm]', example: 'This is my favorite album.', difficulty: 2 },
    { russian: 'сингл', english: 'single', pronunciation: '[ˈsɪŋɡəl]', example: 'The new single is great.', difficulty: 2 },
    { russian: 'хит', english: 'hit', pronunciation: '[hɪt]', example: 'This song is a real hit.', difficulty: 1 },
    { russian: 'классика', english: 'classical', pronunciation: '[ˈklæsɪkəl]', example: 'I love classical music.', difficulty: 2 },
    { russian: 'джаз', english: 'jazz', pronunciation: '[dʒæz]', example: 'Jazz is very sophisticated.', difficulty: 1 },
    { russian: 'рок', english: 'rock', pronunciation: '[rɑːk]', example: 'Rock music is energetic.', difficulty: 1 },
    { russian: 'поп', english: 'pop', pronunciation: '[pɑːp]', example: 'Pop music is very popular.', difficulty: 1 },
    { russian: 'блюз', english: 'blues', pronunciation: '[bluːz]', example: 'The blues makes me feel emotional.', difficulty: 1 },
    { russian: 'кантри', english: 'country', pronunciation: '[ˈkʌntri]', example: 'Country music tells stories.', difficulty: 1 },
    { russian: 'электроника', english: 'electronic', pronunciation: '[ɪˌlekˈtrɑːnɪk]', example: 'Electronic music is modern.', difficulty: 3 },
    { russian: 'реп', english: 'rap', pronunciation: '[ræp]', example: 'Rap music has strong beats.', difficulty: 1 },
    { russian: 'хип-хоп', english: 'hip-hop', pronunciation: '[ˈhɪp hɑːp]', example: 'Hip-hop culture is influential.', difficulty: 2 },
    { russian: 'регги', english: 'reggae', pronunciation: '[ˈreɡeɪ]', example: 'Reggae music is relaxing.', difficulty: 1 },
    { russian: 'фолк', english: 'folk', pronunciation: '[foʊk]', example: 'Folk music is traditional.', difficulty: 1 },
    { russian: 'опера', english: 'opera', pronunciation: '[ˈɑːpərə]', example: 'Opera is very dramatic.', difficulty: 2 },
    { russian: 'балет', english: 'ballet', pronunciation: '[bæˈleɪ]', example: 'Ballet is graceful and beautiful.', difficulty: 2 },
    { russian: 'хор', english: 'choir', pronunciation: '[ˈkwaɪər]', example: 'The choir sang beautifully.', difficulty: 2 },
    { russian: 'солист', english: 'soloist', pronunciation: '[ˈsoʊloʊɪst]', example: 'The soloist has a great voice.', difficulty: 3 },
    { russian: 'дирижер', english: 'conductor', pronunciation: '[kənˈdʌktər]', example: 'The conductor leads the orchestra.', difficulty: 3 },
    { russian: 'композитор', english: 'composer', pronunciation: '[kəmˈpoʊzər]', example: 'Mozart was a great composer.', difficulty: 3 },
    { russian: 'текст', english: 'lyrics', pronunciation: '[ˈlɪrɪks]', example: 'The lyrics are very meaningful.', difficulty: 2 },
    { russian: 'припев', english: 'chorus', pronunciation: '[ˈkɔːrəs]', example: 'The chorus is catchy.', difficulty: 2 },
    { russian: 'куплет', english: 'verse', pronunciation: '[vɜːrs]', example: 'The first verse is beautiful.', difficulty: 2 },
    { russian: 'мотив', english: 'motif', pronunciation: '[moʊˈtiːf]', example: 'This motif repeats throughout.', difficulty: 3 },
    { russian: 'гармония', english: 'harmony', pronunciation: '[ˈhɑːrməni]', example: 'The harmony is perfect.', difficulty: 3 },
    { russian: 'аккорд', english: 'chord', pronunciation: '[kɔːrd]', example: 'This chord sounds beautiful.', difficulty: 2 },
    { russian: 'нота', english: 'note', pronunciation: '[noʊt]', example: 'Play this note correctly.', difficulty: 1 },
    { russian: 'тон', english: 'tone', pronunciation: '[toʊn]', example: 'The tone is very clear.', difficulty: 2 },
    { russian: 'темп', english: 'tempo', pronunciation: '[ˈtempoʊ]', example: 'The tempo is too fast.', difficulty: 2 },
    { russian: 'громкость', english: 'volume', pronunciation: '[ˈvɑːljuːm]', example: 'Turn up the volume.', difficulty: 2 },
    { russian: 'звук', english: 'sound', pronunciation: '[saʊnd]', example: 'The sound quality is excellent.', difficulty: 1 },
    { russian: 'шум', english: 'noise', pronunciation: '[nɔɪz]', example: 'There is too much noise.', difficulty: 1 },
    { russian: 'тишина', english: 'silence', pronunciation: '[ˈsaɪləns]', example: 'Silence is golden.', difficulty: 2 },
    { russian: 'эхо', english: 'echo', pronunciation: '[ˈekoʊ]', example: 'I can hear the echo.', difficulty: 1 },
    { russian: 'резонанс', english: 'resonance', pronunciation: '[ˈrezənəns]', example: 'The resonance is perfect.', difficulty: 3 },
    { russian: 'вибрация', english: 'vibration', pronunciation: '[vaɪˈbreɪʃən]', example: 'I can feel the vibration.', difficulty: 3 },
    { russian: 'частотa', english: 'frequency', pronunciation: '[ˈfriːkwənsi]', example: 'The frequency is high.', difficulty: 3 },
    { russian: 'амплитуда', english: 'amplitude', pronunciation: '[ˈæmplɪtuːd]', example: 'The amplitude is large.', difficulty: 3 },
    { russian: 'волна', english: 'wave', pronunciation: '[weɪv]', example: 'Sound travels in waves.', difficulty: 2 },
    { russian: 'сигнал', english: 'signal', pronunciation: '[ˈsɪɡnəl]', example: 'The signal is strong.', difficulty: 2 },
    { russian: 'трансляция', english: 'broadcast', pronunciation: '[ˈbrɔːdkæst]', example: 'The broadcast is live.', difficulty: 3 },
    { russian: 'запись', english: 'recording', pronunciation: '[rɪˈkɔːrdɪŋ]', example: 'This recording is clear.', difficulty: 2 },
    { russian: 'студия', english: 'studio', pronunciation: '[ˈstuːdioʊ]', example: 'We record in the studio.', difficulty: 2 },
    { russian: 'микс', english: 'mix', pronunciation: '[mɪks]', example: 'The mix sounds great.', difficulty: 1 },
    { russian: 'мастеринг', english: 'mastering', pronunciation: '[ˈmæstərɪŋ]', example: 'Mastering improves quality.', difficulty: 3 },
    { russian: 'сведение', english: 'mixing', pronunciation: '[ˈmɪksɪŋ]', example: 'Mixing is an art form.', difficulty: 2 },
    { russian: 'эффект', english: 'effect', pronunciation: '[ɪˈfekt]', example: 'This effect sounds cool.', difficulty: 2 },
    { russian: 'реверберация', english: 'reverb', pronunciation: '[rɪˈvɜːrb]', example: 'Add some reverb to the vocals.', difficulty: 3 },
    { russian: 'дисторшн', english: 'distortion', pronunciation: '[dɪˈstɔːrʃən]', example: 'Distortion makes it sound heavy.', difficulty: 3 },
    { russian: 'компрессор', english: 'compressor', pronunciation: '[kəmˈpresər]', example: 'The compressor evens out the sound.', difficulty: 3 },
    { russian: 'эквалайзер', english: 'equalizer', pronunciation: '[ˈiːkwəlaɪzər]', example: 'Adjust the equalizer settings.', difficulty: 3 },
    { russian: 'фильтр', english: 'filter', pronunciation: '[ˈfɪltər]', example: 'Apply a low-pass filter.', difficulty: 2 },
    { russian: 'синтезатор', english: 'synthesizer', pronunciation: '[ˈsɪnθəsaɪzər]', example: 'The synthesizer creates electronic sounds.', difficulty: 3 },
    { russian: 'семплер', english: 'sampler', pronunciation: '[ˈsæmplər]', example: 'The sampler plays recorded sounds.', difficulty: 3 },
    { russian: 'секвенсер', english: 'sequencer', pronunciation: '[ˈsiːkwənsər]', example: 'The sequencer arranges the music.', difficulty: 3 },
    { russian: 'миди', english: 'MIDI', pronunciation: '[ˈmɪdi]', example: 'MIDI allows digital communication.', difficulty: 3 },
    { russian: 'аудио', english: 'audio', pronunciation: '[ˈɔːdioʊ]', example: 'The audio quality is excellent.', difficulty: 2 },
    { russian: 'видео', english: 'video', pronunciation: '[ˈvɪdioʊ]', example: 'The video is synchronized with audio.', difficulty: 2 },
    { russian: 'стрим', english: 'stream', pronunciation: '[striːm]', example: 'I stream music online.', difficulty: 2 },
    { russian: 'подкаст', english: 'podcast', pronunciation: '[ˈpɑːdkæst]', example: 'I listen to podcasts daily.', difficulty: 2 },
    { russian: 'плейлист', english: 'playlist', pronunciation: '[ˈpleɪlɪst]', example: 'This is my favorite playlist.', difficulty: 2 },
    { russian: 'скачать', english: 'download', pronunciation: '[ˈdaʊnloʊd]', example: 'I need to download this song.', difficulty: 2 },
    { russian: 'загрузить', english: 'upload', pronunciation: '[ˈʌploʊd]', example: 'Upload your music to the platform.', difficulty: 2 },
    { russian: 'поделиться', english: 'share', pronunciation: '[ʃer]', example: 'Share this song with friends.', difficulty: 1 },
    { russian: 'лайк', english: 'like', pronunciation: '[laɪk]', example: 'Like this song if you enjoy it.', difficulty: 1 },
    { russian: 'подписка', english: 'subscription', pronunciation: '[səbˈskrɪpʃən]', example: 'I have a music subscription.', difficulty: 3 },
    { russian: 'премиум', english: 'premium', pronunciation: '[ˈpriːmiəm]', example: 'Premium features are available.', difficulty: 2 },
    { russian: 'бесплатно', english: 'free', pronunciation: '[friː]', example: 'This app is free to use.', difficulty: 1 },
    { russian: 'платно', english: 'paid', pronunciation: '[peɪd]', example: 'This is a paid service.', difficulty: 1 },
    { russian: 'пробная версия', english: 'trial', pronunciation: '[ˈtraɪəl]', example: 'Try the free trial first.', difficulty: 2 },
    { russian: 'лицензия', english: 'license', pronunciation: '[ˈlaɪsəns]', example: 'You need a license to use this.', difficulty: 2 },
    { russian: 'авторские права', english: 'copyright', pronunciation: '[ˈkɑːpiraɪt]', example: 'Copyright protects the artist.', difficulty: 3 },
    { russian: 'роялти', english: 'royalty', pronunciation: '[ˈrɔɪəlti]', example: 'Artists earn royalties from sales.', difficulty: 3 },
    { russian: 'контракт', english: 'contract', pronunciation: '[ˈkɑːntrækt]', example: 'Sign the recording contract.', difficulty: 2 },
    { russian: 'менеджер', english: 'manager', pronunciation: '[ˈmænɪdʒər]', example: 'The manager handles bookings.', difficulty: 2 },
    { russian: 'продюсер', english: 'producer', pronunciation: '[prəˈduːsər]', example: 'The producer oversees the project.', difficulty: 2 },
    { russian: 'агент', english: 'agent', pronunciation: '[ˈeɪdʒənt]', example: 'The agent negotiates deals.', difficulty: 2 },
    { russian: 'тур', english: 'tour', pronunciation: '[tʊr]', example: 'The band is on tour.', difficulty: 1 },
    { russian: 'гастроли', english: 'tour', pronunciation: '[tʊr]', example: 'They are touring Europe.', difficulty: 2 },
    { russian: 'концертная площадка', english: 'venue', pronunciation: '[ˈvenjuː]', example: 'The venue is sold out.', difficulty: 2 },
    { russian: 'сцена', english: 'stage', pronunciation: '[steɪdʒ]', example: 'The stage is ready for the show.', difficulty: 1 },
    { russian: 'аудитория', english: 'audience', pronunciation: '[ˈɔːdiəns]', example: 'The audience is excited.', difficulty: 2 },
    { russian: 'фанат', english: 'fan', pronunciation: '[fæn]', example: 'I am a big fan of this band.', difficulty: 1 },
    { russian: 'поклонник', english: 'fan', pronunciation: '[fæn]', example: 'The fans are very loyal.', difficulty: 2 },
    { russian: 'группа', english: 'band', pronunciation: '[bænd]', example: 'The band is very popular.', difficulty: 1 },
    { russian: 'ансамбль', english: 'ensemble', pronunciation: '[ɑːnˈsɑːmbəl]', example: 'The ensemble plays together.', difficulty: 3 },
    { russian: 'дуэт', english: 'duet', pronunciation: '[duˈet]', example: 'They sing a beautiful duet.', difficulty: 2 },
    { russian: 'трио', english: 'trio', pronunciation: '[ˈtriːoʊ]', example: 'The jazz trio is amazing.', difficulty: 2 },
    { russian: 'квартет', english: 'quartet', pronunciation: '[kwɔːrˈtet]', example: 'The string quartet is elegant.', difficulty: 3 },
    { russian: 'квинтет', english: 'quintet', pronunciation: '[kwɪnˈtet]', example: 'The brass quintet sounds great.', difficulty: 3 },
    { russian: 'секстет', english: 'sextet', pronunciation: '[seksˈtet]', example: 'The sextet has six members.', difficulty: 3 },
    { russian: 'октет', english: 'octet', pronunciation: '[ɑːkˈtet]', example: 'The octet is very harmonious.', difficulty: 3 },
    { russian: 'хор', english: 'choir', pronunciation: '[ˈkwaɪər]', example: 'The choir has many voices.', difficulty: 2 },
    { russian: 'хорист', english: 'chorister', pronunciation: '[ˈkɔːrɪstər]', example: 'The chorister sings beautifully.', difficulty: 3 },
    { russian: 'тенор', english: 'tenor', pronunciation: '[ˈtenər]', example: 'The tenor has a high voice.', difficulty: 2 },
    { russian: 'баритон', english: 'baritone', pronunciation: '[ˈbærətoʊn]', example: 'The baritone has a deep voice.', difficulty: 3 },
    { russian: 'бас', english: 'bass', pronunciation: '[beɪs]', example: 'The bass has the lowest voice.', difficulty: 2 },
    { russian: 'сопрано', english: 'soprano', pronunciation: '[səˈprænoʊ]', example: 'The soprano has a high voice.', difficulty: 2 },
    { russian: 'меццо-сопрано', english: 'mezzo-soprano', pronunciation: '[ˈmetsoʊ səˈprænoʊ]', example: 'The mezzo-soprano has a medium voice.', difficulty: 3 },
    { russian: 'альт', english: 'alto', pronunciation: '[ˈæltoʊ]', example: 'The alto has a low female voice.', difficulty: 2 },
    { russian: 'контральто', english: 'contralto', pronunciation: '[kənˈtræltoʊ]', example: 'The contralto has the lowest female voice.', difficulty: 3 },
    { russian: 'кастрат', english: 'castrato', pronunciation: '[kæˈstrɑːtoʊ]', example: 'Castrati were popular in opera.', difficulty: 3 },
    { russian: 'фальцет', english: 'falsetto', pronunciation: '[fɔːlˈsetoʊ]', example: 'He sings in falsetto.', difficulty: 3 },
    { russian: 'вибрато', english: 'vibrato', pronunciation: '[vɪˈbrɑːtoʊ]', example: 'The vibrato adds expression.', difficulty: 3 },
    { russian: 'тремоло', english: 'tremolo', pronunciation: '[ˈtreməloʊ]', example: 'The tremolo creates tension.', difficulty: 3 },
    { russian: 'стаккато', english: 'staccato', pronunciation: '[stəˈkɑːtoʊ]', example: 'Play the notes staccato.', difficulty: 3 },
    { russian: 'легато', english: 'legato', pronunciation: '[ləˈɡɑːtoʊ]', example: 'Play the notes legato.', difficulty: 3 },
    { russian: 'портаменто', english: 'portamento', pronunciation: '[ˌpɔːrtəˈmentoʊ]', example: 'The portamento slides between notes.', difficulty: 3 },
    { russian: 'глиссандо', english: 'glissando', pronunciation: '[ɡlɪˈsændoʊ]', example: 'The glissando slides smoothly.', difficulty: 3 },
    { russian: 'пиццикато', english: 'pizzicato', pronunciation: '[ˌpɪtsɪˈkɑːtoʊ]', example: 'Play pizzicato with your fingers.', difficulty: 3 },
    { russian: 'арко', english: 'arco', pronunciation: '[ˈɑːrkoʊ]', example: 'Play arco with the bow.', difficulty: 3 },
    { russian: 'сурдина', english: 'mute', pronunciation: '[mjuːt]', example: 'Use the mute to soften the sound.', difficulty: 2 },
    { russian: 'смычок', english: 'bow', pronunciation: '[boʊ]', example: 'The bow is made of wood and hair.', difficulty: 2 },
    { russian: 'струна', english: 'string', pronunciation: '[strɪŋ]', example: 'The string is broken.', difficulty: 1 },
    { russian: 'лад', english: 'fret', pronunciation: '[fret]', example: 'Press the string at the third fret.', difficulty: 2 },
    { russian: 'гриф', english: 'neck', pronunciation: '[nek]', example: 'The neck of the guitar is smooth.', difficulty: 2 },
    { russian: 'корпус', english: 'body', pronunciation: '[ˈbɑːdi]', example: 'The body of the guitar is hollow.', difficulty: 2 },
    { russian: 'головка', english: 'headstock', pronunciation: '[ˈhedstɑːk]', example: 'The tuning pegs are on the headstock.', difficulty: 3 },
    { russian: 'колок', english: 'tuning peg', pronunciation: '[ˈtuːnɪŋ peɡ]', example: 'Turn the tuning peg to tune.', difficulty: 3 },
    { russian: 'бридж', english: 'bridge', pronunciation: '[brɪdʒ]', example: 'The bridge holds the strings.', difficulty: 2 },
    { russian: 'подставка', english: 'bridge', pronunciation: '[brɪdʒ]', example: 'The bridge is made of wood.', difficulty: 2 },
    { russian: 'порожек', english: 'nut', pronunciation: '[nʌt]', example: 'The nut guides the strings.', difficulty: 2 },
    { russian: 'звукосниматель', english: 'pickup', pronunciation: '[ˈpɪkʌp]', example: 'The pickup converts vibrations to electricity.', difficulty: 3 },
    { russian: 'усилитель', english: 'amplifier', pronunciation: '[ˈæmpləfaɪər]', example: 'The amplifier makes the sound louder.', difficulty: 3 },
    { russian: 'кабель', english: 'cable', pronunciation: '[ˈkeɪbəl]', example: 'Connect the cable to the amplifier.', difficulty: 2 },
    { russian: 'штекер', english: 'plug', pronunciation: '[plʌɡ]', example: 'Insert the plug into the socket.', difficulty: 2 },
    { russian: 'розетка', english: 'socket', pronunciation: '[ˈsɑːkɪt]', example: 'The socket is on the amplifier.', difficulty: 2 },
    { russian: 'педаль', english: 'pedal', pronunciation: '[ˈpedəl]', example: 'Step on the pedal to activate the effect.', difficulty: 2 },
    { russian: 'эффект-педаль', english: 'effects pedal', pronunciation: '[ɪˈfekts ˈpedəl]', example: 'The effects pedal changes the sound.', difficulty: 3 },
    { russian: 'дисторшн-педаль', english: 'distortion pedal', pronunciation: '[dɪˈstɔːrʃən ˈpedəl]', example: 'The distortion pedal makes it sound heavy.', difficulty: 3 },
    { russian: 'овердрайв-педаль', english: 'overdrive pedal', pronunciation: '[ˈoʊvərdraɪv ˈpedəl]', example: 'The overdrive pedal adds warmth.', difficulty: 3 },
    { russian: 'фузз-педаль', english: 'fuzz pedal', pronunciation: '[fʌz ˈpedəl]', example: 'The fuzz pedal creates a fuzzy sound.', difficulty: 3 },
    { russian: 'вау-вау-педаль', english: 'wah-wah pedal', pronunciation: '[wɑː wɑː ˈpedəl]', example: 'The wah-wah pedal changes the tone.', difficulty: 3 },
    { russian: 'фленджер-педаль', english: 'flanger pedal', pronunciation: '[ˈflændʒər ˈpedəl]', example: 'The flanger pedal creates a sweeping effect.', difficulty: 3 },
    { russian: 'хорус-педаль', english: 'chorus pedal', pronunciation: '[ˈkɔːrəs ˈpedəl]', example: 'The chorus pedal thickens the sound.', difficulty: 3 },
    { russian: 'фейзер-педаль', english: 'phaser pedal', pronunciation: '[ˈfeɪzər ˈpedəl]', example: 'The phaser pedal creates a swirling effect.', difficulty: 3 },
    { russian: 'тремоло-педаль', english: 'tremolo pedal', pronunciation: '[ˈtreməloʊ ˈpedəl]', example: 'The tremolo pedal modulates the volume.', difficulty: 3 },
    { russian: 'вибрато-педаль', english: 'vibrato pedal', pronunciation: '[vɪˈbrɑːtoʊ ˈpedəl]', example: 'The vibrato pedal modulates the pitch.', difficulty: 3 },
    { russian: 'делей-педаль', english: 'delay pedal', pronunciation: '[dɪˈleɪ ˈpedəl]', example: 'The delay pedal creates echoes.', difficulty: 3 },
    { russian: 'риверб-педаль', english: 'reverb pedal', pronunciation: '[rɪˈvɜːrb ˈpedəl]', example: 'The reverb pedal adds space.', difficulty: 3 },
    { russian: 'компрессор-педаль', english: 'compressor pedal', pronunciation: '[kəmˈpresər ˈpedəl]', example: 'The compressor pedal evens out dynamics.', difficulty: 3 },
    { russian: 'эквалайзер-педаль', english: 'equalizer pedal', pronunciation: '[ˈiːkwəlaɪzər ˈpedəl]', example: 'The equalizer pedal shapes the tone.', difficulty: 3 },
    { russian: 'тюнер-педаль', english: 'tuner pedal', pronunciation: '[ˈtuːnər ˈpedəl]', example: 'The tuner pedal helps you tune.', difficulty: 3 },
    { russian: 'бустер-педаль', english: 'booster pedal', pronunciation: '[ˈbuːstər ˈpedəl]', example: 'The booster pedal increases the signal.', difficulty: 3 },
    { russian: 'буффер-педаль', english: 'buffer pedal', pronunciation: '[ˈbʌfər ˈpedəl]', example: 'The buffer pedal preserves the signal.', difficulty: 3 },
    { russian: 'шумоподавитель-педаль', english: 'noise gate pedal', pronunciation: '[nɔɪz ɡeɪt ˈpedəl]', example: 'The noise gate pedal reduces noise.', difficulty: 3 },
    { russian: 'октавер-педаль', english: 'octaver pedal', pronunciation: '[ˈɑːkteɪvər ˈpedəl]', example: 'The octaver pedal adds lower octaves.', difficulty: 3 },
    { russian: 'питч-шифтер-педаль', english: 'pitch shifter pedal', pronunciation: '[pɪtʃ ˈʃɪftər ˈpedəl]', example: 'The pitch shifter pedal changes pitch.', difficulty: 3 },
    { russian: 'гармонизатор-педаль', english: 'harmonizer pedal', pronunciation: '[ˈhɑːrmənaɪzər ˈpedəl]', example: 'The harmonizer pedal adds harmonies.', difficulty: 3 },
    { russian: 'вокодер-педаль', english: 'vocoder pedal', pronunciation: '[ˈvoʊkoʊdər ˈpedəl]', example: 'The vocoder pedal processes vocals.', difficulty: 3 },
    { russian: 'авто-вау-педаль', english: 'auto-wah pedal', pronunciation: '[ˈɔːtoʊ wɑː ˈpedəl]', example: 'The auto-wah pedal responds to dynamics.', difficulty: 3 },
    { russian: 'энвелоп-фильтр-педаль', english: 'envelope filter pedal', pronunciation: '[ˈenvəloʊp ˈfɪltər ˈpedəl]', example: 'The envelope filter pedal responds to attack.', difficulty: 3 },
    { russian: 'бит-крашер-педаль', english: 'bit crusher pedal', pronunciation: '[bɪt ˈkrʌʃər ˈpedəl]', example: 'The bit crusher pedal adds digital distortion.', difficulty: 3 },
    { russian: 'кольцевой модулятор-педаль', english: 'ring modulator pedal', pronunciation: '[rɪŋ ˈmɑːdʒəleɪtər ˈpedəl]', example: 'The ring modulator pedal creates metallic sounds.', difficulty: 3 },
    { russian: 'частотный шифтер-педаль', english: 'frequency shifter pedal', pronunciation: '[ˈfriːkwənsi ˈʃɪftər ˈpedəl]', example: 'The frequency shifter pedal shifts frequencies.', difficulty: 3 },
    { russian: 'спектральный процессор-педаль', english: 'spectral processor pedal', pronunciation: '[ˈspektrəl ˈprɑːsesər ˈpedəl]', example: 'The spectral processor pedal processes frequencies.', difficulty: 3 },
    { russian: 'многоэффект-педаль', english: 'multi-effects pedal', pronunciation: '[ˈmʌlti ɪˈfekts ˈpedəl]', example: 'The multi-effects pedal has many effects.', difficulty: 3 },
    { russian: 'процессор-педаль', english: 'processor pedal', pronunciation: '[ˈprɑːsesər ˈpedəl]', example: 'The processor pedal processes the signal.', difficulty: 3 },
    { russian: 'моделер-педаль', english: 'modeler pedal', pronunciation: '[ˈmɑːdələr ˈpedəl]', example: 'The modeler pedal models amplifiers.', difficulty: 3 },
    { russian: 'симулятор-педаль', english: 'simulator pedal', pronunciation: '[ˈsɪmjəleɪtər ˈpedəl]', example: 'The simulator pedal simulates gear.', difficulty: 3 },
    { russian: 'эмулятор-педаль', english: 'emulator pedal', pronunciation: '[ˈemjəleɪtər ˈpedəl]', example: 'The emulator pedal emulates vintage gear.', difficulty: 3 },
    { russian: 'клонизатор-педаль', english: 'cloner pedal', pronunciation: '[ˈkloʊnər ˈpedəl]', example: 'The cloner pedal clones famous pedals.', difficulty: 3 },
    { russian: 'реплика-педаль', english: 'replica pedal', pronunciation: '[rɪˈplɪkə ˈpedəl]', example: 'The replica pedal replicates vintage sounds.', difficulty: 3 },
    { russian: 'копия-педаль', english: 'copy pedal', pronunciation: '[ˈkɑːpi ˈpedəl]', example: 'The copy pedal copies famous tones.', difficulty: 3 },
    { russian: 'имитатор-педаль', english: 'imitator pedal', pronunciation: '[ˈɪməteɪtər ˈpedəl]', example: 'The imitator pedal imitates classic sounds.', difficulty: 3 },
    { russian: 'подражатель-педаль', english: 'mimic pedal', pronunciation: '[ˈmɪmɪk ˈpedəl]', example: 'The mimic pedal mimics famous tones.', difficulty: 3 },
    { russian: 'воспроизводитель-педаль', english: 'reproducer pedal', pronunciation: '[ˌriːprəˈduːsər ˈpedəl]', example: 'The reproducer pedal reproduces classic sounds.', difficulty: 3 },
    { russian: 'воссоздатель-педаль', english: 'recreator pedal', pronunciation: '[ˌriːkriˈeɪtər ˈpedəl]', example: 'The recreator pedal recreates vintage tones.', difficulty: 3 },
    { russian: 'восстановитель-педаль', english: 'restorer pedal', pronunciation: '[rɪˈstɔːrər ˈpedəl]', example: 'The restorer pedal restores classic sounds.', difficulty: 3 },
    { russian: 'реставратор-педаль', english: 'restorer pedal', pronunciation: '[rɪˈstɔːrər ˈpedəl]', example: 'The restorer pedal restores vintage tones.', difficulty: 3 },
    { russian: 'реконструктор-педаль', english: 'reconstructor pedal', pronunciation: '[ˌriːkənˈstrʌktər ˈpedəl]', example: 'The reconstructor pedal reconstructs classic sounds.', difficulty: 3 },
    { russian: 'реконструктор-педаль', english: 'reconstructor pedal', pronunciation: '[ˌriːkənˈstrʌktər ˈpedəl]', example: 'The reconstructor pedal reconstructs vintage tones.', difficulty: 3 }
  ]
};

async function addWords() {
  console.log('🔀 Добавление новых слов в базу данных...\n');

  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ База данных открыта');

    let totalAdded = 0;

    for (const [topicId, words] of Object.entries(newWords)) {
      console.log(`\n📚 Добавляем слова для темы "${topicId}"...`);
      
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

    // Обновляем счетчики слов для всех тем
    console.log('\n🔄 Обновляем счетчики слов...');
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
    console.log('\n🎉 Новые слова успешно добавлены!');

  } catch (error) {
    console.error('❌ Ошибка при добавлении слов:', error.message);
  }
}

addWords();


