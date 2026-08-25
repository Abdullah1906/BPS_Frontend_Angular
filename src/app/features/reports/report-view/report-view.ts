import { Component,computed,  ElementRef,ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule,FormsModule } from '@angular/forms';
import { ReportService } from '../services/report';
import { Report } from '../models/report.model';
import { PlaceService } from '../../places/services/place';
import { Place } from '../../places/models/place.model';
import { DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe,FormsModule],
  templateUrl: './report-view.html',
  styleUrl: './report-view.scss'
})
export class ReportView {

  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly placeService = inject(PlaceService);


   @ViewChild('banglaReport')
  banglaReport!: ElementRef<HTMLElement>;

  currentDate = new Date();

  loading = false;
  errorMessage = '';
  searched = false;

  reports = signal<Report[]>([]);
  places = signal<Place[]>([]);

// Pagination signals
  currentPage = signal(1);
  itemsPerPage = signal(10);
 


    // 🔽 SCREEN: Date DESC (newest first)
  screenReports = computed(() => {
    return [...this.reports()].sort((a, b) => {
      return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
    });
  });

  // 🔼 BANGLA: Date ASC (oldest first)
  banglaReports = computed(() => {
    return [...this.reports()].sort((a, b) => {
      return new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime();
    });
  });
  
 totalPages = computed(() => Math.ceil(this.screenReports().length / this.itemsPerPage()));
  // Paginated reports for table display
  paginatedReports = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.screenReports().slice(start, end);
  });

  filterForm = this.fb.nonNullable.group({
    fromDate: [''],
    toDate: [''],
    placeId: [0],
    period: ['']
  });

  constructor() {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.placeService.getAll().subscribe({
      next: (data) => this.places.set(data),
      error: (error) => console.error('Load places error:', error)
    });
  }

  search(): void {
    this.loading = true;
    this.errorMessage = '';
    this.searched = true;
    this.currentPage.set(1);
    const formValue = this.filterForm.getRawValue();

    this.reportService.get({
      fromDate: formValue.fromDate || undefined,
      toDate: formValue.toDate || undefined,
      placeId: formValue.placeId || undefined,
      period: formValue.period || undefined
    }).subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Load report error:', error);
        this.errorMessage = 'Unable to load report.';
        this.loading = false;
      }
    });
  }

  clear(): void {
    this.filterForm.reset({
      fromDate: '',
      toDate: '',
      placeId: 0,
      period: ''
    });

    this.reports.set([]);
    this.searched = false;
    this.errorMessage = '';
    this.currentPage.set(1);
  }

  // Pagination controls
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  // ========== BUG FIX ==========
  get totalAmount(): number {
    return this.reports().reduce((sum, r) => sum + r.total, 0);
  }

  get totalTip(): number {
    return this.reports().reduce((sum, r) => sum + r.tipAmount, 0);
  }

  get Math() {
    return Math;
  }

  getSelectedPlaceName(): string {

    const placeId =
      this.filterForm.getRawValue().placeId;

    if (!placeId || placeId === 0) {
      return 'সকল স্থান';
    }

    const place = this.places()
      .find(p => p.id === placeId);

    return place?.placeName ?? '';
  }
  print(): void {
    window.print();
  }

  groupedByPlace(): { 
    placeName: string; 
    trips: Report[]; 
    count: number; 
    pricePerTrip: number; 
    tripTotal: number;
    tipTotal: number; 
    tipQuantity: number;
    placeTotal: number 
  }[] {

    const groups = new Map<number, Report[]>();

    for (const r of this.reports()) {
      if (!groups.has(r.placeId)) {
        groups.set(r.placeId, []);
      }
      groups.get(r.placeId)!.push(r);
    }

    const result: { 
      placeName: string; 
      trips: Report[]; 
      count: number; 
      pricePerTrip: number; 
      tripTotal: number;
      tipTotal: number; 
      tipQuantity: number;
      placeTotal: number 
    }[] = [];

    groups.forEach((trips) => {
      const count = trips.length;
      const pricePerTrip = trips[0].price;
      const tripTotal = count * pricePerTrip;
      const tipTotal = trips.reduce((sum, t) =>sum + (t.tipStatus ? t.price * t.tipAmount : 0),0 );
      const tipQuantity = trips.reduce((sum, t) =>sum + (t.tipStatus ? t.tipAmount : 0),0 );
      const placeTotal = tripTotal + tipTotal;

      result.push({
        placeName: trips[0].placeName,
        trips,
        count,
        pricePerTrip,
        tripTotal,
        tipTotal,
        tipQuantity,
        placeTotal
      });
    });

    return result;
  }

  async downloadPdf(): Promise<void> {

    if (!this.banglaReport) {
      return;
    }

    try {

      this.errorMessage = '';

      const element =
        this.banglaReport.nativeElement;


      // Temporarily show Bangla report
      element.style.display = 'block';

      element.style.position = 'absolute';
      element.style.left = '-99999px';
      element.style.top = '0';


      // Wait for Bengali font
      await document.fonts.ready;


      const canvas = await html2canvas(element, {

        scale: 2,

        useCORS: true,

        backgroundColor: '#ffffff',

        logging: false,

        windowWidth: element.scrollWidth

      });


      // Restore screen state
      element.style.display = 'none';

      element.style.position = '';
      element.style.left = '';
      element.style.top = '';


      const imageData =
        canvas.toDataURL('image/png');


      const pdf = new jsPDF({

        orientation: 'portrait',

        unit: 'mm',

        format: 'a4'

      });


      const pageWidth = 210;

      const pageHeight = 297;

      const margin = 10;

      const pdfWidth =
        pageWidth - (margin * 2);

      const pdfHeight =
        (canvas.height * pdfWidth) /
        canvas.width;

      const usableHeight =
        pageHeight - (margin * 2);


      let heightLeft = pdfHeight;

      let position = margin;


      pdf.addImage(

        imageData,

        'PNG',

        margin,

        position,

        pdfWidth,

        pdfHeight

      );


      heightLeft -= usableHeight;


      while (heightLeft > 0) {

        position =
          margin -
          (pdfHeight - heightLeft);

        pdf.addPage();

        pdf.addImage(

          imageData,

          'PNG',

          margin,

          position,

          pdfWidth,

          pdfHeight

        );

        heightLeft -= usableHeight;

      }


      pdf.save(
        `trip-report-${Date.now()}.pdf`
      );

    }
    catch (error) {

      console.error(
        'PDF generation error:',
        error
      );

      // Restore state if error occurs
      const element =
        this.banglaReport?.nativeElement;

      if (element) {

        element.style.display = 'none';

        element.style.position = '';

        element.style.left = '';

        element.style.top = '';
      }

      this.errorMessage =
        'PDF তৈরি করা সম্ভব হয়নি.';
    }

  }
}