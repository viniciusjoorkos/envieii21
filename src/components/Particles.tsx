import React, { useEffect, useRef } from 'react';

interface ParticlesProps {
  type?: 'thor' | 'matrix';
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  text?: string; // Making text optional for TypeScript
}

const Particles: React.FC<ParticlesProps> = ({ type = 'thor' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particleCount = type === 'matrix' ? 100 : 75;
    const baseColor = type === 'matrix' ? '#00FF41' : '#64B5F6';
    const particles: Particle[] = [];
    let animationFrameId: number;
    
    const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = type === 'matrix' ? 0 : Math.random() * 2 + 0.5;
      
      // Color palette based on type
      let color;
      if (type === 'matrix') {
        color = baseColor;
      } else {
        // Thor-inspired electric palette
        const colors = [
          'rgba(100, 181, 246, 0.7)', // Light blue
          'rgba(30, 136, 229, 0.7)',  // Mid blue
          'rgba(156, 39, 176, 0.7)',  // Purple
          'rgba(255, 215, 0, 0.4)',   // Gold
          'rgba(255, 255, 255, 0.6)'  // White/lightning
        ];
        color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      const speedMultiplier = type === 'thor' ? 0.15 : 0.5; // Slower for Thor theme
      const speedX = type === 'matrix' ? 0 : (Math.random() - 0.5) * speedMultiplier;
      const speedY = type === 'matrix' ? (Math.random() * 3) + 1 : (Math.random() - 0.5) * speedMultiplier;
      
      const particle: Particle = { 
        x, 
        y, 
        radius, 
        color, 
        speedX, 
        speedY 
      };
      
      if (type === 'matrix') {
        particle.text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      }
      
      particles.push(particle);
    }
    
    // Lightning effect for Thor theme
    const createLightning = () => {
      if (type !== 'thor') return;
      
      const startX = Math.random() * canvas.width;
      const segments = Math.floor(Math.random() * 5) + 3;
      const width = 2;
      
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      
      let x = startX;
      const segmentHeight = canvas.height / segments;
      
      for (let i = 0; i < segments; i++) {
        const newX = x + (Math.random() - 0.5) * 100;
        const newY = segmentHeight * (i + 1);
        ctx.lineTo(newX, newY);
        x = newX;
      }
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = width;
      ctx.stroke();
      
      // Fade out
      setTimeout(() => {
        ctx.globalAlpha = 0.5;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }, 100);
    };
    
    if (type === 'thor') {
      // Randomly create lightning
      setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
          createLightning();
        }
      }, 3000);
    }
    
    // Animation loop
    const animate = () => {
      // Clear with slight opacity for trail effect in Thor mode
      if (type === 'thor') {
        ctx.fillStyle = 'rgba(31, 41, 55, 0.1)'; // bg-gray-800 with trail
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw and update particles
      particles.forEach(particle => {
        if (type === 'matrix') {
          // Draw matrix code character
          ctx.font = '14px monospace';
          ctx.fillStyle = particle.color;
          if (particle.text) {
            ctx.fillText(particle.text, particle.x, particle.y);
          }
          
          // Change character occasionally
          if (Math.random() < 0.005) {
            particle.text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          }
          
          // Fade effect for some characters
          if (Math.random() < 0.1) {
            ctx.globalAlpha = Math.random();
          } else {
            ctx.globalAlpha = 1;
          }
        } else {
          // Draw Thor-inspired particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          
          // Add glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = particle.color;
        }
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Reset position if particle goes off screen
        if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [type]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default Particles;
