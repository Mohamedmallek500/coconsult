import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentManagementComponent } from './medicament-management.component';

describe('MedicamentManagementComponent', () => {
  let component: MedicamentManagementComponent;
  let fixture: ComponentFixture<MedicamentManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MedicamentManagementComponent]
    });
    fixture = TestBed.createComponent(MedicamentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
