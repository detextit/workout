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
const CardDescription: FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => <p className={`${className} text-sm text-gray-500 dark:text-gray-400`}>{children}</p>;
const CardContent: FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => <div className={className}>{children}</div>;
const Accordion: FC<{ children: React.ReactNode }> = ({ children }) => <div className="space-y-2">{children}</div>;
const AccordionItem: FC<{ children: React.ReactNode; value: string }> = ({ children }) => <div className="border-b border-gray-200 dark:border-gray-700">{children}</div>;
const AccordionTrigger: FC<{ children: React.ReactNode; onClick: () => void; }> = ({ children, onClick }) => (
    <button onClick={onClick} className="w-full flex justify-between items-center py-4 px-2 text-left font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
        {children}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-6 w-6 transition-transform duration-200"><path d="m6 9 6 6 6-6"/></svg>
    </button>
);
const AccordionContent: FC<{ children: React.ReactNode; isOpen: boolean }> = ({ children, isOpen }) => (<div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-full' : 'max-h-0'}`}><div className="pb-4 pt-0 px-2">{children}</div></div>);
const AlertDialog: FC<{ children: React.ReactNode }> = ({ children }) => <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">{children}</div>;
const AlertDialogContent: FC<{ children: React.ReactNode }> = ({ children }) => <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-lg">{children}</div>;
const AlertDialogHeader: FC<{ children: React.ReactNode }> = ({ children }) => <div className="mb-4">{children}</div>;
const AlertDialogTitle: FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold">{children}</h2>;
const AlertDialogDescription: FC<{ children: React.ReactNode }> = ({ children }) => <div className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{children}</div>;
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
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

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
            setOpenAccordion('warmup');
        }
    };
    const handleGoBack = () => {
        setStep('selection');
        setSelectedWorkout(null);
        setOpenAccordion(null);
    };
    const toggleAccordion = (value: string) => setOpenAccordion(openAccordion === value ? null : value);

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
                            <Button onClick={handleAcceptDisclaimer} className="w-full text-lg">I Understand, Let's Start</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">Your Workout Plan</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Stay consistent, stay healthy.</p>
                </header>

                {step === 'selection' && (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">What are we training today?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.keys(appState.data.workouts).map((name) => (
                                <Card key={name} onClick={() => handleSelectWorkout(name)} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                                    <CardHeader><CardTitle>{name}</CardTitle></CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'workout' && selectedWorkout && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                             <Button onClick={handleGoBack} variant="outline" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                ← Choose a Different Workout
                            </Button>
                            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentWorkoutName}</h2>
                        </div>
                        <Accordion>
                            <AccordionItem value="warmup">
                                <AccordionTrigger onClick={() => toggleAccordion('warmup')}>Step 1: Warm Up (Important!)</AccordionTrigger>
                                <AccordionContent isOpen={openAccordion === 'warmup'}>
                                    <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300">
                                        {selectedWorkout.warmUp.map(item => (<li key={item.name}><span className="font-semibold">{item.name}:</span> {item.reps}</li>))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="exercises">
                                <AccordionTrigger onClick={() => toggleAccordion('exercises')}>Step 2: Main Workout</AccordionTrigger>
                                <AccordionContent isOpen={openAccordion === 'exercises'}>
                                    <div className="space-y-6">
                                        {selectedWorkout.exercises.map((ex, index) => {
                                            const embedUrl = getYouTubeEmbedUrl(ex.videoUrl);
                                            return (
                                                <Card key={index}>
                                                    <CardHeader>
                                                        <CardTitle>{index + 1}. {ex.name}</CardTitle>
                                                        <CardDescription>Reps: <span className="font-bold text-lg">{ex.reps}</span> | Sets: <span className="font-bold text-lg">{ex.sets}</span></CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {embedUrl ? (<div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden"><iframe src={embedUrl} title={`YouTube video for ${ex.name}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe></div>) : (<p className="text-red-500">Video link is missing or invalid.</p>)}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="instructions">
                                <AccordionTrigger onClick={() => toggleAccordion('instructions')}>General Reminders</AccordionTrigger>
                                <AccordionContent isOpen={openAccordion === 'instructions'}>
                                     <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300">
                                        {appState.data.additionalInstructionsText.map((item, index) => (<li key={index}>{item}</li>))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
}
