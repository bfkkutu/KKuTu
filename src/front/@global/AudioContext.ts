const C =
  typeof window === "undefined"
    ? (class Dummy {} as never)
    : window.AudioContext;
class AudioContext extends C {
  public static instance = new AudioContext();
  private buffers: Table<AudioBuffer> = {};
  private gainNode = this.createGain();
  private effectGainNode = this.createGain();
  private playing: Table<AudioBufferSourceNode> = {};
  constructor() {
    super();

    this.gainNode.gain.value = 0.5;
    this.effectGainNode.gain.value = 0.5;
    this.gainNode.connect(this.destination);
    this.effectGainNode.connect(this.destination);
  }
  public get volume() {
    return this.gainNode.gain.value;
  }
  public set volume(volume: number) {
    this.gainNode.gain.value = volume;
  }
  public get effectVolume() {
    return this.effectGainNode.gain.value;
  }
  public set effectVolume(volume: number) {
    this.effectGainNode.gain.value = volume;
  }
  public async register(id: string, url: string): Promise<void> {
    this.buffers[id] = await this.decodeAudioData(
      await (await fetch(url)).arrayBuffer()
    );
  }
  public play(id: string, loop: boolean = false): void {
    this.stop(id);
    if (!(id in this.buffers)) {
      return;
    }
    const audioSource = this.createBufferSource();
    audioSource.buffer = this.buffers[id];
    audioSource.loop = loop;
    audioSource.connect(this.gainNode);
    audioSource.start();
    this.playing[id] = audioSource;
  }
  /**
   * 효과음을 재생한다.
   *
   * @param id 효과음 식별자
   * @returns 효과음 종료 시 resolve되는 Promise
   */
  public playEffect(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!(id in this.buffers)) {
        return reject();
      }
      const audioSource = this.createBufferSource();
      audioSource.buffer = this.buffers[id];
      audioSource.connect(this.effectGainNode);
      audioSource.addEventListener("ended", () => resolve());
      audioSource.start();
    });
  }
  /**
   * 오디오 재생을 중단한다.
   *
   * @param id 오디오 식별자
   * @returns 중단 여부
   */
  public stop(id: string): boolean {
    if (id in this.playing) {
      this.playing[id].stop();
      this.playing[id].disconnect();
      return delete this.playing[id];
    }
    return false;
  }
  public stopAll(): void {
    for (const id in this.playing) {
      this.playing[id].stop();
      this.playing[id].disconnect();
    }
    this.playing = {};
  }
}
export default AudioContext;
