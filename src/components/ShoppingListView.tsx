import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart, CheckCircle2, Package, DollarSign, ArrowRightLeft } from 'lucide-react';
import { Ingredient, Unit } from '../types';

interface ShoppingListViewProps {
  ingredients: Ingredient[];
  onUpdateIngredient: (id: string, updates: Partial<Ingredient>) => void;
}

export function ShoppingListView({ ingredients, onUpdateIngredient }: ShoppingListViewProps) {
  const [filter, setFilter] = useState<'all' | 'to-buy'>('all');

  const displayedIngredients = filter === 'all' 
    ? ingredients 
    : ingredients.filter(ing => (ing.requiredAmount - ing.onHand) > 0);

  const toggleUnit = (ing: Ingredient) => {
    let newUnit: Unit = ing.unit;
    let newAmount = ing.requiredAmount;
    let newOnHand = ing.onHand;

    if (ing.unit === 'g') {
      newUnit = 'kg';
      newAmount = ing.requiredAmount / 1000;
      newOnHand = ing.onHand / 1000;
    } else if (ing.unit === 'kg') {
      newUnit = 'g';
      newAmount = ing.requiredAmount * 1000;
      newOnHand = ing.onHand * 1000;
    } else if (ing.unit === 'ml') {
      newUnit = 'l';
      newAmount = ing.requiredAmount / 1000;
      newOnHand = ing.onHand / 1000;
    } else if (ing.unit === 'l') {
      newUnit = 'ml';
      newAmount = ing.requiredAmount * 1000;
      newOnHand = ing.onHand * 1000;
    }

    onUpdateIngredient(ing.id, { 
      unit: newUnit, 
      requiredAmount: Number(newAmount.toFixed(2)), 
      onHand: Number(newOnHand.toFixed(2)) 
    });
  };

  const calculateToBuy = (ing: Ingredient) => {
    const diff = ing.requiredAmount - ing.onHand;
    return diff > 0 ? Number(diff.toFixed(2)) : 0;
  };

  const totalCost = ingredients.reduce((acc, ing) => {
    const toBuy = calculateToBuy(ing);
    return acc + (toBuy * ing.pricePerUnit);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Ingredients
          </Button>
          <Button 
            variant={filter === 'to-buy' ? 'default' : 'outline'} 
            onClick={() => setFilter('to-buy')}
            size="sm"
          >
            Shopping List
          </Button>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Est. Total: ${totalCost.toFixed(2)}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Ingredient</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead className="text-center">On Hand</TableHead>
                  <TableHead className="text-center">To Buy</TableHead>
                  <TableHead className="text-center">Price/Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedIngredients.map((ing) => {
                  const toBuy = calculateToBuy(ing);
                  return (
                    <TableRow key={ing.id} className={toBuy === 0 ? 'bg-green-50/50 dark:bg-green-950/10' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {toBuy === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-orange-500" />
                          )}
                          {ing.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {ing.requiredAmount} {ing.unit}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Input
                            type="number"
                            value={ing.onHand}
                            onChange={(e) => onUpdateIngredient(ing.id, { onHand: Number(e.target.value) })}
                            className="w-20 h-8 text-center"
                          />
                          <span className="text-xs text-muted-foreground">{ing.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={toBuy > 0 ? 'destructive' : 'secondary'}>
                          {toBuy} {ing.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={ing.pricePerUnit}
                            onChange={(e) => onUpdateIngredient(ing.id, { pricePerUnit: Number(e.target.value) })}
                            className="w-20 h-8 text-center"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleUnit(ing)}
                          title="Toggle Unit"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
