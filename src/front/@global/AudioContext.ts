export default typeof window === "undefined"
  ? (class AudioContext {} as never)
  : class AudioContext extends window.AudioContext {
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
        this.stop(id);
        const audioSource = this.createBufferSource();
        if (!(id in this.buffers)) return;
        audioSource.buffer = this.buffers[id];
        audioSource.loop = loop;
        audioSource.connect(this.gainNode);
        audioSource.start();
        this.playing[id] = audioSource;
      }
      public stop(id: string) {
        if (id in this.playing) {
          this.playing[id].stop();
          this.playing[id].disconnect();
          return delete this.playing[id];
        }
        return false;
      }
      public playEffect(id: string) {
        const audioSource = this.createBufferSource();
        audioSource.buffer = this.buffers[id];
        audioSource.connect(this.effectGainNode);
        audioSource.start();
      }
    };
