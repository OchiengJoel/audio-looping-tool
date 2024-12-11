# AudioLoopApp

AudioLoopApp is a web application designed for looping audio files and generating custom-duration tracks. Users can upload, preview, and loop audio files, as well as create new files with a specified loop duration. Ideal for podcasters, musicians, and sound designers, this tool simplifies the process of creating seamless audio loops.

## Features
### Custom Loop Duration: 
Select the exact loop duration (in minutes) for the generated audio.

### File Preview and Controls: 
Upload MP3, WAV, and OGG files for instant playback and looping.

### Looped Audio Generation: 
Download a WAV file of the audio looped to your desired length.

### File Format Support: 
Supports popular audio formats (MP3, WAV, OGG).

### Fast Forward/Replay Controls: 
Skip through or replay sections of the audio during playback.

### Error Handling and User Feedback: 
Informative error messages for easy troubleshooting.

### Fully Responsive UI: 
Optimized for desktop and mobile devices.

## Tech Stack
#### Frontend: 
>Angular 15, TypeScript, HTML, CSS
#### Audio Processing: 
>Web Audio API, Wav-Encoder

#### File Handling: 
>FileSaver.js, Blob API

#### Browser Compatibility: 
>Works across modern browsers (Chrome, Firefox, Edge, Safari)

## How It Works
1. Upload Audio File: Select an audio file (MP3, WAV, OGG) from your local device.
2. Select Loop Duration: Choose from predefined loop durations (15, 45, 60, 120 minutes) to match your project’s needs.
3. Playback Looping: Click "Play Looped Audio" to hear your audio file played in a loop for the specified duration.
4. Download Looped Audio: Download the final audio file that has been looped for the selected duration (e.g., a 15-minute loop).


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Acknowledgements
1. Web Audio API: The Web Audio API powers the audio processing and looping functionality.
2. Wav-Encoder: This encoder is used to convert the looped audio buffer to WAV format for download.
