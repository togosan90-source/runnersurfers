import { useState, useRef, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Award, Ruler, Flame, Clock, TrendingUp, LogOut, Edit2, Star, Zap, Trophy, Coins, Camera, Save, Check } from 'lucide-react';
import trophyGold from '@/assets/trophy-gold.png';
import coinsGold from '@/assets/coins-gold.png';
import { BottomNav } from '@/components/layout/BottomNav';
import { ExpBar } from '@/components/game/ExpBar';
import { useGameStore, getRank, getReputationLevel, SHOES, getTotalShoeBonus } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { 
    user, 
    setUser,
    runs, 
    ownedShoes,
    streak,
    addSkillPoint
  } = useGameStore();
  const { signOut } = useAuth();
  const { profile, fetchProfile, syncProfileFromStore } = useProfile();
  const { uploadAvatar, uploading } = useAvatarUpload();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newUsername, setNewUsername] = useState(user.username);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsSaved, setSkillsSaved] = useState(false);

  const rank = getRank(user.level);
  const reputationLevel = getReputationLevel(user.reputation);
  const shoeBonus = getTotalShoeBonus(ownedShoes);
  const totalDistance = runs.reduce((sum, r) => sum + r.distance, 0);
  const totalCalories = runs.reduce((sum, r) => sum + r.calories, 0);
  const totalDuration = runs.reduce((sum, r) => sum + r.duration, 0);

  const equippedShoeData = SHOES.find(s => s.id === user.equippedShoes);

  // Get rank color
  const getRankColor = (color: string) => {
    const colors: Record<string, string> = {
      warrior: 'text-slate-400 bg-slate-400/10',
      elite: 'text-blue-400 bg-blue-400/10',
      master: 'text-yellow-500 bg-yellow-500/10',
      grandmaster: 'text-amber-600 bg-amber-600/10',
      epic: 'text-orange-500 bg-orange-500/10',
      mythic: 'text-purple-500 bg-purple-500/10',
      mythical: 'text-cyan-400 bg-cyan-400/10',
    };
    return colors[color] || 'text-slate-400 bg-slate-400/10';
  };

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      setUser({ username: newUsername.trim() });
      setIsEditing(false);
      toast.success('Nome aggiornato!');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast.success('Logout effettuato');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSaveSkills = async () => {
    setIsSavingSkills(true);
    try {
      await syncProfileFromStore();
      setSkillsSaved(true);
      toast.success('Punti skill salvati!');
      setTimeout(() => setSkillsSaved(false), 2000);
    } catch (error) {
      toast.error('Errore nel salvataggio');
    }
    setIsSavingSkills(false);
  };

  // Mock badges
  const badges = [
    { icon: '🏃', name: 'First Run', unlocked: runs.length >= 1 },
    { icon: '🔥', name: '10 Runs', unlocked: runs.length >= 10 },
    { icon: '⭐', name: 'Level 10', unlocked: user.level >= 10 },
    { icon: '💎', name: 'Level 50', unlocked: user.level >= 50 },
    { icon: '🎯', name: '50km Total', unlocked: totalDistance >= 50 },
    { icon: '👑', name: '100km Total', unlocked: totalDistance >= 100 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Card */}
        {/* Cyberpunk Profile Card */}
        <div
          className="relative p-4 sm:p-6 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(6, 182, 212, 0.1) 100%)',
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
          }}
        >
          {/* Animated scan lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-pulse" style={{ top: '20%' }} />
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse" style={{ top: '60%' }} />
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/80" />
          <div className="absolute top-0 right-4 w-4 h-4 border-r-2 border-t-2 border-cyan-500/80" />
          <div className="absolute bottom-0 left-4 w-4 h-4 border-l-2 border-b-2 border-cyan-500/80" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/80" />

          {/* Glowing border lines */}
          <div className="absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <div className="absolute left-0 top-5 bottom-5 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent" />
          <div className="absolute right-0 top-5 bottom-5 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent" />

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 relative z-10">
            <div className="relative">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const newUrl = await uploadAvatar(file);
                    if (newUrl) {
                      await fetchProfile();
                    }
                  }
                }}
              />
              
              {/* Avatar with hexagonal glow */}
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden group cursor-pointer"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/50 to-purple-500/50 animate-pulse" />
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover relative z-10"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-slate-900 flex items-center justify-center relative z-10">
                    <User className="w-12 h-12 text-cyan-400" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <Camera className="w-8 h-8 text-cyan-400" />
                </div>
                
                {/* Loading indicator */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </motion.button>

              {/* Level badge */}
              <motion.div 
                className="absolute -bottom-2 -right-2 px-3 py-1 flex items-center justify-center font-mono text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
                  clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)',
                  color: 'white',
                  textShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                LV.{user.level}
              </motion.div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 
                  className="font-mono text-xl sm:text-2xl font-bold tracking-wider uppercase"
                  style={{
                    color: '#22D3EE',
                    textShadow: '0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)',
                  }}
                >
                  {user.username}
                </h1>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-cyan-400 hover:text-cyan-300"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifica Nome</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Il tuo nome..."
                      />
                      <Button onClick={handleSaveUsername} className="w-full">
                        Salva
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Rank Badge - Cyberpunk Style */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 mb-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
                  border: '1px solid rgba(251, 191, 36, 0.5)',
                }}
              >
                <span className="text-lg">{rank.icon}</span>
                <span 
                  className="font-mono text-sm font-bold uppercase tracking-wider"
                  style={{
                    color: '#FCD34D',
                    textShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                  }}
                >
                  {rank.name}
                </span>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)' }} />
              </div>

              {/* EXP Bar - Cyberpunk Style */}
              <div className="relative mt-3">
                <div 
                  className="h-6 overflow-hidden relative"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 50%, calc(100% - 4px) 100%, 4px 100%, 0% 50%)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                  }}
                >
                  <motion.div 
                    className="h-full relative"
                    style={{
                      width: `${(user.exp / (user.level * 100)) * 100}%`,
                      background: 'linear-gradient(90deg, #06B6D4 0%, #22D3EE 50%, #67E8F9 100%)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.exp / (user.level * 100)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {/* EXP Text overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-white" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
                      {user.exp}/{user.level * 100} EXP
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xs text-cyan-400/70">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    {((user.exp / (user.level * 100)) * 100).toFixed(0)}%
                  </span>
                  <span className="font-mono text-xs text-cyan-400/70">Prossimo livello</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Cyberpunk Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10">
            {/* Score */}
            <motion.div 
              className="relative p-3 sm:p-4 overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-amber-500/60" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-amber-500/60" />
              
              {/* Scan line */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                  className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
              
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 flex items-center justify-center"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' }} />
                </div>
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-amber-400/80 mb-1">Score</p>
                <p className="font-mono text-sm sm:text-lg font-bold text-amber-300" style={{ textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>
                  {user.totalScore.toLocaleString()}
                </p>
              </div>
              
              {/* Status LED */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(251, 191, 36, 0.8)' }} />
            </motion.div>

            {/* Coins */}
            <motion.div 
              className="relative p-3 sm:p-4 overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-green-500/60" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-green-500/60" />
              
              {/* Scan line */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                  className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-green-400/40 to-transparent"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
              </div>
              
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 flex items-center justify-center"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' }} />
                </div>
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-green-400/80 mb-1">Monete</p>
                <p className="font-mono text-sm sm:text-lg font-bold text-green-300" style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}>
                  {user.coins.toLocaleString()}
                </p>
              </div>
              
              {/* Status LED */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(34, 197, 94, 0.8)' }} />
            </motion.div>

            {/* Runs */}
            <motion.div 
              className="relative p-3 sm:p-4 overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-purple-500/60" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-purple-500/60" />
              
              {/* Scan line */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                  className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
              </div>
              
              <div className="relative z-10">
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 flex items-center justify-center text-2xl sm:text-3xl"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }}
                >
                  🏃
                </motion.div>
                <p className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-purple-400/80 mb-1">Corse</p>
                <p className="font-mono text-sm sm:text-lg font-bold text-purple-300" style={{ textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}>
                  {runs.length}
                </p>
              </div>
              
              {/* Status LED */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(168, 85, 247, 0.8)' }} />
            </motion.div>
          </div>
        </div>

        {/* Skill Points Section - Always visible to show invested points */}
        {(user.skillPoints > 0 || user.skillCoins > 0 || user.skillScore > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5 mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #164E63 100%)',
              border: '3px solid #22D3EE',
              boxShadow: '0 4px 0 0 #0E7490, 0 0 30px rgba(34, 211, 238, 0.4)',
            }}
          >
            {/* Decorative elements */}
            <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '10%', top: '15%', filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.8))' }}>⚡</div>
            <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '85%', top: '20%', filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.8))' }}>✨</div>
            <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '75%', top: '70%', filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.8))' }}>💎</div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                    border: '2px solid #67E8F9',
                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(34, 211, 238, 0.6)',
                      '0 0 35px rgba(34, 211, 238, 0.9)',
                      '0 0 20px rgba(34, 211, 238, 0.6)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Zap className="w-7 h-7" style={{ color: '#ECFEFF', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' }} />
                </motion.div>
                <div>
                  <h3 
                    className="font-varsity text-lg uppercase tracking-wide"
                    style={{
                      color: '#ECFEFF',
                      textShadow: '2px 2px 0px #164E63, 0 0 15px rgba(236, 254, 255, 0.5)',
                    }}
                  >
                    Punti Skill
                  </h3>
                  <p className="text-xs" style={{ color: '#A5F3FC' }}>
                    Ogni punto = +0.05% bonus!
                  </p>
                </div>
              </div>
              
              <motion.div 
                className="flex flex-col items-center justify-center px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid rgba(34, 211, 238, 0.5)',
                }}
                animate={{
                  scale: user.skillPoints > 0 ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: user.skillPoints > 0 ? Infinity : 0,
                }}
              >
                <span 
                  className="font-display text-3xl font-bold"
                  style={{
                    color: '#FCD34D',
                    textShadow: '0 0 15px rgba(252, 211, 77, 0.6)',
                  }}
                >
                  {user.skillPoints}
                </span>
                <span className="text-[10px] uppercase font-bold" style={{ color: '#A5F3FC' }}>Disponibili</span>
              </motion.div>
            </div>

            {/* Skill Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
              {/* Coins Skill */}
              <motion.div 
                className="rounded-xl p-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                  border: '2px solid #FCD34D',
                  boxShadow: '0 2px 0 0 #B45309, 0 0 15px rgba(252, 211, 77, 0.3)',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.2) 50%, transparent 100%)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                          boxShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                        }}
                      >
                        <Coins className="w-5 h-5" style={{ color: '#78350F' }} />
                      </div>
                      <span 
                        className="font-varsity uppercase text-sm"
                        style={{ color: '#FEF3C7' }}
                      >
                        Monete
                      </span>
                    </div>
                  </div>
                  <p 
                    className="font-display text-2xl font-bold mb-3 text-center"
                    style={{
                      color: '#FCD34D',
                      textShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                    }}
                  >
                    +{user.skillCoins.toFixed(2)}%
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full font-bold"
                    onClick={() => addSkillPoint('coins')}
                    disabled={user.skillPoints <= 0}
                    style={{
                      background: user.skillPoints > 0 
                        ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                        : undefined,
                      color: user.skillPoints > 0 ? '#78350F' : undefined,
                      border: user.skillPoints > 0 ? '2px solid #FEF3C7' : undefined,
                      boxShadow: user.skillPoints > 0 ? '0 2px 0 0 #B45309' : undefined,
                    }}
                  >
                    +0.05%
                  </Button>
                </div>
              </motion.div>

              {/* Score Skill */}
              <motion.div 
                className="rounded-xl p-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                  border: '2px solid #A855F7',
                  boxShadow: '0 2px 0 0 #6D28D9, 0 0 15px rgba(168, 85, 247, 0.3)',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
                          boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                        }}
                      >
                        <Trophy className="w-5 h-5" style={{ color: '#F3E8FF' }} />
                      </div>
                      <span 
                        className="font-varsity uppercase text-sm"
                        style={{ color: '#F3E8FF' }}
                      >
                        Score
                      </span>
                    </div>
                  </div>
                  <p 
                    className="font-display text-2xl font-bold mb-3 text-center"
                    style={{
                      color: '#C084FC',
                      textShadow: '0 0 10px rgba(192, 132, 252, 0.5)',
                    }}
                  >
                    +{user.skillScore.toFixed(2)}%
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full font-bold"
                    onClick={() => addSkillPoint('score')}
                    disabled={user.skillPoints <= 0}
                    style={{
                      background: user.skillPoints > 0 
                        ? 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)'
                        : undefined,
                      color: user.skillPoints > 0 ? '#F3E8FF' : undefined,
                      border: user.skillPoints > 0 ? '2px solid #C4B5FD' : undefined,
                      boxShadow: user.skillPoints > 0 ? '0 2px 0 0 #6D28D9' : undefined,
                    }}
                  >
                    +0.05%
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative z-10"
            >
              <Button
                size="sm"
                className="w-full gap-2 font-bold"
                onClick={handleSaveSkills}
                disabled={isSavingSkills}
                style={{
                  background: skillsSaved 
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                  color: '#ECFEFF',
                  border: skillsSaved ? '2px solid #86EFAC' : '2px solid #67E8F9',
                  boxShadow: skillsSaved 
                    ? '0 2px 0 0 #166534, 0 0 15px rgba(34, 197, 94, 0.4)'
                    : '0 2px 0 0 #0E7490, 0 0 15px rgba(34, 211, 238, 0.4)',
                }}
              >
                {isSavingSkills ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="w-4 h-4" />
                    </motion.div>
                    Salvataggio...
                  </>
                ) : skillsSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Salvato!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salva Progressi
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Reputation Section */}
        <div
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 50%, #2E1065 100%)',
            border: '3px solid #A78BFA',
            boxShadow: '0 4px 0 0 #5B21B6, 0 0 30px rgba(167, 139, 250, 0.4)',
          }}
        >
          {/* Static decorative elements */}
          <div className="absolute text-sm pointer-events-none opacity-50" style={{ left: '15%', top: '20%', filter: 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.8))' }}>⭐</div>
          <div className="absolute text-sm pointer-events-none opacity-50" style={{ left: '75%', top: '30%', filter: 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.8))' }}>✨</div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
                border: '2px solid #C4B5FD',
                boxShadow: '0 0 20px rgba(167, 139, 250, 0.6)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Star className="w-7 h-7" style={{ color: '#FEF3C7', filter: 'drop-shadow(0 0 8px rgba(254, 243, 199, 0.8))' }} />
            </motion.div>
            <div>
              <h3 
                className="font-varsity text-xl uppercase tracking-wide"
                style={{
                  color: '#E9D5FF',
                  textShadow: '2px 2px 0px #4C1D95, 0 0 15px rgba(233, 213, 255, 0.5)',
                }}
              >
                Reputazione
              </h3>
              <motion.span 
                className="px-2 py-0.5 rounded-md text-xs font-bold uppercase"
                style={{
                  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                  color: '#78350F',
                  boxShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                LV.{reputationLevel.level}
              </motion.span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between relative z-10">
            <div 
              className="rounded-xl px-4 py-3"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid rgba(167, 139, 250, 0.4)',
              }}
            >
              <p 
                className="font-varsity text-2xl uppercase"
                style={{
                  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 10px rgba(252, 211, 77, 0.5))',
                }}
              >
                {reputationLevel.name}
              </p>
              <p 
                className="text-sm font-semibold"
                style={{ color: '#C4B5FD' }}
              >
                {user.reputation.toLocaleString()} punti
              </p>
            </div>

            {/* Level Circle */}
            <motion.div 
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
                border: '3px solid #C4B5FD',
                boxShadow: '0 0 25px rgba(167, 139, 250, 0.6), inset 0 2px 0 rgba(255,255,255,0.2)',
              }}
              animate={{
                boxShadow: [
                  '0 0 25px rgba(167, 139, 250, 0.6), inset 0 2px 0 rgba(255,255,255,0.2)',
                  '0 0 40px rgba(167, 139, 250, 0.8), inset 0 2px 0 rgba(255,255,255,0.2)',
                  '0 0 25px rgba(167, 139, 250, 0.6), inset 0 2px 0 rgba(255,255,255,0.2)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <span 
                className="font-display text-2xl font-bold"
                style={{
                  color: 'white',
                  textShadow: '0 0 10px rgba(255,255,255,0.5)',
                }}
              >
                {reputationLevel.level}
              </span>
              <span 
                className="text-[10px] uppercase font-bold"
                style={{ color: '#E9D5FF' }}
              >
                Livello
              </span>
            </motion.div>
          </div>
        </div>

        {/* Equipped Gear */}
        <div
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 50%, #0C4A6E 100%)',
            border: '3px solid #38BDF8',
            boxShadow: '0 4px 0 0 #075985, 0 0 30px rgba(56, 189, 248, 0.4)',
          }}
        >
          {/* Static decorative elements */}
          <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '20%', top: '25%', filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))' }}>👟</div>
          <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '70%', top: '15%', filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))' }}>⚡</div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
                border: '2px solid #7DD3FC',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)',
              }}
            >
              👟
            </div>
            <h3
              className="font-varsity text-xl uppercase tracking-wide"
              style={{
                color: '#E0F2FE',
                textShadow: '2px 2px 0px #0C4A6E, 0 0 15px rgba(224, 242, 254, 0.5)',
              }}
            >
              Equipaggiamento Attivo
            </h3>
          </div>

          {/* Equipped Shoe */}
          {equippedShoeData && (
            <motion.div 
              className="flex items-center gap-4 mb-4 rounded-xl p-3 relative z-10"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '2px solid rgba(56, 189, 248, 0.4)',
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{
                  background: equippedShoeData.id === 'avalon' ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' :
                    equippedShoeData.id === 'zeus' ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' :
                    equippedShoeData.id === 'woodblas' ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' :
                    equippedShoeData.id === 'energy' ? 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' :
                    'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 0 15px rgba(255,255,255,0.2)',
                }}
              >
                {equippedShoeData.icon}
              </div>
              <div>
                <p 
                  className="font-varsity text-lg uppercase"
                  style={{
                    color: '#FEF3C7',
                    textShadow: '0 0 10px rgba(254, 243, 199, 0.5)',
                  }}
                >
                  {equippedShoeData.name}
                </p>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: '#7DD3FC' }}
                >
                  +{equippedShoeData.coinBonus}% Monete, +{equippedShoeData.expBonus}% EXP
                </p>
              </div>
            </motion.div>
          )}

          {/* Bonus Stats Grid */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            {/* Bonus Monete */}
            <div 
              className="rounded-xl p-4 text-center relative overflow-hidden hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                border: '2px solid #FCD34D',
                boxShadow: '0 2px 0 0 #B45309, 0 0 15px rgba(252, 211, 77, 0.3)',
              }}
            >
              <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center relative z-10">
                <Coins className="w-7 h-7" style={{ color: '#FCD34D', filter: 'drop-shadow(0 0 8px rgba(252, 211, 77, 0.6))' }} />
              </div>
              <p 
                className="font-display text-2xl font-bold relative z-10"
                style={{
                  color: '#FEF3C7',
                  textShadow: '0 0 10px rgba(254, 243, 199, 0.5)',
                }}
              >
                +{shoeBonus.coinBonus}%
              </p>
              <p 
                className="text-xs font-semibold uppercase relative z-10"
                style={{ color: '#FCD34D' }}
              >
                Bonus Monete
              </p>
            </div>

            {/* Bonus EXP */}
            <div 
              className="rounded-xl p-4 text-center relative overflow-hidden hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.25) 0%, rgba(34, 197, 94, 0.25) 100%)',
                border: '2px solid #4ADE80',
                boxShadow: '0 2px 0 0 #166534, 0 0 15px rgba(74, 222, 128, 0.3)',
              }}
            >
              <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center relative z-10">
                <Zap className="w-7 h-7" style={{ color: '#4ADE80', filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))' }} />
              </div>
              <p 
                className="font-display text-2xl font-bold relative z-10"
                style={{
                  color: '#86EFAC',
                  textShadow: '0 0 10px rgba(134, 239, 172, 0.5)',
                }}
              >
                +{shoeBonus.expBonus}%
              </p>
              <p 
                className="text-xs font-semibold uppercase relative z-10"
                style={{ color: '#4ADE80' }}
              >
                Bonus EXP
              </p>
            </div>
          </div>
        </div>

        {/* Total Stats */}
        <div
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)',
            border: '3px solid #FCD34D',
            boxShadow: '0 4px 0 0 #78350F, 0 0 30px rgba(252, 211, 77, 0.4)',
          }}
        >
          {/* Static decorative elements */}
          <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '15%', top: '15%', filter: 'drop-shadow(0 0 6px rgba(252, 211, 77, 0.8))' }}>🏆</div>
          <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '80%', top: '25%', filter: 'drop-shadow(0 0 6px rgba(252, 211, 77, 0.8))' }}>⭐</div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                border: '2px solid #FEF3C7',
                boxShadow: '0 0 20px rgba(252, 211, 77, 0.6)',
              }}
            >
              <Award className="w-7 h-7" style={{ color: '#78350F', filter: 'drop-shadow(0 0 8px rgba(252, 211, 77, 0.8))' }} />
            </div>
            <h3 
              className="font-varsity text-xl uppercase tracking-wide"
              style={{
                color: '#FEF3C7',
                textShadow: '2px 2px 0px #78350F, 0 0 15px rgba(254, 243, 199, 0.5)',
              }}
            >
              Statistiche Totali
            </h3>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            {/* Distance */}
            <motion.div 
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '2px solid rgba(252, 211, 77, 0.4)',
              }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5" style={{ color: '#93C5FD', filter: 'drop-shadow(0 0 6px rgba(147, 197, 253, 0.6))' }} />
                <div>
                  <p 
                    className="font-display text-lg font-bold"
                    style={{ color: '#FEF3C7' }}
                  >
                    {user.totalDistance.toFixed(1)} km
                  </p>
                  <p className="text-xs" style={{ color: '#FCD34D' }}>Percorsi</p>
                </div>
              </div>
            </motion.div>

            {/* Calories */}
            <motion.div 
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '2px solid rgba(252, 211, 77, 0.4)',
              }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" style={{ color: '#F87171', filter: 'drop-shadow(0 0 6px rgba(248, 113, 113, 0.6))' }} />
                <div>
                  <p 
                    className="font-display text-lg font-bold"
                    style={{ color: '#FEF3C7' }}
                  >
                    {totalCalories.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: '#FCD34D' }}>Kcal bruciate</p>
                </div>
              </div>
            </motion.div>

            {/* Duration */}
            <motion.div 
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '2px solid rgba(252, 211, 77, 0.4)',
              }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#FBBF24', filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))' }} />
                <div>
                  <p 
                    className="font-display text-lg font-bold"
                    style={{ color: '#FEF3C7' }}
                  >
                    {formatDuration(totalDuration)}
                  </p>
                  <p className="text-xs" style={{ color: '#FCD34D' }}>Totali</p>
                </div>
              </div>
            </motion.div>

            {/* Streak */}
            <motion.div 
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '2px solid rgba(252, 211, 77, 0.4)',
              }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#4ADE80', filter: 'drop-shadow(0 0 6px rgba(74, 222, 128, 0.6))' }} />
                <div>
                  <p 
                    className="font-display text-lg font-bold"
                    style={{ color: '#FEF3C7' }}
                  >
                    {user.streakDays} giorni
                  </p>
                  <p className="text-xs" style={{ color: '#FCD34D' }}>Streak</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Badges */}
        <div
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 50%, #831843 100%)',
            border: '3px solid #F472B6',
            boxShadow: '0 4px 0 0 #9D174D, 0 0 30px rgba(244, 114, 182, 0.4)',
          }}
        >
          {/* Static decorative elements */}
          <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '15%', top: '20%', filter: 'drop-shadow(0 0 6px rgba(244, 114, 182, 0.8))' }}>🏅</div>
          <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '75%', top: '15%', filter: 'drop-shadow(0 0 6px rgba(244, 114, 182, 0.8))' }}>🎖️</div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
                border: '2px solid #FBCFE8',
                boxShadow: '0 0 20px rgba(244, 114, 182, 0.6)',
              }}
            >
              🏅
            </div>
            <h3 
              className="font-varsity text-xl uppercase tracking-wide"
              style={{
                color: '#FDF2F8',
                textShadow: '2px 2px 0px #831843, 0 0 15px rgba(253, 242, 248, 0.5)',
              }}
            >
              Badge e Achievement
            </h3>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-6 gap-3 relative z-10">
            {badges.map((badge, i) => (
              <motion.div
                key={i}
                className="aspect-square rounded-xl flex items-center justify-center text-2xl relative overflow-hidden"
                style={{
                  background: badge.unlocked 
                    ? 'linear-gradient(135deg, rgba(252, 211, 77, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)'
                    : 'rgba(0,0,0,0.3)',
                  border: badge.unlocked 
                    ? '2px solid #FCD34D'
                    : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: badge.unlocked 
                    ? '0 0 15px rgba(252, 211, 77, 0.4)'
                    : 'none',
                  opacity: badge.unlocked ? 1 : 0.5,
                }}
                whileHover={{ scale: badge.unlocked ? 1.1 : 1 }}
                title={badge.name}
              >
                {badge.unlocked && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.3) 50%, transparent 100%)',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                )}
                <span 
                  className="relative z-10"
                  style={{
                    filter: badge.unlocked 
                      ? 'drop-shadow(0 0 8px rgba(252, 211, 77, 0.6))'
                      : 'grayscale(100%)',
                  }}
                >
                  {badge.icon}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Achievement Counter */}
          <motion.div 
            className="mt-4 text-center relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p 
              className="text-sm font-semibold"
              style={{ color: '#FBCFE8' }}
            >
              {badges.filter(b => b.unlocked).length}/{badges.length} Sbloccati
            </p>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="w-4 h-4" />
            Impostazioni
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
