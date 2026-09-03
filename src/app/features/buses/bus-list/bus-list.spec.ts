import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusList } from './bus-list';

describe('BusList', () => {
  let component: BusList;
  let fixture: ComponentFixture<BusList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
