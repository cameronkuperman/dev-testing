import { Branch, Point } from './types';

export class BranchGenerator {
  private centerX: number;
  private centerY: number;
  private baseRadius: number;

  constructor(centerX: number, centerY: number, baseRadius: number = 60) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.baseRadius = baseRadius;
  }

  generateBranches(amplitude: number, currentBranches: Map<string, Branch>): Map<string, Branch> {
    const branches = new Map<string, Branch>();
    
    // Level 1: Primary branches (always show if amplitude > 0.1)
    if (amplitude > 0.1) {
      const primaryAngles = [0, 60, 120, 180, 240, 300];
      primaryAngles.forEach((angle, index) => {
        const branch = this.createBranch(
          `primary-${index}`,
          1,
          angle,
          this.baseRadius + amplitude * 80,
          undefined
        );
        branches.set(branch.id, branch);
      });
    }

    // Level 2: Secondary branches (show if amplitude > 0.3)
    if (amplitude > 0.3) {
      branches.forEach((primaryBranch) => {
        if (primaryBranch.level === 1) {
          const leftBranch = this.createBranch(
            `${primaryBranch.id}-left`,
            2,
            primaryBranch.angle - 30,
            primaryBranch.length * 0.7,
            primaryBranch.id
          );
          const rightBranch = this.createBranch(
            `${primaryBranch.id}-right`,
            2,
            primaryBranch.angle + 30,
            primaryBranch.length * 0.7,
            primaryBranch.id
          );
          
          branches.set(leftBranch.id, leftBranch);
          branches.set(rightBranch.id, rightBranch);
          primaryBranch.children.push(leftBranch.id, rightBranch.id);
        }
      });
    }

    // Level 3: Tertiary branches (spawn randomly if amplitude > 0.6)
    if (amplitude > 0.6) {
      branches.forEach((secondaryBranch) => {
        if (secondaryBranch.level === 2 && Math.random() < amplitude - 0.5) {
          const tertiaryBranch = this.createBranch(
            `${secondaryBranch.id}-t${Date.now()}`,
            3,
            secondaryBranch.angle + (Math.random() - 0.5) * 60,
            secondaryBranch.length * 0.5,
            secondaryBranch.id
          );
          
          branches.set(tertiaryBranch.id, tertiaryBranch);
          secondaryBranch.children.push(tertiaryBranch.id);
        }
      });
    }

    // Calculate positions and control points
    this.calculateBranchPositions(branches);

    return branches;
  }

  private createBranch(
    id: string,
    level: number,
    angle: number,
    length: number,
    parent?: string
  ): Branch {
    return {
      id,
      level,
      angle: angle * Math.PI / 180, // Convert to radians
      length,
      parent,
      children: [],
      opacity: 1 - (level - 1) * 0.2,
      growthProgress: 0
    };
  }

  private calculateBranchPositions(branches: Map<string, Branch>) {
    branches.forEach((branch) => {
      if (!branch.parent) {
        // Primary branches start from center edge
        branch.startX = this.centerX + Math.cos(branch.angle) * this.baseRadius;
        branch.startY = this.centerY + Math.sin(branch.angle) * this.baseRadius;
      } else {
        // Child branches start from parent end
        const parent = branches.get(branch.parent);
        if (parent && parent.endX !== undefined && parent.endY !== undefined) {
          branch.startX = parent.endX;
          branch.startY = parent.endY;
        }
      }

      if (branch.startX !== undefined && branch.startY !== undefined) {
        // Calculate end point
        branch.endX = branch.startX + Math.cos(branch.angle) * branch.length;
        branch.endY = branch.startY + Math.sin(branch.angle) * branch.length;

        // Calculate control points for organic curves
        const controlOffset = branch.length * 0.3;
        branch.controlPoint1X = branch.startX + Math.cos(branch.angle - 0.26) * controlOffset; // 15 degrees
        branch.controlPoint1Y = branch.startY + Math.sin(branch.angle - 0.26) * controlOffset;
        branch.controlPoint2X = branch.endX - Math.cos(branch.angle + 0.26) * controlOffset;
        branch.controlPoint2Y = branch.endY - Math.sin(branch.angle + 0.26) * controlOffset;
      }
    });
  }

  applyGrowthAnimation(branches: Map<string, Branch>, targetGrowth: number, deltaTime: number) {
    branches.forEach((branch) => {
      const growthSpeed = 0.003 * deltaTime;
      if (branch.growthProgress < targetGrowth) {
        branch.growthProgress = Math.min(branch.growthProgress + growthSpeed, targetGrowth);
      } else if (branch.growthProgress > targetGrowth) {
        branch.growthProgress = Math.max(branch.growthProgress - growthSpeed, targetGrowth);
      }
    });
  }

  getInterpolatedPosition(branch: Branch, progress: number): Point {
    if (branch.startX === undefined || branch.startY === undefined ||
        branch.endX === undefined || branch.endY === undefined) {
      return { x: this.centerX, y: this.centerY };
    }

    const t = progress;
    const x = branch.startX + (branch.endX - branch.startX) * t;
    const y = branch.startY + (branch.endY - branch.startY) * t;

    return { x, y };
  }
}