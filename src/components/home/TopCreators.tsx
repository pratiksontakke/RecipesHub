
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Users } from 'lucide-react';

// Fallback data for when there are no real creators yet
const fallbackCreators = [
  {
    user_id: 'demo-1',
    profile: { full_name: 'Maria Garcia', avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' },
    count: 8
  },
  {
    user_id: 'demo-2',
    profile: { full_name: 'James Chen', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    count: 6
  },
  {
    user_id: 'demo-3',
    profile: { full_name: 'Sophie Martin', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    count: 5
  },
  {
    user_id: 'demo-4',
    profile: { full_name: 'Alex Johnson', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    count: 4
  },
  {
    user_id: 'demo-5',
    profile: { full_name: 'Priya Sharma', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    count: 3
  }
];

export const TopCreators = () => {
  const creators = fallbackCreators;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <ChefHat className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-3xl font-bold text-gray-900">Top Home Chefs</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {creators.map((creator: any) => (
            <Card key={creator.user_id} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarImage src={creator.profile?.avatar_url} />
                  <AvatarFallback>
                    {creator.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {creator.profile?.full_name || 'Anonymous Chef'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {creator.count} recipe{creator.count !== 1 ? 's' : ''}
                </p>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Follow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
