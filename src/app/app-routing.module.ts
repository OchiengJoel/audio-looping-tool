import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioUploadComponent } from './audio-upload/audio-upload.component';
import { TextToSpeechComponent } from './text-to-speech/components/text-to-speech/text-to-speech.component';

const routes: Routes = [
  {
    path:"", component:AudioUploadComponent
  },

  {
    path:"text-to-speech", component:TextToSpeechComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
