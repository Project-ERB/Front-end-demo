import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarSuperAdminComponent } from "../../../../shared/UI/navbar-super-admin/navbar-super-admin.component";
import { SidbarSuperAdminComponent } from "../../../../shared/UI/sidbar-super-admin/sidbar-super-admin.component";

export interface StatCard {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendIcon: string;
  trendPositive: boolean; // true = green, false = red/neutral
  iconBg: string; // e.g., 'bg-blue-50'
  iconColor: string; // e.g., 'text-blue-600'
}

export interface ActivityLog {
  user: string;
  avatar: string;
  action: string;
  role: string;
  roleColor: 'purple' | 'blue' | 'gray';
  status: 'Success' | 'Failed';
  time: string;
}

export interface QuickAction {
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string; // base color name for dynamic classes
}
@Component({
  selector: 'app-super-admin-overview',
  imports: [CommonModule, NavbarSuperAdminComponent, SidbarSuperAdminComponent],
  templateUrl: './super-admin-overview.component.html',
  styleUrl: './super-admin-overview.component.scss',
})
export class SuperAdminOverviewComponent {
  stats: StatCard[] = [
    {
      title: 'Total Active Users',
      value: '12,405',
      icon: 'group',
      trend: '+12%',
      trendIcon: 'trending_up',
      trendPositive: true,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      icon: 'dns',
      trend: 'Stable',
      trendIcon: '',
      trendPositive: true,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Security Alerts',
      value: '2',
      icon: 'security',
      trend: 'Needs Attention',
      trendIcon: '',
      trendPositive: false,
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Pending Approvals',
      value: '5',
      icon: 'pending_actions',
      trend: '-1 pending',
      trendIcon: '',
      trendPositive: true,
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  quickActions: QuickAction[] = [
    {
      title: 'Add New Admin',
      subtitle: 'Invite a new super user',
      icon: 'person_add',
      colorClass: 'blue',
    },
    {
      title: 'Reset Password',
      subtitle: 'Trigger password flow',
      icon: 'key',
      colorClass: 'yellow',
    },
    {
      title: 'Deploy Hotfix',
      subtitle: 'Push to production',
      icon: 'rocket_launch',
      colorClass: 'pink',
    },
    {
      title: 'View Audit Logs',
      subtitle: 'Track system changes',
      icon: 'receipt_long',
      colorClass: 'indigo',
    },
  ];

  logs: ActivityLog[] = [
    {
      user: 'Sarah Jenkins',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      action: 'Updated permissions',
      role: 'Manager',
      roleColor: 'purple',
      status: 'Success',
      time: '2 mins ago',
    },
    {
      user: 'Mike Ross',
      avatar: 'https://i.pravatar.cc/150?u=mike',
      action: 'Failed login attempt',
      role: 'Editor',
      roleColor: 'gray',
      status: 'Failed',
      time: '15 mins ago',
    },
    {
      user: 'David Kim',
      avatar: 'https://i.pravatar.cc/150?u=david',
      action: 'Deployed v3.4.1 hotfix',
      role: 'DevOps',
      roleColor: 'blue',
      status: 'Success',
      time: '1 hr ago',
    },
    {
      user: 'Elena Rodriguez',
      avatar: 'https://i.pravatar.cc/150?u=elena',
      action: 'Exported sales report',
      role: 'Manager',
      roleColor: 'purple',
      status: 'Success',
      time: '2 hrs ago',
    },
  ];

  // Helper for Quick Action Styles to avoid massive HTML
  getActionStyles(color: string, isIcon: boolean): string {
    const colors: any = {
      blue: {
        icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-primary group-hover:text-white',
        hover: 'hover:border-primary/50 hover:bg-primary/5',
      },
      yellow: {
        icon: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white',
        hover: 'hover:border-yellow-500/50 hover:bg-yellow-500/5',
      },
      pink: {
        icon: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500 group-hover:text-white',
        hover: 'hover:border-pink-500/50 hover:bg-pink-500/5',
      },
      indigo: {
        icon: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
        hover: 'hover:border-indigo-500/50 hover:bg-indigo-500/5',
      },
    };
    return isIcon ? colors[color].icon : colors[color].hover;
  }
}
