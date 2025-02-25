import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular/standalone';
import { SessionVaultService, UnlockMode } from '../core/session-vault.service';
import { Session } from '../models/session';
import { AuthenticationService } from '../core/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, IonTitle],
})
export class Tab1Page implements OnInit, OnDestroy {
  session: Session | null = null;
  lockSubscription: Subscription;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService,
    ngZone: NgZone,
  ) {
    this.lockSubscription = this.sessionVault.locked$.subscribe((locked: boolean) => {
      if (locked) {
        this.session = null;
      } else {
        ngZone.run(async () => (this.session = await this.sessionVault.getSession()));
      }
    });
  }

  async ngOnInit() {
    this.session = await this.sessionVault.getSession();
  }

  ngOnDestroy(): void {
    this.lockSubscription.unsubscribe();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
    this.navController.navigateRoot('/');
  }

  async changeUnlockMode(mode: UnlockMode) {
    await this.sessionVault.updateUnlockMode(mode);
  }

  async lock(): Promise<void> {
    this.session = null;
    await this.sessionVault.lock();
  }
}
