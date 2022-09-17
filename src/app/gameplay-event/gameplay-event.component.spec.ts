import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayEventComponent } from './gameplay-event.component';

describe('GameplayEventComponent', () => {
  let component: GameplayEventComponent;
  let fixture: ComponentFixture<GameplayEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameplayEventComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplayEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
