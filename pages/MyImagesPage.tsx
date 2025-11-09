import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DownloadIcon, PhotographIcon } from '../components/Icons';
import { Link } from 'react-router-dom';

const ImageCard: React.FC<{ src: string, prompt: string }> = ({ src, prompt }) => {
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
      <img src={src} alt={prompt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white text-sm opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300 mb-2 line-clamp-2">{prompt}</p>
        <button
          onClick={downloadImage}
          className="p-3 bg-white/90 backdrop-blur-sm text-black rounded-full opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300 self-center"
          aria-label="Download image"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const MyImagesPage: React.FC = () => {
  const { user, images } = useAuth();

  const userImages = useMemo(() => {
    return images
      .filter(img => img.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [images, user]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold">My Collection</h1>
        <p className="text-lg text-light-subtle dark:text-dark-subtle mt-2">All your generated images in one place.</p>
      </div>
      
      {userImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userImages.map(image => (
            <ImageCard key={image.id} src={image.imageUrl} prompt={image.prompt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-light-card dark:bg-dark-card rounded-2xl shadow-card border border-light-border dark:border-dark-border">
          <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary-500/10 rounded-2xl mb-6">
            <PhotographIcon className="w-10 h-10 text-primary-500" />
          </div>
          <p className="text-xl text-light-text dark:text-dark-text font-semibold">Your gallery is empty</p>
          <p className="text-light-subtle dark:text-dark-subtle mt-1">You haven't generated any images yet.</p>
          <Link
            to="/generate"
            className="mt-6 inline-block bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 duration-300"
          >
            Start Creating
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyImagesPage;