-- PostgreSQL Database Schema for Workout App

-- Users table for client information
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  weight DECIMAL(5,2), -- in kg or lbs
  height VARCHAR(50), -- flexible format (e.g., "5'8\"", "175cm")
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout types/categories
CREATE TABLE workout_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "Legs & Shoulder", "Chest & Triceps"
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual exercises
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT, -- YouTube or other video reference
  is_warmup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout plans - links users to workout types
CREATE TABLE workout_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workout_type_id INTEGER REFERENCES workout_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout exercises - specific exercise details for a workout plan
CREATE TABLE workout_exercises (
  id SERIAL PRIMARY KEY,
  workout_plan_id INTEGER REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  reps VARCHAR(50), -- flexible format (e.g., "10", "5 each side", "30 secs")
  sets INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0, -- for ordering exercises
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructions and disclaimers
CREATE TABLE instructions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'disclaimer', 'additional', 'general'
  title VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition data (optional)
CREATE TABLE nutrition_foods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  calories_per_100g DECIMAL(8,2),
  fat_per_100g DECIMAL(8,2),
  carbs_per_100g DECIMAL(8,2),
  protein_per_100g DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_workout_exercises_workout_plan_id ON workout_exercises(workout_plan_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX idx_instructions_type ON instructions(type);

-- Insert some initial workout types
INSERT INTO workout_types (name, description) VALUES
('Legs & Shoulder', 'Lower body and shoulder focused workout'),
('Chest & Triceps', 'Upper body chest and triceps focused workout'),
('Back & Biceps', 'Back and biceps focused workout');

-- Insert disclaimer instruction
INSERT INTO instructions (type, title, content) VALUES
('disclaimer', 'INSTRUCTIONS & DISCLAIMER', 
'Important Instructions

1. Your training chart has been personalized according to your training experience and goal.
2. This is a "Beginner''s" Workout chart, which includes whole-body strength training. You need to follow this for atleast 4 weeks. We may increase the intensity or add more exercises over the weeks.
3. You must do proper warm-up before starting any kind of workout. Please follow all the warm-up exercises in order to prevent injuries.
4. It''s important you chose a right weight for your workout. Start with light weights for any exercise, do one set and adjust accordingly. If it felt too easy, increase the weight a little, else keep working with it. No ego lifting. Focus more on correct form. The repetitions mentioned in the plan are only guidelines. You can increase or decrease them if there is limitation to availability of weights.
5. For first two sets make sure your are not going until failure. For example: If 8 reps is maximum you can do, do only 6 or If 15 reps is maximum you can do do only 12-13. Keep 2 or 3 reps in reserve.
6. You can keep sipping water during the workout. Do not stay dehydrated.
7. Videos for workouts are shared. In case you need a video or clarification for any of the exercise, do let me know. You can also share your video for form check.
8. If you had any question and concern regarding this workout plan, feel free to reach out to me.');

INSERT INTO instructions (type, title, content) VALUES
('additional', 'Additional Instructions', 
'Drink 4-5 litres water daily, without fail - NO COMPROMISE ON THIS

Take isabgol 10 gm daily with water or however you like (For digestion and to avoid constipation)');