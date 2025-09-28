import React, { useState, useCallback, useEffect } from 'react';
import { PlanStep, ProductPlan, PlanSection, LeanCanvasData, AISuggestions } from './types';
import { PLAN_STEPS, FREE_STEPS } from './constants';
import { generateSectionIdeas, generateLeanCanvasSummary, generateActionItems, generateExampleContent } from './services/geminiService';
import Sidebar from './components/Sidebar';
import StepContent from './components/StepContent';
import PlanViewer from './components/PlanViewer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import LeanCanvasViewer from './components/LeanCanvasViewer';
import SettingsModal from './components/SettingsModal';

const initialPlanState: ProductPlan = PLAN_STEPS.reduce((acc, step) => {
  acc[step.id] = { userInput: '', generatedContent: '', isExample: false, history: [] };
  return acc;
}, {} as ProductPlan);

const LOCAL_STORAGE_KEY = 'product-plan-architect';

const App: React.FC = () => {
  const [plan, setPlan] = useState<ProductPlan>(() => {
    try {
      const savedPlan = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedPlan ? JSON.parse(savedPlan) : initialPlanState;
    } catch (error) {
      console.error("Failed to parse plan from localStorage", error);
      return initialPlanState;
    }
  });
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewingPlan, setIsViewingPlan] = useState(false);
  
  const [leanCanvasData, setLeanCanvasData] = useState<LeanCanvasData | null>(null);
  const [isViewingCanvas, setIsViewingCanvas] = useState(false);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({});

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    if (key) {
      localStorage.setItem('gemini-api-key', key);
      setApiKey(key);
      setError(null);
      setCanvasError(null);
    }
  };

  const handleStart = () => {
    setCurrentStep(0);
  };
  
  const handleReset = () => {
    setPlan(initialPlanState);
    setCurrentStep(null);
    setIsViewingPlan(false);
    setError(null);
    setIsLoading(false);
    setLeanCanvasData(null);
    setIsViewingCanvas(false);
    setIsGeneratingCanvas(false);
    setCanvasError(null);
    setAiSuggestions({});
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  const handleUpdateUserInput = (stepId: PlanSection, value: string) => {
    setPlan(prevPlan => ({
      ...prevPlan,
      [stepId]: { ...prevPlan[stepId], userInput: value }
    }));
  };

  const handleGenerateIdeas = useCallback(async (step: PlanStep) => {
    const isFreeStep = FREE_STEPS.includes(step.id);
    
    if (!apiKey && !isFreeStep) {
      setError("Para esta seção e funcionalidades completas, adicione sua chave de API Gemini nas configurações.");
      setIsSettingsOpen(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const userInput = plan[step.id].userInput;

      if (!apiKey && isFreeStep) {
        const content = await generateExampleContent(step.title);
        setPlan(prevPlan => ({
            ...prevPlan,
            [step.id]: { ...prevPlan[step.id], generatedContent: content, isExample: true }
        }));
        return;
      }
      
      if (step.id === 'actionItems') {
        const content = await generateActionItems(plan, PLAN_STEPS, userInput);
        setPlan(prevPlan => {
            const currentContent = prevPlan[step.id].generatedContent;
            const oldHistory = prevPlan[step.id].history || [];
            const newHistory = currentContent ? [currentContent, ...oldHistory] : oldHistory;
            return {
                ...prevPlan,
                [step.id]: { ...prevPlan[step.id], generatedContent: content, isExample: false, history: newHistory }
            }
        });
      } else {
        if (!userInput) {
          setError("Por favor, forneça sua ideia central antes de gerar.");
          setIsLoading(false);
          return;
        }
        const ideas = await generateSectionIdeas(step.title, userInput);
        setAiSuggestions(prev => ({...prev, [step.id]: ideas}));
      }
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Falha ao gerar conteúdo. Por favor, verifique sua chave de API e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [plan, apiKey]);
  
  const handleSelectIdea = (stepId: PlanSection, idea: string) => {
    setPlan(prevPlan => {
        const currentContent = prevPlan[stepId].generatedContent;
        const oldHistory = prevPlan[stepId].history || [];
        const newHistory = currentContent ? [currentContent, ...oldHistory] : oldHistory;
        
        return {
            ...prevPlan,
            [stepId]: {
                ...prevPlan[stepId],
                generatedContent: idea,
                isExample: false,
                history: newHistory
            }
        };
    });
    
    setAiSuggestions(prev => {
        const newSuggestions = {...prev};
        delete newSuggestions[stepId];
        return newSuggestions;
    });
  };

  const handleRevertVersion = (stepId: PlanSection, versionToRestore: string, versionIndex: number) => {
    setPlan(prevPlan => {
        const currentContent = prevPlan[stepId].generatedContent;
        const oldHistory = prevPlan[stepId].history || [];
        
        const historyWithoutRestored = oldHistory.filter((_, index) => index !== versionIndex);
        const newHistory = [currentContent, ...historyWithoutRestored];
        
        return {
            ...prevPlan,
            [stepId]: {
                ...prevPlan[stepId],
                generatedContent: versionToRestore,
                history: newHistory
            }
        };
    });
  };

  const handleNextStep = () => {
    if (currentStep !== null) {
      if (currentStep < PLAN_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsViewingPlan(true);
      }
    }
  };
  
  const handlePrevStep = () => {
     if (currentStep !== null && currentStep > 0) {
        setCurrentStep(currentStep - 1);
     }
  }

  const handleEditPlan = () => {
    setIsViewingPlan(false);
    setIsViewingCanvas(false);
    setCurrentStep(PLAN_STEPS.length - 1);
  };
  
  const handleGenerateCanvas = useCallback(async () => {
    if (!apiKey) {
      setCanvasError("Por favor, insira sua chave de API Gemini nas configurações antes de gerar o canvas.");
      setIsSettingsOpen(true);
      return;
    }
    setIsGeneratingCanvas(true);
    setCanvasError(null);
    try {
      const canvasData = await generateLeanCanvasSummary(plan, PLAN_STEPS);
      setLeanCanvasData(canvasData);
      setIsViewingCanvas(true);
      setIsViewingPlan(false);
    } catch (e: any) {
      console.error(e);
      setCanvasError(e.message || "Falha ao gerar o Lean Canvas. A IA não conseguiu resumir o plano. Por favor, tente novamente.");
    } finally {
      setIsGeneratingCanvas(false);
    }
  }, [plan, apiKey]);
  
  const handleExitCanvasView = () => {
    setIsViewingCanvas(false);
    setIsViewingPlan(true);
  }

  if (currentStep === null) {
    return (
      <div className="min-h-screen">
        <Header onReset={handleReset} showReset={false} onOpenSettings={() => setIsSettingsOpen(true)} />
        <Hero onStart={handleStart} />
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveApiKey}
          currentApiKey={apiKey}
        />
      </div>
    );
  }

  const renderContent = () => {
    if (isViewingCanvas && leanCanvasData) {
      return <LeanCanvasViewer canvasData={leanCanvasData} onExit={handleExitCanvasView} />;
    }
    if (isViewingPlan) {
      return (
          <PlanViewer 
            plan={plan} 
            steps={PLAN_STEPS} 
            onEdit={handleEditPlan} 
            onVisualizeCanvas={handleGenerateCanvas}
            isGeneratingCanvas={isGeneratingCanvas}
            canvasError={canvasError}
          />
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-3">
          <Sidebar steps={PLAN_STEPS} currentStepIndex={currentStep} onSelectStep={setCurrentStep} plan={plan} />
        </aside>
        <div className="md:col-span-9">
          {currentStep !== null && (
            <StepContent
              key={PLAN_STEPS[currentStep].id}
              step={PLAN_STEPS[currentStep]}
              data={plan[PLAN_STEPS[currentStep].id]}
              onUpdateUserInput={handleUpdateUserInput}
              onGenerateIdeas={handleGenerateIdeas}
              isLoading={isLoading}
              error={error}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === PLAN_STEPS.length - 1}
              onOpenSettings={() => setIsSettingsOpen(true)}
              aiSuggestions={aiSuggestions[PLAN_STEPS[currentStep].id]}
              onSelectIdea={(idea) => handleSelectIdea(PLAN_STEPS[currentStep].id, idea)}
              onRevertVersion={(version, index) => handleRevertVersion(PLAN_STEPS[currentStep].id, version, index)}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header onReset={handleReset} showReset={true} onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
       <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveApiKey}
          currentApiKey={apiKey}
        />
    </div>
  );
};

export default App;