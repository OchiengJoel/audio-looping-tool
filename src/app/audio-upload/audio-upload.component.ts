import { Component } from '@angular/core';
import { saveAs } from 'file-saver';
import WavEncoder from 'wav-encoder';

@Component({
  selector: 'app-audio-upload',
  templateUrl: './audio-upload.component.html',
  styleUrls: ['./audio-upload.component.css']
})
export class AudioUploadComponent {
  audioFile: File | null = null;
  audioUrl: string | null = null;
  loopDuration: number | null = null; // No default value until user selects
  audioContext: AudioContext = new AudioContext();
  durations: number[] = [15, 45, 60, 120]; // in minutes
  isLoading: boolean = false;
  isPlaying: boolean = false;
  audioProgress: number = 0; // Reintroduce audioProgress
  errorMessage: string | null = null;
  allowedFileTypes: string[] = ['audio/mp3', 'audio/wav', 'audio/ogg'];
  private audioSourceNode: AudioBufferSourceNode | null = null;
  private startTime: number = 0;

  // On file selected, validate and set the file
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.audioFile = input.files[0];
      const fileExtension = this.audioFile.name.split('.').pop()?.toLowerCase();
      if (!this.allowedFileTypes.includes(`audio/${fileExtension}`)) {
        this.errorMessage = 'Invalid file type. Please upload an MP3, WAV, or OGG file.';
        return;
      }

      this.errorMessage = null;
      this.audioUrl = URL.createObjectURL(this.audioFile);
      this.loopDuration = null;  // Reset loop duration when a new file is selected
    }
  }

  // Helper function to handle the audio file loading and playback
private async loadAndDecodeAudioFile(): Promise<AudioBuffer | null> {
  if (!this.audioFile) {
    this.errorMessage = 'No file selected!';
    return null;  // Return null if no file is selected
  }
  
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        const audioData = reader.result as ArrayBuffer;
        const buffer = await this.audioContext.decodeAudioData(audioData);
        resolve(buffer);
      } catch (error) {
        reject('Error decoding the audio file. Please try again.');
      }
    };

    reader.onerror = () => reject('Error reading the audio file. Please try again.');
    reader.readAsArrayBuffer(this.audioFile!);  // Non-null assertion (force TypeScript to treat this as not null)
  });
}

  // Update the progress to account for looping
  updateProgress(): void {
    if (this.audioSourceNode && this.audioContext.state === 'running') {
      const currentTime = this.audioContext.currentTime - this.startTime;
      const originalDuration = this.audioSourceNode.buffer?.duration ?? 0;
      const totalLoopDuration = originalDuration * (this.loopDuration ?? 0) * 60; // loop duration in seconds
      this.audioProgress = (currentTime / totalLoopDuration) * 100;
    }
  }

  // Play audio in a loop
  async playLoop(): Promise<void> {
    if (this.audioFile && this.loopDuration) {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        const buffer = await this.loadAndDecodeAudioFile();
        if (!buffer) return;

        const loopDurationInSeconds = this.loopDuration * 60;
        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true;
        sourceNode.connect(this.audioContext.destination);
        sourceNode.start();

        this.audioSourceNode = sourceNode;
        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime;

        setTimeout(() => {
          sourceNode.stop();
          this.isLoading = false;
          this.isPlaying = false;
        }, loopDurationInSeconds * 1000);
      } catch (error) {
        this.errorMessage = error as string;
        this.isLoading = false;
      }
    }
  }

  // Pause playback
  pauseLoop(): void {
    if (this.audioSourceNode && this.isPlaying) {
      this.audioContext.suspend();
      this.isPlaying = false;
    }
  }

  // Fast forward functionality
  fastForward(): void {
    if (this.audioSourceNode && this.isPlaying) {
      this.audioSourceNode.stop();
      const fastForwardTime = this.audioContext.currentTime + 10;
      this.playLoopAtTime(fastForwardTime);
    }
  }

  // Play loop from a specific time
  async playLoopAtTime(startTime: number): Promise<void> {
    if (this.audioFile && this.loopDuration) {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        const buffer = await this.loadAndDecodeAudioFile();
        if (!buffer) return;

        const loopDurationInSeconds = this.loopDuration * 60;
        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true;
        sourceNode.connect(this.audioContext.destination);
        sourceNode.start(startTime);

        this.audioSourceNode = sourceNode;
        this.isPlaying = true;
        this.startTime = startTime;

        setTimeout(() => {
          sourceNode.stop();
          this.isLoading = false;
          this.isPlaying = false;
        }, loopDurationInSeconds * 1000);
      } catch (error) {
        this.errorMessage = error as string;
        this.isLoading = false;
      }
    }
  }

  // Download the looped audio
  async downloadLoopedAudio(): Promise<void> {
    if (this.audioFile && this.loopDuration) {
      this.isLoading = true;
      this.errorMessage = null;
  
      try {
        const buffer = await this.loadAndDecodeAudioFile();
        if (!buffer) return;
  
        // Calculate the total number of samples needed for the looped audio
        const loopDurationInSeconds = this.loopDuration * 60;
        const totalSamples = buffer.sampleRate * loopDurationInSeconds;
  
        // Create a new audio buffer with the correct size for the looped audio
        const loopedBuffer = this.audioContext.createBuffer(
          buffer.numberOfChannels,
          totalSamples,
          buffer.sampleRate
        );
  
        // Loop the original audio buffer to fill the new buffer
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const channelData = loopedBuffer.getChannelData(channel);
          let sampleIndex = 0;
          
          // Loop through the original buffer data and copy it to the new buffer
          while (sampleIndex < totalSamples) {
            const remainingSamples = totalSamples - sampleIndex;
            const samplesToCopy = Math.min(buffer.length, remainingSamples);
            channelData.set(buffer.getChannelData(channel).slice(0, samplesToCopy), sampleIndex);
            sampleIndex += samplesToCopy;
  
            // If we reach the end of the buffer, loop back to the beginning
            if (sampleIndex >= totalSamples) {
              break;
            }
          }
        }
  
        // Encode the looped buffer to a WAV file
        const encodedWav = await WavEncoder.encode({
          sampleRate: buffer.sampleRate,
          channelData: Array.from({ length: buffer.numberOfChannels }, (_, i) => loopedBuffer.getChannelData(i)),
        });
  
        const wavBlob = new Blob([encodedWav], { type: 'audio/wav' });
        saveAs(wavBlob, `looped-audio-${this.loopDuration}min.wav`);
        this.isLoading = false;
      } catch (error) {
        this.errorMessage = 'Error generating the looped audio. Please try again.';
        this.isLoading = false;
      }
    }
  }
}
