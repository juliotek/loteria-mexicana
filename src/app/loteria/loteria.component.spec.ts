import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteriaComponent } from './loteria.component';

describe('LoteriaComponent', () => {
  let component: LoteriaComponent;
  let fixture: ComponentFixture<LoteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
