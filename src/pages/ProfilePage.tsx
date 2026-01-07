import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Award, Ruler, Flame, Clock, TrendingUp, LogOut, Edit2, Star, Zap, Trophy, Coins, Camera } from 'lucide-react';
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
  const { profile, fetchProfile } = useProfile();
  const { uploadAvatar, uploading } = useAvatarUpload();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newUsername, setNewUsername] = useState(user.username);
  const [isEditing, setIsEditing] = useState(false);

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
            border: '3px solid #60A5FA',
            boxShadow: '0 4px 0 0 #1E40AF, 0 0 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated Stars */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm pointer-events-none"
              initial={{ 
                x: `${5 + i * 10}%`, 
                y: '100%',
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                scale: [0.5, 1, 0.8],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
              }}
            >
              {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
            </motion.div>
          ))}

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Avatar and Name */}
          <div className="flex items-start gap-4 mb-6 relative z-10">
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
              
              {/* Avatar with click to change */}
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg group cursor-pointer"
                style={{
                  border: '4px solid #60A5FA',
                  boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)',
                }}
                whileHover={{ scale: 1.05 }}
              >
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-12 h-12 text-primary-foreground" />
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                
                {/* Loading indicator */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </motion.button>
              
              <motion.div 
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                  border: '2px solid #93C5FD',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {rank.icon}
              </motion.div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 
                  className="font-varsity text-2xl uppercase tracking-wide"
                  style={{
                    color: '#93C5FD',
                    textShadow: '2px 2px 0px #1E3A5F, 0 0 10px rgba(147, 197, 253, 0.5)',
                  }}
                >
                  {user.username}
                </h1>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      style={{ color: '#93C5FD' }}
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
              
              <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                  border: '2px solid rgba(96, 165, 250, 0.5)',
                }}
              >
                <span className="text-xl">{rank.icon}</span>
                <span 
                  className="font-varsity text-lg uppercase"
                  style={{
                    color: '#FCD34D',
                    textShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                  }}
                >
                  {rank.name}
                </span>
              </motion.div>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <motion.span 
                  className="px-3 py-1.5 rounded-lg font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                    border: '2px solid #60A5FA',
                    color: 'white',
                    boxShadow: '0 2px 0 0 #1E3A5F, 0 0 10px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  LV.{user.level}
                </motion.span>
                <span 
                  className="flex items-center gap-1 text-sm font-semibold"
                  style={{ color: '#93C5FD' }}
                >
                  {rank.icon} {rank.name}
                </span>
                <motion.span 
                  className="ml-auto font-varsity text-sm uppercase px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
                    border: '2px solid #86EFAC',
                    boxShadow: '0 2px 0 0 #166534, 0 0 15px rgba(74, 222, 128, 0.4)',
                    color: 'white',
                    textShadow: '1px 1px 0px #15803D',
                  }}
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {user.exp}/{user.level * 100} EXP
                </motion.span>
              </div>

              {/* EXP Progress Bar */}
              <div 
                className="mt-3 h-3 rounded-full overflow-hidden relative"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid rgba(96, 165, 250, 0.3)',
                }}
              >
                <motion.div 
                  className="h-full rounded-full"
                  style={{
                    width: `${(user.exp / (user.level * 100)) * 100}%`,
                    background: 'linear-gradient(90deg, #4ADE80 0%, #22C55E 50%, #16A34A 100%)',
                    boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.exp / (user.level * 100)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              <motion.span 
                className="font-bold text-xs px-3 py-1 rounded-lg mt-2 inline-flex items-center gap-1"
                style={{
                  background: 'rgba(74, 222, 128, 0.2)',
                  border: '1px solid #4ADE80',
                  color: '#4ADE80',
                }}
              >
                <TrendingUp className="w-3 h-3" />
                {((user.exp / (user.level * 100)) * 100).toFixed(0)}% - Prossimo livello
              </motion.span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center relative z-10">
            {/* Score */}
            <motion.div 
              className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                border: '2px solid #FCD34D',
                boxShadow: '0 2px 0 0 #B45309, 0 0 15px rgba(252, 211, 77, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.2) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              />
              <div className="w-12 h-12 mb-2 mx-auto relative z-10 flex items-center justify-center">
                <Trophy className="w-10 h-10" style={{ color: '#FCD34D', filter: 'drop-shadow(0 0 10px rgba(252, 211, 77, 0.5))' }} />
              </div>
              <p 
                className="font-varsity text-lg uppercase relative z-10"
                style={{
                  color: '#FCD34D',
                  textShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                }}
              >
                Score Totale
              </p>
              <p 
                className="font-display text-xl font-bold relative z-10"
                style={{
                  color: '#FEF3C7',
                  textShadow: '0 0 10px rgba(254, 243, 199, 0.5)',
                }}
              >
                {user.totalScore.toLocaleString()}
              </p>
            </motion.div>

            {/* Coins */}
            <motion.div 
              className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)',
                border: '2px solid #4ADE80',
                boxShadow: '0 2px 0 0 #166534, 0 0 15px rgba(74, 222, 128, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.2) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              <div className="w-12 h-12 mb-2 mx-auto relative z-10 flex items-center justify-center">
                <Coins className="w-10 h-10" style={{ color: '#4ADE80', filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.5))' }} />
              </div>
              <p 
                className="font-varsity text-lg uppercase relative z-10"
                style={{
                  color: '#4ADE80',
                  textShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                }}
              >
                Monete
              </p>
              <p 
                className="font-display text-xl font-bold relative z-10"
                style={{
                  color: '#86EFAC',
                  textShadow: '0 0 10px rgba(134, 239, 172, 0.5)',
                }}
              >
                {user.coins.toLocaleString()}
              </p>
            </motion.div>

            {/* Runs */}
            <motion.div 
              className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                border: '2px solid #A78BFA',
                boxShadow: '0 2px 0 0 #6D28D9, 0 0 15px rgba(167, 139, 250, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(167, 139, 250, 0.2) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
              <motion.span 
                className="text-4xl block mb-2 relative z-10"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: 'drop-shadow(0 0 10px rgba(167, 139, 250, 0.5))' }}
              >
                🏃
              </motion.span>
              <p 
                className="font-varsity text-lg uppercase relative z-10"
                style={{
                  color: '#A78BFA',
                  textShadow: '0 0 10px rgba(167, 139, 250, 0.5)',
                }}
              >
                Corse
              </p>
              <p 
                className="font-display text-xl font-bold relative z-10"
                style={{
                  color: '#C4B5FD',
                  textShadow: '0 0 10px rgba(196, 181, 253, 0.5)',
                }}
              >
                {runs.length}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Skill Points Section - Always visible to show invested points */}
        {(user.skillPoints > 0 || user.skillCoins > 0 || user.skillScore > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-4 border border-accent/20 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-bold">Punti Skill Disponibili</span>
              </div>
              <span className="font-display text-2xl font-bold text-accent">{user.skillPoints}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Ogni livello guadagni 3 punti skill. Ogni punto = +1% bonus!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm flex items-center gap-1">
                    <Coins className="w-4 h-4 text-gold" />
                    Monete
                  </span>
                  <span className="font-bold text-gold">+{user.skillCoins}%</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => addSkillPoint('coins')}
                  disabled={user.skillPoints <= 0}
                >
                  +1 Punto
                </Button>
              </div>
              <div className="bg-card rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-primary" />
                    Score
                  </span>
                  <span className="font-bold text-primary">+{user.skillScore}%</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => addSkillPoint('score')}
                  disabled={user.skillPoints <= 0}
                >
                  +1 Punto
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reputation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 50%, #2E1065 100%)',
            border: '3px solid #A78BFA',
            boxShadow: '0 4px 0 0 #5B21B6, 0 0 30px rgba(167, 139, 250, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm pointer-events-none"
              initial={{ 
                x: `${10 + i * 12}%`, 
                y: '100%',
                opacity: 0,
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.8))'
              }}
            >
              {i % 4 === 0 ? '⭐' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '💎' : '🌟'}
            </motion.div>
          ))}

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

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
        </motion.div>

        {/* Equipped Gear */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 50%, #0C4A6E 100%)',
            border: '3px solid #38BDF8',
            boxShadow: '0 4px 0 0 #075985, 0 0 30px rgba(56, 189, 248, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg pointer-events-none"
              initial={{ 
                x: `${15 + i * 15}%`, 
                y: '100%',
                opacity: 0,
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 3.5 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))'
              }}
            >
              {i % 3 === 0 ? '👟' : i % 3 === 1 ? '⚡' : '💨'}
            </motion.div>
          ))}

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
                border: '2px solid #7DD3FC',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              👟
            </motion.div>
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
            <motion.div 
              className="rounded-xl p-4 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                border: '2px solid #FCD34D',
                boxShadow: '0 2px 0 0 #B45309, 0 0 15px rgba(252, 211, 77, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.2) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              />
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
            </motion.div>

            {/* Bonus EXP */}
            <motion.div 
              className="rounded-xl p-4 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.25) 0%, rgba(34, 197, 94, 0.25) 100%)',
                border: '2px solid #4ADE80',
                boxShadow: '0 2px 0 0 #166534, 0 0 15px rgba(74, 222, 128, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.2) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
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
            </motion.div>
          </div>
        </motion.div>

        {/* Total Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)',
            border: '3px solid #FCD34D',
            boxShadow: '0 4px 0 0 #78350F, 0 0 30px rgba(252, 211, 77, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg pointer-events-none"
              initial={{ 
                x: `${10 + i * 12}%`, 
                y: '100%',
                opacity: 0,
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(252, 211, 77, 0.8))'
              }}
            >
              {i % 4 === 0 ? '🏆' : i % 4 === 1 ? '⭐' : i % 4 === 2 ? '🔥' : '💪'}
            </motion.div>
          ))}

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                border: '2px solid #FEF3C7',
                boxShadow: '0 0 20px rgba(252, 211, 77, 0.6)',
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
              <Award className="w-7 h-7" style={{ color: '#78350F', filter: 'drop-shadow(0 0 4px rgba(254, 243, 199, 0.8))' }} />
            </motion.div>
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
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 50%, #831843 100%)',
            border: '3px solid #F472B6',
            boxShadow: '0 4px 0 0 #9D174D, 0 0 30px rgba(244, 114, 182, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg pointer-events-none"
              initial={{ 
                x: `${15 + i * 15}%`, 
                y: '100%',
                opacity: 0,
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(244, 114, 182, 0.8))'
              }}
            >
              {i % 3 === 0 ? '🏅' : i % 3 === 1 ? '🎖️' : '🌟'}
            </motion.div>
          ))}

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
                border: '2px solid #FBCFE8',
                boxShadow: '0 0 20px rgba(244, 114, 182, 0.6)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🏅
            </motion.div>
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
        </motion.div>

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
