import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoDataComponent } from './repo-data.component';

describe('RepoDataComponent', () => {
  let component: RepoDataComponent;
  let fixture: ComponentFixture<RepoDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepoDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepoDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
