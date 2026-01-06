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
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          {/* Avatar and Name */}
          <div className="flex items-start gap-4 mb-6">
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
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-lg group cursor-pointer"
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
              </button>
              
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center text-xl shadow-md">
                {rank.icon}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 
                  className="font-gothic text-2xl italic"
                  style={{
                    color: 'hsl(var(--foreground))',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.5), -1px -1px 0px rgba(255,255,255,0.3)',
                  }}
                >
                  {user.username}
                </h1>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
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
              
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-gothic text-xl italic"
                style={{
                  color: 'hsl(var(--foreground))',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.5), -1px -1px 0px rgba(255,255,255,0.3)',
                  backgroundColor: 'hsla(var(--muted), 0.3)',
                }}
              >
                {rank.icon} {rank.name}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-primary font-bold text-sm">LV.{user.level}</span>
                <span className="flex items-center gap-1 text-sm">
                  {rank.icon} <span className="font-semibold">{rank.name}</span>
                </span>
                <span 
                  className="ml-auto font-varsity text-sm uppercase px-3 py-1 rounded-md"
                  style={{
                    background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
                    border: '3px solid #15803D',
                    boxShadow: '0 3px 0 0 #166534, inset 0 1px 0 0 rgba(255,255,255,0.3)',
                    color: 'white',
                    textShadow: '2px 2px 0px #15803D, -1px -1px 0px #15803D, 1px -1px 0px #15803D, -1px 1px 0px #15803D',
                  }}
                >
                  {user.exp}/{user.level * 100} EXP
                </span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(user.exp / (user.level * 100)) * 100}%`,
                    background: 'linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--muted-foreground)) 100%)',
                  }}
                />
              </div>
              <span 
                className="font-varsity text-xs uppercase px-3 py-1 rounded-md mt-2 inline-block"
                style={{
                  background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
                  border: '3px solid #15803D',
                  boxShadow: '0 3px 0 0 #166534, inset 0 1px 0 0 rgba(255,255,255,0.3)',
                  color: 'white',
                  textShadow: '2px 2px 0px #15803D, -1px -1px 0px #15803D, 1px -1px 0px #15803D, -1px 1px 0px #15803D',
                }}
              >
                {((user.exp / (user.level * 100)) * 100).toFixed(0)}% - Prossimo livello
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center mt-6">
            <div className="flex flex-col items-center">
              <img src={trophyGold} alt="Trophy" className="w-12 h-12 object-contain mb-2" />
              <p 
                className="font-gothic text-sm"
                style={{
                  color: 'hsl(var(--foreground))',
                  textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
                }}
              >
                Score Totale
              </p>
            </div>
            <div className="flex flex-col items-center">
              <img src={coinsGold} alt="Coins" className="w-12 h-12 object-contain mb-2" />
              <p 
                className="font-gothic text-sm"
                style={{
                  color: 'hsl(var(--foreground))',
                  textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
                }}
              >
                Monete
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p 
                className="font-varsity text-3xl text-accent"
                style={{
                  textShadow: '2px 2px 0px hsl(var(--accent) / 0.5)',
                }}
              >
                {runs.length}
              </p>
              <p 
                className="font-gothic text-sm"
                style={{
                  color: 'hsl(var(--foreground))',
                  textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
                }}
              >
                Corse
              </p>
            </div>
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
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl p-4 border border-purple-500/20 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="font-bold">Reputazione</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-bold text-purple-400">{reputationLevel.name}</p>
              <p className="text-sm text-muted-foreground">{user.reputation.toLocaleString()} punti</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Livello</p>
              <p className="font-display text-2xl font-bold text-purple-400">{reputationLevel.level}</p>
            </div>
          </div>
        </motion.div>

        {/* Equipped Gear */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl p-4 border border-border mb-6"
        >
          <h3 className="font-bold mb-3 flex items-center gap-2">
            👟 Equipaggiamento Attivo
          </h3>
          {equippedShoeData && (
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                equippedShoeData.id === 'avalon' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                equippedShoeData.id === 'zeus' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                equippedShoeData.id === 'woodblas' ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                equippedShoeData.id === 'energy' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                'bg-gradient-to-br from-cyan-400 to-blue-500'
              }`}>
                <span className="text-2xl">{equippedShoeData.icon}</span>
              </div>
              <div>
                <p className="font-bold">{equippedShoeData.name}</p>
                <p className="text-xs text-muted-foreground">
                  +{equippedShoeData.coinBonus}% Monete, +{equippedShoeData.expBonus}% EXP
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-primary">+{shoeBonus.coinBonus}%</p>
              <p className="text-xs text-muted-foreground">Bonus Monete Totale</p>
            </div>
            <div className="bg-accent/10 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-accent">+{shoeBonus.expBonus}%</p>
              <p className="text-xs text-muted-foreground">Bonus EXP Totale</p>
            </div>
          </div>
        </motion.div>

        {/* Total Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 border border-border mb-6"
        >
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-gold" />
            Statistiche Totali
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              <span className="text-sm">{user.totalDistance.toFixed(1)} km percorsi</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-sm">{totalCalories.toLocaleString()} kcal bruciate</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm">{formatDuration(totalDuration)} totali</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm">{user.streakDays} giorni di streak</span>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-4 border border-border mb-6"
        >
          <h3 className="font-bold mb-3">🏅 Badge e Achievement</h3>
          <div className="grid grid-cols-6 gap-2">
            {badges.map((badge, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl ${
                  badge.unlocked 
                    ? 'bg-gold/20 border border-gold/30' 
                    : 'bg-muted/50 opacity-40'
                }`}
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
          </div>
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
