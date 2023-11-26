# [TypeScript](https://www.typescriptlang.org/) Event Handling

The [`EventEmitter`](#eventemitter) class provides a powerful and flexible mechanism for managing and handling custom events, similar in functionality to the standard [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget) interface found in web APIs. This class allows for easy creation of event-driven architectures in [TypeScript](https://www.typescriptlang.org/) applications, enabling objects to publish events to which other parts of the application can subscribe. It's particularly beneficial in scenarios where you need to implement custom event logic or when working outside of environments where [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget) is not available or suitable. With [`EventEmitter`](#eventemitter), you can define event types, emit events, and dynamically attach or detach event listeners, all within a type-safe and intuitive API.

## Usage

### Creating an [`EventEmitter`](#eventemitter)

Start by creating an instance of the [`EventEmitter`](#eventemitter) class. You can define the types of events it will handle using a [TypeScript](https://www.typescriptlang.org/) interface.

```ts
import { EventEmitter } from "./EventEmitter";

interface MyEvents {
  data: string;
  loaded: void;
  error: Error;
}

const emitter = new EventEmitter<MyEvents>();
```

### Registering Event Listeners

To listen for events, use the [`on`](#ontype-listener-this) method. Define the event type and provide a callback function that will be executed when the event is emitted.

```ts
emitter.on("data", (data: string) => {
  console.log("Data", data);
});

emitter.on("loaded", function () {
  console.log(
    "Emitter loaded",
    this // EventEmitter<MyEvents>
  );
});

emitter.on("error", (error: Error) => {
  console.error(`Error: ${error.message}`);
});
```

### Removing Event Listeners

You can remove a specific event listener by using the [`off`](#offtype-listener-this) method, specifying the event type and the listener to remove.

```ts
const onError = (error: Error) => console.error(error);

emitter.on("error", onError);

// ...

emitter.off("error", onError);
```

### Emitting Events

Use the [`emit`](#emittype-data-this) method to trigger an event. This will invoke all registered listeners for that event type.

```ts
emitter.emit("data", "Sample data");
emitter.emit("loaded");
emitter.emit("error", new Error("Oh no!"));
```

### Extending EventEmitter

For more specialized use cases, you can extend the [`EventEmitter`](#eventemitter) class. This allows you to create a custom event emitter with additional methods or properties tailored to specific needs. When extending, you can still take full advantage of the type safety and event handling features of the base class.

```ts
import { EventEmitter } from './EventEmitter';

interface MyServiceEvents {
  dataLoaded: string;
  error: Error;
}

// Extending the EventEmitter class
class MyService extends EventEmitter<MyServiceEvents> {
  // Custom method
  loadData() {
    try {
      // Load data and emit a `dataLoaded` event
      const data = "Sample Data";
      this.emit("dataLoaded", data);
    } catch (error) {
      // Emit an `error` event
      this.emit("error", error);
    }
  }
}

const service = new MyService();

service.on("dataLoaded", function (data) {
  console.log(
    `Data loaded: ${data}`,
    this // MyService
  );
});

service.on("error", (error) => console.error(`Error: ${error.message}`));

// Using the custom method
myEmitter.loadData();
```

In this example, `MyService` extends the [`EventEmitter`](#eventemitter) class, adding a custom method `loadData`. This method demonstrates how to [`emit`](#emittype-data-this) `dataLoaded` and `error` events, integrating the event-emitting functionality into a more complex operation.

## API

### `EventEmitter`

#### `on(type, listener): this`

Registers an event listener for a specific event type. The [`on`](#ontype-listener-this) method allows you to define the event type and provide a callback function that will be executed when the event is emitted.

#### `off(type, listener): this`

Removes a registered event listener for a specific event type. The [`off`](#offtype-listener-this) method is used to specify the event type and the listener to remove. This is useful for cleaning up listeners when they are no longer needed or when an object is being disposed of.

#### `emit(type, [data]): this`

> **Note**   
> For cases where [`EventEmitter`](#eventemitter) is used as a base class and you wish to prevent external invocation of the [`emit`](#emittype-data-this) method, set it to `protected`. This allows subclasses to emit events while preventing access from outside the class hierarchy.

Emits an event of a specific type, calling all registered listeners for that event type. The [`emit`](#emittype-data-this) method is used to trigger the event and optionally pass data to the event listeners. It's a crucial part of the event-driven architecture, enabling dynamic and responsive applications.

## Conclusion

The custom [`EventEmitter`](#eventemitter) class in [TypeScript](https://www.typescriptlang.org/) provides a flexible and type-safe foundation for event-driven programming. By extending this class, you can create tailored solutions that fit the unique requirements of your application, while maintaining clean and maintainable code.