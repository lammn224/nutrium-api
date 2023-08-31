export class MealCompilationUpdateEvent {
  date: number;
  school: string;

  constructor(date, school) {
    this.date = date;
    this.school = school;
  }
}
