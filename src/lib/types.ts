export interface Exercise {
  name: string;
  reps: string;
  sets: string;
  videoUrl: string;
}

export interface WarmUp {
  name: string;
  reps: string;
}

export interface Workout {
  warmUp: WarmUp[];
  exercises: Exercise[];
}

export interface WorkoutData {
  [key: string]: Workout;
}

export interface AppData {
  disclaimerText: string;
  additionalInstructionsText: string[];
  workouts: WorkoutData;
}
