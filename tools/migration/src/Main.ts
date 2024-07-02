import { SingleBar } from "cli-progress";

import DB from "./Database";

import LegacyWord from "./models/legacy/Word";
import Word from "./models/Word";
import Mean from "./models/Mean";

(async () => {
  await DB.initialize();

  await migrateWords("kkutu_ko", {
    word: "kkutu_words_ko",
    mean: "kkutu_means_ko",
  });
  await migrateWords("kkutu_en", {
    word: "kkutu_words_en",
    mean: "kkutu_means_en",
  });
})();

async function migrateWords(from: string, to: { word: string; mean: string }) {
  console.log(`Migration: ${from} → ${to.word}, ${to.mean}`);

  const progress = new SingleBar({});
  try {
    console.log(`Loading records from table ${from}...`);
    const legacy = await DB.Legacy.createQueryBuilder(
      { type: new LegacyWord(), name: from },
      "w"
    ).getMany();
    console.log(`Loaded ${legacy.length} items!`);
    const wordRepository = DB.Manager.getRepository({
      type: new Word(),
      name: to.word,
    });
    const meanRepository = DB.Manager.getRepository({
      type: new Mean(),
      name: to.mean,
    });
    const words = [];
    progress.start(legacy.length, 0);

    for (const item of legacy) {
      const word = new Word();
      word.data = item.id;
      const means = transformMean(item.mean);
      word.means = [];
      for (let i = 0; i < item.type.length; ++i) {
        const mean = new Mean();
        mean.word = word;
        mean.theme = item.theme[i];
        mean.data = means[i] || "";
        mean.wide = item.type[i] === "INJEONG";
        word.means.push(mean);
      }
      await meanRepository
        .createQueryBuilder()
        .insert()
        .values(word.means)
        .execute();

      words.push(word);
      if (words.length === 100) {
        await wordRepository.save(words);
        words.length = 0;
        progress.increment(100);
      }
    }
    await wordRepository.save(words);
    progress.increment(words.length);

    progress.stop();
    console.log("Migration succeeded.");
  } catch (e) {
    progress.stop();
    console.log("Migration failed: ", e);
  }
}

function transformMean(mean: string): string[] {
  const R = [];
  const exp = /＂(\d{1,3})＂([^＂]*)/g;
  let match;

  mean = mean.replace(/［\d］/g, "").replace(/（\d）/g, "");
  while ((match = exp.exec(mean)) !== null) {
    R[parseInt(match[1], 10) - 1] = match[2].trim();
  }
  return R;
}
