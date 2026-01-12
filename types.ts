
export interface PatientData {
  name: string;
  age: string;
  weight: string;
  height: string;
  goal: string;
  diagnosis: string;
}

export interface Meal {
  id: string;
  time: string;
  name: string;
  description: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
}

export interface Choice {
  good: string;
  bad: string;
}

export interface ClinicalPlan {
  patient: PatientData;
  date: string;
  meals: Meal[];
  alerts: string[];
  recipes: Recipe[];
  choices: Choice[];
}
