import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ShoppingCart, CheckCircle2, DollarSign, Filter } from 'lucide-react';
import { Ingredient, Unit, Category } from '../types';

interface ShoppingListViewProps {
  ingredients: Ingredient[];
  onUpdateIngredient: (id: string, updates: Partial<Ingredient>) => void;
}

const CATEGORY_COLORS: Record<Category, string> = {
  'Protein': 'bg-red-100 text-red-700 border-red-300',
  'Grains': 'bg-amber-100 text-amber-700 border-amber-300',
  'Vegetables': 'bg-green-100 text-green-700 border-green-300',
  'Fruits': 'bg-pink-100 text-pink-700 border-pink-300',
  'Dairy': 'bg-blue-100 text-blue-700 border-blue-300',
  'Fats': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Pantry': 'bg-purple-100 text-purple-700 border-purple-300',
  'Other': 'bg-gray-100 text-gray-700 border-gray-300'
};

function categorizeIngredient(name: string): Category {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('chicken') || nameLower.includes('beef') || nameLower.includes('fish') || 
      nameLower.includes('salmon') || nameLower.includes('tuna') || nameLower.includes('egg') ||
      nameLower.includes('mince') || nameLower.includes('thigh')) {
    return 'Protein';
  }
  if (nameLower.includes('rice') || nameLower.includes('oat') || nameLower.includes('quinoa') || 
      nameLower.includes('bread') || nameLower.includes('pasta') || nameLower.includes('noodle')) {
    return 'Grains';
  }
  if (nameLower.includes('broccoli') || nameLower.includes('carrot') || nameLower.includes('lettuce') ||
      nameLower.includes('spinach') || nameLower.includes('tomato') || nameLower.includes('cucumber') ||
      nameLower.includes('capsicum') || nameLower.includes('onion') || nameLower.includes('garlic')) {
    return 'Vegetables';
  }
  if (nameLower.includes('banana') || nameLower.includes('apple') || nameLower.includes('berr') ||
      nameLower.includes('orange') || nameLower.includes('lemon') || nameLower.includes('avocado')) {
    return 'Fruits';
  }
  if (nameLower.includes('milk') || nameLower.includes('yogurt') || nameLower.includes('cheese') ||
      nameLower.includes('butter') || nameLower.includes('cream')) {
    return 'Dairy';
  }
  if (nameLower.includes('oil') || nameLower.includes('nut') || nameLower.includes('seed') ||
      nameLower.includes('almond') || nameLower.includes('peanut')) {
    return 'Fats';
  }
  if (nameLower.includes('salt') || nameLower.includes('pepper') || nameLower.includes('spice') ||
      nameLower.includes('sauce') || nameLower.includes('vinegar') || nameLower.includes('honey')) {
    return 'Pantry';
  }
  return 'Other';
}

export function ShoppingListView({ ingredients, onUpdateIngredient }: ShoppingListViewProps) {
  const [filter, setFilter] = useState<'all' | 'to-buy'>('all');
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());

  // Auto-categorize ingredients on first render
  React.useEffect(() => {
    ingredients.forEach(ing => {
      if (!ing.category) {
        onUpdateIngredient(ing.id, { category: categorizeIngredient(ing.name) });
      }
    });
  }, []);

  const toggleCategory = (category: Category) => {
    const newCategories = new Set(activeCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setActiveCategories(newCategories);
  };

  const displayedIngredients = ingredients.filter(ing => {
    const matchesFilter = filter === 'all' || (ing.requiredAmount - ing.onHand) > 0;
    const matchesCategory = activeCategories.size === 0 || activeCategories.has(ing.category || 'Other');
    return matchesFilter && matchesCategory;
  });

  const convertUnit = (ing: Ingredient, newUnit: Unit) => {
    let newRequired = ing.requiredAmount;
    let newOnHand = ing.onHand;

    // g <-> kg conversion
    if (ing.unit === 'g' && newUnit === 'kg') {
      newRequired = ing.requiredAmount / 1000;
      newOnHand = ing.onHand / 1000;
    } else if (ing.unit === 'kg' && newUnit === 'g') {
      newRequired = ing.requiredAmount * 1000;
      newOnHand = ing.onHand * 1000;
    }
    // ml <-> l conversion
    else if (ing.unit === 'ml' && newUnit === 'l') {
      newRequired = ing.requiredAmount / 1000;
      newOnHand = ing.onHand / 1000;
    } else if (ing.unit === 'l' && newUnit === 'ml') {
      newRequired = ing.requiredAmount * 1000;
      newOnHand = ing.onHand * 1000;
    }

    onUpdateIngredient(ing.id, {
      unit: newUnit,
      requiredAmount: Number(newRequired.toFixed(2)),
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

  const allCategories: Category[] = ['Protein', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Fats', 'Pantry', 'Other'];

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                  className="bg-[#F55951] hover:bg-[#E54941] text-white"
                >
                  All Ingredients
                </Button>
                <Button
                  variant={filter === 'to-buy' ? 'default' : 'outline'}
                  onClick={() => setFilter('to-buy')}
                  size="sm"
                  className="bg-[#F55951] hover:bg-[#E54941] text-white"
                >
                  Shopping List
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-[#F55951] px-4 py-2 rounded-lg text-white font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>Total: ${totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Category Filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#5E5E5E] font-medium">
                <Filter className="h-4 w-4" />
                <span>Filter by Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      activeCategories.has(category)
                        ? CATEGORY_COLORS[category]
                        : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                {activeCategories.size > 0 && (
                  <button
                    onClick={() => setActiveCategories(new Set())}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2B2B2B] text-white hover:bg-[#1B1B1B]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping List Table */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F5F5]">
                  <TableHead className="w-[200px] font-semibold text-[#2B2B2B]">Ingredient</TableHead>
                  <TableHead className="w-[120px] text-center font-semibold text-[#2B2B2B]">Category</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold text-[#2B2B2B]">Required</TableHead>
                  <TableHead className="w-[140px] text-center font-semibold text-[#2B2B2B]">On Hand</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold text-[#2B2B2B]">To Buy</TableHead>
                  <TableHead className="w-[110px] text-center font-semibold text-[#2B2B2B]">Price/Unit</TableHead>
                  <TableHead className="w-[150px] text-center font-semibold text-[#2B2B2B]">Source</TableHead>
                  <TableHead className="w-[80px] text-center font-semibold text-[#2B2B2B]">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedIngredients.map((ing) => {
                  const toBuy = calculateToBuy(ing);
                  const category = ing.category || 'Other';
                  return (
                    <TableRow
                      key={ing.id}
                      className={toBuy === 0 ? 'bg-green-50' : ''}
                    >
                      <TableCell className="font-medium text-[#2B2B2B]">
                        <div className="flex items-center gap-2">
                          {toBuy === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-[#F55951] flex-shrink-0" />
                          )}
                          <span className="truncate">{ing.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${CATEGORY_COLORS[category]} text-xs font-medium border`}>
                          {category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-[#2B2B2B] font-medium">
                          {ing.requiredAmount} {ing.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Input
                            type="number"
                            value={ing.onHand}
                            onChange={(e) => onUpdateIngredient(ing.id, { onHand: Number(e.target.value) })}
                            className="w-20 h-9 text-center font-mono border-gray-300"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-xs text-[#5E5E5E] w-8">{ing.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={toBuy > 0 ? 'destructive' : 'secondary'}
                          className={`font-mono font-semibold ${toBuy > 0 ? 'bg-[#F55951] text-white' : ''}`}
                        >
                          {toBuy} {ing.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-[#5E5E5E]">$</span>
                          <Input
                            type="number"
                            value={ing.pricePerUnit}
                            onChange={(e) => onUpdateIngredient(ing.id, { pricePerUnit: Number(e.target.value) })}
                            className="w-20 h-9 text-center font-mono border-gray-300"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={ing.source || ''}
                          onChange={(e) => onUpdateIngredient(ing.id, { source: e.target.value })}
                          placeholder="Coles, Woolies..."
                          className="h-9 text-sm border-gray-300 text-[#2B2B2B]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ing.unit}
                          onValueChange={(value: Unit) => convertUnit(ing, value)}
                        >
                          <SelectTrigger className="h-9 w-full border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="l">L</SelectItem>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="cups">cups</SelectItem>
                            <SelectItem value="tbsp">tbsp</SelectItem>
                            <SelectItem value="tsp">tsp</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {displayedIngredients.length === 0 && (
        <Card className="bg-white">
          <CardContent className="p-12 text-center text-[#5E5E5E]">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No items to display</p>
            <p className="text-sm mt-1">Try adjusting your filters or view all ingredients</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
