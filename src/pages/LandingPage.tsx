import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to run if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/run');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mb-6 animate-float">
              <span className="text-5xl">🏃‍♂️</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black text-foreground tracking-tight mb-4">
              RUNNER
              <span className="text-gradient-primary"> LEGENDS</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              "Corri. Livella. Conquista."
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12"
          >
            <Button
              size="lg"
              onClick={() => navigate('/run')}
              className="group relative text-xl px-12 py-8 rounded-2xl font-display font-bold bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-all glow-accent animate-pulse-glow"
            >
              <span className="flex items-center gap-3">
                <Play className="w-8 h-8 group-hover:scale-110 transition-transform" />
                🚀 INIZIA A CORRERE
              </span>
            </Button>
          </motion.div>

          {/* Auth links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            <button 
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              👤 Crea Account
            </button>
            <span>|</span>
            <button 
              onClick={() => navigate('/auth')}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              🔐 Login
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-3xl font-bold text-center mb-12"
        >
          Trasforma ogni corsa in un'avventura
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: TrendingUp,
              title: 'Sistema Livelli',
              description: '600 livelli da conquistare. Ogni corsa ti avvicina alla leggenda.',
              color: 'from-primary to-primary/60',
            },
            {
              icon: Zap,
              title: 'Score Dinamico',
              description: 'Punti che salgono in tempo reale. Più corri, più guadagni!',
              color: 'from-accent to-accent/60',
            },
            {
              icon: Trophy,
              title: 'Classifiche Globali',
              description: 'Sfida i runner di tutto il mondo. Top 300 mensile.',
              color: 'from-gold to-warning',
            },
            {
              icon: Target,
              title: 'Obiettivi Giornalieri',
              description: 'Completa sfide quotidiane e guadagna ricompense bonus.',
              color: 'from-destructive to-destructive/60',
            },
            {
              icon: Users,
              title: 'Sistema Tier',
              description: 'Da Iron a Grand Master. Scala le leghe con il tuo livello.',
              color: 'from-tier-platinum to-tier-diamond',
            },
            {
              icon: Zap,
              title: 'Boost & Shop',
              description: '20 boost temporanei e equipaggiamento permanente.',
              color: 'from-tier-emerald to-tier-sapphire',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-secondary to-secondary/80 py-16">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="font-display text-3xl font-bold text-secondary-foreground mb-4">
            Pronto a diventare una leggenda?
          </h2>
          <p className="text-secondary-foreground/80 mb-8">
            Unisciti a migliaia di runner e inizia la tua avventura oggi.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/run')}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-display font-bold px-8 py-6 text-lg rounded-xl"
          >
            <Play className="w-5 h-5 mr-2" />
            Inizia Ora - È Gratis!
          </Button>
        </div>
      </div>
    </div>
  );
}
