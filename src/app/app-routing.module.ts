import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioUploadComponent } from './audio-upload/audio-upload.component';

const routes: Routes = [
  {
    path:"", component:AudioUploadComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
