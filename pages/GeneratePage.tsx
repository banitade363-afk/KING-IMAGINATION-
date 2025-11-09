import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateImages } from '../services/geminiService';
import { IMAGE_GENERATION_COST } from '../constants';
import Spinner from '../components/Spinner';
import { DownloadIcon, PhotographIcon } from '../components/Icons';
import { Link } from 'react-router-dom';

const ImageCard: React.FC<{ src: string }> = ({ src }) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group aspect-square bg-dark-card rounded-xl overflow-hidden shadow-card border border-light-border dark:border-dark-border">
      <img src={src} alt="AI generated art" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
        <button
          onClick={downloadImage}
          className="p-3 bg-white/90 backdrop-blur-sm text-black rounded-full opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300"
          aria-label="Download image"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const GeneratePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, recordImageGeneration } = useAuth();

  const handleGenerate = async () => {
    if (!user) {
      setError('You must be logged in to generate images.');
      return;
    }

    const cost = IMAGE_GENERATION_COST * numImages;
    if (user.credits < cost) {
      setError('Not enough credits. Please purchase more.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedImages([]);

    try {
      const images = await generateImages(prompt, numImages);
      setGeneratedImages(images);

      const imagesData = images.map(imageUrl => ({
        userId: user.id,
        prompt,
        imageUrl,
      }));
      await recordImageGeneration(user.id, cost, imagesData);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const gridColsClass = {
    1: 'sm:grid-cols-1 max-w-lg mx-auto',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 md:grid-cols-4',
  }[generatedImages.length] || 'sm:grid-cols-2';

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold">Image Generator</h1>
          <p className="text-lg text-light-subtle dark:text-dark-subtle mt-2">
            Describe what you want to create. Be as specific as you can.
          </p>
        </div>
        
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A photorealistic portrait of a majestic lion wearing a crown, cinematic lighting..."
              className="md:col-span-4 w-full p-4 border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              rows={3}
            />
            <div className="md:col-span-1">
              <label htmlFor="numImages" className="block text-sm font-medium mb-2 text-light-subtle dark:text-dark-subtle">
                Quantity
              </label>
              <select
                id="numImages"
                value={numImages}
                onChange={(e) => setNumImages(parseInt(e.target.value))}
                className="w-full p-3 border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n} className="bg-light-card dark:bg-dark-card">{n}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex items-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center text-base"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-3">Generating...</span>
                  </>
                ) : (
                  <>
                    <PhotographIcon className="w-5 h-5 mr-2"/>
                    <span>Generate ({IMAGE_GENERATION_COST * numImages} Credits)</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 mt-4 text-center">{error} {error.includes("credits") && <Link to="/credits" className="underline font-bold">Buy Credits</Link>}</p>}
        </div>

        {isLoading && (
          <div className="mt-16 text-center">
             <div className="flex justify-center items-center h-48 bg-light-card dark:bg-dark-card rounded-2xl shadow-card border border-light-border dark:border-dark-border">
                <div>
                    <Spinner />
                    <p className="mt-4 text-lg text-light-subtle dark:text-dark-subtle">Your masterpieces are being crafted...</p>
                </div>
             </div>
          </div>
        )}

        {generatedImages.length > 0 && !isLoading && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Your Creations</h2>
            <div className={`grid grid-cols-2 gap-4 ${gridColsClass}`}>
              {generatedImages.map((src, index) => (
                <ImageCard key={index} src={src} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePage;