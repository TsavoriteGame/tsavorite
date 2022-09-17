import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayCharacterComponent } from './gameplay-character.component';

describe('GameplayCharacterComponent', () => {
  let component: GameplayCharacterComponent;
  let fixture: ComponentFixture<GameplayCharacterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameplayCharacterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplayCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
