import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadingZero'
})
export class LeadingZeroPipe implements PipeTransform {

  transform(value: number, digits: number = 3): string {
    if (value == null) return '';
    return value.toString().padStart(digits, '0');
  }

}
