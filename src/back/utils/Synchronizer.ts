/**
 * 여러 task를 순차적으로 수행할 때,
 * 동일한 UNIX 시간을 task 간에
 * 공유해야 하는 경우
 * 사용하는 클래스.
 */
export default class Synchronizer {
  private time?: number;

  public get now(): number {
    return this.time === undefined ? this.getTime() : this.time;
  }

  private getTime(): number {
    return new Date().getTime();
  }
  public freeze(): void {
    this.time = this.getTime();
  }
  public unfreeze(): void {
    this.time = undefined;
  }
}
