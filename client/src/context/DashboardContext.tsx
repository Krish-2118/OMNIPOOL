import React, { createContext, useContext, useState, ReactNode } from 'react';
import { parseProject, matchResources, getAdvice } from '../api/client';

export interface BOMItem {
  hardware_name: string;
  quantity: number;
  notes?: string;
}

export interface HardwareItem {
  id: string;
  name: string;
  category: string;
  status: string;
}

export interface Mentor {
  id: string;
  name: string;
  skills: string[];
}

export interface AIResult {
  title: string;
  description: string;
  extrapolated_BOM: BOMItem[];
  required_skills: string[];
}

export interface ProjectAdvice {
  strategy: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Unknown";
  feasibility_score: number;
  next_steps: string[];
}

interface DashboardState {
  projectPrompt: string;
  setProjectPrompt: (prompt: string) => void;
  isLoading: boolean;
  hasLoaded: boolean;
  aiResult: AIResult | null;
  matchedHardware: HardwareItem[];
  matchedMentors: Mentor[];
  projectAdvice: ProjectAdvice | null;
  submitPrompt: () => Promise<void>;
}

const DashboardContext = createContext<DashboardState | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectPrompt, setProjectPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [matchedHardware, setMatchedHardware] = useState<HardwareItem[]>([]);
  const [matchedMentors, setMatchedMentors] = useState<Mentor[]>([]);
  const [projectAdvice, setProjectAdvice] = useState<ProjectAdvice | null>(null);

  const submitPrompt = async () => {
    if (!projectPrompt.trim()) return;
    
    setIsLoading(true);
    setHasLoaded(false);
    setAiResult(null);
    setMatchedHardware([]);
    setMatchedMentors([]);
    setProjectAdvice(null);

    try {
      // 1. Parse Project
      const { data } = await parseProject(projectPrompt);
      const result = data.data as AIResult;
      setAiResult(result);

      // 2. Match Resources
      let localHardware: HardwareItem[] = [];
      let localMentors: Mentor[] = [];

      if (result.extrapolated_BOM?.length > 0 || result.required_skills?.length > 0) {
        const matchResponse = await matchResources(result.extrapolated_BOM, result.required_skills);
        localHardware = matchResponse.data.data.matched_hardware || [];
        localMentors = matchResponse.data.data.matched_mentors || [];
        
        setMatchedHardware(localHardware);
        setMatchedMentors(localMentors);
      }

      // 3. Get Project Advice (RAG Layer)
      const adviceResponse = await getAdvice(projectPrompt, localHardware, localMentors);
      setProjectAdvice(adviceResponse.data.data);

      setHasLoaded(true);
    } catch (error) {
      console.error('Error processing project prompt:', error);
      setAiResult({
        title: "Analysis Failed",
        description: "We couldn't process your request. Please check your connectivity or API key.",
        extrapolated_BOM: [],
        required_skills: []
      });
      setProjectAdvice({
        strategy: "Error: " + (error as any).message || "Something went wrong during generation.",
        difficulty: "Unknown",
        feasibility_score: 0,
        next_steps: ["Try again in a few moments", "Check your .env settings"]
      });
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        projectPrompt,
        setProjectPrompt,
        isLoading,
        hasLoaded,
        aiResult,
        matchedHardware,
        matchedMentors,
        projectAdvice,
        submitPrompt
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};
