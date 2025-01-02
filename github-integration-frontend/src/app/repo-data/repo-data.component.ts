import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AgGridModule } from "ag-grid-angular";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core"; // For Datepicker
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LoaderComponent } from "../loader/loader.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { GitHubService } from "../services/github.service";
import { filter } from "rxjs";

@Component({
  standalone: true,
  imports: [
    AgGridModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    CommonModule,
    LoaderComponent,
  ],
  selector: "app-repo-data",
  templateUrl: "./repo-data.component.html",
  styleUrls: ["./repo-data.component.css"],
})
export class RepoDataComponent implements OnInit {
  rowData: any[] = [];
  columnDefs: any[] = [];
  gridApi: any;
  userName: string = "";
  isLoading: boolean = false;
  gridColumnApi: any;
  defaultColumns: any[] = [];

  constructor(private githubService: GitHubService) {}

  ngOnInit() {
    this.checkConnection();
    this.fetchData();
  }

  checkConnection(): void {
    this.isLoading = true;
    this.githubService.checkIntegrationStatus().subscribe({
      next: (response: {
        connected: boolean;
        connectedAt: string | null;
        userId: string;
        githubUsername: string;
      }) => {
        this.userName = response.githubUsername;
      },
      error: (err) => {
        console.error("Error checking GitHub integration status:", err);
      },
    });
  }

  fetchData() {
    this.isLoading = true;
    this.githubService.fetchRepoData().subscribe((data) => {
      const fetchedData = this.formatData(data.data[0]);
      const updatedValue = fetchedData.map((item) => {
        const keys = Object.keys(item).map((keyItem): any => {
          if (typeof item[keyItem] === "object") {
            return { [keyItem]: JSON.stringify(item[keyItem]) };
          } else {
            return { [keyItem]: item[keyItem] };
          }
        });
        return Object.assign({}, ...keys);
      });

      this.rowData = updatedValue;

      this.isLoading = false;
      this.generateColumns(data.data[0]);
    });
  }

  formatData(data: any): any[] {
    const formattedData: any[] = [];

    data.commits?.forEach((commit: any) => {
      formattedData.push({ type: "Commit", ...commit });
    });

    data.pull_requests?.forEach((pr: any) => {
      formattedData.push({ type: "Pull Request", ...pr });
    });

    data.issues?.forEach((issue: any) => {
      formattedData.push({ type: "Issue", ...issue });
    });

    return formattedData;
  }

  generateColumns(data: any) {
    const sampleRow =
      data?.commits[0] || data?.pullRequests[0] || data?.issues[0];
    const values = [...data?.commits];
    console.log(sampleRow);
    if (sampleRow) {
      this.columnDefs = Object.keys(sampleRow).map((key) => ({
        headerName: key,
        field: key,
        name: key,
        filter: true,
        rowGroup: values.some(
          (item: any) =>
            (typeof item[key] === "object" && !Array.isArray(item[key])) ||
            Array.isArray(item[key])
        ), // Check if value is an object
        hide: values.some(
          (item: any) =>
            (typeof item[key] === "object" && !Array.isArray(item[key])) ||
            Array.isArray(item[key])
        ),
        flex:1
      }));
      this.defaultColumns = this.columnDefs.slice(0, 8);
      this.columnDefs = this.columnDefs.slice(9, this.columnDefs.length);
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  // Toggle column visibility
  toggleColumnVisibility(event: any, name: string) {
    const temp = [...this.defaultColumns];
    if (event.target.checked) {
      const column = this.columnDefs.find((col) => col.name === name);
      temp.push(column);
      this.defaultColumns = temp;
    } else {
      const column = this.defaultColumns.find((col) => col.name === name);
      const index = temp.indexOf(column);
      temp.splice(index, 1);
      this.defaultColumns = temp;
    }
  }
}
