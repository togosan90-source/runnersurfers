import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Zap, Trophy, TrendingUp, Users, Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import sprintShoe from '@/assets/sprint-shoe.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax scroll transforms
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Different parallax speeds for different layers
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const orb1Y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const orb2Y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const orb3Y = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const heroY = useTransform(scrollYProgress, [0, 0.5], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);
  const featuresY = useTransform(scrollYProgress, [0.2, 0.8], ['50px', '-50px']);

  // Redirect to run if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/run');
    }
  }, [user, loading, navigate]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen overflow-x-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #0a0a14 0%, #0f1629 50%, #0a0a14 100%)',
      }}
    >
      {/* Animated grid background with parallax */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          y: gridY,
        }}
      />

      {/* Glowing orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ 
            background: 'rgba(0, 255, 136, 0.15)',
            y: orb1Y,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]"
          style={{ 
            background: 'rgba(34, 211, 238, 0.15)',
            y: orb2Y,
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-[80px]"
          style={{ 
            background: 'rgba(168, 85, 247, 0.1)',
            y: orb3Y,
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Hero Section with parallax */}
      <motion.div 
        className="relative"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
          {/* Logo with cyberpunk hexagon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-8"
          >
            <div className="relative inline-block mb-8">
              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-4 opacity-60 blur-xl"
                style={{ background: 'linear-gradient(135deg, #00ff88, #22d3ee, #a855f7)' }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Hexagonal container */}
              <div 
                className="relative w-28 h-28 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(34, 211, 238, 0.2) 100%)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  border: '2px solid rgba(0, 255, 136, 0.5)',
                }}
              >
                <motion.img 
                  src={sprintShoe}
                  alt="Running shoe"
                  className="w-16 h-16 object-contain"
                  animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }}
                />
              </div>
              
              {/* Corner decorations */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400" />
            </div>

            {/* Title with neon effect */}
            <h1 className="font-mono text-4xl md:text-6xl font-black tracking-tight mb-4">
              <span 
                style={{ 
                  color: '#ffffff',
                  textShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}
              >
                RUNNER
              </span>
              <span 
                className="block md:inline"
                style={{ 
                  color: '#00ff88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.2)'
                }}
              >
                {" "}LEGENDS
              </span>
            </h1>
            
            {/* Subtitle with scan line */}
            <div 
              className="inline-flex items-center gap-3 px-6 py-2 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
                clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
              }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.1), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(0, 255, 136, 0.8)' }} />
              <p 
                className="font-mono text-lg md:text-xl tracking-wider"
                style={{ color: '#00ff88', textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}
              >
                "Corri. Livella. Conquista."
              </p>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(0, 255, 136, 0.8)' }} />
            </div>
          </motion.div>

          {/* CTA Button - Cyberpunk style */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12"
          >
            <motion.button
              onClick={() => navigate('/run')}
              className="group relative px-12 py-6 font-mono font-bold text-xl uppercase tracking-wider overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                border: '2px solid #00ff88',
                color: '#00ff88',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Scan line effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(0,255,136,0.2), transparent)', height: '200%' }}
                animate={{ y: ['-100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400" />
              
              <span className="relative z-10 flex items-center gap-3">
                <Play className="w-6 h-6" />
                🚀 INIZIA A CORRERE
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              
              {/* Glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: 'inset 0 0 30px rgba(0, 255, 136, 0.3)' }}
              />
            </motion.button>
          </motion.div>

          {/* Auth links - Cyberpunk style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6"
          >
            <motion.button 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-4 py-2 font-mono text-sm uppercase tracking-wider"
              style={{
                color: '#22d3ee',
                textShadow: '0 0 8px rgba(34, 211, 238, 0.5)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px rgba(34, 211, 238, 0.8)' }} />
              👤 Crea Account
            </motion.button>
            
            <div className="w-px h-6" style={{ background: 'linear-gradient(180deg, transparent, #22d3ee, transparent)' }} />
            
            <motion.button 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-4 py-2 font-mono text-sm uppercase tracking-wider"
              style={{
                color: '#22d3ee',
                textShadow: '0 0 8px rgba(34, 211, 238, 0.5)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              🔐 Login
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px rgba(34, 211, 238, 0.8)' }} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section with parallax */}
      <motion.div 
        className="max-w-5xl mx-auto px-4 pb-24 relative z-10"
        style={{ y: featuresY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 
            className="font-mono text-2xl md:text-3xl font-bold tracking-wider uppercase"
            style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
          >
            Trasforma ogni corsa in un'
            <span style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0, 255, 136, 0.6)' }}>avventura</span>
          </h2>
          <div className="w-32 h-1 mx-auto mt-4" style={{ background: 'linear-gradient(90deg, transparent, #00ff88, transparent)' }} />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              title: 'Sistema Livelli',
              description: '600 livelli da conquistare. Ogni corsa ti avvicina alla leggenda.',
              color: '#00ff88',
            },
            {
              icon: Zap,
              title: 'Score Dinamico',
              description: 'Punti che salgono in tempo reale. Più corri, più guadagni!',
              color: '#22d3ee',
            },
            {
              icon: Trophy,
              title: 'Classifiche Globali',
              description: 'Sfida i runner di tutto il mondo. Top 300 mensile.',
              color: '#fbbf24',
            },
            {
              icon: Target,
              title: 'Obiettivi Giornalieri',
              description: 'Completa sfide quotidiane e guadagna ricompense bonus.',
              color: '#f43f5e',
            },
            {
              icon: Users,
              title: 'Sistema Tier',
              description: 'Da Iron a Grand Master. Scala le leghe con il tuo livello.',
              color: '#a855f7',
            },
            {
              icon: Zap,
              title: 'Boost & Shop',
              description: '20 boost temporanei e equipaggiamento permanente.',
              color: '#06b6d4',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-5 overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.9) 0%, rgba(10, 10, 20, 0.95) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
            >
              {/* Scan line effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(180deg, transparent, ${feature.color}10, transparent)`, height: '200%' }}
                animate={{ y: ['-100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-3 h-3 border-l border-t" style={{ borderColor: `${feature.color}60` }} />
              <div className="absolute top-0 right-3 w-3 h-3 border-r border-t" style={{ borderColor: `${feature.color}60` }} />
              <div className="absolute bottom-0 left-3 w-3 h-3 border-l border-b" style={{ borderColor: `${feature.color}60` }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b" style={{ borderColor: `${feature.color}60` }} />
              
              {/* Border glow */}
              <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${feature.color}40, transparent)` }} />
              <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${feature.color}40, transparent)` }} />
              
              <div className="relative z-10">
                {/* Hexagonal icon */}
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}30 0%, ${feature.color}10 100%)`,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    border: `1px solid ${feature.color}50`,
                  }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color, filter: `drop-shadow(0 0 6px ${feature.color})` }} />
                </div>
                
                <h3 
                  className="font-mono font-bold text-lg mb-2 uppercase tracking-wider"
                  style={{ color: feature.color, textShadow: `0 0 10px ${feature.color}50` }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 font-mono">{feature.description}</p>
              </div>
              
              {/* Status LED */}
              <div 
                className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
                style={{ background: feature.color, boxShadow: `0 0 8px ${feature.color}` }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer CTA - Cyberpunk style */}
      <div 
        className="relative py-16 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 255, 136, 0.05) 0%, rgba(10, 10, 20, 0.95) 100%)',
        }}
      >
        {/* Top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00ff88, transparent)' }} />
        
        <div className="max-w-2xl mx-auto text-center px-4 relative z-10">
          <motion.h2 
            className="font-mono text-2xl md:text-3xl font-bold mb-4 uppercase tracking-wider"
            style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Pronto a diventare una{' '}
            <span style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0, 255, 136, 0.6)' }}>leggenda</span>?
          </motion.h2>
          
          <motion.p 
            className="text-gray-400 font-mono mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Unisciti a migliaia di runner e inizia la tua avventura oggi.
          </motion.p>
          
          <motion.button
            onClick={() => navigate('/run')}
            className="group relative px-10 py-5 font-mono font-bold text-lg uppercase tracking-wider overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #22d3ee 100%)',
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
              color: '#0a0a14',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <span className="relative z-10 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Inizia Ora - È Gratis!
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
