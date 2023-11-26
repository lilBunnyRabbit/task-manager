/**
 * TypeScript implementation of {@link https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html java.util.Optional<T>}.
 *
 * A container object which may or may not contain a non-null value.
 *
 * @template T - the type of the value
 */
class OptionalValue<T> {
  /**
   * Creates an instance of `OptionalValue`.
   * @param value - the type of the value
   */
  protected constructor(private value: T) {}

  /**
   * Returns true if there is a value present, otherwise false.
   */
  static isPresent<T>(value: T): value is NonNullable<T> {
    return value !== undefined && value !== null;
  }

  /**
   * Returns an empty `OptionalValue` instance. No value is present for this `OptionalValue`.
   */
  static empty(): Optional.Empty {
    return new OptionalValue(null);
  }

  /**
   * Returns an `OptionalValue` describing the specified value, if non-null,
   * otherwise returns an empty `OptionalValue`.
   *
   * @template T - the type of the value
   * @param value - the possibly-null value to describe
   */
  static of<T>(value: T): Optional<NonNullable<T>> {
    if (OptionalValue.isPresent(value)) {
      return new OptionalValue(value);
    }

    return OptionalValue.empty();
  }

  /**
   * Returns value held by this `OptionalValue`.
   */
  public get(): T {
    return this.value;
  }

  /**
   * Returns true if there is a value present, otherwise false.
   */
  public isPresent(): this is Optional.Present<T> {
    return OptionalValue.isPresent(this.value);
  }

  /**
   * If a value is present, invoke the specified consumer with the value, otherwise do nothing.
   *
   * @param consumer - callback to be executed if a value is present
   */
  public ifPresent(consumer: (value: NonNullable<T>) => void): this {
    if (this.isPresent()) {
      consumer(this.value);
    }

    return this;
  }

  /**
   * Returns true if there is a no value present, otherwise false.
   */
  public isEmpty(): this is Optional.Empty {
    return !OptionalValue.isPresent(this.value);
  }

  /**
   * If a value is not present, invoke the specified consumer, otherwise do nothing.
   *
   * @param consumer - callback to be executed if a value is not present
   */
  public ifEmpty(consumer: () => void): this {
    if (this.isEmpty()) {
      consumer();
    }

    return this;
  }

  /**
   * If a value is present, and the value matches the given predicate,
   * return an `OptionalValue` describing the value, otherwise return an empty `OptionalValue`.
   *
   * @template U - the type of the value
   * @param predicate - a predicate to apply to the value, if present
   */
  public filter<U>(this: Optional<U>, predicate: (value: NonNullable<U>) => boolean): Optional<U> {
    if (this.isEmpty()) {
      return this;
    }

    if (predicate(this.value)) {
      return this;
    }

    return OptionalValue.empty();
  }

  /**
   * If a value is present, apply the provided mapping function to it, and if the result is non-null,
   * return an `OptionalValue` describing the result. Otherwise return an empty `OptionalValue`.
   *
   * @template U - the type of the value
   * @template V - the type of the result of the mapping function
   * @param mapper - a mapping function to apply to the value, if present
   */
  public map<U, V>(this: Optional<U>, mapper: (value: NonNullable<U>) => V): Optional<V> {
    if (this.isEmpty()) {
      return this;
    }

    const mapped = mapper(this.value);
    if (OptionalValue.isPresent(mapped)) {
      return OptionalValue.of(mapped);
    }

    return OptionalValue.empty();
  }

  /**
   * If a value is present, apply the provided `OptionalValue`-bearing mapping function to it,
   * return that result, otherwise return an empty `OptionalValue`.
   * This method is similar to `map` method, but the provided mapper is one whose result is already an `OptionalValue`,
   * and if invoked, `flatMap` does not wrap it with an additional `OptionalValue`.
   *
   * @template U - the type of the value
   * @template V - the type parameter to the `OptionalValue` returned by
   * @param mapper - a mapping function to apply to the value, if present the mapping function
   */
  public flatMap<U, V>(this: Optional<U>, mapper: (value: NonNullable<U>) => Optional<V>): Optional<V> {
    if (this.isEmpty()) {
      return this;
    }

    return mapper(this.value);
  }

  /**
   * Returns the value if present, otherwise return other.
   *
   * @template U - the type of the value
   * @param other - the value to be returned if there is no value present
   */
  public orElse<U>(this: Optional<U>, other: NonNullable<U>): NonNullable<U> {
    if (this.isPresent()) {
      return this.value;
    }

    return other;
  }

  /**
   * Returns the value if present, otherwise invokes other and returns the result of that invocation.
   *
   * @template U - the type of the value
   * @param other - a callback whose result is returned if no value is present
   */
  public orElseGet<U>(this: Optional<U>, other: () => NonNullable<U>): NonNullable<U> {
    if (this.isPresent()) {
      return this.value;
    }

    return other();
  }

  /**
   * Returns the contained value, if present, otherwise throws an `Error` created by the provided supplier.
   *
   * @template E - type of the `Error` to be thrown
   * @param errorSupplier - the supplier which will return the `Error` to be thrown
   */
  public orElseThrow<E extends Error>(errorSupplier: () => E): NonNullable<T> {
    if (this.isPresent()) {
      return this.value;
    }

    throw errorSupplier();
  }
}

export namespace Optional {
  /**
   * Type of empty `OptionalValue` instance.
   */
  export type Empty = OptionalValue<null>;

  /**
   * Type of present `OptionalValue` instance.
   */
  export type Present<T> = OptionalValue<NonNullable<T>>;
}

/**
 * TypeScript implementation of {@link https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html java.util.Optional<T>}.
 *
 * A container object which may or may not contain a non-null value.
 *
 * @template T - the type of the value
 */
export type Optional<T> = Optional.Empty | Optional.Present<T>;

/**
 * Optional function definition.
 */
interface OptionalFunction {
  /**
   * Returns an `OptionalValue` describing the specified value, if non-null,
   * otherwise returns an empty `OptionalValue`.
   *
   * @template T - the type of the value
   * @param value - the possibly-null value to describe
   */
  <T>(value: T): Optional<NonNullable<T>>;

  /**
   * Returns an empty `OptionalValue` instance. No value is present for this `OptionalValue`.
   */
  empty(): Optional.Empty;
}

export const Optional = OptionalValue.of as OptionalFunction;

Optional.empty = OptionalValue.empty;
