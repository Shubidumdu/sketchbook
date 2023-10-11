import prand, { RandomGenerator } from 'pure-rand';

export class RandomValueGenerator {
  private rng: RandomGenerator;

  constructor(seed: number) {
    this.rng = prand.xoroshiro128plus(seed);
  }

  next() {
    const num = this.rng.unsafeNext();
    return num;
  }

  distribute(min: number, max: number) {
    const out = (this.next() >>> 0) / 0x100000000;
    return min + out * (max - min);
  }

  distributeInt(min: number, max: number) {
    const out = prand.unsafeUniformIntDistribution(min, max, this.rng);
    return out;
  }

  hexColor() {
    const num = this.distribute(0, 0xffffff);
    return `#${Math.floor(num).toString(16).padEnd(6, '0')}`;
  }
}
