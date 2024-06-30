import Word from "back/models/Word";

export default interface Chainable {
  chain(word: Word): void;
}
