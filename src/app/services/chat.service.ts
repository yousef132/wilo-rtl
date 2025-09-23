import { isPlatformBrowser } from '@angular/common';
import { EventEmitter, inject, Injectable, PLATFORM_ID } from '@angular/core';
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
import { environment } from '../../environments/environment.development';

export interface MessageConfirmation {
    nextContentId: number;
}
@Injectable({
    providedIn: 'root',
})
export class ChatService {
    public hubConnection!: signalR.HubConnection;
    public messages: ChatMessage[] = [];
    public connected = false;
    currentUser!: currentUser;

    public messageConfirmation = new EventEmitter<MessageConfirmation>();
    public connectionStateChanged = new EventEmitter<boolean>();
    // public msgCount = 0;
    constructor(
        private certificationService: PdfGeneratorService,
        private authService: AuthService,
        private route: Router,
        private spinner: NgxSpinnerService
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
        let signalRUrl = environment.SIGNALR_URL;
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(signalRUrl, {
                accessTokenFactory: () => token, // token will be passed as query param
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.on(
            'MessageSentConfirmation',
            (confirmation: MessageConfirmation) => {
                // -1 or a next content number
                if (confirmation.nextContentId) {
                    this.messageConfirmation.emit(confirmation);
                }
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
