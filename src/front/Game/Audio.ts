export default class Audio extends window.AudioContext {
  private sources: Table<AudioBufferSourceNode> = {};
  private gainNode = this.createGain();
  public current?: string;
  constructor() {
    super();

    this.gainNode.gain.value = 0.5;
  }
  private get currentSource() {
    if (this.current === undefined) return undefined;
    return this.sources[this.current];
  }
  public get volume() {
    return this.gainNode.gain.value;
  }
  public set volume(volume: number) {
    this.gainNode.gain.value = volume;
  }
  public async register(id: string, url: string) {
    const audioSource = this.createBufferSource();
    audioSource.buffer = await this.decodeAudioData(
      await (await fetch(url)).arrayBuffer()
    );
    return (this.sources[id] = audioSource);
  }
  public play(id: string) {
    this.stop();
    this.sources[id].connect(this.destination);
    this.sources[id].start();
  }
  public stop() {
    if (this.currentSource !== undefined) {
      this.currentSource.stop();
      this.currentSource.disconnect(this.destination);
    }
  }
}
