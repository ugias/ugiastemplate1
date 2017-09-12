import { Component, OnInit, Input, Output, EventEmitter}             from "@angular/core";
import { Router }                       from "@angular/router";
import * as moment                      from "moment";
import { Observable }                   from "rxjs/Observable";
import { Token, Task, Pagination }      from "../../../models";
import { USERHOMECONSTANTS }            from "../userHome.constants";
import { UserAuthenticationService }    from "../../../services/shared";
import { TasksService }                 from "./tasks.service";
import { UserHomeService }              from "../userHome.service";

@Component({
    selector: "tasks-component",
    template: require("./tasks.component.html"),
    styles: [require("./tasks.component.less").toString()],
    providers: [TasksService]
})

export class TasksComponent implements OnInit {
    @Input() taskList: Task[];
    @Output() refreshList: EventEmitter<any> = new EventEmitter();
    errorMessage: string;
    tasksComponent = {
        sortColumnIndex: 1,
        sortOrder: USERHOMECONSTANTS.sorting.descOrderString,
        sortColumn: "DateRequested",
        pagination: new Pagination(),
        tasks: new Array<Task>()
    };

    constructor(private userAuthService: UserAuthenticationService, 
    private cecRouter: Router, 
    private taskService: TasksService, 
    private userHomeService: UserHomeService) {
        this.tasksComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };
    }

    public ngOnInit() {
        this.GetTasksList();
    }

    onTaskWorkflowSubmit(taskId: string, taskTypeCode: string) {
       
        if (taskTypeCode.toLowerCase() === USERHOMECONSTANTS.taskTypeCodes.createAccount.toLowerCase()) {
            this.cecRouter.navigate(["/accountworkflow", taskId]);
            return;
        }
        if (taskTypeCode.toLowerCase() === USERHOMECONSTANTS.taskTypeCodes.addedOrganisation.toLowerCase()) {
            this.cecRouter.navigate(["/organisationworkflow", taskId]);
            return;
        }
        if (taskTypeCode.toLowerCase() === USERHOMECONSTANTS.taskTypeCodes.applicationAccess.toLowerCase()) {
            this.cecRouter.navigate(["/applicationaccessworkflow", taskId]);
            return;
        }
    }

    public SortIconClass(columnIndex): string {
        if (columnIndex === this.tasksComponent.sortColumnIndex) {
            if (this.tasksComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                return USERHOMECONSTANTS.sorting.ascIconClass;
            } else {
                return USERHOMECONSTANTS.sorting.descIconClass;
            }
        } else {
            return "";
        }
    }

    public SortList(columnIndex: number) {
        if (columnIndex === this.tasksComponent.sortColumnIndex) {
            if (this.tasksComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                this.tasksComponent.sortOrder = USERHOMECONSTANTS.sorting.descOrderString;
            } else {
                this.tasksComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            }
        } else {
            this.tasksComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            switch (columnIndex) {
                case 1:
                    this.tasksComponent.sortColumn = "TaskStatusCode";
                    break;
                case 2:
                    this.tasksComponent.sortColumn = "DateRequested";
                    break;
                case 3:
                    this.tasksComponent.sortColumn = "RequestedBy";
                    break;
                case 4:
                    this.tasksComponent.sortColumn = "OrganisationName";
                    break;
                case 5:
                    this.tasksComponent.sortColumn = "Subject";
                    break;
                default:
                    this.tasksComponent.sortColumn = "TaskStatusCode";
            }
        }
        this.tasksComponent.sortColumnIndex = columnIndex;
        this.GetTasksList();
        // this.GetStaticTasks();
    }

    public PageChanged(currentPageObject) {
        this.tasksComponent.pagination.currentPage = currentPageObject.page;
        this.GetTasksList();
        // this.GetStaticTasks();
    }

    public GetTasksList(): void {
        this.taskService
            .GetTasksList(this.tasksComponent.pagination, this.tasksComponent.sortOrder, this.tasksComponent.sortColumn)
            .map(response => response.json())
            .subscribe(
                response => {
                this.refreshList.emit(<Task[]>response.result);

                this.tasksComponent.pagination.totalItems = response.count; // get from the response 
                this.userHomeService.confirmTotalItemUpdate(response.count); // get from the response
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                    this.tasksComponent.tasks = [];
                }
            });
    }

    // TODO: Get reid of this once API is done
    public SortTasks(listToSort: Array<Task>): Array<Task> {
        let sortedList: Array<Task>;
        sortedList = listToSort;
        if (this.tasksComponent.sortColumn === "RequestedBy") {
            sortedList = listToSort.sort((n1, n2) => {
                if (this.tasksComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                    if (n1.requestedBy > n2.requestedBy) {
                        return 1;
                    }
                    if (n1.requestedBy < n2.requestedBy) {
                        return -1;
                    }
                } else {
                    if (n1.requestedBy < n2.requestedBy) {
                        return 1;
                    }
                    if (n1.requestedBy > n2.requestedBy) {
                        return -1;
                    }
                }
                return 0;
            });
        }

  if (this.tasksComponent.sortColumn === "OrganisationName") {
            sortedList = listToSort.sort((n1, n2) => {
                if (this.tasksComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                    if (n1.organisationName > n2.organisationName) {
                        return 1;
                    }
                    if (n1.organisationName < n2.organisationName) {
                        return -1;
                    }
                } else {
                    if (n1.organisationName < n2.organisationName) {
                        return 1;
                    }
                    if (n1.organisationName > n2.organisationName) {
                        return -1;
                    }
                }
                return 0;
            });
        }
        return sortedList;
    }
}