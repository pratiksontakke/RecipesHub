
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export const SearchFilterBlock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search:', { searchTerm, category, cuisine, cookingTime, difficulty });
  };

  return (
    <section className="bg-white py-12 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search recipes or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
                <SelectItem value="appetizer">Appetizer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger>
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="mexican">Mexican</SelectItem>
                <SelectItem value="american">American</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cookingTime} onValueChange={setCookingTime}>
              <SelectTrigger>
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Under 15 min</SelectItem>
                <SelectItem value="30">Under 30 min</SelectItem>
                <SelectItem value="60">Under 1 hour</SelectItem>
                <SelectItem value="120">Under 2 hours</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="bg-orange-600 hover:bg-orange-700">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
