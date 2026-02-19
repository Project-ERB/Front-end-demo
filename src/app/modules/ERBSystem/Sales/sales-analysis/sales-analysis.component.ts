import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface KpiCard {
  title: string;
  value: string;
  trend: number;
  isPositive: boolean;
  sparklinePath: string;
  sparklineFillPath: string;
}

export interface CategoryBar {
  name: string;
  percentage: number;
  value: string;
  colorClass: string;
  hoverClass: string;
}

export interface Product {
  name: string;
  sku: string;
  category: string;
  totalSold: string;
  revenue: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  imageUrl: string;
  imageAlt: string;
}


@Component({
  selector: 'app-sales-analysis',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-analysis.component.html',
  styleUrl: './sales-analysis.component.scss',
})
export class SalesAnalysisComponent implements OnInit {

  selectedPeriod = 'Last 30 Days';
  periods = ['Last 30 Days', 'Last 7 Days', 'Last Quarter', 'Year to Date'];

  navItems = [
    { icon: 'grid_view', label: 'Dashboard', active: false },
    { icon: 'trending_up', label: 'Sales Analysis', active: true },
    { icon: 'category', label: 'Categories', active: false },
    { icon: 'inventory_2', label: 'Products', active: false },
    { icon: 'percent', label: 'Discounts', active: false },
  ];

  kpiCards: KpiCard[] = [
    {
      title: 'Total Sales',
      value: '$423,040',
      trend: 12,
      isPositive: true,
      sparklinePath: 'M0 20 L10 15 L20 18 L30 10 L40 14 L50 8 L60 12 L70 5 L80 10 L90 4 L100 8',
      sparklineFillPath: 'M0 20 L10 15 L20 18 L30 10 L40 14 L50 8 L60 12 L70 5 L80 10 L90 4 L100 8 V 24 H 0 Z',
    },
    {
      title: 'Orders',
      value: '1,204',
      trend: 5,
      isPositive: false,
      sparklinePath: 'M0 10 L10 8 L20 12 L30 5 L40 8 L50 15 L60 12 L70 18 L80 14 L90 20 L100 16',
      sparklineFillPath: 'M0 10 L10 8 L20 12 L30 5 L40 8 L50 15 L60 12 L70 18 L80 14 L90 20 L100 16 V 24 H 0 Z',
    },
    {
      title: 'AOV',
      value: '$351',
      trend: 2,
      isPositive: true,
      sparklinePath: 'M0 15 L15 15 L30 12 L45 10 L60 11 L75 8 L90 6 L100 5',
      sparklineFillPath: 'M0 15 L15 15 L30 12 L45 10 L60 11 L75 8 L90 6 L100 5 V 24 H 0 Z',
    },
    {
      title: 'Discounts',
      value: '$12,400',
      trend: 8,
      isPositive: false,
      sparklinePath: 'M0 5 L10 8 L20 12 L30 15 L40 12 L50 18 L60 16 L70 22 L80 18 L90 20 L100 22',
      sparklineFillPath: 'M0 5 L10 8 L20 12 L30 15 L40 12 L50 18 L60 16 L70 22 L80 18 L90 20 L100 22 V 24 H 0 Z',
    },
    {
      title: 'Net Revenue',
      value: '$410,640',
      trend: 15,
      isPositive: true,
      sparklinePath: 'M0 22 L10 18 L20 20 L30 14 L40 16 L50 10 L60 12 L70 6 L80 8 L90 4 L100 2',
      sparklineFillPath: 'M0 22 L10 18 L20 20 L30 14 L40 16 L50 10 L60 12 L70 6 L80 8 L90 4 L100 2 V 24 H 0 Z',
    },
  ];

  categories: CategoryBar[] = [
    { name: 'Electronics', percentage: 85, value: '$152k', colorClass: 'bg-[#1e3b8a]', hoverClass: 'group-hover:bg-blue-600' },
    { name: 'Fashion', percentage: 65, value: '$98k', colorClass: 'bg-blue-400', hoverClass: 'group-hover:bg-blue-500' },
    { name: 'Home', percentage: 45, value: '$64k', colorClass: 'bg-blue-400', hoverClass: 'group-hover:bg-blue-500' },
    { name: 'Beauty', percentage: 30, value: '$42k', colorClass: 'bg-blue-300', hoverClass: 'group-hover:bg-blue-400' },
    { name: 'Sports', percentage: 25, value: '$36k', colorClass: 'bg-blue-300', hoverClass: 'group-hover:bg-blue-400' },
  ];

  allProducts: Product[] = [
    { name: 'Wireless Noise-Canceling Headphones', sku: 'WH-1000XM5', category: 'Electronics', totalSold: '1,204', revenue: '$358,000', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB3X5-QIZ14gao8yOhQ0EMOeKP92UyR8zpMwF-beY9A5FWLpZ9pNfUiBlGGrXaSJFNzJRUmPA5uqyjMXhCruRNAVpkUb2xsNTdPbRuWft6wTeP9DcP7SXulL1YT7UVQXG_MRD11H2ZB6IuBDacnvfYeC99j77YYx4gTMhgigp_2yOBF1x-O2h0qwGWcAOM0gV68AR1djjeJaBs2dBB6yfK7X20ADPak_OIUOS_TTy-FUAw09Xpt1eDI4WwgqVwtWva4ZW28lZj4U4i', imageAlt: 'Wireless Headphones' },
    { name: 'Ergonomic Office Chair', sku: 'OC-PRO-2024', category: 'Furniture', totalSold: '842', revenue: '$210,500', status: 'Low Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhzMkY08xrwpLeThLaBPe0O6SNRjui9RYzC4dhOPMU3zxq3GSrywQ-cYCneqTP1RtcXDGiOdoCn5w6XXugtkqUkQ6GAaG4KEUUhkcHt9EXal9whf84wej6wSYPgdJPoe249-5cyd70FFeYxlrBgSt38FRzkhty60YZYfvwICj_2s_XYErx9S-MICz1BZiE7UsIYhrJbagQ69R4I7Tfmj3yEL7o4WA5NaTmyHndGprj3hZxwmJAc-Xj9AZ9dSn1JU-2o7NVd7fh7et', imageAlt: 'Office Chair' },
    { name: 'Smartphone Gimbal Stabilizer', sku: 'SG-3AXIS-V2', category: 'Electronics', totalSold: '650', revenue: '$58,500', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbj6toNgIa0qVrTvYElpQkaM5PB8Can1i8irVfTpWnHhJ5uLqKS6nFREhdXftp2hxwTGC0F_dJzki3s7IBXb6wIEVSyfKxu-bEjp-u3DyrSlplF0pG2zteUVsDeIeopXQL0XqDdvtTaZvibtik3Qpt0b-Vz8XvQpv647KYqJitPBXdqebCXPOJ4GReXH890vl-fc7snvTynrmOfitV2WKKfMZp3BPlVbt9IiM1kk70rCKuM5N-0b-1fFy8IxhOcc8WDeGGzuA2V8Z', imageAlt: 'Smartphone Gimbal' },
    { name: 'Mechanical Gaming Keyboard', sku: 'MK-RGB-TKL', category: 'Electronics', totalSold: '512', revenue: '$46,080', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADAiuSK7QesaIGMw9uM5ccm5RorJJJlhvgDEQfoeqDbbIrbOEfS-cH3wsVc_L_N4BlF0IC3yXm140K13ugfE8GfO01TS26OWyiCkBto_kc_FCrsMhy1ZOOrxjuhGTaoQnGM1OrlivDnYhFehZPo0cLee0QScfbnGPQqa0bgOvm08h7dB4IiDzBpTxgS2j1HWrKnLjgFy8CTNeVjJFVzqGKSzlaaq6jx4oHggGHnA4jypZ6L6ulABqvZrihz2asTJiBIFFNGeXcdu09', imageAlt: 'Gaming Keyboard' },
    { name: '4K Ultra HD Monitor 27"', sku: 'MON-4K-27', category: 'Electronics', totalSold: '480', revenue: '$192,000', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB3X5-QIZ14gao8yOhQ0EMOeKP92UyR8zpMwF-beY9A5FWLpZ9pNfUiBlGGrXaSJFNzJRUmPA5uqyjMXhCruRNAVpkUb2xsNTdPbRuWft6wTeP9DcP7SXulL1YT7UVQXG_MRD11H2ZB6IuBDacnvfYeC99j77YYx4gTMhgigp_2yOBF1x-O2h0qwGWcAOM0gV68AR1djjeJaBs2dBB6yfK7X20ADPak_OIUOS_TTy-FUAw09Xpt1eDI4WwgqVwtWva4ZW28lZj4U4i', imageAlt: '4K Monitor' },
    { name: 'Standing Desk Converter Pro', sku: 'SD-CONV-PRO', category: 'Furniture', totalSold: '395', revenue: '$59,250', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhzMkY08xrwpLeThLaBPe0O6SNRjui9RYzC4dhOPMU3zxq3GSrywQ-cYCneqTP1RtcXDGiOdoCn5w6XXugtkqUkQ6GAaG4KEUUhkcHt9EXal9whf84wej6wSYPgdJPoe249-5cyd70FFeYxlrBgSt38FRzkhty60YZYfvwICj_2s_XYErx9S-MICz1BZiE7UsIYhrJbagQ69R4I7Tfmj3yEL7o4WA5NaTmyHndGprj3hZxwmJAc-Xj9AZ9dSn1JU-2o7NVd7fh7et', imageAlt: 'Standing Desk' },
    { name: 'Leather Laptop Backpack 15L', sku: 'BAG-LTHR-15', category: 'Fashion', totalSold: '872', revenue: '$78,480', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbj6toNgIa0qVrTvYElpQkaM5PB8Can1i8irVfTpWnHhJ5uLqKS6nFREhdXftp2hxwTGC0F_dJzki3s7IBXb6wIEVSyfKxu-bEjp-u3DyrSlplF0pG2zteUVsDeIeopXQL0XqDdvtTaZvibtik3Qpt0b-Vz8XvQpv647KYqJitPBXdqebCXPOJ4GReXH890vl-fc7snvTynrmOfitV2WKKfMZp3BPlVbt9IiM1kk70rCKuM5N-0b-1fFy8IxhOcc8WDeGGzuA2V8Z', imageAlt: 'Leather Backpack' },
    { name: 'Portable Bluetooth Speaker', sku: 'SPK-BT-360', category: 'Electronics', totalSold: '1,050', revenue: '$94,500', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADAiuSK7QesaIGMw9uM5ccm5RorJJJlhvgDEQfoeqDbbIrbOEfS-cH3wsVc_L_N4BlF0IC3yXm140K13ugfE8GfO01TS26OWyiCkBto_kc_FCrsMhy1ZOOrxjuhGTaoQnGM1OrlivDnYhFehZPo0cLee0QScfbnGPQqa0bgOvm08h7dB4IiDzBpTxgS2j1HWrKnLjgFy8CTNeVjJFVzqGKSzlaaq6jx4oHggGHnA4jypZ6L6ulABqvZrihz2asTJiBIFFNGeXcdu09', imageAlt: 'Bluetooth Speaker' },
    { name: 'Yoga Mat Premium Non-Slip', sku: 'YM-PREM-6MM', category: 'Sports', totalSold: '630', revenue: '$31,500', status: 'Low Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB3X5-QIZ14gao8yOhQ0EMOeKP92UyR8zpMwF-beY9A5FWLpZ9pNfUiBlGGrXaSJFNzJRUmPA5uqyjMXhCruRNAVpkUb2xsNTdPbRuWft6wTeP9DcP7SXulL1YT7UVQXG_MRD11H2ZB6IuBDacnvfYeC99j77YYx4gTMhgigp_2yOBF1x-O2h0qwGWcAOM0gV68AR1djjeJaBs2dBB6yfK7X20ADPak_OIUOS_TTy-FUAw09Xpt1eDI4WwgqVwtWva4ZW28lZj4U4i', imageAlt: 'Yoga Mat' },
    { name: 'Vitamin C Serum 30ml', sku: 'SKN-VTC-30', category: 'Beauty', totalSold: '1,340', revenue: '$53,600', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhzMkY08xrwpLeThLaBPe0O6SNRjui9RYzC4dhOPMU3zxq3GSrywQ-cYCneqTP1RtcXDGiOdoCn5w6XXugtkqUkQ6GAaG4KEUUhkcHt9EXal9whf84wej6wSYPgdJPoe249-5cyd70FFeYxlrBgSt38FRzkhty60YZYfvwICj_2s_XYErx9S-MICz1BZiE7UsIYhrJbagQ69R4I7Tfmj3yEL7o4WA5NaTmyHndGprj3hZxwmJAc-Xj9AZ9dSn1JU-2o7NVd7fh7et', imageAlt: 'Vitamin C Serum' },
    { name: 'USB-C Docking Station 12-in-1', sku: 'DOCK-USB12', category: 'Electronics', totalSold: '320', revenue: '$44,800', status: 'Out of Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbj6toNgIa0qVrTvYElpQkaM5PB8Can1i8irVfTpWnHhJ5uLqKS6nFREhdXftp2hxwTGC0F_dJzki3s7IBXb6wIEVSyfKxu-bEjp-u3DyrSlplF0pG2zteUVsDeIeopXQL0XqDdvtTaZvibtik3Qpt0b-Vz8XvQpv647KYqJitPBXdqebCXPOJ4GReXH890vl-fc7snvTynrmOfitV2WKKfMZp3BPlVbt9IiM1kk70rCKuM5N-0b-1fFy8IxhOcc8WDeGGzuA2V8Z', imageAlt: 'USB-C Dock' },
    { name: 'Resistance Bands Set (5 levels)', sku: 'RB-SET-5LVL', category: 'Sports', totalSold: '910', revenue: '$18,200', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADAiuSK7QesaIGMw9uM5ccm5RorJJJlhvgDEQfoeqDbbIrbOEfS-cH3wsVc_L_N4BlF0IC3yXm140K13ugfE8GfO01TS26OWyiCkBto_kc_FCrsMhy1ZOOrxjuhGTaoQnGM1OrlivDnYhFehZPo0cLee0QScfbnGPQqa0bgOvm08h7dB4IiDzBpTxgS2j1HWrKnLjgFy8CTNeVjJFVzqGKSzlaaq6jx4oHggGHnA4jypZ6L6ulABqvZrihz2asTJiBIFFNGeXcdu09', imageAlt: 'Resistance Bands' },
    { name: 'Anti-Aging Retinol Cream 50ml', sku: 'SKN-RET-50', category: 'Beauty', totalSold: '760', revenue: '$45,600', status: 'Low Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB3X5-QIZ14gao8yOhQ0EMOeKP92UyR8zpMwF-beY9A5FWLpZ9pNfUiBlGGrXaSJFNzJRUmPA5uqyjMXhCruRNAVpkUb2xsNTdPbRuWft6wTeP9DcP7SXulL1YT7UVQXG_MRD11H2ZB6IuBDacnvfYeC99j77YYx4gTMhgigp_2yOBF1x-O2h0qwGWcAOM0gV68AR1djjeJaBs2dBB6yfK7X20ADPak_OIUOS_TTy-FUAw09Xpt1eDI4WwgqVwtWva4ZW28lZj4U4i', imageAlt: 'Retinol Cream' },
    { name: 'Linen Throw Blanket 50x60"', sku: 'HM-LIN-THRW', category: 'Home', totalSold: '540', revenue: '$27,000', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxhzMkY08xrwpLeThLaBPe0O6SNRjui9RYzC4dhOPMU3zxq3GSrywQ-cYCneqTP1RtcXDGiOdoCn5w6XXugtkqUkQ6GAaG4KEUUhkcHt9EXal9whf84wej6wSYPgdJPoe249-5cyd70FFeYxlrBgSt38FRzkhty60YZYfvwICj_2s_XYErx9S-MICz1BZiE7UsIYhrJbagQ69R4I7Tfmj3yEL7o4WA5NaTmyHndGprj3hZxwmJAc-Xj9AZ9dSn1JU-2o7NVd7fh7et', imageAlt: 'Linen Blanket' },
    { name: 'Stainless Steel Water Bottle 32oz', sku: 'BTL-SS-32OZ', category: 'Sports', totalSold: '2,100', revenue: '$63,000', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbj6toNgIa0qVrTvYElpQkaM5PB8Can1i8irVfTpWnHhJ5uLqKS6nFREhdXftp2hxwTGC0F_dJzki3s7IBXb6wIEVSyfKxu-bEjp-u3DyrSlplF0pG2zteUVsDeIeopXQL0XqDdvtTaZvibtik3Qpt0b-Vz8XvQpv647KYqJitPBXdqebCXPOJ4GReXH890vl-fc7snvTynrmOfitV2WKKfMZp3BPlVbt9IiM1kk70rCKuM5N-0b-1fFy8IxhOcc8WDeGGzuA2V8Z', imageAlt: 'Water Bottle' },
    { name: 'Wireless Charging Pad 15W', sku: 'CHG-WL-15W', category: 'Electronics', totalSold: '880', revenue: '$35,200', status: 'In Stock', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADAiuSK7QesaIGMw9uM5ccm5RorJJJlhvgDEQfoeqDbbIrbOEfS-cH3wsVc_L_N4BlF0IC3yXm140K13ugfE8GfO01TS26OWyiCkBto_kc_FCrsMhy1ZOOrxjuhGTaoQnGM1OrlivDnYhFehZPo0cLee0QScfbnGPQqa0bgOvm08h7dB4IiDzBpTxgS2j1HWrKnLjgFy8CTNeVjJFVzqGKSzlaaq6jx4oHggGHnA4jypZ6L6ulABqvZrihz2asTJiBIFFNGeXcdu09', imageAlt: 'Charging Pad' },
  ];

  // Filter state
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';

  get availableCategories(): string[] {
    return [...new Set(this.allProducts.map(p => p.category))].sort();
  }

  get availableStatuses(): string[] {
    return ['In Stock', 'Low Stock', 'Out of Stock'];
  }

  get activeFilterCount(): number {
    return [this.searchQuery, this.selectedCategory, this.selectedStatus].filter(Boolean).length;
  }

  get filteredProducts(): Product[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.allProducts.filter(p => {
      const matchesSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q)
        || p.category.toLowerCase().includes(q);
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || p.status === this.selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.currentPage = 1;
  }

  // Pagination state
  currentPage = 1;
  pageSize = 5;

  get totalProducts(): number {
    return this.filteredProducts.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get showingFrom(): number {
    return this.totalProducts === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalProducts);
  }

  get pageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  ngOnInit(): void { }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock': return 'bg-green-50 text-green-700';
      case 'Low Stock': return 'bg-yellow-50 text-yellow-700';
      case 'Out of Stock': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }

  goToPage(page: number | '...'): void {
    if (page === '...' || page === this.currentPage) return;
    this.currentPage = page as number;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  exportReport(): void {
    alert('Exporting report...');
  }
}
