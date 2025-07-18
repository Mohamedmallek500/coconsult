import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrdonnanceModalComponent } from './add-ordonnance-modal.component';

describe('AddOrdonnanceModalComponent', () => {
  let component: AddOrdonnanceModalComponent;
  let fixture: ComponentFixture<AddOrdonnanceModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddOrdonnanceModalComponent]
    });
    fixture = TestBed.createComponent(AddOrdonnanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
