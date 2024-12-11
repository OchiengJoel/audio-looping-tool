import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioUploadComponent } from './audio-upload.component';

describe('AudioUploadComponent', () => {
  let component: AudioUploadComponent;
  let fixture: ComponentFixture<AudioUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AudioUploadComponent]
    });
    fixture = TestBed.createComponent(AudioUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
