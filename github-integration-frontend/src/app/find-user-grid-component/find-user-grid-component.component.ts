import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { GitHubService } from "../services/github.service";
import { AgGridModule } from "ag-grid-angular";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { CommonModule } from "@angular/common";
import { LoaderComponent } from "../loader/loader.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatChipsModule } from "@angular/material/chips";

@Component({
  selector: "app-find-user-grid-component",
  imports: [
    AgGridModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
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
    MatChipsModule,
  ],
  templateUrl: "./find-user-grid-component.component.html",
  styleUrls: ["./find-user-grid-component.component.css"],
})
export class FindUserGridComponent implements OnInit {
  ticketId!: string;
  userName: string = "";
  isLoading: boolean = false;
  rowData: any[] = [];
  filteredData: any[] = [];
  filterForm: FormGroup;
  selectedFacets: { user: string | null; repo: string | null } = {
    user: null,
    repo: null,
  };

  columnDefs = [
    { field: "ticketId", headerName: "Ticket ID", flex: 1, filter: true },
    { field: "user", headerName: "User", flex: 1, filter: true },
    { field: "date", headerName: "Date", flex: 1, filter: true },
    { field: "summary", headerName: "Summary", flex: 2, filter: true },
    { field: "description", headerName: "Description", flex: 2, filter: true },
    { field: "message", headerName: "Message", flex: 2, filter: true },
  ];

  facets = {
    users: ["Alice", "Bob", "Charlie"],
    repos: ["Repo1", "Repo2", "Repo3"],
    statuses: ["Open", "Closed", "Merged", "Draft"],
  };

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private githubService: GitHubService,
    private fb: FormBuilder
  ) {
    // Initialize the filter form
    this.filterForm = this.fb.group({
      startDate: [""],
      endDate: [""],
      status: [""],
    });
  }

  ngOnInit(): void {
    // Fetch query params
    this.route.queryParams.subscribe((params) => {
      this.ticketId = params["ticketId"];
      // Fetch data from API
      this.fetchTicketData(this.ticketId);
    });

    // Check GitHub integration status
    this.checkConnection();
  }

  //
  fetchTicketData(id: string): void {
    this.isLoading = true
    this.githubService.fetchTicketById(id).subscribe({
      next: (response: {
        assignee: {
          login: string;
        };
        updated_at: string | null;
        title: string;
        description: string;
        body: string;
      }) => {
        this.rowData = [
          {
            ticketId: this.ticketId,
            user: response?.assignee?.login ?? "-",
            date: response?.updated_at ?? "-",
            summary: response?.title ?? "-",
            description: response?.description ?? "-",
            message: response?.body ?? "-",
          },
        ];

        this.isLoading = false
      },
      error: (err) => {
        this.isLoading = false
        console.error("Error checking GitHub integration status:", err);
      },
    });
  }

  checkConnection(): void {
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

  filterByFacet(facet: "user" | "repo", value: string): void {
    this.selectedFacets[facet] =
      this.selectedFacets[facet] === value ? null : value;
    this.applyFilters();
  }

  applyFilters(): void {
    const { startDate, endDate, status } = this.filterForm.value;

    this.filteredData = this.rowData.filter((row) => {
      const matchesDate =
        (!startDate || new Date(row.date) >= new Date(startDate)) &&
        (!endDate || new Date(row.date) <= new Date(endDate));
      const matchesStatus = !status || row.status === status;
      const matchesUser =
        !this.selectedFacets.user || row.user === this.selectedFacets.user;
      const matchesRepo =
        !this.selectedFacets.repo || row.repo === this.selectedFacets.repo;

      return matchesDate && matchesStatus && matchesUser && matchesRepo;
    });
  }
}
