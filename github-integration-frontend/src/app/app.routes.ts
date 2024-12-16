import { Routes } from '@angular/router';
import { IntegrationListComponent } from './integration-list/integration-list.component';
import { ConnectGitHubComponent } from './connect-github/connect-github.component';

export const routes: Routes = [
    { path: '', component: ConnectGitHubComponent },
    { path: 'integrations', component: IntegrationListComponent },
    { path: '', redirectTo: '', pathMatch: 'full' },
  ];;
