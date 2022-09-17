import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayMapComponent } from './gameplay-map.component';

describe('GameplayMapComponent', () => {
  let component: GameplayMapComponent;
  let fixture: ComponentFixture<GameplayMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameplayMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplayMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
