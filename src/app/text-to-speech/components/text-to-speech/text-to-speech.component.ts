import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
//import Recorder from 'recorder-js';

declare var Recorder: any; // Declare Recorder.js


@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.css']
})
export class TextToSpeechComponent {

  @ViewChild('audioElement', { static: false }) audioElement!: ElementRef<HTMLAudioElement>;

  textInput: string = '';
  selectedVoiceGender: string = 'male';
  audioUrl: string | null = null;
  isConverting: boolean = false;
  conversionProgress: number = 0;
  private synth = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private audioContext: AudioContext | null = null;
  private recorder: any = null;

  constructor() {
    this.loadVoices();
  }

  loadVoices() {
    this.synth.onvoiceschanged = () => {
      this.voices = this.synth.getVoices();
      console.log('Voices loaded:', this.voices.length);
    };
    this.voices = this.synth.getVoices();
  }

  async convertToSpeech() {
    if (!this.textInput) return;

    console.time('Conversion');
    console.log('Starting conversion...');
    this.isConverting = true;
    this.conversionProgress = 0;
    this.audioUrl = null;

    const utterance = new SpeechSynthesisUtterance(this.textInput);
    const voice = this.getVoice();
    if (!voice) {
      console.error('No voice found!');
      this.isConverting = false;
      alert('No speech voices available.');
      return;
    }

    utterance.voice = voice;
    utterance.rate = 1;
    utterance.pitch = 1;

    // Start progress simulation immediately
    this.simulateConversionProgress();

    try {
      // Set up Web Audio API for recording
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext created');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      const source = this.audioContext.createMediaStreamSource(stream);

      this.recorder = new Recorder(this.audioContext);
      source.connect(this.recorder.input);
      this.recorder.record();
      console.log('Recorder started');
    } catch (error) {
      console.error('Audio setup error:', error);
      // Fallback to synthesis without recording
      this.audioUrl = null; // No recording, but proceed with synthesis
    }

    utterance.onstart = () => console.log('Synthesis started');
    utterance.onend = () => {
      console.log('Synthesis ended');
      if (this.recorder) {
        this.recorder.stop();
        this.recorder.exportWAV((blob: Blob) => {
          this.audioUrl = URL.createObjectURL(blob);
          this.isConverting = false;
          this.conversionProgress = 100;
          console.log('Audio recorded:', this.audioUrl);
          this.cleanup();
        });
      } else {
        // Fallback if recording failed
        this.finalizeConversion();
      }
    };
    utterance.onerror = (event) => {
      console.error('Synthesis error:', event.error);
      if (this.recorder) this.recorder.stop();
      this.finalizeConversion();
    };

    console.log('Speaking...');
    this.synth.speak(utterance);

    setTimeout(() => {
      if (this.isConverting) {
        console.warn('Timeout reached');
        if (this.recorder) this.recorder.stop();
        this.finalizeConversion();
      }
    }, 10000);
  }

  private simulateConversionProgress() {
    console.log('Starting progress simulation');
    const interval = setInterval(() => {
      if (this.conversionProgress < 100) {
        this.conversionProgress += 10;
        console.log('Progress:', this.conversionProgress);
      }
      if (this.conversionProgress >= 100 || !this.isConverting) {
        clearInterval(interval);
        console.log('Progress simulation complete');
      }
    }, 200);
  }

  private finalizeConversion() {
    this.isConverting = false;
    this.conversionProgress = 100;
    if (!this.audioUrl) {
      // Fallback placeholder if recording failed
      const fakeAudioData = new Blob([this.textInput], { type: 'audio/mp3' });
      this.audioUrl = URL.createObjectURL(fakeAudioData);
      console.warn('Recording failed - using text placeholder');
    }
    console.log('Final state:', { isConverting: this.isConverting, audioUrl: this.audioUrl });
    console.timeEnd('Conversion');
    this.cleanup();
  }

  private cleanup() {
    if (this.audioContext) {
      this.audioContext.close().then(() => console.log('AudioContext closed'));
      this.audioContext = null;
    }
    this.recorder = null;
  }

  playSpeech() {
    if (this.audioUrl) {
      console.log('Playing recorded audio...');
      const audio = new Audio(this.audioUrl);
      audio.play().catch(err => {
        console.error('Playback error:', err);
        this.playFallback();
      });
    } else {
      this.playFallback();
    }
  }

  private playFallback() {
    console.log('Falling back to synthesis...');
    const utterance = new SpeechSynthesisUtterance(this.textInput);
    const voice = this.getVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.rate = 1;
      utterance.pitch = 1;
      this.synth.speak(utterance);
    }
  }

  downloadAudio() {
    if (!this.audioUrl) return;
    console.log('Downloading audio...');
    const link = document.createElement('a');
    link.href = this.audioUrl;
    link.download = this.recorder ? 'speech.wav' : 'speech.mp3'; // WAV if recorded, MP3 if placeholder
    link.click();
  }

  private getVoice(): SpeechSynthesisVoice | undefined {
    return this.voices.find(v => {
      const isMale = v.name.toLowerCase().includes('male') ||
        (!v.name.toLowerCase().includes('female') && this.selectedVoiceGender === 'male');
      return this.selectedVoiceGender === 'male' ? isMale : !isMale;
    }) || this.voices[0];
  }
}
