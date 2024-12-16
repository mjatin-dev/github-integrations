import { Component, OnInit, signal } from '@angular/core';
import { GitHubService } from '../services/github.service';
import { ActivatedRoute } from '@angular/router';
import { AuthInterceptor } from '../intercepters/AuthInterceptor';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  standalone: true,
  selector: 'app-connect-github',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatExpansionModule, CommonModule, LoaderComponent],
  templateUrl: './connect-github.component.html',
  styleUrls: ['./connect-github.component.css'],
})
export class ConnectGitHubComponent implements OnInit {
  isConnected = false;
  connectedAt: string | null = null;
  routeParam: string | null = null;
  userId: string | null = null;
  isLoading: boolean = false;
  userName: string = "";

  readonly panelOpenState = signal(false);
  constructor(
    private githubService: GitHubService,
    private route: ActivatedRoute,
    private authInterceptor: AuthInterceptor,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.routeParam = params.get('token');
      this.authInterceptor.setToken(this.routeParam);
      if (this.routeParam) {
        localStorage.setItem('token', this.routeParam);
      }
    });
    this.checkConnection();
  }


  // Redirect to GitHub
  checkConnection(): void {
    this.isLoading = true;
    this.githubService
      .checkIntegrationStatus()
      .subscribe(
      (response: { connected: boolean; connectedAt: string | null, userId: string, githubUsername: string }) => {
        this.isConnected = response.connected;
        this.connectedAt = response.connectedAt;
        this.userId = response.userId;
        this.userName = response.githubUsername;

        this.fetchOrganizations();
      },
      (error) => {
        this.isLoading = false;
        console.error('Error checking integration status:', error);
      }
      );
  }


  // Redirect to GitHub
  connectToGitHub(): void {
    this.githubService.redirectToGitHub();
  }

  // Remove GitHub Integration
  removeIntegration(): void {
    this.githubService.removeIntegration(this.userId).subscribe(
      (response) => {
        this.isConnected = false;
        this.router.navigate(['/'])
      },
      (error) => {
        console.error('Error removing integration:', error);
      }
    );
  }

  // Fetch organizations
  fetchOrganizations(): void {
    this.githubService
      .fetchOrganization()
      .subscribe(
        (response) => {
          this.isLoading = false
        }
      );
  }
}
