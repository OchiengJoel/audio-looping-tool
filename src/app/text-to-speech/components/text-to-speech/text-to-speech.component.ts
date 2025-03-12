import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';


@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.css']
})
export class TextToSpeechComponent {

  textInput: string = '';
  selectedVoiceGender: string = 'male';
  audioUrl: string | null = null;
  isConverting: boolean = false;
  conversionProgress: number = 0;
  private synth = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private audioBlob: Blob | null = null;

  constructor(private http: HttpClient) { // Inject HttpClient
    this.loadVoices();
  }

  loadVoices() {
    this.synth.onvoiceschanged = () => {
      this.voices = this.synth.getVoices();
    };
    this.voices = this.synth.getVoices();
  }

  convertToSpeech() {
    if (!this.textInput) return;

    this.isConverting = true;
    this.conversionProgress = 0;
    this.audioUrl = null;
    this.audioBlob = null;

    const utterance = new SpeechSynthesisUtterance(this.textInput);
    const voice = this.voices.find(v => {
      const isMale = v.name.toLowerCase().includes('male') ||
        (!v.name.toLowerCase().includes('female') && this.selectedVoiceGender === 'male');
      return this.selectedVoiceGender === 'male' ? isMale : !isMale;
    }) || this.voices[0];

    utterance.voice = voice;
    utterance.rate = 1;
    utterance.pitch = 1;

    // Handle completion
    utterance.onend = () => {
      this.generateAudioBlob(utterance);
      this.isConverting = false; // Reset when synthesis and audio are ready
      this.conversionProgress = 100; // Ensure 100% when done
    };

    // Start synthesis and progress simulation
    this.synth.speak(utterance);
    this.simulateConversionProgress();
  }

  // Simulate progress up to 100%
  private simulateConversionProgress() {
    const interval = setInterval(() => {
      if (this.conversionProgress < 100) {
        this.conversionProgress += 10; // Increment until 100%
      }
      if (this.conversionProgress >= 100 || !this.isConverting) {
        clearInterval(interval); // Stop when 100% or conversion ends
        if (!this.isConverting) {
          this.conversionProgress = 100; // Ensure it’s exactly 100%
        }
      }
    }, 200); // Adjust speed as needed
  }

  private generateAudioBlob(utterance: SpeechSynthesisUtterance) {
    // Replace simulation with API call
    const apiUrl = 'YOUR_TTS_API_ENDPOINT'; // Replace with your API endpoint
    const apiKey = 'YOUR_API_KEY'; // Replace with your API key

    const requestBody = {
      text: this.textInput,
      voice: utterance.voice?.name, // Send the selected voice name
      // Add any other API-specific parameters
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}` // If using API key
    });

    this.http.post(apiUrl, requestBody, { headers: headers, responseType: 'blob' })
      .subscribe(
        (blob: Blob) => {
          this.audioBlob = blob;
          this.audioUrl = URL.createObjectURL(blob);
        },
        (error) => {
          console.error('Error generating audio:', error);
          this.isConverting = false; // Stop converting in case of error
          this.conversionProgress = 0;
          alert('Error generating audio. Please try again.');
        }
      );
  }

  playSpeech() {
    if (!this.audioUrl) return;

    const audio = new Audio(this.audioUrl);
    audio.play();
  }

  downloadAudio() {
    if (!this.audioUrl) return;

    const link = document.createElement('a');
    link.href = this.audioUrl;
    link.download = 'speech.mp3';
    link.click();
  }
}
