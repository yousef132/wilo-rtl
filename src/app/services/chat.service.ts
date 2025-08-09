import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { debug } from 'node:console';
import { ChatMessage } from '../models/content/content';
import { PdfGeneratorService } from './pdf-generator.service';
import { AuthService } from './authr/auth.service';
import { currentUser } from '../constants/apiConstants';
import { UserInfo } from 'node:os';
import { ProgramsService } from './programs.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

export interface MessageConfirmation {
    nextContentId: number;
    certificateUrl: string;
    programName: string;
    programId: number;
    currentContentId: number;
}
@Injectable({
    providedIn: 'root',
})
export class ChatService {
    public hubConnection!: signalR.HubConnection;
    public messages: ChatMessage[] = [];
    public connected = false;
    currentUser!: currentUser;

    // public msgCount = 0;
    constructor(
        private certificationService: PdfGeneratorService,
        private authService: AuthService,
        private route: Router,
        private spinner: NgxSpinnerService,
    ) {
        // get current user
        this.authService.currentUser.subscribe((user) => {
            if (user) {
                this.currentUser = user;
            }
        });
    }

    stopConnection(): Promise<void> {
        if (this.hubConnection && this.connected) {
            this.connected = false;
            return this.hubConnection
                .stop()
                .then(() => {
                    console.log('SignalR connection stopped');
                })
                .catch((err) => {
                    console.error('Error stopping SignalR connection:', err);
                });
        }
        return Promise.resolve();
    }
    getConnectionState(): signalR.HubConnectionState | null {
        return this.hubConnection ? this.hubConnection.state : null;
    }
    isConnected(): boolean {
        return (
            this.connected &&
            this.hubConnection &&
            this.hubConnection.state === signalR.HubConnectionState.Connected
        );
    }

    startConnection(registrationId: number): Promise<void> {
        const token = localStorage.getItem('token') || '';

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7253/chatHub', {
                accessTokenFactory: () => token, // token will be passed as query param
            })
            .withAutomaticReconnect()
            .build();

        // this.hubConnection.on(
        //     'MessageSentConfirmation',
        //     (confirmation: MessageConfirmation) => {
        //         debugger;
        //         // if next content is -1, generate the certificate and make the api call to handle finishing course

        //         // didn't pass to next content, either for pass reqs
        //         if (confirmation?.nextContentId) {
        //             if (confirmation.nextContentId == -1) {
        //                 // completed the program
        //                 this.certificationService.fireAndForgetGenerateCertificate(
        //                     confirmation.certificateUrl,
        //                     this.currentUser.userName,
        //                     confirmation.programName,
        //                     new Date().toString(),
        //                     this.currentUser.id,
        //                     confirmation.programId,
        //                     confirmation.currentContentId,
        //                     false
        //                 );
        //                 return;
        //             }
        //             this.route.navigate([
        //                 // completed current content, navigate to next content
        //                 '/content-details',
        //                 confirmation.nextContentId,
        //                 this.currentUser.id,
        //                 confirmation.programId,
        //             ]);
        //             return;
        //         }
        //     }
        // );

        // 1. connect to signalR
        // 2. JoinRegistrationGroup
        // 3. ReceiveMessage
        // 4. MessageRead
        this.hubConnection.on(
            'MessageSentConfirmation',
            (confirmation: MessageConfirmation) => {
                (async () => {

                    if (confirmation?.nextContentId) {
                        if (confirmation.nextContentId == -1) {
                            this.spinner.show();
                            await this.certificationService.fireAndForgetGenerateCertificate(
                                confirmation.certificateUrl,
                                this.currentUser.userName,
                                confirmation.programName,
                                new Date().toString(),
                                this.currentUser.id,
                                confirmation.programId,
                                confirmation.currentContentId,
                                false
                            );
                            this.spinner.hide();
                            // ✅ Waited for certificate to finish generating
                            this.route.navigate(['/program-completed'], {
                                queryParams: { status: true },
                            });
                            return;
                        }

                        // Navigate to next content
                        this.route.navigate([
                            '/content-details',
                            confirmation.nextContentId,
                            this.currentUser.id,
                            confirmation.programId,
                        ]);
                    }
                })().catch((err) => {
                    console.error(
                        'Error in MessageSentConfirmation handler:',
                        err
                    );
                });
            }
        );

        return this.hubConnection
            .start()
            .then(() => {
                this.connected = true;

                // Join group
                return this.hubConnection.invoke(
                    'JoinRegistrationGroup',
                    registrationId
                );
            })
            .then(() => {
                console.log('Connected & joined group:', registrationId);

                // Register event handlers
                this.hubConnection.on(
                    'ReceiveMessage',
                    (message: ChatMessage) => {
                        this.messages.push(message);
                    }
                );
            })
            .catch((err) => {
                console.error('SignalR connection error:', err);
            });
    }
    /**
     * Send a message to the group
     */
    sendMessage(registrationId: number, message: string, contentId: number) {
        if (!this.connected) return;
        this.hubConnection
            .invoke('SendMessage', registrationId, message, contentId)
            .catch((err) => console.error(err));
    }

    /**
     * Mark a message as read
     */
    markMessageAsRead(messageId: number, registrationId: number) {
        if (!this.connected) return;
        this.hubConnection
            .invoke('MarkMessageAsRead', messageId, registrationId)
            .catch((err) => console.error(err));
    }
}
