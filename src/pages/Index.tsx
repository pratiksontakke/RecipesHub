
import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedRecipes } from '@/components/home/FeaturedRecipes';
import { LatestRecipes } from '@/components/home/LatestRecipes';
import { TrendingCategories } from '@/components/home/TrendingCategories';
import { TopCreators } from '@/components/home/TopCreators';
import { ValueProposition } from '@/components/home/ValueProposition';
import { JoinUsCTA } from '@/components/home/JoinUsCTA';
import { Footer } from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedRecipes />
      <LatestRecipes />
      <TrendingCategories />
      <TopCreators />
      <ValueProposition />
      <JoinUsCTA />
      <Footer />
    </div>
  );
};

export default Index;
