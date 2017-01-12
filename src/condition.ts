export class Condition {

  constructor(
    public readonly sql: string,
    public readonly bindings: any[],
  ) {

  }

  not() {
    return new Condition(
      `NOT (${this.sql})`,
      this.bindings,
    );
  }

  and(condition: Condition) {
    return new Condition(
      `${this.sql} AND (${condition.sql})`,
      this.bindings.concat(condition.bindings),
    );
  }

  or(condition: Condition) {
    return new Condition(
      `${this.sql} OR (${condition.sql})`,
      this.bindings.concat(condition.bindings),
    );
  }

}