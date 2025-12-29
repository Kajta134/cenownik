import { ValidatorConstraint } from 'class-validator';

@ValidatorConstraint({ name: 'FrequencyValidator', async: false })
export class FrequencyValidator {
  validate(frequency: number) {
    const frequencyNumber = Number(frequency);
    return (
      Number.isInteger(frequencyNumber) &&
      frequencyNumber >= 10 &&
      frequencyNumber <= 60 * 24 * 7 // max one week
    );
  }
  defaultMessage(): string {
    return 'Frequency must be a positive integer between 10 and 10080 (one week in minutes).';
  }
}
