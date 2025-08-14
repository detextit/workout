import { NextResponse } from 'next/server';
import { AppData, WorkoutData, Exercise, WarmUp } from '@/lib/types';
import { db } from '@/db/config';
import { workoutTypes, workoutPlans, workoutExercises, exercises, instructions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// This function handles GET requests to /api/workouts
export async function GET() {
    try {
        // Get disclaimer and additional instructions with retry logic
        let disclaimerInstruction: any[] = [];
        let additionalInstruction: any[] = [];
        
        try {
            disclaimerInstruction = await db
                .select()
                .from(instructions)
                .where(eq(instructions.type, 'disclaimer'))
                .limit(1);
        } catch (error) {
            console.error('Error fetching disclaimer:', error);
            disclaimerInstruction = [];
        }
        
        try {
            additionalInstruction = await db
                .select()
                .from(instructions)
                .where(eq(instructions.type, 'additional'))
                .limit(1);
        } catch (error) {
            console.error('Error fetching additional instructions:', error);
            additionalInstruction = [];
        }

        const disclaimerText = disclaimerInstruction[0]?.content || "Please consult with a healthcare professional before starting any exercise program.";
        const additionalInstructionsText = additionalInstruction[0]?.content
            ? additionalInstruction[0].content.split('\n').filter((line: string) => line.trim())
            : ["Stay hydrated during workouts", "Listen to your body and rest when needed"];

        // Get all workout types and their exercises
        let workoutTypesData: any[] = [];
        try {
            workoutTypesData = await db.select().from(workoutTypes);
        } catch (error) {
            console.error('Error fetching workout types:', error);
            workoutTypesData = [];
        }
        
        const workouts: WorkoutData = {};

        for (const workoutType of workoutTypesData) {
            // Get the most recent workout plan for this workout type
            // For now, we'll get the first workout plan of this type
            const workoutPlan = await db
                .select()
                .from(workoutPlans)
                .where(eq(workoutPlans.workoutTypeId, workoutType.id))
                .orderBy(workoutPlans.createdAt)
                .limit(1);

            if (workoutPlan.length === 0) {
                // If no workout plan exists, create empty workout
                workouts[workoutType.name] = {
                    warmUp: [],
                    exercises: []
                };
                continue;
            }

            // Get all exercises for this workout plan
            const workoutExercisesData = await db
                .select({
                    exerciseId: workoutExercises.exerciseId,
                    exerciseName: exercises.name,
                    reps: workoutExercises.reps,
                    sets: workoutExercises.sets,
                    videoUrl: exercises.videoUrl,
                    isWarmup: exercises.isWarmup,
                    orderIndex: workoutExercises.orderIndex,
                })
                .from(workoutExercises)
                .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
                .where(eq(workoutExercises.workoutPlanId, workoutPlan[0].id))
                .orderBy(workoutExercises.orderIndex);

            // Separate warmup and main exercises
            const warmUp: WarmUp[] = [];
            const mainExercises: Exercise[] = [];

            for (const exercise of workoutExercisesData) {
                if (exercise.isWarmup) {
                    warmUp.push({
                        name: exercise.exerciseName,
                        reps: exercise.reps || '',
                    });
                } else {
                    mainExercises.push({
                        name: exercise.exerciseName,
                        reps: exercise.reps || 'N/A',
                        sets: exercise.sets?.toString() || 'N/A',
                        videoUrl: exercise.videoUrl || '',
                    });
                }
            }

            workouts[workoutType.name] = {
                warmUp,
                exercises: mainExercises,
            };
        }

        const responseData: AppData = {
            disclaimerText,
            additionalInstructionsText,
            workouts,
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('API Error:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(
            JSON.stringify({ message: 'Failed to fetch workout data from database.', details: message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
