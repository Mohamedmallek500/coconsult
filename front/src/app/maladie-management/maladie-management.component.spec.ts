import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaladieManagementComponent } from './maladie-management.component';

describe('MaladieManagementComponent', () => {
  let component: MaladieManagementComponent;
  let fixture: ComponentFixture<MaladieManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaladieManagementComponent]
    });
    fixture = TestBed.createComponent(MaladieManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
