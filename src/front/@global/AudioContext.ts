export default typeof window === "undefined"
  ? (class AudioContext {} as never)
  : class AudioContext extends window.AudioContext {
      public static instance = new AudioContext();
      private buffers: Table<AudioBuffer> = {};
      private gainNode = this.createGain();
      private currentSource?: AudioBufferSourceNode;
      constructor() {
        super();

        this.gainNode.gain.value = 0.5;
        this.gainNode.connect(this.destination);
      }
      public get volume() {
        return this.gainNode.gain.value;
      }
      public set volume(volume: number) {
        this.gainNode.gain.value = volume;
      }
      public async register(id: string, url: string) {
        try {
          this.buffers[id] = await this.decodeAudioData(
            await (await fetch(url)).arrayBuffer()
          );
          return true;
        } catch (e) {
          return false;
        }
      }
      public play(id: string, loop: boolean = false) {
        this.stop();
        const audioSource = this.createBufferSource();
        audioSource.buffer = this.buffers[id];
        audioSource.loop = loop;
        audioSource.connect(this.gainNode);
        audioSource.start();
        this.currentSource = audioSource;
      }
      public stop() {
        if (this.currentSource !== undefined) {
          this.currentSource.disconnect();
          delete this.currentSource;
        }
      }
    };
