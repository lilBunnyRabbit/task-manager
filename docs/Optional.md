# [TypeScript](https://www.typescriptlang.org/) implementation of [`java.util.Optional<T>`](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html)

> **Definition**
> A container object which may or may not contain a non-null value. If a value is present, isPresent() will return true and get() will return the value.
> Additional methods that depend on the presence or absence of a contained value are provided, such as orElse() (return a default value if value not present) and ifPresent() (execute a block of code if the value is present).
> 
> This is a value-based class; use of identity-sensitive operations (including reference equality (==), identity hash code, or synchronization) on instances of Optional may have unpredictable results and should be avoided.

The main difference is that it doesn't throw errors if the value is not defined and simply just returns `null`.
  
## API
  
### `public static <T> Optional<T> of(T value)`

```ts
const optional: Optional<number> = Optional(123);
```

```ts
const optionalString: Optional<string> = Optional("123" as string | undefined | null);
const optionalNull: Optional.Empty = Optional(null);
const optionalUndefined: Optional.Empty = Optional(undefined);
```

### `public T get()`

```ts
const value: number | null = optional.get();
```

### `public boolean isPresent()`

```ts
if (optional.isPresent()) {
  const copy: Optional.Present<number> = optional;
  const value: number = optional.get();
} else {
  const copy: Optional.Empty = optional;
  const value: null = optional.get();
}
```

### Opposite of `public boolean isPresent()`

```ts
if (optional.isEmpty()) {
  const copy: Optional.Empty = optional;
  const value: null = optional.get();
} else {
  const copy: Optional.Present<number> = optional;
  const value: number = optional.get();
}
```

### `public void ifPresent(Consumer<? super T> consumer)`

```ts
optional.ifPresent((value) => console.log("Present:", value));
```

### Opposite of `public void ifPresent(Consumer<? super T> consumer)`

```ts
optional.ifEmpty(() => console.log("Empty"));
```

### `public Optional<T> filter(Predicate<? super T> predicate)`

```ts
const filtered: Optional<number> = optional.filter((value) => value > 3);
```

### `public <U> Optional<U> map(Function<? super T,? extends U> mapper)`

```ts
const mapped: Optional<string> = optional.map((value) => String(value));
```

### `public <U> Optional<U> flatMap(Function<? super T,Optional<U>> mapper)`

```ts
const flatMapped: Optional<string> = optional.flatMap((value) => Optional(String(value)));
```

### `public T orElse(T other)`

```ts
const orElse: number = optional.orElse(123);
```

### `public T orElseGet(Supplier<? extends T> other)`

```ts
const orElseGet: number = optional.orElseGet(() => 123);
```

### `public <X extends Throwable> T orElseThrow(Supplier<? extends X> exceptionSupplier) throws X extends Throwable`

```ts
try {
  const value: number = optional.orElseThrow(() => new Error("Value not present"));
} catch (error) {
  console.error(error);
}
```