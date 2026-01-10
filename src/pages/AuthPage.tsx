import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock, Download, ChevronRight } from 'lucide-react';
import { z } from 'zod';
import sprintShoe from '@/assets/sprint-shoe.png';

const emailSchema = z.string().email('Email non valida');
const passwordSchema = z.string().min(6, 'Password deve avere almeno 6 caratteri');
const usernameSchema = z.string().min(3, 'Username deve avere almeno 3 caratteri');

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, loading: authLoading } = useAuth();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/run');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Errore',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      let message = 'Errore durante il login';
      if (error.message.includes('Invalid login')) {
        message = 'Email o password non corretti';
      }
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Benvenuto!',
        description: 'Login effettuato con successo'
      });
      navigate('/run');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      usernameSchema.parse(signupUsername);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Errore',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupUsername);
    setIsLoading(false);

    if (error) {
      let message = 'Errore durante la registrazione';
      if (error.message.includes('already registered')) {
        message = 'Questa email è già registrata';
      }
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Account creato!',
        description: 'Registrazione completata con successo'
      });
      navigate('/run');
    }
  };

  if (authLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #0f1629 50%, #0a0a14 100%)' }}
      >
        <div className="relative">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 blur-md bg-cyan-400/30 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #0f1629 50%, #0a0a14 100%)' }}
    >
      {/* Animated grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Static background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px]"
          style={{ background: 'rgba(0, 255, 136, 0.15)', opacity: 0.4 }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-[80px]"
          style={{ background: 'rgba(34, 211, 238, 0.15)', opacity: 0.3 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative inline-block mb-6"
          >
            {/* Outer glow */}
            <motion.div
              className="absolute -inset-4 opacity-60 blur-xl"
              style={{ background: 'linear-gradient(135deg, #00ff88, #22d3ee)' }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Hexagonal container */}
            <div 
              className="relative w-24 h-24 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(34, 211, 238, 0.2) 100%)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            >
              <motion.img 
                src={sprintShoe}
                alt="Running shoe"
                className="w-14 h-14 object-contain"
                animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }}
              />
            </div>
            
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400" />
            <div className="absolute -top-2 -right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400" />
            <div className="absolute -bottom-2 -right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400" />
          </motion.div>
          
          <h1 className="font-mono text-3xl font-black tracking-tight mb-2">
            <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>RUNNER</span>
            <span style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0, 255, 136, 0.8)' }}> LEGENDS</span>
          </h1>
          
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
              clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(0, 255, 136, 0.8)' }} />
            <p className="font-mono text-sm" style={{ color: '#00ff88', textShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }}>
              Corri. Livella. Conquista.
            </p>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(0, 255, 136, 0.8)' }} />
          </div>
        </div>

        {/* Auth Card - Cyberpunk Style */}
        <div 
          className="relative p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%)',
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
          }}
        >
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/60" />
          <div className="absolute top-0 right-4 w-4 h-4 border-r-2 border-t-2 border-cyan-500/60" />
          <div className="absolute bottom-0 left-4 w-4 h-4 border-l-2 border-b-2 border-cyan-500/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/60" />
          
          {/* Border glow */}
          <div className="absolute top-0 left-5 right-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.5), transparent)' }} />
          <div className="absolute bottom-0 left-5 right-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.5), transparent)' }} />
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 
                className="font-mono text-xl font-bold uppercase tracking-wider mb-1"
                style={{ color: '#22d3ee', textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}
              >
                Accedi al Sistema
              </h2>
              <p className="font-mono text-xs text-gray-400">
                Inizia la tua avventura da runner
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList 
                className="grid w-full grid-cols-2 mb-6 p-1"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                }}
              >
                <TabsTrigger 
                  value="login"
                  className="font-mono text-sm uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-cyan-400"
                >
                  Accedi
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="font-mono text-sm uppercase tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-green-400"
                >
                  Registrati
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-mono text-xs uppercase tracking-wider text-cyan-400">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="runner@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 font-mono bg-black/30 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-mono text-xs uppercase tracking-wider text-cyan-400">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 font-mono bg-black/30 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 font-mono font-bold uppercase tracking-wider relative overflow-hidden disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)',
                      clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                      border: '1px solid #22d3ee',
                      color: '#22d3ee',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.2), transparent)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Accedi
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="font-mono text-xs uppercase tracking-wider text-green-400">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="RunnerChampion"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        className="pl-10 font-mono bg-black/30 border-green-500/30 text-white placeholder:text-gray-500 focus:border-green-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-mono text-xs uppercase tracking-wider text-green-400">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="runner@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10 font-mono bg-black/30 border-green-500/30 text-white placeholder:text-gray-500 focus:border-green-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-mono text-xs uppercase tracking-wider text-green-400">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 font-mono bg-black/30 border-green-500/30 text-white placeholder:text-gray-500 focus:border-green-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 font-mono font-bold uppercase tracking-wider relative overflow-hidden disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)',
                      clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                      border: '1px solid #00ff88',
                      color: '#00ff88',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.2), transparent)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Crea Account
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Install App Button - Cyberpunk Style */}
        {!isInstalled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <motion.button
              onClick={isInstallable ? install : () => navigate('/install')}
              className="w-full py-3 font-mono text-sm uppercase tracking-wider relative overflow-hidden flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: '#a855f7',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              Installa App
            </motion.button>
          </motion.div>
        )}

        {/* Footer */}
        <p className="text-center font-mono text-xs text-gray-500 mt-6">
          Creando un account accetti i nostri{' '}
          <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Termini</a>
          {' '}e{' '}
          <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy</a>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
