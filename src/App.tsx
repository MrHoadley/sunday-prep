import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { FileUploader } from './components/FileUploader';
import { MealPlanView } from './components/MealPlanView';
import { ShoppingListView } from './components/ShoppingListView';
import { MealPlan, Ingredient } from './types';
import { UtensilsCrossed, ShoppingBasket, RefreshCcw, ChevronLeft } from 'lucide-react';

export default function App() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sunday-prep-plan');
    if (saved) {
      try {
        setPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved plan", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (plan) {
      localStorage.setItem('sunday-prep-plan', JSON.stringify(plan));
    }
  }, [plan]);

  const handlePlanParsed = (newPlan: MealPlan) => {
    setPlan(newPlan);
  };

  const handleUpdateIngredient = (id: string, updates: Partial<Ingredient>) => {
    if (!plan) return;
    setPlan({
      ...plan,
      ingredients: plan.ingredients.map(ing => 
        ing.id === id ? { ...ing, ...updates } : ing
      )
    });
  };

  const resetPlan = () => {
    if (confirm("Are you sure you want to clear the current plan and start over?")) {
      setPlan(null);
      localStorage.removeItem('sunday-prep-plan');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <ShoppingBasket className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Sunday Prep</h1>
          </div>
          
          {plan && (
            <Button variant="ghost" size="sm" onClick={resetPlan} className="text-muted-foreground">
              <RefreshCcw className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <AnimatePresence mode="wait">
          {!plan ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="max-w-2xl space-y-6">
                <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                  Ready for Sunday Prep?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Upload your meal plan (PDF, Word, Excel, or Markdown) and we'll generate your shopping list automatically.
                </p>
                <FileUploader onPlanParsed={handlePlanParsed} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4" />
                      Meal Plan
                    </TabsTrigger>
                    <TabsTrigger value="shopping" className="flex items-center gap-2">
                      <ShoppingBasket className="h-4 w-4" />
                      Shopping List
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0">
                  <MealPlanView plan={plan} />
                </TabsContent>

                <TabsContent value="shopping" className="mt-0">
                  <ShoppingListView 
                    ingredients={plan.ingredients} 
                    onUpdateIngredient={handleUpdateIngredient} 
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      {plan && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2 flex justify-around sm:hidden z-50">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            className="flex flex-col h-auto py-2 px-6 gap-1"
            onClick={() => setActiveTab('overview')}
          >
            <UtensilsCrossed className="h-5 w-5" />
            <span className="text-[10px]">Plan</span>
          </Button>
          <Button 
            variant={activeTab === 'shopping' ? 'default' : 'ghost'} 
            className="flex flex-col h-auto py-2 px-6 gap-1"
            onClick={() => setActiveTab('shopping')}
          >
            <ShoppingBasket className="h-5 w-5" />
            <span className="text-[10px]">Shopping</span>
          </Button>
        </div>
      )}
    </div>
  );
}
