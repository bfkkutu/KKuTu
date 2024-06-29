import Word from "back/models/Word";

export default interface Chainable {
  /**
   * 현재 round의 chain history.
   */
  history: Word[];
  last: string;

  chain(word: Word): void;
}