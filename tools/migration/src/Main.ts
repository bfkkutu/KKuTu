import { SingleBar } from "cli-progress";

import DB from "./Database";

import LegacyWord from "./models/legacy/Word";
import Word from "./models/Word";

(async () => {
  await DB.initialize();

  await migrateWords("kkutu_ko", "kkutu_words_ko");
  await migrateWords("kkutu_en", "kkutu_words_en");
})();

async function migrateWords(from: string, to: string) {
  console.log(`Migration: ${from} → ${to}`);

  const progress = new SingleBar({});
  try {
    console.log(`Loading records from table ${from}...`);
    const legacy = await DB.Legacy.createQueryBuilder(
      { type: new LegacyWord(), name: from },
      "w"
    ).getMany();
    console.log(`Loaded ${legacy.length} items!`);
    const repository = DB.Manager.getRepository({ type: new Word(), name: to });
    const words = [];
    progress.start(legacy.length, 0);

    for (const item of legacy) {
      const word = new Word();
      word.data = item.id;
      const means = transformMean(item.mean);
      word.means = Object.fromEntries(
        item.theme.map((v, i) => [v, means[i] || ""])
      );
      words.push(word);
      if (words.length === 100) {
        await repository.save(words);
        words.length = 0;
        progress.increment(100);
      }
    }
    await repository.save(words);
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
