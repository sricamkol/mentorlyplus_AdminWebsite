import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkCompletedComponent } from './mark-completed.component';

describe('MarkCompletedComponent', () => {
  let component: MarkCompletedComponent;
  let fixture: ComponentFixture<MarkCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
