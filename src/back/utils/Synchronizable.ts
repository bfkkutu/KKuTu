import Synchronizer from "back/utils/Synchronizer";

/**
 * 서로 다른 객체 간 같은 동기 상태를
 * 공유하기 위한 클래스.
 *
 * 이 클래스는 인스턴스화할 수 없다.
 */
export default abstract class Synchronizable {
  private readonly synchronizer: Synchronizer;

  protected get now(): number {
    return this.synchronizer.now;
  }

  /**
   * synchronizable 객체를 제공하지 않은 경우,
   * 새로운 Synchronizer를 만들어 동기화한다.
   *
   * synchronizable 객체를 제공한 경우,
   * 기존 synchronizable 객체의
   * Synchronizer에 동기화한다.
   *
   * @param synchronizable Synchronizable의 하위 타입 객체.
   */
  constructor(synchronizable?: Synchronizable) {
    this.synchronizer =
      synchronizable === undefined
        ? new Synchronizer()
        : synchronizable.synchronizer;
  }

  protected freeze(): void {
    this.synchronizer.freeze();
  }
  protected unfreeze(): void {
    this.synchronizer.unfreeze();
  }
}
