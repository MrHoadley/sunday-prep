import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { MealPlan } from '../types';
import { Flame, Calendar, Utensils } from 'lucide-react';

interface MealPlanViewProps {
  plan: MealPlan;
}

export function MealPlanView({ plan }: MealPlanViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Flame className="h-4 w-4" />
              Daily Calorie Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plan.calorieTarget} kcal</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
              Plan Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plan.meals.length} Days</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
              <Utensils className="h-4 w-4" />
              Total Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plan.ingredients.length} Items</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Day</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
                  <TableHead>Snacks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.meals.map((meal, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-semibold">{meal.day}</TableCell>
                    <TableCell className="text-sm">{meal.breakfast}</TableCell>
                    <TableCell className="text-sm">{meal.lunch}</TableCell>
                    <TableCell className="text-sm">{meal.dinner}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="font-normal">
                        {meal.snacks}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
