import React, { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse interactive tracking
    let mouse = { x: canvas.width / 2, y: canvas.height / 2, targetX: canvas.width / 2, targetY: canvas.height / 2 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    canvas.parentElement.addEventListener('mousemove', handleMouseMove);

    // Orbital 3D nodes representing Vividya pillars
    const nodes = [
      { label: "💬 AI Doubt Solver", sub: "English/Hinglish", color: "#6366F1", radius: 140, angle: 0, speed: 0.012, icon: "💬" },
      { label: "📄 Resume Audit", sub: "ATS Score 92/100", color: "#EC4899", radius: 170, angle: Math.PI * 0.5, speed: 0.009, icon: "🚀" },
      { label: "❤️ Mood Tracker", sub: "Stress Level: Low", color: "#FBBF24", radius: 130, angle: Math.PI, speed: 0.014, icon: "❤️" },
      { label: "⏰ Smart Timetable", sub: "3 Hrs Prep Today", color: "#8B5CF6", radius: 180, angle: Math.PI * 1.5, speed: 0.008, icon: "⏰" },
    ];

    // Background floating particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? '#8B5CF6' : '#6366F1'
    }));

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2 + (mouse.x - canvas.width / 2) * 0.08;
      const centerY = canvas.height / 2 + (mouse.y - canvas.height / 2) * 0.08;

      // Draw background ambient glow circles
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 240);
      glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
      glowGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');
      glowGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 240, 0, Math.PI * 2);
      ctx.fill();

      // Render floating stars/particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Draw central student 3D guide avatar representation
      const avatarYOffset = Math.sin(time * 2) * 12;

      // Glowing aura ring around student avatar
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(centerX, centerY + avatarYOffset, 70 + Math.sin(time * 3) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Central avatar core
      ctx.save();
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 25;
      
      const avatarGrad = ctx.createLinearGradient(centerX - 40, centerY - 40, centerX + 40, centerY + 40);
      avatarGrad.addColorStop(0, '#6366F1');
      avatarGrad.addColorStop(0.5, '#8B5CF6');
      avatarGrad.addColorStop(1, '#EC4899');

      ctx.fillStyle = avatarGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY + avatarYOffset, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Vividya Symbol / Lightbulb icon in core
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎓', centerX, centerY + avatarYOffset - 2);

      // Draw connector orbits and orbiting feature cards
      nodes.forEach((node, index) => {
        node.angle += node.speed;

        const nodeX = centerX + Math.cos(node.angle) * node.radius;
        const nodeY = centerY + Math.sin(node.angle) * (node.radius * 0.55) + avatarYOffset * 0.5;

        // Draw dotted connection line to central guide
        ctx.strokeStyle = `${node.color}44`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + avatarYOffset);
        ctx.lineTo(nodeX, nodeY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Render card background
        ctx.save();
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12;

        const cardWidth = 145;
        const cardHeight = 44;
        const cornerRadius = 12;

        ctx.fillStyle = '#1E293BE6';
        ctx.strokeStyle = `${node.color}AA`;
        ctx.lineWidth = 1.5;

        // Rounded rect
        ctx.beginPath();
        ctx.roundRect(nodeX - cardWidth / 2, nodeY - cardHeight / 2, cardWidth, cardHeight, cornerRadius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Card Text & Icon
        ctx.fillStyle = '#F1F5F9';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${node.icon} ${node.label.split(' ')[1]} ${node.label.split(' ')[2] || ''}`, nodeX - cardWidth / 2 + 10, nodeY - 4);

        ctx.fillStyle = node.color;
        ctx.font = '500 10px Space Mono, monospace';
        ctx.fillText(node.sub, nodeX - cardWidth / 2 + 10, nodeY + 11);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] lg:h-[540px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-darkSurface/80 border border-white/10 text-[11px] font-mono text-sarthiMuted backdrop-blur flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-sarthiPink animate-ping"></span>
        Interactive 3D Engine • Move cursor to orbit
      </div>
    </div>
  );
}
