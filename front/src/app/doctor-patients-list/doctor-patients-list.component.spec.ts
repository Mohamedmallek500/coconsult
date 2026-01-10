import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPatientsListComponent } from './doctor-patients-list.component';

describe('DoctorPatientsListComponent', () => {
  let component: DoctorPatientsListComponent;
  let fixture: ComponentFixture<DoctorPatientsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorPatientsListComponent]
    });
    fixture = TestBed.createComponent(DoctorPatientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
