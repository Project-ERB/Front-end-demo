import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  isExpanded: boolean;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  action: () => void;
}

@Component({
  selector: 'app-help-support',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './help-support.component.html',
  styleUrl: './help-support.component.scss',
})
export class HelpSupportComponent {
  searchQuery = signal('');

  faqs = signal<FAQ[]>([
    {
      id: 1,
      question: 'How do I track my order?',
      answer: "You can track your order status by visiting the 'Orders' section in your profile. Once your order has shipped, you will receive an email with a tracking number and a link to the carrier's website.",
      isExpanded: true
    },
    {
      id: 2,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through encrypted channels.',
      isExpanded: false
    },
    {
      id: 3,
      question: 'How do I process a return?',
      answer: 'To process a return, go to your Order History, select the item you want to return, and click "Return Item". You will receive a return label via email. Items must be returned within 30 days of purchase in their original condition.',
      isExpanded: false
    },
    {
      id: 4,
      question: 'How can I change my password?',
      answer: 'You can change your password by going to your Profile settings, then clicking on "Security". Enter your current password and your new password twice to confirm the change.',
      isExpanded: false
    },
    {
      id: 5,
      question: 'Where can I find product specifications?',
      answer: 'Product specifications are available on each product detail page. Scroll down to the "Specifications" tab to view detailed information about dimensions, materials, and technical specifications.',
      isExpanded: false
    }
  ]);

  contactOptions: ContactOption[] = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant answers. Available 24/7.',
      icon: 'chat',
      buttonText: 'Start Chat',
      action: () => this.startLiveChat()
    },
    {
      id: 'email',
      title: 'Email Us',
      description: "We'll get back to you within 24 hours.",
      icon: 'mail',
      buttonText: 'Send Email',
      action: () => this.sendEmail()
    },
    {
      id: 'call',
      title: 'Call Us',
      description: 'Mon-Fri, 9am-5pm EST.',
      icon: 'call',
      buttonText: 'View Number',
      action: () => this.viewPhoneNumber()
    }
  ];

  toggleFAQ(id: number) {
    this.faqs.update(items =>
      items.map(item =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  }

  onSearch() {
    // TODO: Implement search functionality
    console.log('Searching for:', this.searchQuery());
  }

  startLiveChat() {
    // TODO: Implement live chat functionality
    console.log('Starting live chat...');
  }

  sendEmail() {
    // TODO: Implement email functionality
    window.location.href = 'mailto:support@ecommerce-erp.com';
  }

  viewPhoneNumber() {
    // TODO: Show phone number modal or copy to clipboard
    console.log('Phone number: +1 (555) 123-4567');
  }
}

