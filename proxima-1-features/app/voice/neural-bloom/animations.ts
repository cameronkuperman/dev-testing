export const springConfig = {
  stiffness: 120,
  damping: 14,
  mass: 1
};

export const growthTiming = {
  duration: 800,
  ease: [0.22, 1, 0.36, 1]
};

export const shrinkTiming = {
  duration: 600,
  ease: [0.36, 0, 0.66, -0.56]
};

export const pulseAnimation = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export const rotationAnimation = {
  idle: {
    rotate: 360,
    transition: {
      duration: 240,
      repeat: Infinity,
      ease: "linear"
    }
  },
  listening: {
    rotate: 360,
    transition: {
      duration: 60,
      repeat: Infinity,
      ease: "linear"
    }
  },
  speaking: {
    rotate: 0,
    transition: {
      duration: 0.5
    }
  },
  thinking: {
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};