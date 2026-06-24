const axios = require('axios');

const DATABASE_URL = 'https://safespace-d74dc-default-rtdb.firebaseio.com';

const botNames = [
  'さくら', 'あかり', 'ひまり', 'ゆい', 'なな', 'ほのか', 'れい', 'あおい',
  'はな', 'みずき', 'ここ', 'りん', 'ゆめ', 'そら', 'めい', 'ちさと',
  'あみ', 'えみり', 'きょう', 'こころ', 'しおり', 'せいら', 'たえ', 'つぐみ',
  'てん', 'なぎさ', 'なつき', 'のぞみ', 'はづき', 'ひかり', 'ひな', 'ほたる',
  'まい', 'まきあ', 'まこと', 'まり', 'みき', 'みん', 'むつき', 'めい',
  'ゆかり', 'ゆき', 'ゆずき', 'よしか', 'らい', 'りさ', 'りな', 'るい',
  'れな', 'ろこ', 'わかな', 'あいり', 'あいす', 'あおば', 'あかね', 'あかり',
  'あきら', 'あすか', 'あずさ', 'あみ', 'あやね', 'あゆ', 'いおり', 'いくよ',
  'いずみ', 'いちご', 'いつき', 'いのり', 'いろは', 'うみ', 'うめ', 'えいみ',
  'えな', 'えみ', 'おとは', 'かおり', 'かすみ', 'かな', 'かなで', 'かの',
];

const bios = [
  '女性限定コミュニティが好きです',
  '楽しい毎日を過ごしたい',
  'フレンドリーなので気軽に話しかけてね',
  '安全な場所で交流したい',
  '新しい友達を探しています',
];

async function addBotUsers() {
  let addedCount = 0;

  for (let i = 0; i < 100; i++) {
    const botId = `bot_${String(i + 1).padStart(3, '0')}`;
    const botName = botNames[i % botNames.length];
    const botEmail = `bot${i + 1}@safespace.jp`;
    const bio = bios[i % bios.length];

    const userData = {
      id: botId,
      email: botEmail,
      name: `${botName}${i + 1}`,
      bio: bio,
      createdAt: new Date().toISOString(),
      emailVerified: true,
      identityVerified: true,
      following: {},
      followers: {},
      posts: {},
    };

    try {
      const response = await axios.put(
        `${DATABASE_URL}/users/${botId}.json`,
        userData
      );

      if (response.status === 200) {
        addedCount++;
        console.log(`✅ ${addedCount}/100 - ${userData.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to add bot ${i + 1}:`, error.message);
    }

    // API制限回避のため少し待機
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✨ Successfully added ${addedCount} bot users!`);
}

addBotUsers().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
