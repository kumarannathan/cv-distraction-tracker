import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Waves, 
  Coffee, 
  CloudRain,
  Wind,
  Flame,
  Heart,
  Star,
  Plus,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'focus' | 'white-noise' | 'custom';
  icon: React.ComponentType<any>;
  color: string;
  volume: number;
  isPlaying: boolean;
  audioUrl?: string;
  isCustom?: boolean;
}

interface SoundMix {
  id: string;
  name: string;
  sounds: Array<{ soundId: string; volume: number }>;
  createdAt: number;
}

interface AmbientSoundsProps {
  onVolumeChange?: (volume: number) => void;
}

const AmbientSounds: React.FC<AmbientSoundsProps> = memo(({ onVolumeChange }) => {
  const [sounds, setSounds] = useState<Sound[]>([
    {
      id: 'rain',
      name: 'Rain',
      category: 'nature',
      icon: CloudRain,
      color: '#3B82F6',
      volume: 0,
      isPlaying: false
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      category: 'nature',
      icon: Waves,
      color: '#06B6D4',
      volume: 0,
      isPlaying: false
    },
    {
      id: 'forest',
      name: 'Forest',
      category: 'nature',
      icon: Wind,
      color: '#10B981',
      volume: 0,
      isPlaying: false
    },
    {
      id: 'fireplace',
      name: 'Fireplace',
      category: 'ambient',
      icon: Flame,
      color: '#F59E0B',
      volume: 0,
      isPlaying: false
    },
    {
      id: 'coffee-shop',
      name: 'Coffee Shop',
      category: 'ambient',
      icon: Coffee,
      color: '#8B5CF6',
      volume: 0,
      isPlaying: false
    },
    {
      id: 'white-noise',
      name: 'White Noise',
      category: 'white-noise',
      icon: Volume2,
      color: '#6B7280',
      volume: 0,
      isPlaying: false
    },
    {
      id: 'pink-noise',
      name: 'Pink Noise',
      category: 'white-noise',
      icon: Volume2,
      color: '#EC4899',
      volume: 0,
      isPlaying: false
    },
    {
      id: 'binaural',
      name: 'Binaural Beats',
      category: 'focus',
      icon: Heart,
      color: '#EF4444',
      volume: 0,
      isPlaying: false
    }
  ]);

  const [soundMixes, setSoundMixes] = useState<SoundMix[]>([
    {
      id: 'deep-focus',
      name: 'Deep Focus',
      sounds: [
        { soundId: 'rain', volume: 0.6 },
        { soundId: 'white-noise', volume: 0.3 }
      ],
      createdAt: Date.now() - 86400000
    },
    {
      id: 'creative-flow',
      name: 'Creative Flow',
      sounds: [
        { soundId: 'coffee-shop', volume: 0.5 },
        { soundId: 'forest', volume: 0.4 }
      ],
      createdAt: Date.now() - 172800000
    }
  ]);

  const [masterVolume, setMasterVolume] = useState(0.7);
  const [showSaveMix, setShowSaveMix] = useState(false);
  const [newMixName, setNewMixName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGlobalMute, setIsGlobalMute] = useState(false);

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize audio elements
  useEffect(() => {
    sounds.forEach(sound => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0;
        audioRefs.current[sound.id] = audio;
      }
    });
  }, [sounds]);

  // Update audio playback based on sound state
  useEffect(() => {
    sounds.forEach(sound => {
      const audio = audioRefs.current[sound.id];
      if (audio) {
        const targetVolume = isGlobalMute ? 0 : (sound.volume * masterVolume);
        audio.volume = targetVolume;
        
        if (sound.isPlaying && targetVolume > 0) {
          audio.play().catch(console.error);
        } else {
          audio.pause();
        }
      }
    });
  }, [sounds, masterVolume, isGlobalMute]);

  const toggleSound = useCallback((soundId: string) => {
    setSounds(prev => prev.map(sound => 
      sound.id === soundId 
        ? { ...sound, isPlaying: !sound.isPlaying }
        : sound
    ));
  }, []);

  const updateSoundVolume = useCallback((soundId: string, volume: number) => {
    setSounds(prev => prev.map(sound => 
      sound.id === soundId 
        ? { ...sound, volume }
        : sound
    ));
  }, []);

  const loadSoundMix = useCallback((mix: SoundMix) => {
    // Reset all sounds
    setSounds(prev => prev.map(sound => ({
      ...sound,
      volume: 0,
      isPlaying: false
    })));

    // Apply mix
    setTimeout(() => {
      setSounds(prev => prev.map(sound => {
        const mixSound = mix.sounds.find(s => s.soundId === sound.id);
        return mixSound 
          ? { ...sound, volume: mixSound.volume, isPlaying: mixSound.volume > 0 }
          : sound;
      }));
    }, 100);
  }, []);

  const saveCurrentMix = useCallback(() => {
    if (!newMixName.trim()) return;

    const activeSounds = sounds.filter(sound => sound.volume > 0);
    const mix: SoundMix = {
      id: Date.now().toString(),
      name: newMixName,
      sounds: activeSounds.map(sound => ({
        soundId: sound.id,
        volume: sound.volume
      })),
      createdAt: Date.now()
    };

    setSoundMixes(prev => [mix, ...prev]);
    setNewMixName('');
    setShowSaveMix(false);
  }, [newMixName, sounds]);

  const deleteSoundMix = useCallback((mixId: string) => {
    setSoundMixes(prev => prev.filter(mix => mix.id !== mixId));
  }, []);

  const resetAllSounds = useCallback(() => {
    setSounds(prev => prev.map(sound => ({
      ...sound,
      volume: 0,
      isPlaying: false
    })));
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case 'nature': return <Wind className="w-4 h-4" />;
      case 'ambient': return <Coffee className="w-4 h-4" />;
      case 'focus': return <Heart className="w-4 h-4" />;
      case 'white-noise': return <Volume2 className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case 'nature': return 'text-green-600 bg-green-50 border-green-200';
      case 'ambient': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'focus': return 'text-red-600 bg-red-50 border-red-200';
      case 'white-noise': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  }, []);

  const filteredSounds = sounds.filter(sound => 
    selectedCategory === 'all' || sound.category === selectedCategory
  );

  const activeSoundsCount = sounds.filter(sound => sound.volume > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Music className="w-6 h-6" />
            Ambient Sounds
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGlobalMute(!isGlobalMute)}
                className={`p-2 rounded-lg transition-colors ${
                  isGlobalMute ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isGlobalMute ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="text-sm text-gray-600">
                {activeSoundsCount} active
              </span>
            </div>
            <button
              onClick={resetAllSounds}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>
        </div>

        {/* Master Volume */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Master Volume</span>
            <span className="text-sm text-gray-600">{Math.round(masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={masterVolume}
            onChange={(e) => {
              const volume = parseFloat(e.target.value);
              setMasterVolume(volume);
              onVolumeChange?.(volume);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {['nature', 'ambient', 'focus', 'white-noise'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === category 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(category)}
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sound Mixes */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Star className="w-5 h-5" />
            Saved Mixes
          </h3>
          <button
            onClick={() => setShowSaveMix(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Current Mix
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soundMixes.map(mix => (
            <motion.div
              key={mix.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-black">{mix.name}</h4>
                <button
                  onClick={() => deleteSoundMix(mix.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">
                  {mix.sounds.length} sounds
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(mix.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => loadSoundMix(mix)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-semibold"
              >
                Load Mix
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sounds Grid */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Sound Library
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredSounds.map((sound, index) => {
            const Icon = sound.icon;
            
            return (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  sound.isPlaying && sound.volume > 0
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div 
                    className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      sound.isPlaying && sound.volume > 0 ? 'animate-pulse' : ''
                    }`}
                    style={{ backgroundColor: sound.color + '20' }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: sound.color }}
                    />
                  </div>
                  
                  <h4 className="font-semibold text-black mb-2">{sound.name}</h4>
                  
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mb-3 ${getCategoryColor(sound.category)}`}>
                    {getCategoryIcon(sound.category)}
                    {sound.category.charAt(0).toUpperCase() + sound.category.slice(1).replace('-', ' ')}
                  </div>
                  
                  <button
                    onClick={() => toggleSound(sound.id)}
                    className={`w-full mb-3 p-2 rounded-lg transition-colors ${
                      sound.isPlaying && sound.volume > 0
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {sound.isPlaying && sound.volume > 0 ? (
                      <Pause className="w-4 h-4 mx-auto" />
                    ) : (
                      <Play className="w-4 h-4 mx-auto" />
                    )}
                  </button>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Volume</span>
                      <span>{Math.round(sound.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sound.volume}
                      onChange={(e) => updateSoundVolume(sound.id, parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Save Mix Modal */}
      <AnimatePresence>
        {showSaveMix && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveMix(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-black mb-4">Save Sound Mix</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mix Name
                  </label>
                  <input
                    type="text"
                    value={newMixName}
                    onChange={(e) => setNewMixName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Deep Focus, Creative Flow"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Mix
                  </label>
                  <div className="space-y-2">
                    {sounds.filter(sound => sound.volume > 0).map(sound => (
                      <div key={sound.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-black">{sound.name}</span>
                        <span className="text-sm text-gray-600">{Math.round(sound.volume * 100)}%</span>
                      </div>
                    ))}
                    {sounds.filter(sound => sound.volume > 0).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No sounds active</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSaveMix(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentMix}
                  disabled={!newMixName.trim() || sounds.filter(sound => sound.volume > 0).length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Mix
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AmbientSounds.displayName = 'AmbientSounds';

export default AmbientSounds;
