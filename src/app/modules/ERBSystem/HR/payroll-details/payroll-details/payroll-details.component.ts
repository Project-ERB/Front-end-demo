import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PayrollService } from '../../../../../core/services/payroll/payroll.service';
import { CommonModule, DatePipe } from '@angular/common';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';

export interface EarningItem {
  label: string;
  description: string;
  amount: number;
}
export interface DeductionItem {
  label: string;
  description: string;
  amount: number;
}
export interface Employee {
  name: string;
  title: string;
  id: string;
  department: string;
  location: string;
  photoUrl: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  email: string
}
export interface BankDetails {
  bankName: string;
  accountEnding: string;
  paymentStatus: 'COMPLETED' | 'PENDING' | 'FAILED';
}

@Component({
  selector: 'app-payroll-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './payroll-details.component.html',
  styleUrl: './payroll-details.component.scss',
})
export class PayrollDetailsComponent implements OnInit {  // ✅ implements OnInit

  private readonly _route = inject(ActivatedRoute);       // ✅ injections فوق
  private readonly _payrollService = inject(PayrollService);
  private readonly _employeeService = inject(EmployeeService);


  employee: Employee = {
    name: 'Johnathan Doe',
    title: 'Senior Software Engineer',
    id: 'EMP-10294',
    department: 'Engineering Dept.',
    location: 'New York Office',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBv6Mv2JpiHE-IxlD6KUzIIRyBMdpLAVnu2ELXy99zxtL5wCK0fxXNLE5pBtChfMqRfnhefV-rkYt5p6-suCknjt_kd9iVcR7TOPpjLZQvpcb_rQc8ZTcW_V_0l_pgMCFwLH_N6Rwe_uxcpA5a3lHcqKoWLZI8VLGOAwfr88llD--qdoy0dkJx2MFndsNlyJY7BkylAy3R8KGvB9ICeyZuaVBkcRBFh83zHEf2XtGVPLHsNqVPv0ByVXVRJF3PkOYZE22zeX9s-05vG',
    payPeriodStart: 'Oct 01',
    payPeriodEnd: 'Oct 31',
    payDate: 'Nov 01, 2023',
    email: '',
  };

  earnings: EarningItem[] = [
    { label: 'Basic Salary', description: 'Monthly fixed rate', amount: 0 },
    { label: 'Performance Bonus', description: 'Q3 Performance achievement', amount: 0 },
    { label: 'Housing Allowance', description: 'Standard benefits package', amount: 500 },
    { label: 'Travel Reimbursement', description: 'Commuting expense coverage', amount: 150 },
  ];

  deductions: DeductionItem[] = [
    { label: 'Federal Income Tax', description: '18% standard bracket', amount: 1863 },
    { label: 'Health Insurance', description: 'Family coverage plan', amount: 240 },
    { label: '401(k) Contribution', description: 'Employee matching (5%)', amount: 425 },
  ];

  bankDetails: BankDetails = {
    bankName: 'Global Horizon Bank',
    accountEnding: '**** **** 4291',
    paymentStatus: 'COMPLETED',
  };

  get grossEarnings(): number {
    return this.earnings.reduce((sum, item) => sum + item.amount, 0);
  }
  get totalDeductions(): number {
    return this.deductions.reduce((sum, item) => sum + item.amount, 0);
  }
  get netPay(): number {
    return this.grossEarnings - this.totalDeductions;
  }

  formatCurrency(amount: number, isDeduction = false): string {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
    return isDeduction ? `-${formatted}` : formatted;
  }

  onDownloadPDF(): void {
    console.log('Downloading PDF...');
  }

  onPrintPayslip(): void {
    window.print();
  }

  private readonly _router = inject(Router);

  ngOnInit(): void {
    // ✅ جيب الـ employee من history.state
    const empState = history.state?.employee;
    if (empState) {
      this.employee.name = empState.name;
      this.employee.email = empState.email ?? '';
      this.employee.title = empState.employeeLevel;
      this.employee.department = empState.departmentId ?? '';
    }

    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._payrollService.getPayrollById(id).subscribe({
        next: (res) => {
          const payroll = res.data.payroll;
          this.earnings[0].amount = payroll.basicSalary;
          this.earnings[1].amount = payroll.bonus;
          this.employee.payPeriodStart = payroll.periodStart;
          this.employee.payPeriodEnd = payroll.periodEnd;
          this.employee.payDate = payroll.paymentDate;
        },
        error: (err) => console.error(err),
      });
    }
  }
}