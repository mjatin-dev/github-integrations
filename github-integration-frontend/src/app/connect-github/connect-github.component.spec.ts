import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectGitHubComponent } from './connect-github.component';


describe('ConnectGithubComponent', () => {
  let component: ConnectGitHubComponent;
  let fixture: ComponentFixture<ConnectGitHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectGitHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectGitHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
