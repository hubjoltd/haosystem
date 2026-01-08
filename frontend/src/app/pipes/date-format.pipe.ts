import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: string = 'MM-DD-YYYY'): string {
    if (!value) return '-';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '-';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}-${day}-${year}`;
    }
  }
}
