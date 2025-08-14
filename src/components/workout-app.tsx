'use client';

import React, { useState, useMemo, useEffect, FC } from 'react';
import { AppData, Workout, WorkoutData } from '@/lib/types';

// --- ShadCN Component Mocks (as before) ---
// In a real project, you'd import these from your actual component library.
const Button: FC<{ children: React.ReactNode; onClick: () => void; className?: string; variant?: string }> = ({ children, onClick, className, variant }) => (
  <button onClick={onClick} className={`${className} px-4 py-2 rounded-lg font-semibold transition-colors ${variant === 'destructive' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
    {children}
  </button>
);
const Card: FC<{ children: React.ReactNode; className?: string; onClick?: () => void; }> = ({ children, className, ...props }) => <div className={`${className} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6`} {...props}>{children}</div>;
const CardHeader: FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => <div className={`${className} mb-4`}>{children}</div>;
const CardTitle: FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => <h3 className={`${className} text-2xl font-bold text-gray-900 dark:text-white`}>{children}</h3>;
const CardContent: FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => <div className={className}>{children}</div>;
const AlertDialog: FC<{ children: React.ReactNode }> = ({ children }) => <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">{children}</div>;
const AlertDialogContent: FC<{ children: React.ReactNode }> = ({ children }) => <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">{children}</div>;
const AlertDialogHeader: FC<{ children: React.ReactNode }> = ({ children }) => <div className="mb-4">{children}</div>;
const AlertDialogTitle: FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-4xl font-bold">{children}</h2>;
const AlertDialogDescription: FC<{ children: React.ReactNode }> = ({ children }) => <div className="mt-4 text-2xl text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{children}</div>;
const AlertDialogFooter: FC<{ children: React.ReactNode }> = ({ children }) => <div className="mt-6 flex justify-end space-x-4">{children}</div>;

// --- Helper Function ---
const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (error) {
        console.error("Invalid YouTube URL:", url);
        return null;
    }
};

interface AppState {
    loading: boolean;
    error: string | null;
    data: AppData | null;
}

export default function WorkoutApp() {
    const [appState, setAppState] = useState<AppState>({
        loading: true,
        error: null,
        data: null,
    });

    const [step, setStep] = useState<'disclaimer' | 'selection' | 'workout'>('disclaimer');
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    useEffect(() => {
        const fetchWorkoutData = async () => {
            try {
                const response = await fetch('/api/workouts');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: AppData = await response.json();
                setAppState({ loading: false, error: null, data });
            } catch (err) {
                const error = err instanceof Error ? err.message : 'An unknown error occurred.';
                setAppState({ loading: false, error: `Failed to load workout data. ${error}`, data: null });
            }
        };

        fetchWorkoutData();
    }, []);

    const handleAcceptDisclaimer = () => setStep('selection');
    const handleSelectWorkout = (workoutName: string) => {
        if (appState.data) {
            setSelectedWorkout(appState.data.workouts[workoutName]);
            setStep('workout');
        }
    };
    const handleGoBack = () => {
        setStep('selection');
        setSelectedWorkout(null);
    };

    const currentWorkoutName = useMemo(() => {
        if (!appState.data || !selectedWorkout) return '';
        return Object.keys(appState.data.workouts).find(key => appState.data!.workouts[key] === selectedWorkout);
    }, [selectedWorkout, appState.data]);

    if (appState.loading) {
        return <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center"><p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Loading your workout plan...</p></div>;
    }

    if (appState.error) {
        return <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4"><Card className="text-center bg-red-50 border-red-200"><CardHeader><CardTitle className="text-red-700">An Error Occurred</CardTitle></CardHeader><CardContent><p className="text-red-600">{appState.error}</p></CardContent></Card></div>;
    }
    
    if (!appState.data) {
        return null; // Should not happen if not loading and no error, but good for safety
    }

    if (step === 'disclaimer') {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <AlertDialog>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Welcome! Please Read This First.</AlertDialogTitle>
                            <AlertDialogDescription>{appState.data.disclaimerText}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button onClick={handleAcceptDisclaimer} className="w-full text-3xl px-8 py-6">I Understand, Let's Start</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-6xl sm:text-7xl font-extrabold text-gray-900 dark:text-white mb-4">Your Workout Plan</h1>
                    <p className="text-3xl text-gray-600 dark:text-gray-300">Stay consistent, stay healthy.</p>
                </header>

                {step === 'selection' && (
                    <div className="text-center">
                        <h2 className="text-5xl font-bold mb-12 text-gray-800 dark:text-gray-100">What are we training today?</h2>
                        <div className="grid grid-cols-1 gap-8">
                            {Object.keys(appState.data.workouts).map((name) => (
                                <Card key={name} onClick={() => handleSelectWorkout(name)} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-12">
                                    <div className="text-center">
                                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{name}</h3>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'workout' && selectedWorkout && (
                    <div>
                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">{currentWorkoutName}</h2>
                            <Button onClick={handleGoBack} className="text-2xl px-8 py-4">
                                Choose Different Workout
                            </Button>
                        </div>

                        <div className="space-y-12">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-8">
                                <h3 className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 mb-6">First: Warm Up</h3>
                                <div className="space-y-4">
                                    {selectedWorkout.warmUp.map(item => (
                                        <div key={item.name} className="text-2xl text-gray-800 dark:text-gray-200">
                                            <span className="font-bold">{item.name}:</span> {item.reps}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">Your Exercises</h3>
                                <div className="space-y-8">
                                    {selectedWorkout.exercises.map((ex, index) => {
                                        const embedUrl = getYouTubeEmbedUrl(ex.videoUrl);
                                        return (
                                            <Card key={index} className="p-8">
                                                <div className="text-center mb-6">
                                                    <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{index + 1}. {ex.name}</h4>
                                                    <p className="text-2xl text-blue-600 dark:text-blue-400 font-bold">
                                                        {ex.reps} reps × {ex.sets} sets
                                                    </p>
                                                </div>
                                                {embedUrl ? (
                                                    <div className="mx-auto max-w-4xl">
                                                        <div className="relative w-full" style={{paddingBottom: '56.25%'}}>
                                                            <iframe 
                                                                src={embedUrl} 
                                                                title={`Video for ${ex.name}`} 
                                                                style={{border: 0}} 
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                                allowFullScreen 
                                                                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-2xl text-red-500 text-center">Video not available</p>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center">
                                <h3 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-6">Important Reminders</h3>
                                <div className="space-y-4">
                                    {appState.data.additionalInstructionsText.map((item, index) => (
                                        <p key={index} className="text-xl text-gray-800 dark:text-gray-200">{item}</p>
                                    ))}
                                </div>
                                <div className="mt-8">
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-6">Well Done! 🎉</p>
                                    <Button onClick={handleGoBack} className="text-2xl px-8 py-4">
                                        Choose Another Workout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
