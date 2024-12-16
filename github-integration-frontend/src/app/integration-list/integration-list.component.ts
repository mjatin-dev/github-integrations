import { Component, OnInit } from "@angular/core";
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
import { IServerSideDatasource } from "ag-grid-community";

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
    LoaderComponent,
    CommonModule,
  ],
  selector: "app-integration-list",
  templateUrl: "./integration-list.component.html",
  styleUrls: ["./integration-list.component.css"],
})
export class IntegrationListComponent implements OnInit {
  collections = []; // Entity Dropdown
  integrations: string[] = ["GitHub"]; // Only one option
  activeIntegration: string = "GitHub";
  selectedCollection: string | null = null;
  orginazation: { id: string; name: string }[] = [];
  searchKeyword = "";
  isLoading: boolean = false;
  tooltipShowDelay = 500;
  userName: string = "";
  datasource!: IServerSideDatasource;
  rowData: any[] = [];
  filteredData: any[] = [];
  columnDefs: any[] = [];
  defaultColumns: any[] = [];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  constructor(
    private githubService: GitHubService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Simulate fetching collection data and columns dynamically
    this.fetchCollectionData();
    this.checkConnection();
  }

  // Fetch data based on selected collection
  onCollectionChange() {
    this.isLoading = true;
    const fetchCollectionName = this.orginazation.find(
      (item: any) => item.name === this.selectedCollection
    );
    if (fetchCollectionName) {
      this.githubService
        .fetchGithubCollections(fetchCollectionName.name)
        .subscribe(
          (response) => {
            const { columns, data } = response;
            const updateColumns = columns.map((field: any) => ({
              name: field,
              field: field,
              flex: 1,
            }));

            this.columnDefs = updateColumns.slice(9, updateColumns.length);
            this.defaultColumns = updateColumns.slice(0, 8);

            const transformNestedData = this.extractnestedobject();

            this.rowData = transformNestedData(data);
            this.filteredData = transformNestedData(data);
            this.isLoading = false;
          },
          (error) => {
            console.error("Error fetching GitHub collections:", error);
            this.snackBar.open("Error fetching GitHub collections", "Close", {
              duration: 3000,
            });
            this.isLoading = false;
            this.columnDefs = [];
            this.rowData = [];
            this.filteredData = [];
          }
        );
    }
  }

  // Fetch collection data
  fetchCollectionData() {
    this.isLoading = true;
    this.githubService.fetchDatabaseCollections().subscribe(
      (response) => {
        const { collections } = response;
        this.collections = collections.map((item: any) => item.name);
        this.orginazation = collections;
        this.isLoading = false;
      },
      (error) => {
        console.error("Error fetching database collections:", error);
        this.snackBar.open("Error fetching database collections", "Close", {
          duration: 3000,
        });
        this.isLoading = false;
      }
    );
  }

  // Search data in table
  onSearchChange(keyword: string) {
    this.filteredData = this.rowData.filter((item) =>
      Object.values(item).some((val: any) =>
        val.toString().toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  // Remove integration
  checkConnection(): void {
    this.githubService
      .checkIntegrationStatus()
      .subscribe(
        (response: {
          connected: boolean;
          connectedAt: string | null;
          userId: string;
          githubUsername: string;
        }) => {
          this.userName = response.githubUsername;
        }
      );
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

  // Extract nested object
  private extractnestedobject() {
    return (data: any[]): any[] =>
      data.map((item: any) => {
        const transform = (obj: any): any => {
          if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
            // If it's an object, replace it with its first value or recursively process its keys
            const transformedObj: { [key: string]: any } = {};
            for (const key in obj) {
              transformedObj[key] =
                typeof obj[key] === "object" && obj[key] !== null
                  ? transform(obj[key]) // Recursively process nested objects
                  : obj[key]; // Keep non-object values as is
            }
            return Object.keys(transformedObj).length === 1
              ? Object.values(transformedObj)[0]
              : transformedObj;
          }
          return obj; // If not an object, return as is
        };

        return transform(item);
      });
  }
}
