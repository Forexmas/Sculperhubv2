import React, { useState } from 'react';
import { createNFT } from '../services/mockBackend';
import { User } from '../types';
import { Upload, Plus, Image as ImageIcon } from 'lucide-react';

interface NFTModuleProps {
  user: User;
  refreshUser: () => void;
}

const NFTModule: React.FC<NFTModuleProps> = ({ user, refreshUser }) => {
  const [name, setName] = useState('');
  const [ethAmount, setEthAmount] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState(''); // In real app, this would be file upload
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNFT(user.id, name, ethAmount, imageUrl || 'https://picsum.photos/400/400');
    refreshUser();
    setShowForm(false);
    setName('');
    setEthAmount(0);
    setImageUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">NFT Portfolio</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-cyber-purple hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} /> Create Asset
        </button>
      </div>

      {showForm && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Mint New NFT</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Asset Name</label>
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-cyber-dark border border-cyber-border rounded p-2 text-white"
                  placeholder="e.g., Cyber Punk #2044"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ETH Value</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={ethAmount}
                  onChange={e => setEthAmount(Number(e.target.value))}
                  className="w-full bg-cyber-dark border border-cyber-border rounded p-2 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <button type="submit" className="w-full py-3 bg-cyber-accent text-cyber-dark font-bold rounded hover:bg-emerald-400 transition">
              Mint Asset
            </button>
          </form>
        </div>
      )}

      {/* Grid */}
      {user.nfts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-cyber-border rounded-xl text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>No NFTs in portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {user.nfts.map(nft => (
            <div key={nft.id} className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden group">
              <div className="aspect-square bg-cyber-dark relative overflow-hidden">
                <img 
                  src={nft.imageUrl} 
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white truncate">{nft.name}</h4>
                <p className="text-cyber-purple text-sm font-mono mt-1">{nft.ethAmount} ETH</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTModule;