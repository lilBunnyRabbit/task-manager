/**
 * Event emitter class that can emit and listen to typed events.
 *
 * @template TEvents - Object type representing the event types with associated data types.
 */
export class EventEmitter<TEvents extends Record<string, unknown>> {
  private _events: Partial<{
    [TType in keyof TEvents]: Array<EventEmitter.Listener<TEvents, TEvents[TType], this>>;
  }> = {};

  /**
   * Registers event listener for a specific event type.
   *
   * @template TType - Event type.
   * @param type - The event type to listen for.
   * @param listener - Event listener function to register.
   * @returns - EventEmitter instance, for method chaining.
   */
  public on<TType extends keyof TEvents>(
    type: TType,
    listener: EventEmitter.Listener<TEvents, TEvents[TType], this>
  ): this {
    if (!(type in this._events)) {
      this._events[type] = [];
    }

    this._events[type]!.push(listener);

    return this;
  }

  /**
   * Removes a registered event listener for a specific event type.
   *
   * @template TType - Event type.
   * @param type - The event type to remove the listener from.
   * @param listener - Event listener function to remove.
   * @return - EventEmitter instance, for method chaining.
   */
  public off<TType extends keyof TEvents>(
    type: TType,
    listener: EventEmitter.Listener<TEvents, TEvents[TType], this>
  ): this {
    if (this._events[type] !== undefined) {
      this._events[type] = this._events[type]!.filter((savedListener) => savedListener !== listener);
    }

    return this;
  }

  /**
   * Emits an event of a specific type, calling all registered listeners for that event type.
   *
   * @template TType - Event type.
   * @param type - The event type to emit.
   * @param data - Data associated with the event.
   * @return - EventEmitter instance, for method chaining.
   */
  public emit<TType extends keyof TEvents>(
    type: TType,
    ...data: TEvents[TType] extends void ? [] : [data: TEvents[TType]]
  ): this {
    this._events[type]?.forEach((listener) => listener.apply(this, data));

    return this;
  }
}

export namespace EventEmitter {
  /**
   * Event listener function.
   * The listener function's context (`this`) is bound to the EventEmitter instance.
   *
   * @template TEvents - Object type representing the event types with associated data types.
   * @template TData - Data type that the event listener will receive.
   * @template TEmitter - Type of the EventEmitter instance.
   */
  export type Listener<
    TEvents extends Record<string | number | symbol, unknown>,
    TData,
    TEmitter extends EventEmitter<TEvents>
  > = (this: TEmitter, ...data: TData extends void ? [] : [data: TData]) => void | Promise<void>;
}
