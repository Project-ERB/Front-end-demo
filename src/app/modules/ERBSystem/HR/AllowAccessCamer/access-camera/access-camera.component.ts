import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AttendanceService } from '../../../../../core/services/Attendance/attendance.service';


@Component({
  selector: 'app-access-camera',
  imports: [CommonModule],
  templateUrl: './access-camera.component.html',
  styleUrl: './access-camera.component.scss',
})
export class AccessCameraComponent implements OnInit, OnDestroy {

  private _router = inject(Router);
  private _attendance = inject(AttendanceService);
  private _zone = inject(NgZone);

  scanning = false;
  processing = false;
  success = false;
  errorMsg = '';
  scannedId = '';

  private stream: MediaStream | null = null;
  private animFrame: number | null = null;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private video!: HTMLVideoElement;

  ngOnInit(): void { this.startCamera(); }
  ngOnDestroy(): void { this.stopCamera(); }

  // ── Camera ────────────────────────────────────────────────────────────────
  async startCamera(): Promise<void> {
    this.errorMsg = '';
    this.success = false;
    this.scannedId = '';
    this.processing = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // ننتظر الـ DOM يكون جاهز
      setTimeout(() => {
        this.video = document.getElementById('qr-video') as HTMLVideoElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;

        this.video.srcObject = this.stream;
        this.video.play().then(() => {
          this.scanning = true;
          this.scanLoop();
        });
      }, 100);

    } catch {
      this.errorMsg = 'Camera access denied. Please allow camera permission and try again.';
    }
  }

  private stopCamera(): void {
    this.scanning = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  // ── Scan loop ─────────────────────────────────────────────────────────────
  private scanLoop(): void {
    if (!this.scanning || this.processing) return;

    if (this.video?.readyState === this.video?.HAVE_ENOUGH_DATA) {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.ctx.drawImage(this.video, 0, 0);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const jsQR = (window as any).jsQR;

      if (jsQR) {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          // ندخل Angular zone عشان الـ change detection يشتغل
          this._zone.run(() => this.onQrDetected(code.data));
          return;
        }
      }
    }

    this.animFrame = requestAnimationFrame(() => this.scanLoop());
  }

  // ── QR detected ───────────────────────────────────────────────────────────
  private onQrDetected(raw: string): void {
    console.log('RAW QR DATA:', raw);
    this.scanning = false;
    this.processing = true;
    this.stopCamera();

    let nationalId = raw;
    try {
      const url = new URL(raw);
      nationalId = url.searchParams.get('nationalId') ?? raw;
    } catch { /* raw مش URL */ }

    this.scannedId = nationalId;

    this._attendance.scan(nationalId).subscribe({
      next: () => {
        this.processing = false;
        this.success = true;
        setTimeout(() => this._router.navigate(['/attendance-dashboard']), 2000);
      },
      error: (err) => {
        this.processing = false;
        this.errorMsg = err?.error?.message ?? 'Scan failed. Please try again.';
      },
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  retry(): void { this.startCamera(); }
  goBack(): void { this.stopCamera(); this._router.navigate(['/attendance']); }

}
