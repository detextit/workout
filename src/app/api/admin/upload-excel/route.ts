import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/db/config';
import { users, workoutTypes, exercises, workoutPlans, workoutExercises, instructions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('excel-file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    
    const result = {
      user: null as any,
      workouts: [] as any[],
      instructions: [] as any[],
    };

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      console.log(`Processing sheet: ${sheetName}`);
      
      if (sheetName === 'Disclaimer') {
        // Process disclaimer
        const disclaimerContent = jsonData
          .filter(row => row.length > 0 && row.some(cell => cell))
          .map(row => row.join(' '))
          .join('\n');
        
        if (disclaimerContent) {
          const [disclaimerInstruction] = await db
            .insert(instructions)
            .values({
              type: 'disclaimer',
              title: 'INSTRUCTIONS & DISCLAIMER',
              content: disclaimerContent,
            })
            .onConflictDoUpdate({
              target: instructions.type,
              set: { content: disclaimerContent }
            })
            .returning();
          
          result.instructions.push(disclaimerInstruction);
        }
      } else if (sheetName === 'Additional instructions') {
        // Process additional instructions
        const additionalContent = jsonData
          .filter(row => row.length > 0 && row.some(cell => cell))
          .map(row => row.join(' '))
          .join('\n');
        
        if (additionalContent) {
          const [additionalInstruction] = await db
            .insert(instructions)
            .values({
              type: 'additional',
              title: 'Additional Instructions',
              content: additionalContent,
            })
            .onConflictDoUpdate({
              target: instructions.type,
              set: { content: additionalContent }
            })
            .returning();
          
          result.instructions.push(additionalInstruction);
        }
      } else if (['Legs & Shoulder', 'Chest & Triceps', 'Back & Biceps'].includes(sheetName)) {
        // Process workout sheets
        await processWorkoutSheet(jsonData, sheetName, result);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Excel file processed successfully',
      data: result,
    });

  } catch (error: any) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to process Excel file', details: error.message },
      { status: 500 }
    );
  }
}

async function processWorkoutSheet(jsonData: any[][], workoutTypeName: string, result: any) {
  // Extract user information from the first few rows
  let userName = '';
  let userAge: number | null = null;
  let userWeight: string | null = null;
  let userHeight: string | null = null;
  
  for (let i = 0; i < Math.min(5, jsonData.length); i++) {
    const row = jsonData[i];
    if (row[0] && typeof row[0] === 'string') {
      if (row[0].includes('Name')) {
        userName = row[0].replace(/Name\s*[-–]\s*/, '').trim();
      } else if (row[0].includes('Age')) {
        const ageMatch = row[0].match(/\d+/);
        if (ageMatch) userAge = parseInt(ageMatch[0]);
      } else if (row[0].includes('Weight')) {
        const weightStr = row[0].replace(/Weight\s*[-–]?\s*/, '').trim();
        userWeight = weightStr || null;
      } else if (row[0].includes('Height')) {
        const heightStr = row[0].replace(/Height\s*[-–]?\s*/, '').trim();
        userHeight = heightStr || null;
      }
    }
  }

  // Create or find user
  let user;
  if (userName) {
    const existingUsers = await db.select().from(users).where(eq(users.name, userName));
    
    if (existingUsers.length > 0) {
      user = existingUsers[0];
      // Update user info if needed
      await db.update(users)
        .set({
          age: userAge || null,
          weight: userWeight,
          height: userHeight,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } else {
      [user] = await db.insert(users).values({
        name: userName,
        age: userAge || null,
        weight: userWeight,
        height: userHeight,
      }).returning();
    }
    
    result.user = user;
  }

  // Find or create workout type
  const existingWorkoutTypes = await db.select().from(workoutTypes).where(eq(workoutTypes.name, workoutTypeName));
  let workoutType;
  
  if (existingWorkoutTypes.length > 0) {
    workoutType = existingWorkoutTypes[0];
  } else {
    [workoutType] = await db.insert(workoutTypes).values({
      name: workoutTypeName,
      description: `${workoutTypeName} focused workout`,
    }).returning();
  }

  // Create workout plan
  const [workoutPlan] = await db.insert(workoutPlans).values({
    userId: user?.id,
    workoutTypeId: workoutType.id,
  }).returning();

  // Find the header row (contains "Exercise name", "Number of repetitions", etc.)
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => cell && cell.toString().toLowerCase().includes('exercise name'))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) return; // No exercise data found

  // Process exercises
  let orderIndex = 0;
  let isWarmupSection = false;
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length === 0) continue;
    
    const exerciseName = row[0]?.toString().trim();
    if (!exerciseName) continue;
    
    // Check if this is a warmup section marker
    if (exerciseName.toLowerCase().includes('warm up') || exerciseName.toLowerCase().includes('warmup')) {
      isWarmupSection = true;
      continue;
    }
    
    // Check if this is the end of warmup section (when we see main exercises)
    if (isWarmupSection && row[2] && !isNaN(parseInt(row[2].toString()))) {
      isWarmupSection = false;
    }
    
    const reps = row[1]?.toString().trim() || '';
    const sets = row[2] ? parseInt(row[2].toString()) : 1;
    const videoUrl = row[4]?.toString().trim() || '';
    
    // Create or find exercise
    const existingExercises = await db.select().from(exercises).where(
      and(
        eq(exercises.name, exerciseName),
        eq(exercises.isWarmup, isWarmupSection)
      )
    );
    
    let exercise;
    if (existingExercises.length > 0) {
      exercise = existingExercises[0];
      // Update video URL if provided
      if (videoUrl) {
        await db.update(exercises)
          .set({ videoUrl })
          .where(eq(exercises.id, exercise.id));
      }
    } else {
      [exercise] = await db.insert(exercises).values({
        name: exerciseName,
        videoUrl: videoUrl || null,
        isWarmup: isWarmupSection,
      }).returning();
    }
    
    // Create workout exercise
    await db.insert(workoutExercises).values({
      workoutPlanId: workoutPlan.id,
      exerciseId: exercise.id,
      reps,
      sets: isWarmupSection ? 1 : (sets || 1),
      orderIndex: orderIndex++,
    });
  }
  
  result.workouts.push({
    workoutType: workoutType.name,
    workoutPlanId: workoutPlan.id,
    exerciseCount: orderIndex,
  });
}