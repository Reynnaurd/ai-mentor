// ./apps/api/src/common/errors.ts
export class ProjectNotFoundError extends Error {
  constructor(public readonly id?: string) {
    super('PROJECT_NOT_FOUND');
    this.name = 'ProjectNotFoundError';
  }
}

export class StepNotFoundError extends Error {
  constructor(
    public readonly id?: string,
    public readonly projectId?: string,
  ) {
    super('STEP_NOT_FOUND');
    this.name = 'StepNotFoundError';
  }
}

/** When (projectId, order) must be unique */
export class DuplicateStepOrderError extends Error {
  constructor(
    public readonly projectId: string,
    public readonly order: number,
  ) {
    super('DUPLICATE_STEP_ORDER');
    this.name = 'DuplicateStepOrderError';
  }
}

export class InvalidReorderTargetError extends Error {
  constructor(
    public readonly projectId: string,
    public readonly stepId: string,
    public readonly order: number,
  ) {
    super('INVALID_REORDER_TARGET');
    this.name = 'InvalidReorderTargetError';
  }
}
