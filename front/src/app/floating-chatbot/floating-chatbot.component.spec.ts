import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingChatbotComponent } from './floating-chatbot.component';

describe('FloatingChatbotComponent', () => {
  let component: FloatingChatbotComponent;
  let fixture: ComponentFixture<FloatingChatbotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FloatingChatbotComponent]
    });
    fixture = TestBed.createComponent(FloatingChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
