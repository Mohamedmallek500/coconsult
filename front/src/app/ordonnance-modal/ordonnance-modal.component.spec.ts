import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdonnanceModalComponent } from './ordonnance-modal.component';

describe('OrdonnanceModalComponent', () => {
  let component: OrdonnanceModalComponent;
  let fixture: ComponentFixture<OrdonnanceModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdonnanceModalComponent]
    });
    fixture = TestBed.createComponent(OrdonnanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
