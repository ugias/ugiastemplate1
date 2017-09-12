import { Component, OnInit, Input, Output, EventEmitter}
                                        from "@angular/core";
import { ActivatedRoute }               from "@angular/router";
import * as moment                      from "moment";
import { Observable }                   from "rxjs/Observable";
import { Token, Message, Pagination }   from "../../../models";
import { CONFIGURATION }                from "../../../app.constants";
import { USERHOMECONSTANTS }            from "../userHome.constants";
import { UserAuthenticationService, CurrentUserService }
from "../../../services/shared";
import { MessagesService }              from "./messages.service";
import { UserHomeService }              from "../userHome.service";

@Component({
    selector: "messages-component",
    template: require("./messages.component.html"),
    styles: [require("./messages.component.less").toString()],
    providers: [MessagesService]
})

export class MessagesComponent implements OnInit {
    @Input() messageList: Message[];
    @Output() refreshList: EventEmitter<any> = new EventEmitter();
    errorMessage: string;
    showReadMessages: boolean;
    hasViewPermission: boolean;
    userToProcess: string = "";
    messagesComponent = {
        sortColumnIndex: 1,
        sortOrder: USERHOMECONSTANTS.sorting.descOrderString,
        sortColumn: "DateSent",
        pagination: new Pagination(),
        messages: new Array<Message>()
    };

    constructor(private userAuthService: UserAuthenticationService, 
    private cecActivatedRoute: ActivatedRoute,
    private messageService: MessagesService,
    private userHomeService: UserHomeService,
    private currentUserService: CurrentUserService) {
        this.messagesComponent.pagination = {
            totalItems: 0,
            currentPage: USERHOMECONSTANTS.pagination.currentPage,
            itemsPerPage: USERHOMECONSTANTS.pagination.itemsPerPage,
            maxSize: USERHOMECONSTANTS.pagination.maxSize
        };
    }

    public ngOnInit() {
        this.showReadMessages = false;
        // Apply security rules
        let token = this.currentUserService.token;
        if (token) {
            // Global admins can view messages ot other users
            if (this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId]) {
                this.userToProcess = this.cecActivatedRoute.snapshot.queryParams[USERHOMECONSTANTS.params.userId];
                this.hasViewPermission = token.globalRoleCode === CONFIGURATION.globalRoles.netidSiteAdmin
                    || token.globalRoleCode === CONFIGURATION.globalRoles.netidAdmin;
            } else {
                this.userToProcess = "";
                // Logged in user can view own messages
                this.hasViewPermission = true;
            }
        };

         this.GetMessageList(this.userToProcess);
        // this.GetStaticMessages();
    }

    public SortIconClass(columnIndex): string {
        if (columnIndex === this.messagesComponent.sortColumnIndex) {
            if (this.messagesComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                return USERHOMECONSTANTS.sorting.ascIconClass;
            } else {
                return USERHOMECONSTANTS.sorting.descIconClass;
            }
        } else {
            return "";
        }
    }

    public SortList(columnIndex: number) {
        if (columnIndex === this.messagesComponent.sortColumnIndex) {
            if (this.messagesComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                this.messagesComponent.sortOrder = USERHOMECONSTANTS.sorting.descOrderString;
            } else {
                this.messagesComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            }
        } else {
            this.messagesComponent.sortOrder = USERHOMECONSTANTS.sorting.ascOrderString;
            switch (columnIndex) {
                case 1:
                    this.messagesComponent.sortColumn = "MessageStatusCode";
                    break;
                case 2:
                    this.messagesComponent.sortColumn = "DateSent";
                    break;
                case 3:
                    this.messagesComponent.sortColumn = "ApplicationName";
                    break;
                case 4:
                    this.messagesComponent.sortColumn = "MessageFrom";
                    break;
                case 5:
                    this.messagesComponent.sortColumn = "ToRoleCode";
                    break;
                case 6:
                    this.messagesComponent.sortColumn = "ToUserId";
                    break;
                case 7:
                    this.messagesComponent.sortColumn = "Subject";
                    break;
                default:
                    this.messagesComponent.sortColumn = "MessageStatusCode";
            }
        }
        this.messagesComponent.sortColumnIndex = columnIndex;
         this.GetMessageList(this.userToProcess);
        // this.GetStaticMessages();
    }

    public PageChanged(currentPageObject) {
        this.messagesComponent.pagination.currentPage = currentPageObject.page;
         this.GetMessageList(this.userToProcess);
        // this.GetStaticMessages();
    }
    public RefreshMessageList(showReadMessages) {
        this.showReadMessages = showReadMessages;
         this.GetMessageList(this.userToProcess);
        // this.GetStaticMessages();
    }

    public GetMessageList(userId: string): void {
        this.messageService
            .GetMessageList(userId, this.messagesComponent.pagination, this.messagesComponent.sortOrder,
                this.messagesComponent.sortColumn, this.showReadMessages)
            .map(response => response.json())
            .subscribe(
                response => {
                this.refreshList.emit(<Message[]>response.result);

                this.messagesComponent.pagination.totalItems = response.count; // get from the response 
                this.userHomeService.confirmTotalItemUpdate(response.count); // get from the response
            },
            (error) => {
                let paersedErrors = JSON.parse(error._body);
                if (paersedErrors) {
                    this.errorMessage = paersedErrors.message;
                }
            });
    }

    // TODO: Get reid of this once API is done
    public GetStaticMessages(): void {
        let skip: any = (this.messagesComponent.pagination.currentPage - 1) * this.messagesComponent.pagination.itemsPerPage;
        let messageList = [
            { messageId: "1", messageStatusCode: "Pending", dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user", toRoleCode: "to.user", toUserId: "", subject: "Test Message", actionUrl: "/action?id=1" },
            { messageId: "2", messageStatusCode: "Approved",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user1", toRoleCode: "to.user1", toUserId: "", subject: "Test Message1", actionUrl: "/action?id=2" },
            { messageId: "3", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user2", toRoleCode: "to.user2", toUserId: "", subject: "Test Message2", actionUrl: "/action?id=3" },
            { messageId: "4", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user3", toRoleCode: "to.user3", toUserId: "", subject: "Test Message3", actionUrl: "/action?id=4" },
            { messageId: "5", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user4", toRoleCode: "to.user4", toUserId: "", subject: "Test Message4", actionUrl: "/action?id=5" },
            { messageId: "6", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user5", toRoleCode: "to.user5", toUserId: "", subject: "Test Message5", actionUrl: "/action?id=6" },
            { messageId: "7", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user6", toRoleCode: "to.user6", toUserId: "", subject: "Test Message6", actionUrl: "/action?id=7" },
            { messageId: "8", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user7", toRoleCode: "to.user7", toUserId: "", subject: "Test Message7", actionUrl: "/action?id=8" },
            { messageId: "9", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user8", toRoleCode: "to.user8", toUserId: "", subject: "Test Message8", actionUrl: "/action?id=9" },
            { messageId: "10", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user9", toRoleCode: "to.user9", toUserId: "", subject: "Test Message9", actionUrl: "/action?id=10" },
            { messageId: "11", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user10", toRoleCode: "to.user10", toUserId: "", subject: "Test Message10", actionUrl: "/action?id=11" },
            { messageId: "12", messageStatusCode: "Approved",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user11", toRoleCode: "to.user11", toUserId: "", subject: "Test Message11", actionUrl: "/action?id=12" },
            { messageId: "13", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user12", toRoleCode: "to.user12", toUserId: "", subject: "Test Message12", actionUrl: "/action?id=13" },
            { messageId: "14", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user13", toRoleCode: "to.user13", toUserId: "", subject: "Test Message13", actionUrl: "/action?id=14" },
            { messageId: "15", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user14", toRoleCode: "to.user14", toUserId: "", subject: "Test Message14", actionUrl: "/action?id=15" },
            { messageId: "16", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user15", toRoleCode: "to.user15", toUserId: "", subject: "Test Message15", actionUrl: "/action?id=16" },
            { messageId: "17", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user16", toRoleCode: "to.user16", toUserId: "", subject: "Test Message16", actionUrl: "/action?id=17" },
            { messageId: "18", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user17", toRoleCode: "to.user17", toUserId: "", subject: "Test Message17", actionUrl: "/action?id=18" },
            { messageId: "19", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user18", toRoleCode: "to.user18", toUserId: "", subject: "Test Message18", actionUrl: "/action?id=19" },
            { messageId: "20", messageStatusCode: "Pending",  dateSent: new Date(), applicationName: "NETiD", messageFrom: "from.user19", toRoleCode: "to.user19", toUserId: "", subject: "Test Message19", actionUrl: "/action?id=20" }
        ];

        this.messagesComponent.messages = this.SortTasks(messageList).filter(task => task.messageId > skip && task.messageId <= skip + this.messagesComponent.pagination.itemsPerPage);
        this.messagesComponent.pagination.totalItems = 20;
        this.userHomeService.confirmTotalItemUpdate(20);
    }

    // TODO: Get reid of this once API is done
    public SortTasks(listToSort: Array<Message>): Array<Message> {
        let sortedList: Array<Message>;
        sortedList = listToSort;
        if (this.messagesComponent.sortColumn === "MessageFrom") {
            sortedList = listToSort.sort((n1, n2) => {
                if (this.messagesComponent.sortOrder === USERHOMECONSTANTS.sorting.ascOrderString) {
                    if (n1.messageFrom > n2.messageFrom) {
                        return 1;
                    }
                    if (n1.messageFrom < n2.messageFrom) {
                        return -1;
                    }
                } else {
                    if (n1.messageFrom < n2.messageFrom) {
                        return 1;
                    }
                    if (n1.messageFrom > n2.messageFrom) {
                        return -1;
                    }
                }
                return 0;
            });
        }

        return sortedList;
    }
}