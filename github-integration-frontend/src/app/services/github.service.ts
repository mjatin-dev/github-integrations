import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  redirectToGitHub(): void {
    window.location.href = `${this.baseUrl}/auth/github`;
  }

  checkIntegrationStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/status`);
  }

  // Fetch GitHub integration status
  getGitHubStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/status`);
  }

  getIntegrations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/github/integrations`);
  }

  getDataByIntegration(integration: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/data/${integration}`);
  }

  removeIntegration(userId: string | null): Observable<any> {
    return this.http.delete(`${this.baseUrl}/github/remove-integration`, {
      body: { userId },
    });
  }

  fetchOrganization(): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/organizations`);
  }


  fetchGithubData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/fetch-github-data`);
  }


  fetchDatabaseCollections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/fetch-database-collection`);
  }

  fetchGithubCollections(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/github/fetch-entity-record/${name}`);
  }

}