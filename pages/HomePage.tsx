import React from 'react';
import { Link } from 'react-router-dom';
import { PhotographIcon, CreditCardIcon, CogIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <PhotographIcon className="h-8 w-8 text-primary-500" />,
      title: 'High-Quality Images',
      description: 'Generate stunning, high-resolution images from simple text prompts using state-of-the-art AI.',
    },
    {
      icon: <CreditCardIcon className="h-8 w-8 text-primary-500" />,
      title: 'Simple Credit System',
      description: 'Start with free credits and easily top up. No subscriptions, pay only for what you use.',
    },
    {
      icon: <CogIcon className="h-8 w-8 text-primary-500" />,
      title: 'Powerful & Easy',
      description: 'An intuitive interface that makes AI image generation accessible to everyone, from beginners to pros.',
    },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative py-28 md:py-40">
        <div 
            className="absolute inset-0 opacity-10 dark:opacity-20" 
            style={{
                backgroundImage: 'radial-gradient(circle at 25% 25%, #2563eb 0%, transparent 35%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 35%)'
            }}
        ></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-light-text dark:text-white mb-6 leading-tight">
            Turn Your Words into <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">Visual Masterpieces</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-light-subtle dark:text-dark-subtle mb-10">
            Imagina brings your imagination to life in seconds. Describe any scene and watch our AI craft beautiful, unique images for you.
          </p>
          <Link
            to="/generate"
            className="inline-block bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all transform hover:-translate-y-1 duration-300"
          >
            Start Creating for Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-light-bg dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">The Future of Digital Art</h2>
            <p className="text-light-subtle dark:text-dark-subtle mt-4 text-lg">Everything you need to create at the speed of thought.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-card border border-light-border dark:border-dark-border transform hover:-translate-y-2 transition-transform duration-300">
                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-primary-500/10 mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-light-subtle dark:text-dark-subtle">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Gallery Section */}
      <section className="py-24 bg-light-card dark:bg-dark-card border-y border-light-border dark:border-dark-border">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold">Powered by Imagination</h2>
                <p className="text-light-subtle dark:text-dark-subtle mt-4 text-lg">A glimpse of what's possible with Imagina.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-xl shadow-subtle aspect-square group">
                        <img src={`https://picsum.photos/500/500?random=${i+10}`} alt={`Example AI generation ${i}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                    </div>
                ))}
            </div>
        </div>
      </section>
      
       {/* Footer */}
      <footer className="bg-light-bg dark:bg-dark-bg">
        <div className="container mx-auto py-8 px-4 text-center text-light-subtle dark:text-dark-subtle">
            <p>&copy; {new Date().getFullYear()} Imagina Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;