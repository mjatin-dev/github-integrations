import { Routes } from "@angular/router";
import { IntegrationListComponent } from "./integration-list/integration-list.component";
import { ConnectGitHubComponent } from "./connect-github/connect-github.component";
import { FindUserGridComponent } from "./find-user-grid-component/find-user-grid-component.component";
import { RepoDataComponent } from "./repo-data/repo-data.component";

export const routes: Routes = [
  { path: "", component: ConnectGitHubComponent },
  { path: "integrations", component: IntegrationListComponent },
  { path: "", redirectTo: "", pathMatch: "full" },
  { path: "find-user", component: FindUserGridComponent },
  { path: "repo", component: RepoDataComponent },
];
