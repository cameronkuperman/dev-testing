import { HeartMath } from './HeartMath';

export class PulseManager {
  private bpm: number = 60;
  private startTime: number = Date.now();
  private state: 'rest' | 'active' | 'stressed' = 'rest';

  updateState(amplitude: number, isEmergency: boolean) {
    if (isEmergency || amplitude > 0.8) {
      this.state = 'stressed';
    } else if (amplitude > 0.3) {
      this.state = 'active';
    } else {
      this.state = 'rest';
    }
    
    this.bpm = HeartMath.getCurrentBPM(this.state);
  }

  getCurrentPhase(): number {
    const cycleTime = 60000 / this.bpm; // ms per beat
    const elapsed = Date.now() - this.startTime;
    return (elapsed % cycleTime) / cycleTime;
  }

  getPulseValue(): number {
    const phase = this.getCurrentPhase();
    return HeartMath.calculateHeartbeatPulse(phase);
  }

  getBPM(): number {
    return this.bpm;
  }

  getState(): 'rest' | 'active' | 'stressed' {
    return this.state;
  }
}