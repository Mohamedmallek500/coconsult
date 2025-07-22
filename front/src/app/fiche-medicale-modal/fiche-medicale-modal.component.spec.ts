import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheMedicaleModalComponent } from './fiche-medicale-modal.component';

describe('FicheMedicaleModalComponent', () => {
  let component: FicheMedicaleModalComponent;
  let fixture: ComponentFixture<FicheMedicaleModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FicheMedicaleModalComponent]
    });
    fixture = TestBed.createComponent(FicheMedicaleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
