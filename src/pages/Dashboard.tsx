
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserOverviewCard } from '@/components/dashboard/UserOverviewCard';
import { UserActivityStats } from '@/components/dashboard/UserActivityStats';
import { MyRecipesSection } from '@/components/dashboard/MyRecipesSection';
import { CollaboratedRecipesSection } from '@/components/dashboard/CollaboratedRecipesSection';
import { SettingsSection } from '@/components/dashboard/SettingsSection';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recipes');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - User Info */}
        <div className="lg:col-span-1 space-y-6">
          <UserOverviewCard />
          <UserActivityStats />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipes">My Recipes</TabsTrigger>
              <TabsTrigger value="collaborated">Collaborated</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recipes" className="mt-6">
              <MyRecipesSection />
            </TabsContent>
            
            <TabsContent value="collaborated" className="mt-6">
              <CollaboratedRecipesSection />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <SettingsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
