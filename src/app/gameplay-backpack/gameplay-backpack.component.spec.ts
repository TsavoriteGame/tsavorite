import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayBackpackComponent } from './gameplay-backpack.component';

describe('GameplayBackpackComponent', () => {
  let component: GameplayBackpackComponent;
  let fixture: ComponentFixture<GameplayBackpackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameplayBackpackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplayBackpackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
