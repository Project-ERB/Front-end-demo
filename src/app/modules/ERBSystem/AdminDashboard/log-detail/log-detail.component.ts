import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiedeAdminComponent } from "../../../../shared/UI/siede-admin/siede-admin/siede-admin.component";

export type DetailStatus = 'Success' | 'Critical' | 'Warning' | 'Info';

export interface PermissionChange {
  permission: string;
  action: 'add' | 'remove';
}

export interface RawPayload {
  event_id: string;
  timestamp: string;
  actor: {
    id: string;
    username: string;
    ip: string;
    user_agent: string;
  };
  action: {
    module: string;
    type: string;
    target_user: string;
    changes: PermissionChange[];
  };
  status: string;
  server_node: string;
}

export interface LogDetail {
  // Overview
  eventId: string;
  timestamp: string;
  eventType: string;
  status: DetailStatus;

  // Actor
  userInitials: string;
  userBg: string;
  userText: string;
  userName: string;
  userId: string;
  ipAddress: string;
  ipLabel: string;
  device: string;
  userAgent: string;

  // Action
  module: string;
  moduleIcon: string;
  moduleBg: string;
  specificAction: string;
  description: string;            // plain text
  descChanges: PermissionChange[]; // structured diff rendered separately

  // Raw payload
  rawPayload: RawPayload;
}
@Component({
  selector: 'app-log-detail',
  standalone: true,
  imports: [CommonModule, SiedeAdminComponent],
  templateUrl: './log-detail.component.html',
  styleUrl: './log-detail.component.scss'
})
export class LogDetailComponent {


  // ── State ──────────────────────────────────────────────────────────────
  copyTooltip = '';
  isCopied = false;
  formattedJson = '';

  // ── Data ───────────────────────────────────────────────────────────────
  log: LogDetail = {
    // Overview
    eventId: 'LOG-2023-8849-AK',
    timestamp: '2023-10-27 14:32:01 UTC',
    eventType: 'User Permission Update',
    status: 'Success',

    // Actor
    userInitials: 'JD',
    userBg: 'bg-blue-100',
    userText: 'text-blue-600',
    userName: 'John Doe',
    userId: 'usr_8923401',
    ipAddress: '192.168.1.45',
    ipLabel: 'LAN',
    device: 'Chrome on macOS 10.15.7',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    // Action
    module: 'User Management',
    moduleIcon: 'group',
    moduleBg: 'bg-blue-50 text-blue-700 border-blue-100',
    specificAction: 'update_user_permissions',
    description: 'Administrator John Doe manually updated the permission set for user @sarah_m.',
    descChanges: [
      { permission: 'write_reports', action: 'add' },
      { permission: 'admin_settings_access', action: 'remove' },
    ],

    // Raw payload
    rawPayload: {
      event_id: 'LOG-2023-8849-AK',
      timestamp: '2023-10-27T14:32:01.442Z',
      actor: {
        id: 'usr_8923401',
        username: 'jdoe',
        ip: '192.168.1.45',
        user_agent: 'Mozilla/5.0...'
      },
      action: {
        module: 'user_management',
        type: 'update_permissions',
        target_user: 'usr_7721098',
        changes: [
          { permission: 'write_reports', action: 'add' },
          { permission: 'admin_settings_access', action: 'remove' },
        ]
      },
      status: 'success',
      server_node: 'app-worker-04'
    }
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.formattedJson = JSON.stringify(this.log.rawPayload, null, 2);
  }

  // ── Status helpers ─────────────────────────────────────────────────────
  getStatusBadge(status: DetailStatus): string {
    switch (status) {
      case 'Success': return 'bg-green-100  text-green-800  border-green-200';
      case 'Critical': return 'bg-red-100    text-red-800    border-red-200';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Info': return 'bg-blue-100   text-blue-800   border-blue-200';
    }
  }

  getStatusDot(status: DetailStatus): string {
    switch (status) {
      case 'Success': return 'bg-green-500';
      case 'Critical': return 'bg-red-500';
      case 'Warning': return 'bg-yellow-500';
      case 'Info': return 'bg-blue-500';
    }
  }

  getStatusLabel(status: DetailStatus): string {
    return status === 'Success' ? 'Success / Info' : status;
  }

  // ── Copy JSON ──────────────────────────────────────────────────────────
  copyJson(): void {
    if (this.isCopied) return;
    navigator.clipboard.writeText(this.formattedJson).then(() => {
      this.isCopied = true;
      this.copyTooltip = 'Copied!';
      setTimeout(() => {
        this.isCopied = false;
        this.copyTooltip = '';
      }, 2000);
    }).catch(() => {
      this.copyTooltip = 'Failed to copy';
      setTimeout(() => this.copyTooltip = '', 2000);
    });
  }

  // ── Export PDF stub ────────────────────────────────────────────────────
  exportPdf(): void {
    console.log('Exporting PDF for', this.log.eventId);
  }

  // ── Go back stub ───────────────────────────────────────────────────────
  goBack(): void {
    window.history.back();
  }

}
