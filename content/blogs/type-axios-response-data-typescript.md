# How to Type Axios Response Data in TypeScript (Generic Pattern)

I'll be honest  the number of codebases I've seen where every single Axios call returns `any` is staggering. And I don't blame people. When you first try to type Axios response data in TypeScript, the generics feel weird, the interceptors add another layer of confusion, and before you know it you've slapped `as any` on the response just to get the build passing.

But here's the trick nobody tells you upfront: Axios already supports generics natively. You just need to know where to put them. Once that clicks, typing your entire API layer becomes almost trivial.

Let me walk you through the pattern I use on every project  from basic generic calls to a fully typed API client wrapper that your whole team can use.

## The Problem: Axios Returns `any` by Default

When you write a basic Axios call without type annotations, here's what TypeScript infers:

```typescript
import axios from 'axios';

const response = await axios.get('/api/users');
// response.data is `any`  no type safety at all
console.log(response.data.whatever); // no error, no autocomplete
```

TypeScript doesn't complain. Your IDE gives you zero autocomplete on `response.data`. You could access `response.data.unicorn` and the compiler wouldn't blink. That defeats the entire point of using TypeScript.

The fix is simpler than most people expect.

## The Generic Pattern: `axios.get<T>()`

Every Axios method  `get`, `post`, `put`, `delete`, `patch`  accepts a generic type parameter that types the `data` property of the response:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Now response.data is typed as User[]
const response = await axios.get<User[]>('/api/users');

response.data.forEach(user => {
  console.log(user.name);  // autocomplete works
  console.log(user.age);   // Error: Property 'age' does not exist
});
```

That's it. One generic parameter and your response data is fully typed. The same pattern works for POST requests where you're sending and receiving data:

```typescript
interface CreateUserPayload {
  name: string;
  email: string;
}

interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const response = await axios.post<CreateUserResponse>(
  '/api/users',
  { name: 'Alice', email: 'alice@example.com' } // payload
);

// response.data is CreateUserResponse
console.log(response.data.id); // typed correctly
```

> **Tip:** The generic on `axios.post<T>()` types the *response* data, not the request body. The request body type is inferred from what you pass as the second argument. If you want to type the body explicitly too, you can use the longer form  more on that below.

## AxiosResponse vs AxiosError: Know the Difference

One thing that trips people up is the distinction between `AxiosResponse` and `AxiosError` generics. Both accept type parameters, but they serve very different purposes:

```typescript
import axios, { AxiosResponse, AxiosError } from 'axios';

// AxiosResponse<T>  the successful response wrapper
type SuccessResponse = AxiosResponse<User[]>;
// SuccessResponse.data is User[]

// AxiosError<T>  T is the shape of the ERROR response body
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

try {
  const response = await axios.get<User[]>('/api/users');
  // response.data: User[]
} catch (error) {
  if (axios.isAxiosError<ApiError>(error)) {
    // error.response?.data is ApiError
    console.log(error.response?.data.message);
    console.log(error.response?.data.code);
  }
}
```

| Type | Generic `T` Represents | Common Use |
|------|----------------------|------------|
| `AxiosResponse<T>` | Shape of `response.data` | Typing successful responses |
| `AxiosError<T>` | Shape of `error.response.data` | Typing error responses from API |
| `axios.get<T>()` | Same as `AxiosResponse<T>` | Inline response typing |

The `isAxiosError` type guard is genuinely useful here  it narrows the catch block so TypeScript knows you're dealing with an Axios error specifically, not just a random thrown value.

## Typing Interceptors Without Losing Type Safety

Interceptors are where most people's type safety falls apart. You add a response interceptor to unwrap `response.data` automatically, and suddenly everything is `any` again.

Here's the pattern I've settled on after trying about five different approaches:

```typescript
// Create an instance with a response interceptor
const api = axios.create({
  baseURL: 'https://api.example.com',
});

// Unwrap response.data in the interceptor
api.interceptors.response.use(
  (response) => response.data, // return just the data
  (error) => Promise.reject(error)
);

// The problem: TypeScript still thinks .data exists
// Solution: override the return types

// Create a typed wrapper that reflects the interceptor behavior
export async function apiGet<T>(url: string): Promise<T> {
  const data = await api.get<T, T>(url);
  return data;
}

export async function apiPost<TResponse, TBody = unknown>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const data = await api.post<TResponse, TResponse>(url, body);
  return data;
}
```

The key insight is that `axios.get<T, R>()` has a *second* generic parameter `R` that controls the actual return type. When your interceptor unwraps the response, you set both to `T` so the return type matches what you actually get back.

## Building a Typed API Client Wrapper

Here's the full pattern I use in production. It combines everything above into a single reusable module:

```typescript
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';

interface ApiError {
  message: string;
  code: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiError>) => {
        // Centralized error handling
        const message = error.response?.data?.message
          ?? 'An unexpected error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get<T, T>(url, config);
  }

  async post<T, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client.post<T, T>(url, body, config);
  }

  async put<T, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client.put<T, T>(url, body, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete<T, T>(url, config);
  }
}

// Usage
const api = new ApiClient('https://api.example.com');

// Fully typed  no 'any' anywhere
const users = await api.get<User[]>('/users');
const newUser = await api.post<User, CreateUserPayload>(
  '/users',
  { name: 'Bob', email: 'bob@example.com' }
);
```

This gives you one place to handle auth headers, error formatting, and base URL config  and every call through it is fully typed. No `any` in sight.

If you're migrating an existing JavaScript API layer to TypeScript and want to generate proper interfaces from your response shapes, [SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) can help  paste your untyped Axios calls and it'll infer the types for you instead of just slapping `any` everywhere.

```mermaid
graph LR
    A[API Call] --> B["axios.get&lt;User[]&gt;()"]
    B --> C[AxiosResponse&lt;User[]&gt;]
    C --> D{Interceptor?}
    D -->|Yes| E["Unwrap → User[]"]
    D -->|No| F["response.data → User[]"]
    E --> G[Typed Result]
    F --> G
```

## Quick Reference: The Patterns You Actually Need

Here's the cheat sheet. Save this somewhere:

```typescript
// 1. Basic typed GET
const { data } = await axios.get<User[]>('/users');

// 2. Typed POST (response type, body inferred)
const { data } = await axios.post<User>('/users', payload);

// 3. Typed error handling
catch (err) {
  if (axios.isAxiosError<ApiError>(err)) { ... }
}

// 4. Interceptor-safe wrapper
api.get<T, T>(url); // second generic = actual return type

// 5. Full client class (see above)
```

The generic system in Axios isn't complicated  it's just poorly documented. Once you've set up the pattern once, every API call in your project gets full type safety for maybe 10 extra characters of code.

If you're working on a broader [JavaScript to TypeScript migration](/blog/convert-javascript-to-typescript) and want to understand generics more deeply, check out our [TypeScript generics guide](/blog/typescript-generics-explained). And if you keep running into type errors you can't explain, our [common TypeScript mistakes](/blog/common-typescript-mistakes) post covers the usual suspects.

Stop using `any` on your API responses. Your future self debugging a production issue at midnight will thank you.
