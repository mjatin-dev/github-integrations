import "ag-grid-enterprise";
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
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core"; // For Datepicker
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LoaderComponent } from "../loader/loader.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { GitHubService } from "../services/github.service";
import {
  IServerSideDatasource,
  IFilterParams,
  IFilter,
} from "ag-grid-community";
import { ModuleRegistry, RowGroupingModule } from "ag-grid-enterprise";
import { ImageCellRenderer } from "../image-component/image-component.component";

ModuleRegistry.registerModules([RowGroupingModule]);

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
    ReactiveFormsModule,
  ],
  selector: "app-integration-list",
  templateUrl: "./integration-list.component.html",
  styleUrls: ["./integration-list.component.css"],
})
export class IntegrationListComponent implements IFilter, OnInit {
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
  private params!: IFilterParams;
  startDate!: string;
  endDate!: string;
  searchValue: string | undefined;

  filterForm!: FormGroup;
  selectedFacets: { user: string | null; repo: string | null } = {
    user: null,
    repo: null,
  };

  facets = {
    users: ["Alice", "Bob", "Charlie"],
    repos: ["Repo1", "Repo2", "Repo3"],
    statuses: ["Open", "Closed", "Merged", "Draft"],
  };

  defaultColumns: any[] = [];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  searchResults: any[] = [];

  constructor(
    private githubService: GitHubService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    // Initialize the filter form
    this.filterForm = this.fb.group({
      startDate: [""],
      endDate: [""],
      status: [""],
    });
  }

  ngOnInit() {
    // Simulate fetching collection data and columns dynamically
    this.fetchCollectionData();
    this.checkConnection();
  }

  /** Called when the filter is initialized by AG Grid */
  init(params: IFilterParams): void {
    this.params = params;

    // Optionally, initialize default filter values
    this.startDate = "";
    this.endDate = "";
  }

  /** Determines if the filter is active */
  isFilterActive(): boolean {
    return !!this.startDate || !!this.endDate;
  }

  /** Returns the current filter model */
  getModel(): any {
    return { startDate: this.startDate, endDate: this.endDate };
  }

  /** Sets the filter model from AG Grid */
  setModel(model: any): void {
    this.startDate = model?.startDate || "";
    this.endDate = model?.endDate || "";
  }

  doesFilterPass(params: any): boolean {
    // Implement your logic here
    return true;
  }

  onDateChanged(): void {
    this.params.filterChangedCallback();
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
            const updateColumns = columns.map((field: any) => {
              return {
                name: field,
                field: field,
                filter: true,
                cellRenderer:
                  field === "avatar_url" ? ImageCellRenderer : undefined,
                rowGroup: data.some(
                  (item: any) =>
                    (typeof item[field] === "object" &&
                      !Array.isArray(item[field])) ||
                    Array.isArray(item[field])
                ), // Check if value is an object
                hide: data.some(
                  (item: any) =>
                    (typeof item[field] === "object" &&
                      !Array.isArray(item[field])) ||
                    Array.isArray(item[field])
                ),
                valueGetter: (params: any) => {
                  const value = params.data[field];
                  if (typeof value === "object") {
                    return JSON.stringify(value);
                  }
                  return value;
                },
                flex: 1,
                filterFramework: "dateRangeFilter", // Custom filter framework
              };
            });

            this.columnDefs = updateColumns.slice(12, updateColumns.length);
            this.defaultColumns = updateColumns.slice(0, 11);

            const updatedValue = data.map((item: any) => {
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
            this.filteredData = updatedValue;
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
    if (keyword !== "") {
      if (keyword.toLocaleLowerCase() === "tickets") {
        this.getTickets();
        this.searchValue = keyword.toLocaleLowerCase();
      } else {
        this.githubService.searchRecord(keyword.toLowerCase()).subscribe(
          (response) => {
            const { columns, data } = response.data;
            const updateColumns = columns?.map((field: any) => ({
              name: field,
              field: field,
              filter: true,
              rowGroupIndex: 1,
              flex: 1,
              filterFramework: "dateRangeFilter", // Custom filter framework
            }));

            this.columnDefs = updateColumns?.slice(9, updateColumns.length);
            this.defaultColumns = updateColumns?.slice(0, 8);

            const updatedValue = data.map((item: any) => {
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
            this.filteredData = updatedValue;
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

        // this.filteredData = this.rowData.filter((item) =>
        //   Object.values(item).some((val: any) =>
        //     val.toString().toLowerCase().includes(keyword.toLowerCase())
        //   )
        // );
      }
    }
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

  // Fetch tickets
  getTickets() {
    this.isLoading = true;
    this.githubService.fetchTickets().subscribe(
      (response) => {
        this.searchResults = response;
        this.isLoading = false;
      },
      (error) => {
        console.error("Error fetching tickets:", error);
        this.snackBar.open("Error fetching tickets", "Close", {
          duration: 3000,
        });
        this.isLoading = false;
      }
    );
  }

  // Path: github-integration-frontend/src/app/find-user-grid-component/find-user-grid-component.component.ts
  getFindUserLink(ticketId: string): string {
    // This will route to the AG Grid page with the ticketId as a query parameter
    return `/find-user?ticketId=${ticketId}`;
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

  filterByFacet(facet: "user" | "repo", value: string): void {
    this.selectedFacets[facet] =
      this.selectedFacets[facet] === value ? null : value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.isLoading = true;
    const { startDate, endDate, status } = this.filterForm.value;
    this.githubService.filterRecord(startDate, endDate, status).subscribe(
      (response) => {
        this.isLoading = false;
        const { columns, data } = response;
        const updateColumns = columns.map((field: any) => ({
          name: field,
          field: field,
          filter: true,
          rowGroupIndex: 1,
          flex: 1,
          rowGroup: data.some(
            (item: any) =>
              (typeof item[field] === "object" &&
                !Array.isArray(item[field])) ||
              Array.isArray(item[field])
          ), // Check if value is an object
          hide: data.some(
            (item: any) =>
              (typeof item[field] === "object" &&
                !Array.isArray(item[field])) ||
              Array.isArray(item[field])
          ),
          valueGetter: (params: any) => {
            const value = params.data[field];
            if (typeof value === "object") {
              return JSON.stringify(value);
            }
            return value;
          },
          filterFramework: "dateRangeFilter", // Custom filter framework
        }));

        this.columnDefs = updateColumns.slice(12, updateColumns.length);
        this.defaultColumns = updateColumns.slice(0, 11);

        const updatedValue = data.map((item: any) => {
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
        this.filteredData = updatedValue;
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

  clearFilter(): void {
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
            const updateColumns = columns.map((field: any) => {
              return {
                name: field,
                field: field,
                filter: true,
                cellRenderer:
                  field === "avatar_url" ? ImageCellRenderer : undefined,
                rowGroup: data.some(
                  (item: any) =>
                    (typeof item[field] === "object" &&
                      !Array.isArray(item[field])) ||
                    Array.isArray(item[field])
                ), // Check if value is an object
                hide: data.some(
                  (item: any) =>
                    (typeof item[field] === "object" &&
                      !Array.isArray(item[field])) ||
                    Array.isArray(item[field])
                ),
                valueGetter: (params: any) => {
                  const value = params.data[field];
                  if (typeof value === "object") {
                    return JSON.stringify(value);
                  }
                  return value;
                },
                flex: 1,
                filterFramework: "dateRangeFilter", // Custom filter framework
              };
            });

            this.columnDefs = updateColumns.slice(12, updateColumns.length);
            this.defaultColumns = updateColumns.slice(0, 11);

            const updatedValue = data.map((item: any) => {
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
            this.filteredData = updatedValue;
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

  clearSearchResults(): void {
    this.searchResults = [];
    this.searchKeyword = "";
    this.fetchCollectionData();
  }
}
